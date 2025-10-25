import { ref, reactive, computed } from 'vue'

// 网络连接状态枚举
export enum NetworkStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
  SLOW = 'slow',
  RECONNECTING = 'reconnecting'
}

// 网络质量指标
interface NetworkMetrics {
  rtt: number // 往返时间 (ms)
  downlink: number // 下载速度 (Mbps)
  effectiveType: string // 网络类型 (slow-2g, 2g, 3g, 4g)
  saveData: boolean // 是否启用省流量模式
}

// 网络事件回调
interface NetworkEventCallback {
  (status: NetworkStatus, metrics?: NetworkMetrics): void
}

// 网络监控配置
interface NetworkMonitorConfig {
  pingUrl?: string
  pingInterval?: number
  slowThreshold?: number
  retryAttempts?: number
  retryDelay?: number
}

// 网络监控类
export class NetworkMonitor {
  private status = ref<NetworkStatus>(NetworkStatus.ONLINE)
  private metrics = reactive<NetworkMetrics>({
    rtt: 0,
    downlink: 0,
    effectiveType: '4g',
    saveData: false
  })
  private isMonitoring = false
  private pingInterval: number | null = null
  private eventCallbacks: NetworkEventCallback[] = []
  
  // 配置
  private config: NetworkMonitorConfig = {
    pingUrl: 'https://httpbin.org/get',
    pingInterval: 30000, // 30秒
    slowThreshold: 500, // 500ms
    retryAttempts: 3,
    retryDelay: 5000 // 5秒
  }

  constructor(config?: NetworkMonitorConfig) {
    if (config) {
      this.config = { ...this.config, ...config }
    }
    
    // 监听浏览器原生网络事件
    this.setupNativeEventListeners()
    
    // 初始化网络指标
    this.initializeNetworkMetrics()
  }

