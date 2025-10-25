/**
 * Matrix性能优化测试工具
 * 用于验证消息加载性能改进效果
 */

export class MatrixPerformanceTester {
  constructor(matrixStore) {
    this.matrixStore = matrixStore
    this.testResults = []
    this.startTime = null
    this.endTime = null
  }

  // 开始性能测试
  async startPerformanceTest(roomId) {
    console.log('🚀 开始Matrix性能测试...')
    
    this.startTime = Date.now()
    this.testResults = []
    
    try {
      // 测试1: 基础消息加载性能
      await this.testBasicMessageLoading(roomId)
      
      // 测试2: 智能自动加载性能
      await this.testSmartAutoLoad(roomId)
      
      // 测试3: 分页加载性能
      await this.testPaginationPerformance(roomId)
      
      // 测试4: 同步状态监控
      await this.testSyncStatusMonitoring()
      
      this.endTime = Date.now()
      this.generateReport()
      
    } catch (error) {
      console.error('性能测试失败:', error)
      this.endTime = Date.now()
      this.generateReport()
    }
  }

  // 测试基础消息加载性能
  async testBasicMessageLoading(roomId) {
    console.log('📊 测试1: 基础消息加载性能...')
    
    const testStartTime = Date.now()
    
    try {
      // 使用优化版函数
      const messages = await this.matrixStore.fetchMatrixMessagesOptimized(roomId, 200, false)
      
      const testEndTime = Date.now()
      const duration = testEndTime - testStartTime
      
      this.testResults.push({
        test: '基础消息加载',
        duration,
        messageCount: messages.length,
        success: true,
        details: {
          roomId,
          limit: 200,
          autoLoadMore: false
        }
      })
      
      console.log(`✅ 基础消息加载完成: ${messages.length}条消息, 耗时${duration}ms`)
      
    } catch (error) {
      console.error('基础消息加载测试失败:', error)
      this.testResults.push({
        test: '基础消息加载',
        duration: Date.now() - testStartTime,
        messageCount: 0,
        success: false,
        error: error.message
      })
    }
  }

  // 测试智能自动加载性能
  async testSmartAutoLoad(roomId) {
    console.log('🧠 测试2: 智能自动加载性能...')
    
    const testStartTime = Date.now()
    
    try {
      // 先加载少量消息触发智能加载
      await this.matrixStore.fetchMatrixMessagesOptimized(roomId, 50, true)
      
      const testEndTime = Date.now()
      const duration = testEndTime - testStartTime
      
      const currentMessages = this.matrixStore.messages.value.get(roomId) || []
      
      this.testResults.push({
        test: '智能自动加载',
        duration,
        messageCount: currentMessages.length,
        success: true,
        details: {
          roomId,
          initialLimit: 50,
          autoLoadMore: true,
          finalCount: currentMessages.length
        }
      })
      
      console.log(`✅ 智能自动加载完成: ${currentMessages.length}条消息, 耗时${duration}ms`)
      
    } catch (error) {
      console.error('智能自动加载测试失败:', error)
      this.testResults.push({
        test: '智能自动加载',
        duration: Date.now() - testStartTime,
        messageCount: 0,
        success: false,
        error: error.message
      })
    }
  }

  // 测试分页加载性能
  async testPaginationPerformance(roomId) {
    console.log('📚 测试3: 分页加载性能...')
    
    const testStartTime = Date.now()
    
    try {
      const room = this.matrixStore.matrixClient.value?.getRoom(roomId)
      if (!room) {
        throw new Error('房间不存在')
      }
      
      const initialEventCount = room.getLiveTimeline().getEvents().length
      console.log(`📊 初始事件数量: ${initialEventCount}`)
      
      // 测试分页加载
      await this.matrixStore.loadMoreHistoryMessages(roomId)
      
      const finalEventCount = room.getLiveTimeline().getEvents().length
      const newMessages = finalEventCount - initialEventCount
      
      const testEndTime = Date.now()
      const duration = testEndTime - testStartTime
      
      this.testResults.push({
        test: '分页加载',
        duration,
        messageCount: newMessages,
        success: true,
        details: {
          roomId,
          initialCount: initialEventCount,
          finalCount: finalEventCount,
          newMessages,
          loadMoreLimit: 500
        }
      })
      
      console.log(`✅ 分页加载完成: 新增${newMessages}条消息, 耗时${duration}ms`)
      
    } catch (error) {
      console.error('分页加载测试失败:', error)
      this.testResults.push({
        test: '分页加载',
        duration: Date.now() - testStartTime,
        messageCount: 0,
        success: false,
        error: error.message
      })
    }
  }

  // 测试同步状态监控
  async testSyncStatusMonitoring() {
    console.log('🔄 测试4: 同步状态监控...')
    
    const testStartTime = Date.now()
    
    try {
      const diagnosis = await this.matrixStore.diagnoseMatrixConnection()
      
      const testEndTime = Date.now()
      const duration = testEndTime - testStartTime
      
      this.testResults.push({
        test: '同步状态监控',
        duration,
        messageCount: diagnosis.roomCount,
        success: true,
        details: {
          syncState: diagnosis.syncState,
          clientRunning: diagnosis.clientRunning,
          roomCount: diagnosis.roomCount,
          networkConnectivity: diagnosis.networkConnectivity,
          recommendations: diagnosis.recommendations
        }
      })
      
      console.log(`✅ 同步状态监控完成: ${diagnosis.roomCount}个房间, 耗时${duration}ms`)
      
    } catch (error) {
      console.error('同步状态监控测试失败:', error)
      this.testResults.push({
        test: '同步状态监控',
        duration: Date.now() - testStartTime,
        messageCount: 0,
        success: false,
        error: error.message
      })
    }
  }

