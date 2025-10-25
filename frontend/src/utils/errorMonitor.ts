import { ref, reactive, computed } from 'vue'

// 错误级别
export enum ErrorLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

// 错误类型
export enum ErrorType {
  NETWORK = 'network',
  PERFORMANCE = 'performance',
  MATRIX = 'matrix',
  UI = 'ui',
  STORAGE = 'storage',
  AUTH = 'auth',
  UNKNOWN = 'unknown'
}

// 错误信息接口
interface ErrorMessage {
  id: string
  timestamp: number
  level: ErrorLevel
  type: ErrorType
  message: string
  stack?: string
  context?: Record<string, any>
  userId?: string
  sessionId?: string
  url?: string
  userAgent?: string
  resolved: boolean
  retryable: boolean
  action?: string
}

// 错误统计
interface ErrorStats {
  total: number
  byLevel: Record<ErrorLevel, number>
  byType: Record<ErrorType, number>
  recentErrors: ErrorMessage[]
  unresolvedErrors: ErrorMessage[]
  errorRate: number // 每分钟错误数
}

// 错误处理配置
interface ErrorMonitorConfig {
  maxErrors: number
  errorRateThreshold: number
  autoResolveTimeout: number
  sendToServer: boolean
  serverUrl?: string
}

// 错误恢复策略
interface RecoveryStrategy {
  type: ErrorType
  maxRetries: number
  retryDelay: number
  backoffMultiplier: number
  shouldRetry: (error: ErrorMessage) => boolean
  onRetry?: (error: ErrorMessage, attempt: number) => void
  onSuccess?: (error: ErrorMessage) => void
  onFailure?: (error: ErrorMessage) => void
}

// 错误监控类
export class ErrorMonitor {
  private errors = reactive<ErrorMessage[]>([])
  private stats = reactive<ErrorStats>({
    total: 0,
    byLevel: {
      [ErrorLevel.DEBUG]: 0,
      [ErrorLevel.INFO]: 0,
      [ErrorLevel.WARNING]: 0,
      [ErrorLevel.ERROR]: 0,
      [ErrorLevel.CRITICAL]: 0
    },
    byType: {
      [ErrorType.NETWORK]: 0,
      [ErrorType.PERFORMANCE]: 0,
      [ErrorType.MATRIX]: 0,
      [ErrorType.UI]: 0,
      [ErrorType.STORAGE]: 0,
      [ErrorType.AUTH]: 0,
      [ErrorType.UNKNOWN]: 0
    },
    recentErrors: [],
    unresolvedErrors: [],
    errorRate: 0
  })
  
  private config: ErrorMonitorConfig = {
    maxErrors: 1000,
    errorRateThreshold: 10, // 每分钟10个错误
    autoResolveTimeout: 5 * 60 * 1000, // 5分钟自动解决
    sendToServer: true,
    serverUrl: '/api/errors'
  }
  
  private recoveryStrategies = new Map<ErrorType, RecoveryStrategy>()
  private errorCallbacks: ((error: ErrorMessage) => void)[] = []
  private isMonitoring = false
  private errorRateTimer: number | null = null

  constructor(config?: Partial<ErrorMonitorConfig>) {
    if (config) {
      this.config = { ...this.config, ...config }
    }
    
    this.initializeRecoveryStrategies()
    this.setupGlobalErrorHandlers()
  }

