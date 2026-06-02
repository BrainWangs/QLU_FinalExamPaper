export interface Category {
  id: string
  name: string
  description?: string
  createdAt: string
}

export interface FileEntry {
  id: string
  filename: string
  categoryId: string
  notes?: string
  path: string
  size: number
  ext: string
  addedAt: string
}
