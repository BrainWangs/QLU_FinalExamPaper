<template>
  <aside class="sidebar">
    <div class="sidebar-header">
      <h2 class="sidebar-title">学科分类</h2>
    </div>
    <ul ref="categoryListRef" class="category-list">
      <!-- 全部 - always visible (never overflows) -->
      <li
        ref="allPillRef"
        :class="['category-item', { active: active === 'all' }]"
        @click="$emit('select', 'all')"
      >
        <span class="category-name">全部</span>
        <span class="category-count">{{ totalCount }}</span>
      </li>
      <!-- Regular category pills -->
      <li
        v-for="(cat, idx) in categories"
        :key="cat.id"
        :ref="(el: unknown) => setPillRef(idx, el as HTMLElement | null)"
        :class="['category-item', { active: active === cat.id, 'overflow-hidden': isOverflow(idx) }]"
        @click="$emit('select', cat.id)"
      >
        <span class="category-name">{{ cat.name }}</span>
        <span class="category-count">{{ cat.count }}</span>
      </li>
      <!-- "+N" overflow button (always in DOM for measurement, hidden when no overflow) -->
      <li
        ref="overflowBtnRef"
        :class="['category-item', 'overflow-btn', { 'overflow-hidden': overflowCount === 0 }]"
        @click="onOverflowClick"
      >
        +{{ overflowCount }}
      </li>
    </ul>

    <!-- Popover with hidden categories (teleported to body) -->
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

const emit = defineEmits<{
  select: [id: string]
}>()

const showPopover = ref(false)

// ---- Overflow state (mobile only) ----
const categoryListRef = ref<HTMLElement | null>(null)
const allPillRef = ref<HTMLElement | null>(null)
const overflowBtnRef = ref<HTMLElement | null>(null)
const pillRefs = ref<(HTMLElement | null)[]>([])

// How many regular categories are visible in the pill row
const visibleCount = ref(props.categories.length)

const overflowCount = computed(() =>
  Math.max(0, props.categories.length - visibleCount.value),
)

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
  if (overflowCount.value > 0) {
    showPopover.value = !showPopover.value
  }
}

// ---- Measurement & overflow calculation (mobile only) ----
const PILL_GAP = 6 // --space-sm on mobile resolves to 6px
const OVERFLOW_BTN_MIN_WIDTH = 52

function recalc(): void {
  // Only apply overflow logic on mobile viewports
  if (window.innerWidth > 640) {
    visibleCount.value = props.categories.length
    return
  }

  const container = categoryListRef.value
  if (!container) return

  const containerWidth = container.clientWidth
  const allWidth = allPillRef.value?.offsetWidth ?? 0
  // Slice to current category count — stale refs from a previous longer list linger as nulls
  const widths = pillRefs.value
    .slice(0, props.categories.length)
    .map((el) => el?.offsetWidth ?? 0)

  if (widths.length === 0 || allWidth === 0) return
  // If any pill width is 0 the refs aren't fully populated yet
  if (widths.some((w) => w === 0)) return

  // Use actual button width for accurate measurement, fallback to conservative estimate
  const btnWidth =
    overflowBtnRef.value?.offsetWidth ?? OVERFLOW_BTN_MIN_WIDTH

  let used = allWidth
  let count = 0

  for (let i = 0; i < widths.length; i++) {
    const next = used + PILL_GAP + widths[i]
    const remaining = widths.length - i - 1

    if (remaining > 0) {
      // There are more pills after this one — must reserve room for "+N"
      if (next + PILL_GAP + btnWidth <= containerWidth) {
        used = next
        count++
      } else {
        break
      }
    } else {
      // Last category — no "+N" needed if it fits alone
      if (next <= containerWidth) {
        count++
      }
    }
  }

  visibleCount.value = count
}

let resizeObserver: ResizeObserver | null = null

function setupObserver(): void {
  if (resizeObserver) {
    resizeObserver.disconnect()
  }
  resizeObserver = new ResizeObserver(() => {
    recalc()
  })
  if (categoryListRef.value) {
    resizeObserver.observe(categoryListRef.value)
  }
}

onMounted(() => {
  nextTick(() => {
    recalc()
    setupObserver()
  })
})

// Recalculate when categories data changes (e.g. after search filtering)
watch(
  () => props.categories,
  () => {
    visibleCount.value = props.categories.length
    nextTick(() => recalc())
  },
)

