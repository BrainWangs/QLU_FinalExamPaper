import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/HomeView.vue'),
  },
]

if (import.meta.env.DEV) {
  routes.push({
    path: '/admin',
    component: () => import('@/views/admin/AdminLayout.vue'),
    children: [
      { path: '', name: 'admin-dashboard', component: () => import('@/views/admin/AdminDashboard.vue') },
      { path: 'categories', name: 'admin-categories', component: () => import('@/views/admin/AdminCategories.vue') },
      { path: 'upload', name: 'admin-upload', component: () => import('@/views/admin/AdminUpload.vue') },
      { path: 'files', name: 'admin-files', component: () => import('@/views/admin/AdminFiles.vue') },
    ],
  })
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export { router, routes }
