<template>
  <div class="dashboard">
    <h2 class="page-title">仪表盘</h2>
    <div class="stats">
      <div class="stat-card">
        <span class="stat-num">{{ files.length }}</span>
        <span class="stat-label">文件总数</span>
      </div>
      <div class="stat-card">
        <span class="stat-num">{{ categories.length }}</span>
        <span class="stat-label">学科分类</span>
      </div>
      <div class="stat-card">
        <span class="stat-num">{{ totalSize }}</span>
        <span class="stat-label">总大小</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { adminLoadFiles, adminLoadCategories } from '@/utils/admin-api'
import type { FileEntry, Category } from '@/types'
import { formatFileSize } from '@/utils/format'

const files = ref<FileEntry[]>([])
const categories = ref<Category[]>([])

const totalSize = computed(() => formatFileSize(files.value.reduce((s, f) => s + f.size, 0)))

onMounted(async () => {
  files.value = await adminLoadFiles()
  categories.value = await adminLoadCategories()
})
</script>

<style scoped>
.page-title { font-size: 1.5rem; font-weight: 700; margin-bottom: var(--space-xl); }
.stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: var(--space-md); }
.stat-card {
  background: var(--color-card); border: 1px solid var(--color-border);
  border-radius: var(--radius-md); padding: var(--space-lg);
  display: flex; flex-direction: column; gap: var(--space-xs);
}
.stat-num { font-size: 2rem; font-weight: 700; color: var(--color-accent); }
.stat-label { font-size: 0.9rem; color: var(--color-text-secondary); }
</style>
