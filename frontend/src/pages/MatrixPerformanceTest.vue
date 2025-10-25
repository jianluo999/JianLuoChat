<template>
  <div class="matrix-performance-test">
    <div class="header">
      <h1>🚀 Matrix性能优化测试</h1>
      <p>测试和验证Matrix消息加载性能改进效果</p>
    </div>

    <div class="test-controls">
      <div class="form-group">
        <label for="roomId">房间ID:</label>
        <input 
          type="text" 
          id="roomId" 
          v-model="roomId" 
          placeholder="输入房间ID进行测试"
        />
      </div>

      <div class="form-group">
        <label>测试选项:</label>
        <div class="checkbox-group">
          <label class="checkbox-item">
            <input type="checkbox" v-model="testOptions.basicLoading" checked>
            基础消息加载测试
          </label>
          <label class="checkbox-item">
            <input type="checkbox" v-model="testOptions.smartAutoLoad" checked>
            智能自动加载测试
          </label>
          <label class="checkbox-item">
            <input type="checkbox" v-model="testOptions.pagination" checked>
            分页加载测试
          </label>
          <label class="checkbox-item">
            <input type="checkbox" v-model="testOptions.syncMonitoring" checked>
            同步状态监控
          </label>
        </div>
      </div>

      <div class="actions">
        <button @click="startTest" :disabled="isTesting || !roomId">
          🚀 开始测试
        </button>
        <button @click="stopTest" :disabled="!isTesting">
          ⏹️ 停止测试
        </button>
        <button @click="clearResults">
          🧹 清除结果
        </button>
        <button @click="startMonitoring">
          📊 开始监控
        </button>
      </div>
    </div>

    <div class="test-status" v-if="isTesting">
      <div class="status-indicator">
        <div class="spinner"></div>
        <span>正在测试...</span>
      </div>
      <p>当前测试: {{ currentTest }}</p>
      <p>已用时间: {{ formattedDuration }}ms</p>
    </div>

    <div class="results" v-if="testResults.length > 0">
      <h2>📊 测试结果</h2>
      <div class="results-grid">
        <div 
          v-for="(result, index) in testResults" 
          :key="index" 
          class="result-card"
          :class="{ success: result.success, failed: !result.success }"
        >
          <div class="result-header">
            <h3>{{ result.test }}</h3>
            <span class="status-badge" :class="{ success: result.success, failed: !result.success }">
              {{ result.success ? '✅ 通过' : '❌ 失败' }}
            </span>
          </div>
          <div class="result-details">
            <p><strong>耗时:</strong> {{ result.duration }}ms</p>
            <p><strong>消息数量:</strong> {{ result.messageCount }}</p>
            <p><strong>成功率:</strong> {{ result.success ? '100%' : '0%' }}</p>
          </div>
          <div class="result-meta" v-if="result.details">
            <p><strong>详情:</strong> {{ JSON.stringify(result.details) }}</p>
          </div>
          <div class="result-error" v-if="result.error">
            <p><strong>错误:</strong> {{ result.error }}</p>
          </div>
        </div>
      </div>

      <div class="summary">
        <h3>📈 总结</h3>
        <p>总测试数: {{ testResults.length }}</p>
        <p>通过数: {{ passedTests }}</p>
        <p>失败数: {{ failedTests }}</p>
        <p>通过率: {{ successRate }}%</p>
        <p>总耗时: {{ totalDuration }}ms</p>
      </div>
    </div>

    <div class="performance-metrics" v-if="isMonitoring">
      <h2>🔍 实时性能监控</h2>
      <div class="metrics-grid">
        <div class="metric-card">
          <h4>总消息数</h4>
          <p class="metric-value">{{ totalMessages }}</p>
        </div>
        <div class="metric-card">
          <h4>房间数量</h4>
          <p class="metric-value">{{ roomCount }}</p>
        </div>
        <div class="metric-card">
          <h4>同步状态</h4>
          <p class="metric-value">{{ syncState }}</p>
        </div>
        <div class="metric-card">
          <h4>网络状态</h4>
          <p class="metric-value">{{ networkStatus }}</p>
        </div>
      </div>
    </div>

    <div class="comparison" v-if="hasPreviousResults">
      <h2>🔄 与上次测试对比</h2>
      <div class="comparison-grid">
        <div 
          v-for="(newResult, index) in testResults" 
          :key="index" 
          class="comparison-item"
        >
          <h4>{{ newResult.test }}</h4>
          <div class="comparison-details">
            <p>当前: {{ newResult.duration }}ms ({{ newResult.messageCount }}条)</p>
            <p v-if="previousResults[index]">
              上次: {{ previousResults[index].duration }}ms ({{ previousResults[index].messageCount }}条)
            </p>
            <p v-if="previousResults[index]" class="improvement">
              改进: {{ calculateImprovement(newResult, previousResults[index]) }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <div class="recommendations">
      <h2>💡 优化建议</h2>
      <div class="recommendation-list">
        <div class="recommendation-item" v-for="(rec, index) in getRecommendations()" :key="index">
          <div class="recommendation-icon" :class="rec.type">
            {{ rec.type === 'success' ? '✅' : rec.type === 'warning' ? '⚠️' : 'ℹ️' }}
          </div>
          <div class="recommendation-content">
            <h4>{{ rec.title }}</h4>
            <p>{{ rec.description }}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="debug-info">
      <h2>🔍 调试信息</h2>
      <div class="debug-section">
        <h4>Matrix客户端状态</h4>
        <pre>{{ debugInfo }}</pre>
      </div>
    </div>
  </div>
</template>

<script>
import { MatrixPerformanceTester, runMatrixPerformanceTest, monitorMatrixPerformance } from '@/utils/matrixPerformanceTest'
import { useMatrixStore } from '@/stores/matrix'

export default {
  name: 'MatrixPerformanceTest',
  data() {
    return {
      roomId: '',
      isTesting: false,
      isMonitoring: false,
      testResults: [],
      startTime: null,
      currentTest: '',
      testOptions: {
        basicLoading: true,
        smartAutoLoad: true,
        pagination: true,
        syncMonitoring: true
      },
      performanceMonitor: null,
      previousResults: null
    }
  },
  computed: {
    matrixStore() {
      return useMatrixStore()
    },
    passedTests() {
      return this.testResults.filter(r => r.success).length
    },
    failedTests() {
      return this.testResults.length - this.passedTests
    },
    successRate() {
      return this.testResults.length > 0 ? 
        ((this.passedTests / this.testResults.length) * 100).toFixed(1) : 0
    },
    totalDuration() {
      return this.testResults.reduce((sum, r) => sum + r.duration, 0)
    },
    formattedDuration() {
      return this.startTime ? Date.now() - this.startTime : 0
    },
    hasPreviousResults() {
      return this.previousResults && this.previousResults.length > 0
    },
    totalMessages() {
      return Array.from(this.matrixStore.messages.value.values())
        .reduce((total, messages) => total + messages.length, 0)
    },
    roomCount() {
      return this.matrixStore.rooms.value.length
    },
    syncState() {
      return this.matrixStore.connection.value.syncState.isActive ? 
        '同步中' : '未同步'
    },
    networkStatus() {
      return navigator.onLine ? '在线' : '离线'
    },
    debugInfo() {
      const diagnosis = this.matrixStore.diagnoseMatrixConnection()
      return JSON.stringify(diagnosis, null, 2)
    }
  },
  methods: {
    async startTest() {
      if (!this.roomId) {
        alert('请输入房间ID')
        return
      }

      this.isTesting = true
      this.testResults = []
      this.startTime = Date.now()
      this.currentTest = '初始化测试'

      try {
        // 获取历史数据
        const matrixStore = this.matrixStore
        const tester = new MatrixPerformanceTester(matrixStore)
        
        // 运行测试
        await tester.startPerformanceTest(this.roomId)
        
        this.testResults = tester.testResults
        
        // 保存历史数据
        this.previousResults = tester.getLastTestResults()
        
        console.log('性能测试完成:', this.testResults)
        
      } catch (error) {
        console.error('测试失败:', error)
        this.testResults.push({
          test: '整体测试',
          duration: Date.now() - this.startTime,
          messageCount: 0,
          success: false,
          error: error.message
        })
      } finally {
        this.isTesting = false
        this.startTime = null
      }
    },
    
    stopTest() {
      this.isTesting = false
      this.startTime = null
      this.currentTest = ''
    },
    
    clearResults() {
      this.testResults = []
      this.previousResults = null
      localStorage.removeItem('matrixPerformanceTest')
    },
    
    startMonitoring() {
      if (this.performanceMonitor) {
        this.performanceMonitor.stopMonitoring()
        this.isMonitoring = false
        return
      }

      this.performanceMonitor = monitorMatrixPerformance(this.matrixStore)
      this.performanceMonitor.startMonitoring()
      this.isMonitoring = true
      
      console.log('开始性能监控...')
    },
    
    calculateImprovement(newResult, oldResult) {
      const durationImprovement = oldResult.duration - newResult.duration
      const messageImprovement = newResult.messageCount - oldResult.messageCount
      
      if (durationImprovement > 0 && messageImprovement > 0) {
        return `⏱️ 耗时减少${durationImprovement}ms, 📈 消息增加${messageImprovement}条`
      } else if (durationImprovement > 0) {
        return `⏱️ 耗时减少${durationImprovement}ms`
      } else if (messageImprovement > 0) {
        return `📈 消息增加${messageImprovement}条`
      } else {
        return '无明显改进'
      }
    },
    
    getRecommendations() {
      const recommendations = []
      
      if (this.successRate >= 80) {
        recommendations.push({
          type: 'success',
          title: '性能表现优秀',
          description: '所有测试都通过了，Matrix消息加载性能已经优化得很好！'
        })
      } else if (this.successRate >= 60) {
        recommendations.push({
          type: 'warning',
          title: '部分测试未通过',
          description: '建议检查网络连接和Matrix服务器状态，可能需要重新登录或刷新页面。'
        })
      } else {
        recommendations.push({
          type: 'error',
          title: '性能问题严重',
          description: '多个测试失败，建议检查Matrix客户端配置，可能需要清除缓存或重新初始化。'
        })
      }
      
      // 消息数量建议
      const avgMessages = this.testResults.reduce((sum, r) => sum + r.messageCount, 0) / this.testResults.length
      if (avgMessages < 50) {
        recommendations.push({
          type: 'warning',
          title: '消息数量较少',
          description: '加载的消息数量较少，可能需要检查房间权限或历史消息可用性。'
        })
      }
      
      // 耗时建议
      const avgDuration = this.testResults.reduce((sum, r) => sum + r.duration, 0) / this.testResults.length
      if (avgDuration > 5000) {
        recommendations.push({
          type: 'warning',
          title: '加载速度较慢',
          description: '平均加载时间超过5秒，建议检查网络状况或服务器响应时间。'
        })
      }
      
      return recommendations
    }
  },
  beforeUnmount() {
    if (this.performanceMonitor) {
      this.performanceMonitor.stopMonitoring()
    }
  }
}
</script>

<style scoped>
.matrix-performance-test {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.header {
  text-align: center;
  margin-bottom: 30px;
}

.header h1 {
  color: #2c3e50;
  margin-bottom: 10px;
}

.header p {
  color: #7f8c8d;
  font-size: 16px;
}

.test-controls {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 30px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #2c3e50;
}

.form-group input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.checkbox-group {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-top: 10px;
}

.checkbox-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.checkbox-item input {
  margin: 0;
}

.actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
  flex-wrap: wrap;
}

.actions button {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  background: #3498db;
  color: white;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;
}

.actions button:hover:not(:disabled) {
  background: #2980b9;
}

.actions button:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
}