  // 初始化恢复策略
  private initializeRecoveryStrategies(): void {
    // 网络错误恢复策略
    this.recoveryStrategies.set(ErrorType.NETWORK, {
      type: ErrorType.NETWORK,
      maxRetries: 3,
      retryDelay: 2000,
      backoffMultiplier: 2,
      shouldRetry: (error) => error.retryable,
      onRetry: (error, attempt) => {
        console.log(`🔄 重试网络请求 (${attempt}/${3}):`, error.message)
      },
      onSuccess: (error) => {
        console.log('✅ 网络错误已解决:', error.message)
        this.resolveError(error.id)
      },
      onFailure: (error) => {
        console.log('❌ 网络错误重试失败:', error.message)
        this.showUserNotification(error, '网络连接问题，请检查您的网络设置')
      }
    })

    // 性能错误恢复策略
    this.recoveryStrategies.set(ErrorType.PERFORMANCE, {
      type: ErrorType.PERFORMANCE,
      maxRetries: 2,
      retryDelay: 1000,
      backoffMultiplier: 1.5,
      shouldRetry: (error) => error.retryable,
      onRetry: (error, attempt) => {
        console.log(`⚡ 优化性能 (${attempt}/${2}):`, error.message)
      },
      onSuccess: (error) => {
        console.log('✅ 性能问题已优化:', error.message)
        this.resolveError(error.id)
      },
      onFailure: (error) => {
        console.log('❌ 性能优化失败:', error.message)
        this.showUserNotification(error, '性能问题，请尝试刷新页面')
      }
    })

    // Matrix错误恢复策略
    this.recoveryStrategies.set(ErrorType.MATRIX, {
      type: ErrorType.MATRIX,
      maxRetries: 3,
      retryDelay: 3000,
      backoffMultiplier: 2,
      shouldRetry: (error) => error.retryable,
      onRetry: (error, attempt) => {
        console.log(`🔗 重试Matrix操作 (${attempt}/${3}):`, error.message)
      },
      onSuccess: (error) => {
        console.log('✅ Matrix操作成功:', error.message)
        this.resolveError(error.id)
      },
      onFailure: (error) => {
        console.log('❌ Matrix操作失败:', error.message)
        this.showUserNotification(error, 'Matrix服务暂时不可用，请稍后重试')
      }
    })

    // UI错误恢复策略
    this.recoveryStrategies.set(ErrorType.UI, {
      type: ErrorType.UI,
      maxRetries: 1,
      retryDelay: 500,
      backoffMultiplier: 1,
      shouldRetry: (error) => error.retryable,
      onRetry: (error, attempt) => {
        console.log(`🎨 重新渲染UI (${attempt}/${1}):`, error.message)
      },
      onSuccess: (error) => {
        console.log('✅ UI错误已修复:', error.message)
        this.resolveError(error.id)
      },
      onFailure: (error) => {
        console.log('❌ UI修复失败:', error.message)
        this.showUserNotification(error, '界面显示异常，请刷新页面')
      }
    })
  }

  // 设置全局错误处理器
  private setupGlobalErrorHandlers(): void {
    // 捕获JavaScript错误
    window.addEventListener('error', (event) => {
      this.handleError({
        level: ErrorLevel.ERROR,
        type: ErrorType.UI,
        message: event.message,
        stack: event.error?.stack,
        context: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno
        }
      })
    })

