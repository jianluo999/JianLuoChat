import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      redirect: '/matrix'
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { requiresGuest: true }
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/RegisterView.vue'),
      meta: { requiresGuest: true }
    },
    {
      path: '/matrix',
      name: 'matrix',
      component: () => import('@/views/MatrixChatView.vue'),
      meta: { requiresAuth: false } // Matrix有自己的登录系统
    },
    {
      path: '/test',
      name: 'test',
      component: () => import('@/views/MatrixTestView.vue'),
      meta: { requiresAuth: false }
    },

    {
      path: '/profile',
      name: 'profile',
      component: () => import('@/views/ProfileView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      redirect: '/matrix'
    }
  ]
})

// Navigation guards
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // 初始化认证状态（如果还没有初始化）
  if (!authStore.initialized) {
    await authStore.initializeAuth()
  }

  console.log('Router guard:', {
    to: to.path,
    from: from.path,
    requiresAuth: to.meta.requiresAuth,
    requiresGuest: to.meta.requiresGuest,
    isAuthenticated: authStore.isAuthenticated,
    hasToken: !!authStore.token,
    hasUser: !!authStore.user,
    initialized: authStore.initialized
  })

  // 避免无限重定向
  if (to.path === from.path) {
    console.log('Same path, allowing navigation')
    next()
    return
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    console.log('Redirecting to login - not authenticated')
    next('/login')
  } else if (to.meta.requiresGuest && authStore.isAuthenticated) {
    console.log('Redirecting to matrix - already authenticated')
    next('/matrix')
  } else {
    console.log('Allowing navigation')
    next()
  }
})

export default router
