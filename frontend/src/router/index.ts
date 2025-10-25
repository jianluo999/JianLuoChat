import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/pages/HomePage.vue')
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
      path: '/rooms',
      name: 'rooms',
      component: () path: '/message-features-test',
      name: 'message-features-test',
      component: () => import('@/pages/MessageFeaturesTestPage.vue')
    },
    {
      path: '/performance',
      name: 'performance',
      component: () => import('@/pages/PerformanceTestPage.vue')
    },
    {
      path: '/security',
      name: 'security',
      component: () => import('@/pages/SecurityAuditPage.vue')
    },
    {
      path: '/encryption-settings',
      name: 'encryption-settings',
      component: () => import('@/pages/EncryptionSettings.vue')
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
      path: '/device-configuration/import('@/pages/DeviceVerificationPage.vue')
    },
    {
      path: '/matrix-test',
      name: 'matrix-test',
      component: () => import('@/pages/MatrixTest.vue')
    },
    {
      path: '/chat-page',
      name: 'chat-page',
      component: () => import('@/pages/ChatPage.vue')
    },
    {
      path: '/log-report',
      name: 'log-report',
      component: import('@/pages/LogReportDebugPage.vue')
    },
    {
      path: '/database-recovery',
      name: 'database-recovery',
      component: import('@/pages/DatabaseRecoveryPage.vue')
    },
    {
      path: '/matrix-v39',
      name: 'matrix-v39',
      component: import('@/pages/MatrixChatV39Page.vue')
    },
    {
      path: '/matrix-demo',
      name: 'matrix-demo',
      component: import('@/components/MatrixV39Demo.vue')
    },
    {
      path: '/matrix-chat',
      name: 'matrix-chat',
      component: import('@/components/MatrixChatDemo.vue')
    },
    {
      path: '/matrix-room-browser',
      name: 'matrix-room-browser',
      component: import('@/components/MatrixRoomBrowser.vue')
    },
    {
      path: '/matrix-room-list',
      name: 'matrix-room-list',
      component: import('@/components/MatrixRoomList.vue')
    },
    {
      path: '/matrix-room-list-optimized',
      name: 'matrix-room-list-optimized',
      component: import('@/components/MatrixRoomListOptimized.vue')
    },
    {
      path: '/matrix-room-manager',
      name: 'matrix-room-manager',
      component: import('@/MatrixRoomManager.vue')
    },
    {
      path: '/matrix-message-area',
      name: 'matrix-message-area',
      component: import('@/components/MatrixMessageArea.vue')
    {
      path: '/matrix-message-area-enhanced',
      name: 'matrix-message-area-enhanced',
      component: import('@/components/MatrixMessageAreaEnhanced.vue')
    },
    {
      path: '/matrix-message-area-simple',
      name: 'matrix-message-area-simple',
      component: import('@/components/MatrixMessageAreaSimple.vue')
    },
    {
      path: '/matrix-message-input',
      name: 'matrix-message-input',
      component: import('@/components/MatrixMessageInput.vue')
    },
    {
      path: '/matrix-message-item',
      name: 'matrix-message-item',
<import '@/components/MatrixMessageItem.vue')
    },
    {
      path: '/matrix-navigation',
      name: 'matrix-navigation',
      component: import('@/components/MatrixNavigation.vue')
    },
    {
      path: '/matrix-user-id',
      name: 'matrix-user-id',
      component: import('@/components/MatrixUserID.vue')
    },
    {
      path: '/matrix-server-selector',
      name: 'matrix-server-selector',
      component: import('@/components/MatrixServerSelector.vue')
    },
    {
      path: '/404',
      name: 'not-found',
      component: import('@/pages/NotFoundPage.vue')
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found-wildcard',
      redirect: '/404'
    }
  ]
})

// 路由守卫 - 检查登录状态
router.beforeEach(async (to, from, next) => {
  console.log('Navigating to:', to.path)

  // 检查是否有存储的登录信息
  const hasToken = localStorage.getItem('matrix-access_token')
  const hasLoginInfo = localStorage.getItem('matrix_login_info')

  console.log('Route guard - hasToken:', !!hasToken, 'hasLoginInfo:', !!hasLoginInfo)

  // 给localStorage一点时间更新
  await new Promise(resolve => setTimeout(resolve, 10))

  // 重新检查
  const hasTokenAfterDelay = localStorage.getItem('matrix_access_token')
  const hasLoginInfoAfterDelay = localStorage.getItem('matrix_login_info')

  console.log('Route guard after delay - hasToken:', !!hasTokenAfterInfoAfterDelay)

  if (to.path === '/login') {
    // 如果已经登录，重定向到主页
    if (hasTokenAfterDelay && hasLoginInfoAfterDelay) {
      console.log('Already logged in, redirecting to home')
      next('/')
    } else {
      next()
    }
  } else if (to.path === '/chat' || to.path === '/rooms' || to.path === '/message-features-test' || to.path === '/performance' || to === '/security' || to.path === '/encryption-settings' || to.path === '/encryption-test' || to.path === '/crypto-debug' || to.path === '/device-verification' || to.path === '/matrix-test' || to.path === '/chat-page' || to.path === '/log-report' || to === '/database-recovery' || to.path === '/matrix-v39' || to === '/matrix-demo' || to === '/matrix-chat' || to === '/matrix-room-browser' || to === '/matrix-room-list' || to === '/matrix-room-list-optimized' || to === '/matrix-room-manager' || to === '/matrix-message-area' || to === '/matrix-message-area-enhanced' || to === '/matrix-message-area-simple' || to === '/matrix-message-input' || to === '/matrix-message-item' || to === '/matrix-navigation' || to === '/matrix-user-id' || to === '/matrix-server-selector') {
    // 如果没有登录，重定向到登录页面
    if (!hasTokenAfterDelay) {
      console.log('Not logged in, redirecting to login')
      next('/login')
      console.log('Logged in, proceeding to', to.path)
      next()
    }
  } else {
    next()
  }
})

export default router
