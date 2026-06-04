<template>
  <article class="card">
    <div class="card-icon">{{ fileIcon }}</div>
    <h3 class="card-name">{{ file.filename }}</h3>
    <div class="card-meta">
      <span class="card-category">{{ categoryName }}</span>
      <span class="card-size">{{ formattedSize }}</span>
    </div>
    <div class="card-actions">
      <button v-if="previewable" class="btn btn-preview" @click="$emit('preview', file)">预览</button>
      <a :href="fileUrl" class="btn btn-download" download>下载</a>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { FileEntry } from '@/types'
import { formatFileSize, getFileIcon, isPreviewable } from '@/utils/format'

const props = defineProps<{
  file: FileEntry
  categoryName: string
}>()

defineEmits<{ preview: [file: FileEntry] }>()

const fileIcon = computed(() => getFileIcon(props.file.ext))
const formattedSize = computed(() => formatFileSize(props.file.size))
const previewable = computed(() => isPreviewable(props.file.ext))
const fileUrl = computed(() => `${import.meta.env.BASE_URL}${props.file.path}`)
</script>

<style scoped>
.card {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  box-shadow: var(--shadow-sm);
  transition: transform var(--transition-normal), box-shadow var(--transition-normal);
}

.card:hover {
  transform: translateY(-6px);
  box-shadow: var(--shadow-lg);
}

.card-icon { font-size: 2rem; line-height: 1; }

.card-name {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--color-text);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-meta { display: flex; align-items: center; gap: var(--space-sm); flex-wrap: wrap; }

.card-category {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-accent);
  background: var(--color-accent-light);
  padding: 2px 8px;
  border-radius: 6px;
}

.card-size { font-size: 0.8rem; color: #D1d1d9; }

.card-actions { display: flex; gap: var(--space-sm); margin-top: auto; }

.btn {
  flex: 1;
  padding: 8px 12px;
  border-radius: var(--radius-sm);
  font-size: 0.85rem;
  font-weight: 700;
  text-align: center;
  transition: all var(--transition-fast);
}

.btn-preview { background: rgba(255, 255, 255, 0.7); border: 1px solid var(--glass-border); color: var(--color-text); }
.btn-preview:hover { background: rgba(50, 130, 184, 0.1); }

.btn-download { background: var(--color-accent); color: #fff; display: block; }
.btn-download:hover { background: var(--color-accent-hover); transform: scale(1.02); }
</style>
