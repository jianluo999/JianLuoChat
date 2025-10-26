<template>
  <div class="mobile-room-list">
    <!-- 房间搜索 -->
    <div class="search-section">
      <div class="search-container">
        <svg class="search-icon" viewBox="0 0 24 24">
          <path d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z"/>
        </svg>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜索聊天"
          class="search-input"
          @input="debouncedSearch"
        />
        <button v-if="searchQuery" @click="clearSearch" class="clear-search">
          <svg viewBox="0 0 24 24">
            <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- 房间列表 -->
    <div class="rooms-section">
      <div class="rooms-list">
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

            <div class="room-preview" v-if="room.lastMessage">
              <span class="message-sender">{{ room.lastMessage.senderName }}:</span>
              <span class="message-content">{{ truncateMessage(room.lastMessage.content) }}</span>
            </div>

            <div class="room-topic" v-else-if="room.topic">
              {{ truncateMessage(room.topic) }}
            </div>

            <div class="room-meta">
              <span class="member-count">
                <svg class="meta-icon" viewBox="0 0 24 24">
                  <path d="M16,4C18.11,4 20,5.89 20,8C20,10.11 18.11,12 16,12C13.89,12 12,10.11 12,8C12,5.89 13.89,4 16,4M16,14C20.42,14 24,15.79 24,18V20H8V18C8,15.79 11.58,14 16,14Z"/>
                </svg>
                {{ room.memberCount || 0 }}
              </span>
            </div>
          </div>

          <div class="room-badges">
            <div v-if="room.unreadCount > 0" class="unread-badge">
              {{ room.unreadCount }}
            </div>
            <div v-if="room.mentionCount > 0" class="mention-badge">
              {{ room.mentionCount }}
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-if="filteredRooms.length === 0" class="empty-state">
          <div class="empty-icon">💬</div>
          <div class="empty-title">暂无聊天</div>
          <div class="empty-desc">点击右上角创建新的聊天</div>
        </div>
      </div>
    </div>

    <!-- 创建房间按钮 -->
    <div class="create-room-section">
      <button class="create-room-btn" @click="$emit('create-room')">
        <svg viewBox="0 0 24 24" class="create-icon">
          <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z"/>
        </svg>
        <span>新建聊天</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { useMatrixStore } from '@/stores/matrix'

interface Props {
  selectedRoom?: string
}

const props = withDefaults(defineProps<Props>(), {
  selectedRoom: ''
})

const emit = defineEmits<{
  'room-selected': [roomId: string]
  'create-room': []
}>()

const matrixStore = useMatrixStore()

// 状态管理
const searchQuery = ref('')
const selectedRoom = ref(props.selectedRoom)

// 计算属性
const allRooms = computed(() => {
  return matrixStore.rooms.filter(room => room.type === 'room' || room.type === 'private')
})

const filteredRooms = computed(() => {
  if (!searchQuery.value.trim()) {
    return allRooms.value
  }
  
  const query = searchQuery.value.toLowerCase()
  return allRooms.value.filter(room =>
    room.name?.toLowerCase().includes(query) ||
    room.topic?.toLowerCase().includes(query) ||
    room.id?.toLowerCase().includes(query)
  )
})

// 方法
const getRoomInitials = (name: string): string => {
  return name.split(' ').map(word => word[0]).join('').toUpperCase().substring(0, 2)
}

