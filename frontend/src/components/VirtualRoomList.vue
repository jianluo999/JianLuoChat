<template>
  <div class="virtual-room-list" ref="containerRef">
    <!-- 虚拟滚动容器 -->
    <div 
      class="virtual-scroll-container"
      :style="{ height: containerHeight + 'px' }"
      @scroll="handleScroll"
      ref="scrollRef"
    >
      <!-- 占位空间 - 上方 -->
      <div :style="{ height: offsetY + 'px' }"></div>
      
      <!-- 可见房间列表 -->
      <div
        v-for="room in visibleRooms"
        :key="room.id"
        class="room-item"
        :class="{
          active: room.id === selectedRoom,
          encrypted: room.encrypted,
          public: room.joinRule === 'public',
          unread: room.unreadCount > 0,
          mention: room.mentionCount > 0
        }"
        :style="{ height: itemHeight + 'px' }"
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
            <span class="member-count" :title="成员数量">
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
      
      <!-- 占位空间 - 下方 -->
      <div :style="{ height: (totalHeight - offsetY - visibleHeight) + 'px' }"></div>
    </div>

    <!-- 性能指标显示 -->
    <div v-if="showPerformanceMetrics" class="performance-metrics">
      <div class="metric">总房间: {{ totalItems }}</div>
      <div class="metric">可见: {{ visibleRooms.length }}</div>
      <div class="metric">FPS: {{ currentFPS }}</div>
      <div class="metric">渲染时间: {{ renderTime }}ms</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'

interface Room {
  id: string
  name: string
  alias?: string
  topic?: string
  type: 'public' | 'private' | 'world' | 'space'
  isPublic: boolean
  memberCount: number
  unreadCount: number
  mentionCount?: number
  encrypted: boolean
  joinRule: string
  lastActivity?: number
  lastMessage?: {
    sender: string
    senderName: string
    content: string
  }
  avatarUrl?: string
  isFileTransferRoom?: boolean
}

interface Props {
  rooms: Room[]
  selectedRoom?: string
  itemHeight?: number
  containerHeight?: number
  showPerformanceMetrics?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  selectedRoom: '',
  itemHeight: 72, // 每个房间项的高度
  containerHeight: 400, // 容器高度
  showPerformanceMetrics: false
})

const emit = defineEmits<{
  'room-selected': [roomId: string]
  'room-context-menu': [room: Room, event: MouseEvent]
}>()

// 引用
const containerRef = ref<HTMLElement>()
const scrollRef = ref<HTMLElement>()

// 滚动状态
const scrollTop = ref(0)
const isScrolling = ref(false)
let scrollTimer: number | null = null

// 性能监控
const currentFPS = ref(60)
const renderTime = ref(0)
let frameCount = 0
let lastTime = performance.now()

// 虚拟滚动计算
const totalItems = computed(() => props.rooms.length)
const totalHeight = computed(() => totalItems.value * props.itemHeight)

// 可见区域计算
const visibleStart = computed(() => {
  return Math.floor(scrollTop.value / props.itemHeight)
})

const visibleEnd = computed(() => {
  const end = Math.ceil((scrollTop.value + props.containerHeight) / props.itemHeight)
  return Math.min(end, totalItems.value)
})

// 缓冲区 - 在可见区域前后各渲染几个项目以提升滚动体验
const bufferSize = 5
const startIndex = computed(() => Math.max(0, visibleStart.value - bufferSize))
const endIndex = computed(() => Math.min(totalItems.value, visibleEnd.value + bufferSize))

// 可见房间列表
const visibleRooms = computed(() => {
  const start = performance.now()
  const result = props.rooms.slice(startIndex.value, endIndex.value)
  renderTime.value = Math.round(performance.now() - start)
  return result
})

// 偏移量
const offsetY = computed(() => startIndex.value * props.itemHeight)
const visibleHeight = computed(() => (endIndex.value - startIndex.value) * props.itemHeight)

// 滚动处理
const handleScroll = (event: Event) => {
  const target = event.target as HTMLElement
  scrollTop.value = target.scrollTop
  
  isScrolling.value = true
  
  // 清除之前的定时器
  if (scrollTimer) {
    clearTimeout(scrollTimer)
  }
  
  // 设置滚动结束检测
  scrollTimer = window.setTimeout(() => {
    isScrolling.value = false
  }, 150)
}

// 房间选择
const selectRoom = (roomId: string) => {
  emit('room-selected', roomId)
}

// 右键菜单
const showRoomContextMenu = (room: Room, event: MouseEvent) => {
  emit('room-context-menu', room, event)
}

// 工具函数
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