    // 捕获Promise拒绝
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError({
        level: ErrorLevel.ERROR,
        type: ErrorType.UI,
        message: `Promise rejected: ${event.reason}`,
        context: {
          reason: event.reason
        }
      })
    })

    // 捕获资源加载错误
    window.addEventListener('error', (event) => {
      if (event.target && (event.target as any).src) {
        this.handleError({
          level: ErrorLevel.WARNING,
          type: ErrorType.UI,
          message: `资源加载失败: ${(event.target as any).src}`,
          context: {
            resourceType: (event.target as any).tagName,
            src: (event.target as any).src
          }
        })
      }
    }, true)
  }

  // 添加错误
  private handleError(errorInfo: Partial<ErrorMessage>): void {
    const error: ErrorMessage = {
      id: this.generateErrorId(),
      timestamp: Date.now(),
      level: errorInfo.level || ErrorLevel.ERROR,
      type: errorInfo.type || ErrorType.UNKNOWN,
      message: errorInfo.message || '未知错误',
      stack: errorInfo.stack,
      context: errorInfo.context,
      userId: this.getUserId(),
      sessionId: this.getSessionId(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      resolved: false,
      retryable: errorInfo.retryable || false,
      action: errorInfo.action
    }

    // 添加到错误列表
    this.errors.unshift(error)
    
    // 保持错误数量在限制内
    if (this.errors.length > this.config.maxErrors) {
      this.errors.splice(this.config.maxErrors)
    }

    // 更新统计
    this.updateStats(error)
    
    // 通知回调
    this.notifyCallbacks(error)
    
    // 自动解决超时错误
    if (this.config.autoResolveTimeout > 0) {
      setTimeout(() => {
        if (!error.resolved) {
          this.resolveError(error.id)
        }
      }, this.config.autoResolveTimeout)
    }

    // 发送到服务器
    if (this.config.sendToServer && this.config.serverUrl) {
      this.sendErrorToServer(error)
    }

    // 触发恢复策略
    this.attemptRecovery(error)
  }

  // 生成错误ID
  private generateErrorId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
  }

  // 获取用户ID
  private getUserId(): string {
    return localStorage.getItem('user_id') || 'anonymous'
  }

  // 获取会话ID
  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('session_id')
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
      sessionStorage.setItem('session_id', sessionId)
    }
    return sessionId
  }

  // 更新统计
  private updateStats(error: ErrorMessage): void {
    this.stats.total++
    this.stats.byLevel[error.level]++
    this.stats.byType[error.type]++
    
    // 更新最近错误列表
    this.stats.recentErrors = this.errors
      .filter(e => Date.now() - e.timestamp < 5 * 60 * 1000) // 最近5分钟
      .slice(0, 50)
    
    // 更新未解决错误列表
    this.stats.unresolvedErrors = this.errors
      .filter(e => !e.resolved)
      .slice(0, 100)
    
    // 计算错误率
    this.calculateErrorRate()
  }

  // 计算错误率
  private calculateErrorRate(): void {
    if (this.errorRateTimer) {
      clearTimeout(this.errorRateTimer)
    }
    
    const oneMinuteAgo = Date.now() - 60 * 1000
    const recentErrors = this.errors.filter(e => e.timestamp > oneMinuteAgo)
    this.stats.errorRate = recentErrors.length
    
    // 检查是否超过阈值
    if (this.stats.errorRate > this.config.errorRateThreshold) {
      this.handleHighErrorRate()
    }
  }

  // 处理高错误率
  private handleHighErrorRate(): void {
    console.warn(`🚨 错误率过高: ${this.stats.errorRate}/分钟`)
    
    this.handleError({
      level: ErrorLevel.CRITICAL,
      type: ErrorType.UNKNOWN,
      message: `错误率过高: ${this.stats.errorRate}/分钟`,
      context: {
        errorRate: this.stats.errorRate,
        threshold: this.config.errorRateThreshold
      },
      retryable: false
    })
  }

  // 通知回调
  private notifyCallbacks(error: ErrorMessage): void {
    this.errorCallbacks.forEach(callback => {
      try {
        callback(error)
      } catch (callbackError) {
        console.error('❌ 错误回调执行失败:', callbackError)
      }
    })
  }

  // 尝试恢复
  private attemptRecovery(error: ErrorMessage): void {
    const strategy = this.recoveryStrategies.get(error.type)
    if (strategy && strategy.shouldRetry(error)) {
      this.executeRecovery(error, strategy)
    }
  }

  // 执行恢复
  private executeRecovery(error: ErrorMessage, strategy: RecoveryStrategy): void {
    let attempt = 0
    const maxAttempts = strategy.maxRetries + 1 // 包括初始尝试
    
    const retry = async () => {
      attempt++
      
      if (strategy.onRetry) {
        strategy.onRetry(error, attempt)
      }
      
      try {
        // 这里可以添加具体的恢复逻辑
        // 例如重新初始化Matrix客户端、清理缓存等
        
        if (strategy.onSuccess) {
          strategy.onSuccess(error)
        }
      } catch (recoveryError) {
        if (attempt < maxAttempts) {
          const delay = strategy.retryDelay * Math.pow(strategy.backoffMultiplier, attempt - 1)
          setTimeout(retry, delay)
        } else {
          if (strategy.onFailure) {
            strategy.onFailure(error)
          }
        }
      }
    }
    
    retry()
  }

  // 显示用户通知
  private showUserNotification(error: ErrorMessage, message: string): void {
    // 这里可以集成到现有的通知系统
    console.log(`🔔 用户通知: ${message}`)
    
    // 如果有UI通知系统，可以在这里调用
    // 例如: this.$notification.error(message)
  }

  // 发送错误到服务器
  private async sendErrorToServer(error: ErrorMessage): Promise<void> {
    try {
      await fetch(this.config.serverUrl!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(error)
      })
    } catch (sendError) {
      console.warn('❌ 发送错误到服务器失败:', sendError)
    }
  }

  // 公共方法
  logDebug(message: string, context?: Record<string, any>): void {
    this.handleError({ level: ErrorLevel.DEBUG, type: ErrorType.UNKNOWN, message, context })
  }

  logInfo(message: string, context?: Record<string, any>): void {
    this.handleError({ level: ErrorLevel.INFO, type: ErrorType.UNKNOWN, message, context })
  }

  logWarning(message: string, context?: Record<string, any>): void {
    this.handleError({ level: ErrorLevel.WARNING, type: ErrorType.UNKNOWN, message, context, retryable: true })
  }

  logError(message: string, context?: Record<string, any>): void {
    this.handleError({ level: ErrorLevel.ERROR, type: ErrorType.UNKNOWN, message, context, retryable: true })
  }

  logCritical(message: string, context?: Record<string, any>): void {
    this.handleError({ level: ErrorLevel.CRITICAL, type: ErrorType.UNKNOWN, message, context, retryable: false })
  }

  // 解决错误
  resolveError(errorId: string): void {
    const error = this.errors.find(e => e.id === errorId)
    if (error) {
      error.resolved = true
      console.log('✅ 错误已解决:', error.message)
    }
  }

  // 添加错误监听器
  addErrorListener(callback: (error: ErrorMessage) => void): void {
    this.errorCallbacks.push(callback)
  }

  // 移除错误监听器
  removeErrorListener(callback: (error: ErrorMessage) => void): void {
    const index = this.errorCallbacks.indexOf(callback)
    if (index > -1) {
      this.errorCallbacks.splice(index, 1)
    }
  }

  // 开始监控
  startMonitoring(): void {
    if (this.isMonitoring) return
    
    this.isMonitoring = true
    console.log('🔍 开始错误监控')
    
    // 开始错误率计算定时器
    this.errorRateTimer = setInterval(() => {
      this.calculateErrorRate()
    }, 60000) // 每分钟计算一次
  }

  // 停止监控
  stopMonitoring(): void {
    this.isMonitoring = false
    console.log('⏹️ 停止错误监控')
    
    if (this.errorRateTimer) {
      clearInterval(this.errorRateTimer)
      this.errorRateTimer = null
    }
  }

  // 获取统计信息
  getStats() {
    return this.stats
  }

  // 获取错误列表
  getErrors() {
    return this.errors
  }

  // 获取未解决错误
  getUnresolvedErrors() {
    return this.stats.unresolvedErrors
  }

  // 获取错误率
  getErrorRate() {
    return this.stats.errorRate
  }

  // 检查是否有严重错误
  hasCriticalErrors(): boolean {
    return this.stats.byLevel[ErrorLevel.CRITICAL] > 0
  }

  // 清理错误
  clearErrors(): void {
    this.errors.splice(0)
    this.stats.total = 0
    Object.keys(this.stats.byLevel).forEach(key => {
      this.stats.byLevel[key as ErrorLevel] = 0
    })
    Object.keys(this.stats.byType).forEach(key => {
      this.stats.byType[key as ErrorType] = 0
    })
    console.log('🧹 错误列表已清理')
  }
}

