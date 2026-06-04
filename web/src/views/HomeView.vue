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
            :key="activeCategory + searchQuery"
            :files="filteredFiles"
            :get-category-name="getCategoryName"
            @preview="openPreview"
          />
        </Transition>
      </main>
    </div>
    <PdfPreviewModal
      :visible="previewVisible"
      :url="previewFile?.path ?? ''"
      :filename="previewFile?.filename ?? ''"
      @close="previewVisible = false"
    />
    <ContributeModal :visible="showContribute" @close="showContribute = false" />
    <footer class="app-footer">
      <img
        src="https://hits.seeyoufarm.com/api/count/incr/badge.svg?url=https%3A%2F%2Fbrainwangs.github.io%2FQLU_FinalExamPaper&count_bg=%233282b8&title_bg=%230f4c75&title=Visitors&edge_flat=false"
        alt="visitor count"
        class="visitor-badge"
      />
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
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

function onSearch(query: string) {
  searchQuery.value = query
}

function openPreview(file: FileEntry) {
  previewFile.value = file
  previewVisible.value = true
}

onMounted(async () => {
  categories.value = await loadCategories()
  files.value = await loadFiles()
})
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

.app-footer {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: var(--space-md);
  margin-top: auto;
}

.visitor-badge {
  height: 20px;
  opacity: 0.7;
  transition: opacity var(--duration-fast);
}

.visitor-badge:hover {
  opacity: 1;
}
</style>
