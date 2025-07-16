<template>
  <div class="element-layout">
    <!-- 登录界面 -->
    <MatrixRealLogin
      v-if="!matrixStore.isLoggedIn"
      @login-success="handleLoginSuccess"
    />

    <!-- 主界面 - 只有登录后才显示 -->
    <template v-else>
      <!-- 左侧导航栏 -->
      <div class="sidebar">
        <div class="sidebar-header">
          <div class="app-logo">
            <div class="logo-icon">J</div>
            <span class="app-name">JianLuoChat</span>
          </div>
          <div class="user-info" v-if="matrixStore.currentUser">
            <div class="user-avatar">
              {{ getUserInitials(matrixStore.currentUser.displayName || matrixStore.currentUser.userId) }}
            </div>
            <span class="username">{{ matrixStore.currentUser.displayName || matrixStore.currentUser.userId }}</span>
          </div>
        </div>

      <div class="sidebar-nav">
        <div class="nav-item" :class="{ active: activeTab === 'home' }" @click="activeTab = 'home'">
          <i class="icon-home"></i>
          <span>主页</span>
        </div>
        <div class="nav-item" :class="{ active: activeTab === 'rooms' }" @click="activeTab = 'rooms'">
          <i class="icon-rooms"></i>
          <span>房间</span>
          <span class="badge" v-if="totalUnreadCount > 0">{{ totalUnreadCount }}</span>
        </div>
        <div class="nav-item" :class="{ active: activeTab === 'people' }" @click="activeTab = 'people'">
          <i class="icon-people"></i>
          <span>联系人</span>
        </div>
        <div class="nav-item" :class="{ active: activeTab === 'explore' }" @click="activeTab = 'explore'">
          <i class="icon-explore"></i>
          <span>探索</span>
        </div>
      </div>

      <div class="sidebar-footer">
        <div class="settings-btn" @click="showSettings = !showSettings">
          <i class="icon-settings"></i>
        </div>
      </div>
    </div>



    <!-- 中间列表区域 -->
    <div class="middle-panel">
      <div v-if="activeTab === 'home'" class="home-view">
        <div class="welcome-section">
          <h1>欢迎使用 JianLuoChat</h1>
          <p>基于Matrix协议的现代化聊天应用</p>

          <div class="quick-actions">
            <div class="action-card" @click="showStartDM = true">
              <i class="icon-message"></i>
              <h3>发起私聊</h3>
              <p>与其他用户开始一对一聊天</p>
            </div>

            <div class="action-card" @click="activeTab = 'people'">
              <i class="icon-people"></i>
              <h3>联系人</h3>
              <p>查看和管理你的聊天联系人</p>
            </div>

            <div class="action-card" @click="activeTab = 'rooms'">
              <i class="icon-rooms"></i>
              <h3>聊天房间</h3>
              <p>查看你加入的所有聊天房间</p>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="activeTab === 'rooms'" class="rooms-list">
        <div class="room-list-header">
          <h2>房间</h2>
          <div class="room-actions">
            <button class="btn-icon" @click="showCreateRoom = true" title="创建房间">
              <i class="icon-plus"></i>
            </button>
            <button class="btn-icon" @click="showJoinRoom = true" title="加入房间">
              <i class="icon-join"></i>
            </button>
          </div>
        </div>

        <div class="room-search">
          <input
            type="text"
            v-model="roomSearchQuery"
            placeholder="搜索房间..."
            class="search-input"
          />
        </div>

        <div class="room-list">
          <div v-if="filteredRooms.length === 0" class="empty-state">
            <i class="icon-chat-empty"></i>
            <h3>还没有房间</h3>
            <p>创建或加入一个房间开始聊天</p>
          </div>

          <div
            v-for="room in filteredRooms"
            :key="room.id"
            class="room-item"
            :class="{ active: currentRoomId === room.id }"
            @click="selectRoom(room.id)"
          >
            <div class="room-avatar">
              {{ getRoomInitials(room.name) }}
            </div>
            <div class="room-info">
              <div class="room-name">{{ room.name }}</div>
              <div class="room-last-message">{{ room.lastMessage || '开始对话...' }}</div>
            </div>
            <div class="room-meta">
              <div class="room-time">{{ formatTime(room.lastActivity) }}</div>
              <div v-if="room.unreadCount > 0" class="unread-badge">{{ room.unreadCount }}</div>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="activeTab === 'explore'" class="explore-view">
        <PublicRoomsExplorer @room-joined="handleRoomJoined" />
      </div>

      <div v-else-if="activeTab === 'people'" class="people-view">
        <div class="people-header">
          <h2>联系人</h2>
          <button class="btn-primary" @click="showStartDM = true">
            <i class="icon-plus"></i>
            开始私聊
          </button>
        </div>

        <div class="people-content">
          <div v-if="directMessages.length === 0" class="empty-state">
            <i class="icon-people-empty"></i>
            <h3>还没有私聊</h3>
            <p>点击"开始私聊"与其他用户开始对话</p>
          </div>

          <div v-else class="dm-list">
            <div
              v-for="dm in directMessages"
              :key="dm.id"
              class="dm-item"
              :class="{ active: currentRoomId === dm.id }"
              @click="selectRoom(dm.id)"
            >
              <div class="dm-avatar">
                {{ getRoomInitials(dm.name) }}
              </div>
              <div class="dm-info">
                <div class="dm-name">{{ dm.name }}</div>
                <div class="dm-last-message">{{ dm.lastMessage || '开始对话...' }}</div>
              </div>
              <div class="dm-meta">
                <div class="dm-time">{{ formatTime(dm.lastActivity) }}</div>
                <div v-if="dm.unreadCount > 0" class="unread-badge">{{ dm.unreadCount }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧聊天区域 -->
    <div class="chat-panel">
      <div v-if="!currentRoomId" class="no-chat-selected">
        <div class="welcome-chat">
          <i class="icon-message-large"></i>
          <h2>选择一个对话</h2>
          <p>从左侧选择一个房间或联系人开始聊天</p>
        </div>
      </div>

      <div v-else class="active-chat">
        <MatrixMessageAreaSimple />
      </div>
    </div>

    <!-- 创建房间对话框 -->
    <div v-if="showCreateRoom" class="modal-overlay" @click="showCreateRoom = false">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>创建房间</h3>
          <button class="btn-close" @click="showCreateRoom = false">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>房间名称</label>
            <input type="text" v-model="newRoomName" placeholder="输入房间名称" />
          </div>
          <div class="form-group">
            <label>
              <input type="checkbox" v-model="newRoomPublic" />
              公开房间
            </label>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showCreateRoom = false">取消</button>
          <button class="btn btn-primary" @click="createRoom" :disabled="!newRoomName.trim()">创建</button>
        </div>
      </div>
    </div>

    <!-- 开始私聊模态框 - Element风格 -->
    <div v-if="showStartDM" class="modal-overlay" @click="showStartDM = false">
      <div class="modal element-style" @click.stop>
        <div class="modal-header">
          <h3>私聊</h3>
          <button class="btn-close" @click="showStartDM = false">&times;</button>
        </div>
        <div class="modal-body">
          <p class="modal-description">
            使用其他人的名称、电子邮件地址或者其用户名来开始对话 (如 <span class="user-id-example">@jianluo:matrix.org</span>)。
          </p>

          <div class="form-group">
            <input
              type="text"
              v-model="dmUserId"
              placeholder="输入用户ID"
              class="user-input"
              @keyup.enter="startDirectMessage"
            />
          </div>

          <div class="dm-tips">
            <p>出于隐私考虑，部分搜索可能会被隐藏。</p>
            <p>如果您无法找到某个人，请询问他们的完整用户名或者让他们邀请您。</p>
          </div>

          <div class="server-suggestion">
            <p>或者选择建议服务器</p>
            <div class="server-link">
              <a href="https://matrix.to/#/@jianluo:matrix.org" target="_blank">
                https://matrix.to/#/@jianluo:matrix.org
              </a>
              <button class="copy-btn" @click="copyToClipboard('https://matrix.to/#/@jianluo:matrix.org')" title="复制">
                <i class="icon-copy"></i>
              </button>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showStartDM = false">取消</button>
          <button class="btn btn-primary" @click="startDirectMessage" :disabled="!dmUserId.trim()">前往</button>
        </div>
      </div>
    </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useMatrixStore } from '@/stores/matrix'
