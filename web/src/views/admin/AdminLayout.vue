<template>
  <div class="admin-layout">
    <aside class="admin-sidebar">
      <div class="admin-brand">管理后台</div>
      <nav class="admin-nav">
        <router-link to="/admin" exact-active-class="active" class="nav-item">仪表盘</router-link>
        <router-link to="/admin/categories" active-class="active" class="nav-item">学科管理</router-link>
        <router-link to="/admin/upload" active-class="active" class="nav-item">上传文件</router-link>
        <router-link to="/admin/files" active-class="active" class="nav-item">文件管理</router-link>
      </nav>
      <div class="admin-footer">
        <router-link to="/" class="back-link">← 返回前台</router-link>
      </div>
    </aside>
    <main class="admin-main">
      <router-view />
    </main>
  </div>
</template>

<style scoped>
.admin-layout { display: flex; min-height: 100vh; }
.admin-sidebar {
  width: 220px; background: var(--color-text); color: #fff;
  display: flex; flex-direction: column; padding: var(--space-lg);
}
.admin-brand { font-size: 1.1rem; font-weight: 700; margin-bottom: var(--space-xl); }
.admin-nav { display: flex; flex-direction: column; gap: 4px; flex: 1; }
.nav-item {
  padding: 10px 12px; border-radius: var(--radius-sm); color: rgba(255,255,255,0.7);
  font-size: 0.9rem; transition: background var(--transition-fast), color var(--transition-fast);
}
.nav-item:hover { background: rgba(255,255,255,0.1); color: #fff; }
.nav-item.active { background: var(--color-accent); color: #fff; }
.admin-footer { margin-top: auto; }
.back-link { font-size: 0.85rem; color: rgba(255,255,255,0.5); }
.back-link:hover { color: #fff; }
.admin-main { flex: 1; padding: var(--space-xl); overflow-y: auto; background: var(--color-surface); }
</style>
