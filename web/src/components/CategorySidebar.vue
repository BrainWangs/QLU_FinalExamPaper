<template>
  <aside class="sidebar">
    <div class="sidebar-header">
      <span class="sidebar-title">学科分类</span>
    </div>
    <ul ref="categoryListRef" class="category-list" @click="onCategoryClick">
      <li
        ref="allPillRef"
        :class="['category-item', { active: active === 'all' }]"
        data-id="all"
      >
        <span class="cat-dot all"></span>
        <span class="cat-name">全部</span>
        <span class="category-count">{{ totalCount }}</span>
      </li>
      <li
        v-for="(cat, idx) in categories"
        :key="cat.id"
        :ref="(el: unknown) => setPillRef(idx, el as HTMLElement | null)"
        :class="['category-item', { active: active === cat.id, 'overflow-hidden': isOverflow(idx) }]"
        :data-id="cat.id"
      >
        <span :class="['cat-dot', getCatSlug(cat.name)]"></span>
        <span class="cat-name">{{ cat.name }}</span>
        <span class="category-count">{{ cat.count }}</span>
      </li>
      <li
        ref="overflowBtnRef"
        :class="['category-item', 'overflow-btn', { 'overflow-hidden': overflowCount === 0 }]"
        @click.stop="onOverflowClick"
      >
        +{{ overflowCount }}
      </li>
    </ul>

    <Teleport to="body">
      <Transition name="popover">
        <div v-if="showPopover" class="popover-overlay" @click.self="showPopover = false">
          <div class="popover">
            <ul class="popover-list">
              <li
                :class="['popover-item', { active: active === 'all' }]"
                @click="selectCat('all')"
              >
                <span>全部</span>
                <span class="count">{{ totalCount }}</span>
              </li>
              <li
                v-for="cat in categories"
                :key="cat.id"
                :class="['popover-item', { active: active === cat.id }]"
                @click="selectCat(cat.id)"
              >
                <span>{{ cat.name }}</span>
                <span class="count">{{ cat.count }}</span>
              </li>
            </ul>
          </div>
        </div>
      </Transition>
    </Teleport>
  </aside>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'

const props = defineProps<{
  categories: { id: string; name: string; count: number }[]
  active: string
  totalCount: number
}>()

const emit = defineEmits<{ select: [id: string] }>()

const showPopover = ref(false)
const categoryListRef = ref<HTMLElement | null>(null)
const allPillRef = ref<HTMLElement | null>(null)
const overflowBtnRef = ref<HTMLElement | null>(null)
const pillRefs = ref<(HTMLElement | null)[]>([])
const visibleCount = ref(props.categories.length)
const overflowCount = computed(() => Math.max(0, props.categories.length - visibleCount.value))

function getCatSlug(name: string): string {
  const map: Record<string, string> = {
    '高等数学': 'math', '线性代数': 'algebra', '大学物理': 'physics',
    '数据结构': 'ds', '操作系统': 'os', '计算机网络': 'network',
  }
  return map[name] ?? 'math'
}

function setPillRef(idx: number, el: HTMLElement | null): void {
  pillRefs.value[idx] = el
}

function isOverflow(idx: number): boolean {
  return overflowCount.value > 0 && idx >= visibleCount.value
}

function selectCat(id: string): void {
  showPopover.value = false
  emit('select', id)
}

function onOverflowClick(): void {
  if (overflowCount.value > 0) showPopover.value = !showPopover.value
}

// Click handler: ripple animation + emit select
function onCategoryClick(e: MouseEvent) {
  const item = (e.target as HTMLElement).closest('.category-item:not(.overflow-btn)') as HTMLElement | null
  if (!item) return

  const id = item.dataset.id
  if (!id) return

  // Emit selection
  emit('select', id)

  // Ripple (viewport-relative to avoid container sizing issues)
  const ripple = document.createElement('span')
  ripple.className = 'cat-ripple'
  const size = Math.max(item.offsetWidth, item.offsetHeight)
  ripple.style.width = ripple.style.height = size + 'px'
  ripple.style.left = (e.clientX - size / 2) + 'px'
  ripple.style.top = (e.clientY - size / 2) + 'px'
  document.body.appendChild(ripple)
  ripple.addEventListener('animationend', () => ripple.remove())
}

// Overflow measurement (mobile)
const PILL_GAP = 6
const OVERFLOW_BTN_MIN_WIDTH = 52

function recalc(): void {
  if (window.innerWidth > 640) {
    visibleCount.value = props.categories.length
    return
  }
  const container = categoryListRef.value
  if (!container) return
  const containerWidth = container.clientWidth
  const allWidth = allPillRef.value?.offsetWidth ?? 0
  const widths = pillRefs.value.slice(0, props.categories.length).map(el => el?.offsetWidth ?? 0)
  if (widths.length === 0 || allWidth === 0) return
  if (widths.some(w => w === 0)) return

  const btnWidth = overflowBtnRef.value?.offsetWidth ?? OVERFLOW_BTN_MIN_WIDTH
  let used = allWidth
  let count = 0
  for (let i = 0; i < widths.length; i++) {
    const next = used + PILL_GAP + widths[i]
    const remaining = widths.length - i - 1
    if (remaining > 0) {
      if (next + PILL_GAP + btnWidth <= containerWidth) { used = next; count++ }
      else break
    } else {
      if (next <= containerWidth) count++
    }
  }
  visibleCount.value = count
}

