<template>
  <div class="message-features-test">
    <div class="test-header">
      <h1>💬 Matrix消息功能测试</h1>
      <button @click="goBack" class="back-btn">← 返回</button>
    </div>

    <div class="test-content">
      <!-- 功能状态面板 -->
      <div class="status-panel">
        <h3>功能实现状态</h3>
        <div class="feature-list">
          <div class="feature-item" :class="{ 'implemented': true }">
            <span class="feature-icon">✅</span>
            <span class="feature-name">消息回复</span>
            <span class="feature-desc">支持回复引用消息</span>
          </div>
          
          <div class="feature-item" :class="{ 'implemented': true }">
            <span class="feature-icon">✅</span>
            <span class="feature-name">消息编辑</span>
            <span class="feature-desc">编辑已发送的消息</span>
          </div>
          
          <div class="feature-item" :class="{ 'implemented': true }">
            <span class="feature-icon">✅</span>
            <span class="feature-name">消息删除</span>
            <span class="feature-desc">删除/撤回消息</span>
          </div>
          
          <div class="feature-item" :class="{ 'implemented': true }">
            <span class="feature-icon">✅</span>
            <span class="feature-name">消息反应</span>
            <span class="feature-desc">添加emoji反应</span>
          </div>
          
          <div class="feature-item" :class="{ 'implemented': true }">
            <span class="feature-icon">✅</span>
            <span class="feature-name">消息搜索</span>
            <span class="feature-desc">搜索历史消息</span>
          </div>
          
          <div class="feature-item" :class="{ 'implemented': true }">
            <span class="feature-icon">✅</span>
            <span class="feature-name">消息分页</span>
            <span class="feature-desc">历史消息分页加载</span>
          </div>
          
          <div class="feature-item" :class="{ 'implemented': true }">
            <span class="feature-icon">✅</span>
            <span class="feature-name">输入状态</span>
            <span class="feature-desc">显示正在输入状态</span>
          </div>
        </div>
      </div>

      <!-- Matrix协议兼容性 -->
      <div class="compatibility-panel">
        <h3>Matrix协议兼容性</h3>
        <div class="protocol-list">
          <div class="protocol-item">
            <span class="protocol-name">m.room.message</span>
            <span class="protocol-status supported">✅ 支持</span>
            <span class="protocol-desc">基础消息发送</span>
          </div>
          
          <div class="protocol-item">
            <span class="protocol-name">m.replace</span>
            <span class="protocol-status supported">✅ 支持</span>
            <span class="protocol-desc">消息编辑事件</span>
          </div>
          
          <div class="protocol-item">
            <span class="protocol-name">m.room.redaction</span>
            <span class="protocol-status supported">✅ 支持</span>
            <span class="protocol-desc">消息删除事件</span>
          </div>
          
          <div class="protocol-item">
            <span class="protocol-name">m.reaction</span>
            <span class="protocol-status supported">✅ 支持</span>
            <span class="protocol-desc">消息反应事件</span>
          </div>
          
          <div class="protocol-item">
            <span class="protocol-name">m.in_reply_to</span>
            <span class="protocol-status supported">✅ 支持</span>
            <span class="protocol-desc">消息回复关系</span>
          </div>
          
          <div class="protocol-item">
            <span class="protocol-name">m.typing</span>
            <span class="protocol-status supported">✅ 支持</span>
            <span class="protocol-desc">输入状态通知</span>
          </div>
        </div>
      </div>

      <!-- 测试操作面板 -->
      <div class="test-panel">
        <h3>功能测试</h3>
        
        <div class="test-section">
          <h4>消息操作测试</h4>
          <div class="test-buttons">
            <button @click="testSendMessage" class="test-btn">
              📤 发送测试消息
            </button>
            <button @click="testEditMessage" class="test-btn" :disabled="!lastMessageId">
              ✏️ 编辑最后消息
            </button>
            <button @click="testDeleteMessage" class="test-btn" :disabled="!lastMessageId">
              🗑️ 删除最后消息
            </button>
            <button @click="testAddReaction" class="test-btn" :disabled="!lastMessageId">
              😊 添加反应
            </button>
          </div>
        </div>

        <div class="test-section">
          <h4>搜索功能测试</h4>
          <div class="search-test">
            <input 
              v-model="searchQuery" 
              placeholder="输入搜索关键词..."
              class="search-input"
            />
            <button @click="testSearch" class="test-btn">
              🔍 搜索消息
            </button>
          </div>
          <div v-if="searchResults.length > 0" class="search-results">
            <h5>搜索结果 ({{ searchResults.length }} 条):</h5>
            <div 
              v-for="result in searchResults" 
              :key="result.result.event_id"
              class="search-result-item"
            >
              <div class="result-content">{{ result.result.content.body }}</div>
              <div class="result-meta">
                {{ formatTime(result.result.origin_server_ts) }}
              </div>
            </div>
          </div>
        </div>

        <div class="test-section">
          <h4>性能测试</h4>
          <div class="performance-test">
            <button @click="testMessageLoad" class="test-btn">
              📊 测试消息加载性能
            </button>
            <button @click="testSearchPerformance" class="test-btn">
              ⚡ 测试搜索性能
            </button>
          </div>
          <div v-if="performanceResults" class="performance-results">
            <h5>性能测试结果:</h5>
            <pre>{{ performanceResults }}</pre>
          </div>
        </div>
      </div>

      <!-- 实时消息区域 -->
      <div class="message-demo">
        <h3>实时消息演示</h3>
        <div class="demo-room">
          <MatrixMessageAreaEnhanced
            v-if="demoRoomId"
            :room-id="demoRoomId"
          />
          <div v-else class="no-room">
            <p>请先登录Matrix账户并加入房间</p>
            <button @click="initDemoRoom" class="init-btn">
              🏠 初始化演示房间
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMatrixStore } from '@/stores/matrix'
import MatrixMessageAreaEnhanced from '@/components/MatrixMessageAreaEnhanced.vue'

