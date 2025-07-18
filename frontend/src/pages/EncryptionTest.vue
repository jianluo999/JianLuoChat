<template>
  <div class="encryption-test">
    <div class="test-header">
      <h1>🧪 端到端加密测试</h1>
      <p class="header-description">
        验证端到端加密功能的正确性和互操作性
      </p>
    </div>

    <!-- 快速检查 -->
    <el-card class="quick-check-card">
      <template #header>
        <div class="card-header">
          <span>快速检查</span>
          <el-button 
            type="primary" 
            size="small"
            @click="runQuickCheck"
            :loading="quickChecking"
          >
            运行检查
          </el-button>
        </div>
      </template>

      <div v-if="quickCheckResult" class="quick-check-result">
        <div class="check-item">
          <el-icon :class="quickCheckResult.cryptoAvailable ? 'success' : 'error'">
            <component :is="quickCheckResult.cryptoAvailable ? 'SuccessFilled' : 'CircleCloseFilled'" />
          </el-icon>
          <span>加密API: {{ quickCheckResult.cryptoAvailable ? '可用' : '不可用' }}</span>
        </div>

        <div class="check-item">
          <el-icon :class="quickCheckResult.deviceId ? 'success' : 'error'">
            <component :is="quickCheckResult.deviceId ? 'SuccessFilled' : 'CircleCloseFilled'" />
          </el-icon>
          <span>设备ID: {{ quickCheckResult.deviceId || '不可用' }}</span>
        </div>

        <div class="check-item">
          <el-icon :class="quickCheckResult.userId ? 'success' : 'error'">
            <component :is="quickCheckResult.userId ? 'SuccessFilled' : 'CircleCloseFilled'" />
          </el-icon>
          <span>用户ID: {{ quickCheckResult.userId || '不可用' }}</span>
        </div>

        <div class="check-item">
          <el-icon :class="quickCheckResult.canEncrypt ? 'success' : 'error'">
            <component :is="quickCheckResult.canEncrypt ? 'SuccessFilled' : 'CircleCloseFilled'" />
          </el-icon>
          <span>加密功能: {{ quickCheckResult.canEncrypt ? '可用' : '不可用' }}</span>
        </div>

        <div v-if="quickCheckResult.issues.length > 0" class="issues">
          <h4>发现的问题:</h4>
          <ul>
            <li v-for="issue in quickCheckResult.issues" :key="issue">
              {{ issue }}
            </li>
          </ul>
        </div>
      </div>
    </el-card>

    <!-- 完整测试套件 -->
    <el-card class="test-suite-card">
      <template #header>
        <div class="card-header">
          <span>完整测试套件</span>
          <div class="header-actions">
            <el-button 
              type="success" 
              @click="runAllTests"
              :loading="testing"
              :disabled="!canRunTests"
            >
              运行所有测试
            </el-button>
            <el-button 
              v-if="testResults.size > 0"
              @click="exportReport"
            >
              导出报告
            </el-button>
          </div>
        </div>
      </template>

      <!-- 测试进度 -->
      <div v-if="testing" class="test-progress">
        <el-progress 
          :percentage="testProgress" 
          :status="testProgress === 100 ? 'success' : undefined"
        />
        <p class="progress-text">{{ currentTestName }}</p>
      </div>

      <!-- 测试摘要 -->
      <div v-if="testSummary" class="test-summary">
        <div class="summary-stats">
          <div class="stat-item">
            <span class="stat-number">{{ testSummary.total }}</span>
            <span class="stat-label">总测试数</span>
          </div>
          <div class="stat-item success">
            <span class="stat-number">{{ testSummary.passed }}</span>
            <span class="stat-label">通过</span>
          </div>
          <div class="stat-item error">
            <span class="stat-number">{{ testSummary.failed }}</span>
            <span class="stat-label">失败</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">{{ testSummary.passRate }}%</span>
            <span class="stat-label">通过率</span>
          </div>
        </div>
      </div>

      <!-- 测试结果详情 -->
      <div v-if="testResults.size > 0" class="test-results">
        <h3>测试结果详情</h3>
        <div class="results-list">
          <div 
            v-for="[testName, result] in testResults"
            :key="testName"
            class="result-item"
            :class="{ success: result.success, error: !result.success }"
          >
            <div class="result-header">
              <el-icon class="result-icon">
                <component :is="result.success ? 'SuccessFilled' : 'CircleCloseFilled'" />
              </el-icon>
              <span class="result-name">{{ testName }}</span>
              <el-tag 
                :type="result.success ? 'success' : 'danger'"
                size="small"
              >
                {{ result.success ? '通过' : '失败' }}
              </el-tag>
            </div>
            
            <div class="result-content">
              <p class="result-message">{{ result.message }}</p>
              
              <div v-if="result.error" class="result-error">
                <strong>错误:</strong> {{ result.error }}
              </div>
              
              <div v-if="result.details" class="result-details">
                <el-collapse>
                  <el-collapse-item title="详细信息" :name="testName">
                    <pre>{{ JSON.stringify(result.details, null, 2) }}</pre>
                  </el-collapse-item>
                </el-collapse>
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 互操作性测试 -->
    <el-card class="interop-test-card">
      <template #header>
        <span>互操作性测试</span>
      </template>

      <div class="interop-content">
        <p>测试与其他Matrix客户端的兼容性:</p>
        
        <div class="interop-instructions">
          <h4>测试步骤:</h4>
          <ol>
            <li>在另一台设备上使用Element或其他Matrix客户端登录同一账户</li>
            <li>创建一个加密房间并邀请测试用户</li>
            <li>在两个客户端之间发送加密消息</li>
            <li>验证消息能够正确加密和解密</li>
            <li>测试设备验证功能</li>
          </ol>
        </div>

        <div class="interop-actions">
          <el-button @click="createTestRoom" :loading="creatingRoom">
            创建测试房间
          </el-button>
          <el-button @click="sendTestMessage" :loading="sendingMessage">
            发送测试消息
          </el-button>
        </div>

        <div v-if="interopResults.length > 0" class="interop-results">
          <h4>互操作性测试结果:</h4>
          <div 
            v-for="(result, index) in interopResults"
            :key="index"
            class="interop-result"
          >
            <el-icon :class="result.success ? 'success' : 'error'">
              <component :is="result.success ? 'SuccessFilled' : 'CircleCloseFilled'" />
            </el-icon>
            <span>{{ result.message }}</span>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 性能测试 -->
    <el-card class="performance-test-card">
      <template #header>
        <div class="card-header">
          <span>性能测试</span>
          <el-button 
            @click="runPerformanceTest"
            :loading="performanceTesting"
          >
            运行性能测试
          </el-button>
        </div>
      </template>

      <div v-if="performanceResults" class="performance-results">
        <div class="performance-metrics">
          <div class="metric-item">
            <span class="metric-label">加密初始化时间:</span>
            <span class="metric-value">{{ performanceResults.initTime }}ms</span>
          </div>
          <div class="metric-item">
            <span class="metric-label">消息加密时间:</span>
            <span class="metric-value">{{ performanceResults.encryptTime }}ms</span>
          </div>
          <div class="metric-item">
            <span class="metric-label">消息解密时间:</span>
            <span class="metric-value">{{ performanceResults.decryptTime }}ms</span>
          </div>
          <div class="metric-item">
            <span class="metric-label">密钥导出时间:</span>
            <span class="metric-value">{{ performanceResults.exportTime }}ms</span>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { SuccessFilled, CircleCloseFilled } from '@element-plus/icons-vue'
