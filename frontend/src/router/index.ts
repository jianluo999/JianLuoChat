import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/components/LayoutSelector.vue')
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/components/MatrixRealLogin.vue')
    },
    {
      path: '/matrix',
      name: 'matrix',
      component: () => import('@/components/WeChatStyleLayout.vue')
    },
    {
      path: '/element',
      name: 'element',
      component: () => import('@/components/ElementStyleLayout.vue')
    },
    {
      path: '/jianluo',
      name: 'jianluo',
      component: () => import('@/components/JianLuoChatLayout.vue')
    },
    {
      path: '/old-matrix',
      name: 'old-matrix',
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
