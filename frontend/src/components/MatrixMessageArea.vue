<template>
  <div class="matrix-message-area">
    <!-- Matrix房间头部 -->
    <div class="matrix-room-header" v-if="currentRoom">
      <div class="room-info">
        <div class="room-title">
          <div class="room-avatar">
            <img v-if="currentRoom.avatarUrl" :src="currentRoom.avatarUrl" :alt="currentRoom.name" />
            <div v-else class="avatar-placeholder">
              {{ getRoomInitials(currentRoom.name) }}
            </div>
          </div>
          <div class="room-text">
            <div class="room-name">{{ currentRoom.name }}</div>
            <div class="room-id">{{ currentRoom.id }}</div>
          </div>
        </div>
        <div class="room-details">
          <div class="room-topic" v-if="currentRoom.topic">{{ currentRoom.topic }}</div>
          <div class="room-alias" v-if="currentRoom.alias">{{ currentRoom.alias }}</div>
        </div>
      </div>

      <div class="room-actions">
        <div class="room-meta">
          <span class="member-count">
            <svg class="meta-icon" viewBox="0 0 24 24">
              <path d="M16,4C18.11,4 20,5.89 20,8C20,10.11 18.11,12 16,12C13.89,12 12,10.11 12,8C12,5.89 13.89,4 16,4M16,14C20.42,14 24,15.79 24,18V20H8V18C8,15.79 11.58,14 16,14Z"/>
            </svg>
            {{ currentRoom.memberCount || 0 }}
          </span>
        </div>

        <!-- Matrix加密状态 -->
        <MatrixEncryptionStatus
          :status="getEncryptionStatus()"
          :encryption-info="currentRoom.encryptionInfo"
          :device-info="currentRoom.deviceInfo"
          :warnings="encryptionWarnings"
          :room-id="currentRoom.id"
          @verify-devices="handleVerifyDevices"
        />

        <div class="header-buttons">
          <button @click="showRoomInfo = true" class="header-button" :title="$t('matrix.roomInfo')">
            <svg viewBox="0 0 24 24">
              <path d="M11,9H13V7H11M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M11,17H13V11H11V17Z"/>
            </svg>
          </button>

          <button @click="showInviteUsers = true" class="header-button" :title="$t('matrix.inviteUsers')">
            <svg viewBox="0 0 24 24">
              <path d="M15,14C12.33,14 7,15.33 7,18V20H23V18C23,15.33 17.67,14 15,14M6,10V7H4V10H1V12H4V15H6V12H9V10M15,12A4,4 0 0,0 19,8A4,4 0 0,0 15,4A4,4 0 0,0 11,8A4,4 0 0,0 15,12Z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Matrix消息列表 -->
    <div class="matrix-messages-container" ref="messagesContainer">
      <div v-if="!currentRoom" class="no-room-selected">
        <div class="welcome-content">
          <div class="matrix-logo">
            <svg class="logo-icon" viewBox="0 0 24 24">
              <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6M12,8A4,4 0 0,0 8,12A4,4 0 0,0 12,16A4,4 0 0,0 16,12A4,4 0 0,0 12,8Z"/>
            </svg>
            <div class="logo-text">
              <div class="logo-main">Matrix Protocol</div>
              <div class="logo-sub">Decentralized Communication</div>
            </div>
          </div>
          <div class="welcome-message">
            <h2>{{ $t('matrix.welcomeToMatrix') }}</h2>
            <p>{{ $t('matrix.selectRoomToStart') }}</p>
          </div>
        </div>
      </div>

      <div v-else-if="loading" class="loading-messages">
        <div class="loading-spinner"></div>
        <div class="loading-text">{{ $t('matrix.loadingMessages') }}</div>
      </div>

      <div v-else class="messages-list">
        <!-- 加密会话开始提示 -->
        <div v-if="currentRoom.encrypted && messages.length === 0" class="encryption-notice">
          <div class="notice-icon">
            <svg viewBox="0 0 24 24">
              <path d="M12,17A2,2 0 0,0 14,15C14,13.89 13.1,13 12,13A2,2 0 0,0 10,15A2,2 0 0,0 12,17M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V10C4,8.89 4.9,8 6,8H7V6A5,5 0 0,1 12,1A5,5 0 0,1 17,6V8H18M12,3A3,3 0 0,0 9,6V8H15V6A3,3 0 0,0 12,3Z"/>
            </svg>
          </div>
          <div class="notice-text">
            <div class="notice-title">{{ $t('matrix.encryptedRoom') }}</div>
            <div class="notice-desc">{{ $t('matrix.encryptedRoomDesc') }}</div>
          </div>
        </div>

        <!-- 消息列表 -->
        <div
          v-for="message in messages"
          :key="message.id"
          class="message-item"
          :class="{
            'own-message': isOwnMessage(message),
            'encrypted-message': message.encrypted,
            'system-message': message.type !== 'm.room.message',
            'verification-message': message.type === 'm.key.verification.request'
          }"
        >
          <!-- 消息发送者信息 -->
          <div class="message-header" v-if="!isOwnMessage(message)">
            <MatrixUserID
              :user-id="message.sender"
              :display-name="message.senderName"
              :avatar-url="message.senderAvatar"
              :show-status="false"
              :show-federation="true"
              :show-actions="true"
              clickable
              @click="$emit('user-clicked', message.sender)"
              @direct-message="startDirectMessage"
              @invite="inviteUser"
              @profile="showUserProfile"
            />
          </div>

          <!-- 消息内容 -->
          <div class="message-content">
            <!-- 加密状态指示器 -->
            <div v-if="message.encrypted" class="message-encryption">
              <svg class="encryption-icon" viewBox="0 0 24 24">
                <path d="M12,17A2,2 0 0,0 14,15C14,13.89 13.1,13 12,13A2,2 0 0,0 10,15A2,2 0 0,0 12,17M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V10C4,8.89 4.9,8 6,8H7V6A5,5 0 0,1 12,1A5,5 0 0,1 17,6V8H18M12,3A3,3 0 0,0 9,6V8H15V6A3,3 0 0,0 12,3Z"/>
              </svg>
              <span class="encryption-text">{{ $t('matrix.encrypted') }}</span>
            </div>

            <!-- 消息正文 -->
            <div class="message-body">
              <!-- 文本消息 -->
              <div v-if="message.type === 'm.room.message'" class="text-message">
                <div class="message-text" v-html="formatMessageContent(message.content)"></div>
              </div>

              <!-- 系统消息 -->
              <div v-else-if="isSystemMessage(message)" class="system-message-content">
                <svg class="system-icon" viewBox="0 0 24 24">
                  <path d="M13,9H11V7H13M13,17H11V11H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/>
                </svg>
                <span>{{ formatSystemMessage(message) }}</span>
              </div>

              <!-- 设备验证消息 -->
              <div v-else-if="message.type === 'm.key.verification.request'" class="verification-message-content">
                <div class="verification-header">
                  <svg class="verification-icon" viewBox="0 0 24 24">
                    <path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"/>
                  </svg>
                  <span>{{ $t('matrix.deviceVerificationRequest') }}</span>
                </div>
                <div class="verification-actions">
                  <button @click="acceptVerification(message)" class="verify-accept">
                    {{ $t('matrix.accept') }}
                  </button>
                  <button @click="declineVerification(message)" class="verify-decline">
                    {{ $t('matrix.decline') }}
                  </button>
                </div>
              </div>
            </div>

            <!-- 消息元数据 -->
            <div class="message-meta">
              <span class="message-time">{{ formatTimestamp(message.timestamp) }}</span>
              <div v-if="message.edited" class="edited-indicator">
                <svg viewBox="0 0 24 24">
                  <path d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z"/>
                </svg>
                <span>{{ $t('matrix.edited') }}</span>
              </div>
              <div v-if="isOwnMessage(message)" class="delivery-status">
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
                  <path d="M13,13H11V7H13M13,17H11V15H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
            </div>
            <div class="message-meta">
              <span class="message-timestamp">{{ formatTimestamp(message.timestamp) }}</span>
              <span v-if="message.encrypted" class="encryption-indicator" title="Encrypted">🔐</span>
              <span class="message-type" :title="message.type">{{ getMessageTypeIcon(message.type) }}</span>
            </div>
          </div>
          
          <div class="message-content">
            <div class="message-text">{{ message.content }}</div>
            <div class="message-details" v-if="message.eventId">
              <span class="event-id">{{ message.eventId.substring(0, 8) }}...</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Matrix消息输入 -->
    <div class="matrix-message-input" v-if="currentRoom">
      <div class="input-header">
        <div class="input-info">
          <span class="input-label">MESSAGE TO:</span>
          <span class="target-room">{{ currentRoom.name }}</span>
        </div>
        <div class="input-features">
          <button 
            class="feature-btn"
            :class="{ active: encryptionEnabled }"
            @click="toggleEncryption"
            title="Toggle Encryption"
          >
            {{ encryptionEnabled ? '🔐' : '🔓' }}
          </button>
          <button class="feature-btn" title="Matrix Protocol">🌐</button>
        </div>
      </div>
      
      <div class="input-container">
        <div class="input-wrapper">
          <textarea
            v-model="messageText"
            @keydown="handleKeyDown"
            placeholder="Type your Matrix message..."
            class="message-textarea"
            rows="1"
            ref="messageInput"
          ></textarea>
          <button 
            @click="sendMessage"
            :disabled="!messageText.trim() || matrixStore.loading"
            class="send-button"
          >
            SEND
          </button>
        </div>
        
        <div class="input-status">
          <div class="typing-indicator" v-if="isTyping">
            <span class="typing-text">Typing...</span>
            <span class="typing-animation">⟳</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, watch, onMounted } from 'vue'
