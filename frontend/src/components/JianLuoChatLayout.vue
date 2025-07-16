<template>
  <div class="jianluo-layout">
    <!-- 左侧导航栏 -->
    <div class="sidebar">
      <div class="sidebar-header">
        <div class="app-logo">
          <div class="logo-icon">J</div>
          <span class="app-name">JianLuoChat</span>
        </div>
        <div class="user-info" v-if="matrixStore.currentUser">
          <div class="user-avatar">
            {{ getUserInitials(matrixStore.currentUser.displayName || matrixStore.currentUser.username) }}
          </div>
          <span class="username">{{ matrixStore.currentUser.displayName || matrixStore.currentUser.username }}</span>
        </div>
      </div>

      <div class="sidebar-nav">
        <div class="nav-item" :class="{ active: activeView === 'home' }" @click="activeView = 'home'">
          <i class="icon-home"></i>
          <span>主页</span>
        </div>
        <div class="nav-item" :class="{ active: activeView === 'rooms' }" @click="activeView = 'rooms'">
          <i class="icon-rooms"></i>
          <span>房间</span>
          <span class="badge" v-if="totalUnreadCount > 0">{{ totalUnreadCount }}</span>
        </div>
        <div class="nav-item" :class="{ active: activeView === 'people' }" @click="activeView = 'people'">
          <i class="icon-people"></i>
          <span>联系人</span>
        </div>
        <div class="nav-item" :class="{ active: activeView === 'explore' }" @click="activeView = 'explore'">
          <i class="icon-explore"></i>
          <span>探索</span>
        </div>
      </div>
    </div>

    <!-- 中间面板 -->
    <div class="middle-panel">
      <!-- 主页视图 -->
      <div v-if="activeView === 'home'" class="home-view">
        <div class="welcome-section">
          <h1>欢迎使用 JianLuoChat</h1>
          <p>基于Matrix协议的现代化聊天应用</p>
          
          <div class="feature-cards">
            <div class="feature-card" @click="startDirectMessage">
              <i class="icon-message"></i>
              <h3>发送私聊</h3>
              <p>与其他用户开始一对一聊天</p>
            </div>
            
            <div class="feature-card" @click="activeView = 'explore'">
              <i class="icon-explore"></i>
              <h3>探索公共房间</h3>
              <p>发现和加入公共聊天房间</p>
            </div>
            
            <div class="feature-card" @click="createGroupChat">
              <i class="icon-group"></i>
              <h3>创建群聊</h3>
              <p>创建新的群聊房间</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 房间列表视图 -->
      <div v-else-if="activeView === 'rooms'" class="rooms-view">
        <div class="view-header">
          <h2>房间</h2>
          <button class="btn-primary" @click="createGroupChat">
            <i class="icon-plus"></i>
            创建房间
          </button>
        </div>
        
        <div class="search-bar">
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

      <!-- 联系人视图 -->
      <div v-else-if="activeView === 'people'" class="people-view">
        <div class="view-header">
          <h2>联系人</h2>
          <button class="btn-primary" @click="startDirectMessage">
            <i class="icon-plus"></i>
            开始私聊
          </button>
        </div>

        <div class="dm-list">
          <div v-if="directMessages.length === 0" class="empty-state">
            <i class="icon-people-empty"></i>
            <h3>还没有私聊</h3>
            <p>点击"开始私聊"与其他用户开始对话</p>
          </div>

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

      <!-- 探索视图 -->
      <div v-else-if="activeView === 'explore'" class="explore-view">
        <div class="view-header">
          <h2>探索公共房间</h2>
          <button class="btn-secondary" @click="refreshPublicRooms">
            <i class="icon-refresh"></i>
            刷新
          </button>
        </div>
        
        <div class="search-bar">
          <input
            type="text"
            v-model="publicRoomSearchQuery"
            placeholder="搜索公共房间..."
            class="search-input"
          />
        </div>

        <div class="public-rooms-list">
          <div v-if="filteredPublicRooms.length === 0" class="empty-state">
            <i class="icon-explore-empty"></i>
            <h3>没有找到公共房间</h3>
            <p>尝试搜索或刷新房间列表</p>
          </div>

          <div
            v-for="room in filteredPublicRooms"
            :key="room.room_id"
            class="public-room-item"
          >
            <div class="room-avatar">
              {{ getRoomInitials(room.name || room.canonical_alias || room.room_id) }}
            </div>
            <div class="room-info">
              <div class="room-name">{{ room.name || room.canonical_alias || room.room_id }}</div>
              <div class="room-topic">{{ room.topic || '没有描述' }}</div>
              <div class="room-members">{{ room.num_joined_members }} 成员</div>
            </div>
            <div class="room-actions">
              <button class="btn-primary" @click="joinPublicRoom(room.room_id)">
                加入
              </button>
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

    <!-- 开始私聊对话框 -->
    <StartDirectMessageDialog 
      v-if="showStartDM" 
      @close="showStartDM = false"
      @start-dm="handleStartDM"
    />

    <!-- 创建群聊对话框 -->
    <CreateGroupChatDialog 
      v-if="showCreateGroup" 
      @close="showCreateGroup = false"
      @create-group="handleCreateGroup"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useMatrixStore } from '@/stores/matrix'