let resizeObserver: ResizeObserver | null = null
function setupObserver(): void {
  if (resizeObserver) resizeObserver.disconnect()
  resizeObserver = new ResizeObserver(() => recalc())
  if (categoryListRef.value) resizeObserver.observe(categoryListRef.value)
}

onMounted(() => {
  nextTick(() => { recalc(); setupObserver() })
})

watch(() => props.categories, () => {
  visibleCount.value = props.categories.length
  nextTick(() => recalc())
})

onUnmounted(() => {
  resizeObserver?.disconnect()
  resizeObserver = null
})
</script>

<style scoped>
.sidebar {
  width: var(--sidebar-width); flex-shrink: 0;
  position: sticky; top: 24px; align-self: flex-start;
  padding: 20px;
  background: var(--color-surface);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-sm);
  max-height: calc(100vh - 48px);
  overflow-y: auto;
}

.sidebar-header { padding-bottom: 14px; margin-bottom: 14px; border-bottom: 1px solid var(--color-border-light); }

.sidebar-title {
  font-size: .68rem; font-weight: 700; text-transform: uppercase; letter-spacing: .1em;
  color: var(--color-text-muted);
}

.category-list { display: flex; flex-direction: column; gap: 4px; }

.category-item {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 12px; border-radius: var(--radius-md);
  cursor: pointer;
  font-size: .875rem; font-weight: 500; color: var(--color-text-secondary);
  transition: all .2s var(--transition-fast);
  position: relative; overflow: hidden;
}
.category-item:hover { background: #f8fafc; color: var(--color-text); }

.category-item.active { background: var(--color-accent-subtle); color: #4338ca; font-weight: 600; }

.cat-dot {
  width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0;
  transition: all .25s var(--transition-fast);
}
.cat-dot.all     { background: var(--cat-math); }
.cat-dot.math    { background: var(--cat-math); }
.cat-dot.algebra { background: var(--cat-algebra); }
.cat-dot.physics { background: var(--cat-physics); }
.cat-dot.ds      { background: var(--cat-ds); }
.cat-dot.os      { background: var(--cat-os); }
.cat-dot.network { background: var(--cat-network); }

.category-item.active .cat-dot {
  width: 10px; height: 10px;
  box-shadow: 0 0 0 4px rgba(99,102,241,.2);
}

.cat-name { flex: 1; }

.category-count {
  font-size: .72rem; font-weight: 600;
  color: var(--color-text-muted);
  background: #f1f5f9;
  padding: 2px 8px; border-radius: var(--radius-full);
  min-width: 26px; text-align: center;
  transition: all .2s;
}
.category-item.active .category-count { background: var(--color-accent); color: #fff; }

/* Ripple (viewport-fixed so it never affects layout) */
.cat-ripple {
  position: fixed; border-radius: 50%; z-index: 300;
  background: rgba(99,102,241,.2);
  transform: scale(0); animation: ripple .6s cubic-bezier(0,0,.2,1);
  pointer-events: none;
}
@keyframes ripple { to { transform: scale(4); opacity: 0; } }

/* Overflow */
.overflow-hidden { visibility: hidden; position: absolute; pointer-events: none; transition: none; }

.overflow-btn {
  min-width: 48px; justify-content: center;
  background: rgba(99,102,241,.08); color: var(--color-accent);
  border: 1px solid rgba(99,102,241,.2);
}
.overflow-btn:hover { background: rgba(99,102,241,.15); }

/* ── Mobile ── */
@media (max-width: 640px) {
  .sidebar {
    width: 100%; position: static;
    padding: 14px; border-radius: var(--radius-lg);
  }
  .sidebar-title { font-size: .65rem; }
  .sidebar-header { padding-bottom: 10px; margin-bottom: 10px; }

  .category-list {
    flex-direction: row; flex-wrap: nowrap; overflow-x: auto; overflow-y: hidden;
    gap: 8px; padding-bottom: 4px;
  }
  .category-item {
    flex-shrink: 0; white-space: nowrap;
    font-size: .8rem; padding: 8px 14px;
    border: 1px solid var(--color-border-light); border-radius: var(--radius-full);
    background: var(--color-surface); gap: 6px;
  }
  .category-item.active {
    background: var(--color-accent); color: #fff; border-color: var(--color-accent);
  }
  .category-item.active .cat-dot { background: #fff; box-shadow: none; width: 6px; height: 6px; }
  .category-item.active .category-count { background: rgba(255,255,255,.25); color: #fff; }
  .cat-dot { width: 6px; height: 6px; }

  .overflow-btn {
    background: var(--color-accent); color: #fff; border-color: var(--color-accent);
    font-weight: 800; min-width: 44px;
  }
  .overflow-btn:hover { background: #4f46e5; }
}

/* ── Tablet ── */
@media (min-width: 641px) and (max-width: 1024px) {
  .sidebar { padding: 16px; }
  .category-item { padding: 8px 10px; font-size: .82rem; }
}
</style>