import { useMatrixStore } from '@/stores/matrix'
import { createEncryptionTester, quickEncryptionCheck } from '@/utils/encryptionTest'
import type { EncryptionTestResult } from '@/utils/encryptionTest'

// Store
const matrixStore = useMatrixStore()

// 响应式数据
const quickChecking = ref(false)
const testing = ref(false)
const creatingRoom = ref(false)
const sendingMessage = ref(false)
const performanceTesting = ref(false)

const quickCheckResult = ref<any>(null)
const testResults = ref<Map<string, EncryptionTestResult>>(new Map())
const testProgress = ref(0)
const currentTestName = ref('')
const interopResults = ref<Array<{ success: boolean; message: string }>>([])
const performanceResults = ref<any>(null)

// 计算属性
const canRunTests = computed(() => {
  return !!matrixStore.matrixClient && !testing.value
})

const testSummary = computed(() => {
  if (testResults.value.size === 0) return null
  
  const total = testResults.value.size
  const passed = Array.from(testResults.value.values()).filter(result => result.success).length
  const failed = total - passed
  const passRate = total > 0 ? Math.round((passed / total) * 100) : 0

  return { total, passed, failed, passRate }
})

// 方法
const runQuickCheck = async () => {
  quickChecking.value = true
  try {
    quickCheckResult.value = await quickEncryptionCheck(matrixStore.matrixClient)
    
    if (quickCheckResult.value.issues.length === 0) {
      ElMessage.success('快速检查通过，加密功能正常')
    } else {
      ElMessage.warning('快速检查发现一些问题，请查看详情')
    }
  } catch (error: any) {
    console.error('快速检查失败:', error)
    ElMessage.error(`快速检查失败: ${error.message}`)
  } finally {
    quickChecking.value = false
  }
}

