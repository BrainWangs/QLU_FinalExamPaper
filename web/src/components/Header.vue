<template>
  <header class="header" ref="headerRef" @mousemove="onHeaderGlow">
    <div class="header-glow" ref="headerGlowRef"></div>

    <div class="header-top">
      <button class="btn-contribute" @click="$emit('contribute')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M12 5v14M5 12h14" stroke-linecap="round"/>
        </svg>
        投稿
      </button>

      <div class="header-actions">
        <router-link v-if="showAdminLink" to="/admin" class="btn-admin">管理</router-link>
        <button class="btn-theme" @click="toggleTheme" :title="isDark ? '切换到浅色模式' : '切换到深色模式'">
          <svg v-if="isDark" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
          </svg>
          <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
          </svg>
        </button>
        <a
          href="https://github.com/BrainWangs/QLU_FinalExamPaper"
          target="_blank"
          rel="noopener noreferrer"
          class="btn-github"
          title="GitHub 仓库"
        >
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
          GitHub
        </a>
      </div>
    </div>

    <div class="brand-area">
      <div class="brand-icon">📚</div>
      <h1 class="brand-title">齐鲁工业大学期末试卷库</h1>
      <p class="brand-sub">免费公开的历年期末试卷资源</p>
    </div>

    <div class="stats-row">
      <div class="stat-item">
        <div class="stat-value">{{ fileCount }}</div>
        <div class="stat-label">试卷总数</div>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <div class="stat-value">{{ categoryCount }}</div>
        <div class="stat-label">学科分类</div>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <div class="stat-value">{{ totalSize }}</div>
        <div class="stat-label">资源总量</div>
      </div>
    </div>
  </header>

  <div class="search-wrap">
    <span class="search-icon">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35" stroke-linecap="round"/>
      </svg>
    </span>
    <input
      v-model="query"
      type="text"
      class="search-input"
      placeholder="搜索试卷名称..."
      @input="$emit('search', query)"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

const props = defineProps<{
  fileCount: number
  categoryCount: number
  totalSizeBytes: number
}>()

defineEmits<{
  search: [value: string]
  contribute: []
}>()

const query = ref('')
const showAdminLink = import.meta.env.DEV || import.meta.env.MODE === 'electron'
const isDark = ref(false)
const headerRef = ref<HTMLElement | null>(null)
const headerGlowRef = ref<HTMLElement | null>(null)

function applyTheme() {
  if (isDark.value) {
    document.documentElement.setAttribute('data-theme', 'dark')
  } else {
    document.documentElement.removeAttribute('data-theme')
  }
}

function toggleTheme() {
  isDark.value = !isDark.value
  applyTheme()
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
}

onMounted(() => {
  const saved = localStorage.getItem('theme')
  if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    isDark.value = true
    applyTheme()
  }
})

const totalSize = computed(() => {
  const mb = props.totalSizeBytes / (1024 * 1024)
  if (mb >= 1) return `${Math.round(mb)} MB`
  const kb = props.totalSizeBytes / 1024
  return `${Math.round(kb)} KB`
})

function onHeaderGlow(e: MouseEvent) {
  if (!headerRef.value || !headerGlowRef.value) return
  const rect = headerRef.value.getBoundingClientRect()
  headerGlowRef.value.style.left = (e.clientX - rect.left) + 'px'
  headerGlowRef.value.style.top = (e.clientY - rect.top) + 'px'
}
</script>

<style scoped>
.header {
  position: relative;
  padding: 40px 24px 0;
  margin: 24px 24px 0;
  border-radius: var(--radius-xl);
  background: linear-gradient(135deg, #1e1b4b 0%, #312e81 30%, #4338ca 60%, #4f46e5 100%);
  overflow: hidden;
}

.header::before {
  content: '';
  position: absolute; inset: 0; pointer-events: none;
  background-image:
    linear-gradient(rgba(255,255,255,.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,.04) 1px, transparent 1px);
  background-size: 40px 40px;
  mask-image: radial-gradient(ellipse at 50% 0%, black 40%, transparent 80%);
  -webkit-mask-image: radial-gradient(ellipse at 50% 0%, black 40%, transparent 80%);
}

.header-glow {
  position: absolute; pointer-events: none;
  width: 400px; height: 400px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(139,92,246,.35), transparent 70%);
  transform: translate(-50%, -50%);
  opacity: 0; z-index: 0;
  transition: opacity .3s;
}
.header:hover .header-glow { opacity: 1; }

.header-top {
  display: flex; align-items: flex-start; justify-content: space-between;
  position: relative; z-index: 1;
}

/* Buttons */
.btn-contribute, .btn-github, .btn-admin {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 10px 20px;
  font-size: .875rem; font-weight: 600;
  color: #fff;
  background: rgba(255,255,255,.1);
  border: 1px solid rgba(255,255,255,.18);
  border-radius: var(--radius-full);
  backdrop-filter: blur(8px);
  transition: all .2s var(--transition-fast);
  position: relative; overflow: hidden;
}

.btn-contribute::after, .btn-github::after, .btn-admin::after {
  content: '';
  position: absolute; inset: 0;
  background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,.15) 45%, rgba(255,255,255,.25) 50%, rgba(255,255,255,.15) 55%, transparent 60%);
  transform: translateX(-100%);
  transition: transform .6s;
}
.btn-contribute:hover::after, .btn-github:hover::after, .btn-admin:hover::after {
  transform: translateX(100%);
}

