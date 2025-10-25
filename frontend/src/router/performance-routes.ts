import type { RouteRecordRaw } from 'vue-router'
import PerformanceTestPage from '@/pages/PerformanceTestPage.vue'
import PerformanceDashboard from '@/components/PerformanceDashboard.vue'
import MatrixRoomListOptimized from '@/components/MatrixRoomListOptimized.vue'

// 性能优化相关的路由配置
export const performanceRoutes: RouteRecordRaw[] = [
  {
    path: '/performance-test',
    name: 'PerformanceTest',
    component: PerformanceTestPage,
    meta: {
      title: '性能测试面板',
      description: '实时监控应用性能指标和优化效果',
      requiresAuth: true,
      layout: 'default'
    }
  },
  {
    path: '/performance-dashboard',
    name: 'PerformanceDashboard',
    component: PerformanceDashboard,
    meta: {
      title: '性能监控仪表板',
      description: '综合性能监控和优化建议',
      requiresAuth: true,
      layout: 'default'
    }
  },
  {
    path: '/matrix-rooms-optimized',
    name: 'MatrixRoomsOptimized',
    component: MatrixRoomListOptimized,
    meta: {
      title: '优化版房间列表',
      description: '使用虚拟滚动和性能优化的房间列表',
      requiresAuth: true,
      layout: 'default'
    }
  }
]

// 性能监控中间件
export function performanceMiddleware(to: any, from: any, next: any) {
  // 在路由切换时进行性能检查
  if (to.meta.requiresAuth) {
    // 检查当前性能状态
    const performance = window.performance
    
    // 记录路由切换性能
    const navigationStart = performance.timing.navigationStart
    const loadComplete = performance.timing.loadEventEnd
    const pageLoadTime = loadComplete - navigationStart
    
    // 如果页面加载时间过长，记录性能问题
    if (pageLoadTime > 3000) {
      console.warn(`⚠️ 页面加载时间过长: ${pageLoadTime}ms`, {
        page: to.name,
        loadTime: pageLoadTime,
        timestamp: Date.now()
      })
    }
    
    // 检查内存使用
    if ((performance as any).memory) {
      const memory = (performance as any).memory
      const memoryUsage = memory.usedJSHeapSize / memory.totalJSHeapSize
      
      if (memoryUsage > 0.8) {
        console.warn(`⚠️ 内存使用率过高: ${(memoryUsage * 100).toFixed(1)}%`, {
          page: to.name,
          memoryUsage,
          timestamp: Date.now()
        })
      }
    }
  }
  
  next()
}

// 性能路由守卫
export function setupPerformanceGuards(router: any) {
  // 添加性能中间件到所有路由
  router.beforeEach(performanceMiddleware)
  
  // 添加错误监控
  router.onError((error: any) => {
    console.error('❌ 路由错误:', error)
    
    // 这里可以集成到错误监控系统
    const errorMonitor = (window as any).errorMonitor
    if (errorMonitor) {
      errorMonitor.logError('路由错误', {
        error: error.message,
        stack: error.stack,
        route: router.currentRoute.value.name
      })
    }
  })
  
  // 监控路由切换性能
  router.afterEach((to: any, from: any) => {
    if (to.name !== from.name) {
      // 记录路由切换完成
      console.log(`✅ 路由切换完成: ${from.name} → ${to.name}`)
      
      // 检查是否有性能问题
      const performance = window.performance
      if (performance && (performance as any).getEntriesByType) {
        const navigation = (performance as any).getEntriesByType('navigation')[0]
        if (navigation) {
          const domContentLoaded = navigation.domContentLoadedEventEnd - navigation.navigationStart
          const loadComplete = navigation.loadEventEnd - navigation.navigationStart
          
          if (domContentLoaded > 2000) {
            console.warn(`⚠️ DOM 内容加载时间过长: ${domContentLoaded}ms`)
          }
          if (loadComplete > 5000) {
            console.warn(`⚠️ 页面完全加载时间过长: ${loadComplete}ms`)
          }
        }
      }
    }
  })
}