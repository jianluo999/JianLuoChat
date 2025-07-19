/**
 * 错误处理服务
 * 提供统一的错误处理、日志记录和恢复机制
 */

import { reactive, ref } from 'vue'
import type { 
  AppErrorType, 
  NetworkError, 
  MatrixError, 
  AuthError, 
  PerformanceError, 
  AppError,
  ErrorState, 
  ErrorHandlerConfig, 
  ErrorRecoveryStrategy,
  ErrorReport
} from './errorTypes'
import { ErrorSeverity } from './errorTypes'

class ErrorHandler {
  private config: ErrorHandlerConfig
  private state: ErrorState
  private recoveryStrategies: Map<string, ErrorRecoveryStrategy>
  private sessionId: string

  constructor(config: Partial<ErrorHandlerConfig> = {}) {
    this.config = {
      maxErrors: 100,
      maxRetries: 3,
      retryDelay: 1000,
      enableLogging: true,
      enableReporting: false,
      logLevel: 'error',
      ...config
    }

    this.state = reactive({
      errors: [],
      networkErrors: [],
      matrixErrors: [],
      authErrors: [],
      performanceErrors: [],
      appErrors: [],
      lastErrorTime: 0,
      errorCount: 0,
      isRecovering: false
    })

    this.recoveryStrategies = new Map()
    this.sessionId = this.generateSessionId()

    // 设置全局错误处理
    this.setupGlobalErrorHandling()
  }

  /**
   * 处理网络错误
   */
  handleNetworkError(error: Partial<NetworkError>): void {
    const networkError: NetworkError = {
      id: this.generateErrorId(),
      type: 'network',
      message: error.message || 'Network request failed',
      timestamp: Date.now(),
      url: error.url || '',
      status: error.status || 0,
      statusText: error.statusText || '',
      method: error.method || 'GET',
      retryCount: error.retryCount || 0,
      isTimeout: error.isTimeout || false,
      stack: error.stack,
      context: error.context
    }

    // 特殊处理APM监控错误 - 完全静默处理
    if (this.isAPMError(networkError)) {
      this.handleAPMError(networkError)
      return // 直接返回，不添加到错误状态中
    }

    this.addError(networkError)
    this.logError(networkError)

    // 尝试恢复
    this.attemptRecovery(networkError)
  }

  /**
   * 处理Matrix相关错误
   */
  handleMatrixError(error: Partial<MatrixError>): void {
    const matrixError: MatrixError = {
      id: this.generateErrorId(),
      type: 'matrix',
      message: error.message || 'Matrix operation failed',
      timestamp: Date.now(),
      operation: error.operation || 'init_client',
      roomId: error.roomId,
      userId: error.userId,
      errorCode: error.errorCode,
      isRecoverable: error.isRecoverable ?? true,
      stack: error.stack,
      context: error.context
    }

    this.addError(matrixError)
    this.logError(matrixError)
    this.attemptRecovery(matrixError)
  }

  /**
   * 处理认证错误
   */
  handleAuthError(error: Partial<AuthError>): void {
    const authError: AuthError = {
      id: this.generateErrorId(),
      type: 'auth',
      message: error.message || 'Authentication failed',
      timestamp: Date.now(),
      operation: error.operation || 'validation',
      isTokenExpired: error.isTokenExpired || false,
      shouldRedirect: error.shouldRedirect || false,
      redirectPath: error.redirectPath,
      stack: error.stack,
      context: error.context
    }

    this.addError(authError)
    this.logError(authError)
    this.attemptRecovery(authError)
  }

  /**
   * 处理性能错误
   */
  handlePerformanceError(error: Partial<PerformanceError>): void {
    const perfError: PerformanceError = {
      id: this.generateErrorId(),
      type: 'performance',
      message: error.message || 'Performance issue detected',
      timestamp: Date.now(),
      metric: error.metric || 'scroll_jank',
      value: error.value || 0,
      threshold: error.threshold || 0,
      componentName: error.componentName,
      stack: error.stack,
      context: error.context
    }

    this.addError(perfError)
    this.logError(perfError)
  }

  /**
   * 处理应用错误
   */
  handleAppError(error: Partial<AppError>): void {
    const appError: AppError = {
      id: this.generateErrorId(),
      type: 'app',
      message: error.message || 'Application error occurred',
      timestamp: Date.now(),
      componentName: error.componentName || 'Unknown',
      errorBoundary: error.errorBoundary,
      props: error.props,
      isRecoverable: error.isRecoverable ?? true,
      stack: error.stack,
      context: error.context
    }

    this.addError(appError)
    this.logError(appError)
    this.attemptRecovery(appError)
  }

