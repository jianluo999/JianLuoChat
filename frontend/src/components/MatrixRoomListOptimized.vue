<template>
  <div class="matrix-room-list-optimized">
    <!-- Matrix连接状态 -->
    <div class="matrix-status-header">
      <div class="status-line">
        <div class="status-indicator" :class="connectionStatus">
          <svg class="status-icon" viewBox="0 0 24 24">
            <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6M12,8A4,4 0 0,0 8,12A4,4 0 0,0 12,16A4,4 0 0,0 16,12A4,4 0 0,0 12,8Z"/>
          </svg>
          <span class="status-text">{{ getStatusText() }}</span>
        </div>
        <div class="sync-indicator" v-if="matrixStore.syncStatus">
          <span class="sync-status" :class="matrixStore.syncStatus">
            {{ getSyncStatusText() }}
          </span>
        </div>
      </div>
      <div class="homeserver-line">
        <span class="homeserver-label">服务器:</span>
        <span class="homeserver-url">{{ matrixStore.homeserver || 'matrix.org' }}</span>
        <span class="federation-indicator">联邦化</span>
      </div>
    </div>

    <!-- 房间搜索 -->
    <div class="room-search-section">
      <div class="search-container">
        <div class="search-input-wrapper">
          <svg class="search-icon" viewBox="0 0 24 24">
            <path d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z"/>
          </svg>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索房间..."
            class="search-input"
            @input="filterRooms"
          />
          <button v-if="searchQuery" @click="clearSearch" class="clear-search">
            <svg viewBox="0 0 24 24">
              <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- 房间过滤器 -->
    <div class="room-filters">
      <button
        v-for="filter in roomFilters"
        :key="filter.key"
        class="filter-button"
        :class="{ active: activeFilter === filter.key }"
        @click="setFilter(filter.key)"
      >
        <svg class="filter-icon" viewBox="0 0 24 24">
          <path :d="filter.icon"/>
        </svg>
        <span>{{ filter.label }}</span>
        <span v-if="filter.count > 0" class="filter-count">{{ filter.count }}</span>
      </button>
    </div>

    <!-- 性能优化开关 -->
    <div class="performance-controls">
      <label class="performance-toggle">
        <input 
          type="checkbox" 
          v-model="useVirtualScroll" 
          @change="toggleVirtualScroll"
        />
        <span class="toggle-text">虚拟滚动 ({{ filteredRooms.length }}个房间)</span>
      </label>
      <div class="performance-info" v-if="showPerformanceInfo">
        <span class="fps-counter">FPS: {{ currentFPS }}</span>
        <span class="render-time">渲染: {{ renderTime }}ms</span>
      </div>
    </div>

    <!-- 房间列表区域 -->
    <div class="rooms-section" ref="roomsSectionRef">
      <div class="section-header">
        <div class="section-title">
          <svg class="section-icon" viewBox="0 0 24 24">
            <path d="M19,19H5V5H19M19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3Z"/>
          </svg>
          <span>房间列表</span>
        </div>
        <button @click="$emit('create-room')" class="create-button" title="创建房间">
          <svg viewBox="0 0 24 24">
            <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z"/>
          </svg>
        </button>
      </div>

      <!-- 虚拟滚动房间列表 -->
      <VirtualRoomList
        v-if="useVirtualScroll && filteredRooms.length > virtualScrollThreshold"
        :rooms="filteredRooms"
        :selected-room="selectedRoom"
        :container-height="roomListHeight"
        :item-height="72"
        :show-performance-metrics="showPerformanceInfo"
        @room-selected="selectRoom"
        @room-context-menu="showRoomContextMenu"
        ref="virtualRoomListRef"
      />

      <!-- 传统房间列表 -->
      <div 
        v-else
        class="rooms-list traditional-list"
        :style="{ height: roomListHeight + 'px', overflowY: 'auto' }"
      >
        <div
          v-for="room in filteredRooms"
          :key="room.id"
          class="room-item"
          :class="{
            active: room.id === selectedRoom,
            encrypted: room.encrypted,
            public: room.joinRule === 'public',
            unread: room.unreadCount > 0,
            mention: room.mentionCount > 0
          }"
          @click="selectRoom(room.id)"
          @contextmenu.prevent="showRoomContextMenu(room, $event)"
        >
          <div class="room-avatar">
            <img v-if="room.avatarUrl" :src="room.avatarUrl" :alt="room.name" />
            <div v-else class="avatar-placeholder">
              {{ getRoomInitials(room.name) }}
            </div>
            <div v-if="room.encrypted" class="encryption-badge">
              <svg viewBox="0 0 24 24">
                <path d="M12,17A2,2 0 0,0 14,15C14,13.89 13.1,13 12,13A2,2 0 0,0 10,15A2,2 0 0,0 12,17M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V10C4,8.89 4.9,8 6,8H7V6A5,5 0 0,1 12,1A5,5 0 0,1 17,6V8H18M12,3A3,3 0 0,0 9,6V8H15V6A3,3 0 0,0 12,3Z"/>
              </svg>
            </div>
          </div>

          <div class="room-info">
            <div class="room-header">
              <div class="room-name">{{ room.name }}</div>
              <div class="room-timestamp" v-if="room.lastActivity">
                {{ formatTimestamp(room.lastActivity) }}
              </div>
            </div>

            <div class="room-alias" v-if="room.alias">{{ room.alias }}</div>

            <div class="room-preview" v-if="room.lastMessage">
              <span class="message-sender">{{ room.lastMessage.senderName }}:</span>
              <span class="message-content">{{ truncateMessage(room.lastMessage.content) }}</span>
            </div>

            <div class="room-topic" v-else-if="room.topic">
              {{ truncateMessage(room.topic) }}
            </div>
          </div>

          <div class="room-badges">
            <div class="room-meta">
              <span class="member-count" title="成员数量">
                <svg class="meta-icon" viewBox="0 0 24 24">
                  <path d="M16,4C18.11,4 20,5.89 20,8C20,10.11 18.11,12 16,12C13.89,12 12,10.11 12,8C12,5.89 13.89,4 16,4M16,14C20.42,14 24,15.79 24,18V20H8V18C8,15.79 11.58,14 16,14Z"/>
                </svg>
                {{ room.memberCount || 0 }}
              </span>

              <div v-if="room.joinRule === 'public'" class="public-badge" title="公开房间">
                <svg viewBox="0 0 24 24">
                  <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6M12,8A4,4 0 0,0 8,12A4,4 0 0,0 12,16A4,4 0 0,0 16,12A4,4 0 0,0 12,8Z"/>
                </svg>
              </div>
            </div>

            <div class="notification-badges">
              <div v-if="room.mentionCount > 0" class="mention-badge">
                {{ room.mentionCount }}
              </div>
              <div v-else-if="room.unreadCount > 0" class="unread-badge">
                {{ room.unreadCount }}
              </div>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-if="filteredRooms.length === 0" class="empty-state">
          <div class="empty-icon">
            <svg viewBox="0 0 24 24">
              <path d="M19,19H5V5H19M19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3Z"/>
            </svg>
          </div>
          <div class="empty-text">未找到房间</div>
          <button @click="$emit('create-room')" class="empty-action">
            创建第一个房间
          </button>
        </div>
      </div>
    </div>

    <!-- 性能统计 -->
    <div v-if="showPerformanceInfo" class="performance-stats">
      <div class="stat-item">
        <span class="stat-label">房间总数:</span>
        <span class="stat-value">{{ allRooms.length }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">已过滤:</span>
        <span class="stat-value">{{ filteredRooms.length }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">渲染模式:</span>
        <span class="stat-value">{{ useVirtualScroll ? '虚拟滚动' : '传统' }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useMatrixV39Store } from '@/stores/matrix-v39-clean'
import VirtualRoomList from './VirtualRoomList.vue'

interface Props {
  selectedSpace?: string
  selectedRoom?: string
}

const props = withDefaults(defineProps<Props>(), {
  selectedSpace: '',
  selectedRoom: ''
})

const emit = defineEmits<{
  'room-selected': [roomId: string]
  'create-room': []
  'create-space': []
}>()

const matrixStore = useMatrixV39Store()

// 引用
const roomsSectionRef = ref<HTMLElement>()
const virtualRoomListRef = ref<InstanceType<typeof VirtualRoomList>>()

// 状态管理
const activeFilter = ref('all')
const searchQuery = ref('')
const useVirtualScroll = ref(true) // 默认启用虚拟滚动
const virtualScrollThreshold = 20 // 超过20个房间时启用虚拟滚动
const showPerformanceInfo = ref(false)

// 性能监控
const currentFPS = ref(60)
const renderTime = ref(0)
let frameCount = 0
let lastTime = performance.now()
let fpsInterval: number | null = null

// 布局计算
const roomListHeight = ref(400)

// 房间过滤器
const roomFilters = computed(() => [
  {
    key: 'all',
    label: '全部',
    icon: 'M19,19H5V5H19M19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3Z',
    count: allRooms.value.length
  },
  {
    key: 'unread',
    label: '未读',
    icon: 'M21,6.5C21,8.43 19.43,10 17.5,10C15.57,10 14,8.43 14,6.5C14,4.57 15.57,3 17.5,3C19.43,3 21,4.57 21,6.5M19,11.79C18.5,11.92 18,12 17.5,12C14.46,12 12,9.54 12,6.5C12,5.03 12.58,3.7 13.5,2.71C13,2.28 12.5,2 12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12C22,11.83 22,11.67 22,11.5C21.03,11.5 20.12,11.68 19,11.79Z',
    count: unreadRooms.value.length
  },
  {
    key: 'encrypted',
    label: '加密',
    icon: 'M12,17A2,2 0 0,0 14,15C14,13.89 13.1,13 12,13A2,2 0 0,0 10,15A2,2 0 0,0 12,17M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V10C4,8.89 4.9,8 6,8H7V6A5,5 0 0,1 12,1A5,5 0 0,1 17,6V8H18M12,3A3,3 0 0,0 9,6V8H15V6A3,3 0 0,0 12,3Z',
    count: encryptedRooms.value.length
  },
  {
    key: 'public',
    label: '公开',
    icon: 'M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6M12,8A4,4 0 0,0 8,12A4,4 0 0,0 12,16A4,4 0 0,0 16,12A4,4 0 0,0 12,8Z',
    count: publicRooms.value.length
  }
])

// 计算属性
const connectionStatus = computed(() => {
  if (!matrixStore.isConnected) return 'disconnected'
  if (matrixStore.syncStatus === 'syncing') return 'syncing'
  if (matrixStore.syncStatus === 'synced') return 'connected'
  return 'error'
})

const allRooms = computed(() => {
  if (props.selectedSpace) {
    const space = matrixStore.rooms.find(room => room.id === props.selectedSpace)
    return space?.childRooms || []
  }
  return matrixStore.rooms.filter(room => room.type === 'room' || room.type === 'private')
})

const unreadRooms = computed(() => {
  return allRooms.value.filter(room => room.unreadCount > 0)
})

const encryptedRooms = computed(() => {
  return allRooms.value.filter(room => room.encrypted)
})

const publicRooms = computed(() => {
  return allRooms.value.filter(room => room.joinRule === 'public')
})

const filteredRooms = computed(() => {
  let rooms = []
  switch (activeFilter.value) {
    case 'unread':
      rooms = unreadRooms.value
      break
    case 'encrypted':
      rooms = encryptedRooms.value
      break
    case 'public':
      rooms = publicRooms.value
      break
    default:
      rooms = allRooms.value
  }

  // 应用搜索过滤
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    rooms = rooms.filter(room =>
      room.name?.toLowerCase().includes(query) ||
      room.topic?.toLowerCase().includes(query) ||
      room.id?.toLowerCase().includes(query) ||
      room.alias?.toLowerCase().includes(query)
    )
  }

  return rooms
})

// 方法
const getStatusText = () => {
  switch (connectionStatus.value) {
    case 'connected':
      return '已连接'
    case 'syncing':
      return '同步中...'
    case 'disconnected':
      return '已断开'
    case 'error':
      return '错误'
    default:
      return '未知'
  }
}

const getSyncStatusText = () => {
  switch (matrixStore.syncStatus) {
    case 'synced':
      return '已同步'
    case 'syncing':
      return '同步中...'
    case 'error':
      return '同步错误'
    default:
      return '未同步'
  }
}

const selectRoom = (roomId: string) => {
  emit('room-selected', roomId)
}

const setFilter = (filterKey: string) => {
  activeFilter.value = filterKey
}

const getRoomInitials = (name: string): string => {
  return name.split(' ').map(word => word[0]).join('').toUpperCase().substring(0, 2)
}

const formatTimestamp = (timestamp: number): string => {
  const now = Date.now()
  const diff = now - timestamp

  if (diff < 60000) return 'now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}d`

  return new Date(timestamp).toLocaleDateString()
}

const truncateMessage = (message: string, maxLength: number = 50): string => {
  if (message.length <= maxLength) return message
  return message.substring(0, maxLength) + '...'
}

const showRoomContextMenu = (room: any, event: MouseEvent) => {
  console.log('Room context menu:', room, event)
}

// 搜索相关方法
const filterRooms = () => {
  // 搜索功能通过计算属性自动触发
}

const clearSearch = () => {
  searchQuery.value = ''
}

// 虚拟滚动切换
const toggleVirtualScroll = () => {
  console.log(`虚拟滚动已${useVirtualScroll.value ? '启用' : '禁用'}`)
  
  // 如果切换到虚拟滚动且有选中的房间，滚动到该房间
  if (useVirtualScroll.value && props.selectedRoom) {
    nextTick(() => {
      virtualRoomListRef.value?.scrollToRoom(props.selectedRoom)
    })
  }
}

// 性能监控
const updateFPS = () => {
  if (fpsInterval) {
    clearInterval(fpsInterval)
  }
  
  fpsInterval = setInterval(() => {
    const now = performance.now()
    const fps = Math.round((frameCount * 1000) / (now - lastTime))
    currentFPS.value = fps
    frameCount = 0
    lastTime = now
  }, 1000) // 每秒更新一次FPS
}

// 帧计数器
const frameCounter = () => {
  frameCount++
}

// 渲染时间监控
const measureRenderTime = () => {
  const start = performance.now()
  // 触发一次强制重绘来测量渲染时间
  if (roomsSectionRef.value) {
    roomsSectionRef.value.offsetHeight // 强制重绘
  }
  const end = performance.now()
  renderTime.value = Math.round(end - start)
}

// 计算房间列表高度
const calculateRoomListHeight = () => {
  if (roomsSectionRef.value) {
    const rect = roomsSectionRef.value.getBoundingClientRect()
    const headerHeight = 50 // 区域头部高度
    roomListHeight.value = Math.max(300, rect.height - headerHeight)
  }
}

// 监听窗口大小变化
const handleResize = () => {
  calculateRoomListHeight()
}

// 监听房间数量变化，自动启用/禁用虚拟滚动
watch(() => filteredRooms.value.length, (newCount) => {
  if (newCount > virtualScrollThreshold && !useVirtualScroll.value) {
    console.log(`房间数量 (${newCount}) 超过阈值 (${virtualScrollThreshold})，建议启用虚拟滚动`)
  }
})

// 生命周期
onMounted(async () => {
  // 加载房间列表
  if (matrixStore.isLoggedIn) {
    await matrixStore.fetchMatrixRooms()
  }
  
  // 计算布局
  calculateRoomListHeight()
  window.addEventListener('resize', handleResize)
  
  // 启动性能监控
  if (import.meta.env.DEV) {
    showPerformanceInfo.value = true
    updateFPS()
    
    // 定期测量渲染时间
    const renderTimer = setInterval(() => {
      measureRenderTime()
    }, 5000) // 每5秒测量一次渲染时间
    
    // 清理函数
    return () => {
      if (renderTimer) {
        clearInterval(renderTimer)
      }
    }
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.matrix-room-list-optimized {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, rgba(26, 26, 46, 0.95) 0%, rgba(22, 33, 62, 0.95) 100%);
  border-right: 1px solid #3a4a5c;
  color: #e0e6ed;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  overflow: hidden;
}

/* Matrix状态头部 */
.matrix-status-header {
  padding: 12px 16px;
  background: rgba(0, 0, 0, 0.3);
  border-bottom: 1px solid #3a4a5c;
  backdrop-filter: blur(10px);
}

.status-line {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  font-weight: 500;
}

.status-indicator.connected {
  color: #4caf50;
}

.status-indicator.syncing {
  color: #ff9800;
}

.status-indicator.disconnected {
  color: #f44336;
}

.status-indicator.error {
  color: #f44336;
}

.status-icon {
  width: 14px;
  height: 14px;
  fill: currentColor;
}

.homeserver-line {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  color: #b0bec5;
}

.homeserver-label {
  font-weight: 600;
}

.homeserver-url {
  color: #64b5f6;
  font-family: 'Courier New', monospace;
}

.federation-indicator {
  background: rgba(129, 199, 132, 0.2);
  color: #81c784;
  padding: 2px 4px;
  border-radius: 3px;
  font-size: 0.65rem;
  border: 1px solid rgba(129, 199, 132, 0.3);
}

/* 房间搜索样式 */
.room-search-section {
  padding: 10px 16px;
  border-bottom: 1px solid #3a4a5c;
  background: rgba(0, 0, 0, 0.2);
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 10px;
  width: 14px;
  height: 14px;
  fill: #64b5f6;
  z-index: 1;
}

.search-input {
  width: 100%;
  padding: 6px 10px 6px 32px;
  background: rgba(0, 255, 136, 0.05);
  border: 1px solid rgba(0, 255, 136, 0.2);
  border-radius: 4px;
  color: #e0e6ed;
  font-size: 0.8rem;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #00ff88;
  background: rgba(0, 255, 136, 0.1);
  box-shadow: 0 0 0 2px rgba(0, 255, 136, 0.1);
}

.clear-search {
  position: absolute;
  right: 6px;
  width: 18px;
  height: 18px;
  border: none;
  background: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s ease;
}

.clear-search:hover {
  background: rgba(255, 255, 255, 0.1);
}

.clear-search svg {
  width: 12px;
  height: 12px;
  fill: #64b5f6;
}

/* 房间过滤器 */
.room-filters {
  display: flex;
  padding: 6px 16px;
  gap: 3px;
  background: rgba(0, 0, 0, 0.1);
  border-bottom: 1px solid #3a4a5c;
}

.filter-button {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid transparent;
  border-radius: 4px;
  color: #b0bec5;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-button:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: #3a4a5c;
}

.filter-button.active {
  background: rgba(100, 181, 246, 0.2);
  border-color: #64b5f6;
  color: #64b5f6;
}

.filter-icon {
  width: 10px;
  height: 10px;
  fill: currentColor;
}

.filter-count {
  background: rgba(255, 255, 255, 0.2);
  color: #e0e6ed;
  padding: 1px 4px;
  border-radius: 8px;
  font-size: 0.65rem;
  min-width: 14px;
  text-align: center;
}

/* 性能控制 */
.performance-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  background: rgba(0, 0, 0, 0.15);
  border-bottom: 1px solid #3a4a5c;
  font-size: 0.75rem;
}

.performance-toggle {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  color: #b0bec5;
}

.performance-toggle input[type="checkbox"] {
  width: 14px;
  height: 14px;
  accent-color: #64b5f6;
}

.performance-info {
  display: flex;
  gap: 12px;
  font-family: 'Courier New', monospace;
  color: #64b5f6;
}

/* 房间区域 */
.rooms-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px;
  background: rgba(0, 0, 0, 0.2);
  border-bottom: 1px solid #3a4a5c;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  font-size: 0.85rem;
  color: #b0bec5;
}

.section-icon {
  width: 14px;
  height: 14px;
  fill: currentColor;
}

.create-button {
  width: 22px;
  height: 22px;
  border: none;
  background: rgba(100, 181, 246, 0.2);
  color: #64b5f6;
  border-radius: 3px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.create-button:hover {
  background: rgba(100, 181, 246, 0.3);
}

.create-button svg {
  width: 12px;
  height: 12px;
  fill: currentColor;
}

/* 传统房间列表样式 */
.traditional-list {
  scrollbar-width: thin;
  scrollbar-color: rgba(100, 181, 246, 0.3) transparent;
}

.traditional-list::-webkit-scrollbar {
  width: 6px;
}

.traditional-list::-webkit-scrollbar-track {
  background: transparent;
}

.traditional-list::-webkit-scrollbar-thumb {
  background: rgba(100, 181, 246, 0.3);
  border-radius: 3px;
}

.traditional-list::-webkit-scrollbar-thumb:hover {
  background: rgba(100, 181, 246, 0.5);
}

.room-item {
  display: flex;
  align-items: center;
  padding: 10px 16px;
  cursor: pointer;
  border-bottom: 1px solid rgba(58, 74, 92, 0.3);
  transition: background-color 0.2s ease;
  background: rgba(0, 0, 0, 0.1);
  min-height: 72px;
}

.room-item:hover {
  background: rgba(100, 181, 246, 0.1);
}

.room-item.active {
  background: rgba(100, 181, 246, 0.2);
  border-left: 3px solid #64b5f6;
}

.room-item.encrypted {
  border-left: 2px solid #ffc107;
}

.room-item.unread {
  background: rgba(76, 175, 80, 0.05);
}

.room-item.mention {
  background: rgba(244, 67, 54, 0.05);
}

.room-avatar {
  position: relative;
  width: 36px;
  height: 36px;
  margin-right: 10px;
  flex-shrink: 0;
}

.room-avatar img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: linear-gradient(135deg, #64b5f6, #42a5f5);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 12px;
}

.encryption-badge {
  position: absolute;
  bottom: -1px;
  right: -1px;
  width: 14px;
  height: 14px;
  background: #ffc107;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid rgba(26, 26, 46, 0.95);
}

.encryption-badge svg {
  width: 8px;
  height: 8px;
  fill: #1a1a2e;
}

.room-info {
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.room-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 3px;
}

.room-name {
  font-weight: 600;
  font-size: 13px;
  color: #e0e6ed;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.room-timestamp {
  font-size: 10px;
  color: #64b5f6;
  flex-shrink: 0;
  margin-left: 6px;
}

.room-alias {
  font-size: 11px;
  color: #64b5f6;
  margin-bottom: 2px;
  font-family: 'Courier New', monospace;
}

.room-preview {
  font-size: 11px;
  color: #b0bec5;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.message-sender {
  color: #64b5f6;
  font-weight: 500;
}

.message-content {
  color: #000000;
}

.room-topic {
  font-size: 11px;
  color: #78909c;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.room-badges {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 3px;
  flex-shrink: 0;
}

.room-meta {
  display: flex;
  align-items: center;
  gap: 6px;
}

.member-count {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 10px;
  color: #64b5f6;
}

.meta-icon {
  width: 10px;
  height: 10px;
  fill: currentColor;
}

.public-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  background: rgba(76, 175, 80, 0.2);
  border-radius: 50%;
  color: #4caf50;
}

.public-badge svg {
  width: 8px;
  height: 8px;
  fill: currentColor;
}

.notification-badges {
  display: flex;
  gap: 3px;
}

.unread-badge {
  background: #4caf50;
  color: white;
  border-radius: 8px;
  padding: 1px 4px;
  font-size: 9px;
  font-weight: 600;
  min-width: 14px;
  text-align: center;
}

.mention-badge {
  background: #f44336;
  color: white;
  border-radius: 8px;
  padding: 1px 4px;
  font-size: 9px;
  font-weight: 600;
  min-width: 14px;
  text-align: center;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
  color: #78909c;
}

.empty-icon svg {
  width: 48px;
  height: 48px;
  fill: #455a64;
  margin-bottom: 16px;
}

.empty-text {
  font-size: 14px;
  margin-bottom: 16px;
}

.empty-action {
  background: rgba(100, 181, 246, 0.2);
  border: 1px solid #64b5f6;
  color: #64b5f6;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.3s ease;
}

.empty-action:hover {
  background: rgba(100, 181, 246, 0.3);
}

/* 性能统计 */
.performance-stats {
  padding: 8px 16px;
  background: rgba(0, 0, 0, 0.2);
  border-top: 1px solid #3a4a5c;
  display: flex;
  justify-content: space-between;
  font-size: 0.7rem;
  color: #64b5f6;
  font-family: 'Courier New', monospace;
}

.stat-item {
  display: flex;
  gap: 4px;
}

.stat-label {
  color: #b0bec5;
}

.stat-value {
  color: #64b5f6;
  font-weight: 600;
}
</style>