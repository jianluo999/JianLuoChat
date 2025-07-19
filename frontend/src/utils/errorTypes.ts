/**
 * 错误类型定义
 * 定义应用中所有可能的错误类型和相关接口
 */

// 基础错误接口
export interface BaseError {
  id: string
  message: string
  timestamp: number
  stack?: string
  context?: Record<string, any>
}

// 网络错误
export interface NetworkError extends BaseError {
  type: 'network'
  url: string
  status: number
  statusText: string
  method: string
  retryCount: number
  isTimeout: boolean
}

// Matrix相关错误
export interface MatrixError extends BaseError {
  type: 'matrix'
  operation: 'login' | 'sync' | 'send_message' | 'join_room' | 'init_client' | 'crypto'
  roomId?: string
  userId?: string
  errorCode?: string
  isRecoverable: boolean
}

// 认证错误
export interface AuthError extends BaseError {
  type: 'auth'
  operation: 'login' | 'logout' | 'token_refresh' | 'validation'
  isTokenExpired: boolean
  shouldRedirect: boolean
  redirectPath?: string
}

// 性能错误
export interface PerformanceError extends BaseError {
  type: 'performance'
  metric: 'scroll_jank' | 'component_mount' | 'network_slow' | 'memory_leak'
  value: number
  threshold: number
  componentName?: string
}

// 应用错误（组件级错误）
export interface AppError extends BaseError {
  type: 'app'
  componentName: string
  errorBoundary?: string
  props?: Record<string, any>
  isRecoverable: boolean
}

// 联合错误类型
export type AppErrorType = NetworkError | MatrixError | AuthError | PerformanceError | AppError

// 错误严重程度
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// 错误状态
export interface ErrorState {
  errors: AppErrorType[]
  networkErrors: NetworkError[]
  matrixErrors: MatrixError[]
  authErrors: AuthError[]
  performanceErrors: PerformanceError[]
  appErrors: AppError[]
  lastErrorTime: number
  errorCount: number
  isRecovering: boolean
}

// 错误处理配置
export interface ErrorHandlerConfig {
  maxErrors: number
  maxRetries: number
  retryDelay: number
  enableLogging: boolean
  enableReporting: boolean
  logLevel: 'debug' | 'info' | 'warn' | 'error'
  reportingEndpoint?: string
}

// 错误恢复策略
export interface ErrorRecoveryStrategy {
  canRecover: (error: AppErrorType) => boolean
  recover: (error: AppErrorType) => Promise<boolean>
  fallback: (error: AppErrorType) => void
}

// 错误上报数据
export interface ErrorReport {
  error: AppErrorType
  userAgent: string
  url: string
  userId?: string
  sessionId: string
  buildVersion: string
  additionalContext?: Record<string, any>
}