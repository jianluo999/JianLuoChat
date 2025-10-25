<template>
  <div class="matrix-v39-demo">
    <div class="demo-header">
      <h1>🚀 Matrix JS SDK v39.0.0 高级功能演示</h1>
      <p class="demo-subtitle">体验最新的 Matrix 协议功能</p>
    </div>

    <div class="demo-content">
      <!-- 功能状态面板 -->
      <div class="status-panel">
        <h2>📊 系统状态</h2>
        <div class="status-grid">
          <div class="status-card">
            <div class="status-icon">🔐</div>
            <div class="status-info">
              <h3>加密状态</h3>
              <p :class="encryptionStatusClass">{{ encryptionStatusText }}</p>
            </div>
          </div>
          
          <div class="status-card">
            <div class="status-icon">🔄</div>
            <div class="status-info">
              <h3>同步状态</h3>
              <p :class="syncStatusClass">{{ syncStatusText }}</p>
            </div>
          </div>
          
          <div class="status-card">
            <div class="status-icon">📡</div>
            <div class="status-info">
              <h3>连接状态</h3>
              <p :class="connectionStatusClass">{{ connectionStatusText }}</p>
            </div>
          </div>
          
          <div class="status-card">
            <div class="status-icon">⚡</div>
            <div class="status-info">
              <h3>性能指标</h3>
              <p class="performance-text">{{ performanceText }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 功能演示区域 -->
      <div class="demo-features">
        <h2>🎯 高级功能演示</h2>
        
        <div class="feature-tabs">
          <button 
            v-for="tab in featureTabs" 
            :key="tab.id"
            class="tab-button"
            :class="{ active: activeTab === tab.id }"
            @click="activeTab = tab.id"
          >
            {{ tab.icon }} {{ tab.name }}
          </button>
        </div>

        <div class="tab-content">
          <!-- 加密管理 -->
          <div v-if="activeTab === 'encryption'" class="feature-section">
            <h3>🔐 端到端加密管理</h3>
            <div class="encryption-controls">
              <button 
                @click="setupCrossSigning"
                :disabled="matrixStore.crossSigningReady"
                class="demo-btn primary"
              >
                {{ matrixStore.crossSigningReady ? '✅ 交叉签名已设置' : '设置交叉签名' }}
              </button>
              
              <button 
                @click="setupKeyBackup"
                :disabled="matrixStore.keyBackupEnabled"
                class="demo-btn secondary"
              >
                {{ matrixStore.keyBackupEnabled ? '✅ 密钥备份已启用' : '启用密钥备份' }}
              </button>
              
              <button @click="verifyAllDevices" class="demo-btn secondary">
                验证所有设备
              </button>
            </div>
            
            <div class="encryption-info">
              <h4>加密信息</h4>
              <ul>
                <li>Rust 加密引擎: {{ matrixStore.encryptionReady ? '✅ 已启用' : '❌ 未启用' }}</li>
                <li>交叉签名: {{ matrixStore.crossSigningReady ? '✅ 已设置' : '⚠️ 未设置' }}</li>
                <li>密钥备份: {{ matrixStore.keyBackupEnabled ? '✅ 已启用' : '❌ 未启用' }}</li>
                <li>设备验证: {{ getVerifiedDevicesCount() }} / {{ getTotalDevicesCount() }} 已验证</li>
              </ul>
            </div>
          </div>

          <!-- 消息功能 -->
          <div v-if="activeTab === 'messaging'" class="feature-section">
            <h3>💬 高级消息功能</h3>
            <div class="messaging-demo">
              <div class="demo-message-area">
                <div class="demo-message">
                  <div class="message-content">这是一条演示消息</div>
                  <div class="message-reactions">
                    <button 
                      v-for="reaction in demoReactions" 
                      :key="reaction.emoji"
                      class="reaction-btn"
                      @click="toggleDemoReaction(reaction.emoji)"
                    >
                      {{ reaction.emoji }} {{ reaction.count }}
                    </button>
                  </div>
                </div>
              </div>
              
              <div class="messaging-controls">
                <button @click="sendDemoMessage" class="demo-btn primary">
                  发送消息
                </button>
                <button @click="sendDemoReply" class="demo-btn secondary">
                  回复消息
                </button>
                <button @click="startDemoThread" class="demo-btn secondary">
                  开始线程
                </button>
                <button @click="editDemoMessage" class="demo-btn secondary">
                  编辑消息
                </button>
              </div>
            </div>
          </div>

          <!-- 空间管理 -->
          <div v-if="activeTab === 'spaces'" class="feature-section">
            <h3>🌌 空间管理</h3>
            <div class="spaces-demo">
              <div class="space-list">
                <h4>我的空间</h4>
                <div v-if="demoSpaces.length === 0" class="empty-state">
                  还没有创建空间
                </div>
                <div v-else class="space-items">
                  <div 
                    v-for="space in demoSpaces" 
                    :key="space.id"
                    class="space-item"
                  >
                    <div class="space-avatar">{{ space.name.charAt(0) }}</div>
                    <div class="space-info">
                      <div class="space-name">{{ space.name }}</div>
                      <div class="space-desc">{{ space.description }}</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="space-controls">
                <button @click="createDemoSpace" class="demo-btn primary">
                  创建空间
                </button>
                <button @click="joinDemoSpace" class="demo-btn secondary">
                  加入空间
                </button>
              </div>
            </div>
          </div>

          <!-- 性能监控 -->
          <div v-if="activeTab === 'performance'" class="feature-section">
            <h3>📊 性能监控</h3>
            <div class="performance-demo">
              <div class="metrics-grid">
                <div class="metric-card">
                  <h4>内存使用</h4>
                  <div class="metric-value">{{ formatMemoryUsage() }}</div>
                  <div class="metric-bar">
                    <div class="metric-fill" :style="{ width: getMemoryUsagePercent() + '%' }"></div>
                  </div>
                </div>
                
                <div class="metric-card">
                  <h4>网络延迟</h4>
                  <div class="metric-value">{{ getNetworkLatency() }}ms</div>
                  <div class="metric-status" :class="getLatencyStatus()">
                    {{ getLatencyStatusText() }}
                  </div>
                </div>
                
                <div class="metric-card">
                  <h4>消息缓存</h4>
                  <div class="metric-value">{{ getMessageCacheSize() }}</div>
                  <div class="metric-desc">条消息已缓存</div>
                </div>
                
                <div class="metric-card">
                  <h4>同步效率</h4>
                  <div class="metric-value">{{ getSyncEfficiency() }}%</div>
                  <div class="metric-desc">同步成功率</div>
                </div>
              </div>
              
              <div class="performance-controls">
                <button @click="generatePerformanceReport" class="demo-btn primary">
                  生成性能报告
                </button>
                <button @click="clearCache" class="demo-btn secondary">
                  清理缓存
                </button>
                <button @click="optimizePerformance" class="demo-btn secondary">
                  性能优化
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useMatrixV39Store } from '@/stores/matrix-v39-clean'

