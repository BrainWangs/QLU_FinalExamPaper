<template>
  <Teleport to="body">
    <div v-if="visible" class="overlay" @click.self="$emit('close')">
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title">{{ filename }}</h3>
          <div class="modal-actions">
            <a :href="fileUrl" class="btn-dl" download>下载</a>
            <button class="btn-close" @click="$emit('close')">&times;</button>
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
  position: fixed; inset: 0; background: rgba(0, 0, 0, 0.5);
  display: flex; align-items: center; justify-content: center;
  z-index: 200; padding: var(--space-lg);
}
.modal {
  background: var(--color-bg); border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg); width: 100%; max-width: 960px;
  max-height: 95vh; display: flex; flex-direction: column; overflow: hidden;
}
.modal-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: var(--space-md) var(--space-lg); border-bottom: 1px solid var(--color-border);
}
.modal-title { font-size: 1rem; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.modal-actions { display: flex; align-items: center; gap: var(--space-sm); }
.btn-dl { padding: 6px 14px; background: var(--color-accent); color: #fff; border-radius: var(--radius-sm); font-size: 0.85rem; font-weight: 500; }
.btn-dl:hover { background: var(--color-accent-hover); }
.btn-close { padding: 6px 10px; background: var(--color-surface); color: var(--color-text); border-radius: var(--radius-sm); font-size: 1rem; }
.btn-close:hover { background: var(--color-border); }
.modal-loading { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: var(--space-md); padding: 64px; color: var(--color-text-secondary); }
.spinner { width: 32px; height: 32px; border: 3px solid var(--color-border); border-top-color: var(--color-accent); border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.modal-error { padding: 64px; text-align: center; color: var(--color-danger); }
.modal-body { flex: 1; overflow: auto; padding: var(--space-md); }
.modal-body canvas { display: block; margin: 0 auto; }
.modal-footer { display: flex; align-items: center; justify-content: center; gap: var(--space-md); padding: var(--space-md); border-top: 1px solid var(--color-border); }
.modal-footer button { padding: 6px 16px; background: var(--color-surface); color: var(--color-text); border-radius: var(--radius-sm); font-size: 0.85rem; }
.modal-footer button:hover:not(:disabled) { background: var(--color-border); }
.modal-footer button:disabled { opacity: 0.4; cursor: default; }
.page-info { font-size: 0.85rem; color: var(--color-text-secondary); }
</style>