// 创建全局错误监控实例
export const errorMonitor = new ErrorMonitor()

// Vue 组合式函数
export function useErrorMonitor() {
  const stats = computed(() => errorMonitor.getStats())
  const errors = computed(() => errorMonitor.getErrors())
  const unresolvedErrors = computed(() => errorMonitor.getUnresolvedErrors())
  const errorRate = computed(() => errorMonitor.getErrorRate())
  const hasCriticalErrors = computed(() => errorMonitor.hasCriticalErrors())

  return {
    stats,
    errors,
    unresolvedErrors,
    errorRate,
    hasCriticalErrors,
    
    // 方法
    logDebug: (message: string, context?: Record<string, any>) => 
      errorMonitor.logDebug(message, context),
    logInfo: (message: string, context?: Record<string, any>) => 
      errorMonitor.logInfo(message, context),
    logWarning: (message: string, context?: Record<string, any>) => 
      errorMonitor.logWarning(message, context),
    logError: (message: string, context?: Record<string, any>) => 
      errorMonitor.logError(message, context),
    logCritical: (message: string, context?: Record<string, any>) => 
      errorMonitor.logCritical(message, context),
    resolveError: (errorId: string) => errorMonitor.resolveError(errorId),
    clearErrors: () => errorMonitor.clearErrors(),
    addErrorListener: (callback: (error: ErrorMessage) => void) => 
      errorMonitor.addErrorListener(callback),
    removeErrorListener: (callback: (error: ErrorMessage) => void) => 
      errorMonitor.removeErrorListener(callback),
    startMonitoring: () => errorMonitor.startMonitoring(),
    stopMonitoring: () => errorMonitor.stopMonitoring()
  }
}