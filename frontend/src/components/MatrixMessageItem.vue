<template>
  <div 
    class="message-item" 
    :class="{ 
      'own-message': message.isOwn, 
      'editing': isEditing,
      'deleted': message.isRedacted 
    }"
    @contextmenu.prevent="showContextMenu"
    @touchstart="handleTouchStart"
    @touchend="handleTouchEnd"
  >
    <!-- 回复引用显示 -->
    <div v-if="message.replyTo" class="reply-reference" @click="scrollToMessage(message.replyTo.eventId)">
      <div class="reply-line"></div>
      <div class="reply-content">
        <span class="reply-sender">{{ message.replyTo.senderName }}</span>
        <span class="reply-text">{{ message.replyTo.content }}</span>
      </div>
    </div>

    <!-- 消息头部信息 -->
    <div class="message-header" v-if="!message.isOwn">
      <div class="sender-avatar">
        {{ getSenderInitials(message.senderName || message.sender) }}
      </div>
      <span class="sender-name">{{ getDisplayName(message) }}</span>
      <span class="message-time">{{ formatTime(message.timestamp) }}</span>
    </div>

    <!-- 消息内容 -->
    <div class="message-content">
      <!-- 编辑模式 -->
      <div v-if="isEditing" class="edit-mode">
        <textarea
          ref="editInput"
          v-model="editContent"
          @keydown="handleEditKeydown"
          class="edit-textarea"
          :placeholder="'编辑消息...'"
        ></textarea>
        <div class="edit-actions">
          <button @click="cancelEdit" class="cancel-btn">取消</button>
          <button @click="saveEdit" class="save-btn" :disabled="!editContent.trim()">保存</button>
        </div>
      </div>

      <!-- 正常显示模式 -->
      <div v-else class="message-body">
        <!-- 已删除消息 -->
        <div v-if="message.isRedacted" class="deleted-message">
          <span class="deleted-icon">🗑️</span>
          <span class="deleted-text">此消息已被删除</span>
          <span v-if="message.redactionReason" class="deletion-reason">
            ({{ message.redactionReason }})
          </span>
        </div>

        <!-- 正常消息 -->
        <div v-else>
          <!-- 文件消息 -->
          <div v-if="message.msgtype === 'm.file' || (message.fileInfo && !message.fileInfo.isImage)" class="file-message">
            <div class="file-info">
              <span class="file-icon">{{ getFileIcon(message.fileInfo?.name || message.filename || '', message.fileInfo?.type) }}</span>
              <div class="file-details">
                <span class="file-name">{{ message.fileInfo?.name || message.filename || '未知文件' }}</span>
                <span class="file-size" v-if="message.fileInfo?.size || message.filesize">
                  ({{ formatFileSize(message.fileInfo?.size || message.filesize || 0) }})
                </span>
              </div>
            </div>
            <button @click="downloadFile(message)" class="download-btn" v-if="message.fileInfo?.url">
              下载
            </button>
          </div>

          <!-- 图片消息 -->
          <div v-else-if="message.msgtype === 'm.image' || (message.fileInfo && message.fileInfo.isImage)" class="image-message">
            <img 
              :src="getImageUrl(message)" 
              :alt="message.fileInfo?.name || message.filename || '图片'"
              @click="previewImage(message)"
              @error="handleImageError"
              class="message-image"
              v-if="getImageUrl(message)"
            />
            <div v-else class="image-placeholder">
              <span class="image-icon">🖼️</span>
              <span class="image-text">图片加载失败</span>
            </div>
          </div>

          <!-- 文本消息（默认，包括所有其他类型） -->
          <div v-else class="text-message">
            <div v-html="formatMessageContent(message.content)"></div>
            <div v-if="message.isEdited" class="edited-indicator">
              <span class="edited-text">(已编辑)</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 消息时间（自己的消息） -->
      <div v-if="message.isOwn" class="own-message-time">
        {{ formatTime(message.timestamp) }}
      </div>
    </div>

    <!-- 线程信息 -->
    <div v-if="message.threadReplyCount && message.threadReplyCount > 0" class="thread-info">
      <button @click="openThread" class="thread-button">
        <span class="thread-icon">🧵</span>
        <span class="thread-count">{{ message.threadReplyCount }} 条回复</span>
        <span class="thread-arrow">→</span>
      </button>
    </div>

    <!-- 消息反应面板 -->
    <MessageReactionsPanel
      :message="message"
      :room-id="roomId"
      :show-add-button="!message.isRedacted"
    />

    <!-- 消息操作按钮 -->
    <div class="message-actions" v-if="!message.isRedacted && !isEditing">
      <button @click="handleReply" class="action-btn reply-btn" title="回复">
        <span class="action-icon">↩️</span>
      </button>
      <button @click="startThread" class="action-btn thread-btn" title="开始线程">
        <span class="action-icon">🧵</span>
      </button>
      <button 
        v-if="message.isOwn" 
        @click="handleEdit" 
        class="action-btn edit-btn" 
        title="编辑"
      >
        <span class="action-icon">✏️</span>
      </button>
      <button 
        v-if="message.isOwn" 
        @click="handleDelete" 
        class="action-btn delete-btn" 
        title="删除"
      >
        <span class="action-icon">🗑️</span>
      </button>
    </div>

    <!-- 已读回执指示器 -->
    <ReadReceiptIndicator
      :room-id="roomId"
      :event-id="message.eventId || message.id"
      :timestamp="message.timestamp"
      :is-own-message="message.isOwn"
    />

    <!-- 输入状态指示器 -->
    <TypingIndicator :room-id="roomId" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { useMatrixStore } from '@/stores/matrix'