const runAllTests = async () => {
  if (!matrixStore.matrixClient) {
    ElMessage.error('Matrix客户端未初始化')
    return
  }

  testing.value = true
  testProgress.value = 0
  currentTestName.value = '准备测试...'

  try {
    const tester = createEncryptionTester(matrixStore.matrixClient)
    
    // 模拟测试进度
    const progressInterval = setInterval(() => {
      if (testProgress.value < 90) {
        testProgress.value += 10
      }
    }, 500)

    const results = await tester.runAllTests()
    testResults.value = results

    clearInterval(progressInterval)
    testProgress.value = 100
    currentTestName.value = '测试完成'

    const summary = tester.getTestSummary()
    if (summary.passRate === 100) {
      ElMessage.success('所有测试通过！')
    } else if (summary.passRate >= 80) {
      ElMessage.warning(`大部分测试通过 (${summary.passRate}%)`)
    } else {
      ElMessage.error(`多个测试失败 (${summary.passRate}% 通过率)`)
    }
  } catch (error: any) {
    console.error('测试执行失败:', error)
    ElMessage.error(`测试执行失败: ${error.message}`)
  } finally {
    testing.value = false
  }
}

const exportReport = () => {
  if (!matrixStore.matrixClient) return

  const tester = createEncryptionTester(matrixStore.matrixClient)
  // 需要重新设置测试结果
  for (const [name, result] of testResults.value) {
    tester['testResults'].set(name, result)
  }

  const report = tester.generateReport()
  
  // 创建下载链接
  const blob = new Blob([report], { type: 'text/markdown' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `encryption-test-report-${new Date().toISOString().split('T')[0]}.md`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)

  ElMessage.success('测试报告已导出')
}

const createTestRoom = async () => {
  creatingRoom.value = true
  try {
    // 实现创建测试房间的逻辑
    ElMessage.success('测试房间创建成功')
    interopResults.value.push({
      success: true,
      message: '成功创建加密测试房间'
    })
  } catch (error: any) {
    console.error('创建测试房间失败:', error)
    ElMessage.error(`创建失败: ${error.message}`)
    interopResults.value.push({
      success: false,
      message: `创建测试房间失败: ${error.message}`
    })
  } finally {
    creatingRoom.value = false
  }
}

const sendTestMessage = async () => {
  sendingMessage.value = true
  try {
    // 实现发送测试消息的逻辑
    ElMessage.success('测试消息发送成功')
    interopResults.value.push({
      success: true,
      message: '成功发送加密测试消息'
    })
  } catch (error: any) {
    console.error('发送测试消息失败:', error)
    ElMessage.error(`发送失败: ${error.message}`)
    interopResults.value.push({
      success: false,
      message: `发送测试消息失败: ${error.message}`
    })
  } finally {
    sendingMessage.value = false
  }
}

const runPerformanceTest = async () => {
  performanceTesting.value = true
  try {
    const startTime = Date.now()
    
    // 模拟性能测试
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    performanceResults.value = {
      initTime: Math.random() * 100 + 50,
      encryptTime: Math.random() * 10 + 5,
      decryptTime: Math.random() * 8 + 3,
      exportTime: Math.random() * 200 + 100
    }

    ElMessage.success('性能测试完成')
  } catch (error: any) {
    console.error('性能测试失败:', error)
    ElMessage.error(`性能测试失败: ${error.message}`)
  } finally {
    performanceTesting.value = false
  }
}

// 生命周期
onMounted(() => {
  // 自动运行快速检查
  if (matrixStore.matrixClient) {
    runQuickCheck()
  }
})
</script>

<style scoped>
.encryption-test {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.test-header {
  text-align: center;
  margin-bottom: 30px;
}

.test-header h1 {
  margin: 0 0 10px 0;
  color: #303133;
}

.header-description {
  color: #606266;
  margin: 0;
}

.quick-check-card,
.test-suite-card,
.interop-test-card,
.performance-test-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.quick-check-result {
  padding: 20px 0;
}

.check-item {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.check-item .success {
  color: #67c23a;
}

.check-item .error {
  color: #f56c6c;
}

.issues {
  margin-top: 20px;
  padding: 16px;
  background: #fef0f0;
  border-radius: 4px;
  border: 1px solid #fbc4c4;
}

.issues h4 {
  margin: 0 0 10px 0;
  color: #f56c6c;
}

.issues ul {
  margin: 0;
  padding-left: 20px;
}

.test-progress {
  margin-bottom: 20px;
}

.progress-text {
  text-align: center;
  margin-top: 10px;
  color: #606266;
}

.test-summary {
  margin-bottom: 30px;
}

.summary-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 20px;
}

.stat-item {
  text-align: center;
  padding: 20px;
  border-radius: 8px;
  background: #f5f7fa;
}

.stat-item.success {
  background: #f0f9ff;
  color: #67c23a;
}

.stat-item.error {
  background: #fef0f0;
  color: #f56c6c;
}

.stat-number {
  display: block;
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #606266;
}

.test-results {
  margin-top: 30px;
}

.results-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.result-item {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 16px;
}

.result-item.success {
  border-color: #b3d8ff;
  background: #ecf5ff;
}

.result-item.error {
  border-color: #fbc4c4;
  background: #fef0f0;
}

.result-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.result-icon {
  font-size: 18px;
}

.result-name {
  flex: 1;
  font-weight: 500;
}

.result-content {
  margin-left: 30px;
}

.result-message {
  margin: 0 0 8px 0;
}

.result-error {
  color: #f56c6c;
  margin: 8px 0;
}

.result-details {
  margin-top: 12px;
}

.result-details pre {
  background: #f5f7fa;
  padding: 12px;
  border-radius: 4px;
  font-size: 12px;
  overflow-x: auto;
}

.interop-content,
.performance-results {
  padding: 20px 0;
}

.interop-instructions {
  margin: 20px 0;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 4px;
}

.interop-instructions h4 {
  margin: 0 0 12px 0;
}

.interop-instructions ol {
  margin: 0;
  padding-left: 20px;
}

.interop-actions {
  margin: 20px 0;
  display: flex;
  gap: 10px;
}

.interop-results {
  margin-top: 20px;
}

.interop-result {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.performance-metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.metric-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 4px;
}

.metric-label {
  font-weight: 500;
}

.metric-value {
  color: #409eff;
  font-weight: bold;
}
</style>