import { useMatrixStore } from '@/stores/matrix'
import { messageAPI, matrixAPI } from '@/services/api'
import MatrixUserID from './MatrixUserID.vue'
import MatrixEncryptionStatus from './MatrixEncryptionStatus.vue'

interface Props {
  roomId?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'user-clicked': [userId: string]
}>()

const matrixStore = useMatrixStore()

// 状态管理
const messageText = ref('')
const messagesContainer = ref<HTMLElement>()
const messageInput = ref<HTMLTextAreaElement>()
const loading = ref(false)
const isTyping = ref(false)

// 界面状态
const showRoomInfo = ref(false)
const showInviteUsers = ref(false)

// 加密相关
const encryptionWarnings = ref<string[]>([])

// 计算属性
const currentRoom = computed(() => {
  if (!props.roomId) return null
  return matrixStore.rooms.find(room => room.id === props.roomId)
})

const messages = computed(() => {
  if (!props.roomId) return []
  return matrixStore.getMessagesForRoom(props.roomId)
})

// 方法
const getRoomInitials = (name: string): string => {
  return name.split(' ').map(word => word[0]).join('').toUpperCase().substring(0, 2)
}

const getEncryptionStatus = () => {
  if (!currentRoom.value) return 'unencrypted'

  if (currentRoom.value.encrypted) {
    if (encryptionWarnings.value.length > 0) {
      return 'warning'
    }
    return 'encrypted'
  }

  return 'unencrypted'
}

