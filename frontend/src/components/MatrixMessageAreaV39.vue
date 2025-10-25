<template>
  <div class="matrix-message-area-v39">
    <!-- 房间头部信息 -->
    <div class="room-header">
      <div class="room-info">
        <div class="room-avatar">
          <img v-if="currentRoom?.avatarUrl" :src="currentRoom.avatarUrl" :alt="currentRoom.name" />
          <div v-else class="avatar-placeholder">
            {{ getRoomInitial() }}
          </div>
        </div>
        <div class="room-details">
          <h3 class="room-name">
            {{ currentRoom?.name || 'Unknown Room' }}
            <span v-if="currentRoom?.encrypted" class="encryption-badge" title="端到端加密">🔒</span>
          </h3>
          <div class="room-meta">
            <span class="member-count">{{ currentRoom?.memberCount || 0 }} 成员</span>
            <span v-if="typingUsers.length > 0" class="typing-indicator">
              {{ typingUsers.join(', ') }} 正在打字...
            </span>
          </div>
        </div>
      </div>
      
      <div class="room-actions">
        <!-- 加密状态指示器 -->
        <div v-if="matrixStore.encryptionReady" class="encryption-status" :title="encryptionStatusText">
          <div class="encryption-icon" :class="encryptionStatusClass">
            <svg viewBox="0 0 24 24">
              <path d="M12,17A2,2 0 0,0 14,15C14,13.89 13.1,13 12,13A2,2 0 0,0 10,15A2,2 0 0,0 12,17M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V10C4,8.89 4.9,8 6,8H7V6A5,5 0 0,1 12,1A5,5 0 0,1 17,6V8H18M12,3A3,3 0 0,0 9,6V8H15V6A3,3 0 0,0 12,3Z"/>
            </svg>
          </div>
        </div>
        
        <!-- 房间菜单 -->
        <button class="room-menu-btn" @click="showRoomMenu = !showRoomMenu">
          <svg viewBox="0 0 24 24">
            <path d="M12,16A2,2 0 0,1 14,18A2,2 0 0,1 12,20A2,2 0 0,1 10,18A2,2 0 0,1 12,16M12,10A2,2 0 0,1 14,12A2,2 0 0,1 12,14A2,2 0 0,1 10,12A2,2 0 0,1 12,10M12,4A2,2 0 0,1 14,6A2,2 0 0,1 12,8A2,2 0 0,1 10,6A2,2 0 0,1 12,4Z"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- 消息列表 -->
    <div class="messages-container" ref="messagesContainer">
      <div class="messages-list">
        <div 
          v-for="message in currentMessages" 
          :key="message.id"
          class="message-wrapper"
          :class="{ 'own-message': isOwnMessage(message) }"
        >
          <!-- 消息内容 -->
          <div class="message-bubble">
            <!-- 发送者信息 -->
            <div v-if="!isOwnMessage(message)" class="message-sender">
              <span class="sender-name">{{ message.senderName || message.sender }}</span>
              <span class="message-time">{{ formatTime(message.timestamp) }}</span>
            </div>
            
            <!-- 回复信息 -->
            <div v-if="message.replyTo" class="reply-info">
              <div class="reply-line"></div>
              <div class="reply-content">
                <span class="reply-sender">{{ message.replyTo.senderName }}</span>
                <span class="reply-text">{{ message.replyTo.content }}</span>
              </div>
            </div>

            <!-- 消息内容 -->
            <div class="message-content">
              <!-- 文本消息 -->
              <div v-if="!message.fileInfo && !message.location" class="text-content">
                {{ message.content }}
                <span v-if="message.edited" class="edited-indicator">(已编辑)</span>
              </div>
              
              <!-- 文件消息 -->
              <div v-else-if="message.fileInfo" class="file-content">
                <img 
                  v-if="message.fileInfo.isImage" 
                  :src="message.fileInfo.url" 
                  :alt="message.fileInfo.name"
                  class="image-message"
                  @click="showImagePreview(message.fileInfo.url)"
                />
                <video 
                  v-else-if="message.fileInfo.isVideo" 
                  :src="message.fileInfo.url" 
                  controls
                  class="video-message"
                />
                <audio 
                  v-else-if="message.fileInfo.isAudio" 
                  :src="message.fileInfo.url" 
                  controls
                  class="audio-message"
                />
                <div v-else class="file-message">
                  <div class="file-icon">📎</div>
                  <div class="file-info">
                    <div class="file-name">{{ message.fileInfo.name }}</div>
                    <div class="file-size">{{ formatFileSize(message.fileInfo.size) }}</div>
                  </div>
                  <a :href="message.fileInfo.url" target="_blank" class="download-btn">下载</a>
                </div>
              </div>

              <!-- 位置消息 -->
              <div v-else-if="message.location" class="location-content">
                <div class="location-icon">📍</div>
                <div class="location-info">
                  <div class="location-desc">{{ message.location.description }}</div>
                  <div class="location-coords">
                    {{ message.location.latitude }}, {{ message.location.longitude }}
                  </div>
                </div>
              </div>
            </div>

            <!-- 消息时间 (自己的消息) -->
            <div v-if="isOwnMessage(message)" class="message-time-own">
              {{ formatTime(message.timestamp) }}
            </div>
          </div>

          <!-- 消息反应 -->
          <div v-if="getMessageReactions(message.id)" class="message-reactions">
            <button
              v-for="(reaction, key) in getMessageReactions(message.id)"
              :key="key"
              class="reaction-button"
              :class="{ active: reaction.hasReacted }"
              @click="toggleReaction(message.id, key)"
            >
              {{ key }} {{ reaction.count }}
            </button>
          </div>

          <!-- 消息操作菜单 -->
          <div class="message-actions" v-if="showMessageActions === message.id">
            <button @click="addQuickReaction(message.id, '👍')" class="action-btn">👍</button>
            <button @click="addQuickReaction(message.id, '❤️')" class="action-btn">❤️</button>
            <button @click="addQuickReaction(message.id, '😂')" class="action-btn">😂</button>
            <button @click="replyToMessage(message)" class="action-btn">回复</button>
            <button v-if="matrixStore.supportsThreads" @click="startThread(message)" class="action-btn">线程</button>
            <button v-if="canEditMessage(message)" @click="editMessage(message)" class="action-btn">编辑</button>
            <button v-if="canDeleteMessage(message)" @click="deleteMessage(message)" class="action-btn delete">删除</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { useMatrixV39Store } from '@/stores/matrix-v39-clean'