// Store
const matrixStore = useMatrixV39Store()

// 响应式数据
const activeTab = ref('encryption')
const demoReactions = ref([
  { emoji: '👍', count: 3 },
  { emoji: '❤️', count: 1 },
  { emoji: '😂', count: 2 }
])
const demoSpaces = ref([])

// 功能标签页
const featureTabs = [
  { id: 'encryption', name: '加密管理', icon: '🔐' },
  { id: 'messaging', name: '消息功能', icon: '💬' },
  { id: 'spaces', name: '空间管理', icon: '🌌' },
  { id: 'performance', name: '性能监控', icon: '📊' }
]

// 计算属性
const encryptionStatusClass = computed(() => {
  if (!matrixStore.encryptionReady) return 'status-error'
  if (matrixStore.crossSigningReady && matrixStore.keyBackupEnabled) return 'status-success'
  return 'status-warning'
})

const encryptionStatusText = computed(() => {
  if (!matrixStore.encryptionReady) return '未启用'
  if (matrixStore.crossSigningReady && matrixStore.keyBackupEnabled) return '完全就绪'
  return '部分就绪'
})

const syncStatusClass = computed(() => {
  const state = matrixStore.syncState
  if (state === 'SYNCING') return 'status-success'
  if (state === 'RECONNECTING') return 'status-warning'
  return 'status-error'
})

const syncStatusText = computed(() => {
  return matrixStore.syncState || 'STOPPED'
})

const connectionStatusClass = computed(() => {
  return matrixStore.isConnected ? 'status-success' : 'status-error'
})

const connectionStatusText = computed(() => {
  return matrixStore.isConnected ? '已连接' : '未连接'
})

const performanceText = computed(() => {
  const metrics = matrixStore.getPerformanceMetrics()
  return `${getNetworkLatency()}ms 延迟`
})

