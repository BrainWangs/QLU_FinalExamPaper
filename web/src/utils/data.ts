import type { Category, FileEntry } from '@/types'

let cachedCategories: Category[] | null = null
let cachedFiles: FileEntry[] | null = null

export async function loadCategories(): Promise<Category[]> {
  if (cachedCategories) return cachedCategories
  try {
    const mod = await import('@/data/categories.json')
    cachedCategories = mod.default as Category[]
    return cachedCategories
  } catch {
    cachedCategories = []
    return cachedCategories
  }
}

export async function loadFiles(): Promise<FileEntry[]> {
  if (cachedFiles) return cachedFiles
  try {
    const mod = await import('@/data/files.json')
    cachedFiles = mod.default as FileEntry[]
    return cachedFiles
  } catch {
    cachedFiles = []
    return cachedFiles
  }
}

export function clearCache(): void {
  cachedCategories = null
  cachedFiles = null
}