// Props
interface Props {
  roomId: string
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  userClicked: [userId: string]
  messageReply: [message: any]
  messageEdit: [message: any]
  threadStart: [message: any]
  reactionAdd: [eventId: string, reaction: string]
  reactionRemove: [eventId: string, reaction: string]
  messageDelete: [eventId: string]
}>()

// Store
const matrixStore = useMatrixV39Store()

// Refs
const messagesContainer = ref<HTMLElement>()
const showMessageActions = ref<string | null>(null)
const showRoomMenu = ref(false)

// 计算属性
const currentRoom = computed(() => matrixStore.currentRoom)
const currentMessages = computed(() => matrixStore.currentMessages)
const typingUsers = computed(() => {
  const typing = matrixStore.typing.get(props.roomId) || []
  return typing.filter(userId => userId !== matrixStore.currentUser?.id)
})

const encryptionStatusClass = computed(() => {
  if (!matrixStore.encryptionReady) return 'encryption-disabled'
  if (matrixStore.crossSigningReady && matrixStore.keyBackupReady) return 'encryption-verified'
  if (matrixStore.crossSigningReady) return 'encryption-partial'
  return 'encryption-basic'
})

const encryptionStatusText = computed(() => {
  if (!matrixStore.encryptionReady) return '加密未启用'
  if (matrixStore.crossSigningReady && matrixStore.keyBackupReady) return '完全验证的加密'
  if (matrixStore.crossSigningReady) return '部分验证的加密'
  return '基础加密'
})// 方法

const getRoomInitial = () => {
  const name = currentRoom.value?.name
  if (name) {
    return name.charAt(0).toUpperCase()
  }
  return 'R'
}

const isOwnMessage = (message: any) => {
  return message.sender === matrixStore.currentUser?.id
}

const formatTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatFileSize = (bytes: number) => {
  return matrixStore.formatFileSize(bytes)
}

const getMessageReactions = (messageId: string) => {
  return matrixStore.reactions.get(messageId)
}

const toggleReaction = async (messageId: string, reaction: string) => {
  try {
    const reactions = matrixStore.reactions.get(messageId)
    const hasReacted = reactions?.[reaction]?.hasReacted
    
    if (hasReacted) {
      await matrixStore.removeReaction(props.roomId, messageId, reaction)
      emit('reactionRemove', messageId, reaction)
    } else {
      await matrixStore.addReaction(props.roomId, messageId, reaction)
      emit('reactionAdd', messageId, reaction)
    }
  } catch (error) {
    console.error('切换反应失败:', error)
  }
}

