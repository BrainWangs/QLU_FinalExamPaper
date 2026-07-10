<template>
  <Teleport to="body">
    <Transition name="pdf-modal">
      <div v-if="visible" class="overlay" @click.self="$emit('close')">
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title">{{ filename }}</h3>
          <div class="modal-actions">
            <a :href="fileUrl" class="btn-dl" download>下载</a>
            <button class="btn-close" @click="$emit('close')">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6L6 18M6 6l12 12" stroke-linecap="round"/></svg>
            </button>
          </div>
        </div>
        <div v-if="loading" class="modal-loading">
          <span class="spinner"></span>
          <span>加载中...</span>
        </div>
        <div v-if="error" class="modal-error">
          <p>预览失败：{{ error }}</p>
        </div>
        <div ref="canvasContainer" class="modal-body" v-show="!loading && !error"></div>
        <div v-if="!loading && !error" class="modal-footer">
          <button :disabled="pageNum <= 1" @click="goPrev">上一页</button>
          <span class="page-info">{{ pageNum }} / {{ totalPages }}</span>
          <button :disabled="pageNum >= totalPages" @click="goNext">下一页</button>
        </div>
      </div>
    </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, computed } from 'vue'

const props = defineProps<{ visible: boolean; url: string; filename: string }>()
defineEmits<{ close: [] }>()

const canvasContainer = ref<HTMLElement>()
const loading = ref(false)
const error = ref('')
const pageNum = ref(1)
const totalPages = ref(0)

import pdfjsWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

const fileUrl = computed(() => `${import.meta.env.BASE_URL}${props.url}`)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let pdfDoc: any = null

async function loadPdf() {
  if (!props.visible) return
  loading.value = true
  error.value = ''
  pageNum.value = 1
  totalPages.value = 0

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const lib: any = await import('pdfjs-dist')
    lib.GlobalWorkerOptions.workerSrc = pdfjsWorkerUrl
    const task = lib.getDocument(fileUrl.value)
    pdfDoc = await task.promise
    totalPages.value = pdfDoc.numPages
    await renderPage()
  } catch (e) {
    error.value = (e as Error).message
  } finally {
    loading.value = false
  }
}

async function renderPage() {
  if (!pdfDoc || !canvasContainer.value) return
  canvasContainer.value.innerHTML = ''
  const page = await pdfDoc.getPage(pageNum.value)
  const viewport = page.getViewport({ scale: 1.5 })
  const canvas = document.createElement('canvas')
  canvas.height = viewport.height
  canvas.width = viewport.width
  canvas.style.display = 'block'
  canvasContainer.value.appendChild(canvas)
  const ctx = canvas.getContext('2d')!
  await page.render({ canvasContext: ctx, viewport }).promise
}

async function goPrev() { if (pageNum.value > 1) { pageNum.value--; await renderPage() } }
async function goNext() { if (pageNum.value < totalPages.value) { pageNum.value++; await renderPage() } }

watch(() => props.visible, async (v) => {
  if (v) { await nextTick(); await loadPdf() } else { pdfDoc = null }
})
</script>

<style scoped>
.overlay {
  position: fixed; inset: 0; background: rgba(15, 23, 42, 0.3);
  backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center;
  z-index: 200; padding: var(--space-lg);
}
.modal {
  background: var(--color-surface);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
  width: 100%; max-width: 960px;
  max-height: 95vh; display: flex; flex-direction: column; overflow: hidden;
}
.modal-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: var(--space-md) var(--space-lg); border-bottom: 1px solid var(--color-border-light);
}
.modal-title { font-size: 1rem; font-weight: 700; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.modal-actions { display: flex; align-items: center; gap: var(--space-sm); }
.btn-dl {
  padding: 7px 16px; background: linear-gradient(135deg, var(--color-accent), var(--color-accent-end));
  color: #fff; border-radius: var(--radius-md); font-size: .85rem; font-weight: 600;
}
.btn-dl:hover { filter: brightness(1.1); transform: translateY(-1px); }
.btn-close {
  width: 36px; height: 36px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  background: var(--color-bg-alt, #f1f5f9); border: none;
  color: var(--color-text-secondary); transition: all var(--transition-fast);
}
.btn-close:hover { background: #e2e8f0; color: var(--color-text); }
.modal-loading { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: var(--space-md); padding: 64px; color: var(--color-text-secondary); }
.spinner { width: 32px; height: 32px; border: 3px solid var(--color-border-light); border-top-color: var(--color-accent); border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.modal-error { padding: 64px; text-align: center; color: var(--ft-pdf); font-weight: 500; }
.modal-body { flex: 1; overflow: auto; padding: var(--space-md); }
.modal-body canvas { display: block; margin: 0 auto; }
.modal-footer { display: flex; align-items: center; justify-content: center; gap: var(--space-md); padding: var(--space-md); border-top: 1px solid var(--color-border-light); }
.modal-footer button {
  padding: 8px 18px; border-radius: var(--radius-md);
  font-size: .85rem; font-weight: 600;
  color: var(--color-text-secondary); background: #f1f5f9;
  border: 1px solid var(--color-border-light);
  transition: all var(--transition-fast);
}
.modal-footer button:hover:not(:disabled) { background: var(--color-accent-subtle); color: var(--color-accent); border-color: var(--color-accent-border); }
.modal-footer button:disabled { opacity: .3; cursor: default; }
.page-info { font-size: .85rem; font-weight: 500; color: var(--color-text-secondary); font-variant-numeric: tabular-nums; }

@media (max-width: 640px) {
  .overlay { padding: var(--space-sm); align-items: flex-end; }
  .modal { max-width: 100%; max-height: 92vh; border-radius: var(--radius-lg) var(--radius-lg) 0 0; }
  .modal-header { padding: var(--space-sm) var(--space-md); }
  .modal-title { font-size: .9rem; }
  .btn-dl { padding: 5px 12px; font-size: .8rem; }
  .modal-body { padding: var(--space-sm); }
  .modal-footer { padding: var(--space-sm); gap: var(--space-sm); }
  .modal-footer button { padding: 6px 14px; font-size: .8rem; }
  .modal-loading, .modal-error { padding: 32px; }
}
</style>