  /**
   * 通用错误处理入口
   */
  handleError(error: Error | AppErrorType, context?: Record<string, any>): void {
    if (this.isAppErrorType(error)) {
      // 已经是格式化的错误类型
      this.addError(error)
      this.logError(error)
      this.attemptRecovery(error)
    } else {
      // 原生Error对象，转换为AppError
      const appError: AppError = {
        id: this.generateErrorId(),
        type: 'app',
        message: error.message,
        timestamp: Date.now(),
        componentName: context?.componentName || 'Unknown',
        isRecoverable: true,
        stack: error.stack,
        context
      }
      this.handleAppError(appError)
    }
  }

  /**
   * 记录错误日志
   */
  private logError(error: AppErrorType): void {
    if (!this.config.enableLogging) return

    const severity = this.getErrorSeverity(error)
    const logMessage = `[${error.type.toUpperCase()}] ${error.message}`
    const logData = {
      id: error.id,
      timestamp: new Date(error.timestamp).toISOString(),
      context: error.context,
      stack: error.stack
    }

    switch (severity) {
      case ErrorSeverity.CRITICAL:
        console.error(logMessage, logData)
        break
      case ErrorSeverity.HIGH:
        console.error(logMessage, logData)
        break
      case ErrorSeverity.MEDIUM:
        console.warn(logMessage, logData)
        break
      case ErrorSeverity.LOW:
        console.info(logMessage, logData)
        break
    }

    // 上报错误（如果启用）
    if (this.config.enableReporting) {
      this.reportError(error)
    }
  }

  /**
   * 添加错误到状态
   */
  private addError(error: AppErrorType): void {
    this.state.errors.push(error)
    this.state.errorCount++
    this.state.lastErrorTime = error.timestamp

    // 按类型分类存储
    switch (error.type) {
      case 'network':
        this.state.networkErrors.push(error as NetworkError)
        break
      case 'matrix':
        this.state.matrixErrors.push(error as MatrixError)
        break
      case 'auth':
        this.state.authErrors.push(error as AuthError)
        break
      case 'performance':
        this.state.performanceErrors.push(error as PerformanceError)
        break
      case 'app':
        this.state.appErrors.push(error as AppError)
        break
    }

    // 清理旧错误
    this.cleanupOldErrors()
  }

  /**
   * 尝试错误恢复
   */
  private async attemptRecovery(error: AppErrorType): Promise<void> {
    const strategy = this.recoveryStrategies.get(error.type)
    if (!strategy || !strategy.canRecover(error)) {
      return
    }

    this.state.isRecovering = true

    try {
      const recovered = await strategy.recover(error)
      if (!recovered) {
        strategy.fallback(error)
      }
    } catch (recoveryError) {
      console.error('Error recovery failed:', recoveryError)
      strategy.fallback(error)
    } finally {
      this.state.isRecovering = false
    }
  }

  /**
   * 注册错误恢复策略
   */
  registerRecoveryStrategy(errorType: string, strategy: ErrorRecoveryStrategy): void {
    this.recoveryStrategies.set(errorType, strategy)
  }

  /**
   * 获取错误状态
   */
  getErrorState(): ErrorState {
    return this.state
  }

  /**
   * 清除所有错误
   */
  clearErrors(): void {
    this.state.errors = []
    this.state.networkErrors = []
    this.state.matrixErrors = []
    this.state.authErrors = []
    this.state.performanceErrors = []
    this.state.appErrors = []
    this.state.errorCount = 0
  }

  /**
   * 清除特定类型的错误
   */
  clearErrorsByType(type: AppErrorType['type']): void {
    this.state.errors = this.state.errors.filter(error => error.type !== type)
    
    switch (type) {
      case 'network':
        this.state.networkErrors = []
        break
      case 'matrix':
        this.state.matrixErrors = []
        break
      case 'auth':
        this.state.authErrors = []
        break
      case 'performance':
        this.state.performanceErrors = []
        break
      case 'app':
        this.state.appErrors = []
        break
    }
  }

