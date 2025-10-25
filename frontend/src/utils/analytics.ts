/**
 * 安全的分析和埋点上报工具
 * 使用 logReportHandler 确保日志上报失败不影响用户体验
 */

import { safeLogReport, logReportHandler } from './logReportHandler'

interface AnalyticsEvent {
  event: string
  properties?: Record<string, any>
  timestamp?: number
  userId?: string
  sessionId?: string
}

class Analytics {
  private baseUrl = 'https://nlog.daxuesoutijiang.com'
  private sessionId: string
  private userId?: string
  private isEnabled: boolean

  constructor() {
    this.sessionId = this.generateSessionId()
    this.isEnabled = this.shouldEnableReporting()
  }

  /**
   * 判断是否应该启用日志上报
   */
  private shouldEnableReporting(): boolean {
    // 在开发环境中默认禁用，除非明确启用
    if (import.meta.env.DEV) {
      return import.meta.env.VITE_ENABLE_ANALYTICS === 'true'
    }
    
    // 生产环境中默认启用
    return true
  }

  /**
   * 生成会话ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
  }

  /**
   * 设置用户ID
   */
  setUserId(userId: string): void {
    this.userId = userId
  }

  /**
   * 启用/禁用日志上报
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled
    console.log(`📊 Analytics ${enabled ? '已启用' : '已禁用'}`)
  }

  /**
   * 获取当前启用状态
   */
  isReportingEnabled(): boolean {
    return this.isEnabled
  }

  /**
   * 安全的事件上报
   */
  private async safeTrack(event: AnalyticsEvent): Promise<void> {
    // 如果禁用了上报，只在控制台输出
    if (!this.isEnabled) {
      if (import.meta.env.DEV) {
        console.log('📊 [Analytics Mock]', event.event, event.properties)
      }
      return
    }

    const safeReportFn = safeLogReport(async () => {
      const payload = {
        ...event,
        timestamp: event.timestamp || Date.now(),
        userId: event.userId || this.userId,
        sessionId: this.sessionId,
        url: window.location.href,
        userAgent: navigator.userAgent,
        referrer: document.referrer
      }

      // 在开发环境中使用代理路径
      const url = import.meta.env.DEV 
        ? '/log/track' 
        : `${this.baseUrl}/log/track`

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        // 设置较短的超时时间，避免阻塞
        signal: AbortSignal.timeout(3000)
      })

      if (!response.ok) {
        throw new Error(`Analytics request failed: ${response.status}`)
      }
    }, `analytics-track-${event.event}`)

    await safeReportFn()
  }

  /**
   * 页面浏览事件
   */
  pageView(pageName: string, properties?: Record<string, any>): void {
    this.safeTrack({
      event: '$PageView',
      properties: {
        page: pageName,
        ...properties
      }
    })
  }

  /**
   * 页面隐藏事件
   */
  pageHide(pageName: string, duration?: number): void {
    this.safeTrack({
      event: '$PageHide',
      properties: {
        page: pageName,
        duration
      }
    })
  }

  /**
   * 页面显示事件
   */
  pageShow(pageName: string): void {
    this.safeTrack({
      event: '$PageShow',
      properties: {
        page: pageName
      }
    })
  }

  /**
   * 用户行为事件
   */
  track(eventName: string, properties?: Record<string, any>): void {
    this.safeTrack({
      event: eventName,
      properties
    })
  }

  /**
   * 错误事件上报
   */
  trackError(error: Error, context?: string): void {
    this.safeTrack({
      event: '$Error',
      properties: {
        message: error.message,
        stack: error.stack,
        context,
        url: window.location.href
      }
    })
  }

  /**
   * 性能指标上报
   */
  trackPerformance(metrics: Record<string, number>): void {
    this.safeTrack({
      event: '$Performance',
      properties: metrics
    })
  }

  /**
   * 获取日志上报统计信息
   */
  getReportStats() {
    return logReportHandler.getFailureStats()
  }
}

// 导出单例实例
export const analytics = new Analytics()

// 自动设置页面可见性变化监听
if (typeof document !== 'undefined') {
  let pageShowTime = Date.now()
  
  // 页面显示
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      pageShowTime = Date.now()
      analytics.pageShow(document.title)
    } else if (document.visibilityState === 'hidden') {
      const duration = Date.now() - pageShowTime
      analytics.pageHide(document.title, duration)
    }
  })

  // 页面卸载
  window.addEventListener('beforeunload', () => {
    const duration = Date.now() - pageShowTime
    analytics.pageHide(document.title, duration)
  })

  // 页面加载完成
  if (document.readyState === 'complete') {
    analytics.pageView(document.title)
  } else {
    window.addEventListener('load', () => {
      analytics.pageView(document.title)
    })
  }
}

export default analytics