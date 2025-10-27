<template>
  <div class="read-receipt-indicator" v-if="showReceipts">
    <div class="receipt-avatars">
      <div
        v-for="user in readByUsers.slice(0, 3)"
        :key="user.userId"
        class="receipt-avatar"
        :title="`已读 - ${user.displayName || user.userId}`"
      >
        <img v-if="user.avatarUrl" :src="user.avatarUrl" :alt="user.displayName" />
        <div v-else class="avatar-placeholder">
          {{ getUserInitials(user.displayName || user.userId) }}
        </div>
      </div>
      
      <div v-if="readByUsers.length > 3" class="more-count" :title="`还有 ${readByUsers.length - 3} 人已读`">
        +{{ readByUsers.length - 3 }}
      </div>
    </div>
    
    <div class="receipt-status">
      <span class="status-text">{{ getStatusText() }}</span>
      <span class="read-time" v-if="latestReadTime">{{ formatReadTime(latestReadTime) }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useMatrixStore } from '@/stores/matrix'

interface ReadUser {
  userId: string
  displayName?: string
  avatarUrl?: string
  readTime: number
}

const props = defineProps<{
  roomId: string
  eventId: string
  timestamp: number
  isOwnMessage?: boolean
}>()

const matrixStore = useMatrixStore()
const readByUsers = ref<ReadUser[]>([])

const showReceipts = computed(() => {
  return props.isOwnMessage && readByUsers.value.length > 0
})

const latestReadTime = computed(() => {
  if (readByUsers.value.length === 0) return null
  return Math.max(...readByUsers.value.map(u => u.readTime))
})

const getStatusText = (): string => {
  const count = readByUsers.value.length
  if (count === 0) return ''
  if (count === 1) return '已读'
  return `${count}人已读`
}

const getUserInitials = (name: string): string => {
  if (!name) return '?'
  const cleanName = name.replace('@', '').split(':')[0]
  return cleanName.substring(0, 1).toUpperCase()
}

const formatReadTime = (timestamp: number): string => {
  const now = Date.now()
  const diff = now - timestamp
  
  if (diff < 60000) { // 1分钟内
    return '刚刚'
  } else if (diff < 3600000) { // 1小时内
    const minutes = Math.floor(diff / 60000)
    return `${minutes}分钟前`
  } else if (diff < 86400000) { // 24小时内
    const hours = Math.floor(diff / 3600000)
    return `${hours}小时前`
  } else {
    const date = new Date(timestamp)
    return date.toLocaleDateString()
  }
}

const loadReadReceipts = async () => {
  if (!matrixStore.matrixClient || !props.isOwnMessage) return

  try {
    const room = matrixStore.matrixClient.getRoom(props.roomId)
    if (!room) return

    const event = room.findEventById(props.eventId)
    if (!event) return

    // 获取房间成员的已读回执
    const roomMembers = room.getJoinedMembers()
    const currentUserId = matrixStore.matrixClient.getUserId()
    const readUsers: ReadUser[] = []

    for (const member of roomMembers) {
      const userId = member.userId
      
      // 跳过自己
      if (userId === currentUserId) continue

      try {
        // 获取用户的已读回执
        const receipt = room.getReadReceiptForUserId(userId, false)
        if (receipt && receipt.eventId) {
          // 检查已读的事件是否在当前消息之后
          const readEvent = room.findEventById(receipt.eventId)
          if (readEvent && readEvent.getTs() >= props.timestamp) {
            const user: ReadUser = {
              userId,
              displayName: member.name,
              avatarUrl: member.getAvatarUrl(
                matrixStore.matrixClient.getHomeserverUrl(),
                32, 32, 'crop'
              ),
              readTime: receipt.ts || Date.now()
            }
            readUsers.push(user)
          }
        }
      } catch (error) {
        console.warn(`获取用户 ${userId} 的已读回执失败:`, error)
      }
    }

    // 按已读时间排序
    readUsers.sort((a, b) => b.readTime - a.readTime)
    readByUsers.value = readUsers

  } catch (error) {
    console.error('加载已读回执失败:', error)
  }
}

// 监听已读回执事件
const handleReceiptEvent = (event: any) => {
  if (event.getRoomId() === props.roomId) {
    // 延迟加载以确保数据更新
    setTimeout(loadReadReceipts, 500)
  }
}

onMounted(() => {
  loadReadReceipts()
  
  // 监听已读回执事件
  if (matrixStore.matrixClient) {
    matrixStore.matrixClient.on('Room.receipt', handleReceiptEvent)
  }
})

// 监听消息变化
watch(() => props.eventId, () => {
  loadReadReceipts()
})

// 清理事件监听器
const cleanup = () => {
  if (matrixStore.matrixClient) {
    matrixStore.matrixClient.removeListener('Room.receipt', handleReceiptEvent)
  }
}

// 组件卸载时清理
import { onUnmounted } from 'vue'
onUnmounted(cleanup)
</script>

<style scoped>
.read-receipt-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
  justify-content: flex-end;
  font-size: 11px;
}

.receipt-avatars {
  display: flex;
  align-items: center;
  gap: -2px; /* 重叠效果 */
}

.receipt-avatar {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 1px solid #333;
  overflow: hidden;
  position: relative;
  z-index: 1;
}

.receipt-avatar:not(:first-child) {
  margin-left: -4px;
}

.receipt-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  background: #00ff00;
  color: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 8px;
  font-weight: bold;
}

.more-count {
  background: #333;
  color: #00ff00;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 8px;
  font-weight: bold;
  border: 1px solid #00ff00;
  margin-left: -4px;
}

.receipt-status {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 1px;
}

.status-text {
  color: #00ff00;
  font-weight: bold;
}

.read-time {
  color: #888;
  font-size: 10px;
}
</style>