import MatrixMessageAreaSimple from './MatrixMessageAreaSimple.vue'
import StartDirectMessageDialog from './StartDirectMessageDialog.vue'
import CreateGroupChatDialog from './CreateGroupChatDialog.vue'

const matrixStore = useMatrixStore()

// 响应式数据
const activeView = ref('home')
const currentRoomId = ref('')
const roomSearchQuery = ref('')
const publicRoomSearchQuery = ref('')
const showStartDM = ref(false)
const showCreateGroup = ref(false)
const publicRooms = ref([])

// 计算属性
const totalUnreadCount = computed(() => {
  return matrixStore.rooms.reduce((total, room) => total + (room.unreadCount || 0), 0)
})

const filteredRooms = computed(() => {
  if (!roomSearchQuery.value) return matrixStore.rooms
  return matrixStore.rooms.filter(room => 
    room.name.toLowerCase().includes(roomSearchQuery.value.toLowerCase())
  )
})

const directMessages = computed(() => {
  return matrixStore.rooms.filter(room => room.isDirect)
})

const filteredPublicRooms = computed(() => {
  if (!publicRoomSearchQuery.value) return publicRooms.value
  return publicRooms.value.filter(room => 
    (room.name || '').toLowerCase().includes(publicRoomSearchQuery.value.toLowerCase()) ||
    (room.topic || '').toLowerCase().includes(publicRoomSearchQuery.value.toLowerCase())
  )
})

// 方法
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

const selectRoom = (roomId: string) => {
  currentRoomId.value = roomId
  matrixStore.setCurrentRoom(roomId)
}

const startDirectMessage = () => {
  showStartDM.value = true
}

const createGroupChat = () => {
  showCreateGroup.value = true
}

const handleStartDM = async (userId: string) => {
  try {
    const dmRoom = await matrixStore.createDirectMessage(userId)
    selectRoom(dmRoom.id)
    activeView.value = 'people'
    showStartDM.value = false
  } catch (error) {
    console.error('Failed to start DM:', error)
  }
}

const handleCreateGroup = async (roomData: any) => {
  try {
    const room = await matrixStore.createRoom(roomData)
    selectRoom(room.id)
    activeView.value = 'rooms'
    showCreateGroup.value = false
  } catch (error) {
    console.error('Failed to create group:', error)
  }
}

const refreshPublicRooms = async () => {
  try {
    publicRooms.value = await matrixStore.getPublicRooms()
  } catch (error) {
    console.error('Failed to fetch public rooms:', error)
  }
}

const joinPublicRoom = async (roomId: string) => {
  try {
    await matrixStore.joinRoom(roomId)
    selectRoom(roomId)
    activeView.value = 'rooms'
  } catch (error) {
    console.error('Failed to join room:', error)
  }
}

onMounted(() => {
  refreshPublicRooms()
})
</script>

<style scoped>
/* 主布局 */
.jianluo-layout {
  display: flex;
  height: 100vh;
  background: #0a0a0a;
  font-family: 'Courier New', 'Monaco', monospace;
  color: #00ff41;
}

/* 左侧导航栏 */
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
  font-weight: bold;
  margin-bottom: 4px;
}

