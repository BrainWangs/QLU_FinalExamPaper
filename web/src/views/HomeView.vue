<template>
  <div class="app-layout">
    <Header @search="onSearch" @contribute="showContribute = true" />
    <div class="main-area">
      <CategorySidebar
        :categories="categoryDisplayStats"
        :active="activeCategory"
        :total-count="filteredFiles.length"
        @select="activeCategory = $event"
      />
      <main class="content">
        <Transition name="content-swap" mode="out-in">
          <FileGrid
            :key="activeCategory + searchQuery + page"
            :files="pagedFiles"
            :get-category-name="getCategoryName"
            @preview="openPreview"
          />
        </Transition>
      </main>
    </div>
    <div v-if="totalPages > 1" class="pagination">
      <button :disabled="page <= 1" @click="page--">上一页</button>
      <span class="page-info">{{ page }} / {{ totalPages }}</span>
      <button :disabled="page >= totalPages" @click="page++">下一页</button>
    </div>
    <PdfPreviewModal
      :visible="previewVisible"
      :url="previewFile?.path ?? ''"
      :filename="previewFile?.filename ?? ''"
      @close="previewVisible = false"
    />
    <ContributeModal :visible="showContribute" @close="showContribute = false" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import Header from '@/components/Header.vue'
import CategorySidebar from '@/components/CategorySidebar.vue'
import FileGrid from '@/components/FileGrid.vue'
import PdfPreviewModal from '@/components/PdfPreviewModal.vue'
import ContributeModal from '@/components/ContributeModal.vue'
import { useFileFilter } from '@/composables/useFileFilter'
import { loadCategories, loadFiles } from '@/utils/data'
import type { FileEntry, Category } from '@/types'

const categories = ref<Category[]>([])
const files = ref<FileEntry[]>([])

const {
  searchQuery,
  activeCategory,
  categoryDisplayStats,
  filteredFiles,
  getCategoryName,
} = useFileFilter(() => files.value, () => categories.value)

const previewVisible = ref(false)
const previewFile = ref<FileEntry | null>(null)
const showContribute = ref(false)
const page = ref(1)
const windowWidth = ref(window.innerWidth)

function onResize() { windowWidth.value = window.innerWidth }

const colsPerRow = computed(() => {
  if (windowWidth.value <= 640) return 1
  if (windowWidth.value <= 1024) return 2
  return 3
})

const perPage = computed(() => colsPerRow.value * 4)
const totalPages = computed(() => Math.ceil(filteredFiles.value.length / perPage.value) || 1)

const pagedFiles = computed(() => {
  const start = (page.value - 1) * perPage.value
  return filteredFiles.value.slice(start, start + perPage.value)
})

function onSearch(query: string) {
  searchQuery.value = query
  page.value = 1
}

function openPreview(file: FileEntry) {
  previewFile.value = file
  previewVisible.value = true
}

watch(activeCategory, () => { page.value = 1 })

onMounted(async () => {
  categories.value = await loadCategories()
  files.value = await loadFiles()
  window.addEventListener('resize', onResize)
})

onUnmounted(() => window.removeEventListener('resize', onResize))
</script>

<style scoped>
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-area {
  display: flex;
  flex: 1;
}

.content {
  flex: 1;
  padding: var(--space-lg);
  overflow-y: auto;
}

/* ── Mobile (< 641px) ── */
@media (max-width: 640px) {
  .main-area {
    flex-direction: column;
  }

  .content {
    padding: var(--space-md);
  }
}

.pagination {
  display: flex; align-items: center; justify-content: center;
  gap: var(--space-md); padding: var(--space-md) var(--space-lg);
}

.pagination button {
  padding: 8px 20px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: var(--glass-blur); -webkit-backdrop-filter: var(--glass-blur);
  border: 1px solid var(--glass-border); border-radius: var(--radius-lg);
  font-size: 0.85rem; font-weight: 700; color: var(--color-text);
  transition: all var(--transition-fast);
}

.pagination button:hover:not(:disabled) { background: var(--color-accent); color: #fff; border-color: var(--color-accent); }
.pagination button:disabled { opacity: 0.35; cursor: default; }

.page-info { font-size: 0.85rem; font-weight: 700; color: var(--color-text-secondary); }

/* ── Tablet (641px - 1024px) ── */
@media (min-width: 641px) and (max-width: 1024px) {
  .content {
    padding: var(--space-md);
  }
}
</style>
