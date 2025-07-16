<template>
  <div class="wechat-layout">
    <!-- 微信风格左侧导航栏 -->
    <div class="wechat-sidebar">
      <div class="sidebar-header">
        <!-- 用户头像 -->
        <div class="user-avatar-nav">
          <div class="avatar-placeholder-nav">
            {{ getUserInitials(matrixStore.userInfo?.displayName || matrixStore.userInfo?.userId || 'U') }}
          </div>
        </div>
      </div>

      <div class="sidebar-nav">
        <!-- 聊天图标 -->
        <div
          class="nav-item"
          :class="{ active: activeNav === 'chat' }"
          title="聊天"
          @click="setActiveNav('chat')"
        >
          <span class="nav-icon">💬</span>
        </div>

        <!-- 通讯录图标 -->
        <div
          class="nav-item"
          :class="{ active: activeNav === 'contacts' }"
          title="通讯录"
          @click="setActiveNav('contacts')"
        >
          <span class="nav-icon">👥</span>
        </div>

        <!-- 收藏图标 -->
        <div
          class="nav-item"
          :class="{ active: activeNav === 'favorites' }"
          title="收藏"
          @click="setActiveNav('favorites')"
        >
          <span class="nav-icon">⭐</span>
        </div>

        <!-- 文件传输助手 -->
        <div
          class="nav-item"
          :class="{ active: activeNav === 'files' }"
          title="文件传输助手"
          @click="setActiveNav('files')"
        >
          <span class="nav-icon">📁</span>
        </div>
      </div>

      <div class="sidebar-footer">
        <!-- 设置图标 -->
        <div class="nav-item" title="设置">
          <span class="nav-icon">⚙️</span>
        </div>
      </div>
    </div>

    <!-- 左侧聊天列表 -->
    <div class="chat-list-panel">
      <!-- 顶部工具栏 -->
      <div class="chat-list-header">
        <div class="user-info" v-if="matrixStore.currentUser">
          <div class="user-avatar">
            {{ getUserInitials(matrixStore.currentUser.displayName || matrixStore.currentUser.username) }}
          </div>
          <span class="username">{{ matrixStore.currentUser.displayName || matrixStore.currentUser.username }}</span>
        </div>
        <div class="header-actions">
          <button class="action-btn" @click="startDirectMessage" title="发起聊天">
            💬
          </button>
          <button class="action-btn" @click="createGroupChat" title="创建群聊">
            👥
          </button>
          <button class="action-btn" @click="toggleExplore" title="探索">
            🔍
          </button>
        </div>
      </div>

      <!-- 搜索框 -->
      <div class="search-container">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input
            type="text"
            v-model="roomSearchQuery"
            placeholder="搜索"
            class="search-input"
          />
        </div>
      </div>

      <!-- 聊天列表 -->
      <div class="chat-list">
        <div v-if="filteredRooms.length === 0" class="empty-chat-list">
          <div class="empty-message">暂无聊天</div>
        </div>

        <div
          v-for="room in filteredRooms"
          :key="room.id"
          class="chat-item"
          :class="{ active: currentRoomId === room.id }"
          @click="selectRoom(room.id)"
        >
          <div class="chat-avatar">
            {{ getRoomInitials(room.name) }}
          </div>
          <div class="chat-content">
            <div class="chat-header">
              <span class="chat-name">{{ room.name }}</span>
              <span class="chat-time" v-if="room.lastEventTimestamp">
                {{ formatTime(room.lastEventTimestamp) }}
              </span>
            </div>
            <div class="chat-preview">
              <span class="last-message">{{ room.lastMessage || '暂无消息' }}</span>
              <div class="chat-badges">
                <span class="unread-count" v-if="room.unreadCount > 0">{{ room.unreadCount }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部退出按钮 -->
      <div class="chat-list-footer">
        <button
          class="logout-btn"
          @click="handleLogout"
          title="退出登录"
        >
          <span class="logout-icon">🚪</span>
          <span class="logout-text">退出</span>
        </button>
      </div>
    </div>

    <!-- 右侧聊天面板 -->
    <div class="chat-panel">
      <div v-if="!currentRoomId" class="no-chat-selected">
        <div class="welcome-chat">
          <div class="icon-message-large">💬</div>
          <h2>选择一个对话</h2>
          <p>从左侧选择一个聊天开始对话</p>
        </div>
      </div>
      
      <div v-else class="active-chat">
        <MatrixMessageAreaSimple :room-id="currentRoomId" />
      </div>
    </div>

    <!-- 探索面板 -->
    <div v-if="showExplore" class="explore-panel">
      <div class="explore-header">
        <h3>探索公共房间</h3>
        <button class="close-btn" @click="showExplore = false">×</button>
      </div>
      <div class="explore-content">
        <div class="search-bar">
          <input
            type="text"
            v-model="publicRoomSearchQuery"
            placeholder="搜索公共房间..."
            class="search-input"
          />
        </div>
        <div class="public-rooms-list">
          <!-- 加载状态 -->
          <div v-if="isLoadingPublicRooms" class="loading-state">
            <div class="loading-spinner"></div>
            <p>正在加载公共房间...</p>
          </div>

          <!-- 房间列表 -->
          <div v-else-if="filteredPublicRooms.length > 0">
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
                <div class="room-topic">{{ room.topic || '无描述' }}</div>
                <div class="room-members">{{ room.num_joined_members || 0 }} 成员</div>
              </div>
              <div class="room-actions">
                <button class="join-btn" @click="joinPublicRoom(room.room_id)">
                  加入
                </button>
              </div>
            </div>
          </div>

          <!-- 空状态 -->
          <div v-else class="empty-state">
            <div class="empty-icon">🏠</div>
            <p>没有找到公共房间</p>
            <button class="retry-btn" @click="loadPublicRooms">重新加载</button>
          </div>
        </div>
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
import { useRouter } from 'vue-router'
import { useMatrixStore } from '@/stores/matrix'
import MatrixMessageAreaSimple from './MatrixMessageAreaSimple.vue'
import StartDirectMessageDialog from './StartDirectMessageDialog.vue'
import CreateGroupChatDialog from './CreateGroupChatDialog.vue'

const matrixStore = useMatrixStore()
const router = useRouter()

// 响应式数据
const currentRoomId = ref<string>('')
const activeNav = ref<string>('chat')
const roomSearchQuery = ref('')
const publicRoomSearchQuery = ref('')
const showStartDM = ref(false)
const showCreateGroup = ref(false)
const showExplore = ref(false)
const publicRooms = ref<any[]>([])
const isLoadingPublicRooms = ref(false)

// 模拟数据（用于演示）
const mockRooms = ref([
  {
    id: '1',
    name: '老金的知识分享 3 群',
    lastMessage: '适法用Claude code',
    lastEventTimestamp: Date.now() - 1000 * 60 * 5, // 5分钟前
    unreadCount: 3
  },
  {
    id: '2',
    name: '订阅号',
    lastMessage: '管理员发送了一条消息',
    lastEventTimestamp: Date.now() - 1000 * 60 * 30, // 30分钟前
    unreadCount: 0
  },
  {
    id: '3',
    name: '文件传输助手',
    lastMessage: '你们起来大家都程序吧',
    lastEventTimestamp: Date.now() - 1000 * 60 * 60 * 2, // 2小时前
    unreadCount: 0
  },
  {
    id: '4',
    name: '老金的知识分享 3 群',
    lastMessage: '@Colin 还有自力群?',
    lastEventTimestamp: Date.now() - 1000 * 60 * 60 * 5, // 5小时前
    unreadCount: 1
  },
  {
    id: '5',
    name: '哈哈咨询顾问',
    lastMessage: '2024年第7期1期间中期之...',
    lastEventTimestamp: Date.now() - 1000 * 60 * 60 * 24, // 1天前
    unreadCount: 0
  }
])

// 计算属性
const filteredRooms = computed(() => {
  const rooms = matrixStore.rooms?.length > 0 ? matrixStore.rooms : mockRooms.value
  if (!roomSearchQuery.value) return rooms
  return rooms.filter(room =>
    room.name.toLowerCase().includes(roomSearchQuery.value.toLowerCase())
  )
})

const filteredPublicRooms = computed(() => {
  if (!publicRoomSearchQuery.value) return publicRooms.value
  return publicRooms.value.filter(room =>
    (room.name || '').toLowerCase().includes(publicRoomSearchQuery.value.toLowerCase()) ||
    (room.topic || '').toLowerCase().includes(publicRoomSearchQuery.value.toLowerCase())
  )
})

// 方法
const setActiveNav = (nav: string) => {
  activeNav.value = nav
  console.log('切换到导航:', nav)
}

const handleLogout = () => {
  console.log('退出按钮被点击了')
  try {
    console.log('开始清除Matrix状态...')
    // 清除Matrix存储状态
    matrixStore.logout()
    console.log('Matrix状态已清除')

    console.log('准备跳转到登录页面...')
    // 跳转到登录页面
    router.push('/login')
    console.log('路由跳转命令已发送')
  } catch (error) {
    console.error('退出过程中发生错误:', error)
    // 强制跳转
    window.location.href = '/login'
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
  
  if (diff < 24 * 60 * 60 * 1000) {
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  } else {
    return date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })
  }
}

