<template>
  <div class="matrix-chat-demo">
    <div class="demo-header">
      <h3>Matrix 聊天演示</h3>
      <p>体验真正的Matrix协议通信</p>
    </div>

    <!-- Matrix登录状态 -->
    <div class="login-status" v-if="!matrixStore.isLoggedIn">
      <div class="login-form">
        <h4>Matrix 登录</h4>
        <div class="form-group">
          <label>用户名:</label>
          <input 
            v-model="loginForm.username" 
            type="text" 
            placeholder="输入Matrix用户名"
            @keyup.enter="handleLogin"
          />
        </div>
        <div class="form-group">
          <label>密码:</label>
          <input 
            v-model="loginForm.password" 
            type="password" 
            placeholder="输入密码"
            @keyup.enter="handleLogin"
          />
        </div>
        <button @click="handleLogin" :disabled="loading" class="login-btn">
          {{ loading ? '登录中...' : '登录到Matrix' }}
        </button>
        <div v-if="error" class="error-message">{{ error }}</div>
      </div>
    </div>

    <!-- Matrix聊天界面 -->
    <div class="chat-interface" v-else>
      <div class="user-info">
        <div class="user-avatar">{{ matrixStore.currentUser?.username?.charAt(0).toUpperCase() }}</div>
        <div class="user-details">
          <div class="username">{{ matrixStore.currentUser?.username }}</div>
          <div class="user-id">@{{ matrixStore.currentUser?.username }}:jianluochat.com</div>
        </div>
        <button @click="logout" class="logout-btn">退出</button>
      </div>

      <!-- 房间选择 -->
      <div class="room-selection">
        <h4>选择房间</h4>
        <div class="room-options">
          <button 
            @click="selectRoom('world')" 
            :class="{ active: selectedRoom === 'world' }"
            class="room-btn"
          >
            🌍 世界频道
          </button>
          <button @click="showCreateRoom = true" class="create-room-btn">
            + 创建房间
          </button>
        </div>
        
        <!-- 房间列表 -->
        <div class="rooms-list" v-if="matrixStore.rooms.length > 0">
          <div 
            v-for="room in matrixStore.rooms" 
            :key="room.id"
            @click="selectRoom(room.id)"
            :class="{ active: selectedRoom === room.id }"
            class="room-item"
          >
            <div class="room-name">{{ room.name }}</div>
            <div class="room-members">{{ room.memberCount }} 成员</div>
          </div>
        </div>
      </div>

      <!-- 消息区域 -->
      <div class="messages-area" v-if="selectedRoom">
        <div class="messages-header">
          <h4>{{ selectedRoom === 'world' ? '世界频道' : getCurrentRoomName() }}</h4>
          <div class="connection-status" :class="connectionStatus">
            <div class="status-dot"></div>
            <span>{{ getConnectionStatusText() }}</span>
          </div>
        </div>

        <div class="messages-list" ref="messagesList">
          <div 
            v-for="message in currentMessages" 
            :key="message.id"
            class="message-item"
            :class="{ 'own-message': message.sender === matrixStore.currentUser?.username }"
          >
            <div class="message-sender" v-if="message.sender !== matrixStore.currentUser?.username">
              {{ message.sender }}
            </div>
            <div class="message-content">{{ message.content }}</div>
            <div class="message-time">{{ formatTime(message.timestamp) }}</div>
          </div>
          
          <div v-if="currentMessages.length === 0" class="no-messages">
            暂无消息，开始聊天吧！
          </div>
        </div>

        <div class="message-input">
          <input 
            v-model="messageText"
            type="text"
            placeholder="输入消息..."
            @keyup.enter="sendMessage"
            :disabled="!matrixStore.isConnected"
          />
          <button @click="sendMessage" :disabled="!messageText.trim() || !matrixStore.isConnected">
            发送
          </button>
        </div>
      </div>

      <!-- 创建房间模态框 -->
      <div v-if="showCreateRoom" class="modal-overlay" @click="showCreateRoom = false">
        <div class="modal-content" @click.stop>
          <h4>创建Matrix房间</h4>
          <div class="form-group">
            <label>房间名称:</label>
            <input v-model="newRoomName" type="text" placeholder="输入房间名称" />
          </div>
          <div class="form-group">
            <label>
              <input type="checkbox" v-model="newRoomPublic" />
              公开房间
            </label>
          </div>
          <div class="modal-actions">
            <button @click="createRoom" :disabled="!newRoomName.trim()">创建</button>
            <button @click="showCreateRoom = false">取消</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useMatrixStore } from '@/stores/matrix'
