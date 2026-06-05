<template>
  <div class="upload-page">
    <h2 class="page-title">上传文件</h2>
    <form class="form" @submit.prevent="handleUpload">
      <label class="label">
        学科分类
        <select v-model="categoryId" class="input" required>
          <option value="">请选择学科...</option>
          <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
        </select>
      </label>
      <label class="label">
        选择文件
        <input
          type="file"
          ref="fileInput"
          class="input"
          multiple
          @change="onFileChange"
          required
        />
      </label>

      <!-- Selected files list -->
      <div v-if="selectedFiles.length" class="file-list glass-card">
        <div class="file-list-header">
          <span class="file-list-title">已选择 {{ selectedFiles.length }} 个文件</span>
          <button type="button" class="btn-clear" @click="clearFiles">清除全部</button>
        </div>
        <ul class="file-items">
          <li v-for="(file, i) in selectedFiles" :key="i" class="file-item">
            <span class="file-name">{{ file.name }}</span>
            <span class="file-size">{{ formatSize(file.size) }}</span>
          </li>
        </ul>
      </div>

      <label class="label">
        备注（可选）
        <input v-model="notes" class="input" placeholder="如：含答案、模拟题" />
      </label>

      <!-- Upload progress -->
      <div v-if="uploading" class="progress glass-card">
        <span class="progress-text">正在上传 {{ completedCount }}/{{ selectedFiles.length }}...</span>
      </div>

      <button type="submit" class="btn-primary" :disabled="uploading || !selectedFiles.length">
        {{ uploading ? '上传中...' : '上传' }}
      </button>
    </form>

    <!-- Summary message -->
    <div v-if="message" :class="messageType">{{ message }}</div>

    <!-- Per-file results -->
    <ul v-if="uploadResults.length" class="results-list">
      <li
        v-for="(r, i) in uploadResults"
        :key="i"
        class="result-item glass-card"
        :class="r.success ? 'result-success' : 'result-error'"
      >
        <span class="result-icon">{{ r.success ? '✓' : '✗' }}</span>
        <div class="result-detail">
          <span class="result-name">{{ r.name }}</span>
          <span class="result-msg">{{ r.message }}</span>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { adminLoadCategories, adminUploadFile } from '@/utils/admin-api'
import type { Category } from '@/types'

interface UploadResult {
  name: string
  success: boolean
  message: string
}

const categories = ref<Category[]>([])
const categoryId = ref('')
const notes = ref('')
const fileInput = ref<HTMLInputElement>()
const selectedFiles = ref<File[]>([])
const uploading = ref(false)
const completedCount = ref(0)
const uploadResults = ref<UploadResult[]>([])
const message = ref('')
const messageType = ref('')

onMounted(async () => {
  categories.value = await adminLoadCategories()
})

function onFileChange() {
  message.value = ''
  uploadResults.value = []
  if (fileInput.value?.files && fileInput.value.files.length > 0) {
    selectedFiles.value = Array.from(fileInput.value.files)
  } else {
    selectedFiles.value = []
  }
}

function clearFiles() {
  selectedFiles.value = []
  uploadResults.value = []
  message.value = ''
  completedCount.value = 0
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

async function handleUpload() {
  if (!selectedFiles.value.length) return

  const files = [...selectedFiles.value]
  const selectedCategoryId = categoryId.value
  const selectedNotes = notes.value

  uploading.value = true
  completedCount.value = 0
  uploadResults.value = []
  message.value = ''

  let successCount = 0
  let failCount = 0

  for (const file of files) {
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('categoryId', selectedCategoryId)
      fd.append('notes', selectedNotes)
      await adminUploadFile(fd)
      uploadResults.value = [...uploadResults.value, { name: file.name, success: true, message: '上传成功' }]
      successCount++
    } catch (e) {
      const errMsg = (e as Error).message || '未知错误'
      uploadResults.value = [...uploadResults.value, { name: file.name, success: false, message: errMsg }]
      failCount++
    }
    completedCount.value++
  }

  uploading.value = false

  // Summary message
  if (failCount === 0) {
    message.value = `全部 ${successCount} 个文件上传成功！`
    messageType.value = 'success-msg'
    categoryId.value = ''
    notes.value = ''
    selectedFiles.value = []
    if (fileInput.value) fileInput.value.value = ''
  } else if (successCount === 0) {
    message.value = `全部 ${failCount} 个文件上传失败`
    messageType.value = 'error-msg'
  } else {
    message.value = `${successCount} 个成功，${failCount} 个失败`
    messageType.value = 'error-msg'
  }
}
</script>

<style scoped>
.page-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: var(--space-xl);
}

.form {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  max-width: 520px;
}

.label {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--color-text-secondary);
}

.input {
  padding: 8px 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: 0.9rem;
  font-family: inherit;
}

/* ── Glass card shared ── */
.glass-card {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
}

/* ── File list ── */
.file-list {
  padding: var(--space-md);
}

.file-list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-sm);
}

.file-list-title {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-text);
}

.btn-clear {
  font-size: 0.8rem;
  color: var(--color-danger);
  background: none;
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  transition: opacity var(--transition-fast);
}

.btn-clear:hover {
  opacity: 0.75;
}

.file-items {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  max-height: 180px;
  overflow-y: auto;
}

.file-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 10px;
  border-radius: var(--radius-sm);
  background: rgba(255, 255, 255, 0.3);
  font-size: 0.85rem;
}

.file-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--color-text);
}

.file-size {
  flex-shrink: 0;
  margin-left: var(--space-sm);
  font-size: 0.78rem;
  color: var(--color-text-muted);
}

/* ── Progress ── */
.progress {
  padding: var(--space-sm) var(--space-md);
}

.progress-text {
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--color-accent);
}

/* ── Button ── */
.btn-primary {
  padding: 10px 24px;
  background: var(--color-accent);
  color: #fff;
  border-radius: var(--radius-sm);
  font-size: 0.95rem;
  font-weight: 500;
  align-self: flex-start;
}

.btn-primary:disabled {
  opacity: 0.6;
}

/* ── Summary message ── */
.success-msg {
  margin-top: var(--space-md);
  color: #188038;
  font-size: 0.9rem;
}

.error-msg {
  margin-top: var(--space-md);
  color: var(--color-danger);
  font-size: 0.9rem;
}

/* ── Per-file results ── */
.results-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  margin-top: var(--space-md);
  max-width: 520px;
}

.result-item {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-md);
}

.result-icon {
  flex-shrink: 0;
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 0.75rem;
  font-weight: 700;
  color: #fff;
}

.result-success .result-icon {
  background: #188038;
}

.result-error .result-icon {
  background: var(--color-danger);
}

.result-detail {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.result-name {
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--color-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.result-msg {
  font-size: 0.78rem;
  color: var(--color-text-secondary);
}
</style>
