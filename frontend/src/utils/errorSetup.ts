/**
 * 错误处理初始化设置
 * 配置全局错误处理器和恢复策略
 */

import { errorHandler } from './errorHandler'
import { 
  networkErrorRecovery, 
  matrixErrorRecovery, 
  authErrorRecovery 
} from './errorRecoveryStrategies'
import { setupNetworkInterceptor } from './networkInterceptor'
import { passiveEventManager } from './passiveEventManager'
import { networkStatusMonitor } from './networkStatusMonitor'

/**
 * 初始化错误处理系统
 */
export function initializeErrorHandling(): void {
  console.log('🛡️ 初始化错误处理系统...')

  // 注册错误恢复策略
  errorHandler.registerRecoveryStrategy('network', networkErrorRecovery)
  errorHandler.registerRecoveryStrategy('matrix', matrixErrorRecovery)
  errorHandler.registerRecoveryStrategy('auth', authErrorRecovery)

  // 设置Vue应用的错误处理（需要在Vue应用创建后调用）
  setupVueErrorHandling()

  // 设置网络拦截器
  setupNetworkInterceptor()

  // 设置网络请求错误处理
  setupNetworkErrorHandling()

  // 设置性能监控
  setupPerformanceMonitoring()

  // 优化现有的事件监听器
  passiveEventManager.optimizeExistingListeners()

  // 启动网络状态监控
  console.log('🌐 启动网络状态监控...')

  console.log('✅ 错误处理系统初始化完成')
}

/**
 * 设置Vue应用错误处理
 */
export function setupVueErrorHandling(app?: any): void {
  if (app) {
    // Vue 3 全局错误处理
    app.config.errorHandler = (error: Error, instance: any, info: string) => {
      console.error('Vue error caught:', error, info)
      
      errorHandler.handleAppError({
        message: error.message,
        componentName: instance?.$options?.name || instance?.$options?.__name || 'Unknown',
        stack: error.stack,
        context: {
          info,
          componentProps: instance?.$props,
          componentData: instance?.$data
        }
      })
    }

    // Vue 3 警告处理
    app.config.warnHandler = (msg: string, instance: any, trace: string) => {
      if (import.meta.env.DEV) {
        console.warn('Vue warning:', msg, trace)
      }
    }
  }
}

/**
 * 设置网络请求错误处理
 */
function setupNetworkErrorHandling(): void {
  // 监听网络状态变化
  window.addEventListener('online', () => {
    console.log('🌐 网络连接已恢复')
    // 可以在这里触发重试失败的网络请求
  })

  window.addEventListener('offline', () => {
    console.log('🌐 网络连接已断开')
    errorHandler.handleNetworkError({
      message: 'Network connection lost',
      url: 'network-status',
      status: 0,
      statusText: 'offline',
      method: 'GET',
      retryCount: 0,
      isTimeout: false
    })
  })
}

/**
 * 设置性能监控
 */
function setupPerformanceMonitoring(): void {
  // 监控长任务
  if ('PerformanceObserver' in window) {
    try {
      const longTaskObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 50) { // 超过50ms的任务
            errorHandler.handlePerformanceError({
              message: `Long task detected: ${entry.duration}ms`,
              metric: 'scroll_jank',
              value: entry.duration,
              threshold: 50,
              context: {
                entryType: entry.entryType,
                startTime: entry.startTime
              }
            })
          }
        }
      })

      longTaskObserver.observe({ entryTypes: ['longtask'] })
    } catch (error) {
      console.warn('Long task observer not supported:', error)
    }

    // 监控导航性能
    try {
      const navigationObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const navEntry = entry as PerformanceNavigationTiming
          
          // 检查页面加载时间
          if (navEntry.loadEventEnd - navEntry.navigationStart > 5000) {
            errorHandler.handlePerformanceError({
              message: `Slow page load: ${navEntry.loadEventEnd - navEntry.navigationStart}ms`,
              metric: 'network_slow',
              value: navEntry.loadEventEnd - navEntry.navigationStart,
              threshold: 5000,
              context: {
                domContentLoaded: navEntry.domContentLoadedEventEnd - navEntry.navigationStart,
                firstPaint: navEntry.loadEventStart - navEntry.navigationStart
              }
            })
          }
        }
      })

      navigationObserver.observe({ entryTypes: ['navigation'] })
    } catch (error) {
      console.warn('Navigation observer not supported:', error)
    }
  }

  // 监控内存使用（如果支持）
  if ('memory' in performance) {
    setInterval(() => {
      const memory = (performance as any).memory
      const usedMB = memory.usedJSHeapSize / 1024 / 1024
      const limitMB = memory.jsHeapSizeLimit / 1024 / 1024
      
      // 如果内存使用超过80%，报告性能问题
      if (usedMB / limitMB > 0.8) {
        errorHandler.handlePerformanceError({
          message: `High memory usage: ${usedMB.toFixed(2)}MB / ${limitMB.toFixed(2)}MB`,
          metric: 'memory_leak',
          value: usedMB,
          threshold: limitMB * 0.8,
          context: {
            usedJSHeapSize: memory.usedJSHeapSize,
            totalJSHeapSize: memory.totalJSHeapSize,
            jsHeapSizeLimit: memory.jsHeapSizeLimit
          }
        })
      }
    }, 30000) // 每30秒检查一次
  }
}

/**
 * 创建错误处理装饰器
 */
export function withErrorHandling<T extends (...args: any[]) => any>(
  fn: T,
  context?: string
): T {
  return ((...args: any[]) => {
    try {
      const result = fn(...args)
      
      // 如果返回Promise，处理异步错误
      if (result && typeof result.then === 'function') {
        return result.catch((error: Error) => {
          errorHandler.handleError(error, { context, args })
          throw error // 重新抛出错误，让调用者处理
        })
      }
      
      return result
    } catch (error) {
      errorHandler.handleError(error as Error, { context, args })
      throw error // 重新抛出错误，让调用者处理
    }
  }) as T
}

/**
 * 创建异步错误处理装饰器
 */
export function withAsyncErrorHandling<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  context?: string
): T {
  return (async (...args: any[]) => {
    try {
      return await fn(...args)
    } catch (error) {
      errorHandler.handleError(error as Error, { context, args })
      throw error // 重新抛出错误，让调用者处理
    }
  }) as T
}

/**
 * 获取错误处理器实例（用于在组件中使用）
 */
export function useErrorHandler() {
  return {
    errorHandler,
    handleError: errorHandler.handleError.bind(errorHandler),
    handleNetworkError: errorHandler.handleNetworkError.bind(errorHandler),
    handleMatrixError: errorHandler.handleMatrixError.bind(errorHandler),
    handleAuthError: errorHandler.handleAuthError.bind(errorHandler),
    handlePerformanceError: errorHandler.handlePerformanceError.bind(errorHandler),
    handleAppError: errorHandler.handleAppError.bind(errorHandler),
    getErrorState: errorHandler.getErrorState.bind(errorHandler),
    clearErrors: errorHandler.clearErrors.bind(errorHandler),
    clearErrorsByType: errorHandler.clearErrorsByType.bind(errorHandler)
  }
}