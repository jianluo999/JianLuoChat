/**
 * 网络状态监控服务
 * 监控网络连接状态，提供网络状态反馈
 */

import { ref, reactive } from 'vue'
import { errorHandler } from './errorHandler'

interface NetworkStatus {
  isOnline: boolean
  connectionType: string
  effectiveType: string
  downlink: number
  rtt: number
  lastChecked: number
  consecutiveFailures: number
}

class NetworkStatusMonitor {
  private status = reactive<NetworkStatus>({
    isOnline: navigator.onLine,
    connectionType: 'unknown',
    effectiveType: 'unknown',
    downlink: 0,
    rtt: 0,
    lastChecked: Date.now(),
    consecutiveFailures: 0
  })

  private checkInterval: number | null = null
  private listeners: ((status: NetworkStatus) => void)[] = []

  constructor() {
    this.setupEventListeners()
    this.updateConnectionInfo()
    this.startPeriodicCheck()
  }

  /**
   * 设置网络状态事件监听器
   */
  private setupEventListeners(): void {
    // 监听在线/离线状态变化
    window.addEventListener('online', () => {
      console.log('🌐 网络连接已恢复')
      this.status.isOnline = true
      this.status.consecutiveFailures = 0
      this.updateConnectionInfo()
      this.notifyListeners()
    })

    window.addEventListener('offline', () => {
      console.log('🌐 网络连接已断开')
      this.status.isOnline = false
      this.notifyListeners()
      
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

    // 监听连接信息变化（如果支持）
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      connection.addEventListener('change', () => {
        this.updateConnectionInfo()
        this.notifyListeners()
      })
    }
  }

  /**
   * 更新连接信息
   */
  private updateConnectionInfo(): void {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      this.status.connectionType = connection.type || 'unknown'
      this.status.effectiveType = connection.effectiveType || 'unknown'
      this.status.downlink = connection.downlink || 0
      this.status.rtt = connection.rtt || 0
    }
    this.status.lastChecked = Date.now()
  }

  /**
   * 开始定期检查网络状态
   */
  private startPeriodicCheck(): void {
    this.checkInterval = window.setInterval(() => {
      this.checkNetworkHealth()
    }, 30000) // 每30秒检查一次
  }

  /**
   * 检查网络健康状态
   */
  private async checkNetworkHealth(): Promise<void> {
    if (!this.status.isOnline) return

    try {
      const startTime = performance.now()
      
      // 使用一个轻量级的请求来测试网络连接
      const response = await fetch('/favicon.ico', {
        method: 'HEAD',
        cache: 'no-cache',
        signal: AbortSignal.timeout(5000)
      })

      const endTime = performance.now()
      const responseTime = endTime - startTime

      if (response.ok) {
        this.status.consecutiveFailures = 0
        
        // 如果响应时间过长，报告性能问题
        if (responseTime > 3000) {
          errorHandler.handlePerformanceError({
            message: `Slow network response: ${responseTime}ms`,
            metric: 'network_slow',
            value: responseTime,
            threshold: 3000,
            context: {
              url: '/favicon.ico',
              responseTime
            }
          })
        }
      } else {
        this.handleNetworkFailure()
      }
    } catch (error) {
      this.handleNetworkFailure()
    }

    this.updateConnectionInfo()
    this.notifyListeners()
  }

  /**
   * 处理网络失败
   */
  private handleNetworkFailure(): void {
    this.status.consecutiveFailures++
    
    if (this.status.consecutiveFailures >= 3) {
      console.warn('🌐 检测到网络连接不稳定')
      
      errorHandler.handleNetworkError({
        message: `Network instability detected (${this.status.consecutiveFailures} consecutive failures)`,
        url: 'network-health-check',
        status: 0,
        statusText: 'unstable',
        method: 'HEAD',
        retryCount: this.status.consecutiveFailures,
        isTimeout: false,
        context: {
          consecutiveFailures: this.status.consecutiveFailures
        }
      })
    }
  }

  /**
   * 通知所有监听器
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener({ ...this.status })
      } catch (error) {
        console.error('Network status listener error:', error)
      }
    })
  }

  /**
   * 添加状态变化监听器
   */
  addListener(callback: (status: NetworkStatus) => void): () => void {
    this.listeners.push(callback)
    
    // 返回取消监听的函数
    return () => {
      const index = this.listeners.indexOf(callback)
      if (index > -1) {
        this.listeners.splice(index, 1)
      }
    }
  }

  /**
   * 获取当前网络状态
   */
  getStatus(): NetworkStatus {
    return { ...this.status }
  }

  /**
   * 检查是否在线
   */
  isOnline(): boolean {
    return this.status.isOnline
  }

  /**
   * 检查网络是否稳定
   */
  isStable(): boolean {
    return this.status.isOnline && this.status.consecutiveFailures < 2
  }

  /**
   * 获取网络质量评级
   */
  getNetworkQuality(): 'excellent' | 'good' | 'fair' | 'poor' | 'offline' {
    if (!this.status.isOnline) return 'offline'
    
    if (this.status.consecutiveFailures > 0) return 'poor'
    
    // 基于连接类型和RTT评估网络质量
    if (this.status.effectiveType === '4g' && this.status.rtt < 100) return 'excellent'
    if (this.status.effectiveType === '4g' && this.status.rtt < 200) return 'good'
    if (this.status.effectiveType === '3g' || this.status.rtt < 500) return 'fair'
    
    return 'poor'
  }

  /**
   * 获取网络质量描述
   */
  getNetworkQualityDescription(): string {
    const quality = this.getNetworkQuality()
    
    switch (quality) {
      case 'excellent': return '网络连接优秀'
      case 'good': return '网络连接良好'
      case 'fair': return '网络连接一般'
      case 'poor': return '网络连接较差'
      case 'offline': return '网络连接断开'
      default: return '网络状态未知'
    }
  }

  /**
   * 手动触发网络检查
   */
  async checkNow(): Promise<NetworkStatus> {
    await this.checkNetworkHealth()
    return this.getStatus()
  }

  /**
   * 销毁监控器
   */
  destroy(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval)
      this.checkInterval = null
    }
    
    this.listeners.length = 0
    
    // 移除事件监听器
    window.removeEventListener('online', this.setupEventListeners)
    window.removeEventListener('offline', this.setupEventListeners)
  }
}

// 创建全局网络状态监控器实例
export const networkStatusMonitor = new NetworkStatusMonitor()

// 导出类型
export type { NetworkStatus }

// 提供Vue组合式API
export function useNetworkStatus() {
  const status = ref(networkStatusMonitor.getStatus())
  
  const unsubscribe = networkStatusMonitor.addListener((newStatus) => {
    status.value = newStatus
  })
  
  return {
    status,
    isOnline: () => networkStatusMonitor.isOnline(),
    isStable: () => networkStatusMonitor.isStable(),
    getQuality: () => networkStatusMonitor.getNetworkQuality(),
    getQualityDescription: () => networkStatusMonitor.getNetworkQualityDescription(),
    checkNow: () => networkStatusMonitor.checkNow(),
    unsubscribe
  }
}

export default NetworkStatusMonitor