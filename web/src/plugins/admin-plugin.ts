import type { Plugin } from 'vite'
import { readFileSync, writeFileSync, existsSync, mkdirSync, statSync, unlinkSync } from 'fs'
import { resolve, extname } from 'path'

const REPO_ROOT = resolve(__dirname, '..')
const DATA_DIR = resolve(REPO_ROOT, 'src', 'data')
const ASSETS_DIR = resolve(REPO_ROOT, '..', 'assets')

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

function json(res: { setHeader: (k: string, v: string) => void; end: (s: string) => void }, data: unknown, code = 200) {
  res.statusCode = code
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(data))
}

function getCatDir(id: string): string {
  const cats = readJson('categories.json')
  const cat = cats.find((c: { id: string; name: string }) => c.id === id)
  return cat ? cat.name : id
}

function readBody(req: Parameters<Parameters<Plugin['configureServer']>[0]['middlewares']['use']>[1]): Promise<string> {
  return new Promise((resolve) => {
    let body = ''
    req.on('data', (c: Buffer) => (body += c.toString()))
    req.on('end', () => resolve(body))
  })
}

export function adminPlugin(): Plugin {
  return {
    name: 'admin-api',
    configureServer(server) {
      // Single handler with manual routing
      server.middlewares.use('/__admin', async (req, res) => {
        const url = req.url ?? ''
        const method = req.method ?? 'GET'

        // GET /__admin/categories
        if (url === '/__admin/categories' && method === 'GET') {
          return json(res, readJson('categories.json'))
        }

        // PUT /__admin/categories
        if (url === '/__admin/categories' && method === 'PUT') {
          const body = await readBody(req)
          const oldCats = readJson('categories.json')
          const newCats = JSON.parse(body)
          const oldIds = new Set(oldCats.map((c: { id: string }) => c.id))
          for (const cat of newCats) {
            if (!oldIds.has(cat.id)) {
              const dir = resolve(ASSETS_DIR, cat.name)
              if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
            }
          }
          writeJson('categories.json', newCats)
          return json(res, { ok: true })
        }

        // GET /__admin/files
        if (url === '/__admin/files' && method === 'GET') {
          return json(res, readJson('files.json'))
        }

        // PUT /__admin/files
        if (url === '/__admin/files' && method === 'PUT') {
          const body = await readBody(req)
          writeJson('files.json', JSON.parse(body))
          return json(res, { ok: true })
        }

        // POST /__admin/files/delete
        if (url === '/__admin/files/delete' && method === 'POST') {
          const body = await readBody(req)
          const { id, path: filePath } = JSON.parse(body)
          const fullPath = resolve(ASSETS_DIR, filePath)
          if (existsSync(fullPath)) unlinkSync(fullPath)
          const files = readJson('files.json')
          writeJson('files.json', files.filter((f: { id: string }) => f.id !== id))
          return json(res, { ok: true })
        }

        // POST /__admin/upload
        if (url === '/__admin/upload' && method === 'POST') {
          const chunks: Buffer[] = []
          req.on('data', (c: Buffer) => chunks.push(c))
          await new Promise<void>((resolve) => req.on('end', resolve))
          const raw = Buffer.concat(chunks).toString()
          const boundary = req.headers['content-type']?.match(/boundary=(.+)/)?.[1]
          if (!boundary) return json(res, { message: 'No boundary' }, 400)

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
            return json(res, { message: 'Missing file, filename, or categoryId' }, 400)
          }

          const ext = extname(filename).slice(1).toLowerCase()
          const catDir = getCatDir(categoryId)
          const categoryDir = resolve(ASSETS_DIR, catDir)
          if (!existsSync(categoryDir)) mkdirSync(categoryDir, { recursive: true })
          const targetPath = resolve(categoryDir, filename)
          writeFileSync(targetPath, fileBuffer)
          const stats = statSync(targetPath)

          const newFile = {
            id: `f${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
            filename,
            categoryId,
            notes: notes || undefined,
            path: `${catDir}/${filename}`,
            size: stats.size,
            ext,
            addedAt: new Date().toISOString(),
          }

          const files = readJson('files.json')
          files.push(newFile)
          writeJson('files.json', files)
          return json(res, newFile)
        }

        // Fallback
        res.statusCode = 404
        res.end(JSON.stringify({ message: 'Not found' }))
      })
    },
  }
}
