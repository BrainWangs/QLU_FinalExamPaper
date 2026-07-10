<template>
  <div class="files-page">
    <h2 class="page-title">文件管理</h2>
    <div class="toolbar">
      <input v-model="search" class="input" placeholder="搜索文件名..." />
    </div>
    <div v-if="filtered.length === 0" class="empty">暂无文件</div>
    <table v-else class="table">
      <thead>
        <tr>
          <th>文件名</th>
          <th>学科</th>
          <th>大小</th>
          <th>备注</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="f in filtered" :key="f.id" :class="{ unclassified: !f.categoryId }">
          <td class="td-name">{{ f.filename }}</td>
          <td>
            <select
              :value="f.categoryId"
              class="cat-select"
              @change="assignCategory(f, ($event.target as HTMLSelectElement).value)"
            >
              <option value="">未分类</option>
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
            </select>
          </td>
          <td>{{ formatFileSize(f.size) }}</td>
          <td>{{ f.notes ?? '-' }}</td>
          <td>
            <button class="btn-sm btn-danger" @click="handleDelete(f)">删除</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { adminLoadFiles, adminLoadCategories, adminDeleteFile, adminSaveFiles } from '@/utils/admin-api'
import { clearCache } from '@/utils/data'
import type { FileEntry, Category } from '@/types'
import { formatFileSize } from '@/utils/format'

const files = ref<FileEntry[]>([])
const categories = ref<Category[]>([])
const search = ref('')

const filtered = computed(() => {
  if (!search.value.trim()) return files.value
  const q = search.value.toLowerCase()
  return files.value.filter((f) => f.filename.toLowerCase().includes(q))
})

async function assignCategory(file: FileEntry, newCatId: string) {
  file.categoryId = newCatId
  await adminSaveFiles(files.value)
  clearCache()
}

onMounted(async () => {
  files.value = await adminLoadFiles()
  categories.value = await adminLoadCategories()
})

async function handleDelete(f: FileEntry) {
  if (!confirm(`确定删除 "${f.filename}"？此操作不可撤销。`)) return
  await adminDeleteFile(f.id, f.path)
  files.value = files.value.filter((x) => x.id !== f.id)
  clearCache()
}
</script>

<style scoped>
.page-title { font-size: 1.5rem; font-weight: 700; margin-bottom: var(--space-lg); }
.toolbar { margin-bottom: var(--space-md); }
.input { padding: 8px 12px; border: 1px solid var(--color-border); border-radius: var(--radius-sm); font-size: 0.9rem; font-family: inherit; width: 300px; max-width: 100%; }
.empty { padding: var(--space-xl); text-align: center; color: var(--color-text-muted); }
.table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
.table th { text-align: left; padding: 10px 12px; border-bottom: 2px solid var(--color-border); color: var(--color-text-secondary); font-weight: 600; }
.table td { padding: 10px 12px; border-bottom: 1px solid var(--color-border); }
.td-name { max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.btn-sm { padding: 4px 12px; border-radius: var(--radius-sm); font-size: 0.8rem; background: var(--color-surface); color: var(--color-text); }
.btn-sm:hover { background: var(--color-border); }
.btn-danger { color: var(--color-danger); }
.btn-danger:hover { background: #fce8e6; }
.unclassified { background: #fff8e1; }
.cat-select { padding: 4px 8px; border: 1px solid var(--color-border); border-radius: 4px; font-size: 0.85rem; font-family: inherit; }
</style>