import MessageReactionsPanel from './MessageReactionsPanel.vue'
import ReadReceiptIndicator from './ReadReceiptIndicator.vue'
import TypingIndicator from './TypingIndicator.vue'
import { formatFileSize, getFileIcon } from '@/utils/fileUtils'

interface MessageReaction {
  count: number
  users: string[]
  hasReacted: boolean
}

interface MatrixMessage {
  id: string
  eventId: string
  content: string
  msgtype: string
  timestamp: number
  senderName: string
  senderId: string
  isOwn: boolean
  isEdited?: boolean
  isRedacted?: boolean
  redactionReason?: string
  filename?: string
  filesize?: number
  reactions?: Record<string, MessageReaction>
  replyTo?: {
    eventId: string
    senderName: string
    content: string
  }
}

const props = defineProps<{
  message: MatrixMessage
  roomId: string
}>()

const emit = defineEmits<{
  'reply-to': [message: MatrixMessage]
  'scroll-to': [eventId: string]
  'start-thread': [message: MatrixMessage]
  'open-thread': [message: MatrixMessage]
}>()

const matrixStore = useMatrixStore()

// 状态
const isEditing = ref(false)
const editContent = ref('')
const showMenu = ref(false)
const showEmojiSelector = ref(false)
const menuPosition = ref({ top: '0px', left: '0px' })
const editInput = ref<HTMLTextAreaElement>()
const touchStartTime = ref(0)

// 常用表情
const commonEmojis = ['👍', '👎', '❤️', '😂', '😮', '😢', '😡', '🎉', '🔥', '💯']

// 计算属性
const canEdit = computed(() => {
  return props.message.isOwn && !props.message.isRedacted
})

const canDelete = computed(() => {
  return props.message.isOwn && !props.message.isRedacted
})

// 方法
const handleTouchStart = () => {
  touchStartTime.value = Date.now()
}

const handleTouchEnd = () => {
  const touchDuration = Date.now() - touchStartTime.value
  if (touchDuration > 500) { // 长按500ms
    showContextMenu()
  }
}

const showContextMenu = (event?: MouseEvent) => {
  if (event) {
    menuPosition.value = {
      top: event.clientY + 'px',
      left: event.clientX + 'px'
    }
  }
  showMenu.value = true
  
  // 点击其他地方关闭菜单
  setTimeout(() => {
    document.addEventListener('click', hideContextMenu, { once: true })
  }, 0)
}