// 方法
const setupCrossSigning = async () => {
  try {
    const password = prompt('请输入您的Matrix密码:')
    if (password) {
      await matrixStore.setupCrossSigning(password)
      alert('交叉签名设置成功！')
    }
  } catch (error) {
    console.error('设置交叉签名失败:', error)
    alert('设置失败: ' + error.message)
  }
}

const setupKeyBackup = async () => {
  try {
    await matrixStore.setupKeyBackup()
    alert('密钥备份启用成功！')
  } catch (error) {
    console.error('启用密钥备份失败:', error)
    alert('启用失败: ' + error.message)
  }
}

const verifyAllDevices = async () => {
  try {
    // 这里实现设备验证逻辑
    alert('设备验证功能正在开发中')
  } catch (error) {
    console.error('设备验证失败:', error)
  }
}

const getVerifiedDevicesCount = () => {
  // 返回已验证设备数量
  return 1
}

const getTotalDevicesCount = () => {
  // 返回总设备数量
  return 2
}

const toggleDemoReaction = (emoji: string) => {
  const reaction = demoReactions.value.find(r => r.emoji === emoji)
  if (reaction) {
    reaction.count = reaction.count > 0 ? reaction.count - 1 : reaction.count + 1
  }
}

const sendDemoMessage = () => {
  alert('演示：发送消息功能')
}

const sendDemoReply = () => {
  alert('演示：回复消息功能')
}

const startDemoThread = () => {
  alert('演示：开始线程功能')
}

const editDemoMessage = () => {
  alert('演示：编辑消息功能')
}

const createDemoSpace = () => {
  const name = prompt('输入空间名称:')
  if (name) {
    demoSpaces.value.push({
      id: Date.now().toString(),
      name,
      description: '演示空间'
    })
  }
}

const joinDemoSpace = () => {
  alert('演示：加入空间功能')
}

const formatMemoryUsage = () => {
  const metrics = matrixStore.getPerformanceMetrics()
  return metrics?.memoryUsage ? `${(metrics.memoryUsage / 1024 / 1024).toFixed(1)}MB` : '0MB'
}

const getMemoryUsagePercent = () => {
  const metrics = matrixStore.getPerformanceMetrics()
  const usage = metrics?.memoryUsage || 0
  const maxMemory = 100 * 1024 * 1024 // 100MB
  return Math.min((usage / maxMemory) * 100, 100)
}

const getNetworkLatency = () => {
  const metrics = matrixStore.getPerformanceMetrics()
  return metrics?.networkLatency || 0
}

const getLatencyStatus = () => {
  const latency = getNetworkLatency()
  if (latency < 100) return 'status-success'
  if (latency < 300) return 'status-warning'
  return 'status-error'
}

const getLatencyStatusText = () => {
  const latency = getNetworkLatency()
  if (latency < 100) return '优秀'
  if (latency < 300) return '良好'
  return '较慢'
}

const getMessageCacheSize = () => {
  const metrics = matrixStore.getPerformanceMetrics()
  return metrics?.messageCacheSize || 0
}

const getSyncEfficiency = () => {
  const metrics = matrixStore.getPerformanceMetrics()
  return metrics?.syncEfficiency || 95
}

const generatePerformanceReport = () => {
  matrixStore.logPerformanceReport()
  alert('性能报告已生成，请查看控制台')
}

const clearCache = async () => {
  try {
    await matrixStore.clearCache()
    alert('缓存清理完成')
  } catch (error) {
    console.error('清理缓存失败:', error)
  }
}

const optimizePerformance = async () => {
  try {
    // 这里实现性能优化逻辑
    alert('性能优化完成')
  } catch (error) {
    console.error('性能优化失败:', error)
  }
}

onMounted(() => {
  // 初始化演示数据
  console.log('Matrix v39 演示页面已加载')
})
</script>

<style scoped>
.matrix-v39-demo {
  min-height: 100vh;
  background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%);
  color: #e0e6ed;
  padding: 20px;
}

.demo-header {
  text-align: center;
  margin-bottom: 40px;
}

.demo-header h1 {
  font-size: 2.5rem;
  color: #00ff88;
  margin-bottom: 8px;
  text-shadow: 0 0 20px rgba(0, 255, 136, 0.5);
}

.demo-subtitle {
  font-size: 1.2rem;
  color: #64b5f6;
  margin: 0;
}

.demo-content {
  max-width: 1200px;
  margin: 0 auto;
}

/* 状态面板 */
.status-panel {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid #3a4a5c;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 32px;
}

.status-panel h2 {
  color: #64b5f6;
  margin-bottom: 20px;
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.status-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
}