import { format } from 'date-fns'

const matrixStore = useMatrixStore()

// 登录表单
const loginForm = ref({
  username: '',
  password: ''
})

// 状态
const loading = ref(false)
const error = ref('')
const selectedRoom = ref('')
const messageText = ref('')
const showCreateRoom = ref(false)
const newRoomName = ref('')
const newRoomPublic = ref(false)

// 计算属性
const currentMessages = computed(() => {
  if (selectedRoom.value === 'world') {
    return matrixStore.messages.get('world') || []
  }
  return matrixStore.messages.get(selectedRoom.value) || []
})

const connectionStatus = computed(() => {
  if (matrixStore.isConnected) return 'connected'
  if (loading.value) return 'connecting'
  return 'disconnected'
})

// 方法
const handleLogin = async () => {
  if (!loginForm.value.username || !loginForm.value.password) {
    error.value = '请输入用户名和密码'
    return
  }

  loading.value = true
  error.value = ''

  try {
    const result = await matrixStore.matrixLogin(loginForm.value.username, loginForm.value.password)
    if (result.success) {
      // 登录成功后加载房间
      await matrixStore.fetchMatrixRooms()
      // 默认选择世界频道
      selectRoom('world')
    } else {
      error.value = result.error || 'Matrix登录失败'
    }
  } catch (err: any) {
    error.value = err.message || '登录失败，请检查网络连接'
  } finally {
    loading.value = false
  }
}

const logout = () => {
  matrixStore.disconnect()
  selectedRoom.value = ''
  loginForm.value = { username: '', password: '' }
}

const selectRoom = async (roomId: string) => {
  selectedRoom.value = roomId
  matrixStore.setCurrentRoom(roomId)
  
  // 加载房间消息
  try {
    await matrixStore.fetchMatrixMessages(roomId)
  } catch (error) {
    console.error('Failed to load messages:', error)
  }
  
  // 滚动到底部
  nextTick(() => {
    scrollToBottom()
  })
}

const sendMessage = async () => {
  if (!messageText.value.trim() || !selectedRoom.value) return

  try {
    await matrixStore.sendMatrixMessage(selectedRoom.value, messageText.value.trim())
    messageText.value = ''
    
    // 滚动到底部
    nextTick(() => {
      scrollToBottom()
    })
  } catch (error) {
    console.error('Failed to send message:', error)
    error.value = '发送消息失败'
  }
}

const createRoom = async () => {
  if (!newRoomName.value.trim()) return

  try {
    const result = await matrixStore.createMatrixRoom(newRoomName.value, newRoomPublic.value)
    if (result.success) {
      showCreateRoom.value = false
      newRoomName.value = ''
      newRoomPublic.value = false
      // 选择新创建的房间
      selectRoom(result.room.id)
    }
  } catch (error) {
    console.error('Failed to create room:', error)
    error.value = '创建房间失败'
  }
}

const getCurrentRoomName = () => {
  const room = matrixStore.rooms.find(r => r.id === selectedRoom.value)
  return room?.name || '未知房间'
}

const getConnectionStatusText = () => {
  switch (connectionStatus.value) {
    case 'connected': return '已连接'
    case 'connecting': return '连接中...'
    case 'disconnected': return '未连接'
    default: return '未知状态'
  }
}

const formatTime = (timestamp: number) => {
  return format(new Date(timestamp), 'HH:mm')
}

const scrollToBottom = () => {
  const messagesList = document.querySelector('.messages-list')
  if (messagesList) {
    messagesList.scrollTop = messagesList.scrollHeight
  }
}

// 初始化
onMounted(async () => {
  // 初始化Matrix连接
  try {
    await matrixStore.initializeMatrix()
  } catch (error) {
    console.error('Failed to initialize Matrix:', error)
  }
})

// 监听消息变化，自动滚动到底部
watch(() => currentMessages.value.length, () => {
  nextTick(() => {
    scrollToBottom()
  })
})
</script>

<style scoped>
.matrix-chat-demo {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%);
  color: #e0e6ed;
  border-radius: 8px;
  font-family: 'Inter', sans-serif;
}

.demo-header {
  text-align: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #2a2a3a;
}

.demo-header h3 {
  color: #4CAF50;
  margin-bottom: 5px;
}

.demo-header p {
  color: #8f8f8f;
  font-size: 0.9rem;
}

.login-status {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}

