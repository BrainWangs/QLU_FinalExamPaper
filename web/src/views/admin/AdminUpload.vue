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
        <input type="file" ref="fileInput" class="input" @change="onFileChange" required />
      </label>
      <label class="label">
        备注（可选）
        <input v-model="notes" class="input" placeholder="如：含答案、模拟题" />
      </label>
      <button type="submit" class="btn-primary" :disabled="uploading">
        {{ uploading ? '上传中...' : '上传' }}
      </button>
    </form>
    <div v-if="message" :class="messageType">{{ message }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { adminLoadCategories, adminUploadFile } from '@/utils/admin-api'
import type { Category } from '@/types'

const categories = ref<Category[]>([])
const categoryId = ref('')
const notes = ref('')
const fileInput = ref<HTMLInputElement>()
const uploading = ref(false)
const message = ref('')
const messageType = ref('')

onMounted(async () => { categories.value = await adminLoadCategories() })

function onFileChange() { message.value = '' }

async function handleUpload() {
  if (!fileInput.value?.files?.length) return
  const file = fileInput.value.files[0]
  uploading.value = true; message.value = ''
  try {
    const fd = new FormData()
    fd.append('file', file)
    fd.append('categoryId', categoryId.value)
    fd.append('notes', notes.value)
    await adminUploadFile(fd)
    message.value = `文件 "${file.name}" 上传成功！`
    messageType.value = 'success-msg'
    categoryId.value = ''; notes.value = ''; fileInput.value.value = ''
  } catch (e) {
    message.value = `上传失败：${(e as Error).message}`
    messageType.value = 'error-msg'
  } finally {
    uploading.value = false
  }
}
</script>

<style scoped>
.page-title { font-size: 1.5rem; font-weight: 700; margin-bottom: var(--space-xl); }
.form { display: flex; flex-direction: column; gap: var(--space-md); max-width: 480px; }
.label { display: flex; flex-direction: column; gap: var(--space-xs); font-size: 0.9rem; font-weight: 500; color: var(--color-text-secondary); }
.input { padding: 8px 12px; border: 1px solid var(--color-border); border-radius: var(--radius-sm); font-size: 0.9rem; font-family: inherit; }
.btn-primary { padding: 10px 24px; background: var(--color-accent); color: #fff; border-radius: var(--radius-sm); font-size: 0.95rem; font-weight: 500; align-self: flex-start; }
.btn-primary:disabled { opacity: 0.6; }
.success-msg { margin-top: var(--space-md); color: #188038; font-size: 0.9rem; }
.error-msg { margin-top: var(--space-md); color: var(--color-danger); font-size: 0.9rem; }
</style>
