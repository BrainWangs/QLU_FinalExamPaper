import { ref, computed } from 'vue'
import Fuse from 'fuse.js'
import type { FileEntry, Category } from '@/types'

export function useFileFilter(files: () => FileEntry[], categories: () => Category[]) {
  const searchQuery = ref('')
  const activeCategory = ref('all')

  const categoryStats = computed(() =>
    categories().map((cat) => ({
      id: cat.id,
      name: cat.name,
      count: files().filter((f) => f.categoryId === cat.id).length,
    }))
  )

  const totalCount = computed(() => files().length)

  const fuse = computed(() => new Fuse(files(), {
    keys: ['filename'],
    threshold: 0.3,
    includeScore: true,
    minMatchCharLength: 1,
  }))

  const filteredFiles = computed(() => {
    let result = files()
    if (searchQuery.value.trim()) {
      result = fuse.value.search(searchQuery.value.trim()).map((r) => r.item)
    }
    if (activeCategory.value === 'unclassified') {
      result = result.filter((f) => !f.categoryId)
    } else if (activeCategory.value !== 'all') {
      result = result.filter((f) => f.categoryId === activeCategory.value)
    }
    return result
  })

  const categoryDisplayStats = computed(() => {
    const base = searchQuery.value.trim()
      ? fuse.value.search(searchQuery.value.trim()).map((r) => r.item)
      : files()
    const result = categories()
      .map((cat) => ({
        id: cat.id,
        name: cat.name,
        count: base.filter((f) => f.categoryId === cat.id).length,
      }))
      .sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'))
    const uncat = base.filter((f) => !f.categoryId).length
    if (uncat > 0) {
      result.push({ id: 'unclassified', name: '未分类', count: uncat })
    }
    return result
  })

  function getCategoryName(id: string): string {
    return categories().find((c) => c.id === id)?.name ?? id
  }

  return {
    searchQuery,
    activeCategory,
    categoryStats,
    categoryDisplayStats,
    totalCount,
    filteredFiles,
    getCategoryName,
  }
}