onUnmounted(() => {
  resizeObserver?.disconnect()
  resizeObserver = null
})
</script>

<style scoped>
.sidebar {
  width: var(--sidebar-width);
  flex-shrink: 0;
  margin: var(--space-lg);
  padding: var(--space-lg);
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  overflow-y: auto;
  align-self: flex-start;
  position: sticky;
  top: var(--space-lg);
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.sidebar-title {
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-muted);
  margin-bottom: var(--space-md);
}

.category-list { list-style: none; display: flex; flex-direction: column; gap: 2px; }

.category-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--color-text-secondary);
  transition: all var(--transition-fast);
}

.category-item:hover { background: rgba(50, 130, 184, 0.08); color: var(--color-text); }

.category-item.active {
  background: var(--color-accent-light);
  color: var(--color-accent);
  font-weight: 700;
}

.category-count {
  font-size: 0.8rem;
  color: var(--color-accent);
  background: var(--color-accent-light);
  padding: 2px 8px;
  border-radius: 10px;
}

.category-item.active .category-count { background: var(--color-accent); color: #fff; }
.category-item:first-child .category-count { background: rgba(50, 130, 184, 0.08); color: var(--color-text-secondary); }
.category-item:first-child.active .category-count { background: var(--color-accent); color: #fff; }

/* ---- Overflow hidden pills (visibility hidden + absolute to preserve offsetWidth) ---- */
.overflow-hidden {
  visibility: hidden;
  position: absolute;
  pointer-events: none;
  transition: none;
}

/* ---- "+N" overflow button ---- */
.overflow-btn {
  min-width: 48px;
  justify-content: center;
  background: rgba(50, 130, 184, 0.1);
  color: var(--color-accent);
  border: 1px solid rgba(50, 130, 184, 0.25);
}

.overflow-btn:hover {
  background: rgba(50, 130, 184, 0.2);
}

/* ── Mobile (< 641px): overflow-aware pill row ── */
@media (max-width: 640px) {
  .sidebar {
    width: auto;
    margin: var(--space-md);
    padding: var(--space-md);
    box-sizing: border-box;
    border-radius: var(--radius-lg);
    border: 1px solid var(--glass-border);
    position: static;
    align-self: auto;
    box-shadow: var(--shadow-md);
    background: rgba(255, 255, 255, 0.15);
    backdrop-filter: var(--glass-blur);
    -webkit-backdrop-filter: var(--glass-blur);
  }

  .sidebar-title {
    margin-bottom: var(--space-xs);
    font-size: 0.7rem;
  }

  .category-list {
    flex-direction: row;
    flex-wrap: nowrap;
    overflow: hidden;
    gap: var(--space-sm);
    padding: var(--space-sm) 0 0;
  }

  .category-item {
    flex-shrink: 0;
    padding: 6px 14px;
    font-size: 0.8rem;
    white-space: nowrap;
    background: rgba(255, 255, 255, 0.15);
    backdrop-filter: var(--glass-blur);
    -webkit-backdrop-filter: var(--glass-blur);
    border: 1px solid var(--glass-border);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-sm);
  }

  .category-item:hover { background: rgba(50, 130, 184, 0.1); }

  .category-item.active {
    background: var(--color-accent);
    color: #fff;
    border-color: var(--color-accent);
  }

  .category-count {
    margin-left: 6px;
    font-size: 0.7rem;
    padding: 1px 6px;
  }

  .category-item:first-child .category-count {
    background: var(--color-accent-light);
    color: var(--color-text-secondary);
  }

  .category-item:first-child.active .category-count {
    background: rgba(255, 255, 255, 0.3);
    color: #fff;
  }

  /* "+N" button on mobile */
  .overflow-btn {
    background: var(--color-accent);
    color: #fff;
    border-color: var(--color-accent);
    font-weight: 800;
    min-width: 44px;
  }

  .overflow-btn:hover {
    background: var(--color-accent-hover);
    color: #fff;
  }
}

/* ── Tablet (641px - 1024px): compact sidebar ── */
@media (min-width: 641px) and (max-width: 1024px) {
  .sidebar {
    margin: var(--space-md);
    padding: var(--space-md);
  }

  .category-item {
    padding: 8px 10px;
    font-size: 0.82rem;
  }
}
</style>
