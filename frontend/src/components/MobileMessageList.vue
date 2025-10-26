<template>
  <div class="mobile-message-list">
    <!-- 房间头部 -->
    <div class="room-header" v-if="currentRoom">
      <div class="header-content">
        <div class="room-info">
          <div class="room-avatar">
            <img v-if="currentRoom.avatarUrl" :src="currentRoom.avatarUrl" :alt="currentRoom.name" />
            <div v-else class="avatar-placeholder">
              {{ getRoomInitials(currentRoom.name) }}
            </div>
          </div>
          <div class="room-details">
            <div class="room-name">{{ currentRoom.name }}</div>
            <div class="room-topic" v-if="currentRoom.topic">{{ currentRoom.topic }}</div>
          </div>
        </div>
        
        <div class="header-actions">
          <button class="header-action" @click="showRoomInfo = true">
            <svg viewBox="0 0 24 24" class="action-icon">
              <path d="M11,9H13V7H11M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M11,17H13V11H11V17Z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- 消息列表 -->
    <div class="messages-container" ref="messagesContainer">
      <div v-if="!currentRoom" class="no-room-selected">
        <div class="welcome-content">
          <div class="wechat-logo">
            <svg viewBox="0 0 24 24" class="logo-icon">
              <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6M12,8A4,4 0 0,0 8,12A4,4 0 0,0 12,16A4,4 0 0,0 16,12A4,4 0 0,0 12,8Z"/>
            </svg>
          </div>
          <div class="welcome-message">
            <h3>微信</h3>
            <p>点击上方联系人开始聊天</p>
          </div>
        </div>
      </div>

      <div v-else-if="loading" class="loading-messages">
        <div class="loading-spinner"></div>
        <div class="loading-text">正在加载消息...</div>
      </div>

      <div v-else class="messages-list">
        <!-- 加密会话提示 -->
        <div v-if="currentRoom.encrypted && messages.length === 0" class="encryption-notice">
          <div class="notice-icon">
            <svg viewBox="0 0 24 24">
              <path d="M12,17A2,2 0 0,0 14,15C14,13.89 13.1,13 12,13A2,2 0 0,0 10,15A2,2 0 0,0 12,17M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V10C4,8.89 4.9,8 6,8H7V6A5,5 0 0,1 12,1A5,5 0 0,1 17,6V8H18M12,3A3,3 0 0,0 9,6V8H15V6A3,3 0 0,0 12,3Z"/>
            </svg>
          </div>
          <div class="notice-text">
            <div class="notice-title">加密聊天</div>
            <div class="notice-desc">此聊天已启用端到端加密</div>
          </div>
        </div>

        <!-- 消息列表 -->
        <div v-for="(message, index) in messages" :key="message.id" class="message-item" :class="{
          'own-message': isOwnMessage(message),
          'first-in-group': isFirstInGroup(message, index),
          'last-in-group': isLastInGroup(message, index)
        }">
          <!-- 消息头像 -->
          <div class="message-avatar" v-if="!isOwnMessage(message) && isFirstInGroup(message, index)">
            <div class="avatar-container">
              <img v-if="message.senderAvatar" :src="message.senderAvatar" :alt="message.senderName || message.sender" />
              <div v-else class="avatar-placeholder">
                {{ getUserInitials(message.senderName || message.sender) }}
              </div>
            </div>
          </div>

          <div class="message-content" :class="{ 'with-avatar': !isOwnMessage(message) && isFirstInGroup(message, index) }">
            <!-- 发送者信息 -->
            <div class="message-header" v-if="!isOwnMessage(message) && isFirstInGroup(message, index)">
              <span class="sender-name">{{ getSenderDisplayName(message) }}</span>
              <span class="message-time">{{ formatMessageTime(message.timestamp) }}</span>
            </div>

            <!-- 消息内容 -->
            <div class="message-bubble" :class="{ 'own-bubble': isOwnMessage(message) }">
              <!-- 文件消息 -->
              <div v-if="message.fileInfo" class="file-message">
                <div class="file-preview" v-if="message.fileInfo.isImage && message.fileInfo.url">
                  <img :src="message.fileInfo.url" :alt="message.fileInfo.name" @click="openImagePreview(message.fileInfo)" />
                </div>
                <div class="file-info">
                  <div class="file-icon">{{ getFileIcon(message.fileInfo.type) }}</div>
                  <div class="file-details">
                    <div class="file-name">{{ message.fileInfo.name }}</div>
                    <div class="file-size">{{ formatFileSize(message.fileInfo.size) }}</div>
                  </div>
                  <button class="download-btn" @click="downloadFile(message.fileInfo)">下载</button>
                </div>
              </div>
              
              <!-- 文本消息 -->
              <div v-else class="message-text">{{ message.content }}</div>

              <!-- 消息状态 -->
              <div v-if="isOwnMessage(message)" class="message-meta">
                <span class="message-time">{{ formatMessageTime(message.timestamp) }}</span>
                <div class="message-status">
                  <svg v-if="message.status === 'sending'" class="status-icon sending" viewBox="0 0 24 24">
                    <path d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z"/>
                  </svg>
                  <svg v-else-if="message.status === 'sent'" class="status-icon sent" viewBox="0 0 24 24">
                    <path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"/>
                  </svg>
                  <svg v-else-if="message.status === 'delivered'" class="status-icon delivered" viewBox="0 0 24 24">
                    <path d="M0.41,13.41L6,19L7.41,17.58L1.83,12M22.24,5.58L11.66,16.17L7.5,12L6.07,13.41L11.66,19L23.66,7M18,7L16.59,5.58L10.24,11.93L11.66,13.34L18,7Z"/>
                  </svg>
                  <svg v-else-if="message.status === 'failed'" class="status-icon failed" viewBox="0 0 24 24">
                    <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 空消息状态 -->
        <div v-if="messages.length === 0 && !loading" class="empty-messages">
          <div class="empty-icon">💬</div>
          <div class="empty-title">还没有消息</div>
          <div class="empty-desc">成为第一个在这个房间发言的人吧！</div>
        </div>
      </div>
    </div>

    <!-- 消息输入 -->
    <MobileMessageInput
      v-if="currentRoom"
      :room-id="currentRoom.id"
      :placeholder="`发送消息到 ${currentRoom.name}...`"
      :supports-encryption="currentRoom.encrypted"
      @send-message="handleSendMessage"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, watch, onMounted } from 'vue'
