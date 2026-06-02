<template>
  <div class="categories-page">
    <h2 class="page-title">学科管理</h2>
    <form class="form" @submit.prevent="handleSubmit">
      <input v-model="form.name" class="input" placeholder="学科名称" required />
      <input v-model="form.description" class="input" placeholder="描述（可选）" />
      <button type="submit" class="btn-primary">{{ editing ? '保存' : '添加' }}</button>
      <button v-if="editing" type="button" class="btn-cancel" @click="resetForm">取消</button>
    </form>
    <div v-if="error" class="error-msg">{{ error }}</div>
    <ul class="cat-list">
      <li v-for="cat in categories" :key="cat.id" class="cat-item">
        <div>
          <strong>{{ cat.name }}</strong>
          <span v-if="cat.description" class="cat-desc">{{ cat.description }}</span>
        </div>
        <div class="cat-actions">
          <button class="btn-sm" @click="editCat(cat)">编辑</button>
          <button class="btn-sm btn-danger" @click="deleteCat(cat.id)">删除</button>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { adminLoadCategories, adminSaveCategories } from '@/utils/admin-api'
import type { Category } from '@/types'

const categories = ref<Category[]>([])
const editing = ref(false)
const editingId = ref('')
const error = ref('')
const form = ref({ name: '', description: '' })

onMounted(async () => { categories.value = await adminLoadCategories() })

function resetForm() {
  form.value = { name: '', description: '' }
  editing.value = false; editingId.value = ''; error.value = ''
}

function editCat(cat: Category) {
  form.value = { name: cat.name, description: cat.description ?? '' }
  editing.value = true; editingId.value = cat.id
}

async function handleSubmit() {
  error.value = ''
  if (editing.value) {
    const idx = categories.value.findIndex((c) => c.id === editingId.value)
    if (idx !== -1) {
      categories.value[idx] = {
        ...categories.value[idx],
        name: form.value.name,
        description: form.value.description || undefined,
      }
    }
  } else {
    categories.value.push({
      id: `cat-${Date.now()}`,
      name: form.value.name,
      description: form.value.description || undefined,
      createdAt: new Date().toISOString(),
    })
  }
  await adminSaveCategories(categories.value)
  resetForm()
}

async function deleteCat(id: string) {
  if (!confirm('确定删除该学科？只能删除没有文件归属的学科。')) return
  categories.value = categories.value.filter((c) => c.id !== id)
  await adminSaveCategories(categories.value)
}
</script>

<style scoped>
.page-title { font-size: 1.5rem; font-weight: 700; margin-bottom: var(--space-lg); }
.form { display: flex; gap: var(--space-sm); margin-bottom: var(--space-lg); flex-wrap: wrap; }
.input { padding: 8px 12px; border: 1px solid var(--color-border); border-radius: var(--radius-sm); font-size: 0.9rem; font-family: inherit; flex: 1; min-width: 150px; }
.btn-primary { padding: 8px 16px; background: var(--color-accent); color: #fff; border-radius: var(--radius-sm); font-size: 0.9rem; font-weight: 500; }
.btn-cancel { padding: 8px 16px; background: var(--color-surface); color: var(--color-text); border-radius: var(--radius-sm); font-size: 0.9rem; }
.error-msg { color: var(--color-danger); margin-bottom: var(--space-md); font-size: 0.9rem; }
.cat-list { list-style: none; display: flex; flex-direction: column; gap: var(--space-sm); }
.cat-item {
  display: flex; align-items: center; justify-content: space-between;
  background: var(--color-card); border: 1px solid var(--color-border);
  border-radius: var(--radius-sm); padding: 12px var(--space-md);
}
.cat-desc { display: block; font-size: 0.8rem; color: var(--color-text-muted); margin-top: 2px; }
.cat-actions { display: flex; gap: var(--space-xs); }
.btn-sm { padding: 4px 12px; border-radius: var(--radius-sm); font-size: 0.8rem; background: var(--color-surface); color: var(--color-text); }
.btn-sm:hover { background: var(--color-border); }
.btn-danger { color: var(--color-danger); }
.btn-danger:hover { background: #fce8e6; }
</style>