.login-form {
  background: rgba(0, 0, 0, 0.3);
  padding: 30px;
  border-radius: 8px;
  width: 100%;
  max-width: 400px;
}

.login-form h4 {
  text-align: center;
  margin-bottom: 20px;
  color: #4CAF50;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  color: #e0e6ed;
}

.form-group input {
  width: 100%;
  padding: 10px;
  background: #2a2a3a;
  border: 1px solid #3a3a4a;
  border-radius: 4px;
  color: #e0e6ed;
  font-size: 14px;
}

.form-group input:focus {
  outline: none;
  border-color: #4CAF50;
}

.login-btn {
  width: 100%;
  padding: 12px;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.2s;
}

.login-btn:hover:not(:disabled) {
  background: #3d8b40;
}

.login-btn:disabled {
  background: #666;
  cursor: not-allowed;
}

.error-message {
  color: #f44336;
  text-align: center;
  margin-top: 10px;
  font-size: 14px;
}

.chat-interface {
  display: flex;
  flex-direction: column;
  height: 600px;
}

.user-info {
  display: flex;
  align-items: center;
  padding: 15px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  margin-bottom: 15px;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #4CAF50;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-right: 10px;
}

.user-details {
  flex: 1;
}

.username {
  font-weight: bold;
}

.user-id {
  font-size: 0.8rem;
  color: #8f8f8f;
}

.logout-btn {
  background: #f44336;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 4px;
  cursor: pointer;
}

.room-selection {
  margin-bottom: 15px;
}

.room-selection h4 {
  margin-bottom: 10px;
  color: #4CAF50;
}

.room-options {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.room-btn, .create-room-btn {
  padding: 8px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background: #2a2a3a;
  color: #e0e6ed;
  transition: background-color 0.2s;
}

.room-btn:hover, .create-room-btn:hover {
  background: #3a3a4a;
}

.room-btn.active {
  background: #4CAF50;
  color: white;
}

.rooms-list {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.room-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background: #2a2a3a;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.room-item:hover {
  background: #3a3a4a;
}

.room-item.active {
  background: #4CAF50;
  color: white;
}

.room-members {
  font-size: 0.8rem;
  color: #8f8f8f;
}

.room-item.active .room-members {
  color: rgba(255, 255, 255, 0.8);
}

.messages-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  overflow: hidden;
}

.messages-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid #2a2a3a;
}

.messages-header h4 {
  color: #4CAF50;
}

.connection-status {
  display: flex;
  align-items: center;
  font-size: 0.8rem;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 5px;
}

.connection-status.connected .status-dot {
  background: #4CAF50;
}

.connection-status.connecting .status-dot {
  background: #ff9800;
}

.connection-status.disconnected .status-dot {
  background: #f44336;
}

.messages-list {
  flex: 1;
  overflow-y: auto;
  padding: 15px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.message-item {
  display: flex;
  flex-direction: column;
  max-width: 70%;
}

.message-item.own-message {
  align-self: flex-end;
  align-items: flex-end;
}

.message-sender {
  font-size: 0.8rem;
  color: #4CAF50;
  margin-bottom: 2px;
}

.message-content {
  background: #2a2a3a;
  padding: 8px 12px;
  border-radius: 8px;
  word-break: break-word;
}

.own-message .message-content {
  background: #4CAF50;
  color: white;
}

.message-time {
  font-size: 0.7rem;
  color: #8f8f8f;
  margin-top: 2px;
}

.no-messages {
  text-align: center;
  color: #8f8f8f;
  font-style: italic;
  margin-top: 50px;
}

.message-input {
  display: flex;
  padding: 15px;
  border-top: 1px solid #2a2a3a;
}

.message-input input {
  flex: 1;
  padding: 10px;
  background: #2a2a3a;
  border: 1px solid #3a3a4a;
  border-radius: 4px;
  color: #e0e6ed;
  margin-right: 10px;
}

.message-input input:focus {
  outline: none;
  border-color: #4CAF50;
}

.message-input button {
  padding: 10px 20px;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.message-input button:disabled {
  background: #666;
  cursor: not-allowed;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: #1a1a2e;
  padding: 30px;
  border-radius: 8px;
  width: 90%;
  max-width: 400px;
}

.modal-content h4 {
  color: #4CAF50;
  margin-bottom: 20px;
  text-align: center;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.modal-actions button {
  padding: 8px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.modal-actions button:first-child {
  background: #4CAF50;
  color: white;
}

.modal-actions button:last-child {
  background: #666;
  color: white;
}
</style>