const router = useRouter()
const matrixStore = useMatrixStore()

// 状态
const lastMessageId = ref<string>('')
const searchQuery = ref('')
const searchResults = ref<any[]>([])
const performanceResults = ref<string>('')
const demoRoomId = ref<string>('')

// 方法
const goBack = () => {
  router.back()
}

const testSendMessage = async () => {
  if (!demoRoomId.value) {
    alert('请先初始化演示房间')
    return
  }

  try {
    const testMessage = `测试消息 - ${new Date().toLocaleTimeString()}`
    await matrixStore.sendMessage(demoRoomId.value, testMessage)
    
    // 获取最后发送的消息ID
    const messages = matrixStore.messages.get(demoRoomId.value) || []
    if (messages.length > 0) {
      lastMessageId.value = messages[messages.length - 1].eventId || ''
    }
    
    console.log('✅ 测试消息发送成功')
  } catch (error) {
    console.error('❌ 测试消息发送失败:', error)
    alert('发送消息失败: ' + error)
  }
}

const testEditMessage = async () => {
  if (!lastMessageId.value || !demoRoomId.value) return

  try {
    const editedContent = `编辑后的消息 - ${new Date().toLocaleTimeString()}`
    await matrixStore.editMessage(demoRoomId.value, lastMessageId.value, editedContent)
    console.log('✅ 消息编辑测试成功')
  } catch (error) {
    console.error('❌ 消息编辑测试失败:', error)
    alert('编辑消息失败: ' + error)
  }
}

const testDeleteMessage = async () => {
  if (!lastMessageId.value || !demoRoomId.value) return

  try {
    await matrixStore.deleteMessage(demoRoomId.value, lastMessageId.value, '测试删除')
    console.log('✅ 消息删除测试成功')
    lastMessageId.value = ''
  } catch (error) {
    console.error('❌ 消息删除测试失败:', error)
    alert('删除消息失败: ' + error)
  }
}

const testAddReaction = async () => {
  if (!lastMessageId.value || !demoRoomId.value) return

  try {
    const emojis = ['👍', '❤️', '😂', '🎉', '🔥']
    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)]
    await matrixStore.addReaction(demoRoomId.value, lastMessageId.value, randomEmoji)
    console.log('✅ 反应添加测试成功')
  } catch (error) {
    console.error('❌ 反应添加测试失败:', error)
    alert('添加反应失败: ' + error)
  }
}

const testSearch = async () => {
  if (!searchQuery.value.trim() || !demoRoomId.value) return

  try {
    const startTime = performance.now()
    const results = await matrixStore.searchMessages(demoRoomId.value, searchQuery.value)
    const endTime = performance.now()
    
    searchResults.value = results
    console.log(`✅ 搜索测试完成，耗时 ${(endTime - startTime).toFixed(2)}ms`)
  } catch (error) {
    console.error('❌ 搜索测试失败:', error)
    alert('搜索失败: ' + error)
  }
}

const testMessageLoad = async () => {
  if (!demoRoomId.value) return

  try {
    const startTime = performance.now()
    await matrixStore.loadMoreHistoryMessages(demoRoomId.value)
    const endTime = performance.now()
    
    const messages = matrixStore.messages.get(demoRoomId.value) || []
    performanceResults.value = `消息加载性能测试:
- 加载时间: ${(endTime - startTime).toFixed(2)}ms
- 消息数量: ${messages.length}
- 平均加载速度: ${(messages.length / (endTime - startTime) * 1000).toFixed(2)} 条/秒`
    
    console.log('✅ 消息加载性能测试完成')
  } catch (error) {
    console.error('❌ 消息加载性能测试失败:', error)
  }
}

