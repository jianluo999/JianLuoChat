/**
 * Matrix Store 协调器监控工具
 * 用于监控和管理所有注册的Matrix stores
 */

import { matrixStoreCoordinator } from './matrixStoreCoordinator'

export class MatrixStoreMonitor {
  private static instance: MatrixStoreMonitor
  private monitorInterval: any = null
  private isMonitoring = false

  static getInstance(): MatrixStoreMonitor {
    if (!MatrixStoreMonitor.instance) {
      MatrixStoreMonitor.instance = new MatrixStoreMonitor()
    }
    return MatrixStoreMonitor.instance
  }

  /**
   * 开始监控所有Matrix stores
   */
  startMonitoring(intervalMs: number = 5000): void {
    if (this.isMonitoring) {
      console.log('⚠️ 监控已在运行中')
      return
    }

    this.isMonitoring = true
    console.log('🔍 开始监控Matrix Store协调器...')

    this.monitorInterval = setInterval(() => {
      this.logCoordinationStatus()
    }, intervalMs)

    // 立即执行一次
    this.logCoordinationStatus()
  }

  /**
   * 停止监控
   */
  stopMonitoring(): void {
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval)
      this.monitorInterval = null
    }
    this.isMonitoring = false
    console.log('🛑 Matrix Store监控已停止')
  }

  /**
   * 记录协调状态
   */
  private logCoordinationStatus(): void {
    const status = matrixStoreCoordinator.getCoordinationStatus()
    
    console.group('📊 Matrix Store 协调状态')
    console.log(`🎯 主要Store: ${status.primaryStore || '无'}`)
    console.log(`📈 总Store数: ${status.totalStores}`)
    console.log(`✅ 活跃Store数: ${status.activeStores}`)
    console.log(`⏳ 事件队列长度: ${status.eventQueueLength}`)
    console.log(`🔄 正在处理事件: ${status.isProcessing ? '是' : '否'}`)
    
    if (status.stores.length > 0) {
      console.table(status.stores.map(store => ({
        'Store ID': store.id,
        '优先级': store.priority,
        '状态': store.isActive ? '✅ 活跃' : '❌ 不活跃',
        '健康': store.isHealthy ? '✅ 健康' : '❌ 不健康',
        '房间数': store.roomCount,
        '消息房间数': store.messageRoomCount,
        '最后活动': store.lastActivity
      })))
    }
    
    console.groupEnd()
  }

  /**
   * 获取详细的协调状态
   */
  getDetailedStatus(): any {
    return matrixStoreCoordinator.getCoordinationStatus()
  }

  /**
   * 手动切换主要store
   */
  switchPrimaryStore(storeId: string): boolean {
    const result = matrixStoreCoordinator.switchPrimaryStore(storeId)
    if (result) {
      console.log(`✅ 成功切换主要Store到: ${storeId}`)
    } else {
      console.error(`❌ 切换主要Store失败: ${storeId}`)
    }
    return result
  }

  /**
   * 获取所有已注册的stores列表
   */
  getRegisteredStores(): string[] {
    const status = matrixStoreCoordinator.getCoordinationStatus()
    return status.stores.map(store => store.id)
  }

  /**
   * 检查特定store是否已注册
   */
  isStoreRegistered(storeId: string): boolean {
    return this.getRegisteredStores().includes(storeId)
  }

  /**
   * 获取当前主要store
   */
  getPrimaryStore(): string | null {
    const status = matrixStoreCoordinator.getCoordinationStatus()
    return status.primaryStore
  }

  /**
   * 生成协调状态报告
   */
  generateStatusReport(): string {
    const status = matrixStoreCoordinator.getCoordinationStatus()
    const timestamp = new Date().toLocaleString()
    
    let report = `Matrix Store 协调状态报告 - ${timestamp}\n`
    report += `${'='.repeat(50)}\n\n`
    
    report += `概览:\n`
    report += `- 主要Store: ${status.primaryStore || '无'}\n`
    report += `- 总Store数: ${status.totalStores}\n`
    report += `- 活跃Store数: ${status.activeStores}\n`
    report += `- 事件队列长度: ${status.eventQueueLength}\n`
    report += `- 正在处理事件: ${status.isProcessing ? '是' : '否'}\n\n`
    
    if (status.stores.length > 0) {
      report += `Store详情:\n`
      status.stores.forEach(store => {
        report += `\n[${store.id}]\n`
        report += `  - 优先级: ${store.priority}\n`
        report += `  - 状态: ${store.isActive ? '活跃' : '不活跃'}\n`
        report += `  - 健康: ${store.isHealthy ? '健康' : '不健康'}\n`
        report += `  - 房间数: ${store.roomCount}\n`
        report += `  - 消息房间数: ${store.messageRoomCount}\n`
        report += `  - 最后活动: ${store.lastActivity}\n`
      })
    }
    
    return report
  }

  /**
   * 导出状态到文件
   */
  exportStatusToFile(): void {
    const report = this.generateStatusReport()
    const blob = new Blob([report], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    
    const a = document.createElement('a')
    a.href = url
    a.download = `matrix-store-status-${Date.now()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    console.log('📄 协调状态报告已导出')
  }
}

// 导出单例实例
export const matrixStoreMonitor = MatrixStoreMonitor.getInstance()

// 便捷函数
export const startStoreMonitoring = (intervalMs?: number) => {
  matrixStoreMonitor.startMonitoring(intervalMs)
}

export const stopStoreMonitoring = () => {
  matrixStoreMonitor.stopMonitoring()
}

export const getStoreStatus = () => {
  return matrixStoreMonitor.getDetailedStatus()
}

export const switchPrimaryStore = (storeId: string) => {
  return matrixStoreMonitor.switchPrimaryStore(storeId)
}

// 在开发环境下自动开始监控
if (process.env.NODE_ENV === 'development') {
  // 延迟启动，等待stores初始化
  setTimeout(() => {
    console.log('🔍 开发环境：自动启动Matrix Store监控')
    startStoreMonitoring(10000) // 10秒间隔
  }, 5000)
}