<template>
  <div class="crypto-debug">
    <div class="debug-header">
      <h1>🔐 加密功能调试</h1>
      <p>检查和调试端到端加密功能</p>
    </div>

    <!-- 环境检查 -->
    <el-card class="debug-card">
      <template #header>
        <span>环境检查</span>
      </template>
      
      <div class="check-list">
        <div class="check-item">
          <el-icon :class="checks.webAssembly ? 'success' : 'error'">
            <component :is="checks.webAssembly ? 'SuccessFilled' : 'CircleCloseFilled'" />
          </el-icon>
          <span>WebAssembly支持: {{ checks.webAssembly ? '✅' : '❌' }}</span>
        </div>

        <div class="check-item">
          <el-icon :class="checks.indexedDB ? 'success' : 'error'">
            <component :is="checks.indexedDB ? 'SuccessFilled' : 'CircleCloseFilled'" />
          </el-icon>
          <span>IndexedDB支持: {{ checks.indexedDB ? '✅' : '❌' }}</span>
        </div>

        <div class="check-item">
          <el-icon :class="checks.webCrypto ? 'success' : 'error'">
            <component :is="checks.webCrypto ? 'SuccessFilled' : 'CircleCloseFilled'" />
          </el-icon>
          <span>Web Crypto API: {{ checks.webCrypto ? '✅' : '❌' }}</span>
        </div>

        <div class="check-item">
          <el-icon :class="checks.secureContext ? 'success' : 'error'">
            <component :is="checks.secureContext ? 'SuccessFilled' : 'CircleCloseFilled'" />
          </el-icon>
          <span>安全上下文: {{ checks.secureContext ? '✅' : '❌' }}</span>
        </div>

        <div class="check-item">
          <el-icon :class="checks.matrixClient ? 'success' : 'error'">
            <component :is="checks.matrixClient ? 'SuccessFilled' : 'CircleCloseFilled'" />
          </el-icon>
          <span>Matrix客户端: {{ checks.matrixClient ? '✅' : '❌' }}</span>
        </div>

        <div class="check-item">
          <el-icon :class="checks.cryptoAPI ? 'success' : 'error'">
            <component :is="checks.cryptoAPI ? 'SuccessFilled' : 'CircleCloseFilled'" />
          </el-icon>
          <span>加密API: {{ checks.cryptoAPI ? '✅' : '❌' }}</span>
        </div>
      </div>

      <div class="actions">
        <el-button @click="runEnvironmentCheck" :loading="checking">
          重新检查环境
        </el-button>
      </div>
    </el-card>

    <!-- 加密测试 -->
    <el-card class="debug-card">
      <template #header>
        <span>加密功能测试</span>
      </template>

      <div class="test-actions">
        <el-button 
          @click="testCryptoInit" 
          :loading="testing.init"
          :disabled="!checks.matrixClient"
        >
          测试加密初始化
        </el-button>
        
        <el-button 
          @click="testDeviceKeys" 
          :loading="testing.keys"
          :disabled="!checks.cryptoAPI"
        >
          测试设备密钥
        </el-button>
        
        <el-button 
          @click="testKeyExport" 
          :loading="testing.export"
          :disabled="!checks.cryptoAPI"
        >
          测试密钥导出
        </el-button>
      </div>

      <div v-if="testResults.length > 0" class="test-results">
        <h4>测试结果:</h4>
        <div 
          v-for="(result, index) in testResults"
          :key="index"
          class="test-result"
          :class="{ success: result.success, error: !result.success }"
        >
          <el-icon>
            <component :is="result.success ? 'SuccessFilled' : 'CircleCloseFilled'" />
          </el-icon>
          <div class="result-content">
            <div class="result-title">{{ result.title }}</div>
            <div class="result-message">{{ result.message }}</div>
            <div v-if="result.details" class="result-details">
              <pre>{{ JSON.stringify(result.details, null, 2) }}</pre>
            </div>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 错误日志 -->
    <el-card class="debug-card" v-if="errorLogs.length > 0">
      <template #header>
        <span>错误日志</span>
      </template>

      <div class="error-logs">
        <div 
          v-for="(log, index) in errorLogs"
          :key="index"
          class="error-log"
        >
          <div class="log-time">{{ formatTime(log.time) }}</div>
          <div class="log-message">{{ log.message }}</div>
          <div v-if="log.stack" class="log-stack">
            <pre>{{ log.stack }}</pre>
          </div>
        </div>
      </div>

      <div class="actions">
        <el-button @click="clearLogs">清除日志</el-button>
      </div>
    </el-card>

    <!-- 解决方案建议 -->
    <el-card class="debug-card" v-if="suggestions.length > 0">
      <template #header>
        <span>解决方案建议</span>
      </template>

      <div class="suggestions">
        <div 
          v-for="(suggestion, index) in suggestions"
          :key="index"
          class="suggestion"
        >
          <el-icon class="suggestion-icon">
            <InfoFilled />
          </el-icon>
          <div class="suggestion-content">
            <h4>{{ suggestion.title }}</h4>
            <p>{{ suggestion.description }}</p>
            <div v-if="suggestion.steps" class="suggestion-steps">
              <ol>
                <li v-for="step in suggestion.steps" :key="step">{{ step }}</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { SuccessFilled, CircleCloseFilled, InfoFilled } from '@element-plus/icons-vue'