const selectRoom = (roomId: string) => {
  currentRoomId.value = roomId
}

const startDirectMessage = () => {
  showStartDM.value = true
}

const createGroupChat = () => {
  showCreateGroup.value = true
}

const handleStartDM = (userId: string) => {
  // 处理开始私聊逻辑
  showStartDM.value = false
}

const handleCreateGroup = (groupData: any) => {
  // 处理创建群聊逻辑
  showCreateGroup.value = false
}

// 切换探索面板
const toggleExplore = async () => {
  showExplore.value = !showExplore.value

  // 如果打开探索面板且还没有加载公共房间，则加载
  if (showExplore.value && publicRooms.value.length === 0) {
    await loadPublicRooms()
  }
}

// 加载公共房间
const loadPublicRooms = async () => {
  if (!matrixStore.matrixClient) {
    console.error('Matrix客户端未初始化')
    return
  }

  isLoadingPublicRooms.value = true
  try {
    console.log('开始加载公共房间...')
    const response = await matrixStore.matrixClient.publicRooms({
      limit: 50,
      server: 'matrix.org'
    })

    publicRooms.value = response.chunk || []
    console.log(`加载了 ${publicRooms.value.length} 个公共房间`)
  } catch (error) {
    console.error('加载公共房间失败:', error)
    // 如果失败，尝试其他服务器
    try {
      const response = await matrixStore.matrixClient.publicRooms({
        limit: 50,
        server: 'mozilla.org'
      })
      publicRooms.value = response.chunk || []
      console.log(`从mozilla.org加载了 ${publicRooms.value.length} 个公共房间`)
    } catch (fallbackError) {
      console.error('从备用服务器加载公共房间也失败:', fallbackError)
    }
  } finally {
    isLoadingPublicRooms.value = false
  }
}

