<template>
  <article
    ref="cardRef"
    :class="['card', file.ext]"
    @mousemove="onMouseMove($event, ($event.currentTarget as HTMLElement))"
    @mouseleave="onMouseLeave($event.currentTarget as HTMLElement)"
  >
    <div class="card-glare"></div>

    <span class="card-badge">
      <svg v-if="file.ext === 'pdf'" viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8.5 7.5c0 .83-.67 1.5-1.5 1.5H9v2H7.5V7H10c.83 0 1.5.67 1.5 1.5v1zm5 2c0 .83-.67 1.5-1.5 1.5h-1.5v2H13V7h1.5c.83 0 1.5.67 1.5 1.5v3zm4-3H19v1h1.5V11H19v2h-1.5V7h3v1.5zM9 9.5h1v-1H9v1zM4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm10 5.5h1v-3h-1v3z"/></svg>
      <svg v-else-if="file.ext === 'zip' || file.ext === 'rar' || file.ext === '7z' || file.ext === 'tar' || file.ext === 'gz'" viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 8h-3v2h2v2h-3v2h-2v-6h6v2z"/></svg>
      <svg v-else-if="file.ext === 'doc' || file.ext === 'docx'" viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-1 7V3.5L18.5 9H13z"/></svg>
      <svg v-else-if="file.ext === 'ppt' || file.ext === 'pptx'" viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6z"/></svg>
      <svg v-else-if="file.ext === 'png' || file.ext === 'jpg' || file.ext === 'jpeg'" viewBox="0 0 24 24" fill="currentColor"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>
      <svg v-else viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6z"/></svg>
      {{ file.ext.toUpperCase() }}
    </span>

    <h3 class="card-name">{{ file.filename }}</h3>

    <div class="card-meta">
      <span :class="['card-category', categorySlug]">
        <span :class="['cat-dot', categorySlug]"></span>
        {{ categoryName }}
      </span>
      <span class="card-size">{{ formattedSize }}</span>
    </div>

    <div class="card-actions">
      <button v-if="previewable" class="btn btn-outline" @click="$emit('preview', file)">预览</button>
      <a :href="fileUrl" class="btn btn-primary" download>下载</a>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { FileEntry } from '@/types'
import { formatFileSize, isPreviewable } from '@/utils/format'
import { useCardTilt } from '@/composables/useCardTilt'

const props = defineProps<{
  file: FileEntry
  categoryName: string
}>()

defineEmits<{ preview: [file: FileEntry] }>()

const { onMouseMove, onMouseLeave } = useCardTilt()

const formattedSize = computed(() => formatFileSize(props.file.size))
const previewable = computed(() => isPreviewable(props.file.ext))
const fileUrl = computed(() => `${import.meta.env.BASE_URL}${props.file.path}`)

// Map category name to a CSS-safe slug for color dot
const categorySlugMap: Record<string, string> = {
  '高等数学': 'math',
  '线性代数': 'algebra',
  '大学物理': 'physics',
  '数据结构': 'ds',
  '操作系统': 'os',
  '计算机网络': 'network',
}
const categorySlug = computed(() => categorySlugMap[props.categoryName] ?? 'math')
</script>

<style scoped>
.card {
  background: var(--color-surface);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
  padding: 20px;
  display: flex; flex-direction: column; gap: 10px;
  position: relative; overflow: hidden;
  transition: transform .15s cubic-bezier(0,0,.2,1), box-shadow .3s cubic-bezier(0,0,.2,1), border-color .3s;
  box-shadow: 0 1px 2px rgba(0,0,0,.04);
  transform-style: preserve-3d;
  will-change: transform;
}

