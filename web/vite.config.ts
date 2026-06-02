import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import { existsSync, readFileSync, mkdirSync, writeFileSync, cpSync } from 'fs'
import { dirname } from 'path'
import { adminPlugin } from './src/plugins/admin-plugin'
import type { Plugin } from 'vite'

const REPO = resolve(__dirname, '..')

function copyFilesPlugin(): Plugin {
  return {
    name: 'copy-files',
    closeBundle() {
      const dataDir = resolve(__dirname, 'src', 'data')
      const filesPath = resolve(dataDir, 'files.json')
      if (!existsSync(filesPath)) return
      const files: { path: string }[] = JSON.parse(readFileSync(filesPath, 'utf-8'))
      const distDir = resolve(__dirname, 'dist')
      for (const f of files) {
        const src = resolve(REPO, f.path)
        const dest = resolve(distDir, f.path)
        if (existsSync(src)) {
          mkdirSync(dirname(dest), { recursive: true })
          cpSync(src, dest)
        }
      }
    },
  }
}

export default defineConfig({
  plugins: [vue(), adminPlugin(), copyFilesPlugin()],
  base: '/QLU_FinalExamPaper/',
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  publicDir: resolve(__dirname, 'public'),
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
