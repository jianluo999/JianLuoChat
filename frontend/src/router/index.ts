import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      redirect: '/login'
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/components/MatrixRealLogin.vue')
    },
    {
      path: '/chat',
      name: 'chat',
      component: () => import('@/components/WeChatStyleLayout.vue')
    },
    {
      path: '/encryption-settings',
      name: 'encryption-settings',
      component: () => import('@/pages/EncryptionSettings.vue')
    },
    {
      path: '/device-verification',
      name: 'device-verification',
      component: () => import('@/pages/DeviceVerificationPage.vue')
    },
    {
      path: '/security-audit',
      name: 'security-audit',
      component: () => import('@/pages/SecurityAuditPage.vue')
    },
    {
      path: '/encryption-test',
      name: 'encryption-test',
      component: () => import('@/pages/EncryptionTest.vue')
    },
    {
      path: '/crypto-debug',
      name: 'crypto-debug',
      component: () => import('@/pages/CryptoDebug.vue')
    },
    {
      path: '/matrix-test',
      name: 'matrix-test',
      component: () => import('@/pages/MatrixTest.vue')
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      redirect: '/login'
    }
  ]
})

// 路由守卫 - 检查登录状态
router.beforeEach(async (to, from, next) => {
  console.log('Navigating to:', to.path)

  // 检查是否有存储的登录信息
  const hasToken = localStorage.getItem('matrix_access_token')
  const hasLoginInfo = localStorage.getItem('matrix_login_info')

  console.log('Route guard - hasToken:', !!hasToken, 'hasLoginInfo:', !!hasLoginInfo)

  // 给localStorage一点时间更新
  await new Promise(resolve => setTimeout(resolve, 10))

  // 重新检查
  const hasTokenAfterDelay = localStorage.getItem('matrix_access_token')
  const hasLoginInfoAfterDelay = localStorage.getItem('matrix_login_info')

  console.log('Route guard after delay - hasToken:', !!hasTokenAfterDelay, 'hasLoginInfo:', !!hasLoginInfoAfterDelay)

  if (to.path === '/login') {
    // 如果已经登录，重定向到聊天页面
    if (hasTokenAfterDelay && hasLoginInfoAfterDelay) {
      console.log('Already logged in, redirecting to chat')
      next('/chat')
    } else {
      next()
    }
  } else if (to.path === '/chat' || to.path === '/encryption-settings' || to.path === '/device-verification' || to.path === '/encryption-test' || to.path === '/crypto-debug' || to.path === '/matrix-test') {
    // 如果没有登录，重定向到登录页面
    // 暂时只检查token，不检查login info（因为可能在初始化过程中被清除）
    if (!hasTokenAfterDelay) {
      console.log('Not logged in, redirecting to login')
      next('/login')
    } else {
      console.log('Logged in, proceeding to', to.path)
      next()
    }
  } else {
    next()
  }
})

export default router