import { useMatrixStore } from '@/stores/matrix'
import MobileMessageInput from './MobileMessageInput.vue'

interface Props {
  roomId?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'user-clicked': [userId: string]
}>()

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
const getRoomInitials = (name: string): string => {
  return name.split(' ').map(word => word[0]).join('').toUpperCase().substring(0, 2)
}

const isOwnMessage = (message: any) => {
  return message.sender === matrixStore.currentUser?.id
}

const isFirstInGroup = (message: any, index: number) => {
  if (index === 0) return true
  const prevMessage = messages.value[index - 1]
  return prevMessage.sender !== message.sender ||
         (message.timestamp - prevMessage.timestamp) > 300000 // 5分钟
}

const isLastInGroup = (message: any, index: number) => {
  if (index === messages.value.length - 1) return true
  const nextMessage = messages.value[index + 1]
  return nextMessage.sender !== message.sender ||
         (nextMessage.timestamp - message.timestamp) > 300000 // 5分钟
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

  if (diff < 60000) { // 1分钟内
    return '刚刚'
  } else if (diff < 3600000) { // 1小时内
    return `${Math.floor(diff / 60000)}分钟前`
  } else if (diff < 86400000) { // 24小时内
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  } else {
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
  }
}

const getFileIcon = (type: string): string => {
  if (type.startsWith('image/')) return '🖼️'
  if (type.startsWith('video/')) return '🎥'
  if (type.startsWith('audio/')) return '🎵'
  if (type.includes('pdf')) return '📄'
  if (type.includes('word') || type.includes('doc')) return '📝'
  if (type.includes('excel') || type.includes('sheet')) return '📊'
  if (type.includes('powerpoint') || type.includes('presentation')) return '📽️'
  if (type.includes('zip') || type.includes('rar') || type.includes('7z')) return '📦'
  return '📎'
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const handleSendMessage = async (content: string, options?: any) => {
  if (!content.trim() || !currentRoom.value) return

  try {
    await matrixStore.sendMatrixMessage(currentRoom.value.id, content, options)
    
    // 滚动到底部
    nextTick(() => {
      scrollToBottom()
    })
  } catch (error) {
    console.error('Failed to send message:', error)
  }
}

const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

// 监听房间变化，加载消息
watch(() => props.roomId, async (newRoomId, oldRoomId) => {
  if (newRoomId && newRoomId !== oldRoomId) {
    try {
      loading.value = true
      await matrixStore.fetchMatrixMessages(newRoomId)
      
      // 滚动到底部
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

// 用户交互方法
const startDirectMessage = (userId: string) => {
  console.log('Starting direct message with:', userId)
}

const showUserProfile = (userId: string) => {
  console.log('Showing profile for:', userId)
}
</script>

<style scoped>
.mobile-message-list {
  height: 100vh;
  background: #f8f9fa;
  display: flex;
  flex-direction: column;
}

.room-header {
  background: #ffffff;
  border-bottom: 1px solid #e8e8e8;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-content {
  display: flex;
  align-items: center;
  width: 100%;
}

.room-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.room-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
}

.room-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: linear-gradient(135deg, #07c160, #52c41a);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 16px;
}

.room-details {
  flex: 1;
  min-width: 0;
}

.room-name {
  font-size: 16px;
  font-weight: 600;
  color: #222;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.room-topic {
  font-size: 12px;
  color: #888;
  margin-top: 2px;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.header-action {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s;
}

.header-action:hover {
  background: #f5f5f5;
}

.action-icon {
  width: 18px;
  height: 18px;
  fill: #888;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  background: #ffffff;
}

.messages-list {
  padding: 8px 16px;
}

.message-item {
  display: flex;
  margin-bottom: 8px;
  padding: 4px 0;
}

.message-item.first-in-group {
  margin-top: 12px;
}

.message-item.last-in-group {
  margin-bottom: 12px;
}

.message-avatar {
  width: 32px;
  height: 32px;
  margin-right: 8px;
  flex-shrink: 0;
}

.avatar-container {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  overflow: hidden;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.message-content {
  flex: 1;
  min-width: 0;
}

.message-content.with-avatar {
  margin-left: 44px;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.sender-name {
  font-size: 12px;
  color: #888;
  font-weight: 500;
}

.message-time {
  font-size: 11px;
  color: #888;
}

.message-bubble {
  background: #f5f5f5;
  border-radius: 18px;
  padding: 8px 12px;
  margin-bottom: 4px;
  position: relative;
}

.message-bubble.own-bubble {
  background: #07c160;
  color: white;
  margin-left: auto;
  border-radius: 18px;
}

.message-text {
  font-size: 14px;
  line-height: 1.4;
  color: #222;
}

.file-message {
  margin-bottom: 8px;
}

.file-preview img {
  width: 100%;
  max-width: 200px;
  border-radius: 8px;
  cursor: pointer;
  margin-bottom: 6px;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background: #f5f5f5;
  border-radius: 8px;
  border: 1px solid #e8e8e8;
}

.file-icon {
  font-size: 16px;
  flex-shrink: 0;
}

.file-details {
  flex: 1;
  min-width: 0;
}

.file-name {
  font-size: 12px;
  color: #222;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-size {
  font-size: 10px;
  color: #888;
  margin-top: 2px;
}

.download-btn {
  background: #07c160;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 2px 6px;
  font-size: 10px;
  cursor: pointer;
}

.download-btn:hover {
  background: #52c41a;
}

.message-meta {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
}

.message-meta .message-time {
  font-size: 10px;
  color: #888;
}

.message-status {
  display: flex;
  gap: 4px;
}

.status-icon {
  width: 12px;
  height: 12px;
  fill: #888;
}

.status-icon.sending {
  animation: spin 1s linear infinite;
}

.status-icon.sent {
  fill: #07c160;
}

.status-icon.delivered {
  fill: #07c160;
}

.status-icon.failed {
  fill: #ff4d4f;
}

/* 加密通知 */
.encryption-notice {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #f6ffed;
  border: 1px solid #b7eb8f;
  border-radius: 8px;
  margin: 16px;
}

.notice-icon svg {
  width: 16px;
  height: 16px;
  fill: #52c41a;
}

.notice-title {
  font-size: 14px;
  font-weight: 600;
  color: #222;
}

.notice-desc {
  font-size: 12px;
  color: #666;
}

/* 空消息状态 */
.empty-messages {
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

/* 加载状态 */
.loading-messages {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
}

.loading-spinner {
  width: 24px;
  height: 24px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #07c160;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 12px;
}

.loading-text {
  font-size: 14px;
  color: #888;
}

/* 欢迎页面 */
.welcome-content {
  text-align: center;
  padding: 40px 20px;
}

.wechat-logo {
  margin-bottom: 24px;
}

.logo-icon {
  width: 48px;
  height: 48px;
  fill: #07c160;
}

.welcome-content h3 {
  font-size: 24px;
  font-weight: 600;
  color: #222;
  margin-bottom: 8px;
}

.welcome-content p {
  font-size: 14px;
  color: #888;
}

/* 滚动条样式 */
.messages-container::-webkit-scrollbar {
  width: 4px;
}

.messages-container::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.messages-container::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 2px;
}

.messages-container::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 动画 */
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>