.username {
  font-size: 8px;
  color: #00cc33;
  text-align: center;
  max-width: 60px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sidebar-nav {
  flex: 1;
  padding: 16px 0;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 8px;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
}

.nav-item:hover {
  background: rgba(0, 255, 65, 0.1);
}

.nav-item.active {
  background: rgba(0, 255, 65, 0.2);
  box-shadow: inset 2px 0 0 #00ff41;
}

.nav-item i {
  font-size: 16px;
  margin-bottom: 4px;
}

.nav-item span {
  font-size: 8px;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: #ff4444;
  color: white;
  font-size: 8px;
  padding: 2px 4px;
  border-radius: 8px;
  min-width: 12px;
  text-align: center;
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

/* 主页视图 */
.home-view {
  padding: 20px;
  overflow-y: auto;
}

.welcome-section h1 {
  color: #00ff41;
  text-shadow: 0 0 10px #00ff41;
  margin-bottom: 8px;
  font-size: 24px;
}

.welcome-section p {
  color: #00cc33;
  margin-bottom: 30px;
  font-size: 14px;
}

.feature-cards {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.feature-card {
  padding: 20px;
  background: rgba(0, 51, 0, 0.2);
  border: 1px solid rgba(0, 255, 65, 0.3);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.feature-card:hover {
  background: rgba(0, 51, 0, 0.4);
  border-color: #00ff41;
  box-shadow: 0 0 10px rgba(0, 255, 65, 0.2);
}

.feature-card i {
  font-size: 24px;
  color: #00ff41;
  margin-bottom: 12px;
  display: block;
}

.feature-card h3 {
  color: #00ff41;
  margin: 0 0 8px 0;
  font-size: 16px;
}

.feature-card p {
  color: #00cc33;
  margin: 0;
  font-size: 12px;
  line-height: 1.4;
}

/* 视图头部 */
.view-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid rgba(0, 255, 65, 0.3);
}

.view-header h2 {
  color: #00ff41;
  margin: 0;
  text-shadow: 0 0 5px #00ff41;
}

/* 搜索栏 */
.search-bar {
  padding: 16px 20px;
  border-bottom: 1px solid rgba(0, 255, 65, 0.2);
}

.search-input {
  width: 100%;
  padding: 8px 12px;
  background: rgba(0, 51, 0, 0.3);
  border: 1px solid rgba(0, 255, 65, 0.5);
  color: #00ff41;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  border-radius: 2px;
  outline: none;
  transition: all 0.3s;
  box-sizing: border-box;
}

.search-input:focus {
  border-color: #00ff41;
  box-shadow: 0 0 5px rgba(0, 255, 65, 0.3);
}

/* 列表样式 */
.room-list, .dm-list, .public-rooms-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.room-item, .dm-item, .public-room-item {
  display: flex;
  align-items: center;
  padding: 12px;
  cursor: pointer;
  border-radius: 2px;
  transition: all 0.3s;
  margin-bottom: 4px;
}

.room-item:hover, .dm-item:hover, .public-room-item:hover {
  background: rgba(0, 255, 65, 0.1);
}

.room-item.active, .dm-item.active {
  background: rgba(0, 255, 65, 0.2);
  border-left: 3px solid #00ff41;
}

.room-avatar, .dm-avatar {
  width: 40px;
  height: 40px;
  background: #003300;
  border: 1px solid #00ff41;
  border-radius: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #00ff41;
  font-size: 14px;
  font-weight: bold;
  margin-right: 12px;
  flex-shrink: 0;
}

.room-info, .dm-info {
  flex: 1;
  min-width: 0;
}

.room-name, .dm-name {
  color: #00ff41;
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.room-last-message, .dm-last-message, .room-topic {
  color: #00cc33;
  font-size: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.room-meta, .dm-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.room-time, .dm-time {
  color: #00cc33;
  font-size: 10px;
}

.unread-badge {
  background: #ff4444;
  color: white;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 16px;
  text-align: center;
}

/* 公共房间特殊样式 */
.public-room-item {
  flex-direction: row;
  align-items: flex-start;
}

.public-room-item .room-info {
  flex: 1;
}

.room-members {
  color: #00cc33;
  font-size: 10px;
  margin-top: 4px;
}

.room-actions {
  margin-left: 12px;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
  color: #00cc33;
}

.empty-state i {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-state h3 {
  color: #00ff41;
  margin: 0 0 8px 0;
  font-size: 16px;
}

.empty-state p {
  margin: 0;
  font-size: 12px;
  line-height: 1.4;
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

/* 按钮样式 */
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

.btn-primary {
  background: #00ff41;
  color: #000000;
}

.btn-primary:hover {
  background: #00cc33;
  box-shadow: 0 0 10px rgba(0, 255, 65, 0.5);
}

.btn-secondary {
  background: #003300;
  color: #00ff41;
}

.btn-secondary:hover {
  background: #004400;
  box-shadow: 0 0 5px rgba(0, 255, 65, 0.3);
}

/* 图标字体 */
.icon-home::before { content: "🏠"; }
.icon-rooms::before { content: "💬"; }
.icon-people::before { content: "👥"; }
.icon-explore::before { content: "🔍"; }
.icon-message::before { content: "💬"; }
.icon-group::before { content: "👥"; }
.icon-plus::before { content: "+"; }
.icon-refresh::before { content: "🔄"; }
.icon-chat-empty::before { content: "💭"; }
.icon-people-empty::before { content: "👤"; }
.icon-explore-empty::before { content: "🔍"; }
.icon-message-large::before { content: "💬"; }
</style>