import MatrixRealLogin from './MatrixRealLogin.vue'
import MatrixMessageAreaSimple from './MatrixMessageAreaSimple.vue'
import PublicRoomsExplorer from './PublicRoomsExplorer.vue'

const matrixStore = useMatrixStore()

// 状态管理
const activeTab = ref('home')
const roomSearchQuery = ref('')
const showCreateRoom = ref(false)
const showJoinRoom = ref(false)
const showSettings = ref(false)
const showStartDM = ref(false)
const newRoomName = ref('')
const newRoomPublic = ref(false)
const dmUserId = ref('')

// 计算属性
const currentRoomId = computed(() => matrixStore.currentRoomId)
const filteredRooms = computed(() => {
  if (!roomSearchQuery.value) return matrixStore.rooms
  return matrixStore.rooms.filter(room => 
    room.name.toLowerCase().includes(roomSearchQuery.value.toLowerCase())
  )
})

const totalUnreadCount = computed(() => {
  return matrixStore.rooms.reduce((total, room) => total + (room.unreadCount || 0), 0)
})

const directMessages = computed(() => {
  return matrixStore.rooms.filter(room => room.type === 'private' && room.name.includes('@'))
})

// 方法
const handleLoginSuccess = async (loginInfo: { userId: string; homeserver: string }) => {
  console.log('Matrix login successful:', loginInfo)

  try {
    // Matrix客户端已经在MatrixRealLogin组件中启动
    // 这里只需要等待同步完成并获取房间列表
    await matrixStore.startSync()

    // 默认选择第一个可用房间
    const rooms = matrixStore.rooms
    if (rooms.length > 0) {
      matrixStore.setCurrentRoom(rooms[0].id)
    }
  } catch (error) {
    console.error('Failed to initialize Matrix client:', error)
  }
}

