<template>
  <div class="message-area-simple">
    <!-- 消息列表 -->
    <div class="messages-container" ref="messagesContainer">
      <div v-if="loading" class="loading-messages">
        <div class="loading-spinner"></div>
        <p>正在加载消息...</p>
      </div>
      
      <div v-else-if="messages.length === 0" class="no-messages">
        <div class="no-messages-icon">💬</div>
        <p>暂无消息</p>
        <p class="hint">发送第一条消息开始对话</p>
      </div>
      
      <div v-else class="messages-list">
        <MatrixMessageItem
          v-for="message in displayMessages"
          :key="message.id"
          :message="message"
          :room-id="roomId"
          @start-thread="handleStartThread"
          @open-thread="handleOpenThread"
          @reply-to="handleReplyTo"
          @scroll-to="handleScrollTo"
        />
      </div>
    </div>
    
    <!-- 消息输入框 -->
    <div class="message-input-container">
      <div class="input-toolbar">
        <button class="toolbar-btn" @click="selectFile" title="发送文件">
          📎
        </button>
        <button class="toolbar-btn" @click="toggleEmoji" title="表情">
          😊
        </button>
        <button class="toolbar-btn voip-voice-btn" @click="initiateVoiceCall" title="语音通话">
          📞
        </button>
        <button class="toolbar-btn voip-video-btn" @click="initiateVideoCall" title="视频通话">
          📹
        </button>
      </div>
      
      <div class="input-area">
        <textarea
          v-model="messageInput"
          @keydown="handleKeyDown"
          placeholder="输入消息..."
          class="message-textarea"
          rows="1"
          ref="messageTextarea"
        ></textarea>
        <button
          @click="sendMessage"
          :disabled="!messageInput.trim() || sending"
          class="send-button"
          :class="{ sending }"
        >
          {{ sending ? '发送中...' : '发送' }}
        </button>
      </div>
      
      <input
        ref="fileInput"
        type="file"
        @change="handleFileSelect"
        style="display: none"
        multiple
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useMatrixStore } from '@/stores/matrix'
import MatrixMessageItem from './MatrixMessageItem.vue'

const props = defineProps<{
  roomId: string
}>()

const emit = defineEmits<{
  'start-thread': [message: any]
  'open-thread': [message: any]
}>()

const matrixStore = useMatrixStore()

// 响应式数据
const messageInput = ref('')
const sending = ref(false)
const loading = ref(false)
const messagesContainer = ref<HTMLElement>()
const messageTextarea = ref<HTMLTextAreaElement>()
const fileInput = ref<HTMLInputElement>()

// 计算属性
const messages = computed(() => {
  return matrixStore.messages.get(props.roomId) || []
})

const displayMessages = computed(() => {
  // 限制显示的消息数量以提高性能
  const maxMessages = 100
  return messages.value.slice(-maxMessages)
})

const currentUser = computed(() => matrixStore.currentUser)

// 方法
const isOwnMessage = (message: any) => {
  return message.sender === currentUser.value?.id
}

const getMessageAvatar = (message: any) => {
  const senderName = getSenderName(message)
  return senderName.charAt(0).toUpperCase()
}

const getSenderName = (message: any) => {
  if (message.senderName) return message.senderName
  if (message.sender) {
    // 从Matrix ID提取用户名
    const match = message.sender.match(/@([^:]+):/)
    return match ? match[1] : message.sender
  }
  return '未知用户'
}

const formatMessageTime = (timestamp: number) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  if (diff < 24 * 60 * 60 * 1000) {
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  } else if (diff < 7 * 24 * 60 * 60 * 1000) {
    return date.toLocaleDateString('zh-CN', { weekday: 'short', hour: '2-digit', minute: '2-digit' })
  } else {
    return date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
  }
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const getFileIcon = (fileInfo: any) => {
  if (fileInfo.isImage) return '🖼️'
  if (fileInfo.isVideo) return '🎥'
  if (fileInfo.isAudio) return '🎵'
  return '📎'
}

// 线程相关方法
const handleStartThread = (message: any) => {
  emit('start-thread', message)
}

const handleOpenThread = (message: any) => {
  emit('open-thread', message)
}

const handleReplyTo = (message: any) => {
  // 处理回复消息
  messageInput.value = `@${getSenderName(message)} `
  messageTextarea.value?.focus()
}