const addQuickReaction = async (messageId: string, reaction: string) => {
  try {
    await matrixStore.addReaction(props.roomId, messageId, reaction)
    emit('reactionAdd', messageId, reaction)
    showMessageActions.value = null
  } catch (error) {
    console.error('添加反应失败:', error)
  }
}

const replyToMessage = (message: any) => {
  emit('messageReply', message)
  showMessageActions.value = null
}

const startThread = (message: any) => {
  emit('threadStart', message)
  showMessageActions.value = null
}

const editMessage = (message: any) => {
  emit('messageEdit', message)
  showMessageActions.value = null
}

const deleteMessage = async (message: any) => {
  if (confirm('确定要删除这条消息吗？')) {
    try {
      await matrixStore.deleteMessage(props.roomId, message.id, '用户删除')
      emit('messageDelete', message.id)
      showMessageActions.value = null
    } catch (error) {
      console.error('删除消息失败:', error)
    }
  }
}

const canEditMessage = (message: any) => {
  return message.sender === matrixStore.currentUser?.id && !message.redacted
}

const canDeleteMessage = (message: any) => {
  const currentUserId = matrixStore.currentUser?.id
  const userPowerLevel = currentRoom.value?.powerLevels?.users?.[currentUserId || ''] || 0
  const defaultPowerLevel = currentRoom.value?.powerLevels?.usersDefault || 0
  const redactLevel = currentRoom.value?.powerLevels?.redact || 50
  
  return message.sender === currentUserId || 
         Math.max(userPowerLevel, defaultPowerLevel) >= redactLevel
}

const showImagePreview = (url: string) => {
  // 实现图片预览功能
  window.open(url, '_blank')
}

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

// 监听消息变化，自动滚动到底部
watch(() => currentMessages.value.length, () => {
  scrollToBottom()
})

// 监听房间变化，加载消息
watch(() => props.roomId, async (newRoomId) => {
  if (newRoomId) {
    try {
      await matrixStore.fetchMatrixMessages(newRoomId)
      scrollToBottom()
    } catch (error) {
      console.error('加载消息失败:', error)
    }
  }
}, { immediate: true })

// 点击外部关闭消息操作菜单
const handleClickOutside = (event: Event) => {
  const target = event.target as HTMLElement
  if (!target.closest('.message-actions') && !target.closest('.message-bubble')) {
    showMessageActions.value = null
  }
}

// 消息右键菜单
const handleMessageContextMenu = (event: MouseEvent, messageId: string) => {
  event.preventDefault()
  showMessageActions.value = showMessageActions.value === messageId ? null : messageId
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  
  // 为消息添加右键菜单
  nextTick(() => {
    const messageElements = document.querySelectorAll('.message-bubble')
    messageElements.forEach((element, index) => {
      const messageId = currentMessages.value[index]?.id
      if (messageId) {
        element.addEventListener('contextmenu', (e) => handleMessageContextMenu(e, messageId))
      }
    })
  })
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.matrix-message-area-v39 {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 100%);
}

/* 房间头部 */
.room-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: rgba(0, 0, 0, 0.3);
  border-bottom: 1px solid #3a4a5c;
  backdrop-filter: blur(10px);
}

.room-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.room-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid #00ff88;
}

.room-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #00ff88 0%, #64b5f6 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: #0f0f23;
}

.room-details {
  flex: 1;
}

.room-name {
  margin: 0;
  color: #e0e6ed;
  font-size: 1.1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.encryption-badge {
  font-size: 0.8rem;
  color: #00ff88;
}

.room-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 4px;
}

.member-count {
  color: #b0bec5;
  font-size: 0.85rem;
}

.typing-indicator {
  color: #64b5f6;
  font-size: 0.85rem;
  font-style: italic;
}

.room-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.encryption-status {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: help;
}

.encryption-icon {
  width: 20px;
  height: 20px;
}

.encryption-icon svg {
  width: 100%;
  height: 100%;
}

.encryption-verified {
  background: rgba(76, 175, 80, 0.2);
  border: 1px solid #4caf50;
}

.encryption-verified svg {
  fill: #4caf50;
}

.encryption-partial {
  background: rgba(255, 193, 7, 0.2);
  border: 1px solid #ffc107;
}

.encryption-partial svg {
  fill: #ffc107;
}

.encryption-basic {
  background: rgba(33, 150, 243, 0.2);
  border: 1px solid #2196f3;
}

