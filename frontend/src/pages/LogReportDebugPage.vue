<template>
  <div class="log-report-debug">
    <div class="header">
      <h1>📊 日志上报调试页面</h1>
      <p class="description">
        监控埋点日志上报状态，查看失败统计和网络连接情况
      </p>
    </div>

    <div class="stats-grid">
      <!-- 总体统计 -->
      <div class="stat-card">
        <h3>📈 总体统计</h3>
        <div class="stat-item">
          <span class="label">总失败次数:</span>
          <span class="value">{{ stats.totalFailed }}</span>
        </div>
        <div class="stat-item">
          <span class="label">最近5分钟失败:</span>
          <span class="value" :class="{ 'error': stats.recentFailed > 0 }">
            {{ stats.recentFailed }}
          </span>
        </div>
      </div>

      <!-- 常见错误 -->
      <div class="stat-card">
        <h3>🚨 常见错误</h3>
        <div v-if="stats.commonErrors.length === 0" class="no-errors">
          ✅ 暂无错误记录
        </div>
        <div v-else>
          <div 
            v-for="error in stats.commonErrors" 
            :key="error.error"
            class="error-item"
          >
            <div class="error-message">{{ error.error }}</div>
            <div class="error-count">{{ error.count }}次</div>
          </div>
        </div>
      </div>

      <!-- 网络状态 -->
      <div class="stat-card">
        <h3>🌐 网络状态</h3>
        <div class="stat-item">
          <span class="label">在线状态:</span>
          <span class="value" :class="{ 'success': isOnline, 'error': !isOnline }">
            {{ isOnline ? '在线' : '离线' }}
          </span>
        </div>
        <div class="stat-item">
          <span class="label">日志服务器:</span>
          <span class="value" :class="{ 'success': logServerStatus === 'ok', 'error': logServerStatus === 'error' }">
            {{ logServerStatusText }}
          </span>
        </div>
      </div>

      <!-- 测试工具 -->
      <div class="stat-card">
        <h3>🧪 测试工具</h3>
        <div class="test-buttons">
          <button @click="testLogReport" :disabled="testing" class="test-btn">
            {{ testing ? '测试中...' : '测试日志上报' }}
          </button>
          <button @click="testNetworkError" class="test-btn error">
            模拟网络错误
          </button>
          <button @click="clearStats" class="test-btn">
            清除统计
          </button>
        </div>
      </div>
    </div>

    <!-- 实时日志 -->
    <div class="log-section">
      <h3>📝 实时日志</h3>
      <div class="log-container">
        <div 
          v-for="(log, index) in realtimeLogs" 
          :key="index"
          class="log-entry"
          :class="log.type"
        >
          <span class="timestamp">{{ formatTime(log.timestamp) }}</span>
          <span class="message">{{ log.message }}</span>
        </div>
        <div v-if="realtimeLogs.length === 0" class="no-logs">
          暂无日志记录
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { logReportHandler } from '../utils/logReportHandler'
import { analytics } from '../utils/analytics'

interface LogEntry {
  timestamp: number
  message: string
  type: 'info' | 'error' | 'success'
}

const stats = ref({
  totalFailed: 0,
  recentFailed: 0,
  commonErrors: [] as Array<{ error: string; count: number }>
})

const isOnline = ref(navigator.onLine)
const logServerStatus = ref<'checking' | 'ok' | 'error'>('checking')
const testing = ref(false)
const realtimeLogs = ref<LogEntry[]>([])

const logServerStatusText = computed(() => {
  switch (logServerStatus.value) {
    case 'checking': return '检查中...'
    case 'ok': return '正常'
    case 'error': return '异常'
    default: return '未知'
  }
})

// 更新统计信息
function updateStats() {
  stats.value = logReportHandler.getFailureStats()
}

// 检查日志服务器状态
async function checkLogServerStatus() {
  logServerStatus.value = 'checking'
  try {
    const response = await fetch('https://nlog.daxuesoutijiang.com/health', {
      method: 'HEAD',
      mode: 'no-cors',
      signal: AbortSignal.timeout(5000)
    })
    logServerStatus.value = 'ok'
    addLog('日志服务器连接正常', 'success')
  } catch (error) {
    logServerStatus.value = 'error'
    addLog(`日志服务器连接失败: ${error.message}`, 'error')
  }
}