const selectRoom = (roomId: string) => {
  matrixStore.setCurrentRoom(roomId)
}

const createRoom = async () => {
  if (!newRoomName.value.trim()) return
  
  try {
    await matrixStore.createMatrixRoom(newRoomName.value.trim(), newRoomPublic.value)
    showCreateRoom.value = false
    newRoomName.value = ''
    newRoomPublic.value = false
  } catch (error) {
    console.error('Failed to create room:', error)
  }
}

const getUserInitials = (name: string) => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

const getRoomInitials = (name: string) => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

const formatTime = (timestamp: number) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}

// 房间加入处理
const handleRoomJoined = (roomId: string) => {
  console.log('房间已加入:', roomId)
  // 切换到房间标签页并选择新加入的房间
  activeTab.value = 'rooms'
  matrixStore.setCurrentRoom(roomId)
}

// 复制到剪贴板
const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    console.log('已复制到剪贴板:', text)
  } catch (error) {
    console.error('复制失败:', error)
  }
}

// 开始私聊
const startDirectMessage = async () => {
  if (!dmUserId.value.trim()) return

  try {
    // 创建或获取私聊房间
    const dmRoom = {
      id: `dm_${dmUserId.value}`,
      name: dmUserId.value,
      alias: dmUserId.value,
      topic: `与 ${dmUserId.value} 的私聊`,
      type: 'private' as const,
      isPublic: false,
      memberCount: 2,
      members: [matrixStore.currentUser?.username || '', dmUserId.value],
      unreadCount: 0,
      encrypted: false,
      joinRule: 'invite',
      historyVisibility: 'invited',
      avatarUrl: undefined,
      lastActivity: Date.now(),
      lastMessage: undefined
    }

    // 添加到房间列表
    matrixStore.addRoom(dmRoom)

    // 切换到联系人标签页并选择新的私聊
    activeTab.value = 'people'
    matrixStore.setCurrentRoom(dmRoom.id)

    // 关闭模态框并清空输入
    showStartDM.value = false
    dmUserId.value = ''

    console.log('私聊已创建:', dmRoom.id)
  } catch (error) {
    console.error('创建私聊失败:', error)
  }
}

onMounted(() => {
  // 初始化Matrix状态
  matrixStore.initializeMatrix()
})
</script>

<style scoped>
.element-layout {
  display: flex;
  height: 100vh;
  background: #0a0a0a;
  font-family: 'Courier New', 'Monaco', monospace;
  color: #00ff41;
}