import { useMatrixStore } from '@/stores/matrix'

// Store
const matrixStore = useMatrixStore()

// 响应式数据
const checking = ref(false)
const testing = ref({
  init: false,
  keys: false,
  export: false
})

const checks = ref({
  webAssembly: false,
  indexedDB: false,
  webCrypto: false,
  secureContext: false,
  matrixClient: false,
  cryptoAPI: false
})

const testResults = ref<Array<{
  title: string
  message: string
  success: boolean
  details?: any
}>>([])

const errorLogs = ref<Array<{
  time: number
  message: string
  stack?: string
}>>([])

const suggestions = ref<Array<{
  title: string
  description: string
  steps?: string[]
}>>([])

// 方法
const runEnvironmentCheck = async () => {
  checking.value = true
  try {
    // 检查WebAssembly
    checks.value.webAssembly = typeof WebAssembly === 'object' && 
                               typeof WebAssembly.instantiate === 'function'

    // 检查IndexedDB
    checks.value.indexedDB = 'indexedDB' in window && indexedDB !== null

    // 检查Web Crypto API
    checks.value.webCrypto = 'crypto' in window && 'subtle' in window.crypto

    // 检查安全上下文
    checks.value.secureContext = window.isSecureContext

    // 检查Matrix客户端
    checks.value.matrixClient = !!matrixStore.matrixClient

    // 检查加密API
    if (matrixStore.matrixClient) {
      const crypto = matrixStore.matrixClient.getCrypto()
      checks.value.cryptoAPI = !!crypto
    }

    // 生成建议
    generateSuggestions()

    ElMessage.success('环境检查完成')
  } catch (error: any) {
    console.error('环境检查失败:', error)
    addErrorLog('环境检查失败', error)
    ElMessage.error('环境检查失败')
  } finally {
    checking.value = false
  }
}

const testCryptoInit = async () => {
  testing.value.init = true
  try {
    const client = matrixStore.matrixClient
    if (!client) {
      throw new Error('Matrix客户端未初始化')
    }

    // 测试加密初始化
    if (typeof (client as any).initRustCrypto === 'function') {
      await (client as any).initRustCrypto({
        useIndexedDB: false // 使用内存存储进行测试
      })

      testResults.value.push({
        title: '加密初始化测试',
        message: '成功初始化Rust加密引擎',
        success: true,
        details: {
          method: 'initRustCrypto',
          storage: 'memory'
        }
      })
    } else {
      throw new Error('客户端不支持Rust加密初始化')
    }
  } catch (error: any) {
    console.error('加密初始化测试失败:', error)
    addErrorLog('加密初始化测试失败', error)
    testResults.value.push({
      title: '加密初始化测试',
      message: `失败: ${error.message}`,
      success: false
    })
  } finally {
    testing.value.init = false
  }
}

const testDeviceKeys = async () => {
  testing.value.keys = true
  try {
    const client = matrixStore.matrixClient
    if (!client) {
      throw new Error('Matrix客户端未初始化')
    }

    const crypto = client.getCrypto()
    if (!crypto) {
      throw new Error('加密API不可用')
    }

    const deviceId = client.getDeviceId()
    const userId = client.getUserId()

    testResults.value.push({
      title: '设备密钥测试',
      message: '成功获取设备信息',
      success: true,
      details: {
        deviceId,
        userId,
        cryptoAvailable: true
      }
    })
  } catch (error: any) {
    console.error('设备密钥测试失败:', error)
    addErrorLog('设备密钥测试失败', error)
    testResults.value.push({
      title: '设备密钥测试',
      message: `失败: ${error.message}`,
      success: false
    })
  } finally {
    testing.value.keys = false
  }
}

