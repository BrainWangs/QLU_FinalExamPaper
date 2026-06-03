<template>
  <aside class="sidebar">
    <h2 class="sidebar-title">学科分类</h2>
    <ul class="category-list">
      <li
        :class="['category-item', { active: active === 'all' }]"
        @click="$emit('select', 'all')"
      >
        <span class="category-name">全部</span>
        <span class="category-count">{{ totalCount }}</span>
      </li>
      <li
        v-for="cat in categories"
        :key="cat.id"
        :class="['category-item', { active: active === cat.id }]"
        @click="$emit('select', cat.id)"
      >
        <span class="category-name">{{ cat.name }}</span>
        <span class="category-count">{{ cat.count }}</span>
      </li>
    </ul>
  </aside>
</template>

<script setup lang="ts">
defineProps<{
  categories: { id: string; name: string; count: number }[]
  active: string
  totalCount: number
}>()

defineEmits<{
  select: [id: string]
}>()
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
</style>