const testSearchPerformance = async () => {
  if (!demoRoomId.value) return

  try {
    const testQueries = ['测试', 'hello', 'matrix', '消息', 'test']
    const results = []
    
    for (const query of testQueries) {
      const startTime = performance.now()
      const searchResults = await matrixStore.searchMessages(demoRoomId.value, query)
      const endTime = performance.now()
      
      results.push({
        query,
        time: endTime - startTime,
        count: searchResults.length
      })
    }
    
    const avgTime = results.reduce((sum, r) => sum + r.time, 0) / results.length
    const totalResults = results.reduce((sum, r) => sum + r.count, 0)
    
    performanceResults.value = `搜索性能测试:
- 测试查询数: ${testQueries.length}
- 平均搜索时间: ${avgTime.toFixed(2)}ms
- 总结果数: ${totalResults}
- 搜索效率: ${(totalResults / avgTime * 1000).toFixed(2)} 结果/秒

详细结果:
${results.map(r => `  "${r.query}": ${r.time.toFixed(2)}ms (${r.count}条)`).join('\n')}`
    
    console.log('✅ 搜索性能测试完成')
  } catch (error) {
    console.error('❌ 搜索性能测试失败:', error)
  }
}

const initDemoRoom = async () => {
  try {
    // 使用第一个可用的房间作为演示房间
    const rooms = matrixStore.rooms
    if (rooms.length > 0) {
      demoRoomId.value = rooms[0].id
      console.log('✅ 演示房间初始化成功:', demoRoomId.value)
    } else {
      alert('没有可用的房间，请先加入一个房间')
    }
  } catch (error) {
    console.error('❌ 演示房间初始化失败:', error)
    alert('初始化失败: ' + error)
  }
}

const formatTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleString('zh-CN')
}

// 生命周期
onMounted(() => {
  // 自动初始化演示房间
  if (matrixStore.rooms.length > 0) {
    demoRoomId.value = matrixStore.rooms[0].id
  }
})
</script>

<style scoped>
.message-features-test {
  min-height: 100vh;
  background: #f8f9fa;
}

.test-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: white;
  border-bottom: 1px solid #e1e8ed;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.test-header h1 {
  margin: 0;
  color: #2c3e50;
}

.back-btn {
  padding: 8px 16px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.back-btn:hover {
  background: #2980b9;
}

.test-content {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.status-panel, .compatibility-panel, .test-panel, .message-demo {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.message-demo {
  grid-column: 1 / -1;
  height: 600px;
}

.status-panel h3, .compatibility-panel h3, .test-panel h3, .message-demo h3 {
  margin: 0 0 16px 0;
  color: #2c3e50;
  border-bottom: 2px solid #3498db;
  padding-bottom: 8px;
}

.feature-list, .protocol-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.feature-item, .protocol-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.feature-item.implemented {
  background: #e8f5e8;
  border-left: 4px solid #27ae60;
}

.feature-icon {
  font-size: 18px;
  width: 24px;
  text-align: center;
}

.feature-name, .protocol-name {
  font-weight: 600;
  color: #2c3e50;
  min-width: 100px;
}

.feature-desc, .protocol-desc {
  color: #7f8c8d;
  font-size: 14px;
}

.protocol-status.supported {
  color: #27ae60;
  font-weight: 600;
  min-width: 60px;
}

.test-section {
  margin-bottom: 24px;
}

.test-section h4 {
  margin: 0 0 12px 0;
  color: #34495e;
  font-size: 16px;
}

.test-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.test-btn {
  padding: 8px 16px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
}

.test-btn:hover:not(:disabled) {
  background: #2980b9;
  transform: translateY(-1px);
}

.test-btn:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
  transform: none;
}

.search-test {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.search-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
}

.search-results {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
}

.search-results h5 {
  margin: 0 0 12px 0;
  color: #2c3e50;
}

.search-result-item {
  background: white;
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 8px;
  border-left: 3px solid #3498db;
}

.result-content {
  font-weight: 500;
  margin-bottom: 4px;
}

.result-meta {
  font-size: 12px;
  color: #7f8c8d;
}

.performance-test {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.performance-results {
  background: #2c3e50;
  color: #ecf0f1;
  padding: 16px;
  border-radius: 8px;
  font-family: 'Courier New', monospace;
}

.performance-results pre {
  margin: 0;
  white-space: pre-wrap;
  font-size: 12px;
  line-height: 1.4;
}

.demo-room {
  height: 500px;
  border: 1px solid #e1e8ed;
  border-radius: 8px;
  overflow: hidden;
}

.no-room {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #7f8c8d;
}

.init-btn {
  margin-top: 16px;
  padding: 12px 24px;
  background: #27ae60;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  transition: background 0.2s ease;
}

.init-btn:hover {
  background: #219a52;
}

@media (max-width: 768px) {
  .test-content {
    grid-template-columns: 1fr;
    padding: 16px;
  }
  
  .test-buttons {
    flex-direction: column;
  }
  
  .search-test {
    flex-direction: column;
  }
}
</style>