// 测试日志上报
async function testLogReport() {
  testing.value = true
  addLog('开始测试日志上报...', 'info')
  
  try {
    analytics.track('test_log_report', {
      source: 'debug_page',
      timestamp: Date.now()
    })
    
    // 等待一段时间看是否有错误
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    addLog('日志上报测试完成', 'success')
  } catch (error) {
    addLog(`日志上报测试失败: ${error.message}`, 'error')
  } finally {
    testing.value = false
    updateStats()
  }
}

// 模拟网络错误
function testNetworkError() {
  addLog('模拟网络错误...', 'info')
  
  // 模拟一个会失败的请求
  fetch('https://nlog.daxuesoutijiang.com/invalid-endpoint', {
    method: 'POST',
    body: JSON.stringify({ test: 'error' })
  }).catch(error => {
    addLog(`模拟错误触发: ${error.message}`, 'error')
    updateStats()
  })
}

// 清除统计
function clearStats() {
  // 这里需要在 logReportHandler 中添加清除方法
  realtimeLogs.value = []
  addLog('统计信息已清除', 'info')
  updateStats()
}

// 添加实时日志
function addLog(message: string, type: LogEntry['type'] = 'info') {
  realtimeLogs.value.unshift({
    timestamp: Date.now(),
    message,
    type
  })
  
  // 保持日志数量在合理范围内
  if (realtimeLogs.value.length > 50) {
    realtimeLogs.value = realtimeLogs.value.slice(0, 50)
  }
}

// 格式化时间
function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString()
}

// 监听网络状态变化
function handleOnline() {
  isOnline.value = true
  addLog('网络连接已恢复', 'success')
  checkLogServerStatus()
}

function handleOffline() {
  isOnline.value = false
  addLog('网络连接已断开', 'error')
}

let updateInterval: number

onMounted(() => {
  // 初始化
  updateStats()
  checkLogServerStatus()
  
  // 定期更新统计信息
  updateInterval = setInterval(updateStats, 5000)
  
  // 监听网络状态
  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)
  
  addLog('日志调试页面已加载', 'info')
})

onUnmounted(() => {
  if (updateInterval) {
    clearInterval(updateInterval)
  }
  window.removeEventListener('online', handleOnline)
  window.removeEventListener('offline', handleOffline)
})
</script>

<style scoped>
.log-report-debug {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  text-align: center;
  margin-bottom: 30px;
}

.header h1 {
  color: #2c3e50;
  margin-bottom: 10px;
}

.description {
  color: #7f8c8d;
  font-size: 14px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  border: 1px solid #e1e8ed;
}

.stat-card h3 {
  margin: 0 0 15px 0;
  color: #2c3e50;
  font-size: 16px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.label {
  color: #7f8c8d;
}

.value {
  font-weight: bold;
  color: #2c3e50;
}

.value.success {
  color: #27ae60;
}

.value.error {
  color: #e74c3c;
}

.no-errors {
  color: #27ae60;
  font-style: italic;
}

.error-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  background: #fdf2f2;
  border-radius: 4px;
  margin-bottom: 8px;
}

.error-message {
  flex: 1;
  font-size: 12px;
  color: #e74c3c;
}

.error-count {
  background: #e74c3c;
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
}

.test-buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.test-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.test-btn:not(.error) {
  background: #3498db;
  color: white;
}

.test-btn:not(.error):hover {
  background: #2980b9;
}

.test-btn.error {
  background: #e74c3c;
  color: white;
}

.test-btn.error:hover {
  background: #c0392b;
}

.test-btn:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
}

.log-section {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  border: 1px solid #e1e8ed;
}

.log-section h3 {
  margin: 0 0 15px 0;
  color: #2c3e50;
}

.log-container {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #e1e8ed;
  border-radius: 4px;
  padding: 10px;
  background: #f8f9fa;
}

.log-entry {
  display: flex;
  margin-bottom: 8px;
  font-family: monospace;
  font-size: 12px;
}

.timestamp {
  color: #7f8c8d;
  margin-right: 10px;
  min-width: 80px;
}

.message {
  flex: 1;
}

.log-entry.info .message {
  color: #2c3e50;
}

.log-entry.success .message {
  color: #27ae60;
}

.log-entry.error .message {
  color: #e74c3c;
}

.no-logs {
  text-align: center;
  color: #7f8c8d;
  font-style: italic;
  padding: 20px;
}
</style>