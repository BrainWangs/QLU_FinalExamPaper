<template>
  <header class="header">
    <div class="header-inner">
      <div class="brand">
        <span class="brand-icon">🏫</span>
        <h1 class="brand-title">齐鲁工业大学期末试卷库</h1>
      </div>
      <p class="brand-sub">免费公开的历年期末试卷资源</p>
    </div>
    <div class="search-wrap">
      <span class="search-icon">🔍</span>
      <input
        v-model="query"
        type="text"
        class="search-input"
        placeholder="搜索试卷名称..."
        @input="$emit('search', query)"
      />
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const query = ref('')

defineEmits<{
  search: [value: string]
}>()
</script>

<style scoped>
.header {
  padding: var(--space-xl) var(--space-lg) var(--space-lg);
  text-align: center;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-bg);
}

.header-inner { margin-bottom: var(--space-lg); }

.brand {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
}

.brand-icon { font-size: 2rem; }

.brand-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-text);
  letter-spacing: -0.02em;
}

.brand-sub {
  margin-top: var(--space-xs);
  font-size: 0.9rem;
  color: var(--color-text-secondary);
}

.search-wrap {
  position: relative;
  max-width: 480px;
  margin: 0 auto;
}

.search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1rem;
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 12px 16px 12px 42px;
  font-size: 0.95rem;
  font-family: inherit;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  color: var(--color-text);
  outline: none;
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.search-input::placeholder { color: var(--color-text-muted); }

.search-input:focus {
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px var(--color-accent-light);
}
</style>
