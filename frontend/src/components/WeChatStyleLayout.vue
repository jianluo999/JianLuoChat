<template>
  <div class="wechat-layout">
    <!-- 微信风格左侧导航栏 -->
    <div class="wechat-sidebar">
      <div class="sidebar-header">
        <!-- 用户头像 -->
        <div class="user-avatar-nav">
          <div class="avatar-placeholder-nav">
            {{ getUserInitials(matrixStore.currentUser?.displayName || matrixStore.currentUser?.username || 'U') }}
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
          <!-- 主要操作按钮 -->
          <button class="action-btn primary" @click="startDirectMessage" title="发起聊天">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
            </svg>
          </button>
          <button class="action-btn primary" @click="createGroupChat" title="创建群聊">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zM4 18v-1c0-2.66 5.33-4 8-4s8 1.34 8 4v1H4zM12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z"/>
            </svg>
          </button>
          <button class="action-btn primary" @click="showJoinRoomDialog" title="加入房间">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
            </svg>
          </button>

          <!-- 更多操作菜单 -->
          <div class="more-actions" ref="moreActionsRef">
            <button
              class="action-btn more-btn"
              @click="toggleMoreMenu"
              title="更多操作"
              :class="{ active: showMoreMenu }"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
              </svg>
            </button>
            <div v-if="showMoreMenu" class="more-menu">
              <button class="menu-item" @click="toggleExplore">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                </svg>
                探索房间
              </button>
              <button class="menu-item" @click="refreshRooms">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
                </svg>
                刷新房间
              </button>
              <div class="menu-divider"></div>
              <button class="menu-item" @click="debugMatrixClient">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20 8h-2.81c-.45-.78-1.07-1.45-1.82-1.96L17 4.41 15.59 3l-2.17 2.17C12.96 5.06 12.49 5 12 5c-.49 0-.96.06-1.42.17L8.41 3 7 4.41l1.62 1.63C7.88 6.55 7.26 7.22 6.81 8H4v2h2.09c-.05.33-.09.66-.09 1v1H4v2h2v1c0 .34.04.67.09 1H4v2h2.81c1.04 1.79 2.97 3 5.19 3s4.15-1.21 5.19-3H20v-2h-2.09c.05-.33.09-.66.09-1v-1h2v-2h-2v-1c0-.34-.04-.67-.09-1H20V8z"/>
                </svg>
                调试工具
              </button>
              <button class="menu-item" @click="testFastMessage">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7 14l5-5 5 5z"/>
                </svg>
                测试消息
              </button>
              <button class="menu-item" @click="openEncryptionSettings">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
                </svg>
                加密设置
              </button>
            </div>
          </div>
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
        <!-- 加载状态 -->
        <div v-if="matrixStore.loading && matrixStore.rooms.length === 0" class="loading-chat-list">
          <div class="loading-spinner"></div>
          <div class="loading-message">正在加载聊天列表...</div>
        </div>

        <!-- 空状态 -->
        <div v-else-if="filteredRooms.length === 0" class="empty-chat-list">
          <div class="empty-message">暂无聊天</div>
        </div>

        <!-- 聊天列表 -->
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
      <div v-else class="active-chat-container">
        <div class="message-list">
          <MatrixMessageAreaSimple :room-id="currentRoomId" />
        </div>
        <!-- 预留输入区（如有输入框可放这里） -->
        <!-- <div class="message-input"><YourInputComponent /></div> -->
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

    <!-- 加入房间对话框 -->
    <div v-if="showJoinRoom" class="modal-overlay" @click="closeJoinRoomDialog">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>🏠 加入房间</h3>
          <button class="close-btn" @click="closeJoinRoomDialog">✕</button>
        </div>
        <div class="modal-body">
          <div class="input-group">
            <label>房间地址</label>
            <input
              v-model="joinRoomInput"
              type="text"
              placeholder="输入房间别名或ID，如：#friesport:mozilla.org"
              class="room-input"
              @keyup.enter="handleJoinRoom"
            />
            <div class="input-hint">
              支持房间别名（#roomname:server.org）或房间ID（!roomid:server.org）
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="cancel-btn" @click="closeJoinRoomDialog">取消</button>
          <button
            class="join-btn primary"
            @click="handleJoinRoom"
            :disabled="!joinRoomInput.trim() || isJoiningRoom"
          >
            {{ isJoiningRoom ? '加入中...' : '加入房间' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
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
const showJoinRoom = ref(false)
const joinRoomInput = ref('')
const isJoiningRoom = ref(false)
const publicRooms = ref<any[]>([])
const isLoadingPublicRooms = ref(false)
const showMoreMenu = ref(false)
const moreActionsRef = ref<HTMLElement>()



// 计算属性
const filteredRooms = computed(() => {
  const rooms = matrixStore.rooms || []
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

const toggleMoreMenu = () => {
  showMoreMenu.value = !showMoreMenu.value
}

// 点击外部关闭更多菜单
const handleClickOutside = (event: Event) => {
  if (moreActionsRef.value && !moreActionsRef.value.contains(event.target as Node)) {
    showMoreMenu.value = false
  }
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

const selectRoom = async (roomId: string) => {
  currentRoomId.value = roomId
  matrixStore.setCurrentRoom(roomId)

  // 加载房间消息
  try {
    console.log(`🔄 选择房间: ${roomId}，开始加载消息...`)
    await matrixStore.fetchMatrixMessages(roomId)
    console.log(`✅ 房间 ${roomId} 消息加载完成`)
  } catch (error) {
    console.error('Failed to load room messages:', error)
  }
}

const startDirectMessage = () => {
  showStartDM.value = true
}

const createGroupChat = () => {
  showCreateGroup.value = true
}

// 加入房间相关方法
const showJoinRoomDialog = () => {
  showJoinRoom.value = true
  joinRoomInput.value = '' // 清空输入框
}

const closeJoinRoomDialog = () => {
  showJoinRoom.value = false
  joinRoomInput.value = ''
  isJoiningRoom.value = false
}

const handleJoinRoom = async () => {
  const roomAddress = joinRoomInput.value.trim()
  if (!roomAddress) return

  if (!matrixStore.matrixClient) {
    alert('Matrix客户端未初始化，无法加入房间')
    return
  }

  isJoiningRoom.value = true

  try {
    console.log(`🏠 尝试加入房间: ${roomAddress}`)

    // 使用Matrix客户端加入房间
    await matrixStore.matrixClient.joinRoom(roomAddress)
    console.log(`✅ 成功加入房间: ${roomAddress}`)

    // 刷新房间列表
    await matrixStore.fetchMatrixRooms()

    // 关闭对话框
    closeJoinRoomDialog()

    // 显示成功消息
    alert(`✅ 成功加入房间: ${roomAddress}`)

  } catch (error: any) {
    console.error('❌ 加入房间失败:', error)
    alert(`❌ 加入房间失败: ${error.message || '未知错误'}`)
  } finally {
    isJoiningRoom.value = false
  }
}

const refreshRooms = async () => {
  console.log('🔄 手动刷新房间列表...')

  if (!matrixStore.matrixClient) {
    console.error('❌ Matrix客户端未初始化')
    alert('Matrix客户端未初始化，无法刷新房间')
    return
  }

  try {
    // 显示加载状态
    matrixStore.loading = true

    // 检查同步状态
    const syncState = matrixStore.matrixClient.getSyncState()
    console.log(`📡 当前同步状态: ${syncState}`)

    // 如果客户端没有在同步，重新启动
    if (syncState === 'STOPPED' || syncState === 'ERROR' || syncState === null) {
      console.log('🚀 重新启动Matrix客户端同步...')
      await matrixStore.matrixClient.startClient({ initialSyncLimit: 50 })

      // 等待同步完成
      await new Promise((resolve) => {
        const timeout = setTimeout(() => {
          matrixStore.matrixClient?.removeListener('sync', onSync)
          console.warn('同步等待超时，继续刷新房间列表')
          resolve(true)
        }, 3000) // 优化：超时时间改为3秒

        const onSync = (state: string) => {
          console.log(`🔄 同步状态: ${state}`)
          if (state === 'PREPARED' || state === 'SYNCING') {
            clearTimeout(timeout)
            matrixStore.matrixClient?.removeListener('sync', onSync)
            resolve(true)
          }
        }
        matrixStore.matrixClient?.on('sync', onSync)
      })
    }

    // 强制重新获取房间列表
    await matrixStore.fetchMatrixRooms()
    console.log(`✅ 房间列表刷新完成，当前房间数量: ${matrixStore.rooms.length}`)

    if (matrixStore.rooms.length === 0) {
      console.warn('没有找到房间，可能需要加入一些房间')
    } else {
      console.log(`成功刷新房间列表，找到 ${matrixStore.rooms.length} 个房间`)
    }

  } catch (error: any) {
    console.error('❌ 刷新房间列表失败:', error)
    alert('刷新房间列表失败: ' + (error?.message || '未知错误'))
  } finally {
    matrixStore.loading = false
  }
}

const debugMatrixClient = async () => {
  console.log('🐛 Matrix客户端调试信息:')

  if (!matrixStore.matrixClient) {
    console.error('❌ Matrix客户端未初始化')
    alert('Matrix客户端未初始化')
    return
  }

  try {
    // 使用新的诊断功能
    const diagnosis = await matrixStore.diagnoseMatrixConnection()
    console.log('📊 Matrix连接诊断结果:', diagnosis)

    const client = matrixStore.matrixClient
    const debugInfo = {
      // 基本信息
      userId: client.getUserId(),
      homeserver: client.getHomeserverUrl(),
      accessToken: !!client.getAccessToken(),
      deviceId: client.getDeviceId(),

      // 同步状态
      syncState: client.getSyncState(),
      isStarted: typeof client.isStarted === 'function' ? client.isStarted() : 'unknown',

      // 房间信息
      totalRooms: client.getRooms().length,
      joinedRooms: client.getRooms().filter((r: any) => r.getMyMembership() === 'join').length,
      invitedRooms: client.getRooms().filter((r: any) => r.getMyMembership() === 'invite').length,

      // 存储状态
      localRoomsCount: matrixStore.rooms.length,

      // 连接状态
      connectionState: matrixStore.connection,

      // 诊断结果
      diagnosis: diagnosis
    }

    console.log('📊 调试信息:', debugInfo)

    // 显示房间详情
    const rooms = client.getRooms()
    console.log('🏠 所有房间详情:')
    rooms.forEach((room: any, index: number) => {
      console.log(`房间 ${index + 1}:`, {
        id: room.roomId,
        name: room.name || '无名称',
        alias: room.getCanonicalAlias() || '无别名',
        membership: room.getMyMembership(),
        memberCount: room.getJoinedMemberCount(),
        isSpace: room.isSpaceRoom(),
        type: room.getType()
      })
    })

    // 调试当前房间的消息
    if (matrixStore.currentRoomId) {
      console.log('🔍 当前房间消息调试:')
      matrixStore.debugMessages(matrixStore.currentRoomId)
    }

    // 显示诊断结果和建议
    let alertMessage = `Matrix客户端诊断结果:
总房间数: ${debugInfo.totalRooms}
已加入: ${debugInfo.joinedRooms}
本地存储: ${debugInfo.localRoomsCount}
同步状态: ${debugInfo.syncState}
网络连接: ${diagnosis.networkConnectivity ? '正常' : '异常'}
认证状态: ${diagnosis.authValid ? '有效' : '无效'}
当前房间: ${matrixStore.currentRoomId || '无'}`

    if (diagnosis.recommendations.length > 0) {
      alertMessage += '\n\n💡 建议:\n' + diagnosis.recommendations.join('\n')
    }

    alert(alertMessage)

  } catch (error) {
    console.error('❌ 获取调试信息失败:', error)
    alert('获取调试信息失败: ' + (error as Error).message)
  }
}

const handleStartDM = (_userId: string) => {
  // 处理开始私聊逻辑
  showStartDM.value = false
}

// 测试快速消息功能
const testFastMessage = async () => {
  if (!matrixStore.currentRoomId) {
    alert('请先选择一个房间')
    return
  }

  const testContent = `⚡ 快速测试消息 ${new Date().toLocaleTimeString()}`

  try {
    console.log('🚀 测试快速消息发送...')
    const startTime = Date.now()

    await matrixStore.sendMatrixMessage(matrixStore.currentRoomId, testContent)

    const endTime = Date.now()
    const duration = endTime - startTime

    console.log(`✅ 快速消息测试完成，耗时: ${duration}ms`)
    alert(`快速消息发送完成！\n耗时: ${duration}ms\n内容: ${testContent}`)
  } catch (error) {
    console.error('❌ 快速消息测试失败:', error)
    alert(`快速消息测试失败: ${error}`)
  }
}

// 打开加密设置页面
const openEncryptionSettings = () => {
  router.push('/encryption-settings')
}

// 打开加密测试页面
const openEncryptionTest = () => {
  router.push('/encryption-test')
}

// 打开加密调试页面
const openCryptoDebug = () => {
  router.push('/crypto-debug')
}

const handleCreateGroup = async (groupData: any) => {
  console.log('🏗️ 开始创建群聊:', groupData)

  if (!matrixStore.matrixClient) {
    console.error('❌ Matrix客户端未初始化')
    alert('Matrix客户端未初始化，无法创建房间')
    return
  }

  try {
    console.log('📡 调用Matrix客户端创建房间...')

    // 使用Matrix客户端创建房间
    const response = await matrixStore.matrixClient.createRoom(groupData)
    console.log('✅ 房间创建成功:', response)

    // 创建本地房间对象
    const newRoom: any = {
      id: response.room_id,
      name: groupData.name,
      alias: groupData.room_alias_name ? `#${groupData.room_alias_name}:${matrixStore.matrixClient.getDomain()}` : '',
      topic: groupData.topic || '',
      type: groupData.visibility === 'public' ? 'public' as const : 'private' as const,
      isPublic: groupData.visibility === 'public',
      memberCount: 1,
      members: [matrixStore.matrixClient.getUserId()],
      unreadCount: 0,
      encrypted: groupData.initial_state?.some((state: any) => state.type === 'm.room.encryption') || false,
      joinRule: groupData.preset === 'public_chat' ? 'public' : 'invite',
      historyVisibility: 'shared',
      lastActivity: Date.now(),
      avatarUrl: undefined
    }

    // 添加到房间列表
    matrixStore.addRoom(newRoom)
    console.log(`✅ 房间 "${newRoom.name}" 已添加到房间列表`)

    // 等待一下让Matrix客户端同步新房间
    await new Promise(resolve => setTimeout(resolve, 1000))

    // 尝试刷新房间列表以确保新房间被正确同步
    try {
      await matrixStore.fetchMatrixRooms()
    } catch (refreshError) {
      console.warn('刷新房间列表失败，但继续选择房间:', refreshError)
    }

    // 选择新创建的房间
    selectRoom(newRoom.id)

    // 关闭对话框
    showCreateGroup.value = false

    console.log(`房间 "${groupData.name}" 创建成功！`)

  } catch (error: any) {
    console.error('❌ 创建房间失败:', error)
    alert('创建房间失败: ' + (error?.message || '未知错误'))
  }
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

onMounted(async () => {
  console.log('🚀 WeChatStyleLayout 组件挂载开始')

  // 首先尝试初始化Matrix状态（包括恢复房间列表）
  try {
    const initialized = await matrixStore.initializeMatrix()
    console.log('📊 Matrix初始化结果:', initialized)

    if (initialized) {
      console.log('✅ Matrix已初始化，房间数量:', matrixStore.rooms.length)
      return // 如果初始化成功，就不需要检查token了
    }
  } catch (error) {
    console.error('❌ Matrix初始化失败:', error)
  }

  // 如果Matrix初始化失败，检查存储的登录信息
  const storedToken = localStorage.getItem('matrix_access_token')
  const storedLoginInfo = localStorage.getItem('matrix_login_info')

  console.log('📊 检查存储的登录信息:', {
    hasToken: !!storedToken,
    hasLoginInfo: !!storedLoginInfo,
    isLoggedIn: matrixStore.isLoggedIn,
    hasClient: !!matrixStore.matrixClient,
    roomsCount: matrixStore.rooms.length
  })

  if (storedToken && storedLoginInfo) {
    console.log('✅ 发现存储的登录信息，界面可以显示')

    // 在后台异步初始化Matrix客户端
    initializeMatrixInBackground()
  } else if (matrixStore.rooms.length === 0) {
    // 只有在没有房间列表的情况下才跳转到登录页面
    console.log('❌ 没有找到存储的登录信息且无房间列表，跳转到登录页面')
    router.push('/login')
  } else {
    console.log('📚 虽然没有登录信息，但有房间列表，允许界面显示')
  }
})

// 后台异步初始化Matrix客户端
const initializeMatrixInBackground = async () => {
  try {
    console.log('🔄 在后台初始化Matrix客户端...')

    // 如果store中还没有客户端，尝试初始化
    if (!matrixStore.matrixClient) {
      await matrixStore.initializeMatrix()
    }

    // 等待Matrix客户端初始化完成，但不阻塞界面
    let retryCount = 0
    const maxRetries = 60 // 增加重试次数，但不阻塞界面

    const waitForClient = async () => {
      while (!matrixStore.matrixClient && retryCount < maxRetries) {
        console.log(`⏳ Matrix客户端后台初始化中... (${retryCount + 1}/${maxRetries})`)
        await new Promise(resolve => setTimeout(resolve, 1000))
        retryCount++
      }

      if (matrixStore.matrixClient) {
        console.log('✅ Matrix客户端后台初始化完成')
        console.log('📊 Matrix客户端详细信息:', {
          userId: matrixStore.matrixClient.getUserId(),
          homeserver: matrixStore.matrixClient.getHomeserverUrl(),
          syncState: matrixStore.matrixClient.getSyncState()
        })

        // 获取房间列表
        try {
          console.log('🔄 后台获取房间列表...')
          const rooms = matrixStore.matrixClient.getRooms()
          console.log(`📊 从客户端获取到 ${rooms.length} 个房间`)

          // 转换房间格式并添加到store
          const convertedRooms = rooms.map((room: any) => ({
            id: room.roomId,
            name: room.name || room.roomId,
            type: 'private',
            isPublic: false,
            memberCount: room.getJoinedMemberCount(),
            unreadCount: 0,
            encrypted: room.hasEncryptionStateEvent()
          }))

          matrixStore.rooms.splice(0, matrixStore.rooms.length, ...convertedRooms)
          console.log('✅ 房间列表已更新')
        } catch (roomError) {
          console.error('❌ 获取房间列表失败:', roomError)
        }
      } else {
        console.error('❌ Matrix客户端后台初始化超时')
      }
    }

    // 异步执行，不阻塞界面
    waitForClient()

  } catch (error) {
    console.error('❌ 后台初始化Matrix失败:', error)
    // 不跳转到登录页面，让用户可以继续使用界面
  }
}
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
  padding: 16px 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(10px);
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
  align-items: center;
  gap: 6px;
  position: relative;
}

.action-btn {
  width: 36px;
  height: 36px;
  border: none;
  background: rgba(0, 0, 0, 0.04);
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  transition: all 0.2s ease;
  position: relative;
}

.action-btn:hover {
  background: rgba(0, 0, 0, 0.08);
  color: #333;
  transform: translateY(-1px);
}

.action-btn.primary {
  color: #2d5a27;
}

.action-btn.primary:hover {
  background: rgba(45, 90, 39, 0.1);
  color: #1e3d1a;
}

.action-btn svg {
  width: 16px;
  height: 16px;
}

.more-actions {
  position: relative;
}

.more-btn.active {
  background: rgba(45, 90, 39, 0.15);
  color: #2d5a27;
}

.more-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  background: white;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  min-width: 180px;
  z-index: 1000;
  overflow: hidden;
}

.menu-item {
  width: 100%;
  padding: 12px 16px;
  border: none;
  background: none;
  text-align: left;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  color: #333;
  font-size: 14px;
  transition: background-color 0.2s ease;
}

.menu-item:hover {
  background: rgba(45, 90, 39, 0.05);
}

.menu-item svg {
  width: 16px;
  height: 16px;
  color: #666;
}

.menu-divider {
  height: 1px;
  background: rgba(0, 0, 0, 0.08);
  margin: 4px 0;
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

.loading-chat-list {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #999;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #4a7c59;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 10px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-message {
  font-size: 14px;
  color: #666;
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

.active-chat-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}
.message-list {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background: #fafafa;
  min-height: 0;
}
.message-input {
  flex: 0;
  border-top: 1px solid #ddd;
  padding: 8px;
  background: #fff;
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

/* 加入房间对话框样式 */
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
  background: #1e1e1e;
  border: 2px solid #00ff41;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 0 20px rgba(0, 255, 65, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #333;
}

.modal-header h3 {
  margin: 0;
  color: #00ff41;
  font-size: 18px;
}

.close-btn {
  background: none;
  border: none;
  color: #999;
  font-size: 20px;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: #ff4444;
}

.modal-body {
  padding: 20px;
}

.input-group {
  margin-bottom: 16px;
}

.input-group label {
  display: block;
  margin-bottom: 8px;
  color: #00ff41;
  font-weight: 500;
}

.room-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #333;
  border-radius: 4px;
  background: #2a2a2a;
  color: #fff;
  font-size: 14px;
  font-family: 'Courier New', monospace;
}

.room-input:focus {
  outline: none;
  border-color: #00ff41;
  box-shadow: 0 0 5px rgba(0, 255, 65, 0.3);
}

.input-hint {
  margin-top: 8px;
  font-size: 12px;
  color: #999;
  line-height: 1.4;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid #333;
}

.cancel-btn {
  padding: 8px 16px;
  border: 1px solid #666;
  background: transparent;
  color: #999;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.cancel-btn:hover {
  background: #333;
  color: #fff;
}

.join-btn.primary {
  padding: 8px 16px;
  background: linear-gradient(135deg, #66BB6A, #4CAF50);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
}

.join-btn.primary:disabled {
  background: #666;
  cursor: not-allowed;
}

.join-btn.primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #4CAF50, #388E3C);
}

.join-btn:hover {
  background: linear-gradient(135deg, #4CAF50, #45a049);
}

/* 底部退出按钮 - 微信风格 */
.chat-list-footer {
  padding: 10px 15px;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  background: rgba(248, 248, 248, 0.95);
  position: relative;
  z-index: 5;
}

.logout-btn {
  width: 100%;
  padding: 8px 12px;
  border: none;
  background: rgba(0, 0, 0, 0.05);
  color: #666;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 400;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.2s ease;
  position: relative;
  z-index: 10;
}

.logout-btn:hover {
  background: rgba(0, 0, 0, 0.08);
  color: #333;
}

.logout-icon {
  font-size: 14px;
}

.logout-text {
  font-size: 13px;
}
</style>
