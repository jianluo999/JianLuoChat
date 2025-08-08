<template>
  <div class="matrix-room-list">
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
        <span class="homeserver-label">{{ $t('matrix.homeserver') }}:</span>
        <span class="homeserver-url">{{ matrixStore.homeserver || 'matrix.org' }}</span>
        <span class="federation-indicator">{{ $t('matrix.federated') }}</span>
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

    <!-- 开发者工具 -->
    <div class="dev-tools-section" v-if="showDevTools">
      <div class="section-header">
        <span class="section-title">🛠️ 开发者工具</span>
      </div>
      <div class="dev-tools-buttons">
        <button @click="forceReconnect" class="dev-btn">
          🔄 强制重新连接
        </button>
        <button @click="cleanupFileTransferRooms" class="dev-btn">
          🧹 清理重复文件传输助手
        </button>
        <button @click="resetAllData" class="dev-btn danger">
          🗑️ 重置所有数据
        </button>
      </div>
    </div>

    <!-- 显示/隐藏开发者工具按钮 -->
    <div class="dev-toggle">
      <button @click="showDevTools = !showDevTools" class="toggle-dev-btn">
        {{ showDevTools ? '隐藏' : '显示' }} 开发者工具
      </button>
    </div>

    <!-- Matrix Spaces -->
    <div class="spaces-section">
      <div class="section-header">
        <div class="section-title">
          <svg class="section-icon" viewBox="0 0 24 24">
            <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6M12,8A4,4 0 0,0 8,12A4,4 0 0,0 12,16A4,4 0 0,0 16,12A4,4 0 0,0 12,8Z"/>
          </svg>
          <span>{{ $t('matrix.spaces') }}</span>
        </div>
        <button @click="$emit('create-space')" class="create-button" :title="$t('matrix.createSpace')">
          <svg viewBox="0 0 24 24">
            <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z"/>
          </svg>
        </button>
      </div>

      <!-- 世界频道 Space -->
      <div
        v-if="worldChannel"
        class="space-item world-space"
        :class="{ active: selectedRoom === worldChannel.id }"
        @click="selectRoom(worldChannel.id)"
      >
        <div class="space-avatar">
          <img v-if="worldChannel.avatarUrl" :src="worldChannel.avatarUrl" :alt="worldChannel.name" />
          <div v-else class="avatar-placeholder">🌍</div>
        </div>
        <div class="space-info">
          <div class="space-name">{{ worldChannel.name }}</div>
          <div class="space-topic" v-if="worldChannel.topic">{{ worldChannel.topic }}</div>
          <div class="space-meta">
            <span class="member-count">{{ worldChannel.memberCount || 0 }} {{ $t('matrix.members') }}</span>
            <MatrixEncryptionStatus
              :status="worldChannel.encrypted ? 'encrypted' : 'unencrypted'"
              :room-id="worldChannel.id"
            />
          </div>
        </div>
        <div class="space-actions">
          <div v-if="worldChannel.unreadCount > 0" class="unread-badge">
            {{ worldChannel.unreadCount }}
          </div>
        </div>
      </div>

      <!-- 其他 Spaces -->
      <div
        v-for="space in otherSpaces"
        :key="space.id"
        class="space-item"
        :class="{ active: selectedSpace === space.id }"
        @click="selectSpace(space.id)"
      >
        <div class="space-avatar">
          <img v-if="space.avatarUrl" :src="space.avatarUrl" :alt="space.name" />
          <div v-else class="avatar-placeholder">{{ getSpaceInitials(space.name) }}</div>
        </div>
        <div class="space-info">
          <div class="space-name">{{ space.name }}</div>
          <div class="space-topic" v-if="space.topic">{{ space.topic }}</div>
          <div class="space-meta">
            <span class="room-count">{{ space.childRooms?.length || 0 }} {{ $t('matrix.rooms') }}</span>
            <span class="member-count">{{ space.memberCount || 0 }} {{ $t('matrix.members') }}</span>
          </div>
        </div>
        <div class="space-actions">
          <div v-if="space.unreadCount > 0" class="unread-badge">
            {{ space.unreadCount }}
          </div>
          <button @click.stop="toggleSpace(space.id)" class="expand-button">
            <svg :class="{ expanded: expandedSpaces.includes(space.id) }" viewBox="0 0 24 24">
              <path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Matrix房间列表 -->
    <div class="rooms-section">
      <div class="section-header">
        <div class="section-title">
          <svg class="section-icon" viewBox="0 0 24 24">
            <path d="M19,19H5V5H19M19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3Z"/>
          </svg>
          <span>{{ selectedSpace ? $t('matrix.spaceRooms') : $t('matrix.rooms') }}</span>
        </div>
        <button @click="$emit('create-room')" class="create-button" :title="$t('matrix.createRoom')">
          <svg viewBox="0 0 24 24">
            <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z"/>
          </svg>
        </button>
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

      <!-- 房间列表 -->
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
              <MatrixUserID
                :user-id="room.lastMessage.sender"
                :display-name="room.lastMessage.senderName"
                :show-federation="false"
                :show-actions="false"
                class="message-sender"
              />
              <span class="message-content">{{ truncateMessage(room.lastMessage.content) }}</span>
            </div>

            <div class="room-topic" v-else-if="room.topic">
              {{ truncateMessage(room.topic) }}
            </div>
          </div>

          <div class="room-badges">
            <div class="room-meta">
              <span class="member-count" :title="$t('matrix.memberCount')">
                <svg class="meta-icon" viewBox="0 0 24 24">
                  <path d="M16,4C18.11,4 20,5.89 20,8C20,10.11 18.11,12 16,12C13.89,12 12,10.11 12,8C12,5.89 13.89,4 16,4M16,14C20.42,14 24,15.79 24,18V20H8V18C8,15.79 11.58,14 16,14Z"/>
                </svg>
                {{ room.memberCount || 0 }}
              </span>

              <div v-if="room.joinRule === 'public'" class="public-badge" :title="$t('matrix.publicRoom')">
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
          <div class="empty-text">{{ $t('matrix.noRoomsFound') }}</div>
          <button @click="$emit('create-room')" class="empty-action">
            {{ $t('matrix.createFirstRoom') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Matrix协议信息 -->
    <div class="matrix-protocol-info">
      <div class="protocol-header">
        <svg class="protocol-icon" viewBox="0 0 24 24">
          <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6M12,8A4,4 0 0,0 8,12A4,4 0 0,0 12,16A4,4 0 0,0 16,12A4,4 0 0,0 12,8Z"/>
        </svg>
        <span>{{ $t('matrix.protocol') }}</span>
      </div>
      <div class="protocol-features">
        <div class="feature-item active">
          <svg class="feature-icon" viewBox="0 0 24 24">
            <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6M12,8A4,4 0 0,0 8,12A4,4 0 0,0 12,16A4,4 0 0,0 16,12A4,4 0 0,0 12,8Z"/>
          </svg>
          <span>{{ $t('matrix.federation') }}</span>
        </div>
        <div class="feature-item active">
          <svg class="feature-icon" viewBox="0 0 24 24">
            <path d="M12,17A2,2 0 0,0 14,15C14,13.89 13.1,13 12,13A2,2 0 0,0 10,15A2,2 0 0,0 12,17M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V10C4,8.89 4.9,8 6,8H7V6A5,5 0 0,1 12,1A5,5 0 0,1 17,6V8H18M12,3A3,3 0 0,0 9,6V8H15V6A3,3 0 0,0 12,3Z"/>
          </svg>
          <span>{{ $t('matrix.encryption') }}</span>
        </div>
        <div class="feature-item active">
          <svg class="feature-icon" viewBox="0 0 24 24">
            <path d="M13,9H11V7H13M13,17H11V11H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/>
          </svg>
          <span>{{ $t('matrix.realTimeSync') }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useMatrixStore } from '@/stores/matrix'
import { roomAPI } from '@/services/api'
import MatrixUserID from './MatrixUserID.vue'
import MatrixEncryptionStatus from './MatrixEncryptionStatus.vue'

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

const matrixStore = useMatrixStore()

// 状态管理
const expandedSpaces = ref<string[]>([])
const activeFilter = ref('all')
const searchQuery = ref('')
const showDevTools = ref(false)

// 房间过滤器
const roomFilters = computed(() => [
  {
    key: 'all',
    label: 'All',
    icon: 'M19,19H5V5H19M19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3Z',
    count: allRooms.value.length
  },
  {
    key: 'unread',
    label: 'Unread',
    icon: 'M21,6.5C21,8.43 19.43,10 17.5,10C15.57,10 14,8.43 14,6.5C14,4.57 15.57,3 17.5,3C19.43,3 21,4.57 21,6.5M19,11.79C18.5,11.92 18,12 17.5,12C14.46,12 12,9.54 12,6.5C12,5.03 12.58,3.7 13.5,2.71C13,2.28 12.5,2 12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12C22,11.83 22,11.67 22,11.5C21.03,11.5 20.12,11.68 19,11.79Z',
    count: unreadRooms.value.length
  },
  {
    key: 'encrypted',
    label: 'Encrypted',
    icon: 'M12,17A2,2 0 0,0 14,15C14,13.89 13.1,13 12,13A2,2 0 0,0 10,15A2,2 0 0,0 12,17M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V10C4,8.89 4.9,8 6,8H7V6A5,5 0 0,1 12,1A5,5 0 0,1 17,6V8H18M12,3A3,3 0 0,0 9,6V8H15V6A3,3 0 0,0 12,3Z',
    count: encryptedRooms.value.length
  },
  {
    key: 'public',
    label: 'Public',
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

const worldChannel = computed(() => {
  return matrixStore.rooms.find(room => room.type === 'world')
})

const otherSpaces = computed(() => {
  return matrixStore.rooms.filter(room => room.type === 'space' && room.id !== worldChannel.value?.id)
})

const allRooms = computed(() => {
  if (props.selectedSpace) {
    const space = matrixStore.rooms.find(room => room.id === props.selectedSpace)
    return space?.childRooms || []
  }
  return matrixStore.rooms.filter(room => room.type === 'room')
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
      return 'Connected'
    case 'syncing':
      return 'Syncing...'
    case 'disconnected':
      return 'Disconnected'
    case 'error':
      return 'Error'
    default:
      return 'Unknown'
  }
}

const getSyncStatusText = () => {
  switch (matrixStore.syncStatus) {
    case 'synced':
      return 'Synced'
    case 'syncing':
      return 'Syncing...'
    case 'error':
      return 'Sync Error'
    default:
      return 'Not Synced'
  }
}

const selectRoom = (roomId: string) => {
  emit('room-selected', roomId)
}

const selectSpace = (spaceId: string) => {
  // 选择空间时展开/折叠
  toggleSpace(spaceId)
}

const toggleSpace = (spaceId: string) => {
  const index = expandedSpaces.value.indexOf(spaceId)
  if (index > -1) {
    expandedSpaces.value.splice(index, 1)
  } else {
    expandedSpaces.value.push(spaceId)
  }
}

const setFilter = (filterKey: string) => {
  activeFilter.value = filterKey
}

const getSpaceInitials = (name: string): string => {
  return name.split(' ').map(word => word[0]).join('').toUpperCase().substring(0, 2)
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
  // TODO: 实现右键菜单
  console.log('Room context menu:', room, event)
}

// 搜索相关方法
const filterRooms = () => {
  // 搜索功能通过计算属性自动触发
}

const clearSearch = () => {
  searchQuery.value = ''
}

// 开发者工具方法
const forceReconnect = async () => {
  if (confirm('确定要强制重新连接Matrix吗？这将重新启动客户端。')) {
    try {
      const success = await matrixStore.forceReconnect()
      if (success) {
        alert('✅ 重新连接成功！')
      } else {
        alert('❌ 重新连接失败，请查看控制台了解详情。')
      }
    } catch (error) {
      console.error('强制重新连接失败:', error)
      alert('❌ 重新连接失败，请查看控制台了解详情。')
    }
  }
}

const cleanupFileTransferRooms = async () => {
  if (confirm('确定要清理重复的文件传输助手吗？这将删除所有重复项并重新创建一个。')) {
    try {
      // 调用store中的清理方法
      const fileTransferRooms = matrixStore.rooms.filter(r =>
        r.isFileTransferRoom ||
        r.id === 'file-transfer-assistant' ||
        r.name === '文件传输助手'
      )

      console.log(`🔍 发现 ${fileTransferRooms.length} 个文件传输助手相关房间`)

      if (fileTransferRooms.length > 1) {
        // 删除所有文件传输助手
        matrixStore.rooms = matrixStore.rooms.filter(r =>
          !r.isFileTransferRoom &&
          r.id !== 'file-transfer-assistant' &&
          r.name !== '文件传输助手'
        )

        // 重新创建一个
        const fileTransferRoom = {
          id: 'file-transfer-assistant',
          name: '文件传输助手',
          alias: '',
          topic: '发送文件、图片和消息的个人助手',
          type: 'private' as const,
          isPublic: false,
          memberCount: 1,
          members: [],
          unreadCount: 0,
          encrypted: false,
          isFileTransferRoom: true,
          joinRule: 'invite',
          historyVisibility: 'shared'
        }

        matrixStore.rooms.unshift(fileTransferRoom)

        // 保存到localStorage
        localStorage.setItem('matrix-rooms', JSON.stringify(matrixStore.rooms.map(room => ({
          id: room.id,
          name: room.name,
          alias: room.alias,
          topic: room.topic,
          type: room.type,
          isPublic: room.isPublic,
          memberCount: room.memberCount,
          encrypted: room.encrypted,
          joinRule: room.joinRule,
          historyVisibility: room.historyVisibility,
          avatarUrl: room.avatarUrl,
          isFileTransferRoom: room.isFileTransferRoom
        }))))

        alert(`✅ 已清理 ${fileTransferRooms.length} 个重复的文件传输助手，重新创建了一个新的。`)
      } else {
        alert('✅ 没有发现重复的文件传输助手。')
      }
    } catch (error) {
      console.error('清理失败:', error)
      alert('❌ 清理失败，请查看控制台了解详情。')
    }
  }
}

const resetAllData = () => {
  if (confirm('⚠️ 警告：这将删除所有本地数据（房间、消息、登录信息）！确定要继续吗？')) {
    if (confirm('🚨 最后确认：这个操作不可撤销！确定要重置所有数据吗？')) {
      try {
        // 清除所有localStorage数据
        localStorage.removeItem('matrix-rooms')
        localStorage.removeItem('matrix_messages')
        localStorage.removeItem('matrix-login-info')
        localStorage.removeItem('matrix_login_info')

        // 重置store状态
        matrixStore.rooms = []
        matrixStore.messages.clear()
        matrixStore.currentUser = null
        matrixStore.isLoggedIn = false
        matrixStore.isConnected = false

        alert('✅ 所有数据已重置，页面将刷新。')
        window.location.reload()
      } catch (error) {
        console.error('重置失败:', error)
        alert('❌ 重置失败，请查看控制台了解详情。')
      }
    }
  }
}

// 生命周期
onMounted(async () => {
  // 加载房间列表
  if (matrixStore.isLoggedIn) {
    await matrixStore.fetchRooms()
  }
})
</script>


<style scoped>
.matrix-room-list {
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
  padding: 16px;
  background: rgba(0, 0, 0, 0.3);
  border-bottom: 1px solid #3a4a5c;
  backdrop-filter: blur(10px);
}

.status-line {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
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
  width: 16px;
  height: 16px;
  fill: currentColor;
}

.sync-indicator {
  font-size: 0.75rem;
}

.sync-status.synced {
  color: #4caf50;
}

.sync-status.syncing {
  color: #ff9800;
}

.sync-status.error {
  color: #f44336;
}

.homeserver-line {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.8rem;
  color: #b0bec5;
}

.homeserver-label {
  font-weight: 600;
}

.homeserver-url {
  color: #64b5f6;
  font-family: 'Courier New', monospace;
}

/* 房间搜索样式 */
.room-search-section {
  padding: 12px 16px;
  border-bottom: 1px solid #3a4a5c;
  background: rgba(0, 0, 0, 0.2);
}

.search-container {
  position: relative;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 12px;
  width: 16px;
  height: 16px;
  fill: #64b5f6;
  z-index: 1;
}

.search-input {
  width: 100%;
  padding: 8px 12px 8px 36px;
  background: rgba(0, 255, 136, 0.05);
  border: 1px solid rgba(0, 255, 136, 0.2);
  border-radius: 6px;
  color: #e0e6ed;
  font-size: 0.85rem;
  font-family: 'Courier New', monospace;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #00ff88;
  background: rgba(0, 255, 136, 0.1);
  box-shadow: 0 0 0 2px rgba(0, 255, 136, 0.1);
}

.search-input::placeholder {
  color: #64b5f6;
  opacity: 0.7;
}

.clear-search {
  position: absolute;
  right: 8px;
  width: 20px;
  height: 20px;
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
  width: 14px;
  height: 14px;
  fill: #64b5f6;
}

.federation-indicator {
  background: rgba(129, 199, 132, 0.2);
  color: #81c784;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.7rem;
  border: 1px solid rgba(129, 199, 132, 0.3);
}

/* 区域样式 */
.spaces-section,
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
  padding: 12px 16px;
  background: rgba(0, 0, 0, 0.2);
  border-bottom: 1px solid #3a4a5c;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 0.9rem;
  color: #b0bec5;
}

.section-icon {
  width: 16px;
  height: 16px;
  fill: currentColor;
}

.create-button {
  width: 24px;
  height: 24px;
  border: none;
  background: rgba(100, 181, 246, 0.2);
  color: #64b5f6;
  border-radius: 4px;
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
  width: 14px;
  height: 14px;
  fill: currentColor;
}

/* 房间过滤器 */
.room-filters {
  display: flex;
  padding: 8px 16px;
  gap: 4px;
  background: rgba(0, 0, 0, 0.1);
  border-bottom: 1px solid #3a4a5c;
}

.filter-button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid transparent;
  border-radius: 6px;
  color: #b0bec5;
  font-size: 0.8rem;
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
  width: 12px;
  height: 12px;
  fill: currentColor;
}

.filter-count {
  background: rgba(255, 255, 255, 0.2);
  color: #e0e6ed;
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 0.7rem;
  min-width: 16px;
  text-align: center;
}

.matrix-status-header {
  padding: 10px 15px;
  border-bottom: 1px solid #003300;
  background: rgba(0, 255, 0, 0.05);
}

.status-line, .homeserver-line {
  display: flex;
  align-items: center;
  font-size: 11px;
  margin-bottom: 4px;
}

.status-label, .homeserver-label {
  color: #00ff00;
  font-weight: bold;
  margin-right: 8px;
  min-width: 50px;
}

.status-indicator {
  margin-right: 8px;
  font-size: 8px;
}

.status-indicator.connected {
  color: #00ff00;
  animation: pulse 2s infinite;
}

.status-indicator.connecting {
  color: #ffff00;
  animation: blink 1s infinite;
}

.status-indicator.disconnected {
  color: #ff0000;
}

.status-text {
  color: #00ff00;
  font-weight: bold;
}

.homeserver-url {
  color: #00cccc;
  font-size: 10px;
}

.section-header {
  display: flex;
  align-items: center;
  padding: 8px 15px;
  background: rgba(0, 255, 0, 0.1);
  border-bottom: 1px solid #003300;
}

.section-icon {
  margin-right: 8px;
  font-size: 14px;
}

.section-title {
  color: #00ff00;
  font-weight: bold;
  font-size: 12px;
  flex: 1;
}

.create-room-btn {
  background: none;
  border: 1px solid #00ff00;
  color: #00ff00;
  padding: 2px 6px;
  font-family: 'Share Tech Mono', monospace;
  font-size: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.create-room-btn:hover {
  background: rgba(0, 255, 0, 0.2);
  box-shadow: 0 0 5px #00ff00;
}

.world-channel-item, .room-item {
  display: flex;
  align-items: center;
  padding: 12px 15px;
  cursor: pointer;
  border-bottom: 1px solid #001100;
  transition: all 0.3s ease;
}

.world-channel-item:hover, .room-item:hover {
  background: rgba(0, 255, 0, 0.1);
}

.world-channel-item.active, .room-item.active {
  background: rgba(0, 255, 0, 0.2);
  border-left: 3px solid #00ff00;
}

.room-item.encrypted {
  border-left: 2px solid #ffff00;
}

.room-item.public {
  border-left: 2px solid #00cccc;
}

.channel-icon, .room-icon {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  font-size: 16px;
}

.channel-info, .room-info {
  flex: 1;
  min-width: 0;
}

.channel-name, .room-name {
  color: #00ff00;
  font-weight: bold;
  font-size: 13px;
  margin-bottom: 2px;
}

.channel-alias, .room-alias {
  color: #00cccc;
  font-size: 11px;
  margin-bottom: 2px;
}

.channel-topic, .room-topic {
  color: #666;
  font-size: 10px;
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.last-message {
  font-size: 10px;
  color: #666;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.message-sender {
  color: #00cccc;
  margin-right: 4px;
}

.message-content {
  color: #999;
}

.channel-meta, .room-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.room-status {
  display: flex;
  align-items: center;
  gap: 4px;
}

.member-count {
  color: #00ff00;
  font-size: 10px;
}

.encryption-status, .encryption-indicator {
  font-size: 12px;
}

.join-rule-indicator {
  font-size: 10px;
}

.timestamp {
  color: #666;
  font-size: 9px;
}

.unread-badge {
  background: #ff0000;
  color: #fff;
  border-radius: 10px;
  padding: 2px 6px;
  font-size: 9px;
  min-width: 16px;
  text-align: center;
}

.matrix-protocol-info {
  margin-top: auto;
  padding: 10px 15px;
  border-top: 1px solid #003300;
  background: rgba(0, 255, 0, 0.05);
}

.protocol-header {
  color: #00ff00;
  font-weight: bold;
  font-size: 11px;
  margin-bottom: 8px;
  text-align: center;
}

.protocol-features {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 2px 6px;
  border: 1px solid #003300;
  border-radius: 3px;
  background: rgba(0, 255, 0, 0.1);
}

.feature-icon {
  font-size: 10px;
}

.feature-text {
  color: #00ff00;
  font-size: 9px;
  font-weight: bold;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0.3; }
}

/* 开发者工具样式 */
.dev-tools-section {
  padding: 12px 16px;
  background: rgba(255, 0, 0, 0.05);
  border: 1px solid rgba(255, 0, 0, 0.2);
  margin: 8px;
  border-radius: 8px;
}

.dev-tools-buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 8px;
}

.dev-btn {
  padding: 8px 12px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid #666;
  color: #ccc;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s ease;
}

.dev-btn:hover {
  background: rgba(0, 0, 0, 0.5);
  border-color: #999;
}

.dev-btn.danger {
  border-color: #ff4444;
  color: #ff6666;
}

.dev-btn.danger:hover {
  background: rgba(255, 68, 68, 0.1);
  border-color: #ff6666;
}

.dev-toggle {
  padding: 8px 16px;
  text-align: center;
}

.toggle-dev-btn {
  background: none;
  border: 1px solid #444;
  color: #888;
  padding: 4px 8px;
  font-size: 11px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.toggle-dev-btn:hover {
  border-color: #666;
  color: #aaa;
}
</style>
