import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      redirect: '/matrix'
    },
    {
      path: '/matrix',
      name: 'matrix',
      component: () => import('@/views/MatrixChatView.vue')
    },
    {
      path: '/test',
      name: 'test',
      component: () => import('@/test/MatrixIntegrationTest.vue')
    },
    {
      path: '/interop-test',
      name: 'interop-test',
      component: () => import('@/components/MatrixInteroperabilityTest.vue')
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      redirect: '/matrix'
    }
  ]
})

// 简化的路由守卫 - Matrix有自己的认证系统
router.beforeEach((to, from, next) => {
  console.log('Navigating to:', to.path)
  next()
})

export default router
