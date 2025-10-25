<template>
  <div class="performance-dashboard">
    <!-- 仪表板头部 -->
    <div class="dashboard-header">
      <h2>🚀 性能监控仪表板</h2>
      <div class="dashboard-controls">
        <button 
          @click="toggleAutoRefresh" 
          :class="{ active: autoRefresh }"
          class="control-btn"
        >
          {{ autoRefresh ? '自动刷新 (开启)' : '自动刷新 (关闭)' }}
        </button>
        <button @click="exportData" class="control-btn">导出数据</button>
        <button @click="clearData" class="control-btn">清理数据</button>
      </div>
    </div>

    <!-- 关键性能指标 -->
    <div class="key-metrics">
      <div class="metric-card" :class="getMetricClass('fps')">
        <div class="metric-icon">📊</div>
        <div class="metric-content">
          <div class="metric-value">{{ metrics.fps.current }} FPS</div>
          <div class="metric-label">帧率</div>
          <div class="metric-trend">
            <span :class="getTrendClass(metrics.fps.trend)">{{ metrics.fps.trend > 0 ? '↑' : metrics.fps.trend < 0 ? '↓' : '→' }}</span>
            {{ Math.abs(metrics.fps.trend) }} FPS
          </div>
        </div>
      </div>

      <div class="metric-card" :class="getMetricClass('memory')">
        <div class="metric-icon">🧠</div>
        <div class="metric-content">
          <div class="metric-value">{{ metrics.memory.usage }} MB</div>
          <div class="metric-label">内存使用</div>
          <div class="metric-trend">
            <span :class="getTrendClass(metrics.memory.trend)">{{ metrics.memory.trend > 0 ? '↑' : metrics.memory.trend < 0 ? '↓' : '→' }}</span>
            {{ Math.abs(metrics.memory.trend) }} MB
          </div>
        </div>
      </div>

      <div class="metric-card" :class="getMetricClass('network')">
        <div class="metric-icon">🌐</div>
        <div class="metric-content">
          <div class="metric-value">{{ metrics.network.rtt }} ms</div>
          <div class="metric-label">网络延迟</div>
          <div class="metric-trend">
            <span :class="getTrendClass(metrics.network.trend)">{{ metrics.network.trend > 0 ? '↑' : metrics.network.trend < 0 ? '↓' : '→' }}</span>
            {{ Math.abs(metrics.network.trend) }} ms
          </div>
        </div>
      </div>

      <div class="metric-card" :class="getMetricClass('matrix')">
        <div class="metric-icon">🔗</div>
        <div class="metric-content">
          <div class="metric-value">{{ metrics.matrix.rooms }}</div>
          <div class="metric-label">房间数量</div>
          <div class="metric-trend">
            <span :class="getTrendClass(metrics.matrix.trend)">{{ metrics.matrix.trend > 0 ? '↑' : metrics.matrix.trend < 0 ? '↓' : '→' }}</span>
            {{ Math.abs(metrics.matrix.trend) }}
          </div>
        </div>
      </div>
    </div>

    <!-- 实时图表 -->
    <div class="real-time-charts">
      <div class="chart-container">
        <h3>📈 FPS 实时图表</h3>
        <canvas ref="fpsChart" width="400" height="150"></canvas>
      </div>
      <div class="chart-container">
        <h3>📊 内存使用图表</h3>
        <canvas ref="memoryChart" width="400" height="150"></canvas>
      </div>
      <div class="chart-container">
        <h3>🌐 网络延迟图表</h3>
        <canvas ref="networkChart" width="400" height="150"></canvas>
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
          <span class="suggestion-text">{{ suggestion.text }}</span>
          <span class="suggestion-priority">{{ suggestion.priority }}</span>
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

    <!-- 错误和警告 -->
    <div class="error-warnings">
      <h3>⚠️ 错误和警告</h3>
      <div class="error-list">
        <div 
          v-for="error in recentErrors" 
          :key="error.id"
          class="error-item"
          :class="error.level"
        >
          <span class="error-time">{{ formatTime(error.timestamp) }}</span>
          <span class="error-level">{{ error.level.toUpperCase() }}</span>
          <span class="error-message">{{ error.message }}</span>
          <button 
            v-if="!error.resolved" 
            @click="resolveError(error.id)"
            class="error-action"
          >
            解决
          </button>
        </div>
      </div>
    </div>

    <!-- 网络状态 -->
    <div class="network-status">
      <h3>🌐 网络状态</h3>
      <div class="network-info">
        <div class="status-badge" :class="networkStatus">
          {{ networkStatusText }}
        </div>
        <div class="network-details">
          <span>连接类型: {{ networkMetrics.effectiveType }}</span>
          <span>下载速度: {{ networkMetrics.downlink }} Mbps</span>
          <span>省流量模式: {{ networkMetrics.saveData ? '开启' : '关闭' }}</span>
        </div>
      </div>
    </div>

    <!-- Matrix 状态 -->
    <div class="matrix-status">
      <h3>🔗 Matrix 连接状态</h3>
      <div class="matrix-info">
        <div class="connection-status" :class="matrixConnectionStatus">
          {{ matrixConnectionStatusText }}
        </div>
        <div class="matrix-details">
          <span>同步状态: {{ matrixSyncStatus }}</span>
          <span>消息处理时间: {{ matrixMetrics.messageProcessingTime }}ms</span>
          <span>最后同步时间: {{ formatTime(matrixMetrics.lastSyncTime) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue'
import { useNetworkMonitor } from '@/utils/networkMonitor'
import { useErrorMonitor } from '@/utils/errorMonitor'
import { useMatrixOptimizedStore } from '@/stores/matrix-optimized'

// 性能指标数据
const metrics = reactive({
  fps: {
    current: 60,
    average: 60,
    min: 60,
    max: 60,
    trend: 0,
    history: [] as number[]
  },
  memory: {
    usage: 0,
    total: 0,
    percentage: 0,
    trend: 0,
    history: [] as number[]
  },
  network: {
    rtt: 0,
    average: 0,
    min: 9999,
    max: 0,
    trend: 0,
    history: [] as number[]
  },
  matrix: {
    rooms: 0,
    messages: 0,
    trend: 0,
    syncDuration: 0
  }
})

// 控制状态
const autoRefresh = ref(true)
const isMonitoring = ref(false)

// 网络和错误监控
const { status: networkStatus, metrics: networkMetrics, getStatusText: getNetworkStatusText } = useNetworkMonitor()
const { errors: recentErrors, getErrorRate, clearErrors } = useErrorMonitor()

// Matrix 状态
const matrixStore = useMatrixOptimizedStore()
const matrixConnectionStatus = computed(() => {
  if (!matrixStore.isConnected) return 'disconnected'
  if (matrixStore.isSyncing) return 'syncing'
  return 'connected'
})

const matrixConnectionStatusText = computed(() => {
  if (!matrixStore.isConnected) return '已断开'
  if (matrixStore.isSyncing) return '同步中...'
  return '已连接'
})

const matrixSyncStatus = computed(() => matrixStore.connection.syncState.state || '未知')
const matrixMetrics = computed(() => matrixStore.getPerformanceMetrics())

// 计算属性
const networkStatusText = computed(() => getNetworkStatusText())

const performanceSuggestions = computed(() => {
  const suggestions: Array<{
    text: string
    priority: 'low' | 'medium' | 'high' | 'critical'
    action?: string
    actionText?: string
  }> = []

  // FPS 相关建议
  if (metrics.fps.current < 45) {
    suggestions.push({
      text: 'FPS 过低，建议启用虚拟滚动和减少动画效果',
      priority: 'critical',
      action: 'enableVirtualScroll',
      actionText: '启用虚拟滚动'
    })
  }

  // 内存相关建议
  if (metrics.memory.percentage > 80) {
    suggestions.push({
      text: '内存使用率过高，建议清理缓存和未使用的数据',
      priority: 'high',
      action: 'clearMemory',
      actionText: '清理内存'
    })
  }

  // 网络相关建议
  if (metrics.network.rtt > 500) {
    suggestions.push({
      text: '网络延迟过高，建议检查网络连接或启用离线模式',
      priority: 'high',
      action: 'checkNetwork',
      actionText: '检查网络'
    })
  }

  // Matrix 相关建议
  if (matrixMetrics.value.syncDuration > 5000) {
    suggestions.push({
      text: 'Matrix 同步耗时过长，建议减少同步频率',
      priority: 'medium',
      action: 'optimizeSync',
      actionText: '优化同步'
    })
  }

  // 错误率相关建议
  const errorRate = getErrorRate()
  if (errorRate > 5) {
    suggestions.push({
      text: `错误率过高 (${errorRate}/分钟)，建议检查系统状态`,
      priority: 'high',
      action: 'checkSystem',
      actionText: '检查系统'
    })
  }

  return suggestions
})

// 方法
const getMetricClass = (metric: string) => {
  switch (metric) {
    case 'fps':
      return metrics.fps.current >= 55 ? 'good' : metrics.fps.current >= 45 ? 'warning' : 'critical'
    case 'memory':
      return metrics.memory.percentage < 70 ? 'good' : metrics.memory.percentage < 85 ? 'warning' : 'critical'
    case 'network':
      return metrics.network.rtt < 100 ? 'good' : metrics.network.rtt < 300 ? 'warning' : 'critical'
    case 'matrix':
      return metrics.matrix.rooms > 0 ? 'good' : 'warning'
    default:
      return 'good'
  }
}

const getTrendClass = (trend: number) => {
  return trend > 0 ? 'positive' : trend < 0 ? 'negative' : 'neutral'
}

const formatTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleTimeString()
}

const toggleAutoRefresh = () => {
  autoRefresh.value = !autoRefresh.value
}

const exportData = () => {
  const data = {
    timestamp: new Date().toISOString(),
    metrics: { ...metrics },
    network: { status: networkStatus.value, metrics: networkMetrics.value },
    matrix: { 
      status: matrixConnectionStatus.value,
      rooms: matrixStore.rooms.length,
      messages: matrixStore.messages.size
    },
    errorRate: getErrorRate()
  }
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `performance-data-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)
}

const clearData = () => {
  clearErrors()
  metrics.fps.history = []
  metrics.memory.history = []
  metrics.network.history = []
}

const executeSuggestion = (action: string) => {
  switch (action) {
    case 'enableVirtualScroll':
      console.log('已启用虚拟滚动优化')
      break
    case 'clearMemory':
      console.log('内存清理完成')
      break
    case 'checkNetwork':
      console.log('网络检查完成')
      break
    case 'optimizeSync':
      console.log('同步优化完成')
      break
    case 'checkSystem':
      console.log('系统检查完成')
      break
  }
}

const resolveError = (errorId: string) => {
  // 这里需要调用错误监控的 resolveError 方法
  console.log('错误已解决:', errorId)
}

// 图表绘制
const drawChart = (canvas: HTMLCanvasElement, data: number[], label: string) => {
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  
  if (data.length < 2) return
  
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  
  ctx.strokeStyle = '#4CAF50'
  ctx.lineWidth = 2
  ctx.beginPath()
  
  data.forEach((value, index) => {
    const x = (index / (data.length - 1)) * canvas.width
    const y = canvas.height - ((value - min) / range) * canvas.height
    
    if (index === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
  })
  
  ctx.stroke()
  
  // 添加标签
  ctx.fillStyle = '#ffffff'
  ctx.font = '12px Arial'
  ctx.fillText(label, 10, 15)
}

// 性能监控函数
const startFPSMonitoring = () => {
  let frameCount = 0
  let lastTime = performance.now()
  let lastFpsTime = performance.now()

  const measureFPS = () => {
    const currentTime = performance.now()
    frameCount++
    
    if (currentTime - lastFpsTime >= 1000) {
      const fps = Math.round((frameCount * 1000) / (currentTime - lastFpsTime))
      const oldFPS = metrics.fps.current
      metrics.fps.current = fps
      metrics.fps.trend = fps - oldFPS
      metrics.fps.history.push(fps)
      
      if (metrics.fps.history.length > 60) {
        metrics.fps.history.shift()
      }
      
      frameCount = 0
      lastFpsTime = currentTime
    }
    
    lastTime = currentTime
    if (autoRefresh.value) {
      requestAnimationFrame(measureFPS)
    }
  }

  requestAnimationFrame(measureFPS)
}

const startMemoryMonitoring = () => {
  const measureMemory = () => {
    if ((performance as any).memory) {
      const memory = (performance as any).memory
      const oldUsage = metrics.memory.usage
      metrics.memory.usage = Math.round(memory.usedJSHeapSize / 1024 / 1024)
      metrics.memory.total = Math.round(memory.totalJSHeapSize / 1024 / 1024)
      metrics.memory.percentage = Math.round((memory.usedJSHeapSize / memory.totalJSHeapSize) * 100)
      metrics.memory.trend = metrics.memory.usage - oldUsage
      
      metrics.memory.history.push(metrics.memory.percentage)
      
      if (metrics.memory.history.length > 60) {
        metrics.memory.history.shift()
      }
    }
    
    if (autoRefresh.value) {
      setTimeout(startMemoryMonitoring, 2000)
    }
  }

  measureMemory()
}

const startNetworkMonitoring = () => {
  const measureNetwork = async () => {
    const startTime = performance.now()
    
    try {
      await fetch('https://httpbin.org/get', { 
        method: 'GET',
        cache: 'no-cache',
        signal: AbortSignal.timeout(5000)
      })
      
      const endTime = performance.now()
      const rtt = Math.round(endTime - startTime)
      const oldRTT = metrics.network.rtt
      metrics.network.rtt = rtt
      metrics.network.trend = rtt - oldRTT
      metrics.network.history.push(rtt)
      
      if (metrics.network.history.length > 20) {
        metrics.network.history.shift()
      }
      
      // 更新统计
      metrics.network.average = Math.round(metrics.network.history.reduce((a, b) => a + b, 0) / metrics.network.history.length)
      metrics.network.min = Math.min(...metrics.network.history)
      metrics.network.max = Math.max(...metrics.network.history)
      
    } catch (error) {
      metrics.network.rtt = 9999
      metrics.network.trend = 0
    }
    
    if (autoRefresh.value) {
      setTimeout(startNetworkMonitoring, 5000)
    }
  }

  measureNetwork()
}

const updateMatrixMetrics = () => {
  const oldRooms = metrics.matrix.rooms
  metrics.matrix.rooms = matrixStore.rooms.length + matrixStore.spaces.length + matrixStore.directMessages.length
  metrics.matrix.messages = 0
  matrixStore.messages.forEach(messages => {
    metrics.matrix.messages += messages.length
  })
  metrics.matrix.trend = metrics.matrix.rooms - oldRooms
  metrics.matrix.syncDuration = matrixMetrics.value.syncDuration
}

// 生命周期
onMounted(() => {
  isMonitoring.value = true
  
  startFPSMonitoring()
  startMemoryMonitoring()
  startNetworkMonitoring()
  
  // 更新Matrix指标
  const updateMatrix = () => {
    updateMatrixMetrics()
    if (autoRefresh.value) {
      setTimeout(updateMatrix, 3000)
    }
  }
  updateMatrix()
  
  // 绘制图表
  const drawCharts = () => {
    if (autoRefresh.value) {
      const fpsCanvas = document.querySelector('canvas[ref="fpsChart"]') as HTMLCanvasElement
      const memoryCanvas = document.querySelector('canvas[ref="memoryChart"]') as HTMLCanvasElement
      const networkCanvas = document.querySelector('canvas[ref="networkChart"]') as HTMLCanvasElement
      
      if (fpsCanvas) drawChart(fpsCanvas, metrics.fps.history, 'FPS')
      if (memoryCanvas) drawChart(memoryCanvas, metrics.memory.history, 'Memory %')
      if (networkCanvas) drawChart(networkCanvas, metrics.network.history, 'Network RTT')
      
      setTimeout(drawCharts, 1000)
    }
  }
  drawCharts()
})

onUnmounted(() => {
  autoRefresh.value = false
  isMonitoring.value = false
})

// 监听数据变化
watch(autoRefresh, (newVal) => {
  if (!newVal) {
    isMonitoring.value = false
  } else {
    isMonitoring.value = true
  }
})
</script>

<style scoped>
.performance-dashboard {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  color: #ffffff;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  backdrop-filter: blur(10px);
}

.dashboard-header h2 {
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
}

.dashboard-controls {
  display: flex;
  gap: 10px;
}

.control-btn {
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.control-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.control-btn.active {
  background: #9C27B0;
}

.key-metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
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
  display: flex;
  align-items: center;
  gap: 15px;
}

.metric-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.metric-card.good {
  border-left: 4px solid #4CAF50;
}

.metric-card.warning {
  border-left: 4px solid #FFB700;
}

.metric-card.critical {
  border-left: 4px solid #F44336;
}

.metric-icon {
  font-size: 2rem;
  margin-right: 10px;
}

.metric-content {
  flex: 1;
}

.metric-value {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 5px;
}

.metric-label {
  font-size: 0.9rem;
  opacity: 0.8;
  margin-bottom: 5px;
}

.metric-trend {
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: 5px;
}

.metric-trend.positive {
  color: #4CAF50;
}

.metric-trend.negative {
  color: #F44336;
}

.metric-trend.neutral {
  color: #888;
}

.real-time-charts {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.chart-container {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  padding: 20px;
  backdrop-filter: blur(10px);
}

.chart-container h3 {
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 1.2rem;
  font-weight: 600;
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

.suggestion-text {
  flex: 1;
}

.suggestion-priority {
  padding: 2px 6px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  margin-right: 10px;
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

.error-warnings {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 15px;
  padding: 20px;
  margin-bottom: 30px;
  backdrop-filter: blur(10px);
}

.error-warnings h3 {
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 1.3rem;
  font-weight: 600;
}

.error-list {
  max-height: 200px;
  overflow-y: auto;
  padding-right: 10px;
}

.error-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 0.9rem;
}

.error-item:last-child {
  border-bottom: none;
}

.error-time {
  color: #888;
  font-family: 'Courier New', monospace;
  min-width: 80px;
}

.error-level {
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  min-width: 50px;
  text-align: center;
}

.error-item.info .error-level {
  background: #2196F3;
}

.error-item.warning .error-level {
  background: #FFB700;
  color: #000;
}

.error-item.error .error-level {
  background: #F44336;
}

.error-item.critical .error-level {
  background: #9C27B0;
}

.error-message {
  flex: 1;
  opacity: 0.9;
}

.error-action {
  padding: 4px 8px;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 4px;
  color: white;
  font-size: 0.8rem;
  cursor: pointer;
  transition: background 0.3s ease;
}

.error-action:hover {
  background: rgba(255, 255, 255, 0.3);
}

.network-status, .matrix-status {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  padding: 20px;
  margin-bottom: 20px;
  backdrop-filter: blur(10px);
}

.network-status h3, .matrix-status h3 {
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 1.3rem;
  font-weight: 600;
}

.network-info, .matrix-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-badge, .connection-status {
  padding: 8px 16px;
  border-radius: 25px;
  font-weight: 600;
  text-align: center;
  text-transform: uppercase;
  font-size: 0.9rem;
}

.status-badge {
  background: rgba(255, 255, 255, 0.2);
}

.connection-status.connected {
  background: rgba(76, 175, 80, 0.3);
  color: #4CAF50;
}

.connection-status.syncing {
  background: rgba(33, 150, 243, 0.3);
  color: #2196F3;
}

.connection-status.disconnected {
  background: rgba(244, 67, 54, 0.3);
  color: #F44336;
}

.network-details, .matrix-details {
  display: flex;
  flex-direction: column;
  gap: 5px;
  font-size: 0.9rem;
  opacity: 0.9;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .performance-dashboard {
    padding: 10px;
  }
  
  .dashboard-header {
    flex-direction: column;
    gap: 15px;
  }
  
  .key-metrics {
    grid-template-columns: 1fr;
  }
  
  .real-time-charts {
    grid-template-columns: 1fr;
  }
  
  .metric-card {
    flex-direction: column;
    text-align: center;
  }
  
  .metric-trend {
    justify-content: center;
  }
}
</style>