const joinPublicRoom = async (roomId: string) => {
  if (!matrixStore.matrixClient) {
    console.error('Matrix客户端未初始化')
    return
  }

  try {
    console.log('尝试加入房间:', roomId)

    // 找到要加入的房间信息
    const roomToJoin = publicRooms.value.find(room => room.room_id === roomId)

    await matrixStore.matrixClient.joinRoom(roomId)
    console.log('成功加入房间:', roomId)

    // 将加入的房间添加到本地房间列表
    if (roomToJoin) {
      const newRoom: any = {
        id: roomToJoin.room_id,
        name: roomToJoin.name || roomToJoin.canonical_alias || roomToJoin.room_id,
        alias: roomToJoin.canonical_alias,
        topic: roomToJoin.topic,
        type: 'public' as const,
        isPublic: roomToJoin.world_readable || true,
        memberCount: roomToJoin.num_joined_members || 0,
        members: [],
        unreadCount: 0,
        encrypted: false,
        joinRule: 'public',
        historyVisibility: 'shared',
        avatarUrl: roomToJoin.avatar_url ? matrixStore.matrixClient.mxcUrlToHttp(roomToJoin.avatar_url) : undefined,
        lastActivity: Date.now()
      }

      // 添加到 Matrix store 的房间列表
      matrixStore.addRoom(newRoom)
      console.log(`✅ 房间 "${newRoom.name}" 已添加到房间列表`)

      // 选择新加入的房间
      selectRoom(newRoom.id)
    }

    // 关闭探索面板
    showExplore.value = false

  } catch (error: any) {
    console.error('加入房间失败:', error)
    alert('加入房间失败: ' + (error?.message || '未知错误'))
  }
}