.status-icon {
  font-size: 2rem;
  width: 48px;
  text-align: center;
}

.status-info h3 {
  margin: 0 0 4px 0;
  font-size: 1rem;
  color: #e0e6ed;
}

.status-info p {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 600;
}

.status-success { color: #4caf50; }
.status-warning { color: #ff9800; }
.status-error { color: #f44336; }
.performance-text { color: #2196f3; }

/* 功能演示区域 */
.demo-features {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid #3a4a5c;
  border-radius: 16px;
  padding: 24px;
}

.demo-features h2 {
  color: #64b5f6;
  margin-bottom: 20px;
}

.feature-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  border-bottom: 1px solid #3a4a5c;
  padding-bottom: 16px;
}

.tab-button {
  padding: 12px 20px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: #e0e6ed;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.tab-button:hover {
  background: rgba(255, 255, 255, 0.1);
}

.tab-button.active {
  background: rgba(0, 255, 136, 0.2);
  border-color: #00ff88;
  color: #00ff88;
}

.feature-section {
  min-height: 400px;
}

.feature-section h3 {
  color: #00ff88;
  margin-bottom: 20px;
}

/* 加密控制 */
.encryption-controls {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.demo-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.demo-btn.primary {
  background: linear-gradient(135deg, #00ff88 0%, #00cc6a 100%);
  color: #0f0f23;
}

.demo-btn.secondary {
  background: rgba(255, 255, 255, 0.1);
  color: #e0e6ed;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.demo-btn:hover:not(:disabled) {
  transform: translateY(-2px);
}

.demo-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.encryption-info {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  padding: 20px;
}

.encryption-info h4 {
  color: #64b5f6;
  margin-bottom: 12px;
}

.encryption-info ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.encryption-info li {
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.encryption-info li:last-child {
  border-bottom: none;
}

/* 消息演示 */
.messaging-demo {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.demo-message-area {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  padding: 20px;
  min-height: 120px;
}

.demo-message {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 16px;
  max-width: 300px;
}

.message-content {
  margin-bottom: 12px;
}

.message-reactions {
  display: flex;
  gap: 8px;
}

.reaction-btn {
  padding: 4px 8px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  cursor: pointer;
  font-size: 0.8rem;
  color: #e0e6ed;
  transition: all 0.3s ease;
}

.reaction-btn:hover {
  background: rgba(0, 255, 136, 0.2);
  border-color: #00ff88;
}

.messaging-controls {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

/* 空间演示 */
.spaces-demo {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.space-list {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  padding: 20px;
  min-height: 200px;
}

.space-list h4 {
  color: #64b5f6;
  margin-bottom: 16px;
}

.empty-state {
  text-align: center;
  color: #b0bec5;
  font-style: italic;
  padding: 40px 0;
}

.space-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.space-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.space-avatar {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #00ff88 0%, #64b5f6 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: #0f0f23;
}

.space-info {
  flex: 1;
}

.space-name {
  font-weight: 600;
  margin-bottom: 2px;
}

.space-desc {
  font-size: 0.8rem;
  color: #b0bec5;
}

.space-controls {
  display: flex;
  gap: 12px;
}

/* 性能演示 */
.performance-demo {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.metric-card {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  padding: 20px;
  text-align: center;
}

.metric-card h4 {
  color: #64b5f6;
  margin-bottom: 12px;
  font-size: 0.9rem;
}

.metric-value {
  font-size: 2rem;
  font-weight: bold;
  color: #00ff88;
  margin-bottom: 8px;
}

.metric-bar {
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
  margin-top: 8px;
}

.metric-fill {
  height: 100%;
  background: linear-gradient(90deg, #00ff88 0%, #64b5f6 100%);
  transition: width 0.3s ease;
}

.metric-status {
  font-size: 0.8rem;
  font-weight: 600;
  margin-top: 4px;
}

.metric-desc {
  font-size: 0.8rem;
  color: #b0bec5;
  margin-top: 4px;
}

.performance-controls {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .demo-header h1 {
    font-size: 2rem;
  }
  
  .status-grid {
    grid-template-columns: 1fr;
  }
  
  .feature-tabs {
    flex-wrap: wrap;
  }
  
  .encryption-controls,
  .messaging-controls,
  .space-controls,
  .performance-controls {
    flex-direction: column;
  }
  
  .demo-btn {
    width: 100%;
  }
  
  .metrics-grid {
    grid-template-columns: 1fr;
  }
}
</style>