.test-status {
  background: #e8f5e8;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 30px;
  border-left: 4px solid #27ae60;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.results {
  margin-bottom: 30px;
}

.results h2 {
  color: #2c3e50;
  margin-bottom: 20px;
}

.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.result-card {
  background: white;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: transform 0.2s;
}

.result-card:hover {
  transform: translateY(-2px);
}

.result-card.success {
  border-left: 4px solid #27ae60;
}

.result-card.failed {
  border-left: 4px solid #e74c3c;
}

.result-header {
  display: flex;
  justify-content: between;
  align-items: center;
  margin-bottom: 15px;
}

.result-header h3 {
  margin: 0;
  color: #2c3e50;
  flex: 1;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge.success {
  background: #d5f4e6;
  color: #27ae60;
}

.status-badge.failed {
  background: #fadbd8;
  color: #e74c3c;
}

.result-details {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 15px;
}

.result-details p {
  margin: 0;
  font-size: 14px;
}

.result-meta p {
  margin: 0;
  font-size: 12px;
  color: #7f8c8d;
}

.result-error p {
  margin: 0;
  font-size: 12px;
  color: #e74c3c;
}

.summary {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  border-left: 4px solid #3498db;
}

.summary h3 {
  margin: 0 0 15px 0;
  color: #2c3e50;
}

.summary p {
  margin: 5px 0;
  color: #7f8c8d;
}

.performance-metrics {
  margin-bottom: 30px;
}

.performance-metrics h2 {
  color: #2c3e50;
  margin-bottom: 20px;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.metric-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.metric-card h4 {
  margin: 0 0 10px 0;
  color: #7f8c8d;
  font-size: 14px;
}

.metric-value {
  font-size: 24px;
  font-weight: bold;
  color: #2c3e50;
}

.comparison {
  margin-bottom: 30px;
}

.comparison h2 {
  color: #2c3e50;
  margin-bottom: 20px;
}

.comparison-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.comparison-item {
  background: white;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.comparison-item h4 {
  margin: 0 0 15px 0;
  color: #2c3e50;
}

.comparison-details p {
  margin: 5px 0;
  font-size: 14px;
}

.improvement {
  font-weight: 500;
  color: #27ae60;
}

.recommendations {
  margin-bottom: 30px;
}

.recommendations h2 {
  color: #2c3e50;
  margin-bottom: 20px;
}

.recommendation-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
}

.recommendation-item {
  display: flex;
  gap: 15px;
  padding: 15px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.recommendation-icon {
  font-size: 24px;
  width: 40px;
  text-align: center;
}

.recommendation-icon.success {
  color: #27ae60;
}

.recommendation-icon.warning {
  color: #f39c12;
}

.recommendation-icon.info {
  color: #3498db;
}

.recommendation-content h4 {
  margin: 0 0 8px 0;
  color: #2c3e50;
}

.recommendation-content p {
  margin: 0;
  color: #7f8c8d;
  line-height: 1.5;
}

.debug-info {
  margin-bottom: 30px;
}

.debug-info h2 {
  color: #2c3e50;
  margin-bottom: 20px;
}

.debug-section {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
}

.debug-section h4 {
  margin: 0 0 10px 0;
  color: #2c3e50;
}

.debug-section pre {
  background: #34495e;
  color: #ecf0f1;
  padding: 15px;
  border-radius: 4px;
  overflow-x: auto;
  font-size: 12px;
}
</style>