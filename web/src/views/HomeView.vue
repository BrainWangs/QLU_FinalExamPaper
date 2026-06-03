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
        <FileGrid
          :files="filteredFiles"
          :get-category-name="getCategoryName"
          @preview="openPreview"
        />
      </main>
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
</style>