  /**
   * 设置全局错误处理
   */
  private setupGlobalErrorHandling(): void {
    // 捕获未处理的Promise拒绝
    window.addEventListener('unhandledrejection', (event) => {
      // 过滤APM相关错误
      if (this.isAPMRelatedError(event.reason)) {
        event.preventDefault()
        return
      }
      
      this.handleError(new Error(event.reason), {
        type: 'unhandled_promise_rejection',
        reason: event.reason
      })
    })

    // 捕获全局JavaScript错误
    window.addEventListener('error', (event) => {
      // 过滤APM相关错误
      if (this.isAPMRelatedError(event.error || event.message, event.filename)) {
        event.preventDefault()
        return
      }
      
      this.handleError(event.error || new Error(event.message), {
        type: 'global_error',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      })
    })
  }

  /**
   * 判断是否为APM错误
   */
  private isAPMError(error: NetworkError): boolean {
    return error.url.includes('apm-volcano.zuoyebang.com') || 
           error.url.includes('monitor_web/collect') ||
           error.url.includes('apmInject') ||
           error.url.includes('aegisInject')
  }

  /**
   * 处理APM错误（完全静默处理）
   */
  private handleAPMError(error: NetworkError): void {
    // APM错误完全静默处理，只在开发环境下记录
    if (import.meta.env.DEV && this.config.logLevel === 'debug') {
      console.debug('🔇 APM monitoring service unavailable (silenced):', error.url)
    }
    // 生产环境下完全忽略
  }

  /**
   * 获取错误严重程度
   */
  private getErrorSeverity(error: AppErrorType): ErrorSeverity {
    switch (error.type) {
      case 'auth':
        return ErrorSeverity.HIGH
      case 'matrix':
        return (error as MatrixError).operation === 'login' ? ErrorSeverity.HIGH : ErrorSeverity.MEDIUM
      case 'network':
        return this.isAPMError(error as NetworkError) ? ErrorSeverity.LOW : ErrorSeverity.MEDIUM
      case 'performance':
        return ErrorSeverity.LOW
      case 'app':
        return (error as AppError).isRecoverable ? ErrorSeverity.MEDIUM : ErrorSeverity.HIGH
      default:
        return ErrorSeverity.MEDIUM
    }
  }

  /**
   * 上报错误
   */
  private async reportError(error: AppErrorType): Promise<void> {
    if (!this.config.reportingEndpoint) return

    const report: ErrorReport = {
      error,
      userAgent: navigator.userAgent,
      url: window.location.href,
      sessionId: this.sessionId,
      buildVersion: import.meta.env.VITE_APP_VERSION || 'unknown'
    }

    try {
      await fetch(this.config.reportingEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(report)
      })
    } catch (reportingError) {
      console.warn('Failed to report error:', reportingError)
    }
  }

  /**
   * 清理旧错误
   */
  private cleanupOldErrors(): void {
    if (this.state.errors.length > this.config.maxErrors) {
      const excessCount = this.state.errors.length - this.config.maxErrors
      this.state.errors.splice(0, excessCount)
    }
  }

  /**
   * 生成错误ID
   */
  private generateErrorId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 生成会话ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 判断是否为APM相关错误（更广泛的检测）
   */
  private isAPMRelatedError(error: any, filename?: string): boolean {
    if (!error) return false
    
    const errorStr = error.toString ? error.toString() : String(error)
    const messageStr = error.message ? error.message : ''
    
    // 检查错误消息
    const apmKeywords = [
      'apm-volcano.zuoyebang.com',
      'monitor_web/collect',
      'apmInject',
      'aegisInject',
      'Could not establish connection',
      'ERR_CONNECTION_CLOSED',
      'APM_PLUS_WEB'
    ]
    
    const hasAPMKeyword = apmKeywords.some(keyword => 
      errorStr.includes(keyword) || messageStr.includes(keyword)
    )
    
    // 检查文件名
    const hasAPMFilename = filename && (
      filename.includes('apmInject') || 
      filename.includes('aegisInject') ||
      filename.includes('apm-volcano')
    )
    
    return hasAPMKeyword || hasAPMFilename
  }

  /**
   * 判断是否为应用错误类型
   */
  private isAppErrorType(error: any): error is AppErrorType {
    return error && typeof error === 'object' && 'type' in error && 'id' in error
  }
}

// 创建全局错误处理器实例
export const errorHandler = new ErrorHandler({
  enableLogging: true,
  enableReporting: false, // 在生产环境中可以启用
  logLevel: import.meta.env.DEV ? 'debug' : 'error'
})

export default ErrorHandler