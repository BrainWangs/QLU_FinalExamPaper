import type { Plugin } from 'vite'
import { readFileSync, writeFileSync, existsSync, mkdirSync, statSync, unlinkSync } from 'fs'
import { resolve, extname, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
// __dirname is web/src/plugins/, go up 2 levels to web/
const PROJECT_ROOT = resolve(__dirname, '..', '..')
const DATA_DIR = resolve(PROJECT_ROOT, 'src', 'data')
const ASSETS_DIR = resolve(PROJECT_ROOT, '..', 'assets')

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

function json(res: { setHeader: (k: string, v: string) => void; end: (s: string) => void; statusCode: number }, data: unknown, code = 200) {
  res.statusCode = code
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(data))
}

function getCatDir(id: string): string {
  const cats = readJson('categories.json')
  const cat = cats.find((c: { id: string; name: string }) => c.id === id)
  return cat ? cat.name : id
}

function readBody(req: { on: (e: string, cb: (...a: unknown[]) => void) => void }): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = ''
    req.on('data', (c) => (body += (c as Buffer).toString()))
    req.on('end', () => resolve(body))
    req.on('error', reject)
  })
}

export function adminPlugin(): Plugin {
  return {
    name: 'admin-api',
    configureServer(server) {
      // Connect strips the mount prefix from req.url.
      // e.g. GET /__admin/categories → req.url is /categories
      server.middlewares.use('/__admin', async (req, res) => {
        const url = req.url ?? ''
        const method = req.method ?? 'GET'
        const send = (data: unknown, code = 200) => json(res as Parameters<typeof json>[0], data, code)

        if (url === '/categories' && method === 'GET') {
          return send(readJson('categories.json'))
        }

        if (url === '/categories' && method === 'PUT') {
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
          return send({ ok: true })
        }

        if (url === '/files' && method === 'GET') {
          return send(readJson('files.json'))
        }

        if (url === '/files' && method === 'PUT') {
          const body = await readBody(req)
          writeJson('files.json', JSON.parse(body))
          return send({ ok: true })
        }

        if (url === '/files/delete' && method === 'POST') {
          const body = await readBody(req)
          const { id, path: filePath } = JSON.parse(body)
          const fullPath = resolve(ASSETS_DIR, filePath)
          // Prevent path traversal: ensure resolved path is within ASSETS_DIR
          if (!fullPath.startsWith(ASSETS_DIR)) {
            return send({ message: 'Invalid path' }, 403)
          }
          if (existsSync(fullPath)) unlinkSync(fullPath)
          const files = readJson('files.json')
          writeJson('files.json', files.filter((f: { id: string }) => f.id !== id))
          return send({ ok: true })
        }

        if (url === '/upload' && method === 'POST') {
          const chunks: Buffer[] = []
          req.on('data', (c: Buffer) => chunks.push(c))
          await new Promise<void>((resolve, reject) => {
            req.on('end', resolve)
            req.on('error', reject)
          })

          // Parse multipart form data directly from buffer (avoid string corruption)
          const raw = Buffer.concat(chunks)
          const contentType = req.headers['content-type'] ?? ''
          const boundaryMatch = contentType.match(/boundary=(.+)/)
          if (!boundaryMatch) return send({ message: 'No boundary' }, 400)
          const boundary = boundaryMatch[1]
          const boundaryBuf = Buffer.from(`--${boundary}`)

          let fileBuffer: Buffer | null = null
          let filename = ''
          let categoryId = ''
          let notes = ''

          // Split by boundary bytes
          let start = raw.indexOf(boundaryBuf) + boundaryBuf.length
          while (start < raw.length) {
            const nextBoundary = raw.indexOf(boundaryBuf, start)
            const partEnd = nextBoundary === -1 ? raw.length : nextBoundary
            const part = raw.subarray(start, partEnd)
            const headerEnd = part.indexOf('\r\n\r\n')
            if (headerEnd !== -1) {
              const header = part.subarray(0, headerEnd).toString()
              const content = part.subarray(headerEnd + 4)
              // Trim trailing \r\n before boundary
              const end = content.length >= 2 && content[content.length - 1] === 0x0a && content[content.length - 2] === 0x0d
                ? content.length - 2 : content.length
              const cleanContent = content.subarray(0, end)

              if (header.includes('name="file"')) {
                fileBuffer = Buffer.from(cleanContent)
                const nameMatch = header.match(/filename="(.+?)"/)
                if (nameMatch) filename = nameMatch[1]
              } else if (header.includes('name="categoryId"')) {
                categoryId = cleanContent.toString().trim()
              } else if (header.includes('name="notes"')) {
                notes = cleanContent.toString().trim()
              }
            }
            start = partEnd + boundaryBuf.length
          }

          if (!fileBuffer || !filename || !categoryId) {
            return send({ message: 'Missing file, filename, or categoryId' }, 400)
          }

          // Duplicate check: same filename in same category
          const existing = readJson('files.json')
          const dup = existing.find(
            (f: { filename: string; categoryId: string }) =>
              f.filename === filename && f.categoryId === categoryId,
          )
          if (dup) {
            return send({ message: `文件 "${filename}" 已存在于该学科中` }, 409)
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

          const f = readJson('files.json')
          f.push(newFile)
          writeJson('files.json', f)
          return send(newFile)
        }

        return send({ message: 'Not found' }, 404)
      })
    },
  }
}