  // 生成性能测试报告
  generateReport() {
    const totalTime = this.endTime - this.startTime
    
    console.log('\n' + '='.repeat(60))
    console.log('📊 Matrix性能测试报告')
    console.log('='.repeat(60))
    console.log(`总耗时: ${totalTime}ms`)
    console.log(`测试时间: ${new Date(this.startTime).toLocaleString()}`)
    console.log('')
    
    let passedTests = 0
    let totalTests = this.testResults.length
    
    this.testResults.forEach((result, index) => {
      const status = result.success ? '✅' : '❌'
      const emoji = result.success ? '🟢' : '🔴'
      
      console.log(`${emoji} 测试${index + 1}: ${result.test}`)
      console.log(`   状态: ${status} ${result.duration}ms`)
      console.log(`   消息数量: ${result.messageCount}`)
      
      if (result.success) {
        passedTests++
      }
      
      // 显示详细信息
      if (result.details) {
        console.log(`   详情:`, result.details)
      }
      
      if (result.error) {
        console.log(`   错误: ${result.error}`)
      }
      
      console.log('')
    })
    
    const successRate = (passedTests / totalTests * 100).toFixed(1)
    console.log(`📈 通过率: ${passedTests}/${totalTests} (${successRate}%)`)
    
    // 性能建议
    console.log('\n💡 性能优化建议:')
    if (successRate >= 80) {
      console.log('✅ 性能表现良好，优化效果显著！')
    } else if (successRate >= 60) {
      console.log('⚠️ 部分测试未通过，建议检查网络连接和服务器状态')
    } else {
      console.log('❌ 性能测试失败较多，建议检查Matrix客户端配置')
    }
    
    // 保存测试结果到localStorage
    localStorage.setItem('matrixPerformanceTest', JSON.stringify({
      results: this.testResults,
      totalTime,
      timestamp: new Date().toISOString()
    }))
    
    console.log('📋 测试结果已保存到localStorage')
    console.log('='.repeat(60))
  }

  // 获取上次测试结果
  getLastTestResults() {
    try {
      const saved = localStorage.getItem('matrixPerformanceTest')
      return saved ? JSON.parse(saved) : null
    } catch (error) {
      console.error('获取上次测试结果失败:', error)
      return null
    }
  }

  // 对比测试结果
  compareResults(newResults, oldResults) {
    console.log('\n🔄 性能对比分析:')
    console.log('='.repeat(40))
    
    if (!oldResults) {
      console.log('ℹ️ 没有历史数据进行对比')
      return
    }
    
    newResults.results.forEach((newResult, index) => {
      const oldResult = oldResults.results[index]
      if (oldResult) {
        const durationImprovement = oldResult.duration - newResult.duration
        const messageCountImprovement = newResult.messageCount - oldResult.messageCount
        
        console.log(`\n${newResult.test}:`)
        console.log(`   耗时改进: ${durationImprovement >= 0 ? '+' : ''}${durationImprovement}ms`)
        console.log(`   消息数量改进: ${messageCountImprovement >= 0 ? '+' : ''}${messageCountImprovement}`)
        
        if (durationImprovement > 0) {
          console.log(`   🚀 耗时减少: ${((durationImprovement / oldResult.duration) * 100).toFixed(1)}%`)
        }
        
        if (messageCountImprovement > 0) {
          console.log(`   📈 消息数量增加: ${((messageCountImprovement / oldResult.messageCount) * 100).toFixed(1)}%`)
        }
      }
    })
  }
}

// 导出便捷的测试函数
export const runMatrixPerformanceTest = async (matrixStore, roomId) => {
  const tester = new MatrixPerformanceTester(matrixStore)
  
  // 获取历史数据
  const oldResults = tester.getLastTestResults()
  
  // 运行测试
  await tester.startPerformanceTest(roomId)
  
  // 对比分析
  tester.compareResults(tester, oldResults)
  
  return tester.testResults
}

// 导出性能监控工具
export const monitorMatrixPerformance = (matrixStore) => {
  let lastMessageCount = 0
  let lastSyncTime = 0
  
  return {
    startMonitoring: () => {
      console.log('🔍 开始Matrix性能监控...')
      lastMessageCount = 0
      lastSyncTime = Date.now()
      
      // 每30秒检查一次性能
      setInterval(() => {
        const currentMessages = Array.from(matrixStore.messages.value.values())
          .reduce((total, messages) => total + messages.length, 0)
        
        const currentTime = Date.now()
        const timeDiff = currentTime - lastSyncTime
        const messageDiff = currentMessages - lastMessageCount
        
        if (timeDiff > 0) {
          const messagesPerSecond = messageDiff / (timeDiff / 1000)
          console.log(`📊 性能监控: ${messageDiff}条消息, ${messagesPerSecond.toFixed(2)}条/秒`)
        }
        
        lastMessageCount = currentMessages
        lastSyncTime = currentTime
      }, 30000)
    },
    
    getPerformanceMetrics: () => {
      const diagnosis = matrixStore.diagnoseMatrixConnection()
      const totalMessages = Array.from(matrixStore.messages.value.values())
        .reduce((total, messages) => total + messages.length, 0)
      
      return {
        totalMessages,
        roomCount: diagnosis.roomCount || 0,
        syncState: diagnosis.syncState,
        clientRunning: diagnosis.clientRunning,
        networkStatus: navigator.onLine ? '在线' : '离线'
      }
    }
  }
}