/* 中间面板 */
.middle-panel {
  width: 320px;
  background: #001100;
  border-right: 2px solid #00ff41;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 聊天面板 */
.chat-panel {
  flex: 1;
  background: #000800;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.no-chat-selected {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.welcome-chat {
  text-align: center;
  color: #00cc33;
}

.welcome-chat i {
  font-size: 48px;
  margin-bottom: 16px;
  display: block;
}

.welcome-chat h2 {
  color: #00ff41;
  margin-bottom: 8px;
  text-shadow: 0 0 5px #00ff41;
}

.welcome-chat p {
  color: #00cc33;
  font-size: 14px;
}

.active-chat {
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* 左侧边栏 - 保持复古绿色主题 */
.sidebar {
  width: 68px;
  background: #001100;
  display: flex;
  flex-direction: column;
  border-right: 2px solid #00ff41;
  box-shadow: 0 0 10px rgba(0, 255, 65, 0.3);
}

.sidebar-header {
  padding: 16px 8px;
  border-bottom: 2px solid #00ff41;
}

.app-logo {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 16px;
}

.logo-icon {
  width: 40px;
  height: 40px;
  background: #003300;
  border: 2px solid #00ff41;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #00ff41;
  font-weight: bold;
  font-size: 18px;
  text-shadow: 0 0 5px #00ff41;
}

.app-name {
  font-size: 8px;
  color: #00ff41;
  margin-top: 4px;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.user-info {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.user-avatar {
  width: 32px;
  height: 32px;
  background: #003300;
  border: 1px solid #00ff41;
  border-radius: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #00ff41;
  font-size: 12px;
  font-weight: 500;
}

.username {
  font-size: 8px;
  color: #00ff41;
  margin-top: 4px;
  text-align: center;
  max-width: 60px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-transform: uppercase;
}

.sidebar-nav {
  flex: 1;
  padding: 16px 8px;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 8px;
  margin-bottom: 8px;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
}

.nav-item:hover {
  background: #002200;
  border-color: #00ff41;
  box-shadow: 0 0 5px rgba(0, 255, 65, 0.3);
}

.nav-item.active {
  background: #003300;
  border-color: #00ff41;
  box-shadow: 0 0 10px rgba(0, 255, 65, 0.5);
}

.nav-item i {
  font-size: 20px;
  color: #00aa22;
  margin-bottom: 4px;
}

.nav-item.active i {
  color: #00ff41;
  text-shadow: 0 0 5px #00ff41;
}

.nav-item span {
  font-size: 8px;
  color: #00aa22;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.nav-item.active span {
  color: #00ff41;
  text-shadow: 0 0 3px #00ff41;
}

.badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: #ff0000;
  color: #ffffff;
  border: 1px solid #ff4444;
  border-radius: 2px;
  padding: 2px 6px;
  font-size: 8px;
  min-width: 16px;
  text-align: center;
  box-shadow: 0 0 5px rgba(255, 0, 0, 0.5);
}

.sidebar-footer {
  padding: 16px 8px;
  border-top: 1px solid #4a5568;
}

.settings-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.settings-btn:hover {
  background: #4a5568;
}

.settings-btn i {
  font-size: 18px;
  color: #a0aec0;
}

/* 房间列表 - 复古绿色主题 */
.room-list {
  width: 320px;
  background: #001a00;
  border-right: 2px solid #00ff41;
  display: flex;
  flex-direction: column;
  box-shadow: 0 0 10px rgba(0, 255, 65, 0.2);
}

.room-list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 2px solid #00ff41;
  background: #002200;
}

.room-list-header h2 {
  margin: 0;
  font-size: 16px;
  font-weight: bold;
  color: #00ff41;
  text-transform: uppercase;
  letter-spacing: 2px;
  text-shadow: 0 0 5px #00ff41;
}

.room-actions {
  display: flex;
  gap: 8px;
}

.btn-icon {
  width: 32px;
  height: 32px;
  border: 1px solid #00ff41;
  background: #003300;
  border-radius: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-icon:hover {
  background: #004400;
  box-shadow: 0 0 5px rgba(0, 255, 65, 0.5);
}

.btn-icon i {
  font-size: 14px;
  color: #00ff41;
}

.room-search {
  padding: 16px 20px;
  border-bottom: 1px solid #00ff41;
  background: #002200;
}

.search-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #00ff41;
  border-radius: 2px;
  font-size: 14px;
  background: #001100;
  color: #00ff41;
  outline: none;
  transition: all 0.3s;
  font-family: 'Courier New', monospace;
}

.search-input:focus {
  border-color: #00ff41;
  box-shadow: 0 0 5px rgba(0, 255, 65, 0.5);
}

.search-input::placeholder {
  color: #00aa22;
}

.rooms-container {
  flex: 1;
  overflow-y: auto;
}

.room-item {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  cursor: pointer;
  transition: all 0.3s;
  border-bottom: 1px solid #003300;
  border-left: 3px solid transparent;
}

.room-item:hover {
  background: #002200;
  border-left-color: #00aa22;
  box-shadow: inset 0 0 10px rgba(0, 255, 65, 0.1);
}

.room-item.active {
  background: #003300;
  border-left-color: #00ff41;
  box-shadow: inset 0 0 15px rgba(0, 255, 65, 0.2);
}

.room-avatar {
  width: 40px;
  height: 40px;
  border: 1px solid #00ff41;
  border-radius: 2px;
  margin-right: 12px;
  overflow: hidden;
  flex-shrink: 0;
}

.room-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: sepia(100%) hue-rotate(90deg) saturate(200%);
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  background: #003300;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #00ff41;
  font-weight: bold;
  font-size: 14px;
  text-shadow: 0 0 3px #00ff41;
}

.world-avatar {
  background: #004400;
  display: flex;
  align-items: center;
  justify-content: center;
  border-color: #00ff41;
}

.world-avatar i {
  font-size: 20px;
  color: #00ff41;
  text-shadow: 0 0 5px #00ff41;
}

.room-info {
  flex: 1;
  min-width: 0;
}

.room-name {
  font-weight: bold;
  color: #00ff41;
  margin-bottom: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-shadow: 0 0 3px #00ff41;
  font-family: 'Courier New', monospace;
}

.room-preview {
  font-size: 12px;
  color: #00aa22;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-family: 'Courier New', monospace;
}

.room-preview.empty {
  font-style: italic;
  color: #006600;
}

.room-preview .sender {
  font-weight: bold;
  color: #00cc33;
}

.room-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.room-time {
  font-size: 10px;
  color: #00aa22;
  font-family: 'Courier New', monospace;
}

.unread-badge {
  background: #ff0000;
  color: #ffffff;
  border: 1px solid #ff4444;
  border-radius: 2px;
  padding: 2px 6px;
  font-size: 10px;
  min-width: 18px;
  text-align: center;
  box-shadow: 0 0 5px rgba(255, 0, 0, 0.5);
  font-family: 'Courier New', monospace;
}

/* 主内容区域 - 复古风格 */
.main-content {
  flex: 1;
  background: #001100;
  display: flex;
  flex-direction: column;
  border-left: 1px solid #00ff41;
}

.home-view {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.welcome-section {
  text-align: center;
  max-width: 600px;
}

.welcome-section h1 {
  font-size: 28px;
  font-weight: bold;
  color: #00ff41;
  margin-bottom: 16px;
  text-shadow: 0 0 10px #00ff41;
  font-family: 'Courier New', monospace;
  text-transform: uppercase;
  letter-spacing: 3px;
}

.welcome-section p {
  font-size: 14px;
  color: #00aa22;
  margin-bottom: 40px;
  font-family: 'Courier New', monospace;
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 24px;
}

.action-card {
  padding: 24px;
  border: 2px solid #00ff41;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
  text-align: center;
  background: #002200;
}

.action-card:hover {
  border-color: #00ff41;
  box-shadow: 0 0 15px rgba(0, 255, 65, 0.3);
  transform: translateY(-2px);
  background: #003300;
}

.action-card i {
  font-size: 32px;
  color: #00ff41;
  margin-bottom: 16px;
  text-shadow: 0 0 5px #00ff41;
}

.action-card h3 {
  font-size: 16px;
  font-weight: bold;
  color: #00ff41;
  margin-bottom: 8px;
  font-family: 'Courier New', monospace;
  text-transform: uppercase;
}

.action-card p {
  font-size: 12px;
  color: #00aa22;
  margin: 0;
  font-family: 'Courier New', monospace;
}

.chat-view {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.no-room-selected {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-state {
  text-align: center;
  color: #00aa22;
}

.empty-state i {
  font-size: 48px;
  color: #006600;
  margin-bottom: 16px;
}

.empty-state h3 {
  font-size: 18px;
  font-weight: bold;
  color: #00ff41;
  margin-bottom: 8px;
  font-family: 'Courier New', monospace;
  text-transform: uppercase;
}

.empty-state p {
  font-size: 14px;
  margin: 0;
  font-family: 'Courier New', monospace;
}

.explore-view,
.people-view {
  flex: 1;
  overflow: hidden;
}

/* 模态框 - 复古风格 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: #001100;
  border: 2px solid #00ff41;
  border-radius: 4px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 0 20px rgba(0, 255, 65, 0.5);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #00ff41;
  background: #002200;
}

.modal-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: bold;
  color: #00ff41;
  font-family: 'Courier New', monospace;
  text-transform: uppercase;
  text-shadow: 0 0 5px #00ff41;
}

.btn-close {
  background: none;
  border: none;
  font-size: 20px;
  color: #00ff41;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-close:hover {
  color: #ffffff;
  text-shadow: 0 0 5px #00ff41;
}

.modal-body {
  padding: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-weight: bold;
  color: #00ff41;
  margin-bottom: 8px;
  font-size: 12px;
  font-family: 'Courier New', monospace;
  text-transform: uppercase;
}

.form-group input[type="text"] {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #00ff41;
  border-radius: 2px;
  font-size: 14px;
  background: #002200;
  color: #00ff41;
  outline: none;
  transition: all 0.3s;
  font-family: 'Courier New', monospace;
}

.form-group input[type="text"]:focus {
  border-color: #00ff41;
  box-shadow: 0 0 5px rgba(0, 255, 65, 0.5);
}

.form-group input[type="checkbox"] {
  margin-right: 8px;
  accent-color: #00ff41;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid #00ff41;
  background: #002200;
}

.btn {
  padding: 8px 16px;
  border-radius: 2px;
  font-size: 12px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
  border: 1px solid #00ff41;
  font-family: 'Courier New', monospace;
  text-transform: uppercase;
}

.btn-secondary {
  background: #003300;
  color: #00ff41;
}

.btn-secondary:hover {
  background: #004400;
  box-shadow: 0 0 5px rgba(0, 255, 65, 0.3);
}

.btn-primary {
  background: #00ff41;
  color: #000000;
}

.btn-primary:hover {
  background: #00cc33;
  box-shadow: 0 0 10px rgba(0, 255, 65, 0.5);
}

.btn-primary:disabled {
  background: #006600;
  color: #003300;
  cursor: not-allowed;
  box-shadow: none;
}

/* 图标字体 */
.icon-home::before { content: "🏠"; }
.icon-rooms::before { content: "💬"; }
.icon-people::before { content: "👥"; }
.icon-explore::before { content: "🔍"; }
.icon-settings::before { content: "⚙️"; }
.icon-plus::before { content: "+"; }
.icon-join::before { content: "↗️"; }
.icon-world::before { content: "🌍"; }
.icon-plus-circle::before { content: "➕"; }
.icon-chat-empty::before { content: "💭"; }
.icon-people-empty::before { content: "👤"; }
.icon-message::before { content: "💬"; }
.icon-copy::before { content: "📋"; }
.icon-message-large::before { content: "💬"; }

/* Element风格的私聊对话框 */
.modal.element-style {
  max-width: 500px;
  width: 90%;
}

.modal-description {
  color: #00cc33;
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 20px;
}

.user-id-example {
  color: #00ff41;
  font-weight: bold;
  background: rgba(0, 255, 65, 0.1);
  padding: 2px 4px;
  border-radius: 2px;
}

.user-input {
  width: 100%;
  padding: 12px;
  background: rgba(0, 51, 0, 0.3);
  border: 1px solid #00ff41;
  color: #00ff41;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  border-radius: 2px;
  outline: none;
  transition: all 0.3s;
}

.user-input:focus {
  border-color: #00ff41;
  box-shadow: 0 0 10px rgba(0, 255, 65, 0.3);
  background: rgba(0, 51, 0, 0.5);
}

.dm-tips {
  margin: 20px 0;
  padding: 15px;
  background: rgba(0, 51, 0, 0.2);
  border: 1px solid rgba(0, 255, 65, 0.3);
  border-radius: 2px;
}

.dm-tips p {
  color: #00cc33;
  font-size: 12px;
  line-height: 1.4;
  margin: 5px 0;
}

.server-suggestion {
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px solid rgba(0, 255, 65, 0.2);
}

.server-suggestion p {
  color: #00cc33;
  font-size: 12px;
  margin-bottom: 10px;
}

.server-link {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px;
  background: rgba(0, 51, 0, 0.2);
  border: 1px solid rgba(0, 255, 65, 0.3);
  border-radius: 2px;
}

.server-link a {
  color: #00ff41;
  text-decoration: none;
  font-size: 12px;
  flex: 1;
}

.server-link a:hover {
  text-decoration: underline;
}

.copy-btn {
  background: transparent;
  border: 1px solid #00ff41;
  color: #00ff41;
  padding: 4px 8px;
  border-radius: 2px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.3s;
}

.copy-btn:hover {
  background: rgba(0, 255, 65, 0.1);
  box-shadow: 0 0 5px rgba(0, 255, 65, 0.3);
}
</style>