const formatTimestamp = (timestamp: number): string => {
  const now = Date.now()
  const diff = now - timestamp

  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}天前`

  return new Date(timestamp).toLocaleDateString('zh-CN', {
    month: 'numeric',
    day: 'numeric'
  })
}

const truncateMessage = (message: string, maxLength: number = 30): string => {
  if (message.length <= maxLength) return message
  return message.substring(0, maxLength) + '...'
}

const selectRoom = (roomId: string) => {
  selectedRoom.value = roomId
  emit('room-selected', roomId)
}

const clearSearch = () => {
  searchQuery.value = ''
}

// 监听props变化
watch(() => props.selectedRoom, (newRoomId) => {
  selectedRoom.value = newRoomId
})

// 搜索防抖
let searchTimeout: NodeJS.Timeout
const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    // 搜索逻辑已经在计算属性中处理
  }, 300)
}
</script>

<style scoped>
.mobile-room-list {
  height: 100vh;
  background: #f8f9fa;
  display: flex;
  flex-direction: column;
}

.search-section {
  background: #ffffff;
  border-bottom: 1px solid #e8e8e8;
  padding: 12px 16px;
}

.search-container {
  position: relative;
  display: flex;
  align-items: center;
  background: #f5f5f5;
  border-radius: 20px;
  padding: 8px 12px;
}

.search-icon {
  position: absolute;
  left: 8px;
  width: 16px;
  height: 16px;
  fill: #888;
  z-index: 1;
}

.search-input {
  width: 100%;
  padding: 8px 8px 8px 24px;
  background: transparent;
  border: none;
  border-radius: 20px;
  font-size: 14px;
  color: #222;
  outline: none;
}

.search-input::placeholder {
  color: #888;
}

.clear-search {
  position: absolute;
  right: 8px;
  width: 20px;
  height: 20px;
  background: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.clear-search:hover {
  background: #f5f5f5;
}

.clear-search svg {
  width: 12px;
  height: 12px;
  fill: #888;
}

.rooms-section {
  flex: 1;
  overflow-y: auto;
}

.rooms-list {
  padding: 8px 0;
}

.room-item {
  display: flex;
  align-items: flex-start;
  padding: 12px 16px;
  background: #ffffff;
  border-bottom: 1px solid #f5f5f5;
  cursor: pointer;
  transition: background-color 0.2s;
}

.room-item:hover {
  background: #f5f5f5;
}

.room-item.active {
  background: #f0f8ff;
  border-left: 3px solid #07c160;
}

.room-item.encrypted {
  border-left-color: #ff9800;
}

.room-item.unread {
  background: #f6ffed;
}

.room-item.mention {
  background: #fff2f0;
}

.room-avatar {
  position: relative;
  width: 48px;
  height: 48px;
  margin-right: 12px;
  flex-shrink: 0;
}

.room-avatar img {
  width: 100%;
  height: 100%;
  border-radius: 8px;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  border-radius: 8px;
  background: linear-gradient(135deg, #07c160, #52c41a);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 16px;
}

.encryption-badge {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 16px;
  height: 16px;
  background: #ff9800;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #ffffff;
}

.encryption-badge svg {
  width: 8px;
  height: 8px;
  fill: #ffffff;
}

.room-info {
  flex: 1;
  min-width: 0;
  margin-right: 8px;
}

.room-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 4px;
}

.room-name {
  font-size: 16px;
  font-weight: 600;
  color: #222;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}

.room-timestamp {
  font-size: 12px;
  color: #888;
  margin-left: 8px;
  flex-shrink: 0;
}

.room-preview {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 4px;
}

.message-sender {
  font-size: 12px;
  color: #888;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}

.message-content {
  font-size: 12px;
  color: #222;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}

.room-topic {
  font-size: 12px;
  color: #888;
  margin-bottom: 4px;
}

.room-meta {
  display: flex;
  align-items: center;
  gap: 4px;
}

.member-count {
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: 11px;
  color: #888;
}

.meta-icon {
  width: 12px;
  height: 12px;
  fill: currentColor;
}

.room-badges {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
  flex-shrink: 0;
}

.unread-badge {
  background: #52c41a;
  color: white;
  border-radius: 10px;
  padding: 2px 6px;
  font-size: 10px;
  font-weight: 600;
  min-width: 16px;
  text-align: center;
}

.mention-badge {
  background: #ff4d4f;
  color: white;
  border-radius: 10px;
  padding: 2px 6px;
  font-size: 10px;
  font-weight: 600;
  min-width: 16px;
  text-align: center;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #888;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #222;
}

.empty-desc {
  font-size: 14px;
  text-align: center;
}

/* 创建房间按钮 */
.create-room-section {
  background: #ffffff;
  border-top: 1px solid #e8e8e8;
  padding: 16px;
}

.create-room-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: #07c160;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.create-room-btn:hover {
  background: #52c41a;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(7, 193, 96, 0.3);
}

.create-icon {
  width: 20px;
  height: 20px;
  fill: white;
}

/* 滚动条样式 */
.rooms-list::-webkit-scrollbar {
  width: 4px;
}

.rooms-list::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.rooms-list::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 2px;
}

.rooms-list::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>