const handleScrollTo = (eventId: string) => {
  // 滚动到指定消息
  const messageElement = document.querySelector(`[data-event-id="${eventId}"]`)
  if (messageElement) {
    messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
}

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

const sendMessage = async () => {
  const content = messageInput.value.trim()
  if (!content || sending.value) return

  try {
    sending.value = true
    await matrixStore.sendMatrixMessage(props.roomId, content)
    messageInput.value = ''
    scrollToBottom()
  } catch (error) {
    console.error('发送消息失败:', error)
    alert('发送消息失败: ' + (error as Error).message)
  } finally {
    sending.value = false
  }
}

const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    sendMessage()
  }
}

const selectFile = () => {
  fileInput.value?.click()
}

const handleFileSelect = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = target.files
  if (!files || files.length === 0) return

  try {
    sending.value = true
    
    for (const file of Array.from(files)) {
      console.log('发送文件:', file.name)
      await matrixStore.sendFileMessage(props.roomId, file)
    }
    
    scrollToBottom()
  } catch (error) {
    console.error('发送文件失败:', error)
    alert('发送文件失败: ' + (error as Error).message)
  } finally {
    sending.value = false
    if (target) target.value = ''
  }
}

const toggleEmoji = () => {
  // 简单的表情功能
  const emojis = ['😊', '😂', '❤️', '👍', '👎', '😢', '😮', '😡', '🎉', '🔥']
  const emoji = emojis[Math.floor(Math.random() * emojis.length)]
  messageInput.value += emoji
}

// VoIP通话方法
const initiateVoiceCall = () => {
  console.log('📞 发起语音通话')
  if (!props.roomId) {
    alert('无法获取房间信息')
    return
  }
  
  // 获取房间成员信息
  const targetUserId = getTargetUserId()
  console.log('发起语音通话:', {
    roomId: props.roomId,
    targetUserId
  })
  
  alert(`语音通话\n\n房间: ${props.roomId}\n目标用户: ${targetUserId || '未知'}\n\n功能开发中...`)
}

const initiateVideoCall = () => {
  console.log('📹 发起视频通话')
  if (!props.roomId) {
    alert('无法获取房间信息')
    return
  }
  
  // 获取房间成员信息
  const targetUserId = getTargetUserId()
  console.log('发起视频通话:', {
    roomId: props.roomId,
    targetUserId
  })
  
  alert(`视频通话\n\n房间: ${props.roomId}\n目标用户: ${targetUserId || '未知'}\n\n功能开发中...`)
}

// 获取目标用户ID（用于通话）
const getTargetUserId = (): string | null => {
  if (!matrixStore.matrixClient) return null
  
  const room = matrixStore.matrixClient.getRoom(props.roomId)
  if (!room) return null
  
  // 对于私聊房间，获取对方用户ID
  const members = room.getJoinedMembers()
  const memberIds = Object.keys(members)
  const currentUserId = matrixStore.matrixClient.getUserId()
  
  // 找到不是当前用户的成员
  const otherUserId = memberIds.find(id => id !== currentUserId)
  return otherUserId || null
}

const loadMessages = async () => {
  if (!props.roomId) return
  
  try {
    loading.value = true
    console.log(`🔄 开始加载房间 ${props.roomId} 的消息`)
    
    const loadedMessages = await matrixStore.fetchMatrixMessages(props.roomId)
    console.log(`✅ 加载完成，获得 ${loadedMessages.length} 条消息`)
    
    // 如果没有消息，尝试创建一些测试消息（仅用于调试）
    if (loadedMessages.length === 0 && props.roomId !== 'file-transfer-assistant') {
      console.log('🔧 没有消息，创建测试消息')
      // 这里可以添加一些测试消息用于调试
    }
    
    scrollToBottom()
  } catch (error) {
    console.error('加载消息失败:', error)
  } finally {
    loading.value = false
  }
}

// 监听房间变化
watch(() => props.roomId, (newRoomId) => {
  if (newRoomId) {
    loadMessages()
  }
}, { immediate: true })

// 调试消息数据
watch(messages, (newMessages) => {
  if (newMessages.length > 0) {
    console.log(`🔍 房间 ${props.roomId} 消息数据:`, newMessages)
    console.log('第一条消息:', newMessages[0])
  }
}, { immediate: true })

// 监听新消息
watch(messages, () => {
  scrollToBottom()
}, { deep: true })

onMounted(() => {
  if (props.roomId) {
    loadMessages()
  }
})
</script>