  // 设置原生事件监听器
  private setupNativeEventListeners(): void {
    window.addEventListener('online', () => {
      this.handleOnline()
    })
    
    window.addEventListener('offline', () => {
      this.handleOffline()
    })
    
    // 监听网络变化 (如果支持)
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      connection.addEventListener('change', () => {
        this.updateNetworkMetrics()
      })
    }
  }

  // 处理在线事件
  private handleOnline(): void {
    console.log('🌐 网络连接已恢复')
    this.status.value = NetworkStatus.RECONNECTING
    
    // 尝试ping服务器确认连接
    this.pingServer().then(() => {
      this.status.value = NetworkStatus.ONLINE
      this.notifyCallbacks(NetworkStatus.ONLINE)
    }).catch(() => {
      // 如果ping失败，继续重试
      this.retryPing()
    })
  }

  // 处理离线事件
  private handleOffline(): void {
    console.log('🌐 网络连接已断开')
    this.status.value = NetworkStatus.OFFLINE
    this.notifyCallbacks(NetworkStatus.OFFLINE)
    
    // 停止ping
    if (this.pingInterval) {
      clearInterval(this.pingInterval)
      this.pingInterval = null
    }
  }

  // 初始化网络指标
  private initializeNetworkMetrics(): void {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      this.metrics.rtt = connection.rtt || 0
      this.metrics.downlink = connection.downlink || 0
      this.metrics.effectiveType = connection.effectiveType || '4g'
      this.metrics.saveData = connection.saveData || false
    }
  }

  // 更新网络指标
  private updateNetworkMetrics(): void {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      this.metrics.rtt = connection.rtt || 0
      this.metrics.downlink = connection.downlink || 0
      this.metrics.effectiveType = connection.effectiveType || '4g'
      this.metrics.saveData = connection.saveData || false
    }
  }

  // Ping服务器
  private async pingServer(): Promise<boolean> {
    const startTime = performance.now()
    
    try {
      const response = await fetch(this.config.pingUrl!, {
        method: 'GET',
        cache: 'no-cache',
        signal: AbortSignal.timeout(10000) // 10秒超时
      })
      
      const endTime = performance.now()
      const rtt = Math.round(endTime - startTime)
      
      if (response.ok) {
        this.metrics.rtt = rtt
        return true
      }
    } catch (error) {
      console.warn('❌ Ping服务器失败:', error)
    }
    
    return false
  }

  // 重试ping
  private async retryPing(): Promise<void> {
    for (let attempt = 1; attempt <= this.config.retryAttempts!; attempt++) {
      console.log(`🔄 第 ${attempt} 次重试ping服务器...`)
      
      const success = await this.pingServer()
      if (success) {
        this.status.value = NetworkStatus.ONLINE
        this.notifyCallbacks(NetworkStatus.ONLINE)
        return
      }
      
      if (attempt < this.config.retryAttempts!) {
        await new Promise(resolve => 
          setTimeout(resolve, this.config.retryDelay!)
        )
      }
    }
    
    // 所有重试都失败
    this.status.value = NetworkStatus.SLOW
    this.notifyCallbacks(NetworkStatus.SLOW)
  }

  // 开始监控
  startMonitoring(): void {
    if (this.isMonitoring) return
    
    this.isMonitoring = true
    console.log('🔍 开始网络监控')
    
    // 立即检查一次网络状态
    this.checkNetworkStatus()
    
    // 设置定期ping
    this.pingInterval = setInterval(() => {
      this.checkNetworkStatus()
    }, this.config.pingInterval!)
  }

  // 停止监控
  stopMonitoring(): void {
    this.isMonitoring = false
    console.log('⏹️ 停止网络监控')
    
    if (this.pingInterval) {
      clearInterval(this.pingInterval)
      this.pingInterval = null
    }
  }

  // 检查网络状态
  private async checkNetworkStatus(): Promise<void> {
    if (!navigator.onLine) {
      this.handleOffline()
      return
    }
    
    const success = await this.pingServer()
    
    if (success) {
      // 检查是否为慢速网络
      if (this.metrics.rtt > this.config.slowThreshold!) {
        if (this.status.value !== NetworkStatus.SLOW) {
          this.status.value = NetworkStatus.SLOW
          this.notifyCallbacks(NetworkStatus.SLOW)
        }
      } else {
        if (this.status.value !== NetworkStatus.ONLINE) {
          this.status.value = NetworkStatus.ONLINE
          this.notifyCallbacks(NetworkStatus.ONLINE)
        }
      }
    } else {
      this.status.value = NetworkStatus.SLOW
      this.notifyCallbacks(NetworkStatus.SLOW)
    }
  }

  // 添加事件监听器
  addEventListener(callback: NetworkEventCallback): void {
    this.eventCallbacks.push(callback)
  }

  // 移除事件监听器
  removeEventListener(callback: NetworkEventCallback): void {
    const index = this.eventCallbacks.indexOf(callback)
    if (index > -1) {
      this.eventCallbacks.splice(index, 1)
    }
  }

  // 通知回调函数
  private notifyCallbacks(status: NetworkStatus): void {
    this.eventCallbacks.forEach(callback => {
      try {
        callback(status, { ...this.metrics })
      } catch (error) {
        console.error('❌ 网络事件回调执行失败:', error)
      }
    })
  }

  // 获取当前状态
  getStatus(): NetworkStatus {
    return this.status.value
  }

  // 获取网络指标
  getMetrics(): NetworkMetrics {
    return { ...this.metrics }
  }

  // 检查是否在线
  isOnline(): boolean {
    return this.status.value === NetworkStatus.ONLINE
  }

  // 检查是否离线
  isOffline(): boolean {
    return this.status.value === NetworkStatus.OFFLINE
  }

  // 检查是否慢速
  isSlow(): boolean {
    return this.status.value === NetworkStatus.SLOW
  }

  // 获取状态文本
  getStatusText(): string {
    switch (this.status.value) {
      case NetworkStatus.ONLINE:
        return '网络连接正常'
      case NetworkStatus.OFFLINE:
        return '网络连接断开'
      case NetworkStatus.SLOW:
        return '网络连接缓慢'
      case NetworkStatus.RECONNECTING:
        return '正在重新连接...'
      default:
        return '未知状态'
    }
  }

  // 获取状态图标
  getStatusIcon(): string {
    switch (this.status.value) {
      case NetworkStatus.ONLINE:
        return '✅'
      case NetworkStatus.OFFLINE:
        return '❌'
      case NetworkStatus.SLOW:
        return '⚠️'
      case NetworkStatus.RECONNECTING:
        return '🔄'
      default:
        return '❓'
    }
  }

  // 获取网络质量评分 (1-10)
  getQualityScore(): number {
    if (this.status.value === NetworkStatus.OFFLINE) return 1
    if (this.status.value === NetworkStatus.SLOW) return 3
    
    // 基于RTT和网络类型计算质量评分
    let score = 10
    
    // RTT影响 (越低越好)
    if (this.metrics.rtt > 100) score -= Math.min(3, Math.floor(this.metrics.rtt / 100))
    if (this.metrics.rtt > 500) score -= 2
    
    // 网络类型影响
    switch (this.metrics.effectiveType) {
      case 'slow-2g':
        score -= 4
        break
      case '2g':
        score -= 3
        break
      case '3g':
        score -= 2
        break
      case '4g':
        break
      case '5g':
        score += 1
        break
    }
    
    // 省流量模式影响
    if (this.metrics.saveData) score -= 1
    
    return Math.max(1, Math.min(10, score))
  }
}

// 创建全局网络监控实例
export const networkMonitor = new NetworkMonitor()

// Vue 组合式函数
export function useNetworkMonitor() {
  const status = computed(() => networkMonitor.getStatus())
  const metrics = computed(() => networkMonitor.getMetrics())
  const isOnline = computed(() => networkMonitor.isOnline())
  const isOffline = computed(() => networkMonitor.isOffline())
  const isSlow = computed(() => networkMonitor.isSlow())
  const statusText = computed(() => networkMonitor.getStatusText())
  const statusIcon = computed(() => networkMonitor.getStatusIcon())
  const qualityScore = computed(() => networkMonitor.getQualityScore())

  return {
    status,
    metrics,
    isOnline,
    isOffline,
    isSlow,
    statusText,
    statusIcon,
    qualityScore,
    
    // 方法
    startMonitoring: () => networkMonitor.startMonitoring(),
    stopMonitoring: () => networkMonitor.stopMonitoring(),
    addEventListener: (callback: NetworkEventCallback) => 
      networkMonitor.addEventListener(callback),
    removeEventListener: (callback: NetworkEventCallback) => 
      networkMonitor.removeEventListener(callback)
  }
}