const testKeyExport = async () => {
  testing.value.export = true
  try {
    const client = matrixStore.matrixClient
    if (!client) {
      throw new Error('Matrix客户端未初始化')
    }

    const crypto = client.getCrypto()
    if (!crypto) {
      throw new Error('加密API不可用')
    }

    const keys = await crypto.exportRoomKeys()

    testResults.value.push({
      title: '密钥导出测试',
      message: `成功导出 ${keys.length} 个房间密钥`,
      success: true,
      details: {
        keyCount: keys.length
      }
    })
  } catch (error: any) {
    console.error('密钥导出测试失败:', error)
    addErrorLog('密钥导出测试失败', error)
    testResults.value.push({
      title: '密钥导出测试',
      message: `失败: ${error.message}`,
      success: false
    })
  } finally {
    testing.value.export = false
  }
}

const addErrorLog = (message: string, error: any) => {
  errorLogs.value.push({
    time: Date.now(),
    message,
    stack: error.stack
  })
}

const clearLogs = () => {
  errorLogs.value = []
  testResults.value = []
}

const formatTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleTimeString()
}

const generateSuggestions = () => {
  suggestions.value = []

  if (!checks.value.webAssembly) {
    suggestions.value.push({
      title: 'WebAssembly不支持',
      description: '您的浏览器不支持WebAssembly，这是加密功能的必要条件',
      steps: [
        '更新浏览器到最新版本',
        '使用Chrome、Firefox或Safari浏览器',
        '检查浏览器设置中是否禁用了WebAssembly'
      ]
    })
  }

  if (!checks.value.secureContext) {
    suggestions.value.push({
      title: '非安全上下文',
      description: '加密功能需要在HTTPS或localhost环境下运行',
      steps: [
        '使用HTTPS访问网站',
        '或在localhost环境下测试',
        '检查浏览器地址栏是否显示安全锁图标'
      ]
    })
  }

  if (!checks.value.indexedDB) {
    suggestions.value.push({
      title: 'IndexedDB不可用',
      description: '浏览器存储功能不可用，可能影响密钥持久化',
      steps: [
        '检查浏览器是否处于隐私模式',
        '清除浏览器数据并重试',
        '检查浏览器存储设置'
      ]
    })
  }
}

// 生命周期
onMounted(() => {
  runEnvironmentCheck()
})
</script>

<style scoped>
.crypto-debug {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.debug-header {
  text-align: center;
  margin-bottom: 30px;
}

.debug-card {
  margin-bottom: 20px;
}

.check-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.check-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.check-item .success {
  color: #67c23a;
}

.check-item .error {
  color: #f56c6c;
}

.actions {
  text-align: center;
}

.test-actions {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.test-results {
  margin-top: 20px;
}

.test-result {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 12px;
}

.test-result.success {
  background: #f0f9ff;
  border: 1px solid #b3d8ff;
}

.test-result.error {
  background: #fef0f0;
  border: 1px solid #fbc4c4;
}

.result-content {
  flex: 1;
}

.result-title {
  font-weight: 500;
  margin-bottom: 4px;
}

.result-message {
  color: #606266;
  margin-bottom: 8px;
}

.result-details {
  background: #f5f7fa;
  padding: 8px;
  border-radius: 4px;
  font-size: 12px;
}

.result-details pre {
  margin: 0;
  white-space: pre-wrap;
}

.error-logs {
  max-height: 300px;
  overflow-y: auto;
}

.error-log {
  padding: 12px;
  border-bottom: 1px solid #e4e7ed;
}

.log-time {
  font-size: 12px;
  color: #909399;
  margin-bottom: 4px;
}

.log-message {
  font-weight: 500;
  margin-bottom: 8px;
}

.log-stack {
  background: #f5f7fa;
  padding: 8px;
  border-radius: 4px;
  font-size: 11px;
}

.log-stack pre {
  margin: 0;
  white-space: pre-wrap;
}

.suggestions {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.suggestion {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  background: #f4f4f5;
  border-radius: 8px;
}

.suggestion-icon {
  color: #409eff;
  font-size: 20px;
  margin-top: 2px;
}

.suggestion-content h4 {
  margin: 0 0 8px 0;
}

.suggestion-content p {
  margin: 0 0 12px 0;
  color: #606266;
}

.suggestion-steps ol {
  margin: 0;
  padding-left: 20px;
}

.suggestion-steps li {
  margin-bottom: 4px;
}
</style>
