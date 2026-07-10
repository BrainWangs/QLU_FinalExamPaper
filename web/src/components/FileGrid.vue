<template>
  <div v-if="files.length === 0" class="empty">
    <div class="empty-art">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke-linecap="round"/>
      </svg>
    </div>
    <p class="empty-text">没有找到匹配的试卷</p>
    <p class="empty-hint">尝试更换搜索关键词或选择其他学科分类</p>
  </div>
  <div v-else class="grid">
    <FileCard
      v-for="file in files"
      :key="file.id"
      :file="file"
      :category-name="getCategoryName(file.categoryId)"
      @preview="$emit('preview', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import type { FileEntry } from '@/types'
import FileCard from './FileCard.vue'

defineProps<{
  files: FileEntry[]
  getCategoryName: (id: string) => string
}>()

defineEmits<{ preview: [file: FileEntry] }>()
</script>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
  perspective: 1200px;
}

.empty {
  grid-column: 1 / -1;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 80px 0;
}
.empty-art {
  width: 80px; height: 80px; border-radius: 50%;
  background: linear-gradient(135deg, #eef2ff, #f5f3ff);
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 20px;
}
.empty-art svg { width: 36px; height: 36px; color: #a5b4fc; }
.empty-text { font-size: 1rem; font-weight: 600; color: var(--color-text-secondary); margin-bottom: 4px; }
.empty-hint { font-size: .82rem; color: var(--color-text-muted); }

@media (max-width: 640px) {
  .grid { grid-template-columns: 1fr; gap: 12px; }
  .empty { padding: 48px 0; }
}

@media (min-width: 641px) and (max-width: 1024px) {
  .grid { grid-template-columns: repeat(2, 1fr); }
}
</style>
