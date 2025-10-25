/**
 * 日志上报错误处理器
 * 专门处理埋点日志上报失败的情况，避免影响用户体验
 */

interface LogReportError {
  url: string
  error: string
  timestamp: number
  context?: string
}

class LogReportHandler {
  private failedReports: LogReportError[] = []
  private maxFailedReports = 50 // 最多保存50个失败记录
  private retryQueue: Array<() => Promise<void>> = []
  private isRetrying = false

  /**
   * 处理日志上报失败
   */
  handleLogReportFailure(url: string, error: any, context?: string): void {
    const logError: LogReportError = {
      url,
      error: error.message || error.toString(),
      timestamp: Date.now(),
      context
    }

    // 添加到失败记录
    this.failedReports.push(logError)
    
    // 保持记录数量在限制内
    if (this.failedReports.length > this.maxFailedReports) {
      this.failedReports.shift()
    }

    // 静默记录，不影响用户体验
    console.debug('📊 日志上报失败 (已记录):', {
      url: this.maskSensitiveUrl(url),
      error: error.message,
      context,
      totalFailed: this.failedReports.length
    })

    // 如果是网络连接问题，尝试稍后重试
    if (this.isNetworkError(error)) {
      this.scheduleRetry(url, context)
    }
  }

  /**
   * 判断是否为网络连接错误
   */
  private isNetworkError(error: any): boolean {
    const networkErrorPatterns = [
      'ERR_CONNECTION_CLOSED',
      'ERR_NETWORK',
      'ERR_INTERNET_DISCONNECTED',
      'ERR_CONNECTION_REFUSED',
      'ERR_CONNECTION_TIMED_OUT',
      'Network request failed',
      'Failed to fetch'
    ]

    const errorMessage = error.message || error.toString()
    return networkErrorPatterns.some(pattern => errorMessage.includes(pattern))
  }

  /**
   * 安排重试
   */
  private scheduleRetry(url: string, context?: string): void {
    // 避免重复添加相同的重试任务
    if (this.retryQueue.some(task => task.toString().includes(url))) {
      return
    }

    const retryTask = async (): Promise<void> => {
      try {
        // 简单的网络连通性检查
        await fetch(url, { 
          method: 'HEAD', 
          mode: 'no-cors',
          signal: AbortSignal.timeout(5000) // 5秒超时
        })
        console.debug('📊 日志服务器连通性恢复:', this.maskSensitiveUrl(url))
      } catch (error) {
        console.debug('📊 日志服务器仍不可达:', this.maskSensitiveUrl(url))
      }
    }

    this.retryQueue.push(retryTask)

    // 延迟重试，避免立即重试
    setTimeout(() => {
      this.processRetryQueue()
    }, 30000) // 30秒后重试
  }

  /**
   * 处理重试队列
   */
  private async processRetryQueue(): void {
    if (this.isRetrying || this.retryQueue.length === 0) {
      return
    }

    this.isRetrying = true
    
    try {
      // 批量处理重试任务
      const tasks = this.retryQueue.splice(0, 5) // 一次最多处理5个
      await Promise.allSettled(tasks.map(task => task()))
    } catch (error) {
      console.debug('📊 重试队列处理出错:', error)
    } finally {
      this.isRetrying = false
      
      // 如果还有任务，继续处理
      if (this.retryQueue.length > 0) {
        setTimeout(() => this.processRetryQueue(), 10000) // 10秒后继续
      }
    }
  }

  /**
   * 掩码敏感URL信息
   */
  private maskSensitiveUrl(url: string): string {
    try {
      const urlObj = new URL(url)
      return `${urlObj.protocol}//${urlObj.hostname}${urlObj.pathname.substring(0, 20)}...`
    } catch {
      return url.substring(0, 50) + '...'
    }
  }

  /**
   * 获取失败统计
   */
  getFailureStats(): {
    totalFailed: number
    recentFailed: number
    commonErrors: Array<{ error: string; count: number }>
  } {
    const now = Date.now()
    const recentThreshold = now - 5 * 60 * 1000 // 最近5分钟

    const recentFailed = this.failedReports.filter(
      report => report.timestamp > recentThreshold
    ).length

    // 统计常见错误
    const errorCounts = new Map<string, number>()
    this.failedReports.forEach(report => {
      const count = errorCounts.get(report.error) || 0
      errorCounts.set(report.error, count + 1)
    })

    const commonErrors = Array.from(errorCounts.entries())
      .map(([error, count]) => ({ error, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5) // 前5个最常见的错误

    return {
      totalFailed: this.failedReports.length,
      recentFailed,
      commonErrors
    }
  }

  /**
   * 清理旧的失败记录
   */
  cleanup(): void {
    const now = Date.now()
    const maxAge = 24 * 60 * 60 * 1000 // 24小时

    this.failedReports = this.failedReports.filter(
      report => now - report.timestamp < maxAge
    )
  }

  /**
   * 创建安全的日志上报包装器
   */
  createSafeLogReporter<T extends any[]>(
    reportFn: (...args: T) => Promise<void>,
    context?: string
  ): (...args: T) => Promise<void> {
    return async (...args: T) => {
      try {
        await reportFn(...args)
      } catch (error: any) {
        this.handleLogReportFailure(
          context || 'unknown',
          error,
          `LogReport: ${reportFn.name || 'anonymous'}`
        )
        // 不重新抛出错误，保持静默
      }
    }
  }
}

// 导出单例实例
export const logReportHandler = new LogReportHandler()

// 定期清理
setInterval(() => {
  logReportHandler.cleanup()
}, 60 * 60 * 1000) // 每小时清理一次

/**
 * 安全的日志上报函数
 * 使用示例：
 * const safeReport = safeLogReport(() => fetch('/log/pageHide', {...}))
 * safeReport() // 不会抛出错误
 */
export function safeLogReport<T extends any[]>(
  reportFn: (...args: T) => Promise<void>,
  context?: string
): (...args: T) => Promise<void> {
  return logReportHandler.createSafeLogReporter(reportFn, context)
}