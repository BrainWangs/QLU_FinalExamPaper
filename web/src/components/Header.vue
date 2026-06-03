<template>
  <header class="header">
    <div class="header-top">
      <button class="contribute-btn" @click="$emit('contribute')">投稿</button>
      <div class="header-inner">
        <div class="brand">
          <span class="brand-icon"></span>
          <h1 class="brand-title">齐鲁工业大学期末试卷库</h1>
        </div>
        <p class="brand-sub">免费公开的历年期末试卷资源</p>
      </div>
      <div class="header-actions">
        <router-link v-if="isDev" to="/admin" class="action-link admin-link">管理</router-link>
        <a
          href="https://github.com/BrainWangs/QLU_FinalExamPaper"
          target="_blank"
          rel="noopener noreferrer"
          class="action-link github-link"
          title="GitHub 仓库"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
          GitHub
        </a>
      </div>
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
const isDev = import.meta.env.DEV

defineEmits<{
  search: [value: string]
  contribute: []
}>()
</script>

<style scoped>
.header {
  padding: var(--space-xl) var(--space-lg) var(--space-lg);
}

.header-top {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  position: relative;
  margin-bottom: var(--space-lg);
}

.contribute-btn {
  position: absolute; left: 0; top: 0;
  padding: 8px 18px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  font-size: 0.9rem; font-weight: 700; color: var(--color-text);
  cursor: pointer;
  transition: all var(--transition-fast);
}
.contribute-btn:hover { background: rgba(50, 130, 184, 0.12); }

.header-inner { text-align: center; }

.brand {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
}

.brand-icon { font-size: 2rem; }

.brand-title {
  font-size: 1.5rem;
  font-weight: 900;
  color: var(--color-text);
  letter-spacing: -0.02em;
}

.brand-sub {
  margin-top: var(--space-xs);
  font-size: 0.9rem;
  color: var(--color-text-secondary);
}

.header-actions {
  position: absolute;
  right: 0;
  top: 0;
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.action-link {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: var(--radius-sm);
  font-size: 0.85rem;
  font-weight: 700;
  transition: background var(--transition-fast);
}

.admin-link {
  color: var(--color-accent);
  background: var(--color-accent-light);
}

.admin-link:hover { background: #d2e3fc; }

.github-link {
  color: var(--color-text);
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border: 1px solid var(--glass-border);
}

.github-link:hover { background: rgba(50, 130, 184, 0.1); }

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
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
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
