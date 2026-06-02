import type { FileEntry } from '@/types'

export function generateFileId(): string {
  return `f${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`
}

export function createFileEntry(overrides: {
  filename: string
  categoryId: string
  path: string
  size: number
  ext: string
  notes?: string
}): FileEntry {
  return {
    id: generateFileId(),
    filename: overrides.filename,
    categoryId: overrides.categoryId,
    path: overrides.path,
    size: overrides.size,
    ext: overrides.ext,
    notes: overrides.notes,
    addedAt: new Date().toISOString(),
  }
}
