/**
 * 认证状态管理器
 * 提供统一的认证状态验证和管理功能
 */

import { ref, reactive } from 'vue'
import { useErrorHandler } from './errorSetup'

interface AuthState {
  hasValidToken: boolean
  hasLoginInfo: boolean
  isTokenExpired: boolean
  lastValidation: number
  validationInProgress: boolean
  redirectLoop: {
    count: number
    lastPath: string
    timestamp: number
  }
}

interface AuthValidationResult {
  isValid: boolean
  needsRefresh: boolean
  shouldRedirect: boolean
  redirectPath: string
  errors: string[]
}

class AuthStateManager {
  private state = reactive<AuthState>({
    hasValidToken: false,
    hasLoginInfo: false,
    isTokenExpired: false,
    lastValidation: 0,
    validationInProgress: false,
    redirectLoop: {
      count: 0,
      lastPath: '',
      timestamp: 0
    }
  })

  private validationCache = new Map<string, { result: AuthValidationResult; timestamp: number }>()
  private readonly CACHE_DURATION = 5000 // 5秒缓存
  private readonly MAX_REDIRECT_COUNT = 3
  private readonly REDIRECT_RESET_TIME = 10000 // 10秒后重置重定向计数

  constructor() {
    this.setupStorageListener()
  }

  /**
   * 设置localStorage变化监听器
   */
  private setupStorageListener(): void {
    window.addEventListener('storage', (event) => {
      if (event.key === 'matrix_access_token' || event.key === 'matrix_login_info') {
        console.log('🔄 检测到认证信息变化，清除验证缓存')
        this.clearValidationCache()
        this.updateAuthState()
      }
    })
  }

  /**
   * 更新认证状态
   */
  private updateAuthState(): void {
    const token = localStorage.getItem('matrix_access_token')
    const loginInfo = localStorage.getItem('matrix_login_info')

    this.state.hasValidToken = !!token
    this.state.hasLoginInfo = !!loginInfo
    this.state.lastValidation = Date.now()

    // 检查token是否过期
    if (loginInfo) {
      try {
        const loginData = JSON.parse(loginInfo)
        const loginTime = loginData.loginTime || 0
        const tokenAge = Date.now() - loginTime
        const maxAge = 24 * 60 * 60 * 1000 // 24小时

        this.state.isTokenExpired = tokenAge >= maxAge
      } catch (error) {
        console.error('解析登录信息失败:', error)
        this.state.isTokenExpired = true
      }
    } else {
      this.state.isTokenExpired = false
    }
  }

  /**
   * 验证认证状态
   */
  async validateAuthState(currentPath?: string): Promise<AuthValidationResult> {
    // 检查缓存
    const cacheKey = `${currentPath || 'default'}_${this.state.lastValidation}`
    const cached = this.validationCache.get(cacheKey)
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.result
    }

    // 防止并发验证
    if (this.state.validationInProgress) {
      await new Promise(resolve => setTimeout(resolve, 100))
      return this.validateAuthState(currentPath)
    }

    this.state.validationInProgress = true

