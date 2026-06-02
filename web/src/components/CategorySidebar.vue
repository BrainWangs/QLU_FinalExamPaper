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
  padding: var(--space-lg);
  border-right: 1px solid var(--color-border);
  overflow-y: auto;
}

.sidebar-title {
  font-size: 0.75rem;
  font-weight: 600;
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
  color: var(--color-text-secondary);
  transition: background var(--transition-fast), color var(--transition-fast);
}

.category-item:hover { background: var(--color-surface); color: var(--color-text); }

.category-item.active {
  background: var(--color-accent-light);
  color: var(--color-accent);
  font-weight: 500;
}

.category-count {
  font-size: 0.8rem;
  color: var(--color-text-muted);
  background: var(--color-surface);
  padding: 2px 8px;
  border-radius: 10px;
}

.category-item.active .category-count { background: var(--color-accent); color: #fff; }
</style>
