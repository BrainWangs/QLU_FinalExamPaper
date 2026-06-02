import type { Category, FileEntry } from '@/types'

const BASE = '/__admin'

async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }))
    throw new Error(err.message ?? 'Request failed')
  }
  return res.json()
}

export async function adminLoadCategories(): Promise<Category[]> {
  return api('/categories')
}

export async function adminSaveCategories(categories: Category[]): Promise<void> {
  return api('/categories', { method: 'PUT', body: JSON.stringify(categories) })
}

export async function adminLoadFiles(): Promise<FileEntry[]> {
  return api('/files')
}

export async function adminSaveFiles(files: FileEntry[]): Promise<void> {
  return api('/files', { method: 'PUT', body: JSON.stringify(files) })
}

export async function adminUploadFile(formData: FormData): Promise<FileEntry> {
  const res = await fetch(`${BASE}/upload`, { method: 'POST', body: formData })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }))
    throw new Error(err.message ?? 'Upload failed')
  }
  return res.json()
}

export async function adminDeleteFile(id: string, path: string): Promise<void> {
  return api('/files/delete', {
    method: 'POST',
    body: JSON.stringify({ id, path }),
  })
}