const hideContextMenu = () => {
  showMenu.value = false
  showEmojiSelector.value = false
}

const replyToMessage = () => {
  emit('reply-to', props.message)
  hideContextMenu()
}

const startEdit = () => {
  isEditing.value = true
  editContent.value = props.message.content
  hideContextMenu()
  
  nextTick(() => {
    editInput.value?.focus()
  })
}

const cancelEdit = () => {
  isEditing.value = false
  editContent.value = ''
}

const saveEdit = async () => {
  if (!editContent.value.trim()) return
  
  try {
    await matrixStore.editMessage(props.roomId, props.message.eventId, editContent.value.trim())
    isEditing.value = false
    editContent.value = ''
  } catch (error) {
    console.error('编辑消息失败:', error)
    // TODO: 显示错误提示
  }
}

const handleEditKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    saveEdit()
  } else if (event.key === 'Escape') {
    cancelEdit()
  }
}

const deleteMessage = async () => {
  if (!confirm('确定要删除这条消息吗？')) return
  
  try {
    await matrixStore.deleteMessage(props.roomId, props.message.eventId)
    hideContextMenu()
  } catch (error) {
    console.error('删除消息失败:', error)
    // TODO: 显示错误提示
  }
}

const copyMessage = () => {
  navigator.clipboard.writeText(props.message.content)
  hideContextMenu()
  // TODO: 显示复制成功提示
}

const showEmojiPicker = () => {
  showEmojiSelector.value = !showEmojiSelector.value
  hideContextMenu()
}

const addReaction = async (emoji: string) => {
  try {
    await matrixStore.addReaction(props.roomId, props.message.eventId, emoji)
    showEmojiSelector.value = false
  } catch (error) {
    console.error('添加反应失败:', error)
  }
}

const toggleReaction = async (emoji: string) => {
  const reaction = props.message.reactions?.[emoji]
  if (!reaction) return
  
  try {
    if (reaction.hasReacted) {
      await matrixStore.removeReaction(props.roomId, props.message.eventId, emoji)
    } else {
      await matrixStore.addReaction(props.roomId, props.message.eventId, emoji)
    }
  } catch (error) {
    console.error('切换反应失败:', error)
  }
}

const scrollToMessage = (eventId: string) => {
  emit('scroll-to', eventId)
}

// 线程相关方法
const startThread = () => {
  // 标记消息为线程根消息
  matrixStore.markMessageAsThreadRoot(props.roomId, props.message.id)
  
  // 触发打开线程面板事件
  emit('start-thread', props.message)
  hideContextMenu()
}

const openThread = () => {
  // 打开现有线程
  emit('open-thread', props.message)
}

const handleReply = () => {
  emit('reply-to', props.message)
  hideContextMenu()
}

const handleEdit = () => {
  startEdit()
}

const handleDelete = () => {
  deleteMessage()
}

const formatTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleTimeString('zh-CN', {
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

// 获取发送者显示名称
const getDisplayName = (message: MatrixMessage) => {
  // 如果有显示名称，使用显示名称
  if (message.senderName && message.senderName !== message.sender) {
    return message.senderName
  }
  
  // 从Matrix ID中提取用户名
  if (message.sender) {
    const match = message.sender.match(/@([^:]+):/)
    if (match) {
      return match[1] // 返回用户名部分
    }
  }
  
  return message.sender || '未知用户'
}

// 获取发送者头像首字母
const getSenderInitials = (name: string) => {
  if (!name) return '?'
  
  // 如果是Matrix ID，提取用户名部分
  if (name.startsWith('@')) {
    const match = name.match(/@([^:]+):/)
    if (match) {
      name = match[1]
    }
  }
  
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

// formatFileSize 现在从工具函数导入

const getImageUrl = (message: MatrixMessage) => {
  // 从fileInfo中获取图片URL
  if (message.fileInfo && message.fileInfo.url) {
    return message.fileInfo.url
  }
  
  // 如果没有fileInfo，尝试从内容中提取URL
  if (message.content && message.content.includes('http')) {
    const urlMatch = message.content.match(/(https?:\/\/[^\s]+)/)
    if (urlMatch) {
      return urlMatch[1]
    }
  }
  
  return ''
}

const downloadFile = (message: MatrixMessage) => {
  if (message.fileInfo && message.fileInfo.url) {
    // 创建下载链接
    const link = document.createElement('a')
    link.href = message.fileInfo.url
    link.download = message.fileInfo.name || 'download'
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}

const previewImage = (message: MatrixMessage) => {
  const imageUrl = getImageUrl(message)
  if (imageUrl) {
    // 创建图片预览模态框
    const modal = document.createElement('div')
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      cursor: pointer;
    `
    
    const img = document.createElement('img')
    img.src = imageUrl
    img.style.cssText = `
      max-width: 90%;
      max-height: 90%;
      object-fit: contain;
      border-radius: 8px;
    `
    
    modal.appendChild(img)
    document.body.appendChild(modal)
    
    // 点击关闭预览
    modal.addEventListener('click', () => {
      document.body.removeChild(modal)
    })
    
    // ESC键关闭预览
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        document.body.removeChild(modal)
        document.removeEventListener('keydown', handleKeydown)
      }
    }
    document.addEventListener('keydown', handleKeydown)
  }
}

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  console.error('图片加载失败:', img.src)
  
  // 隐藏失败的图片
  img.style.display = 'none'
  
  // 显示错误提示
  const errorDiv = document.createElement('div')
  errorDiv.className = 'image-error'
  errorDiv.innerHTML = '🖼️ 图片加载失败'
  img.parentNode?.appendChild(errorDiv)
}
</script>

<style scoped>
.message-item {
  margin-bottom: 12px;
  position: relative;
  max-width: 70%;
  word-wrap: break-word;
}

.own-message {
  margin-left: auto;
  margin-right: 0;
}

.editing {
  background: rgba(255, 235, 59, 0.1);
  border-radius: 8px;
  padding: 8px;
}

.deleted {
  opacity: 0.6;
}

.reply-reference {
  margin-bottom: 4px;
  padding: 6px 12px;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 8px 8px 0 0;
  border-left: 3px solid #2196F3;
  cursor: pointer;
  font-size: 12px;
}

.reply-line {
  width: 2px;
  background: #2196F3;
  margin-right: 8px;
}

.reply-sender {
  font-weight: 500;
  color: #2196F3;
  margin-right: 6px;
}

.reply-text {
  color: #666;
}

.message-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
  font-size: 12px;
}

.sender-avatar {
  width: 24px;
  height: 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 10px;
  font-weight: bold;
  flex-shrink: 0;
}

.sender-name {
  font-weight: 500;
  color: #2196F3;
}

.message-time {
  color: #999;
}

.message-content {
  background: #f5f5f5;
  padding: 8px 12px;
  border-radius: 18px;
  position: relative;
  color: #000000;
}

.own-message .message-content {
  background: #2196F3;
  color: white;
}

.edit-mode {
  background: white;
  border-radius: 8px;
  padding: 8px;
}

.edit-textarea {
  width: 100%;
  min-height: 60px;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 8px;
  resize: vertical;
  font-family: inherit;
}

.edit-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 8px;
}

.cancel-btn, .save-btn {
  padding: 4px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.cancel-btn {
  background: #f5f5f5;
  color: #666;
}

.save-btn {
  background: #2196F3;
  color: white;
}

.save-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.deleted-message {
  display: flex;
  align-items: center;
  gap: 6px;
  font-style: italic;
  color: #999;
}

.text-message {
  line-height: 1.4;
}

.edited-indicator {
  margin-top: 4px;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.7);
}

.own-message .edited-indicator {
  color: rgba(255, 255, 255, 0.7);
}

.file-message, .image-message {
  max-width: 300px;
}

.file-message {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 8px;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.file-icon {
  font-size: 20px;
}

.file-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.file-name {
  font-weight: 500;
  font-size: 14px;
}

.file-size {
  font-size: 12px;
  color: #666;
}

.download-btn {
  background: #007bff;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: background-color 0.2s;
}

.download-btn:hover {
  background: #0056b3;
}

.own-message .download-btn {
  background: rgba(255, 255, 255, 0.3);
  color: white;
}

.own-message .download-btn:hover {
  background: rgba(255, 255, 255, 0.4);
}

.message-image {
  max-width: 100%;
  max-height: 300px;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.2s;
}

.message-image:hover {
  transform: scale(1.02);
}

.image-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 8px;
  color: #666;
}

.image-icon {
  font-size: 24px;
  margin-bottom: 4px;
}

.image-text {
  font-size: 12px;
}

.image-error {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
  background: rgba(255, 0, 0, 0.1);
  border-radius: 4px;
  color: #d32f2f;
  font-size: 12px;
}

.own-message-time {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.7);
  text-align: right;
  margin-top: 4px;
}

.message-reactions {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 6px;
}

.reaction-btn {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 2px 6px;
  background: rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s ease;
}

.reaction-btn:hover {
  background: rgba(0, 0, 0, 0.1);
}

.reaction-btn.has-reacted {
  background: rgba(33, 150, 243, 0.2);
  border-color: #2196F3;
  color: #2196F3;
}

.add-reaction-btn {
  padding: 2px 8px;
  background: rgba(0, 0, 0, 0.05);
  border: 1px dashed rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  cursor: pointer;
  font-size: 12px;
  color: #666;
}

.context-menu {
  position: fixed;
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  min-width: 120px;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px 12px;
  border: none;
  background: none;
  text-align: left;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s ease;
}

.menu-item:hover {
  background: #f5f5f5;
}

.menu-item:first-child {
  border-radius: 8px 8px 0 0;
}

.menu-item:last-child {
  border-radius: 0 0 8px 8px;
}

.delete-item {
  color: #f44336;
}

.delete-item:hover {
  background: rgba(244, 67, 54, 0.1);
}

.emoji-selector {
  position: absolute;
  top: 100%;
  left: 0;
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  padding: 8px;
}

.emoji-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 4px;
}

.emoji-option {
  padding: 6px;
  border: none;
  background: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: background 0.2s ease;
}

.emoji-option:hover {
  background: #f5f5f5;
}
</style>/* 
线程相关样式 */
.thread-info {
  margin-top: 8px;
  margin-left: 12px;
}

.thread-button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: rgba(0, 123, 255, 0.1);
  border: 1px solid rgba(0, 123, 255, 0.2);
  border-radius: 16px;
  cursor: pointer;
  font-size: 12px;
  color: #007bff;
  transition: all 0.2s ease;
}

.thread-button:hover {
  background: rgba(0, 123, 255, 0.15);
  border-color: rgba(0, 123, 255, 0.3);
  transform: translateY(-1px);
}

.thread-icon {
  font-size: 14px;
}

.thread-count {
  font-weight: 500;
}

.thread-arrow {
  font-size: 10px;
  opacity: 0.7;
}

/* 消息操作按钮 */
.message-actions {
  display: flex;
  gap: 4px;
  margin-top: 8px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.message-item:hover .message-actions {
  opacity: 1;
}

.action-btn {
  width: 28px;
  height: 28px;
  border: none;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: rgba(0, 0, 0, 0.1);
  transform: scale(1.1);
}

.action-icon {
  font-size: 12px;
}

.reply-btn:hover {
  background: rgba(0, 123, 255, 0.1);
}

.thread-btn:hover {
  background: rgba(255, 193, 7, 0.1);
}

.edit-btn:hover {
  background: rgba(40, 167, 69, 0.1);
}

.delete-btn:hover {
  background: rgba(220, 53, 69, 0.1);
}

.own-message .action-btn {
  background: rgba(255, 255, 255, 0.2);
}

.own-message .action-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}