<template>
  <div class="matrix-message-area">
    <!-- Matrix房间头部 -->
    <div class="matrix-room-header" v-if="currentRoom">
      <div class="room-info">
        <div class="room-title">
          <div class="room-name">{{ currentRoom.name }}</div>
          <div class="room-id">{{ currentRoom.id }}</div>
        </div>
        <!-- 加密状态指示器 -->
        <EncryptionIndicator
          type="room"
          :encrypted="currentRoom.encrypted"
          :member-count="currentRoom.memberCount"
          :verified-devices="getVerifiedDevicesCount()"
          :total-devices="getTotalDevicesCount()"
          :algorithm="getRoomEncryptionAlgorithm()"
        />
      </div>
    </div>

    <!-- Matrix消息容器 -->
    <div class="matrix-messages-container" ref="messagesContainer" @scroll="handleScroll">
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
          <div class="empty-icon">{{ getEmptyStateIcon() }}</div>
          <div class="empty-text">
            <div class="empty-title">{{ getEmptyStateTitle() }}</div>
            <div class="empty-desc">{{ getEmptyStateDesc() }}</div>
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
                <div class="message-bubble">
                  <!-- 文件消息 -->
                  <div v-if="message.fileInfo" class="file-message">
                    <!-- 图片预览 -->
                    <div v-if="message.fileInfo.isImage && message.fileInfo.url" class="image-preview">
                      <img :src="message.fileInfo.url" :alt="message.fileInfo.name" @click="openImagePreview(message.fileInfo)" />
                    </div>
                    <!-- 文件信息 -->
                    <div class="file-info">
                      <div class="file-icon">
                        {{ message.fileInfo.isImage ? '🖼️' : getFileIcon(message.fileInfo.type) }}
                      </div>
                      <div class="file-details">
                        <div class="file-name">{{ message.fileInfo.name }}</div>
                        <div class="file-size">{{ formatFileSize(message.fileInfo.size) }}</div>
                      </div>
                      <div class="file-actions">
                        <button @click="downloadFile(message.fileInfo)" class="download-btn">
                          📥
                        </button>
                      </div>
                    </div>
                  </div>

                  <!-- 格式化消息内容 -->
                  <div
                    v-else-if="message.formattedContent && message.format === 'org.matrix.custom.html'"
                    class="message-text formatted-message"
                    v-html="sanitizeHtml(message.formattedContent)"
                  ></div>

                  <!-- 普通文本消息 -->
                  <div v-else class="message-text">{{ message.content }}</div>
                </div>

                <!-- 消息时间和加密状态 -->
                <div class="message-meta">
                  <span class="message-time">{{ formatMessageTime(message.timestamp) }}</span>
                  <EncryptionIndicator
                    type="message"
                    :encrypted="message.encrypted"
                    :decrypted="!message.decryptionError"
                    :decryption-error="message.decryptionError"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Matrix消息输入 -->
    <MatrixMessageInput
      v-if="currentRoom && canSendMessages"
      :room-id="currentRoom.id"
      :placeholder="`发送消息到 ${currentRoom.name}...`"
      @send-message="handleSendMessage"
    />

    <!-- 无发送权限提示 -->
    <div v-else-if="currentRoom && !canSendMessages" class="no-send-permission">
      🔒 您在此房间只有查看权限，无法发送消息
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, watch } from 'vue'
import { useMatrixStore } from '@/stores/matrix'
import MatrixMessageInput from './MatrixMessageInput.vue'
import EncryptionIndicator from './EncryptionIndicator.vue'

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
  // 监听messageUpdateTrigger以确保响应式更新
  matrixStore.messageUpdateTrigger
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

// 加载更多历史消息
const loadMoreMessages = async () => {
  if (!currentRoom.value || loading.value) return
  
  try {
    // 检查是否有足够的滚动空间来加载更多
    const container = messagesContainer.value
    if (!container) return

    // 如果内容高度不超过容器，或者已经没有更多消息，就不加载
    if (container.scrollHeight <= container.clientHeight) {
      console.log('内容未填满，暂不加载更多')
      return
    }

    loading.value = true
    console.log('📚 加载更多历史消息...')

    const oldScrollHeight = container.scrollHeight
    const oldScrollTop = container.scrollTop

    // 调用store中的加载历史消息方法
    await matrixStore.loadMoreHistoryMessages(currentRoom.value.id)

    // 恢复滚动位置，保持用户当前查看的位置
    nextTick(() => {
      if (container) {
        const newScrollHeight = container.scrollHeight
        const heightDifference = newScrollHeight - oldScrollHeight
        container.scrollTop = oldScrollTop + heightDifference
      }
    })

  } catch (error) {
    console.error('加载历史消息失败:', error)
  } finally {
    loading.value = false
  }
}