const isOwnMessage = (message: any) => {
  return message.sender === matrixStore.currentUser?.userId
}

const isSystemMessage = (message: any) => {
  return message.type !== 'm.room.message'
}

const formatTimestamp = (timestamp: number) => {
  const date = new Date(timestamp)
  const now = new Date()

  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatMessageContent = (content: string) => {
  // 简单的Markdown渲染
  return content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/\n/g, '<br>')
}

const formatSystemMessage = (message: any) => {
  switch (message.type) {
    case 'm.room.member':
      return `${message.senderName} ${message.content.membership === 'join' ? 'joined' : 'left'} the room`
    case 'm.room.create':
      return `${message.senderName} created the room`
    case 'm.room.name':
      return `${message.senderName} changed the room name to "${message.content.name}"`
    case 'm.room.topic':
      return `${message.senderName} changed the room topic to "${message.content.topic}"`
    default:
      return `System message: ${message.type}`
  }
}
  })
}

const getMessageTypeIcon = (type: string) => {
  switch (type) {
    case 'm.text': return '💬'
    case 'm.image': return '🖼️'
    case 'm.file': return '📎'
    case 'm.audio': return '🎵'
    case 'm.video': return '🎥'
    default: return '📄'
  }
}

const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    sendMessage()
  }
  
  // 显示输入状态
  if (!isTyping.value) {
    isTyping.value = true
    setTimeout(() => {
      isTyping.value = false
    }, 3000)
  }
}

const sendMessage = async () => {
  if (!messageText.value.trim() || !currentRoom.value) return
  
  try {
    await matrixStore.sendMatrixMessage(currentRoom.value.id, messageText.value.trim())
    messageText.value = ''
    isTyping.value = false
    
    // 滚动到底部
    nextTick(() => {
      scrollToBottom()
    })
  } catch (error) {
    console.error('Failed to send message:', error)
  }
}

const toggleEncryption = () => {
  encryptionEnabled.value = !encryptionEnabled.value
  // 这里应该实际切换加密状态
}

const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

// 监听消息变化，自动滚动到底部
watch(() => matrixStore.currentMessages, () => {
  nextTick(() => {
    scrollToBottom()
  })
}, { deep: true })

// 监听房间变化，聚焦输入框
watch(() => matrixStore.currentRoomId, () => {
  nextTick(() => {
    if (messageInput.value) {
      messageInput.value.focus()
    }
  })
})
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

.room-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.room-icon {
  font-size: 18px;
}

.room-name {
  color: #00ff00;
  font-weight: bold;
  font-size: 16px;
}

.room-details {
  display: flex;
  gap: 12px;
  font-size: 12px;
}

.room-alias {
  color: #00cccc;
}

.room-topic {
  color: #666;
}

.member-count {
  color: #00ff00;
  font-size: 12px;
}

.room-features {
  display: flex;
  gap: 8px;
  margin-top: 4px;
}

.feature-badge {
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 10px;
  font-weight: bold;
}

