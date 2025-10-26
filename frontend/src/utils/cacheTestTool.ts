/**
 * 缓存测试工具
 * 用于测试和监控房间列表稳定器的性能
 */

import { roomListStabilizer, getCacheStats, forceRefreshCache } from './roomListStabilizer'
import { matrixStoreCoordinator } from './matrixStoreCoordinator'

class CacheTestTool {
  private static instance: CacheTestTool
  private testResults: any[] = []
  private isMonitoring = false
  private monitorInterval: NodeJS.Timeout | null = null

  static getInstance(): CacheTestTool {
    if (!CacheTestTool.instance) {
      CacheTestTool.instance = new CacheTestTool()
    }
    return CacheTestTool.instance
  }

  /**
   * 开始监控缓存性能
   */
  startMonitoring(intervalMs = 5000): void {
    if (this.isMonitoring) {
      console.log('⚠️ 缓存监控已在运行')
      return
    }

    this.isMonitoring = true
    console.log(`🔍 [缓存监控] 开始监控，间隔: ${intervalMs}ms`)

    this.monitorInterval = setInterval(() => {
      this.collectMetrics()
    }, intervalMs)
  }

  /**
   * 停止监控
   */
  stopMonitoring(): void {
    if (!this.isMonitoring) {
      console.log('⚠️ 缓存监控未运行')
      return
    }

    this.isMonitoring = false
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval)
      this.monitorInterval = null
    }
    console.log('🛑 [缓存监控] 监控已停止')
  }

  /**
   * 收集性能指标
   */
  private collectMetrics(): void {
    const stats = getCacheStats()
    const coordinationStatus = matrixStoreCoordinator.getCoordinationStatus()
    
    const metrics = {
      timestamp: new Date().toISOString(),
      cache: {
        roomCacheSize: stats.roomCache.size,
        messageCacheSize: stats.messageCache.size,
        recentRoomFetches: stats.fetchHistory.recentRoomFetches,
        recentMessageFetches: stats.fetchHistory.recentMessageFetches,
        totalRoomCacheHits: stats.roomCache.entries.reduce((sum: number, entry: any) => sum + entry.hits, 0),
        totalMessageCacheHits: stats.messageCache.entries.reduce((sum: number, entry: any) => sum + entry.hits, 0)
      },
      coordination: {
        primaryStore: coordinationStatus.primaryStore,
        activeStores: coordinationStatus.activeStores,
        eventQueueLength: coordinationStatus.eventQueueLength,
        isProcessing: coordinationStatus.isProcessing
      },
      performance: {
        memoryUsage: this.getMemoryUsage(),
        cacheEfficiency: this.calculateCacheEfficiency(stats)
      }
    }

    this.testResults.push(metrics)
    
    // 保持最近100条记录
    if (this.testResults.length > 100) {
      this.testResults = this.testResults.slice(-100)
    }

    console.log('📊 [缓存指标]', {
      房间缓存: `${metrics.cache.roomCacheSize}个条目`,
      消息缓存: `${metrics.cache.messageCacheSize}个条目`,
      近期房间请求: `${metrics.cache.recentRoomFetches}次`,
      近期消息请求: `${metrics.cache.recentMessageFetches}次`,
      缓存效率: `${metrics.performance.cacheEfficiency.toFixed(1)}%`
    })
  }

  /**
   * 计算缓存效率
   */
  private calculateCacheEfficiency(stats: any): number {
    const totalHits = stats.roomCache.entries.reduce((sum: number, entry: any) => sum + entry.hits, 0) +
                     stats.messageCache.entries.reduce((sum: number, entry: any) => sum + entry.hits, 0)
    
    const totalRequests = stats.fetchHistory.roomFetches + stats.fetchHistory.messageFetches
    
    if (totalRequests === 0) return 0
    
    return (totalHits / (totalHits + totalRequests)) * 100
  }

  /**
   * 获取内存使用情况
   */
  private getMemoryUsage(): any {
    if (typeof performance !== 'undefined' && (performance as any).memory) {
      const memory = (performance as any).memory
      return {
        used: Math.round(memory.usedJSHeapSize / 1024 / 1024),
        total: Math.round(memory.totalJSHeapSize / 1024 / 1024),
        limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024)
      }
    }
    return { used: 0, total: 0, limit: 0 }
  }

  /**
   * 运行缓存压力测试
   */
  async runStressTest(iterations = 10): Promise<void> {
    console.log(`🧪 [压力测试] 开始缓存压力测试，迭代次数: ${iterations}`)
    
    const startTime = Date.now()
    const results = []

    for (let i = 0; i < iterations; i++) {
      const iterationStart = Date.now()
      
      try {
        // 模拟房间获取
        const roomFetchPromise = roomListStabilizer.getStableRoomList(`test-store-${i}`, async () => {
          // 模拟延迟
          await new Promise(resolve => setTimeout(resolve, Math.random() * 100))
          return Array.from({ length: 10 + Math.floor(Math.random() * 20) }, (_, idx) => ({
            id: `room-${i}-${idx}`,
            name: `Test Room ${i}-${idx}`,
            type: 'public'
          }))
        })

        // 模拟消息获取
        const messageFetchPromise = roomListStabilizer.getStableMessages(`room-${i}`, `test-store-${i}`, async () => {
          // 模拟延迟
          await new Promise(resolve => setTimeout(resolve, Math.random() * 50))
          return Array.from({ length: 5 + Math.floor(Math.random() * 15) }, (_, idx) => ({
            id: `msg-${i}-${idx}`,
            content: `Test message ${i}-${idx}`,
            timestamp: Date.now()
          }))
        })

        const [rooms, messages] = await Promise.all([roomFetchPromise, messageFetchPromise])
        
        const iterationTime = Date.now() - iterationStart
        results.push({
          iteration: i,
          time: iterationTime,
          roomCount: rooms.length,
          messageCount: messages.length,
          success: true
        })

        console.log(`✅ [压力测试] 迭代 ${i + 1}/${iterations} 完成，耗时: ${iterationTime}ms`)
        
      } catch (error) {
        const iterationTime = Date.now() - iterationStart
        results.push({
          iteration: i,
          time: iterationTime,
          error: error.message,
          success: false
        })
        console.error(`❌ [压力测试] 迭代 ${i + 1} 失败:`, error)
      }

      // 短暂延迟避免过度压力
      await new Promise(resolve => setTimeout(resolve, 10))
    }

    const totalTime = Date.now() - startTime
    const successCount = results.filter(r => r.success).length
    const avgTime = results.reduce((sum, r) => sum + r.time, 0) / results.length

    console.log(`🏁 [压力测试] 测试完成`)
    console.log(`📊 [测试结果] 总耗时: ${totalTime}ms, 成功率: ${(successCount/iterations*100).toFixed(1)}%, 平均响应时间: ${avgTime.toFixed(1)}ms`)
    
    // 显示缓存统计
    const finalStats = getCacheStats()
    console.log(`📈 [缓存统计] 房间缓存: ${finalStats.roomCache.size}个, 消息缓存: ${finalStats.messageCache.size}个`)
  }

  /**
   * 清理测试数据
   */
  cleanup(): void {
    console.log('🧹 [清理] 清理测试数据和缓存')
    forceRefreshCache()
    this.testResults = []
    this.stopMonitoring()
  }

  /**
   * 获取测试报告
   */
  getTestReport(): any {
    const stats = getCacheStats()
    const coordinationStatus = matrixStoreCoordinator.getCoordinationStatus()
    
    return {
      summary: {
        totalMetrics: this.testResults.length,
        monitoringActive: this.isMonitoring,
        lastUpdate: this.testResults.length > 0 ? this.testResults[this.testResults.length - 1].timestamp : null
      },
      currentStats: stats,
      coordinationStatus,
      recentMetrics: this.testResults.slice(-10),
      recommendations: this.generateRecommendations(stats)
    }
  }

  /**
   * 生成优化建议
   */
  private generateRecommendations(stats: any): string[] {
    const recommendations = []
    
    // 检查缓存命中率
    const efficiency = this.calculateCacheEfficiency(stats)
    if (efficiency < 50) {
      recommendations.push('缓存命中率较低，考虑增加缓存时间或减少请求频率')
    }
    
    // 检查缓存大小
    if (stats.roomCache.size > 50) {
      recommendations.push('房间缓存条目过多，考虑清理过期缓存')
    }
    
    if (stats.messageCache.size > 200) {
      recommendations.push('消息缓存条目过多，考虑减少缓存时间')
    }
    
    // 检查请求频率
    if (stats.fetchHistory.recentRoomFetches > 5) {
      recommendations.push('房间请求频率过高，检查是否有重复请求')
    }
    
    if (stats.fetchHistory.recentMessageFetches > 15) {
      recommendations.push('消息请求频率过高，考虑增加缓存时间')
    }
    
    if (recommendations.length === 0) {
      recommendations.push('缓存性能良好，无需优化')
    }
    
    return recommendations
  }

  /**
   * 显示实时统计
   */
  showLiveStats(): void {
    const report = this.getTestReport()
    
    console.group('📊 缓存性能报告')
    console.log('🔍 监控状态:', report.summary.monitoringActive ? '运行中' : '已停止')
    console.log('📈 缓存效率:', `${this.calculateCacheEfficiency(report.currentStats).toFixed(1)}%`)
    console.log('🏠 房间缓存:', `${report.currentStats.roomCache.size}个条目`)
    console.log('💬 消息缓存:', `${report.currentStats.messageCache.size}个条目`)
    console.log('🔄 近期请求:', `房间:${report.currentStats.fetchHistory.recentRoomFetches}, 消息:${report.currentStats.fetchHistory.recentMessageFetches}`)
    console.log('💡 建议:', report.recommendations)
    console.groupEnd()
  }
}

// 导出单例和便捷函数
export const cacheTestTool = CacheTestTool.getInstance()

export const startCacheMonitoring = (intervalMs = 5000) => {
  cacheTestTool.startMonitoring(intervalMs)
}

export const stopCacheMonitoring = () => {
  cacheTestTool.stopMonitoring()
}

export const runCacheStressTest = (iterations = 10) => {
  return cacheTestTool.runStressTest(iterations)
}

export const showCacheStats = () => {
  cacheTestTool.showLiveStats()
}

export const cleanupCacheTest = () => {
  cacheTestTool.cleanup()
}

// 全局暴露给控制台使用
if (typeof window !== 'undefined') {
  (window as any).cacheTest = {
    start: startCacheMonitoring,
    stop: stopCacheMonitoring,
    stress: runCacheStressTest,
    stats: showCacheStats,
    cleanup: cleanupCacheTest,
    report: () => cacheTestTool.getTestReport()
  }
  
  console.log('🛠️ 缓存测试工具已加载，使用 window.cacheTest 访问')
}