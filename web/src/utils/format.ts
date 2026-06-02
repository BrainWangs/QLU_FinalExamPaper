export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  const size = bytes / Math.pow(1024, i)
  return `${size.toFixed(i === 0 ? 0 : 1)} ${units[i]}`
}

export function getFileIcon(ext: string): string {
  const iconMap: Record<string, string> = {
    pdf: '📄',
    zip: '📦',
    rar: '📦',
    '7z': '📦',
    tar: '📦',
    gz: '📦',
    png: '🖼️',
    jpg: '🖼️',
    jpeg: '🖼️',
    doc: '📝',
    docx: '📝',
  }
  return iconMap[ext] ?? '📎'
}

export function isPreviewable(ext: string): boolean {
  return ['pdf', 'png', 'jpg', 'jpeg'].includes(ext)
}