.btn-contribute:hover, .btn-github:hover, .btn-admin:hover {
  background: rgba(255,255,255,.2);
  border-color: rgba(255,255,255,.35);
  transform: translateY(-1px);
}
.btn-contribute:hover { box-shadow: 0 4px 16px rgba(99,102,241,.3); }
.btn-github:hover, .btn-admin:hover { box-shadow: 0 4px 16px rgba(0,0,0,.2); }
.btn-contribute svg, .btn-github svg, .btn-theme svg { width: 16px; height: 16px; position: relative; z-index: 1; }

.btn-theme {
  display: inline-flex; align-items: center; justify-content: center;
  width: 40px; height: 40px; padding: 0;
  color: #fff;
  background: rgba(255,255,255,.1);
  border: 1px solid rgba(255,255,255,.18);
  border-radius: 50%;
  backdrop-filter: blur(8px);
  transition: all .2s var(--transition-fast);
  position: relative; overflow: hidden;
}
.btn-theme::after {
  content: '';
  position: absolute; inset: 0;
  background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,.15) 45%, rgba(255,255,255,.25) 50%, rgba(255,255,255,.15) 55%, transparent 60%);
  transform: translateX(-100%);
  transition: transform .6s;
}
.btn-theme:hover::after { transform: translateX(100%); }
.btn-theme:hover {
  background: rgba(255,255,255,.2);
  border-color: rgba(255,255,255,.35);
  transform: rotate(15deg);
}

.header-actions { display: flex; align-items: center; gap: 8px; position: relative; z-index: 1; }

/* Brand */
.brand-area { text-align: center; padding: 32px 0 28px; position: relative; z-index: 1; }

.brand-icon {
  display: inline-flex; align-items: center; justify-content: center;
  width: 56px; height: 56px; border-radius: var(--radius-lg);
  background: linear-gradient(135deg, rgba(255,255,255,.12), rgba(255,255,255,.04));
  border: 1px solid rgba(255,255,255,.12);
  margin-bottom: 16px;
  font-size: 1.6rem;
  backdrop-filter: blur(8px);
  transition: transform .3s var(--transition-spring);
}
.brand-icon:hover { transform: scale(1.1) rotate(-5deg); }

.brand-title {
  font-size: 2rem; font-weight: 900; letter-spacing: -.02em; color: #fff;
}

.brand-sub {
  font-size: .88rem; font-weight: 500; color: rgba(255,255,255,.6); margin-top: 4px;
}

/* Stats */
.stats-row {
  display: flex; justify-content: center; gap: 40px;
  padding: 0 0 36px; position: relative; z-index: 1;
}
.stat-item { text-align: center; transition: transform .2s var(--transition-fast); }
.stat-item:hover { transform: translateY(-2px); }
.stat-value {
  font-size: 1.75rem; font-weight: 800; color: #fff; letter-spacing: -.02em;
  transition: color .2s;
}
.stat-item:hover .stat-value { color: #c7d2fe; }
.stat-label { font-size: .73rem; font-weight: 500; color: rgba(255,255,255,.5); margin-top: 2px; }
.stat-divider { width: 1px; background: rgba(255,255,255,.12); align-self: stretch; }

/* Search */
.search-wrap {
  position: relative; z-index: 2;
  max-width: 520px; margin: -20px auto 0;
  padding: 0 24px;
}
.search-input {
  width: 100%;
  padding: 14px 20px 14px 48px;
  font-size: .95rem; font-family: inherit; color: var(--color-text);
  background: var(--color-surface);
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-lg);
  outline: none;
  box-shadow: var(--shadow-lg);
  transition: all .25s var(--transition-fast);
}
.search-input::placeholder { color: var(--color-text-muted); }
.search-input:focus {
  border-color: #818cf8;
  box-shadow: 0 0 0 4px rgba(99,102,241,.12), 0 8px 32px rgba(0,0,0,.08);
}
.search-icon {
  position: absolute; left: 42px; top: 50%; transform: translateY(-50%);
  display: flex; align-items: center; pointer-events: none; color: var(--color-text-muted);
  transition: color .2s;
}
.search-input:focus ~ .search-icon,
.search-wrap:focus-within .search-icon { color: #818cf8; }

/* ── Tablet ── */
@media (min-width: 641px) and (max-width: 1024px) {
  .brand-title { font-size: 1.5rem; }
}

/* ── Mobile ── */
@media (max-width: 640px) {
  .header {
    margin: 12px 12px 0; padding: 24px 16px 0; border-radius: var(--radius-lg);
  }
  .header-top { flex-wrap: wrap; gap: 8px; }
  .brand-title { font-size: 1.35rem; }
  .brand-area { padding: 24px 0 20px; }
  .brand-icon { width: 42px; height: 42px; font-size: 1.3rem; }
  .stats-row { gap: 20px; padding-bottom: 24px; }
  .stat-value { font-size: 1.35rem; }

  .btn-contribute, .btn-github, .btn-admin {
    font-size: .8rem; padding: 6px 14px;
  }

  .search-wrap { margin: -16px 12px 0; padding: 0; }
  .search-input { padding: 12px 16px 12px 42px; font-size: .88rem; }
  .search-icon { left: 14px; }
}
</style>