<style scoped>
.message-area-simple {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--primary-bg, #f5f5f5);
  color: var(--primary-text, #000000);
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background: var(--secondary-bg, #ffffff);
}

.loading-messages {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: var(--secondary-text, #666);
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--border-color, #f3f3f3);
  border-top: 3px solid var(--accent-color, #07c160);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.no-messages {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: var(--secondary-text, #999);
}

.no-messages-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.hint {
  font-size: 14px;
  color: var(--secondary-text, #ccc);
}

.messages-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.message-item {
  display: flex;
  gap: 12px;
  max-width: 80%;
}

.message-item.own-message {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.message-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--accent-color, #07c160);
  color: var(--button-text, white);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  flex-shrink: 0;
}

.own-message .message-avatar {
  background: var(--accent-color, #1aad19);
}

.message-content {
  flex: 1;
  min-width: 0;
}

.message-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.sender-name {
  font-weight: 500;
  color: var(--primary-text, #000000);
  font-size: 14px;
}

.message-time {
  font-size: 12px;
  color: var(--secondary-text, #666);
}

.message-body {
  background: var(--message-received-bg, #ffffff);
  color: var(--message-received-text, #000000);
  border-radius: 8px;
  padding: 12px;
  border: 1px solid var(--border-color, #e5e5e5);
  word-wrap: break-word;
  box-shadow: var(--shadow, 0 2px 4px rgba(0,0,0,0.1));
}

.own-message .message-body {
  background: var(--message-sent-bg, #95ec69);
  color: var(--message-sent-text, #000000);
  border-color: var(--message-sent-bg, #95ec69);
}

.text-message {
  line-height: 1.4;
  white-space: pre-wrap;
  color: inherit;
}

.file-message {
  display: flex;
  align-items: center;
  gap: 12px;
}

.file-icon {
  font-size: 24px;
}

.file-info {
  flex: 1;
}

.file-name {
  font-weight: 500;
  margin-bottom: 4px;
}

.file-size {
  font-size: 12px;
  color: var(--secondary-text, #666);
}

.file-download {
  background: var(--button-bg, #07c160);
  color: var(--button-text, white);
  padding: 4px 12px;
  border-radius: 4px;
  text-decoration: none;
  font-size: 12px;
  transition: all 0.2s;
}

.file-download:hover {
  opacity: 0.8;
  transform: translateY(-1px);
}

.message-input-container {
  background: var(--secondary-bg, #ffffff);
  border-top: 1px solid var(--border-color, #e5e5e5);
  padding: 16px;
}

.input-toolbar {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.toolbar-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: background-color 0.2s;
  color: var(--secondary-text, #666);
}

.toolbar-btn:hover {
  background: var(--hover-bg, #f0f0f0);
  color: var(--accent-color, #07c160);
}

/* VoIP按钮特定样式 */
.voip-voice-btn:hover {
  background: rgba(76, 175, 80, 0.1);
  color: #4CAF50;
}

.voip-video-btn:hover {
  background: rgba(33, 150, 243, 0.1);
  color: #2196F3;
}

.input-area {
  display: flex;
  gap: 12px;
  align-items: flex-end;
}

.message-textarea {
  flex: 1;
  border: 1px solid var(--border-color, #d9d9d9);
  border-radius: 6px;
  padding: 12px;
  font-size: 14px;
  line-height: 1.4;
  resize: none;
  min-height: 40px;
  max-height: 120px;
  font-family: inherit;
  background: var(--input-bg, #ffffff);
  color: var(--primary-text, #000000);
}

.message-textarea:focus {
  outline: none;
  border-color: var(--accent-color, #07c160);
  box-shadow: 0 0 5px var(--accent-color, #07c160);
}

.send-button {
  background: var(--button-bg, #07c160);
  color: var(--button-text, white);
  border: none;
  border-radius: 6px;
  padding: 12px 24px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  box-shadow: var(--shadow, 0 2px 4px rgba(0,0,0,0.1));
}

.send-button:hover:not(:disabled) {
  opacity: 0.8;
  transform: translateY(-1px);
  box-shadow: var(--shadow, 0 4px 8px rgba(0,0,0,0.15));
}

.send-button:disabled {
  background: var(--border-color, #ccc);
  cursor: not-allowed;
  opacity: 0.6;
}

.send-button.sending {
  background: var(--secondary-text, #999);
}
</style>