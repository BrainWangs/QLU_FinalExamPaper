import express, { type Request, type Response } from 'express'
import multer from 'multer'
import { readFileSync, writeFileSync, existsSync, mkdirSync, unlinkSync, statSync, copyFileSync } from 'fs'
import { resolve, extname, join, dirname } from 'path'

export interface AdminServerOptions {
  /** Path to dist/ for serving the Vue frontend */
  staticDir: string
  /** Path to seed data (categories.json, files.json) */
  seedDataDir: string
  /** Path to seed assets (exam paper files) */
  seedAssetsDir: string
  /** Path to userData for writable storage */
  userDataPath: string
}

function readJson(file: string) {
  if (!existsSync(file)) return []
  return JSON.parse(readFileSync(file, 'utf-8'))
}

function writeJson(file: string, data: unknown) {
  const dir = dirname(file)
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  writeFileSync(file, JSON.stringify(data, null, 2), 'utf-8')
}

function getCatDir(cats: { id: string; name: string }[], id: string): string {
  const cat = cats.find((c) => c.id === id)
  return cat ? cat.name : id
}

export function createAdminApp(options: AdminServerOptions) {
  const { staticDir, seedDataDir, seedAssetsDir, userDataPath } = options

  const userDataDir = join(userDataPath, 'data')
  const userAssetsDir = join(userDataPath, 'assets')

  // First-launch seed: copy bundled data to userData
  function seedIfNeeded() {
    const catFile = join(userDataDir, 'categories.json')
    if (!existsSync(catFile)) {
      if (!existsSync(userDataDir)) mkdirSync(userDataDir, { recursive: true })
      if (!existsSync(userAssetsDir)) mkdirSync(userAssetsDir, { recursive: true })

      // Copy seed JSON files
      const seedCat = join(seedDataDir, 'categories.json')
      const seedFiles = join(seedDataDir, 'files.json')
      if (existsSync(seedCat)) copyFileSync(seedCat, catFile)
      if (existsSync(seedFiles)) copyFileSync(seedFiles, join(userDataDir, 'files.json'))
      else writeJson(join(userDataDir, 'files.json'), [])

      // Copy seed assets
      if (existsSync(seedAssetsDir)) {
        copyDirSync(seedAssetsDir, userAssetsDir)
      }
    }
  }

  function copyDirSync(src: string, dest: string) {
    const { readdirSync: ls } = require('fs')
    for (const entry of ls(src, { withFileTypes: true })) {
      const s = join(src, entry.name)
      const d = join(dest, entry.name)
      if (entry.isDirectory()) {
        if (!existsSync(d)) mkdirSync(d, { recursive: true })
        copyDirSync(s, d)
      } else {
        copyFileSync(s, d)
      }
    }
  }

  seedIfNeeded()

  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
  })

  const app = express()
  app.use(express.json({ limit: '10mb' }))

  // ── Static files: exam papers (userData first, then seed as fallback) ──
  app.use((req, _res, next) => {
    // Try userData assets first, then fallback for seed
    const userFile = join(userAssetsDir, req.path)
    if (existsSync(userFile) && !req.path.startsWith('/__admin')) {
      // Let express.static handle it — but we need to intercept
    }
    next()
  })

  // Serve user assets (uploads) first
  app.use(express.static(userAssetsDir, { fallthrough: true }))
  // Fallback to seed assets (bundled)
  if (existsSync(seedAssetsDir)) {
    app.use(express.static(seedAssetsDir, { fallthrough: true }))
  }

  // ── Admin API ──
  function sendJson(res: Response, data: unknown, code = 200) {
    res.status(code).json(data)
  }

  // GET /__admin/categories
  app.get('/__admin/categories', (_req, res) => {
    sendJson(res, readJson(join(userDataDir, 'categories.json')))
  })

  // PUT /__admin/categories
  app.put('/__admin/categories', (req, res) => {
    const oldCats = readJson(join(userDataDir, 'categories.json'))
    const newCats = req.body
    const oldIds = new Set(oldCats.map((c: { id: string }) => c.id))
    for (const cat of newCats) {
      if (!oldIds.has(cat.id)) {
        const dir = join(userAssetsDir, cat.name)
        if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
      }
    }
    writeJson(join(userDataDir, 'categories.json'), newCats)
    sendJson(res, { ok: true })
  })

  // GET /__admin/files
  app.get('/__admin/files', (_req, res) => {
    sendJson(res, readJson(join(userDataDir, 'files.json')))
  })

  // PUT /__admin/files
  app.put('/__admin/files', (req, res) => {
    writeJson(join(userDataDir, 'files.json'), req.body)
    sendJson(res, { ok: true })
  })

  // POST /__admin/files/delete
  app.post('/__admin/files/delete', (req, res) => {
    const { id, path: filePath } = req.body
    if (!id || !filePath) return sendJson(res, { message: 'Missing id or path' }, 400)

    const fullPath = resolve(userAssetsDir, filePath)
    // Path traversal protection
    if (!fullPath.startsWith(userAssetsDir)) {
      return sendJson(res, { message: 'Invalid path' }, 403)
    }
    if (existsSync(fullPath)) unlinkSync(fullPath)

    const files = readJson(join(userDataDir, 'files.json'))
    writeJson(
      join(userDataDir, 'files.json'),
      files.filter((f: { id: string }) => f.id !== id),
    )
    sendJson(res, { ok: true })
  })

  // POST /__admin/upload
  app.post('/__admin/upload', upload.single('file'), (req, res) => {
    const file = req.file
    const categoryId = req.body.categoryId
    const notes = req.body.notes || ''

    if (!file || !categoryId) {
      return sendJson(res, { message: 'Missing file or categoryId' }, 400)
    }

    const filename = Buffer.from(file.originalname, 'latin1').toString('utf8')

    // Duplicate check
    const existing = readJson(join(userDataDir, 'files.json'))
    const dup = existing.find(
      (f: { filename: string; categoryId: string }) =>
        f.filename === filename && f.categoryId === categoryId,
    )
    if (dup) {
      return sendJson(res, { message: `文件 "${filename}" 已存在于该学科中` }, 409)
    }

    const ext = extname(filename).slice(1).toLowerCase()
    const cats = readJson(join(userDataDir, 'categories.json'))
    const catDir = getCatDir(cats, categoryId)
    const categoryDir = join(userAssetsDir, catDir)
    if (!existsSync(categoryDir)) mkdirSync(categoryDir, { recursive: true })

    const targetPath = join(categoryDir, filename)
    writeFileSync(targetPath, file.buffer)
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

    const f = readJson(join(userDataDir, 'files.json'))
    f.push(newFile)
    writeJson(join(userDataDir, 'files.json'), f)
    sendJson(res, newFile)
  })

  // ── Serve Vue frontend static files ──
  app.use(express.static(staticDir))

  // ── SPA fallback ──
  app.get('*', (_req, res) => {
    const indexPath = join(staticDir, 'index.html')
    if (existsSync(indexPath)) {
      res.sendFile(indexPath)
    } else {
      res.status(404).send('index.html not found')
    }
  })

  return app
}