// 性能监控
const updateFPS = () => {
  frameCount++
  const now = performance.now()
  
  if (now - lastTime >= 1000) {
    currentFPS.value = Math.round((frameCount * 1000) / (now - lastTime))
    frameCount = 0
    lastTime = now
  }
  
  requestAnimationFrame(updateFPS)
}

// 滚动到指定房间
const scrollToRoom = (roomId: string) => {
  const index = props.rooms.findIndex(room => room.id === roomId)
  if (index !== -1 && scrollRef.value) {
    const targetScrollTop = index * props.itemHeight
    scrollRef.value.scrollTop = targetScrollTop
  }
}

// 监听选中房间变化，自动滚动到可见区域
watch(() => props.selectedRoom, (newRoomId) => {
  if (newRoomId) {
    const index = props.rooms.findIndex(room => room.id === newRoomId)
    if (index !== -1) {
      const itemTop = index * props.itemHeight
      const itemBottom = itemTop + props.itemHeight
      const scrollTop = scrollRef.value?.scrollTop || 0
      const scrollBottom = scrollTop + props.containerHeight
      
      // 如果选中的房间不在可见区域内，滚动到该房间
      if (itemTop < scrollTop || itemBottom > scrollBottom) {
        scrollToRoom(newRoomId)
      }
    }
  }
})

// 生命周期
onMounted(() => {
  if (props.showPerformanceMetrics) {
    updateFPS()
  }
})

onUnmounted(() => {
  if (scrollTimer) {
    clearTimeout(scrollTimer)
  }
})

// 暴露方法给父组件
defineExpose({
  scrollToRoom
})
</script>

<style scoped>
.virtual-room-list {
  height: 100%;
  position: relative;
  overflow: hidden;
}

.virtual-scroll-container {
  overflow-y: auto;
  overflow-x: hidden;
  height: 100%;
  scrollbar-width: thin;
  scrollbar-color: rgba(100, 181, 246, 0.3) transparent;
}

.virtual-scroll-container::-webkit-scrollbar {
  width: 6px;
}

.virtual-scroll-container::-webkit-scrollbar-track {
  background: transparent;
}

.virtual-scroll-container::-webkit-scrollbar-thumb {
  background: rgba(100, 181, 246, 0.3);
  border-radius: 3px;
}

.virtual-scroll-container::-webkit-scrollbar-thumb:hover {
  background: rgba(100, 181, 246, 0.5);
}

.room-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  border-bottom: 1px solid rgba(58, 74, 92, 0.3);
  transition: background-color 0.2s ease;
  background: rgba(0, 0, 0, 0.1);
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
  width: 40px;
  height: 40px;
  margin-right: 12px;
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
  font-size: 14px;
}

.encryption-badge {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 16px;
  height: 16px;
  background: #ffc107;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid rgba(26, 26, 46, 0.95);
}

.encryption-badge svg {
  width: 10px;
  height: 10px;
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
  margin-bottom: 4px;
}

.room-name {
  font-weight: 600;
  font-size: 14px;
  color: #e0e6ed;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.room-timestamp {
  font-size: 11px;
  color: #64b5f6;
  flex-shrink: 0;
  margin-left: 8px;
}

.room-alias {
  font-size: 12px;
  color: #64b5f6;
  margin-bottom: 2px;
  font-family: 'Courier New', monospace;
}

.room-preview {
  font-size: 12px;
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
  font-size: 12px;
  color: #78909c;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.room-badges {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  flex-shrink: 0;
}

.room-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.member-count {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: #64b5f6;
}

.meta-icon {
  width: 12px;
  height: 12px;
  fill: currentColor;
}

.public-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  background: rgba(76, 175, 80, 0.2);
  border-radius: 50%;
  color: #4caf50;
}

.public-badge svg {
  width: 10px;
  height: 10px;
  fill: currentColor;
}

.notification-badges {
  display: flex;
  gap: 4px;
}

.unread-badge {
  background: #4caf50;
  color: white;
  border-radius: 10px;
  padding: 2px 6px;
  font-size: 10px;
  font-weight: 600;
  min-width: 16px;
  text-align: center;
}

.mention-badge {
  background: #f44336;
  color: white;
  border-radius: 10px;
  padding: 2px 6px;
  font-size: 10px;
  font-weight: 600;
  min-width: 16px;
  text-align: center;
}

.performance-metrics {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.8);
  padding: 8px;
  border-radius: 4px;
  font-size: 10px;
  color: #64b5f6;
  font-family: 'Courier New', monospace;
  z-index: 1000;
}

.metric {
  margin-bottom: 2px;
}

.metric:last-child {
  margin-bottom: 0;
}
</style>