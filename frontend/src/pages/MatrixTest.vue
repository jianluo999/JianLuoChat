<template>
  <div class="matrix-test-page">
    <div class="header">
      <h1>🧪 Matrix客户端测试</h1>
      <p>基于Element Web最佳实践的简化实现</p>
    </div>

    <!-- 状态显示 -->
    <div class="status-section">
      <div class="status-card" :class="{ connected: isConnected, error: !!error }">
        <h3>连接状态</h3>
        <div class="status-indicator">
          <span v-if="isInitializing" class="status-loading">🔄 初始化中...</span>
          <span v-else-if="isConnected" class="status-connected">✅ 已连接</span>
          <span v-else-if="error" class="status-error">❌ 连接失败</span>
          <span v-else class="status-disconnected">⚪ 未连接</span>
        </div>
        
        <div v-if="error" class="error-message">
          <p>{{ error }}</p>
          <div class="error-actions">
            <button @click="retryConnection" :disabled="isInitializing" class="retry-btn">
              🔄 重试连接
            </button>
            <button @click="clearStorageAndReload" class="clear-btn">
              🧹 清理存储并重新登录
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 房间列表 -->
    <div v-if="isConnected" class="rooms-section">
      <div class="rooms-header">
        <h3>房间列表 ({{ rooms.length }})</h3>
        <button @click="loadRooms" class="load-btn">🔄 刷新房间</button>
      </div>
      <div v-if="rooms.length === 0" class="no-rooms">
        <p>📭 暂无房间数据</p>
        <p class="hint">可能需要等待同步完成，或者点击刷新按钮</p>
      </div>
      <div v-else class="rooms-list">
        <div 
          v-for="room in rooms" 
          :key="room.roomId"
          class="room-item"
          :class="{ active: room.roomId === currentRoomId }"
          @click="selectRoom(room.roomId)"
        >
          <div class="room-info">
            <h4>{{ room.name }}</h4>
            <p v-if="room.topic" class="room-topic">{{ room.topic }}</p>
            <div class="room-meta">
              <span class="member-count">👥 {{ room.memberCount }}</span>
              <span v-if="room.unreadCount > 0" class="unread-count">
                🔔 {{ room.unreadCount }}
              </span>
            </div>
            <div v-if="room.lastMessage" class="last-message">
              <small>{{ room.lastMessage.body }}</small>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 当前房间 -->
    <div v-if="currentRoom" class="current-room-section">
      <h3>当前房间: {{ currentRoom.name }}</h3>
      <div class="message-input">
        <input 
          v-model="newMessage" 
          @keyup.enter="sendTestMessage"
          placeholder="输入消息..."
          class="message-field"
        />
        <button @click="sendTestMessage" :disabled="!newMessage.trim()" class="send-btn">
          📤 发送
        </button>
      </div>
    </div>

    <!-- 调试信息 -->
    <div class="debug-section">
      <h3>调试信息</h3>
      <div class="debug-info">
        <p><strong>客户端状态:</strong> {{ isConnected ? '已连接' : '未连接' }}</p>
        <p><strong>房间数量:</strong> {{ rooms.length }}</p>
        <p><strong>当前房间:</strong> {{ currentRoomId || '无' }}</p>
        <p><strong>初始化中:</strong> {{ isInitializing ? '是' : '否' }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useMatrixSimpleStore } from '@/stores/matrix-simple'

const matrixStore = useMatrixSimpleStore()
const newMessage = ref('')

// 从store中解构状态
const { 
  isConnected, 
  isInitializing, 
  error, 
  rooms, 
  currentRoomId, 
  currentRoom 
} = matrixStore

// 重试连接
const retryConnection = async () => {
  console.log('🔄 重试连接...')
  await matrixStore.retryInitialization()
}

// 清理存储并重新登录
const clearStorageAndReload = () => {
  if (confirm('⚠️ 这将清理所有Matrix相关数据并跳转到登录页面，确定继续吗？')) {
    console.log('🧹 用户确认清理存储...')
    matrixStore.clearAllStorage()

    // 延迟一下确保清理完成
    setTimeout(() => {
      console.log('🔄 跳转到登录页面...')
      window.location.href = '/login'
    }, 1000)
  }
}

