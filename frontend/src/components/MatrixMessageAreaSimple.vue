<template>
  <div class="matrix-message-area">
    <!-- Matrix房间头部 -->
    <div class="matrix-room-header" v-if="currentRoom">
      <div class="room-info">
        <div class="room-title">
          <div class="room-name">{{ currentRoom.name }}</div>
          <div class="room-id">{{ currentRoom.id }}</div>
        </div>
      </div>
    </div>

    <!-- Matrix消息容器 -->
    <div class="matrix-messages-container" ref="messagesContainer">
      <div v-if="!currentRoom" class="no-room-selected">
        <div class="welcome-content">
          <div class="welcome-message">
            <h2>欢迎使用Matrix</h2>
            <p>选择一个房间开始聊天</p>
          </div>
        </div>
      </div>

      <div v-else-if="loading" class="loading-messages">
        <div class="loading-spinner">⏳</div>
        <div class="loading-text">加载消息中...</div>
      </div>

      <div v-else class="messages-list">
        <!-- 空消息状态 -->
        <div v-if="messages.length === 0" class="empty-messages">
          <div class="empty-icon">💬</div>
          <div class="empty-text">
            <div class="empty-title">还没有消息</div>
            <div class="empty-desc">成为第一个在这个房间发言的人吧！</div>
          </div>
        </div>
        
        <!-- 消息列表 -->
        <div
          v-for="message in messages"
          :key="message.id"
          class="message-item"
          :class="{
            'own-message': isOwnMessage(message),
            'system-message': isSystemMessage(message)
          }"
        >
          <!-- 消息发送者头像 -->
          <div class="message-avatar" v-if="!isOwnMessage(message) && !isSystemMessage(message)">
            <div class="avatar-placeholder">
              {{ getUserInitials(message.sender) }}
            </div>
          </div>
          
          <!-- 消息内容 -->
          <div class="message-main">
            <!-- 发送者名称 -->
            <div class="message-header" v-if="!isOwnMessage(message) && !isSystemMessage(message)">
              <span class="sender-name">{{ getSenderDisplayName(message) }}</span>
              <span class="message-timestamp">{{ formatMessageTime(message.timestamp) }}</span>
            </div>

            <!-- 消息正文 -->
            <div class="message-content">
              <!-- 系统消息 -->
              <div v-if="isSystemMessage(message)" class="system-message-content">
                <span class="system-icon">ℹ️</span>
                <span class="system-text">{{ message.content }}</span>
              </div>

              <!-- 普通消息 -->
              <div v-else class="regular-message-content">
                <!-- 格式化消息内容 -->
                <div
                  v-if="message.formattedContent && message.format === 'org.matrix.custom.html'"
                  class="message-text formatted-message"
                  v-html="sanitizeHtml(message.formattedContent)"
                ></div>

                <!-- 普通文本消息 -->
                <div v-else class="message-text">{{ message.content }}</div>

                <!-- 消息时间（自己的消息） -->
                <div v-if="isOwnMessage(message)" class="message-meta">
                  <span class="message-time">{{ formatMessageTime(message.timestamp) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Matrix消息输入 -->
    <MatrixMessageInput
      v-if="currentRoom"
      :room-id="currentRoom.id"
      :placeholder="`发送消息到 ${currentRoom.name}...`"
      @send-message="handleSendMessage"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, watch } from 'vue'
import { useMatrixStore } from '@/stores/matrix'
import MatrixMessageInput from './MatrixMessageInput.vue'

interface Props {
  roomId?: string
}

const props = defineProps<Props>()

const matrixStore = useMatrixStore()

// 状态管理
const messagesContainer = ref<HTMLElement>()
const loading = ref(false)

// 计算属性
const currentRoom = computed(() => {
  if (!props.roomId) return null
  return matrixStore.rooms.find(room => room.id === props.roomId)
})

const messages = computed(() => {
  if (!props.roomId) return []
  return matrixStore.messages.get(props.roomId) || []
})

// 方法
const isOwnMessage = (message: any) => {
  return message.sender === matrixStore.currentUser?.id
}

const isSystemMessage = (message: any) => {
  return message.type !== 'm.room.message'
}

const getUserInitials = (name: string): string => {
  if (!name) return '?'
  return name.split(' ').map(word => word[0]).join('').toUpperCase().substring(0, 2)
}

const getSenderDisplayName = (message: any): string => {
  return message.senderName || message.sender.split(':')[0].substring(1)
}

const formatMessageTime = (timestamp: number): string => {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  if (diff < 60000) {
    return '刚刚'
  } else if (diff < 3600000) {
    return `${Math.floor(diff / 60000)}分钟前`
  } else if (diff < 86400000) {
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  } else {
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
  }
}

const sanitizeHtml = (html: string): string => {
  if (!html) return ''

  // 简单的HTML清理，只允许基本的格式化标签
  const allowedTags = ['b', 'i', 'u', 'strong', 'em', 'br', 'p', 'span', 'code', 'pre']
  const allowedAttributes = ['style', 'class']

  // 移除script标签和其他危险内容
  let cleaned = html
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')

  // 这里应该使用更完善的HTML清理库，如DOMPurify
  // 目前只做基本清理
  return cleaned
}

const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

const handleSendMessage = async (content: string) => {
  if (!content.trim() || !currentRoom.value) return

  try {
    await matrixStore.sendMatrixMessage(currentRoom.value.id, content)
    nextTick(() => {
      scrollToBottom()
    })
  } catch (error) {
    console.error('Failed to send message:', error)
  }
}

// 监听房间变化，加载消息
watch(() => props.roomId, async (newRoomId, oldRoomId) => {
  if (newRoomId && newRoomId !== oldRoomId) {
    console.log(`🔄 房间切换: ${oldRoomId} -> ${newRoomId}`)
    
    try {
      loading.value = true
      await matrixStore.fetchMatrixMessages(newRoomId)
      matrixStore.markRoomAsRead(newRoomId)
      
      nextTick(() => {
        scrollToBottom()
      })
    } catch (error) {
      console.error('Failed to load room messages:', error)
    } finally {
      loading.value = false
    }
  }
}, { immediate: true })

// 监听消息变化，自动滚动到底部
watch(() => messages.value, () => {
  nextTick(() => {
    scrollToBottom()
  })
}, { deep: true })
</script>

<style scoped>
.matrix-message-area {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: rgba(0, 0, 0, 0.95);
  font-family: 'Share Tech Mono', monospace;
}

.matrix-room-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 2px solid #00ff00;
  background: rgba(0, 255, 0, 0.05);
}