    try {
      const result = await this.performValidation(currentPath)
      
      // 缓存结果
      this.validationCache.set(cacheKey, {
        result,
        timestamp: Date.now()
      })

      return result
    } finally {
      this.state.validationInProgress = false
    }
  }

  /**
   * 执行实际的验证逻辑
   */
  private async performValidation(currentPath?: string): Promise<AuthValidationResult> {
    this.updateAuthState()

    const result: AuthValidationResult = {
      isValid: false,
      needsRefresh: false,
      shouldRedirect: false,
      redirectPath: '/login',
      errors: []
    }

    // 检查基本认证信息
    if (!this.state.hasValidToken) {
      result.errors.push('缺少访问令牌')
      result.shouldRedirect = true
      result.redirectPath = '/login'
      return result
    }

    if (!this.state.hasLoginInfo) {
      result.errors.push('缺少登录信息')
      result.shouldRedirect = true
      result.redirectPath = '/login'
      return result
    }

    // 检查token是否过期
    if (this.state.isTokenExpired) {
      result.errors.push('访问令牌已过期')
      result.needsRefresh = true
      result.shouldRedirect = true
      result.redirectPath = '/login'
      return result
    }

    // 验证token格式
    const token = localStorage.getItem('matrix_access_token')
    if (token && !this.isValidTokenFormat(token)) {
      result.errors.push('访问令牌格式无效')
      result.shouldRedirect = true
      result.redirectPath = '/login'
      return result
    }

    // 如果所有检查都通过
    result.isValid = true
    result.shouldRedirect = false

    return result
  }

  /**
   * 检查token格式是否有效
   */
  private isValidTokenFormat(token: string): boolean {
    // Matrix access token通常以syt_开头或者是较长的字符串
    return token.length > 10 && (token.startsWith('syt_') || token.length > 50)
  }

  /**
   * 检查重定向循环
   */
  checkRedirectLoop(currentPath: string): boolean {
    const now = Date.now()
    
    // 如果超过重置时间，重置计数
    if (now - this.state.redirectLoop.timestamp > this.REDIRECT_RESET_TIME) {
      this.state.redirectLoop.count = 0
    }

    // 如果是相同路径的重复重定向
    if (this.state.redirectLoop.lastPath === currentPath) {
      this.state.redirectLoop.count++
      this.state.redirectLoop.timestamp = now

      if (this.state.redirectLoop.count >= this.MAX_REDIRECT_COUNT) {
        console.error('🔄 检测到重定向循环:', currentPath)
        
        const { handleAuthError } = useErrorHandler()
        handleAuthError({
          message: `重定向循环检测: ${currentPath}`,
          operation: 'validation',
          isTokenExpired: false,
          shouldRedirect: false,
          context: {
            path: currentPath,
            redirectCount: this.state.redirectLoop.count
          }
        })

        return true
      }
    } else {
      // 不同路径，重置计数
      this.state.redirectLoop.count = 1
      this.state.redirectLoop.lastPath = currentPath
      this.state.redirectLoop.timestamp = now
    }

    return false
  }

  /**
   * 清除无效的认证信息
   */
  clearInvalidAuth(): void {
    console.log('🧹 清除无效的认证信息')
    
    localStorage.removeItem('matrix_access_token')
    localStorage.removeItem('matrix_login_info')
    localStorage.removeItem('token')
    
    this.updateAuthState()
    this.clearValidationCache()
    
    // 重置重定向循环计数
    this.state.redirectLoop.count = 0
    this.state.redirectLoop.lastPath = ''
  }

  /**
   * 清除验证缓存
   */
  private clearValidationCache(): void {
    this.validationCache.clear()
  }

  /**
   * 获取当前认证状态
   */
  getAuthState(): AuthState {
    return { ...this.state }
  }

  /**
   * 检查是否已认证
   */
  isAuthenticated(): boolean {
    this.updateAuthState()
    return this.state.hasValidToken && this.state.hasLoginInfo && !this.state.isTokenExpired
  }

  /**
   * 检查是否需要登录
   */
  needsLogin(): boolean {
    return !this.isAuthenticated()
  }

  /**
   * 获取推荐的重定向路径
   */
  getRecommendedRedirectPath(currentPath: string): string {
    if (this.isAuthenticated()) {
      // 已认证，根据当前路径决定
      if (currentPath === '/login' || currentPath === '/') {
        return '/chat'
      }
      return currentPath
    } else {
      // 未认证，重定向到登录页
      return '/login'
    }
  }

  /**
   * 手动刷新认证状态
   */
  async refresh(): Promise<AuthValidationResult> {
    this.clearValidationCache()
    return this.validateAuthState()
  }

  /**
   * 销毁管理器
   */
  destroy(): void {
    this.clearValidationCache()
    window.removeEventListener('storage', this.setupStorageListener)
  }
}

// 创建全局认证状态管理器实例
export const authStateManager = new AuthStateManager()

// 提供Vue组合式API
export function useAuthState() {
  const state = ref(authStateManager.getAuthState())
  
  return {
    state,
    validateAuthState: authStateManager.validateAuthState.bind(authStateManager),
    checkRedirectLoop: authStateManager.checkRedirectLoop.bind(authStateManager),
    clearInvalidAuth: authStateManager.clearInvalidAuth.bind(authStateManager),
    isAuthenticated: authStateManager.isAuthenticated.bind(authStateManager),
    needsLogin: authStateManager.needsLogin.bind(authStateManager),
    getRecommendedRedirectPath: authStateManager.getRecommendedRedirectPath.bind(authStateManager),
    refresh: authStateManager.refresh.bind(authStateManager)
  }
}

export default AuthStateManager