// 加载房间
const loadRooms = () => {
  console.log('🔄 刷新房间列表...')
  matrixStore.loadRooms()
}

// 选择房间
const selectRoom = (roomId: string) => {
  console.log('📍 选择房间:', roomId)
  matrixStore.selectRoom(roomId)
}

// 发送测试消息
const sendTestMessage = async () => {
  if (!newMessage.value.trim() || !currentRoomId.value) return

  try {
    await matrixStore.sendMessage(currentRoomId.value, newMessage.value.trim())
    newMessage.value = ''
    console.log('✅ 消息发送成功')
  } catch (error) {
    console.error('❌ 发送消息失败:', error)
    alert('发送消息失败: ' + error)
  }
}

// 组件挂载时尝试初始化
onMounted(async () => {
  console.log('🚀 Matrix测试页面加载')
  
  // 检查是否有登录信息
  const loginInfo = localStorage.getItem('matrix-login-info')
  if (loginInfo) {
    console.log('📋 发现登录信息，尝试自动连接...')
    await retryConnection()
  } else {
    console.log('⚠️ 未找到登录信息，请先登录')
  }
})
</script>

<style scoped>
.matrix-test-page {
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

.status-section {
  margin-bottom: 30px;
}

.status-card {
  background: white;
  border: 2px solid #ecf0f1;
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s ease;
}

.status-card.connected {
  border-color: #27ae60;
  background: #f8fff9;
}

.status-card.error {
  border-color: #e74c3c;
  background: #fdf2f2;
}

.status-indicator {
  font-size: 18px;
  margin: 10px 0;
}

.error-message {
  margin-top: 15px;
  padding: 15px;
  background: #ffeaea;
  border-radius: 8px;
  border-left: 4px solid #e74c3c;
}

.retry-btn, .load-btn, .send-btn {
  background: #3498db;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.3s ease;
}

.clear-btn {
  background: #e74c3c;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.3s ease;
}

.retry-btn:hover, .load-btn:hover, .send-btn:hover {
  background: #2980b9;
}

.clear-btn:hover {
  background: #c0392b;
}

.retry-btn:disabled, .send-btn:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
}

.error-actions {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.rooms-section {
  margin-bottom: 30px;
}

.rooms-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.rooms-header h3 {
  color: #2c3e50;
  margin: 0;
}

.no-rooms {
  text-align: center;
  padding: 40px;
  background: #f8f9fa;
  border-radius: 12px;
  color: #6c757d;
}

.no-rooms .hint {
  font-size: 14px;
  color: #95a5a6;
  margin-top: 10px;
}

.rooms-list {
  display: grid;
  gap: 15px;
}

.room-item {
  background: white;
  border: 2px solid #ecf0f1;
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.room-item:hover {
  border-color: #3498db;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(52, 152, 219, 0.1);
}

.room-item.active {
  border-color: #27ae60;
  background: #f8fff9;
}

.room-info h4 {
  margin: 0 0 8px 0;
  color: #2c3e50;
}

.room-topic {
  color: #7f8c8d;
  font-size: 14px;
  margin: 5px 0;
}

.room-meta {
  display: flex;
  gap: 15px;
  margin: 10px 0;
  font-size: 14px;
}

.member-count {
  color: #3498db;
}

.unread-count {
  color: #e74c3c;
  font-weight: bold;
}

.last-message {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #ecf0f1;
}

.last-message small {
  color: #95a5a6;
}

.current-room-section {
  margin-bottom: 30px;
}

.current-room-section h3 {
  color: #27ae60;
  margin-bottom: 15px;
}

.message-input {
  display: flex;
  gap: 10px;
}

.message-field {
  flex: 1;
  padding: 12px;
  border: 2px solid #ecf0f1;
  border-radius: 6px;
  font-size: 16px;
}

.message-field:focus {
  outline: none;
  border-color: #3498db;
}

.debug-section {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  margin-top: 30px;
}

.debug-section h3 {
  color: #6c757d;
  margin-bottom: 15px;
}

.debug-info p {
  margin: 8px 0;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  color: #495057;
}
</style>
