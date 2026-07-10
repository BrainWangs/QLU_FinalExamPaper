<template>
  <div class="app-layout">
    <Header
      :file-count="files.length"
      :category-count="categories.length"
      :total-size-bytes="totalSizeBytes"
      @search="onSearch"
      @contribute="showContribute = true"
    />
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
    <nav v-if="totalPages > 1" class="pagination">
      <button class="page-btn" :disabled="page <= 1" @click="page--">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M15 18l-6-6 6-6" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
      <button
        v-for="p in totalPages"
        :key="p"
        :class="['page-btn', { current: p === page }]"
        @click="page = p"
      >{{ p }}</button>
      <button class="page-btn" :disabled="page >= totalPages" @click="page++">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 18l6-6-6-6" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
    </nav>
    <footer class="site-footer">
      试卷资源由社区贡献 · <a href="https://github.com/BrainWangs/QLU_FinalExamPaper" target="_blank" rel="noopener noreferrer">GitHub</a> 开源 · 仅供学习参考
    </footer>
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

const totalSizeBytes = computed(() => files.value.reduce((sum, f) => sum + f.size, 0))

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
  max-width: 1280px;
  margin: 0 auto;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-area {
  display: flex;
  flex: 1;
  padding: 32px 24px 0;
  gap: 24px;
}

.content {
  flex: 1;
  padding-bottom: 48px;
}

/* Pagination */
.pagination {
  display: flex; align-items: center; justify-content: center; gap: 6px;
  padding: 24px;
}
.page-btn {
  min-width: 40px; height: 40px;
  display: flex; align-items: center; justify-content: center;
  padding: 0 10px;
  font-size: .85rem; font-weight: 600;
  color: var(--color-text-secondary);
  background: var(--color-surface);
  border: 1.5px solid var(--color-border-light);
  border-radius: var(--radius-md);
  transition: all .2s var(--transition-fast);
  position: relative; overflow: hidden;
}
.page-btn svg { width: 16px; height: 16px; }
.page-btn:hover:not(:disabled) {
  border-color: var(--color-accent-border); color: var(--color-accent); background: var(--color-accent-subtle);
}
.page-btn:disabled { opacity: .25; cursor: default; }
.page-btn.current {
  background: linear-gradient(135deg, var(--color-accent), var(--color-accent-end));
  color: #fff; border-color: transparent;
  box-shadow: 0 4px 12px rgba(99,102,241,.35);
}

/* Footer */
.site-footer {
  text-align: center;
  padding: 20px 24px 40px;
  font-size: .76rem; color: var(--color-text-muted);
}
.site-footer a { font-weight: 600; color: var(--color-accent); }
.site-footer a:hover { text-decoration: underline; }

/* ── Mobile ── */
@media (max-width: 640px) {
  .main-area { flex-direction: column; padding: 24px 12px 0; gap: 16px; }
  .pagination { padding: 16px; flex-wrap: wrap; }
}

/* ── Tablet ── */
@media (min-width: 641px) and (max-width: 1024px) {
  .content { padding: 0; }
}
</style>
