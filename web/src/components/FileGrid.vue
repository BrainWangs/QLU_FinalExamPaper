<template>
  <div v-if="files.length === 0" class="empty">
    <span class="empty-icon">📭</span>
    <p class="empty-text">没有找到匹配的试卷 (ﾟ∀。)</p>
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
  gap: var(--space-md);
}

.empty {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-xl) 0;
  color: var(--color-text-secondary);
}

.empty-icon { font-size: 3rem; margin-bottom: var(--space-md); }
.empty-text { font-size: 1.1rem; font-weight: 700; margin-bottom: var(--space-xs); }
.empty-hint { font-size: 0.9rem; font-weight: 700; color: var(--color-text-secondary); }

/* ── Mobile (< 641px): 1 column ── */
@media (max-width: 640px) {
  .grid {
    grid-template-columns: 1fr;
    gap: var(--space-sm);
  }

  .empty {
    padding: var(--space-lg) 0;
  }
}

/* ── Tablet (641px - 1024px): 2 columns ── */
@media (min-width: 641px) and (max-width: 1024px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* ── Desktop (1025px+): 3-4 columns via auto-fill ── */
@media (min-width: 1025px) {
  .grid {
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  }
}
</style>
