<template>
  <div class="matrix-test-container">
    <div class="test-header">
      <h1>🚀 JianLuoChat Matrix 互通性测试</h1>
      <div class="account-info">
        <h3>测试账户信息</h3>
        <p><strong>Matrix ID:</strong> @mybatis:matrix.org</p>
        <p><strong>服务器:</strong> matrix.org</p>
        <p><strong>状态:</strong> <span :class="statusClass">{{ status }}</span></p>
      </div>
    </div>

    <div class="test-controls">
      <button @click="testLogin" :disabled="isRunning" class="test-btn">
        🔐 测试登录
      </button>
      <button @click="testRooms" :disabled="isRunning || !isLoggedIn" class="test-btn">
        🏠 获取房间
      </button>
      <button @click="testSendMessage" :disabled="isRunning || !isLoggedIn" class="test-btn">
        📝 发送测试消息
      </button>
      <button @click="testCreateRoom" :disabled="isRunning || !isLoggedIn" class="test-btn">
        🏗️ 创建房间
      </button>
      <button @click="runFullTest" :disabled="isRunning" class="test-btn primary">
        🧪 运行完整测试
      </button>
      <button @click="clearLog" class="test-btn secondary">
        🧹 清空日志
      </button>
    </div>

    <div class="test-log">
      <h3>测试日志</h3>
      <div class="log-container" ref="logContainer">
        <div 
          v-for="(entry, index) in logEntries" 
          :key="index" 
          :class="['log-entry', entry.type]"
        >
          [{{ entry.timestamp }}] {{ entry.message }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue'
import { MatrixInteroperabilityTest } from '../utils/matrixTest.js'

// 响应式数据
const logEntries = ref([])
const isRunning = ref(false)
const isLoggedIn = ref(false)
const status = ref('未连接')
const logContainer = ref(null)

// 测试实例
let testInstance = null

// 计算属性
const statusClass = computed(() => {
  switch (status.value) {
    case '已登录':
    case '已同步':
      return 'status-success'
    case '登录失败':
      return 'status-error'
    default:
      return 'status-info'
  }
})

// 初始化
onMounted(() => {
  testInstance = new MatrixInteroperabilityTest()
  
  // 监听日志
  testInstance.onLog((logEntry) => {
    logEntries.value.push(logEntry)
    nextTick(() => {
      if (logContainer.value) {
        logContainer.value.scrollTop = logContainer.value.scrollHeight
      }
    })
  })

  // 初始日志
  addLog('🌟 Matrix 互通性测试工具已准备就绪')
  addLog('📋 测试步骤:')
  addLog('  1. 点击 "测试登录" 按钮')
  addLog('  2. 等待登录和同步完成')
  addLog('  3. 测试各项功能')
  addLog('  4. 在 Element 客户端中验证结果')
})

onUnmounted(() => {
  if (testInstance) {
    testInstance.stop()
  }
})

// 添加日志的辅助函数
const addLog = (message, type = 'info') => {
  const timestamp = new Date().toLocaleTimeString()
  logEntries.value.push({ timestamp, message, type })
  nextTick(() => {
    if (logContainer.value) {
      logContainer.value.scrollTop = logContainer.value.scrollHeight
    }
  })
}

// 测试方法
const testLogin = async () => {
  isRunning.value = true
  try {
    const result = await testInstance.testLogin()
    if (result.success) {
      isLoggedIn.value = true
      status.value = '已登录'
    } else {
      status.value = '登录失败'
    }
  } catch (error) {
    addLog(`❌ 测试异常: ${error.message}`, 'error')
    status.value = '登录失败'
  } finally {
    isRunning.value = false
  }
}

const testRooms = async () => {
  isRunning.value = true
  try {
    await testInstance.testRooms()
  } catch (error) {
    addLog(`❌ 测试异常: ${error.message}`, 'error')
  } finally {
    isRunning.value = false
  }
}

const testSendMessage = async () => {
  isRunning.value = true
  try {
    await testInstance.testSendMessage()
  } catch (error) {
    addLog(`❌ 测试异常: ${error.message}`, 'error')
  } finally {
    isRunning.value = false
  }
}

const testCreateRoom = async () => {
  isRunning.value = true
  try {
    await testInstance.testCreateRoom()
  } catch (error) {
    addLog(`❌ 测试异常: ${error.message}`, 'error')
  } finally {
    isRunning.value = false
  }
}

const runFullTest = async () => {
  isRunning.value = true
  try {
    const result = await testInstance.runFullTest()
    if (result.success) {
      isLoggedIn.value = true
      status.value = '已同步'
    } else {
      status.value = '测试失败'
    }
  } catch (error) {
    addLog(`❌ 测试异常: ${error.message}`, 'error')
    status.value = '测试失败'
  } finally {
    isRunning.value = false
  }
}

const clearLog = () => {
  logEntries.value = []
  addLog('🧹 日志已清空')
}
</script>

<style scoped>
.matrix-test-container {
  font-family: 'Courier New', monospace;
  background: #1a1a2e;
  color: #00ff88;
  padding: 20px;
  min-height: 100vh;
  line-height: 1.6;
}

.test-header h1 {
  text-align: center;
  margin-bottom: 20px;
  color: #00ff88;
  text-shadow: 0 0 10px rgba(0, 255, 136, 0.5);
}

.account-info {
  background: rgba(0, 255, 136, 0.1);
  border: 1px solid #00ff88;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
}

.account-info h3 {
  margin-top: 0;
  color: #00ff88;
}

.status-success { color: #00ff88; }
.status-error { color: #ff4444; }
.status-info { color: #4488ff; }

.test-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
}

.test-btn {
  background: linear-gradient(45deg, #00ff88, #00cc6a);
  border: none;
  color: #000;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  font-family: inherit;
  transition: all 0.3s ease;
}

.test-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 255, 136, 0.4);
}

.test-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.test-btn.primary {
  background: linear-gradient(45deg, #ff6b6b, #ee5a52);
  color: white;
}

.test-btn.secondary {
  background: linear-gradient(45deg, #4ecdc4, #44a08d);
}

.test-log {
  background: rgba(0, 255, 136, 0.1);
  border: 1px solid #00ff88;
  border-radius: 8px;
  padding: 15px;
}

.test-log h3 {
  margin-top: 0;
  color: #00ff88;
}

.log-container {
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid #333;
  border-radius: 6px;
  padding: 15px;
  height: 400px;
  overflow-y: auto;
  font-family: 'Courier New', monospace;
  font-size: 14px;
}

.log-entry {
  margin-bottom: 2px;
  word-wrap: break-word;
}

.log-entry.success { color: #00ff88; }
.log-entry.error { color: #ff4444; }
.log-entry.info { color: #4488ff; }

/* 滚动条样式 */
.log-container::-webkit-scrollbar {
  width: 8px;
}

.log-container::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 4px;
}

.log-container::-webkit-scrollbar-thumb {
  background: #00ff88;
  border-radius: 4px;
}

.log-container::-webkit-scrollbar-thumb:hover {
  background: #00cc6a;
}
</style>