onMounted(() => {
  // 初始化逻辑
})
</script>

<style scoped>
.wechat-layout {
  display: flex;
  height: 100vh;
  background: linear-gradient(135deg, #2d5a27 0%, #3d6b35 100%);
  font-family: 'Microsoft YaHei', sans-serif;
}

/* 微信风格左侧导航栏 */
.wechat-sidebar {
  width: 60px;
  background: #2e2e2e;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 0;
  border-right: 1px solid #3a3a3a;
}

.sidebar-header {
  margin-bottom: 30px;
}

.user-avatar-nav {
  width: 40px;
  height: 40px;
  border-radius: 6px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s ease;
}

.user-avatar-nav:hover {
  transform: scale(1.05);
}

.avatar-placeholder-nav {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #66BB6A, #4CAF50);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 14px;
  font-weight: bold;
}

.sidebar-nav {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.sidebar-footer {
  margin-top: auto;
}

.nav-item {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.nav-item.active {
  background: rgba(255, 255, 255, 0.15);
}

.nav-item.active::after {
  content: '';
  position: absolute;
  left: -20px;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 20px;
  background: #07c160;
  border-radius: 0 2px 2px 0;
}

.nav-icon {
  font-size: 20px;
  filter: grayscale(1);
  opacity: 0.7;
  transition: all 0.2s ease;
}

.nav-item:hover .nav-icon,
.nav-item.active .nav-icon {
  filter: grayscale(0);
  opacity: 1;
}

/* 左侧聊天列表面板 */
.chat-list-panel {
  width: 300px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-right: 1px solid rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

/* 聊天列表头部 */
.chat-list-header {
  padding: 15px 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(45, 90, 39, 0.05);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-avatar {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #66BB6A, #4CAF50);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 14px;
  font-weight: bold;
}

.username {
  color: #2d5a27;
  font-size: 16px;
  font-weight: 600;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: rgba(45, 90, 39, 0.1);
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #2d5a27;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: rgba(45, 90, 39, 0.2);
}

/* 搜索框 */
.search-container {
  padding: 15px 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
  background: rgba(45, 90, 39, 0.05);
  border-radius: 8px;
  padding: 8px 12px;
}

.search-icon {
  margin-right: 8px;
  color: #999;
  font-size: 14px;
}

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  outline: none;
  font-size: 14px;
  color: #333;
}

.search-input::placeholder {
  color: #999;
}

/* 聊天列表 */
.chat-list {
  flex: 1;
  overflow-y: auto;
}

.empty-chat-list {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #999;
}

.chat-item {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  cursor: pointer;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  transition: background-color 0.2s ease;
}

.chat-item:hover {
  background: rgba(45, 90, 39, 0.05);
}

.chat-item.active {
  background: rgba(45, 90, 39, 0.1);
}

.chat-avatar {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #66BB6A, #4CAF50);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 16px;
  font-weight: bold;
  margin-right: 12px;
  flex-shrink: 0;
}

.chat-content {
  flex: 1;
  min-width: 0;
}

.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}

.chat-name {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chat-time {
  font-size: 12px;
  color: #999;
  flex-shrink: 0;
  margin-left: 8px;
}

.chat-preview {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.last-message {
  font-size: 13px;
  color: #666;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

.chat-badges {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: 8px;
}

.unread-count {
  background: #f44336;
  color: white;
  border-radius: 10px;
  padding: 2px 6px;
  font-size: 11px;
  min-width: 18px;
  text-align: center;
}

/* 右侧聊天面板 */
.chat-panel {
  flex: 1;
  background: rgba(255, 255, 255, 0.98);
  display: flex;
  flex-direction: column;
}

.no-chat-selected {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.welcome-chat {
  text-align: center;
  color: #666;
}

.welcome-chat .icon-message-large {
  font-size: 64px;
  margin-bottom: 20px;
  display: block;
}

.welcome-chat h2 {
  margin: 0 0 10px 0;
  color: #333;
  font-size: 24px;
  font-weight: 500;
}

.welcome-chat p {
  margin: 0;
  color: #999;
  font-size: 14px;
}

.active-chat {
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* 探索面板 */
.explore-panel {
  position: absolute;
  top: 0;
  right: 0;
  width: 400px;
  height: 100vh;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(10px);
  border-left: 1px solid rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  z-index: 1000;
}

.explore-header {
  padding: 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(45, 90, 39, 0.05);
}

.explore-header h3 {
  margin: 0;
  color: #2d5a27;
  font-size: 18px;
  font-weight: 600;
}

.close-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: rgba(45, 90, 39, 0.1);
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #2d5a27;
  font-size: 18px;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: rgba(45, 90, 39, 0.2);
}

.explore-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.search-bar {
  padding: 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.public-rooms-list {
  flex: 1;
  overflow-y: auto;
  padding: 10px 0;
}

.public-room-item {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  transition: background-color 0.2s ease;
}

.public-room-item:hover {
  background: rgba(45, 90, 39, 0.05);
}

/* 加载状态 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #666;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid rgba(45, 90, 39, 0.1);
  border-top: 3px solid #2d5a27;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #666;
  text-align: center;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.retry-btn {
  margin-top: 16px;
  padding: 8px 16px;
  background: #2d5a27;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.retry-btn:hover {
  background: #1e3d1a;
}

.public-room-item .room-avatar {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #66BB6A, #4CAF50);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 14px;
  font-weight: bold;
  margin-right: 12px;
  flex-shrink: 0;
}

.room-info {
  flex: 1;
  min-width: 0;
}

.room-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.room-topic {
  font-size: 12px;
  color: #666;
  margin-bottom: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.room-members {
  font-size: 11px;
  color: #999;
}

.room-actions {
  margin-left: 12px;
}

.join-btn {
  padding: 6px 12px;
  border: none;
  background: linear-gradient(135deg, #66BB6A, #4CAF50);
  color: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s ease;
}

.join-btn:hover {
  background: linear-gradient(135deg, #4CAF50, #45a049);
}

/* 底部退出按钮 */
.chat-list-footer {
  padding: 15px 20px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  background: rgba(45, 90, 39, 0.05);
  position: relative;
  z-index: 5;
}

.logout-btn {
  width: 100%;
  padding: 10px 15px;
  border: none;
  background: linear-gradient(135deg, #d32f2f, #c62828);
  color: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s ease;
  position: relative;
  z-index: 10;
}

.logout-btn:hover {
  background: linear-gradient(135deg, #c62828, #b71c1c);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(211, 47, 47, 0.3);
}

.logout-icon {
  font-size: 16px;
}

.logout-text {
  font-size: 14px;
}
</style>
