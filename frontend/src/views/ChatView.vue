<template>
  <div class="matrix-chat-container">
    <!-- 背景效果 -->
    <div class="matrix-background"></div>

    <!-- 主界面 -->
    <div class="chat-interface">
      <!-- 左侧面板 - 房间列表 -->
      <div class="left-panel">
        <!-- 用户信息区域 -->
        <div class="user-terminal">
          <div class="terminal-header">
            <span class="terminal-indicator">●</span>
            <span class="terminal-title">USER@MATRIX</span>
            <button class="header-logout-btn" @click="handleLogout()" title="退出登录 / Logout">
              [LOGOUT]
            </button>
          </div>
          <div class="user-info">
            <div class="user-avatar">
              <span class="avatar-char">{{ getUserInitial() }}</span>
            </div>
            <div class="user-details">
              <div class="username">{{ authStore.currentUser?.displayName || authStore.currentUser?.username }}</div>
              <div class="user-id">@{{ authStore.currentUser?.username }}:jianluochat.com</div>
              <div class="connection-status">
                <span class="status-indicator" :class="connectionStatus"></span>
                <span class="status-text">{{ getStatusText() }}</span>
              </div>
            </div>
            <div class="user-actions">
              <button class="action-button" @click="showUserMenu = !showUserMenu" title="用户菜单 / User Menu">
                [⚙]
              </button>
              <button class="logout-button" @click="handleLogout()" title="退出登录 / Logout">
                [EXIT]
              </button>
            </div>
          </div>

          <!-- 用户菜单 -->
          <div v-if="showUserMenu" class="user-menu">
            <div class="menu-item" @click="toggleLanguage()">
              <span class="menu-icon">🌐</span>
              <span class="menu-text">{{ currentLang === 'zh' ? 'English' : '中文' }}</span>
            </div>
            <div class="menu-item" @click="showProfile()">
              <span class="menu-icon">👤</span>
              <span class="menu-text">{{ t('profile') }}</span>
            </div>
            <div class="menu-item" @click="showSettings()">
              <span class="menu-icon">⚙️</span>
              <span class="menu-text">{{ t('settings') }}</span>
            </div>
            <div class="menu-separator"></div>
            <div class="menu-item logout" @click="handleLogout()">
              <span class="menu-icon">🚪</span>
              <span class="menu-text">{{ t('logout') }}</span>
            </div>
          </div>
        </div>

        <!-- 房间列表 -->
        <div class="rooms-terminal">
          <div class="terminal-header">
            <span class="terminal-indicator">●</span>
            <span class="terminal-title">MATRIX ROOMS</span>
            <button class="create-room-btn" @click="showCreateRoomDialog = true" :title="t('createRoom')">
              [+] {{ t('createRoom').toUpperCase() }}
            </button>
          </div>

          <!-- 世界频道 -->
          <div class="world-channel" @click="selectWorldChannel()">
            <div class="channel-icon">#</div>
            <div class="channel-info">
              <div class="channel-name">{{ t('chat.worldChannel').toUpperCase() }}</div>
              <div class="channel-desc">{{ t('chat.globalChannel') }}</div>
            </div>
            <div class="channel-status">
              <span class="online-count">{{ worldChannelUsers }} {{ t('chat.online') }}</span>
              <span class="unread-badge" v-if="worldUnreadCount > 0">{{ worldUnreadCount }}</span>
            </div>
          </div>

          <!-- 私人房间列表 -->
          <div class="private-rooms">
            <div class="section-header">{{ t('privateRooms').toUpperCase() }}</div>
            <div
              v-for="room in chatStore.sortedRooms"
              :key="room.id"
              class="room-item"
              :class="{ active: room.id === chatStore.currentRoomId }"
              @click="selectRoom(room.id)"
            >
              <div class="room-icon">
                <span v-if="room.type === 'private'">🔒</span>
                <span v-else>💬</span>
              </div>
              <div class="room-info">
                <div class="room-name">{{ room.name }}</div>
                <div class="last-message">
                  {{ room.lastMessage?.content || 'No messages' }}
                </div>
              </div>
              <div class="room-meta">
                <div class="timestamp">{{ formatTime(room.lastMessage?.timestamp) }}</div>
                <div class="unread-count" v-if="room.unreadCount > 0">{{ room.unreadCount }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧主聊天区域 -->
      <div class="main-chat-area">
        <div v-if="!currentChannel && !chatStore.currentRoomId" class="welcome-screen">
          <div class="welcome-terminal">
            <div class="terminal-header">
              <span class="terminal-indicator">●</span>
              <span class="terminal-title">JIANLUOCHAT MATRIX</span>
            </div>
            <div class="welcome-content">
              <pre class="ascii-welcome">
╔══════════════════════════════════════════════════════════════╗
║                    WELCOME TO THE MATRIX                     ║
║                                                              ║
║  > Decentralized messaging protocol                          ║
║  > End-to-end encryption enabled                             ║
║  > Federation with other Matrix servers                      ║
║                                                              ║
║  Select a channel or room to begin communication            ║
╚══════════════════════════════════════════════════════════════╝
              </pre>
              <div class="quick-actions">
                <button class="action-btn" @click="selectWorldChannel()">
                  [ENTER] {{ t('joinWorld') }}
                </button>
                <button class="action-btn" @click="showCreateRoomDialog = true">
                  [CREATE] {{ t('newRoom') }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="active-chat">
          <!-- 聊天头部 -->
          <div class="chat-header">
            <div class="channel-info">
              <div class="channel-icon">
                <span v-if="currentChannel === 'world'">#</span>
                <span v-else-if="chatStore.currentRoom?.type === 'private'">🔒</span>
                <span v-else>💬</span>
              </div>
              <div class="channel-details">
                <div class="channel-name">
                  {{ currentChannel === 'world' ? t('worldChannel').toUpperCase() : chatStore.currentRoom?.name }}
                </div>
                <div class="channel-desc">
                  <span v-if="currentChannel === 'world'">{{ t('globalChannel') }} - {{ worldChannelUsers }} {{ t('online') }}</span>
                  <span v-else>{{ chatStore.currentRoom?.members?.length || 0 }} {{ t('members') }}</span>
                </div>
              </div>
            </div>
            <div class="chat-controls">
              <button class="control-btn" @click="showChannelInfo = true">
                [{{ t('info').toUpperCase() }}]
              </button>
              <button class="control-btn" @click="toggleEncryption()">
                [{{ encryptionEnabled ? t('encrypted').toUpperCase() : t('plain').toUpperCase() }}]
              </button>
            </div>
          </div>

          <!-- 消息显示区域 -->
          <div class="messages-terminal" ref="messagesRef">
            <div class="messages-content">
              <div
                v-for="message in getCurrentMessages()"
                :key="message.id"
                class="message-line"
                :class="{ 'own-message': message.sender === authStore.currentUser?.username }"
              >
                <span class="timestamp">[{{ formatMessageTime(message.timestamp) }}]</span>
                <span class="sender" :class="getSenderClass(message.sender)">
                  {{ message.sender }}:
                </span>
                <span class="message-content">{{ message.content }}</span>
              </div>

              <!-- 正在输入指示器 -->
              <div v-if="typingUsers.length > 0" class="typing-line">
                <span class="timestamp">[{{ getCurrentTime() }}]</span>
                <span class="typing-indicator">
                  {{ typingUsers.join(', ') }} is typing...
                </span>
              </div>
            </div>
          </div>

          <!-- 消息输入区域 -->
          <div class="input-terminal">
            <div class="input-line">
              <span class="input-prompt">{{ authStore.currentUser?.username }}@matrix:~$</span>
              <input
                v-model="messageInput"
                type="text"
                class="message-input"
                :placeholder="t('enterMessage')"
                @keyup.enter="sendMessage"
                @input="handleTyping"
                :disabled="sendingMessage"
              />
              <button
                class="send-btn"
                @click="sendMessage"
                :disabled="!messageInput.trim() || sendingMessage"
              >
                [{{ t('send').toUpperCase() }}]
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 创建房间对话框 -->
    <div v-if="showCreateRoomDialog" class="modal-overlay" @click="showCreateRoomDialog = false">
      <div class="create-room-terminal" @click.stop>
        <div class="terminal-header">
          <span class="terminal-indicator">●</span>
          <span class="terminal-title">CREATE NEW ROOM</span>
          <button class="close-btn" @click="showCreateRoomDialog = false">[X]</button>
        </div>
        <div class="create-room-content">
          <div class="input-group">
            <label class="input-label">{{ t('roomName').toUpperCase() }}:</label>
            <input
              v-model="newRoomName"
              type="text"
              class="retro-input"
              :placeholder="currentLang === 'zh' ? '输入房间名称...' : 'Enter room name...'"
              @keyup.enter="createRoom"
            />
          </div>
          <div class="input-group">
            <label class="input-label">{{ t('roomType').toUpperCase() }}:</label>
            <select v-model="newRoomType" class="retro-select">
              <option value="private">{{ t('privateRoom') }}</option>
              <option value="public">{{ t('publicRoom') }}</option>
            </select>
          </div>
          <div class="button-group">
            <button class="retro-button" @click="createRoom" :disabled="!newRoomName.trim()">
              [{{ t('create').toUpperCase() }}]
            </button>
            <button class="retro-button secondary" @click="showCreateRoomDialog = false">
              [{{ t('cancel').toUpperCase() }}]
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 频道信息对话框 -->
    <div v-if="showChannelInfo" class="modal-overlay" @click="showChannelInfo = false">
      <div class="channel-info-terminal" @click.stop>
        <div class="terminal-header">
          <span class="terminal-indicator">●</span>
          <span class="terminal-title">CHANNEL INFO</span>
          <button class="close-btn" @click="showChannelInfo = false">[X]</button>
        </div>
        <div class="channel-info-content">
          <div class="info-section">
            <div class="info-line">
              <span class="label">NAME:</span>
              <span class="value">{{ currentChannel === 'world' ? 'WORLD' : chatStore.currentRoom?.name }}</span>
            </div>
            <div class="info-line">
              <span class="label">TYPE:</span>
              <span class="value">{{ currentChannel === 'world' ? 'PUBLIC GLOBAL' : chatStore.currentRoom?.type?.toUpperCase() }}</span>
            </div>
            <div class="info-line">
              <span class="label">ENCRYPTION:</span>
              <span class="value">{{ encryptionEnabled ? 'ENABLED' : 'DISABLED' }}</span>
            </div>
            <div class="info-line">
              <span class="label">MEMBERS:</span>
              <span class="value">{{ currentChannel === 'world' ? worldChannelUsers : chatStore.currentRoom?.members.length }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useChatStore } from '@/stores/chat'
import { websocketService } from '@/services/websocket'

const router = useRouter()
const authStore = useAuthStore()
const chatStore = useChatStore()

// 界面状态
const messagesRef = ref<HTMLElement>()
const showCreateRoomDialog = ref(false)
const showChannelInfo = ref(false)
const showUserMenu = ref(false)
const currentChannel = ref<string | null>(null)
const messageInput = ref('')
const sendingMessage = ref(false)

// 新建房间
const newRoomName = ref('')
const newRoomType = ref('private')

// 世界频道数据
const worldChannelUsers = ref(42)
const worldUnreadCount = ref(0)
const worldMessages = ref<any[]>([])

// 连接状态
const connectionStatus = ref('connected')
const encryptionEnabled = ref(true)

// 正在输入的用户
const typingUsers = ref<string[]>([])
const typingTimeout = ref<NodeJS.Timeout | null>(null)

// 多语言支持
const currentLang = ref(localStorage.getItem('language') || 'zh')

const translations = {
  zh: {
    profile: '个人资料',
    settings: '设置',
    logout: '退出登录',
    worldChannel: '世界频道',
    privateRooms: '私人房间',
    createRoom: '创建房间',
    roomName: '房间名称',
    roomType: '房间类型',
    privateRoom: '私人房间',
    publicRoom: '公开房间',
    create: '创建',
    cancel: '取消',
    send: '发送',
    connecting: '连接中...',
    connected: '已连接',
    disconnected: '已断开',
    encrypted: '已加密',
    plain: '明文',
    info: '信息',
    online: '在线',
    members: '成员',
    globalChannel: '全球公共频道',
    enterMessage: '输入消息...',
    welcome: '欢迎来到矩阵',
    joinWorld: '加入世界频道',
    newRoom: '新建私人房间'
  },
  en: {
    profile: 'Profile',
    settings: 'Settings',
    logout: 'Logout',
    worldChannel: 'World Channel',
    privateRooms: 'Private Rooms',
    createRoom: 'Create Room',
    roomName: 'Room Name',
    roomType: 'Room Type',
    privateRoom: 'Private Room',
    publicRoom: 'Public Room',
    create: 'Create',
    cancel: 'Cancel',
    send: 'Send',
    connecting: 'Connecting...',
    connected: 'Connected',
    disconnected: 'Disconnected',
    encrypted: 'Encrypted',
    plain: 'Plain',
    info: 'Info',
    online: 'Online',
    members: 'Members',
    globalChannel: 'Global public channel',
    enterMessage: 'Type your message...',
    welcome: 'Welcome to the Matrix',
    joinWorld: 'Join World Channel',
    newRoom: 'New Private Room'
  }
}

const t = (key: string) => {
  return translations[currentLang.value as keyof typeof translations][key as keyof typeof translations.zh] || key
}

// 计算属性
const getUserInitial = () => {
  const user = authStore.currentUser
  return user?.displayName?.[0] || user?.username?.[0] || 'U'
}

const getStatusText = () => {
  switch (connectionStatus.value) {
    case 'connected': return 'MATRIX CONNECTED'
    case 'connecting': return 'CONNECTING...'
    case 'disconnected': return 'DISCONNECTED'
    default: return 'UNKNOWN'
  }
}

const getCurrentMessages = () => {
  if (currentChannel.value === 'world') {
    return worldMessages.value
  }
  return chatStore.currentMessages || []
}

const getSenderClass = (sender: string) => {
  if (sender === authStore.currentUser?.username) {
    return 'own-sender'
  }
  return 'other-sender'
}
// 时间格式化
const formatTime = (timestamp?: string) => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  return date.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatMessageTime = (timestamp?: string) => {
  if (!timestamp) return getCurrentTime()
  const date = new Date(timestamp)
  return date.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

const getCurrentTime = () => {
  return new Date().toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// 房间和频道操作
const selectRoom = (roomId: string) => {
  currentChannel.value = null
  chatStore.setCurrentRoom(roomId)
  nextTick(() => {
    scrollToBottom()
  })
}

const selectWorldChannel = () => {
  currentChannel.value = 'world'
  chatStore.setCurrentRoom(null)
  // 加入世界频道
  websocketService.joinWorld()
  // 加载世界频道消息
  loadWorldChannelMessages()
  nextTick(() => {
    scrollToBottom()
  })
}

const loadWorldChannelMessages = async () => {
  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'
    const response = await fetch(`${apiUrl}/rooms/world/messages`, {
      headers: {
        'Authorization': `Bearer ${authStore.token}`,
        'Content-Type': 'application/json'
      }
    })

    if (response.ok) {
      const messages = await response.json()
      worldMessages.value = messages.map((msg: any) => ({
        id: msg.id,
        sender: msg.sender?.username || msg.sender?.displayName || 'unknown',
        content: msg.content,
        timestamp: new Date(msg.timestamp).toISOString()
      }))
    } else {
      console.error('Failed to load world messages')
      // 回退到模拟数据
      worldMessages.value = [
        {
          id: '1',
          sender: 'system',
          content: t('chat.worldChannelWelcome'),
          timestamp: new Date().toISOString()
        }
      ]
    }
  } catch (error) {
    console.error('Error loading world messages:', error)
    // 回退到模拟数据
    worldMessages.value = [
      {
        id: '1',
        sender: 'system',
        content: t('chat.worldChannelWelcome'),
        timestamp: new Date().toISOString()
      }
    ]
  }
}

// 消息发送
const sendMessage = async () => {
  if (!messageInput.value.trim() || sendingMessage.value) return

  sendingMessage.value = true
  const content = messageInput.value.trim()
  messageInput.value = ''

  try {
    if (currentChannel.value === 'world') {
      // 发送到世界频道
      await sendWorldMessage(content)
    } else if (chatStore.currentRoomId) {
      // 发送到私人房间
      await chatStore.sendMessage(chatStore.currentRoomId, content)
      websocketService.sendChatMessage(chatStore.currentRoomId, content)
    }

    nextTick(() => {
      scrollToBottom()
    })
  } catch (error) {
    console.error('Failed to send message:', error)
  } finally {
    sendingMessage.value = false
  }
}

const sendWorldMessage = async (content: string) => {
  try {
    // 通过WebSocket发送世界频道消息
    websocketService.sendWorldMessage(content)

    // 也通过HTTP API发送（作为备份）
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'
    const response = await fetch(`${apiUrl}/rooms/world/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authStore.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ content })
    })

    if (!response.ok) {
      console.error('Failed to send world message via HTTP')
    }
  } catch (error) {
    console.error('Error sending world message:', error)
    // 回退到本地添加消息
    const newMessage = {
      id: Date.now().toString(),
      sender: authStore.currentUser?.username || 'anonymous',
      content,
      timestamp: new Date().toISOString()
    }
    worldMessages.value.push(newMessage)
  }
}

// 输入处理
const handleTyping = () => {
  if (typingTimeout.value) {
    clearTimeout(typingTimeout.value)
  }

  // 发送正在输入指示
  if (currentChannel.value === 'world') {
    websocketService.sendTypingIndicator('world', true)
  } else if (chatStore.currentRoomId) {
    websocketService.sendTypingIndicator(chatStore.currentRoomId, true)
  }

  // 3秒后停止输入指示
  typingTimeout.value = setTimeout(() => {
    if (currentChannel.value === 'world') {
      websocketService.sendTypingIndicator('world', false)
    } else if (chatStore.currentRoomId) {
      websocketService.sendTypingIndicator(chatStore.currentRoomId, false)
    }
  }, 3000)
}

// 房间创建
const createRoom = async () => {
  if (!newRoomName.value.trim()) return

  try {
    const room = await chatStore.createRoom(
      newRoomName.value.trim(),
      newRoomType.value as 'private' | 'public',
      []
    )

    if (room.success) {
      showCreateRoomDialog.value = false
      newRoomName.value = ''
      newRoomType.value = 'private'

      // 选择新创建的房间
      selectRoom(room.room.id)

      console.log('Room created successfully:', room)
    }
  } catch (error) {
    console.error('Failed to create room:', error)
  }
}

// 用户菜单功能
const toggleLanguage = () => {
  currentLang.value = currentLang.value === 'zh' ? 'en' : 'zh'
  localStorage.setItem('language', currentLang.value)
  showUserMenu.value = false
}

const showProfile = () => {
  showUserMenu.value = false
  router.push('/profile')
}

const showSettings = () => {
  showUserMenu.value = false
  // TODO: 实现设置页面
  console.log('Settings page not implemented yet')
}

const handleLogout = async () => {
  showUserMenu.value = false

  try {
    console.log('Starting logout process...')

    // 断开WebSocket连接
    websocketService.disconnect()
    console.log('WebSocket disconnected')

    // 清除认证状态
    authStore.logout()
    console.log('Auth store cleared')

    // 等待下一个tick确保状态更新
    await nextTick()

    // 强制跳转到登录页面
    await router.replace('/login')
    console.log('Redirected to login page')

    // 如果路由跳转失败，强制刷新页面
    setTimeout(() => {
      if (window.location.pathname !== '/login') {
        console.log('Route change failed, forcing page reload')
        window.location.href = '/login'
      }
    }, 100)

    console.log('User logged out successfully')
  } catch (error) {
    console.error('Logout failed:', error)
    // 即使出错也要跳转到登录页面
    window.location.href = '/login'
  }
}

// 其他功能
const toggleEncryption = () => {
  encryptionEnabled.value = !encryptionEnabled.value
  console.log('Encryption', encryptionEnabled.value ? 'enabled' : 'disabled')
}

const scrollToBottom = () => {
  if (messagesRef.value) {
    messagesRef.value.scrollTop = messagesRef.value.scrollHeight
  }
}

// 点击外部关闭菜单
const handleClickOutside = (event: Event) => {
  const target = event.target as HTMLElement
  if (!target.closest('.user-info') && !target.closest('.user-menu')) {
    showUserMenu.value = false
  }
}

// WebSocket事件处理
const handleWorldMessage = (messageData: any) => {
  console.log('Received world message:', messageData)
  const newMessage = {
    id: messageData.id,
    sender: messageData.sender?.username || messageData.sender?.displayName || 'unknown',
    content: messageData.content,
    timestamp: new Date(messageData.timestamp).toISOString()
  }
  console.log('Adding message to worldMessages:', newMessage)
  worldMessages.value.push(newMessage)

  // 如果当前在世界频道，滚动到底部
  if (currentChannel.value === 'world') {
    nextTick(() => {
      scrollToBottom()
    })
  }
}

const handleWorldJoined = (data: any) => {
  console.log('Successfully joined world channel:', data)
}

const handleTypingIndicator = (data: any) => {
  // 处理输入指示
  console.log('Typing indicator:', data)
}

// 生命周期
onMounted(async () => {
  console.log('Matrix chat interface initialized')

  // 连接WebSocket
  websocketService.connect()
  websocketService.startHeartbeat()

  // 设置WebSocket事件监听
  websocketService.on('worldMessage', handleWorldMessage)
  websocketService.on('worldJoined', handleWorldJoined)
  websocketService.on('typingIndicator', handleTypingIndicator)

  // 加载房间列表
  await chatStore.fetchRooms()

  // 默认选择世界频道
  selectWorldChannel()

  // 添加点击外部关闭菜单的事件监听
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  if (typingTimeout.value) {
    clearTimeout(typingTimeout.value)
  }

  // 清理WebSocket事件监听
  websocketService.off('worldMessage', handleWorldMessage)
  websocketService.off('worldJoined', handleWorldJoined)
  websocketService.off('typingIndicator', handleTypingIndicator)

  websocketService.disconnect()

  // 移除事件监听
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.matrix-chat-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  background: #000;
  overflow: hidden;
}

.matrix-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background:
    radial-gradient(circle at 20% 20%, rgba(0, 255, 0, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(0, 255, 0, 0.1) 0%, transparent 50%);
  z-index: 1;
}

.matrix-background::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image:
    linear-gradient(90deg, rgba(0, 255, 0, 0.02) 1px, transparent 1px),
    linear-gradient(rgba(0, 255, 0, 0.02) 1px, transparent 1px);
  background-size: 30px 30px;
  animation: matrix-grid 30s linear infinite;
}

@keyframes matrix-grid {
  0% { transform: translate(0, 0); }
  100% { transform: translate(30px, 30px); }
}

.chat-interface {
  position: relative;
  z-index: 10;
  display: flex;
  height: 100vh;
}

/* 左侧面板 */
.left-panel {
  width: 350px;
  background: rgba(0, 0, 0, 0.9);
  border-right: 2px solid #00ff00;
  display: flex;
  flex-direction: column;
  backdrop-filter: blur(10px);
}

/* 用户终端 */
.user-terminal {
  border-bottom: 1px solid #003300;
  margin-bottom: 10px;
}

.terminal-header {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background: rgba(0, 255, 0, 0.1);
  border-bottom: 1px solid #00ff00;
  font-family: 'Share Tech Mono', monospace;
  font-size: 12px;
}

.terminal-indicator {
  color: #00ff00;
  margin-right: 8px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.terminal-title {
  color: #00ff00;
  font-weight: bold;
  text-shadow: 0 0 5px #00ff00;
  flex: 1;
}

.header-logout-btn {
  background: none;
  border: 1px solid #ff6666;
  color: #ff6666;
  padding: 2px 8px;
  font-family: 'Share Tech Mono', monospace;
  font-size: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
}

.header-logout-btn:hover {
  background: rgba(255, 102, 102, 0.2);
  box-shadow: 0 0 5px #ff6666;
  text-shadow: 0 0 3px #ff6666;
}

.create-room-btn {
  background: none;
  border: 1px solid #00ff00;
  color: #00ff00;
  padding: 2px 8px;
  font-family: 'Share Tech Mono', monospace;
  font-size: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.create-room-btn:hover {
  background: rgba(0, 255, 0, 0.2);
  box-shadow: 0 0 5px #00ff00;
}

.user-info {
  display: flex;
  align-items: center;
  padding: 15px;
  position: relative;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border: 2px solid #00ff00;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 255, 0, 0.1);
  margin-right: 12px;
}

.avatar-char {
  color: #00ff00;
  font-family: 'Share Tech Mono', monospace;
  font-weight: bold;
  font-size: 18px;
  text-shadow: 0 0 5px #00ff00;
}

.user-details {
  flex: 1;
}

.username {
  color: #00ff00;
  font-family: 'Share Tech Mono', monospace;
  font-weight: bold;
  font-size: 14px;
  text-shadow: 0 0 5px #00ff00;
  margin-bottom: 4px;
}

.user-id {
  color: #00cccc;
  font-family: 'Share Tech Mono', monospace;
  font-size: 12px;
  margin-bottom: 4px;
}

.connection-status {
  display: flex;
  align-items: center;
  font-family: 'Share Tech Mono', monospace;
  font-size: 11px;
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 6px;
}

.status-indicator.connected {
  background: #00ff00;
  box-shadow: 0 0 5px #00ff00;
  animation: pulse 2s infinite;
}

.status-indicator.connecting {
  background: #ffff00;
  animation: blink 1s infinite;
}

.status-indicator.disconnected {
  background: #ff0000;
}

.status-text {
  color: #00ff00;
}

.user-actions {
  margin-left: 10px;
  display: flex;
  gap: 5px;
}

.action-button {
  background: none;
  border: 1px solid #00ff00;
  color: #00ff00;
  padding: 4px 8px;
  font-family: 'Share Tech Mono', monospace;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-button:hover {
  background: rgba(0, 255, 0, 0.2);
  box-shadow: 0 0 5px #00ff00;
}

.logout-button {
  background: none;
  border: 1px solid #ff6666;
  color: #ff6666;
  padding: 4px 8px;
  font-family: 'Share Tech Mono', monospace;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
}

.logout-button:hover {
  background: rgba(255, 102, 102, 0.2);
  box-shadow: 0 0 5px #ff6666;
  text-shadow: 0 0 3px #ff6666;
}

/* 用户菜单 */
.user-menu {
  position: absolute;
  top: 100%;
  right: 15px;
  background: rgba(0, 0, 0, 0.95);
  border: 2px solid #00ff00;
  border-radius: 4px;
  box-shadow: 0 0 20px rgba(0, 255, 0, 0.3);
  z-index: 1000;
  min-width: 180px;
  backdrop-filter: blur(10px);
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 10px 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'Share Tech Mono', monospace;
  font-size: 13px;
  color: #00ff00;
}

.menu-item:hover {
  background: rgba(0, 255, 0, 0.1);
}

.menu-item.logout {
  color: #ff6666;
}

.menu-item.logout:hover {
  background: rgba(255, 102, 102, 0.1);
}

.menu-icon {
  margin-right: 10px;
  font-size: 14px;
}

.menu-text {
  flex: 1;
}

.menu-separator {
  height: 1px;
  background: #003300;
  margin: 5px 0;
}

/* 房间列表 */
.rooms-terminal {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.world-channel {
  display: flex;
  align-items: center;
  padding: 12px 15px;
  cursor: pointer;
  border-bottom: 1px solid #003300;
  transition: all 0.3s ease;
}

.world-channel:hover {
  background: rgba(0, 255, 0, 0.1);
}

.channel-icon {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffff00;
  font-size: 18px;
  font-weight: bold;
  margin-right: 12px;
  text-shadow: 0 0 5px #ffff00;
}

.channel-info {
  flex: 1;
}

.channel-name {
  color: #ffff00;
  font-family: 'Share Tech Mono', monospace;
  font-weight: bold;
  font-size: 14px;
  text-shadow: 0 0 5px #ffff00;
  margin-bottom: 2px;
}

.channel-desc {
  color: #00cccc;
  font-family: 'Share Tech Mono', monospace;
  font-size: 11px;
}

.channel-status {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.online-count {
  color: #00ff00;
  font-family: 'Share Tech Mono', monospace;
  font-size: 11px;
}

.unread-badge {
  background: #ff0000;
  color: #fff;
  border-radius: 10px;
  padding: 2px 6px;
  font-size: 10px;
  margin-top: 2px;
}

.private-rooms {
  flex: 1;
  overflow-y: auto;
}

.section-header {
  padding: 8px 15px;
  color: #00ff00;
  font-family: 'Share Tech Mono', monospace;
  font-size: 12px;
  font-weight: bold;
  border-bottom: 1px solid #003300;
  background: rgba(0, 255, 0, 0.05);
}

.room-item {
  display: flex;
  align-items: center;
  padding: 10px 15px;
  cursor: pointer;
  border-bottom: 1px solid #001100;
  transition: all 0.3s ease;
}

.room-item:hover {
  background: rgba(0, 255, 0, 0.1);
}

.room-item.active {
  background: rgba(0, 255, 0, 0.2);
  border-left: 3px solid #00ff00;
}

.room-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  font-size: 16px;
}

.room-info {
  flex: 1;
}

.room-name {
  color: #00ff00;
  font-family: 'Share Tech Mono', monospace;
  font-size: 13px;
  font-weight: bold;
  margin-bottom: 2px;
}

.last-message {
  color: #00cccc;
  font-family: 'Share Tech Mono', monospace;
  font-size: 11px;
  opacity: 0.8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 150px;
}

.room-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.timestamp {
  color: #006600;
  font-family: 'Share Tech Mono', monospace;
  font-size: 10px;
  margin-bottom: 2px;
}

.unread-count {
  background: #ff0000;
  color: #fff;
  border-radius: 8px;
  padding: 1px 5px;
  font-size: 9px;
  min-width: 16px;
  text-align: center;
}

/* 主聊天区域 */
.main-chat-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: rgba(0, 0, 0, 0.95);
  backdrop-filter: blur(10px);
}

/* 欢迎屏幕 */
.welcome-screen {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.welcome-terminal {
  width: 100%;
  max-width: 600px;
  background: rgba(0, 0, 0, 0.9);
  border: 2px solid #00ff00;
  border-radius: 8px;
  box-shadow: 0 0 30px rgba(0, 255, 0, 0.3);
}

.welcome-content {
  padding: 30px;
}

.ascii-welcome {
  color: #00ff00;
  font-family: 'Share Tech Mono', monospace;
  font-size: 12px;
  line-height: 1.4;
  text-shadow: 0 0 10px #00ff00;
  margin-bottom: 30px;
  text-align: center;
}

.quick-actions {
  display: flex;
  gap: 20px;
  justify-content: center;
}

.action-btn {
  background: transparent;
  border: 2px solid #00ff00;
  color: #00ff00;
  padding: 12px 24px;
  font-family: 'Share Tech Mono', monospace;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
}

.action-btn:hover {
  background: rgba(0, 255, 0, 0.1);
  box-shadow: 0 0 15px #00ff00;
  text-shadow: 0 0 5px #00ff00;
}

/* 活跃聊天区域 */
.active-chat {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 20px;
  border-bottom: 2px solid #00ff00;
  background: rgba(0, 255, 0, 0.1);
}

.channel-info {
  display: flex;
  align-items: center;
}

.channel-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #00ff00;
  border-radius: 50%;
  margin-right: 15px;
  font-size: 20px;
  background: rgba(0, 255, 0, 0.1);
}

.channel-details {
  flex: 1;
}

.channel-name {
  color: #00ff00;
  font-family: 'Share Tech Mono', monospace;
  font-size: 18px;
  font-weight: bold;
  text-shadow: 0 0 10px #00ff00;
  margin-bottom: 4px;
}

.channel-desc {
  color: #00cccc;
  font-family: 'Share Tech Mono', monospace;
  font-size: 12px;
}

.chat-controls {
  display: flex;
  gap: 10px;
}

.control-btn {
  background: transparent;
  border: 1px solid #00ff00;
  color: #00ff00;
  padding: 6px 12px;
  font-family: 'Share Tech Mono', monospace;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.control-btn:hover {
  background: rgba(0, 255, 0, 0.2);
  box-shadow: 0 0 10px #00ff00;
}

/* 消息终端 */
.messages-terminal {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background: rgba(0, 0, 0, 0.8);
}

.messages-content {
  font-family: 'Share Tech Mono', monospace;
  font-size: 13px;
  line-height: 1.6;
}

.message-line {
  display: flex;
  margin-bottom: 8px;
  word-wrap: break-word;
}

.message-line.own-message .sender {
  color: #ffff00;
}

.timestamp {
  color: #006600;
  margin-right: 8px;
  min-width: 80px;
  font-size: 11px;
}

.sender {
  color: #00cccc;
  margin-right: 8px;
  min-width: 120px;
  font-weight: bold;
}

.sender.own-sender {
  color: #ffff00;
}

.sender.other-sender {
  color: #00cccc;
}

.message-content {
  color: #00ff00;
  flex: 1;
  word-break: break-word;
}

.typing-line {
  display: flex;
  color: #666;
  font-style: italic;
  animation: blink 1s infinite;
}

.typing-indicator {
  color: #00cccc;
  margin-left: 8px;
}

/* 输入终端 */
.input-terminal {
  border-top: 2px solid #00ff00;
  background: rgba(0, 255, 0, 0.05);
  padding: 15px 20px;
}

.input-line {
  display: flex;
  align-items: center;
  gap: 10px;
}

.input-prompt {
  color: #00ff00;
  font-family: 'Share Tech Mono', monospace;
  font-size: 14px;
  font-weight: bold;
  text-shadow: 0 0 5px #00ff00;
  min-width: 200px;
}

.message-input {
  flex: 1;
  background: transparent;
  border: 1px solid #00ff00;
  color: #00ff00;
  padding: 10px 15px;
  font-family: 'Share Tech Mono', monospace;
  font-size: 14px;
  outline: none;
  transition: all 0.3s ease;
}

.message-input:focus {
  border-color: #00ff00;
  box-shadow: 0 0 15px rgba(0, 255, 0, 0.5);
  text-shadow: 0 0 5px #00ff00;
}

.message-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.send-btn {
  background: transparent;
  border: 2px solid #00ff00;
  color: #00ff00;
  padding: 10px 20px;
  font-family: 'Share Tech Mono', monospace;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 80px;
}

.send-btn:hover:not(:disabled) {
  background: rgba(0, 255, 0, 0.2);
  box-shadow: 0 0 15px #00ff00;
  text-shadow: 0 0 5px #00ff00;
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 模态框覆盖层 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
}

/* 创建房间终端 */
.create-room-terminal {
  width: 500px;
  max-width: 90vw;
  background: rgba(0, 0, 0, 0.95);
  border: 2px solid #00ff00;
  border-radius: 8px;
  box-shadow: 0 0 30px rgba(0, 255, 0, 0.5);
}

.close-btn {
  background: none;
  border: 1px solid #ff0000;
  color: #ff0000;
  padding: 2px 8px;
  font-family: 'Share Tech Mono', monospace;
  font-size: 10px;
  cursor: pointer;
  margin-left: auto;
}

.close-btn:hover {
  background: rgba(255, 0, 0, 0.2);
  box-shadow: 0 0 5px #ff0000;
}

.create-room-content {
  padding: 30px;
}

.input-group {
  margin-bottom: 20px;
}

.input-label {
  display: block;
  color: #00ff00;
  font-family: 'Share Tech Mono', monospace;
  font-size: 14px;
  margin-bottom: 8px;
  text-shadow: 0 0 5px #00ff00;
}

.retro-input {
  width: 100%;
  padding: 12px 16px;
  background: transparent;
  border: 1px solid #00ff00;
  color: #00ff00;
  font-family: 'Share Tech Mono', monospace;
  font-size: 14px;
  outline: none;
  transition: all 0.3s ease;
}

.retro-input:focus {
  border-color: #00ff00;
  box-shadow: 0 0 15px rgba(0, 255, 0, 0.5);
  text-shadow: 0 0 5px #00ff00;
}

.retro-select {
  width: 100%;
  padding: 12px 16px;
  background: rgba(0, 0, 0, 0.8);
  border: 1px solid #00ff00;
  color: #00ff00;
  font-family: 'Share Tech Mono', monospace;
  font-size: 14px;
  outline: none;
  cursor: pointer;
}

.retro-select option {
  background: #000;
  color: #00ff00;
}

.button-group {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-top: 30px;
}

.retro-button {
  background: transparent;
  border: 2px solid #00ff00;
  color: #00ff00;
  padding: 12px 24px;
  font-family: 'Share Tech Mono', monospace;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
}

.retro-button:hover:not(:disabled) {
  background: rgba(0, 255, 0, 0.1);
  box-shadow: 0 0 15px #00ff00;
  text-shadow: 0 0 5px #00ff00;
}

.retro-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.retro-button.secondary {
  border-color: #666;
  color: #666;
}

.retro-button.secondary:hover {
  background: rgba(102, 102, 102, 0.1);
  box-shadow: 0 0 15px #666;
  text-shadow: 0 0 5px #666;
}

/* 频道信息终端 */
.channel-info-terminal {
  width: 400px;
  max-width: 90vw;
  background: rgba(0, 0, 0, 0.95);
  border: 2px solid #00ff00;
  border-radius: 8px;
  box-shadow: 0 0 30px rgba(0, 255, 0, 0.5);
}

.channel-info-content {
  padding: 30px;
}

.info-section {
  font-family: 'Share Tech Mono', monospace;
}

.info-line {
  display: flex;
  margin-bottom: 12px;
  font-size: 14px;
}

.label {
  color: #00ff00;
  font-weight: bold;
  min-width: 120px;
  text-shadow: 0 0 5px #00ff00;
}

.value {
  color: #00cccc;
  flex: 1;
}

/* 动画效果 */
@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0.3; }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .chat-interface {
    flex-direction: column;
  }

  .left-panel {
    width: 100%;
    height: 200px;
    border-right: none;
    border-bottom: 2px solid #00ff00;
  }

  .main-chat-area {
    height: calc(100vh - 200px);
  }

  .input-prompt {
    min-width: 100px;
    font-size: 12px;
  }

  .message-input {
    font-size: 12px;
  }

  .ascii-welcome {
    font-size: 8px;
  }

  .quick-actions {
    flex-direction: column;
    gap: 10px;
  }
}
</style>
