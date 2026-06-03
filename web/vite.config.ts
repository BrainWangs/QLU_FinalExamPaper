import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'fs'
import { join, relative } from 'path'
import { adminPlugin } from './src/plugins/admin-plugin'
import type { Plugin } from 'vite'

function scanDir(dir: string, base: string): string[] {
  const results: string[] = []
  if (!existsSync(dir)) return results
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) {
      results.push(...scanDir(full, base))
    } else {
      results.push(relative(base, full).replace(/\\/g, '/'))
    }
  }
  return results
}

function spaFallbackPlugin(): Plugin {
  return {
    name: 'spa-fallback',
    closeBundle() {
      const dist = resolve(__dirname, 'dist')
      const idx = resolve(dist, 'index.html')
      if (existsSync(idx)) writeFileSync(resolve(dist, '404.html'), readFileSync(idx))
    },
  }
}

function autoDiscoverPlugin(): Plugin {
  return {
    name: 'auto-discover',
    buildStart() {
      const assetsDir = resolve(__dirname, '..', 'assets')
      const filesPath = resolve(__dirname, 'src', 'data', 'files.json')
      if (!existsSync(assetsDir)) return

      const existing: { path: string; id: string }[] = existsSync(filesPath)
        ? JSON.parse(readFileSync(filesPath, 'utf-8'))
        : []

      const registered = new Set(existing.map((f: { path: string }) => f.path))
      const diskFiles = scanDir(assetsDir, assetsDir)

      let added = false
      for (const relPath of diskFiles) {
        if (!registered.has(relPath)) {
          const ext = relPath.split('.').pop()?.toLowerCase() ?? ''
          if (['svg', 'png', 'jpg', 'ico', 'html', 'css', 'js'].includes(ext)) continue
          const filename = relPath.split('/').pop() ?? relPath
          try {
            const size = statSync(resolve(assetsDir, relPath)).size
            existing.push({
              id: `f${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
              filename,
              categoryId: '',
              path: relPath,
              size,
              ext,
              addedAt: new Date().toISOString(),
            })
            added = true
            console.log(`  [auto-discover] added: ${relPath}`)
          } catch { /* skip unreadable files */ }
        }
      }

      if (added) {
        writeFileSync(filesPath, JSON.stringify(existing, null, 2), 'utf-8')
      }
    },
  }
}

export default defineConfig({
  plugins: [vue(), adminPlugin(), autoDiscoverPlugin(), spaFallbackPlugin()],
  base: '/QLU_FinalExamPaper/',
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  publicDir: resolve(__dirname, '..', 'assets'),
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'pdfjs': ['pdfjs-dist'],
        },
      },
    },
  },
  server: {
    fs: {
      allow: ['..'],
    },
  },
})