.room-name {
  color: #00ff00;
  font-weight: bold;
  font-size: 16px;
}

.room-id {
  color: #666;
  font-size: 12px;
}

.matrix-messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.no-room-selected {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  color: #666;
}

.loading-messages {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #00ff00;
}

.loading-spinner {
  font-size: 24px;
  margin-bottom: 10px;
}

.empty-messages {
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

.empty-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 8px;
  color: #00ff00;
}

.empty-desc {
  font-size: 14px;
  opacity: 0.7;
}

.message-item {
  display: flex;
  margin-bottom: 8px;
  padding: 4px 0;
}

.message-item.own-message {
  flex-direction: row-reverse;
}

.message-item.own-message .message-main {
  align-items: flex-end;
}

.message-item.system-message {
  justify-content: center;
  background: rgba(255, 255, 0, 0.05);
  border-radius: 8px;
  margin: 8px 0;
  padding: 8px;
}

.message-avatar {
  width: 32px;
  height: 32px;
  margin-right: 8px;
  flex-shrink: 0;
}

.avatar-placeholder {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(0, 255, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #00ff00;
  font-size: 12px;
  font-weight: bold;
}

.message-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.message-header {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 2px;
}

.sender-name {
  color: #00ff00;
  font-weight: bold;
  font-size: 14px;
}

.message-timestamp {
  color: #666;
  font-size: 11px;
}

.message-content {
  display: flex;
  flex-direction: column;
}

.system-message-content {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #ffff00;
}

.regular-message-content {
  color: #ffffff;
  line-height: 1.4;
}

.message-text {
  word-wrap: break-word;
  white-space: pre-wrap;
}

.formatted-message {
  /* 格式化消息的特殊样式 */
}

.formatted-message b,
.formatted-message strong {
  color: #00ff00;
  font-weight: bold;
}

.formatted-message i,
.formatted-message em {
  color: #ffff00;
  font-style: italic;
}

.formatted-message u {
  text-decoration: underline;
  color: #00ffff;
}

.formatted-message code {
  background: rgba(0, 255, 0, 0.1);
  color: #00ff00;
  padding: 2px 4px;
  border-radius: 3px;
  font-family: 'Courier New', monospace;
}

.formatted-message pre {
  background: rgba(0, 255, 0, 0.05);
  color: #00ff00;
  padding: 8px;
  border-radius: 4px;
  border-left: 3px solid #00ff00;
  font-family: 'Courier New', monospace;
  overflow-x: auto;
}

.message-meta {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: #666;
  margin-top: 2px;
}

.message-time {
  color: #666;
}
</style>