// 节流定时器
let scrollThrottleTimer: number | null = null
let isLoadingMore = false

// 处理滚动事件
const handleScroll = (event: Event) => {
  const container = event.target as HTMLElement
  if (!container || loading.value || isLoadingMore) return

  // 节流处理：确保滚动事件不会太频繁触发
  if (scrollThrottleTimer) {
    return
  }

  scrollThrottleTimer = window.setTimeout(async () => {
    scrollThrottleTimer = null

    // 只有在靠近顶部且不在加载中时才加载更多
    if (container.scrollTop < 50) {
      isLoadingMore = true
      await loadMoreMessages()
      isLoadingMore = false
    }
  }, 500) // 500ms的节流延迟
}

const handleSendMessage = async (content: string) => {
  if (!content.trim() || !currentRoom.value) return

  try {
    await matrixStore.sendMatrixMessage(currentRoom.value.id, content)
    nextTick(() => {
      scrollToBottom()
    })
  } catch (error: any) {
    console.error('Failed to send message:', error)

    // 显示用户友好的错误提示
    const errorMessage = error.message || '发送消息失败'

    // 可以在这里添加Toast通知或其他UI反馈
    // 暂时使用alert作为临时解决方案
    if (errorMessage.includes('加密')) {
      alert('⚠️ 加密房间暂不支持\n\n' + errorMessage)
    } else {
      alert('❌ 发送失败: ' + errorMessage)
    }
  }
}

// 根据房间状态获取空状态图标
const getEmptyStateIcon = () => {
  if (!currentRoom.value) return '💬'

  // 检查房间权限
  const matrixClient = matrixStore.matrixClient
  if (matrixClient) {
    const room = matrixClient.getRoom(currentRoom.value.id)
    if (room) {
      const canSend = room.maySendMessage()
      if (!canSend) return '🔒'
    }
  }

  return '💬'
}

// 根据房间状态获取空状态标题
const getEmptyStateTitle = () => {
  if (!currentRoom.value) return '还没有消息'

  // 检查房间权限
  const matrixClient = matrixStore.matrixClient
  if (matrixClient) {
    const room = matrixClient.getRoom(currentRoom.value.id)
    if (room) {
      const canSend = room.maySendMessage()
      if (!canSend) return '只读房间'
    }
  }

  return '还没有消息'
}

// 根据房间状态获取空状态描述
const getEmptyStateDesc = () => {
  if (!currentRoom.value) return '成为第一个在这个房间发言的人吧！'

  // 检查房间权限
  const matrixClient = matrixStore.matrixClient
  if (matrixClient) {
    const room = matrixClient.getRoom(currentRoom.value.id)
    if (room) {
      const canSend = room.maySendMessage()
      if (!canSend) {
        return '您在此房间只有查看权限，无法发送消息'
      }
    }
  }

  return '成为第一个在这个房间发言的人吧！'
}

// 检查是否可以发送消息
const canSendMessages = computed(() => {
  if (!currentRoom.value) return false

  const matrixClient = matrixStore.matrixClient
  if (matrixClient) {
    const room = matrixClient.getRoom(currentRoom.value.id)
    if (room) {
      return room.maySendMessage()
    }
  }

  return true // 默认允许发送
})

// 加密相关方法
const getVerifiedDevicesCount = (): number => {
  // 这里需要实现获取已验证设备数量的逻辑
  return 0
}

const getTotalDevicesCount = (): number => {
  // 这里需要实现获取总设备数量的逻辑
  return 1
}

const getRoomEncryptionAlgorithm = (): string | undefined => {
  if (!currentRoom.value?.encrypted) return undefined
  return 'm.megolm.v1.aes-sha2' // 默认算法
}

// 文件相关方法
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
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

