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
      <span class="sender-name">{{ message.senderName }}</span>
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
          <!-- 文本消息 -->
          <div v-if="message.msgtype === 'm.text'" class="text-message">
            <div v-html="formatMessageContent(message.content)"></div>
            <div v-if="message.isEdited" class="edited-indicator">
              <span class="edited-text">(已编辑)</span>
            </div>
          </div>

          <!-- 文件消息 -->
          <div v-else-if="message.msgtype === 'm.file'" class="file-message">
            <div class="file-info">
              <span class="file-icon">📄</span>
              <span class="file-name">{{ message.filename }}</span>
              <span class="file-size">({{ formatFileSize(message.filesize) }})</span>
            </div>
            <button @click="downloadFile(message)" class="download-btn">下载</button>
          </div>

          <!-- 图片消息 -->
          <div v-else-if="message.msgtype === 'm.image'" class="image-message">
            <img 
              :src="getImageUrl(message)" 
              :alt="message.filename"
              @click="previewImage(message)"
              class="message-image"
            />
          </div>
        </div>
      </div>

      <!-- 消息时间（自己的消息） -->
      <div v-if="message.isOwn" class="own-message-time">
        {{ formatTime(message.timestamp) }}
      </div>
    </div>

    <!-- 消息反应面板 -->
    <MessageReactionsPanel
      :message="message"
      :room-id="roomId"
      :show-add-button="!message.isRedacted"
    />

    <!-- 已读回执指示器 -->
    <ReadReceiptIndicator
      :room-id="roomId"
      :event-id="message.eventId || message.id"
      :timestamp="message.timestamp"
      :is-own-message="message.isOwn"
    />

    <!-- 输入状态指示器 -->
    <TypingIndicator :room-id="roomId" />
        :class="{ 'has-reacted': reaction.hasReacted }"
      >
        <span class="reaction-emoji">{{ emoji }}</span>
        <span class="reaction-count">{{ reaction.count }}</span>
      </button>
      <button @click="showEmojiPicker" class="add-reaction-btn">+</button>
    </div>

    <!-- 操作菜单 -->
    <div v-if="showMenu" class="context-menu" :style="menuPosition">
      <button @click="replyToMessage" class="menu-item">
        <span class="menu-icon">↩️</span>
        <span>回复</span>
      </button>
      
      <button v-if="canEdit" @click="startEdit" class="menu-item">
        <span class="menu-icon">✏️</span>
        <span>编辑</span>
      </button>
      
      <button @click="showEmojiPicker" class="menu-item">
        <span class="menu-icon">😊</span>
        <span>添加反应</span>
      </button>
      
      <button @click="copyMessage" class="menu-item">
        <span class="menu-icon">📋</span>
        <span>复制</span>
      </button>
      
      <button v-if="canDelete" @click="deleteMessage" class="menu-item delete-item">
        <span class="menu-icon">🗑️</span>
        <span>删除</span>
      </button>
    </div>

    <!-- 表情选择器 -->
    <div v-if="showEmojiSelector" class="emoji-selector">
      <div class="emoji-grid">
        <button
          v-for="emoji in commonEmojis"
          :key="emoji"
          @click="addReaction(emoji)"
          class="emoji-option"
        >
          {{ emoji }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { useMatrixStore } from '@/stores/matrix'
import MessageReactionsPanel from './MessageReactionsPanel.vue'
import ReadReceiptIndicator from './ReadReceiptIndicator.vue'
import TypingIndicator from './TypingIndicator.vue'

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

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const getImageUrl = (message: MatrixMessage) => {
  // TODO: 实现Matrix媒体URL获取
  return ''
}

const downloadFile = (message: MatrixMessage) => {
  // TODO: 实现文件下载
}

const previewImage = (message: MatrixMessage) => {
  // TODO: 实现图片预览
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

.file-info {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
}

.download-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: inherit;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
}

.message-image {
  max-width: 100%;
  border-radius: 8px;
  cursor: pointer;
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
</style>