.encryption-basic svg {
  fill: #2196f3;
}

.encryption-disabled {
  background: rgba(158, 158, 158, 0.2);
  border: 1px solid #9e9e9e;
}

.encryption-disabled svg {
  fill: #9e9e9e;
}

.room-menu-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.room-menu-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.room-menu-btn svg {
  width: 18px;
  height: 18px;
  fill: #e0e6ed;
}

/* 消息容器 */
.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.messages-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.message-wrapper {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.message-wrapper.own-message {
  align-items: flex-end;
}

.message-bubble {
  max-width: 70%;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 18px;
  padding: 12px 16px;
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;
}

.message-wrapper.own-message .message-bubble {
  background: linear-gradient(135deg, #00ff88 0%, #00cc6a 100%);
  color: #0f0f23;
}

.message-bubble:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.message-sender {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
  font-size: 0.8rem;
}

.sender-name {
  font-weight: 600;
  color: #64b5f6;
}

.message-time {
  color: #b0bec5;
  font-size: 0.75rem;
}

.message-time-own {
  color: rgba(15, 15, 35, 0.7);
  font-size: 0.75rem;
  margin-top: 4px;
  text-align: right;
}

/* 回复信息 */
.reply-info {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 8px;
  padding: 8px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
}

.reply-line {
  width: 3px;
  height: 100%;
  background: #64b5f6;
  border-radius: 2px;
  min-height: 20px;
}

.reply-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.reply-sender {
  font-size: 0.75rem;
  font-weight: 600;
  color: #64b5f6;
}

.reply-text {
  font-size: 0.8rem;
  color: #b0bec5;
  opacity: 0.8;
}

/* 消息内容 */
.message-content {
  word-wrap: break-word;
  line-height: 1.4;
}

.text-content {
  color: #e0e6ed;
}

.message-wrapper.own-message .text-content {
  color: #0f0f23;
}

.edited-indicator {
  font-size: 0.75rem;
  opacity: 0.7;
  font-style: italic;
  margin-left: 4px;
}

/* 文件消息 */
.file-content {
  max-width: 300px;
}

.image-message {
  max-width: 100%;
  border-radius: 12px;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.image-message:hover {
  transform: scale(1.02);
}

.video-message,
.audio-message {
  max-width: 100%;
  border-radius: 8px;
}

.file-message {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  min-width: 200px;
}

.file-icon {
  font-size: 1.5rem;
}

.file-info {
  flex: 1;
}

.file-name {
  font-weight: 500;
  margin-bottom: 2px;
}

.file-size {
  font-size: 0.8rem;
  opacity: 0.7;
}

.download-btn {
  padding: 6px 12px;
  background: #64b5f6;
  color: white;
  text-decoration: none;
  border-radius: 6px;
  font-size: 0.8rem;
  transition: background 0.3s ease;
}

.download-btn:hover {
  background: #42a5f5;
}

/* 位置消息 */
.location-content {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
}

.location-icon {
  font-size: 1.5rem;
}

.location-info {
  flex: 1;
}

.location-desc {
  font-weight: 500;
  margin-bottom: 2px;
}

.location-coords {
  font-size: 0.8rem;
  opacity: 0.7;
}

/* 消息反应 */
.message-reactions {
  display: flex;
  gap: 4px;
  margin-top: 8px;
  flex-wrap: wrap;
}

.reaction-button {
  padding: 4px 8px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.3s ease;
}

.reaction-button:hover {
  background: rgba(255, 255, 255, 0.2);
}

.reaction-button.active {
  background: rgba(0, 255, 136, 0.2);
  border-color: #00ff88;
  color: #00ff88;
}

/* 消息操作菜单 */
.message-actions {
  position: absolute;
  top: -40px;
  right: 0;
  display: flex;
  gap: 4px;
  background: rgba(0, 0, 0, 0.9);
  border: 1px solid #3a4a5c;
  border-radius: 8px;
  padding: 4px;
  backdrop-filter: blur(10px);
  z-index: 10;
}

.action-btn {
  padding: 6px 8px;
  background: transparent;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
  color: #e0e6ed;
  transition: all 0.3s ease;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.action-btn.delete {
  color: #ff6b6b;
}

.action-btn.delete:hover {
  background: rgba(255, 107, 107, 0.2);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .room-header {
    padding: 12px 16px;
  }
  
  .messages-container {
    padding: 16px;
  }
  
  .message-bubble {
    max-width: 85%;
  }
  
  .file-message {
    min-width: auto;
  }
}
</style>