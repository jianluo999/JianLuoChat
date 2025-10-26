/**
 * 缓存优化测试脚本
 * 在浏览器控制台中运行，验证缓存策略是否正常工作
 */

console.log('🧪 开始缓存优化测试...')

// 测试函数
async function testCacheOptimization() {
  console.group('📊 缓存优化测试报告')
  
  try {
    // 1. 检查缓存工具是否可用
    if (typeof window.cacheTest === 'undefined') {
      console.error('❌ 缓存测试工具未加载，请确保已导入 cacheTestTool.ts')
      return
    }
    
    console.log('✅ 缓存测试工具已加载')
    
    // 2. 显示当前缓存状态
    console.log('\n📈 当前缓存状态:')
    window.cacheTest.stats()
    
    // 3. 开始监控
    console.log('\n🔍 开始缓存监控...')
    window.cacheTest.start(5000)
    
    // 4. 等待一段时间收集数据
    console.log('\n⏳ 等待10秒收集缓存数据...')
    await new Promise(resolve => setTimeout(resolve, 10000))
    
    // 5. 显示监控结果
    console.log('\n📊 监控结果:')
    const report = window.cacheTest.report()
    
    console.log('缓存效率:', calculateCacheEfficiency(report.currentStats))
    console.log('房间缓存条目:', report.currentStats.roomCache.size)
    console.log('消息缓存条目:', report.currentStats.messageCache.size)
    console.log('近期房间请求:', report.currentStats.fetchHistory.recentRoomFetches)
    console.log('近期消息请求:', report.currentStats.fetchHistory.recentMessageFetches)
    
    // 6. 运行压力测试
    console.log('\n🧪 运行压力测试...')
    await window.cacheTest.stress(5)
    
    // 7. 显示最终统计
    console.log('\n📈 最终统计:')
    window.cacheTest.stats()
    
    // 8. 生成建议
    const finalReport = window.cacheTest.report()
    console.log('\n💡 优化建议:')
    finalReport.recommendations.forEach(rec => console.log(`  • ${rec}`))
    
    console.log('\n✅ 缓存优化测试完成')
    
  } catch (error) {
    console.error('❌ 测试过程中出现错误:', error)
  } finally {
    console.groupEnd()
  }
}

// 计算缓存效率的辅助函数
function calculateCacheEfficiency(stats) {
  const totalHits = stats.roomCache.entries.reduce((sum, entry) => sum + entry.hits, 0) +
                   stats.messageCache.entries.reduce((sum, entry) => sum + entry.hits, 0)
  
  const totalRequests = stats.fetchHistory.roomFetches + stats.fetchHistory.messageFetches
  
  if (totalRequests === 0) return '0%'
  
  const efficiency = (totalHits / (totalHits + totalRequests)) * 100
  return `${efficiency.toFixed(1)}%`
}

// 快速测试函数
function quickTest() {
  console.log('🚀 快速缓存测试')
  
  if (typeof window.cacheTest === 'undefined') {
    console.error('❌ 缓存测试工具未加载')
    return
  }
  
  // 显示当前状态
  window.cacheTest.stats()
  
  // 开始监控
  window.cacheTest.start(3000)
  
  console.log('✅ 监控已启动，3秒后查看结果')
  setTimeout(() => {
    window.cacheTest.stats()
  }, 3000)
}

// 清理测试环境
function cleanupTest() {
  console.log('🧹 清理测试环境')
  
  if (typeof window.cacheTest !== 'undefined') {
    window.cacheTest.cleanup()
    console.log('✅ 缓存已清理')
  }
  
  // 清理控制台
  console.clear()
  console.log('🎯 测试环境已重置')
}

// 监控房间列表稳定性
function monitorRoomStability() {
  console.log('🏠 开始监控房间列表稳定性...')
  
  let lastRoomCount = 0
  let changeCount = 0
  
  const checkRooms = () => {
    // 尝试获取Matrix store的房间数量
    try {
      const matrixStore = window.Vue?.config?.globalProperties?.$matrixStore || 
                         window.pinia?.state?.value?.matrix?.rooms ||
                         []
      
      const currentRoomCount = Array.isArray(matrixStore) ? matrixStore.length : 
                              (matrixStore.rooms ? matrixStore.rooms.length : 0)
      
      if (lastRoomCount !== 0 && lastRoomCount !== currentRoomCount) {
        changeCount++
        console.log(`🔄 房间数量变化: ${lastRoomCount} -> ${currentRoomCount} (第${changeCount}次变化)`)
      }
      
      lastRoomCount = currentRoomCount
      console.log(`📊 当前房间数量: ${currentRoomCount}`)
      
    } catch (error) {
      console.warn('⚠️ 无法获取房间数量:', error.message)
    }
  }
  
  // 立即检查一次
  checkRooms()
  
  // 每5秒检查一次
  const interval = setInterval(checkRooms, 5000)
  
  // 30秒后停止监控
  setTimeout(() => {
    clearInterval(interval)
    console.log(`📈 监控结束，共检测到 ${changeCount} 次房间数量变化`)
    
    if (changeCount === 0) {
      console.log('✅ 房间列表非常稳定！')
    } else if (changeCount <= 2) {
      console.log('✅ 房间列表基本稳定')
    } else {
      console.log('⚠️ 房间列表仍有频繁变化，需要进一步优化')
    }
  }, 30000)
  
  console.log('⏳ 将监控30秒...')
}

// 导出到全局
window.testCache = {
  full: testCacheOptimization,
  quick: quickTest,
  cleanup: cleanupTest,
  stability: monitorRoomStability
}

console.log('🛠️ 缓存测试脚本已加载')
console.log('使用方法:')
console.log('  window.testCache.full()     - 完整测试')
console.log('  window.testCache.quick()    - 快速测试')
console.log('  window.testCache.stability() - 监控房间稳定性')
console.log('  window.testCache.cleanup()  - 清理测试环境')

// 如果在开发环境，自动运行快速测试
if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
  console.log('🔧 检测到开发环境，5秒后自动运行快速测试...')
  setTimeout(() => {
    quickTest()
  }, 5000)
}