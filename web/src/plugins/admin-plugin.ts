import type { Plugin } from 'vite'
import { readFileSync, writeFileSync, existsSync, mkdirSync, statSync, unlinkSync } from 'fs'
import { resolve, extname } from 'path'

const REPO_ROOT = resolve(__dirname, '..')
const DATA_DIR = resolve(REPO_ROOT, 'src', 'data')

function readJson(file: string) {
  const p = resolve(DATA_DIR, file)
  if (!existsSync(p)) return []
  return JSON.parse(readFileSync(p, 'utf-8'))
}

function writeJson(file: string, data: unknown) {
  const p = resolve(DATA_DIR, file)
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true })
  writeFileSync(p, JSON.stringify(data, null, 2), 'utf-8')
}

function ok(res: { setHeader: (k: string, v: string) => void; end: (s: string) => void }) {
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify({ ok: true }))
}

function err(res: { statusCode: number; end: (s: string) => void }, code: number, msg: string) {
  res.statusCode = code
  res.end(JSON.stringify({ message: msg }))
}

export function adminPlugin(): Plugin {
  return {
    name: 'admin-api',
    configureServer(server) {
      server.middlewares.use('/__admin/categories', (req, res) => {
        if (req.method === 'GET') {
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(readJson('categories.json')))
        } else if (req.method === 'PUT') {
          let body = ''
          req.on('data', (c: Buffer) => (body += c.toString()))
          req.on('end', () => { writeJson('categories.json', JSON.parse(body)); ok(res) })
        } else { res.statusCode = 405; res.end() }
      })

      server.middlewares.use('/__admin/files', (req, res) => {
        if (req.method === 'GET') {
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(readJson('files.json')))
        } else if (req.method === 'PUT') {
          let body = ''
          req.on('data', (c: Buffer) => (body += c.toString()))
          req.on('end', () => { writeJson('files.json', JSON.parse(body)); ok(res) })
        } else { res.statusCode = 405; res.end() }
      })

      server.middlewares.use('/__admin/files/delete', (req, res) => {
        if (req.method !== 'POST') { res.statusCode = 405; res.end(); return }
        let body = ''
        req.on('data', (c: Buffer) => (body += c.toString()))
        req.on('end', () => {
          const { id, path } = JSON.parse(body)
          const fullPath = resolve(REPO_ROOT, '..', '..', path)
          if (existsSync(fullPath)) unlinkSync(fullPath)
          const files = readJson('files.json')
          writeJson('files.json', files.filter((f: { id: string }) => f.id !== id))
          ok(res)
        })
      })

      server.middlewares.use('/__admin/upload', (req, res) => {
        if (req.method !== 'POST') { res.statusCode = 405; res.end(); return }
        const chunks: Buffer[] = []
        req.on('data', (c: Buffer) => chunks.push(c))
        req.on('end', () => {
          const raw = Buffer.concat(chunks).toString()
          const boundary = req.headers['content-type']?.match(/boundary=(.+)/)?.[1]
          if (!boundary) { err(res, 400, 'No boundary'); return }

          const parts = raw.split(`--${boundary}`)
          let fileBuffer: Buffer | null = null
          let filename = ''
          let categoryId = ''
          let notes = ''

          for (const part of parts) {
            if (part.includes('Content-Disposition: form-data; name="file"')) {
              const headerEnd = part.indexOf('\r\n\r\n')
              if (headerEnd === -1) continue
              const content = part.slice(headerEnd + 4, part.lastIndexOf('\r\n'))
              fileBuffer = Buffer.from(content, 'binary')
              const nameMatch = part.match(/filename="(.+?)"/)
              if (nameMatch) filename = nameMatch[1]
            } else if (part.includes('Content-Disposition: form-data; name="categoryId"')) {
              const headerEnd = part.indexOf('\r\n\r\n')
              if (headerEnd !== -1) categoryId = part.slice(headerEnd + 4).trim()
            } else if (part.includes('Content-Disposition: form-data; name="notes"')) {
              const headerEnd = part.indexOf('\r\n\r\n')
              if (headerEnd !== -1) notes = part.slice(headerEnd + 4).trim()
            }
          }

          if (!fileBuffer || !filename || !categoryId) {
            err(res, 400, 'Missing file, filename, or categoryId'); return
          }

          const ext = extname(filename).slice(1).toLowerCase()
          const targetPath = resolve(REPO_ROOT, '..', '..', filename)
          writeFileSync(targetPath, fileBuffer)
          const stats = statSync(targetPath)

          const newFile = {
            id: `f${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
            filename,
            categoryId,
            notes: notes || undefined,
            path: filename,
            size: stats.size,
            ext,
            addedAt: new Date().toISOString(),
          }

          const files = readJson('files.json')
          files.push(newFile)
          writeJson('files.json', files)

          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(newFile))
        })
      })
    },
  }
}