const openImagePreview = (fileInfo: any) => {
  // 创建图片预览模态框
  const modal = document.createElement('div')
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.9);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10000;
    cursor: pointer;
  `

  const img = document.createElement('img')
  img.src = fileInfo.url
  img.style.cssText = `
    max-width: 90%;
    max-height: 90%;
    object-fit: contain;
  `

  modal.appendChild(img)
  document.body.appendChild(modal)

  modal.onclick = () => {
    document.body.removeChild(modal)
  }
}

const downloadFile = (fileInfo: any) => {
  const link = document.createElement('a')
  link.href = fileInfo.url
  link.download = fileInfo.name
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
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

// 监听消息变化，只有在用户在底部时才自动滚动到底部
watch(() => messages.value, (newMessages, oldMessages) => {
  nextTick(() => {
    const container = messagesContainer.value
    if (!container) return

    // 检查用户是否在底部附近（距离底部小于100px）
    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100

    // 如果是新消息（不是历史消息）且用户在底部，则滚动到底部
    if (isNearBottom && newMessages && oldMessages && newMessages.length > oldMessages.length) {
      scrollToBottom()
    }
  })
}, { deep: true })
</script>

<style scoped>
.matrix-message-area {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Helvetica Neue', Helvetica, Arial, sans-serif;
}

.matrix-room-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  background: #ffffff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.room-name {
  color: #333;
  font-weight: 500;
  font-size: 16px;
}

.room-id {
  color: #999;
  font-size: 12px;
  margin-top: 2px;
}

.matrix-messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background: #f5f5f5;
}

.no-room-selected {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  color: #999;
  background: #f5f5f5;
}

.loading-messages {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #999;
  background: #f5f5f5;
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
  padding: 60px 20px;
  color: #999;
  text-align: center;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.3;
}

.empty-title {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 8px;
  color: #666;
}

.empty-desc {
  font-size: 14px;
  opacity: 0.7;
  color: #999;
}

.no-send-permission {
  padding: 16px;
  text-align: center;
  background: rgba(255, 193, 7, 0.1);
  border: 1px solid rgba(255, 193, 7, 0.3);
  border-radius: 8px;
  color: #856404;
  font-size: 14px;
  margin: 16px;
}

.message-item {
  display: flex;
  margin-bottom: 16px;
  padding: 0 16px;
  align-items: flex-start;
  gap: 10px;
}

.message-item.own-message {
  flex-direction: row-reverse;
  justify-content: flex-start;
}

.message-item.own-message .message-main {
  align-items: flex-end;
}

.message-item.system-message {
  justify-content: center;
  background: transparent;
  border-radius: 0;
  margin: 8px 0;
  padding: 8px;
}

.message-avatar {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
}

.avatar-placeholder {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  background: #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  font-size: 14px;
  font-weight: 400;
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
  color: #576b95;
  font-weight: 500;
  font-size: 13px;
  margin-bottom: 4px;
}

.message-timestamp {
  color: #999;
  font-size: 11px;
}

.message-meta {
  margin-top: 4px;
  text-align: right;
}

.own-message .message-meta {
  text-align: left;
}

.message-time {
  color: #999;
  font-size: 11px;
}

.message-content {
  display: flex;
  flex-direction: column;
  max-width: 70%;
  word-wrap: break-word;
}

.message-bubble {
  background: #ffffff;
  padding: 8px 12px;
  border-radius: 8px;
  position: relative;
  margin: 2px 0;
  line-height: 1.4;
  font-size: 14px;
  color: #333;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.own-message .message-bubble {
  background: #95ec69;
  color: #333;
  margin-left: auto;
  border: 1px solid rgba(149, 236, 105, 0.3);
}

.message-bubble::before {
  content: '';
  position: absolute;
  top: 10px;
  width: 0;
  height: 0;
  border: 5px solid transparent;
}

.message-bubble::before {
  left: -10px;
  border-right-color: #ffffff;
}

.own-message .message-bubble::before {
  left: auto;
  right: -10px;
  border-left-color: #95ec69;
  border-right-color: transparent;
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

/* 文件消息样式 */
.file-message {
  max-width: 300px;
}

.image-preview {
  margin-bottom: 8px;
}

.image-preview img {
  max-width: 100%;
  max-height: 200px;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.image-preview img:hover {
  transform: scale(1.02);
}

.file-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.file-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.file-details {
  flex: 1;
  min-width: 0;
}

.file-name {
  font-weight: 500;
  font-size: 14px;
  color: #ffffff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-size {
  font-size: 12px;
  color: #888;
  margin-top: 2px;
}

.file-actions {
  flex-shrink: 0;
}

.download-btn {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.download-btn:hover {
  background: rgba(255, 255, 255, 0.1);
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