.feature-badge.encrypted {
  background: rgba(255, 255, 0, 0.2);
  color: #ffff00;
  border: 1px solid #ffff00;
}

.feature-badge.public {
  background: rgba(0, 204, 204, 0.2);
  color: #00cccc;
  border: 1px solid #00cccc;
}

.feature-badge.world {
  background: rgba(255, 0, 255, 0.2);
  color: #ff00ff;
  border: 1px solid #ff00ff;
}

.feature-badge.federation {
  background: rgba(0, 255, 0, 0.2);
  color: #00ff00;
  border: 1px solid #00ff00;
}

.matrix-messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.no-room-selected {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
}

.matrix-logo {
  margin-bottom: 30px;
}

.logo-text {
  font-size: 48px;
  font-weight: bold;
  color: #00ff00;
  text-shadow: 0 0 10px #00ff00;
  margin-bottom: 8px;
}

.logo-subtitle {
  font-size: 16px;
  color: #00cccc;
  letter-spacing: 2px;
}

.welcome-text {
  margin-bottom: 30px;
  color: #666;
}

.welcome-text p {
  margin: 8px 0;
  font-size: 14px;
}

.matrix-features {
  border: 1px solid #003300;
  border-radius: 8px;
  padding: 20px;
  background: rgba(0, 255, 0, 0.05);
}

.feature-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.feature {
  color: #00ff00;
  font-size: 12px;
}

.loading-messages {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
}

.loading-spinner {
  font-size: 24px;
  color: #00ff00;
  animation: spin 1s linear infinite;
  margin-bottom: 10px;
}

.loading-text {
  color: #666;
  font-size: 12px;
}

.messages-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.message-item {
  border-left: 2px solid #003300;
  padding-left: 12px;
  transition: all 0.3s ease;
}

.message-item.own-message {
  border-left-color: #00ff00;
}

.message-item.encrypted-message {
  border-left-color: #ffff00;
  background: rgba(255, 255, 0, 0.05);
}

.message-item.system-message {
  border-left-color: #ff00ff;
  background: rgba(255, 0, 255, 0.05);
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.message-sender {
  display: flex;
  align-items: center;
  gap: 4px;
}

.sender-icon {
  color: #00cccc;
  font-size: 12px;
}

.sender-name {
  color: #00ff00;
  font-weight: bold;
  font-size: 13px;
}

.message-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.message-timestamp {
  color: #666;
  font-size: 11px;
}

.encryption-indicator, .message-type {
  font-size: 12px;
}

.message-content {
  margin-left: 16px;
}

.message-text {
  color: #ccc;
  font-size: 14px;
  line-height: 1.4;
  margin-bottom: 4px;
}

.message-details {
  font-size: 10px;
  color: #666;
}

.event-id {
  font-family: monospace;
}

.matrix-message-input {
  border-top: 2px solid #00ff00;
  background: rgba(0, 255, 0, 0.05);
  padding: 15px 20px;
}

.input-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.input-label {
  color: #00ff00;
  font-size: 11px;
  font-weight: bold;
  margin-right: 8px;
}

.target-room {
  color: #00cccc;
  font-size: 12px;
}

.input-features {
  display: flex;
  gap: 8px;
}

.feature-btn {
  background: none;
  border: 1px solid #003300;
  color: #666;
  padding: 4px 8px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.feature-btn:hover, .feature-btn.active {
  border-color: #00ff00;
  color: #00ff00;
  box-shadow: 0 0 5px rgba(0, 255, 0, 0.3);
}

.input-wrapper {
  display: flex;
  gap: 10px;
  margin-bottom: 8px;
}

.message-textarea {
  flex: 1;
  background: rgba(0, 0, 0, 0.8);
  border: 1px solid #003300;
  color: #00ff00;
  padding: 10px;
  font-family: 'Share Tech Mono', monospace;
  font-size: 14px;
  resize: vertical;
  min-height: 40px;
  max-height: 120px;
}

.message-textarea:focus {
  outline: none;
  border-color: #00ff00;
  box-shadow: 0 0 5px rgba(0, 255, 0, 0.3);
}

.send-button {
  background: rgba(0, 255, 0, 0.1);
  border: 1px solid #00ff00;
  color: #00ff00;
  padding: 10px 20px;
  font-family: 'Share Tech Mono', monospace;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.send-button:hover:not(:disabled) {
  background: rgba(0, 255, 0, 0.2);
  box-shadow: 0 0 10px rgba(0, 255, 0, 0.5);
}

.send-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.input-status {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11px;
}

.typing-indicator {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #ffff00;
}

.typing-animation {
  animation: spin 1s linear infinite;
}

.connection-status {
  display: flex;
  align-items: center;
  gap: 4px;
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
  color: #666;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0.3; }
}
</style>
