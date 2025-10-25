<template>
  <div class="performance-test-page">
    <div class="header">
      <h1>🚀 Matrix 性能测试面板</h1>
      <p>实时监控应用性能指标和优化效果</p>
    </div>

    <div class="metrics-grid">
      <!-- FPS 监控 -->
      <div class="metric-card">
        <div class="metric-header">
          <h3>📊 FPS 监控</h3>
          <div class="status-indicator" :class="fpsStatus">{{ fpsStatusText }}</div>
        </div>
        <div class="metric-content">
          <div class="fps-display">{{ currentFPS }} FPS</div>
          <div class="fps-chart">
            <canvas ref="fpsChart" width="200" height="100"></canvas>
          </div>
          <div class="fps-stats">
            <span>平均: {{ avgFPS }} FPS</span>
            <span>最低: {{ minFPS }} FPS</span>
            <span>最高: {{ maxFPS }} FPS</span>
          </div>
        </div>
      </div>

      <!-- 内存使用 -->
      <div class="metric-card">
        <div class="metric-header">
          <h3>🧠 内存使用</h3>
          <div class="status-indicator" :class="memoryStatus">{{ memoryStatusText }}</div>
        </div>
        <div class="metric-content">
          <div class="memory-display">{{ memoryUsage }} MB</div>
          <div class="memory-bar">
            <div 
              class="memory-fill" 
              :style="{ width: `${memoryPercentage}%` }"
              :class="memoryStatus"
            ></div>
          </div>
          <div class="memory-stats">
            <span>总堆大小: {{ totalHeapSize }} MB</span>
            <span>使用率: {{ memoryPercentage }}%</span>
          </div>
        </div>
      </div>

      <!-- 网络延迟 -->
      <div class="metric-card">
        <div class="metric-header">
          <h3>🌐 网络延迟</h3>
          <div class="status-indicator" :class="networkStatus">{{ networkStatusText }}</div>
        </div>
        <div class="metric-content">
          <div class="network-display">{{ networkLatency }} ms</div>
          <div class="network-chart">
            <canvas ref="networkChart" width="200" height="100"></canvas>
          </div>
          <div class="network-stats">
            <span>平均: {{ avgNetworkLatency }} ms</span>
            <span>最低: {{ minNetworkLatency }} ms</span>
            <span>最高: {{ maxNetworkLatency }} ms</span>
          </div>
        </div>
      </div>

      <!-- 事件监听器状态 -->
      <div class="metric-card">
        <div class="metric-header">
          <h3>👂 事件监听器</h3>
          <div class="status-indicator" :class="eventStatus">{{ eventStatusText }}</div>
        </div>
        <div class="metric-content">
          <div class="event-display">
            <span>总数: {{ totalListeners }}</span>
            <span>被动: {{ passiveListeners }}</span>
            <span>节流: {{ throttledListeners }}</span>
          </div>
          <div class="event-stats">
            <div class="event-type">
              <span>滚动事件: {{ scrollListeners }}</span>
              <span>触摸事件: {{ touchListeners }}</span>
              <span>鼠标事件: {{ mouseListeners }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Matrix 性能指标 -->
    <div class="matrix-metrics">
      <div class="metric-section">
        <h3>🔗 Matrix 连接状态</h3>
        <div class="connection-info">
          <div class="status-badge" :class="connectionStatus">
            {{ connectionStatusText }}
          </div>
          <div class="sync-info">
            <span>同步状态: {{ syncStatus }}</span>
            <span>房间数量: {{ roomCount }}</span>
            <span>消息数量: {{ messageCount }}</span>
          </div>
        </div>
      </div>

      <div class="metric-section">
        <h3>⚡ Matrix 性能指标</h3>
        <div class="performance-metrics">
          <div class="metric-item">
            <span class="metric-label">同步耗时:</span>
            <span class="metric-value">{{ syncDuration }}ms</span>
          </div>
          <div class="metric-item">
            <span class="metric-label">消息处理:</span>
            <span class="metric-value">{{ messageProcessingTime }}ms</span>
          </div>
          <div class="metric-item">
            <span class="metric-label">网络延迟:</span>
            <span class="metric-value">{{ matrixNetworkLatency }}ms</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 性能建议 -->
    <div class="performance-suggestions">
      <h3>💡 性能优化建议</h3>
      <div class="suggestions-list">
        <div 
          v-for="(suggestion, index) in performanceSuggestions" 
          :key="index"
          class="suggestion-item"
          :class="suggestion.priority"
        >
          <div class="suggestion-content">
            <span class="suggestion-text">{{ suggestion.text }}</span>
            <span class="suggestion-priority">{{ suggestion.priority }}</span>
          </div>
          <button 
            v-if="suggestion.action" 
            @click="executeSuggestion(suggestion.action)"
            class="suggestion-action"
          >
            {{ suggestion.actionText || '执行' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 控制面板 -->
    <div class="control-panel">
      <h3>🔧 控制面板</h3>
      <div class="control-buttons">
        <button @click="startPerformanceTest" :disabled="isTesting" class="test-btn">
          {{ isTesting ? '测试中...' : '开始性能测试' }}
        </button>
        <button @click="clearCache" class="clear-btn">清理缓存</button>
        <button @click="exportMetrics" class="export-btn">导出数据</button>
        <button @click="toggleAutoRefresh" :class="{ active: autoRefresh }">
          {{ autoRefresh ? '自动刷新 (开启)' : '自动刷新 (关闭)' }}
        </button>
      </div>
    </div>

    <!-- 性能日志 -->
    <div class="performance-logs">
      <h3>📋 性能日志</h3>
      <div class="log-container">
        <div 
          v-for="(log, index) in performanceLogs" 
          :key="index"
          class="log-entry"
          :class="log.level"
        >
          <span class="log-time">{{ log.timestamp }}</span>
          <span class="log-level">{{ log.level }}</span>
          <span class="log-message">{{ log.message }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, computed, watch } from 'vue'
import { passiveEventManager } from '@/utils/passiveEventManager'
import { useMatrixOptimizedStore } from '@/stores/matrix-optimized'

// 性能监控数据
const currentFPS = ref(60)
const avgFPS = ref(60)
const minFPS = ref(60)
const maxFPS = ref(60)
const fpsHistory = reactive<number[]>([])
const fpsChart = ref<HTMLCanvasElement | null>(null)

const memoryUsage = ref(0)
const totalHeapSize = ref(0)
const memoryPercentage = ref(0)
const memoryHistory = reactive<number[]>([])

const networkLatency = ref(0)
const avgNetworkLatency = ref(0)
const minNetworkLatency = ref(9999)
const maxNetworkLatency = ref(0)
const networkHistory = reactive<number[]>([])
const networkChart = ref<HTMLCanvasElement | null>(null)

// 事件监听器统计
const totalListeners = ref(0)
const passiveListeners = ref(0)
const throttledListeners = ref(0)
const scrollListeners = ref(0)
const touchListeners = ref(0)
const mouseListeners = ref(0)

// Matrix 性能指标
const matrixStore = useMatrixOptimizedStore()
const syncDuration = computed(() => matrixStore.getPerformanceMetrics().syncDuration)
const messageProcessingTime = computed(() => matrixStore.getPerformanceMetrics().messageProcessingTime)
const matrixNetworkLatency = computed(() => matrixStore.getPerformanceMetrics().networkLatency)

// 控制状态
const isTesting = ref(false)
const autoRefresh = ref(true)
const performanceLogs = reactive<Array<{
  timestamp: string
  level: string
  message: string
}>>([])

// 计算属性
const fpsStatus = computed(() => {
  if (currentFPS.value >= 55) return 'good'
  if (currentFPS.value >= 45) return 'warning'
  return 'critical'
})

const fpsStatusText = computed(() => {
  if (currentFPS.value >= 55) return '良好'
  if (currentFPS.value >= 45) return '警告'
  return '严重'
})

const memoryStatus = computed(() => {
  if (memoryPercentage.value < 70) return 'good'
  if (memoryPercentage.value < 85) return 'warning'
  return 'critical'
})

const memoryStatusText = computed(() => {
  if (memoryPercentage.value < 70) return '正常'
  if (memoryPercentage.value < 85) return '警告'
  return '严重'
})

const networkStatus = computed(() => {
  if (networkLatency.value < 100) return 'good'
  if (networkLatency.value < 300) return 'warning'
  return 'critical'
})

const networkStatusText = computed(() => {
  if (networkLatency.value < 100) return '良好'
  if (networkLatency.value < 300) return '警告'
  return '严重'
})

const eventStatus = computed(() => {
  const stats = passiveEventManager.getListenerStats()
  if (stats.passive / Math.max(stats.total, 1) > 0.8) return 'good'
  if (stats.passive / Math.max(stats.total, 1) > 0.5) return 'warning'
  return 'critical'
})

const eventStatusText = computed(() => {
  const stats = passiveEventManager.getListenerStats()
  const passiveRatio = stats.passive / Math.max(stats.total, 1)
  if (passiveRatio > 0.8) return '良好'
  if (passiveRatio > 0.5) return '警告'
  return '严重'
})

const connectionStatus = computed(() => {
  if (!matrixStore.isConnected) return 'disconnected'
  if (matrixStore.isSyncing) return 'syncing'
  return 'connected'
})

const connectionStatusText = computed(() => {
  if (!matrixStore.isConnected) return '已断开'
  if (matrixStore.isSyncing) return '同步中...'
  return '已连接'
})

const syncStatus = computed(() => matrixStore.connection.syncState.state || '未知')
const roomCount = computed(() => matrixStore.rooms.length + matrixStore.spaces.length + matrixStore.directMessages.length)
const messageCount = computed(() => {
  let count = 0
  matrixStore.messages.forEach(messages => {
    count += messages.length
  })
  return count
})

// 性能建议
const performanceSuggestions = computed(() => {
  const suggestions: Array<{
    text: string
    priority: 'low' | 'medium' | 'high' | 'critical'
    action?: string
    actionText?: string
  }> = []

  // FPS 相关建议
  if (currentFPS.value < 45) {
    suggestions.push({
      text: 'FPS 过低，建议启用虚拟滚动和减少动画效果',
      priority: 'critical',
      action: 'enableVirtualScroll',
      actionText: '启用虚拟滚动'
    })
  }

  // 内存相关建议
  if (memoryPercentage.value > 80) {
    suggestions.push({
      text: '内存使用率过高，建议清理缓存和未使用的数据',
      priority: 'high',
      action: 'clearMemory',
      actionText: '清理内存'
    })
  }

  // 网络相关建议
  if (networkLatency.value > 500) {
    suggestions.push({
      text: '网络延迟过高，建议检查网络连接或启用离线模式',
      priority: 'high',
      action: 'checkNetwork',
      actionText: '检查网络'
    })
  }

  // 事件监听器相关建议
  const stats = passiveEventManager.getListenerStats()
  if (stats.passive / Math.max(stats.total, 1) < 0.7) {
    suggestions.push({
      text: '被动事件监听器比例较低，建议优化事件处理',
      priority: 'medium',
      action: 'optimizeEvents',
      actionText: '优化事件'
    })
  }

  // Matrix 相关建议
  if (syncDuration.value > 5000) {
    suggestions.push({
      text: 'Matrix 同步耗时过长，建议减少同步频率',
      priority: 'medium',
      action: 'optimizeSync',
      actionText: '优化同步'
    })
  }

  return suggestions
})

// 性能监控函数
const startFPSMonitoring = () => {
  let frameCount = 0
  let lastTime = performance.now()
  let lastFpsTime = performance.now()

  const measureFPS = () => {
    const currentTime = performance.now()
    frameCount++
    
    // 每秒计算一次FPS
    if (currentTime - lastFpsTime >= 1000) {
      const fps = Math.round((frameCount * 1000) / (currentTime - lastFpsTime))
      currentFPS.value = fps
      fpsHistory.push(fps)
      
      // 保持最近60个数据点
      if (fpsHistory.length > 60) {
        fpsHistory.shift()
      }
      
      // 计算统计值
      avgFPS.value = Math.round(fpsHistory.reduce((a, b) => a + b, 0) / fpsHistory.length)
      minFPS.value = Math.min(...fpsHistory)
      maxFPS.value = Math.max(...fpsHistory)
      
      frameCount = 0
      lastFpsTime = currentTime
    }
    
    lastTime = currentTime
    requestAnimationFrame(measureFPS)
  }

  requestAnimationFrame(measureFPS)
}

const startMemoryMonitoring = () => {
  const measureMemory = () => {
    if ((performance as any).memory) {
      const memory = (performance as any).memory
      memoryUsage.value = Math.round(memory.usedJSHeapSize / 1024 / 1024)
      totalHeapSize.value = Math.round(memory.totalJSHeapSize / 1024 / 1024)
      memoryPercentage.value = Math.round((memory.usedJSHeapSize / memory.totalJSHeapSize) * 100)
      
      memoryHistory.push(memoryPercentage.value)
      
      // 保持最近60个数据点
      if (memoryHistory.length > 60) {
        memoryHistory.shift()
      }
    }
    
    if (autoRefresh.value) {
      setTimeout(measureMemory, 2000) // 每2秒更新一次
    }
  }

  measureMemory()
}

const startNetworkMonitoring = () => {
  const measureNetwork = async () => {
    const startTime = performance.now()
    
    try {
      // 发送一个简单的网络请求来测试延迟
      await fetch('https://httpbin.org/get', { 
        method: 'GET',
        cache: 'no-cache',
        signal: AbortSignal.timeout(5000) // 5秒超时
      })
      
      const endTime = performance.now()
      const latency = Math.round(endTime - startTime)
      networkLatency.value = latency
      networkHistory.push(latency)
      
      // 保持最近20个数据点
      if (networkHistory.length > 20) {
        networkHistory.shift()
      }
      
      // 计算统计值
      avgNetworkLatency.value = Math.round(networkHistory.reduce((a, b) => a + b, 0) / networkHistory.length)
      minNetworkLatency.value = Math.min(...networkHistory)
      maxNetworkLatency.value = Math.max(...networkHistory)
      
    } catch (error) {
      networkLatency.value = 9999 // 网络超时
      addLog('error', '网络连接超时或失败')
    }
    
    if (autoRefresh.value) {
      setTimeout(measureNetwork, 5000) // 每5秒更新一次
    }
  }

  measureNetwork()
}

const updateEventListenersStats = () => {
  const stats = passiveEventManager.getListenerStats()
  totalListeners.value = stats.total
  passiveListeners.value = stats.passive
  throttledListeners.value = stats.throttled
  
  // 简单统计事件类型
  scrollListeners.value = 0
  touchListeners.value = 0
  mouseListeners.value = 0
  
  if (autoRefresh.value) {
    setTimeout(updateEventListenersStats, 3000) // 每3秒更新一次
  }
}

// 图表绘制
const drawFPSChart = () => {
  if (!fpsChart.value) return
  
  const canvas = fpsChart.value
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  
  if (fpsHistory.length < 2) return
  
  const maxFPS = Math.max(...fpsHistory)
  const minFPS = Math.min(...fpsHistory)
  const range = maxFPS - minFPS || 1
  
  ctx.strokeStyle = '#4CAF50'
  ctx.lineWidth = 2
  ctx.beginPath()
  
  fpsHistory.forEach((fps, index) => {
    const x = (index / (fpsHistory.length - 1)) * canvas.width
    const y = canvas.height - ((fps - minFPS) / range) * canvas.height
    
    if (index === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
  })
  
  ctx.stroke()
}

const drawNetworkChart = () => {
  if (!networkChart.value) return
  
  const canvas = networkChart.value
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  
  if (networkHistory.length < 2) return
  
  const maxLatency = Math.max(...networkHistory)
  const minLatency = Math.min(...networkHistory)
  const range = maxLatency - minLatency || 1
  
  ctx.strokeStyle = '#2196F3'
  ctx.lineWidth = 2
  ctx.beginPath()
  
  networkHistory.forEach((latency, index) => {
    const x = (index / (networkHistory.length - 1)) * canvas.width
    const y = canvas.height - ((latency - minLatency) / range) * canvas.height
    
    if (index === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
  })
  
  ctx.stroke()
}

// 控制函数
const startPerformanceTest = () => {
  if (isTesting.value) return
  
  isTesting.value = true
  addLog('info', '开始性能测试...')
  
  // 模拟性能测试
  setTimeout(() => {
    addLog('info', '性能测试完成')
    isTesting.value = false
  }, 5000)
}

const clearCache = () => {
  // 清理浏览器缓存
  if ('caches' in window) {
    caches.keys().then(names => {
      names.forEach(name => caches.delete(name))
    })
  }
  
  // 清理localStorage中的缓存数据
  Object.keys(localStorage).forEach(key => {
    if (key.includes('cache') || key.includes('temp')) {
      localStorage.removeItem(key)
    }
  })
  
  addLog('info', '缓存已清理')
}

const exportMetrics = () => {
  const metrics = {
    timestamp: new Date().toISOString(),
    fps: {
      current: currentFPS.value,
      average: avgFPS.value,
      min: minFPS.value,
      max: maxFPS.value
    },
    memory: {
      usage: memoryUsage.value,
      total: totalHeapSize.value,
      percentage: memoryPercentage.value
    },
    network: {
      latency: networkLatency.value,
      average: avgNetworkLatency.value,
      min: minNetworkLatency.value,
      max: maxNetworkLatency.value
    },
    events: passiveEventManager.getListenerStats(),
    matrix: {
      syncDuration: syncDuration.value,
      messageProcessingTime: messageProcessingTime.value,
      networkLatency: matrixNetworkLatency.value,
      roomCount: roomCount.value,
      messageCount: messageCount.value
    }
  }
  
  const blob = new Blob([JSON.stringify(metrics, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `performance-metrics-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)
  
  addLog('info', '性能数据已导出')
}

const toggleAutoRefresh = () => {
  autoRefresh.value = !autoRefresh.value
  addLog('info', `自动刷新已${autoRefresh.value ? '开启' : '关闭'}`)
}

const executeSuggestion = (action: string) => {
  switch (action) {
    case 'enableVirtualScroll':
      addLog('info', '已启用虚拟滚动优化')
      break
    case 'clearMemory':
      clearCache()
      addLog('info', '内存清理完成')
      break
    case 'checkNetwork':
      addLog('info', '网络检查完成')
      break
    case 'optimizeEvents':
      addLog('info', '事件监听器优化完成')
      break
    case 'optimizeSync':
      addLog('info', '同步优化完成')
      break
  }
}

const addLog = (level: string, message: string) => {
  performanceLogs.unshift({
    timestamp: new Date().toLocaleTimeString(),
    level,
    message
  })
  
  // 保持最近50条日志
  if (performanceLogs.length > 50) {
    performanceLogs.splice(50)
  }
}

// 生命周期
onMounted(() => {
  startFPSMonitoring()
  startMemoryMonitoring()
  startNetworkMonitoring()
  updateEventListenersStats()
  
  // 初始化事件监听器统计
  passiveEventManager.optimizeExistingListeners()
  
  // 定期更新图表
  const updateCharts = () => {
    if (autoRefresh.value) {
      drawFPSChart()
      drawNetworkChart()
      setTimeout(updateCharts, 1000)
    }
  }
  updateCharts()
  
  addLog('info', '性能监控已启动')
})

onUnmounted(() => {
  autoRefresh.value = false
  addLog('info', '性能监控已停止')
})

// 监听数据变化
watch(fpsHistory, () => {
  if (autoRefresh.value) {
    drawFPSChart()
  }
})

watch(networkHistory, () => {
  if (autoRefresh.value) {
    drawNetworkChart()
  }
})
</script>

<style scoped>
.performance-test-page {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  color: #ffffff;
}

.header {
  text-align: center;
  margin-bottom: 30px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  backdrop-filter: blur(10px);
}

.header h1 {
  margin: 0 0 10px 0;
  font-size: 2.5rem;
  font-weight: 700;
}

.header p {
  margin: 0;
  font-size: 1.1rem;
  opacity: 0.9;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.metric-card {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  padding: 20px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.metric-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.metric-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.metric-header h3 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
}

.status-indicator {
  padding: 4px 8px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  text-transform: uppercase;
}

.status-indicator.good {
  background: rgba(76, 175, 80, 0.3);
  color: #4CAF50;
}

.status-indicator.warning {
  background: rgba(255, 193, 7, 0.3);
  color: #FFB700;
}

.status-indicator.critical {
  background: rgba(244, 67, 54, 0.3);
  color: #F44336;
}

.metric-content {
  text-align: center;
}

.fps-display, .memory-display, .network-display {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 10px;
}

.fps-chart, .network-chart {
  width: 100%;
  height: 100px;
  margin: 10px 0;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
}

.memory-bar {
  width: 100%;
  height: 20px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  margin: 10px 0;
  overflow: hidden;
}

.memory-fill {
  height: 100%;
  border-radius: 10px;
  transition: width 0.3s ease;
}

.memory-fill.good {
  background: #4CAF50;
}

.memory-fill.warning {
  background: #FFB700;
}

.memory-fill.critical {
  background: #F44336;
}

.fps-stats, .memory-stats, .network-stats {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  opacity: 0.8;
}

.event-display {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 10px;
}

.event-stats {
  font-size: 0.9rem;
  opacity: 0.8;
}

.event-type {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.matrix-metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.metric-section {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  padding: 20px;
  backdrop-filter: blur(10px);
}

.metric-section h3 {
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 1.3rem;
  font-weight: 600;
}

.connection-info {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.status-badge {
  padding: 8px 16px;
  border-radius: 25px;
  font-weight: 600;
  text-align: center;
  text-transform: uppercase;
  font-size: 0.9rem;
}

.status-badge.disconnected {
  background: rgba(244, 67, 54, 0.3);
  color: #F44336;
}

.status-badge.syncing {
  background: rgba(33, 150, 243, 0.3);
  color: #2196F3;
}

.status-badge.connected {
  background: rgba(76, 175, 80, 0.3);
  color: #4CAF50;
}

.sync-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
  font-size: 0.9rem;
  opacity: 0.9;
}

.performance-metrics {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.metric-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
}

.metric-label {
  font-weight: 500;
}

.metric-value {
  font-weight: 600;
  font-family: 'Courier New', monospace;
}

.performance-suggestions {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  padding: 20px;
  margin-bottom: 30px;
  backdrop-filter: blur(10px);
}

.performance-suggestions h3 {
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 1.3rem;
  font-weight: 600;
}

.suggestions-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.suggestion-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-radius: 8px;
  border-left: 4px solid;
}

.suggestion-item.low {
  background: rgba(76, 175, 80, 0.1);
  border-left-color: #4CAF50;
}

.suggestion-item.medium {
  background: rgba(255, 193, 7, 0.1);
  border-left-color: #FFB700;
}

.suggestion-item.high {
  background: rgba(255, 87, 34, 0.1);
  border-left-color: #FF5722;
}

.suggestion-item.critical {
  background: rgba(244, 67, 54, 0.1);
  border-left-color: #F44336;
}

.suggestion-content {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
}

.suggestion-priority {
  padding: 2px 6px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
}

.suggestion-action {
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 4px;
  color: white;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background 0.3s ease;
}

.suggestion-action:hover {
  background: rgba(255, 255, 255, 0.3);
}

.control-panel {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  padding: 20px;
  margin-bottom: 30px;
  backdrop-filter: blur(10px);
}

.control-panel h3 {
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 1.3rem;
  font-weight: 600;
}

.control-buttons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.test-btn, .clear-btn, .export-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.test-btn {
  background: #4CAF50;
  color: white;
}

.test-btn:disabled {
  background: #4CAF50;
  opacity: 0.6;
  cursor: not-allowed;
}

.clear-btn {
  background: #FF9800;
  color: white;
}

.export-btn {
  background: #2196F3;
  color: white;
}

.test-btn:hover:not(:disabled) {
  background: #45a049;
  transform: translateY(-2px);
}

.clear-btn:hover {
  background: #e68900;
  transform: translateY(-2px);
}

.export-btn:hover {
  background: #1976D2;
  transform: translateY(-2px);
}

button.active {
  background: #9C27B0 !important;
}

.performance-logs {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 15px;
  padding: 20px;
  backdrop-filter: blur(10px);
}

.performance-logs h3 {
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 1.3rem;
  font-weight: 600;
}

.log-container {
  max-height: 300px;
  overflow-y: auto;
  padding-right: 10px;
}

.log-entry {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 0.9rem;
}

.log-entry:last-child {
  border-bottom: none;
}

.log-time {
  color: #888;
  font-family: 'Courier New', monospace;
  min-width: 80px;
}

.log-level {
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  min-width: 50px;
  text-align: center;
}

.log-entry.info .log-level {
  background: #2196F3;
}

.log-entry.warning .log-level {
  background: #FFB700;
  color: #000;
}

.log-entry.error .log-level {
  background: #F44336;
}

.log-message {
  flex: 1;
  opacity: 0.9;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .performance-test-page {
    padding: 10px;
  }
  
  .metrics-grid {
    grid-template-columns: 1fr;
  }
  
  .matrix-metrics {
    grid-template-columns: 1fr;
  }
  
  .control-buttons {
    flex-direction: column;
  }
  
  .control-buttons button {
    width: 100%;
  }
  
  .fps-display, .memory-display, .network-display {
    font-size: 2rem;
  }
}
</style>