/* Top accent stripe */
.card::before {
  content: '';
  position: absolute; top: 0; left: 12px; right: 12px; height: 4px;
  border-radius: 0 0 3px 3px;
  z-index: 1;
  transition: all .3s var(--transition-fast);
}
.card.pdf::before { background: linear-gradient(90deg, var(--ft-pdf), #fca5a5); }
.card.zip::before, .card.rar::before, .card\37 z::before, .card.tar::before, .card.gz::before { background: linear-gradient(90deg, var(--ft-zip), #c4b5fd); }
.card.doc::before, .card.docx::before { background: linear-gradient(90deg, var(--ft-doc), #93c5fd); }
.card.ppt::before, .card.pptx::before { background: linear-gradient(90deg, var(--ft-ppt), #fdba74); }
.card.png::before, .card.jpg::before, .card.jpeg::before { background: linear-gradient(90deg, var(--ft-img), #6ee7b7); }

.card:hover::before { left: 0; right: 0; height: 5px; border-radius: 0; }
.card:hover { border-color: var(--color-border); }

/* Glare layer */
.card-glare {
  position: absolute; inset: 0; pointer-events: none; z-index: 5;
  border-radius: var(--radius-lg);
  background: radial-gradient(circle at 50% 50%, rgba(255,255,255,.5) 0%, transparent 70%);
  opacity: 0;
  transition: opacity .3s;
}
.card:hover .card-glare { opacity: 1; }

/* Badge */
.card-badge {
  display: inline-flex; align-items: center; gap: 4px;
  align-self: flex-start; position: relative; z-index: 2;
  padding: 4px 10px;
  font-size: .68rem; font-weight: 700; letter-spacing: .06em;
  text-transform: uppercase;
  border-radius: var(--radius-sm);
}
.card-badge svg { width: 14px; height: 14px; flex-shrink: 0; }

.card.pdf .card-badge { color: var(--ft-pdf); background: #fef2f2; }
.card.zip .card-badge, .card.rar .card-badge, .card.\37 z .card-badge, .card.tar .card-badge, .card.gz .card-badge { color: var(--ft-zip); background: #f5f3ff; }
.card.doc .card-badge, .card.docx .card-badge { color: var(--ft-doc); background: #eff6ff; }
.card.ppt .card-badge, .card.pptx .card-badge { color: var(--ft-ppt); background: #fff7ed; }
.card.png .card-badge, .card.jpg .card-badge, .card.jpeg .card-badge { color: var(--ft-img); background: #ecfdf5; }

.card-name {
  font-size: .88rem; font-weight: 600; color: var(--color-text); line-height: 1.45;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
  overflow: hidden; position: relative; z-index: 2;
}

.card-meta {
  display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
  position: relative; z-index: 2;
}

.card-category {
  font-size: .73rem; font-weight: 500; color: var(--color-text-secondary);
  padding: 3px 8px; border-radius: var(--radius-sm);
  background: #f8fafc;
  display: flex; align-items: center; gap: 5px;
}

.cat-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
.cat-dot.math    { background: var(--cat-math); }
.cat-dot.algebra { background: var(--cat-algebra); }
.cat-dot.physics { background: var(--cat-physics); }
.cat-dot.ds      { background: var(--cat-ds); }
.cat-dot.os      { background: var(--cat-os); }
.cat-dot.network { background: var(--cat-network); }

.card-size {
  font-size: .73rem; color: var(--color-text-muted);
  font-variant-numeric: tabular-nums;
}

.card-actions {
  display: flex; gap: 8px; margin-top: auto;
  position: relative; z-index: 2;
}

.btn {
  flex: 1; padding: 8px 12px; border-radius: var(--radius-md);
  font-size: .8rem; font-weight: 600; text-align: center;
  transition: all .2s var(--transition-fast);
  position: relative; overflow: hidden;
}

.btn-outline {
  background: transparent;
  border: 1.5px solid var(--color-border); color: var(--color-text-secondary);
}
.btn-outline:hover { border-color: #a5b4fc; color: #4f46e5; background: #eef2ff; }

.btn-primary {
  display: block; color: #fff;
  background: linear-gradient(135deg, var(--color-accent), var(--color-accent-end));
}
.btn-primary::after {
  content: '';
  position: absolute; inset: 0;
  background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,.12) 45%, rgba(255,255,255,.22) 50%, rgba(255,255,255,.12) 55%, transparent 60%);
  transform: translateX(-100%);
  transition: transform .5s;
}
.btn-primary:hover::after { transform: translateX(100%); }
.btn-primary:hover { transform: translateY(-1px); filter: brightness(1.1); }

/* ── Mobile ── */
@media (max-width: 640px) {
  .card { padding: 16px; gap: 8px; }
  .card-name { font-size: .82rem; }
  .btn { font-size: .75rem; padding: 6px 10px; }
}
</style>
