<template>
  <div class="matrix-message-input-v39">
    <!-- 回复预览 -->
    <div v-if="replyingTo" class="reply-preview">
      <div class="reply-indicator">
        <div class="reply-line"></div>
        <div class="reply-content">
          <div class="reply-header">
            <span class="reply-to">回复 {{ replyingTo.senderName }}</span>
            <button @click="cancelReply" class="cancel-reply">×</button>
          </div>
          <div class="reply-text">{{ replyingTo.content }}</div>
        </div>
      </div>
    </div>

    <!-- 线程预览 -->
    <div v-if="threadRoot" class="thread-preview">
      <div class="thread-indicator">
        <div class="thread-icon">🧵</div>
        <div class="thread-content">
          <div class="thread-header">
            <span class="thread-to">回复线程</span>
            <button @click="cancelThread" class="cancel-thread">×</button>
          </div>
          <div class="thread-text">{{ threadRoot.content }}</div>
        </div>
      </div>
    </div>

    <!-- 编辑预览 -->
    <div v-if="editingMessage" class="edit-preview">
      <div class="edit-indicator">
        <div class="edit-icon">✏️</div>
        <div class="edit-content">
          <div class="edit-header">
            <span class="edit-to">编辑消息</span>
            <button @click="cancelEdit" class="cancel-edit">×</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 打字指示器 -->
    <div v-if="typingUsers.length > 0" class="typing-users">
      <div class="typing-animation">
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
      </div>
      <span class="typing-text">{{ typingText }}</span>
    </div>

    <!-- 主输入区域 -->
    <div class="input-container">
      <!-- 文件拖拽区域 -->
      <div 
        v-if="isDragging" 
        class="drag-overlay"
        @dragover.prevent
        @drop.prevent="handleFileDrop"
        @dragleave="isDragging = false"
      >
        <div class="drag-content">
          <div class="drag-icon">📎</div>
          <div class="drag-text">释放文件以发送</div>
        </div>
      </div>

      <!-- 输入框 -->
      <div class="input-wrapper">
        <!-- 表情按钮 -->
        <button 
          class="emoji-btn"
          @click="showEmojiPicker = !showEmojiPicker"
          title="表情"
        >
          😊
        </button>

        <!-- 文本输入 -->
        <div class="text-input-container">
          <textarea
            ref="textInput"
            v-model="messageText"
            :placeholder="inputPlaceholder"
            class="message-input"
            rows="1"
            @keydown="handleKeyDown"
            @input="handleInput"
            @paste="handlePaste"
            @focus="handleFocus"
            @blur="handleBlur"
          ></textarea>
          
          <!-- 输入提示 -->
          <div v-if="showInputHint" class="input-hint">
            {{ inputHint }}
          </div>
        </div>

        <!-- 附件按钮 -->
        <button 
          class="attachment-btn"
          @click="showAttachmentMenu = !showAttachmentMenu"
          title="附件"
        >
          📎
        </button>

        <!-- 发送按钮 -->
        <button 
          class="send-btn"
          :disabled="!canSend"
          @click="sendMessage"
          title="发送消息"
        >
          <svg viewBox="0 0 24 24">
            <path d="M2,21L23,12L2,3V10L17,12L2,14V21Z"/>
          </svg>
        </button>
      </div>

      <!-- 表情选择器 -->
      <div v-if="showEmojiPicker" class="emoji-picker">
        <div class="emoji-categories">
          <button 
            v-for="category in emojiCategories" 
            :key="category.name"
            class="emoji-category-btn"
            :class="{ active: selectedEmojiCategory === category.name }"
            @click="selectedEmojiCategory = category.name"
          >
            {{ category.icon }}
          </button>
        </div>
        <div class="emoji-grid">
          <button
            v-for="emoji in currentEmojis"
            :key="emoji"
            class="emoji-btn-grid"
            @click="insertEmoji(emoji)"
          >
            {{ emoji }}
          </button>
        </div>
      </div>

      <!-- 附件菜单 -->
      <div v-if="showAttachmentMenu" class="attachment-menu">
        <input
          ref="fileInput"
          type="file"
          multiple
          accept="*/*"
          style="display: none"
          @change="handleFileSelect"
        />
        
        <button class="attachment-option" @click="selectFiles">
          <div class="option-icon">📁</div>
          <span>文件</span>
        </button>
        
        <button class="attachment-option" @click="selectImages">
          <div class="option-icon">🖼️</div>
          <span>图片</span>
        </button>
        
        <button class="attachment-option" @click="selectVideos">
          <div class="option-icon">🎥</div>
          <span>视频</span>
        </button>
        
        <button class="attachment-option" @click="selectAudio">
          <div class="option-icon">🎵</div>
          <span>音频</span>
        </button>
      </div>
    </div>

    <!-- 文件预览 -->
    <div v-if="selectedFiles.length > 0" class="file-preview">
      <div class="file-preview-header">
        <span>准备发送 {{ selectedFiles.length }} 个文件</span>
        <button @click="clearFiles" class="clear-files">清除</button>
      </div>
      <div class="file-list">
        <div 
          v-for="(file, index) in selectedFiles" 
          :key="index"
          class="file-item"
        >
          <div class="file-preview-content">
            <img 
              v-if="isImageFile(file)" 
              :src="getFilePreview(file)" 
              :alt="file.name"
              class="file-thumbnail"
            />
            <div v-else class="file-icon">
              {{ getFileIcon(file) }}
            </div>
          </div>
          <div class="file-info">
            <div class="file-name">{{ file.name }}</div>
            <div class="file-size">{{ formatFileSize(file.size) }}</div>
          </div>
          <button @click="removeFile(index)" class="remove-file">×</button>
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
  replyingTo?: any
  threadRoot?: any
  editingMessage?: any
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  messageSent: [content: string]
  replyCancel: []
  threadCancel: []
  editCancel: []
  editSave: [messageId: string, newContent: string]
}>()

// Store
const matrixStore = useMatrixV39Store()

// Refs
const textInput = ref<HTMLTextAreaElement>()
const fileInput = ref<HTMLInputElement>()
const messageText = ref('')
const selectedFiles = ref<File[]>([])
const isDragging = ref(false)
const showEmojiPicker = ref(false)
const showAttachmentMenu = ref(false)
const showInputHint = ref(false)
const selectedEmojiCategory = ref('smileys')
const isTyping = ref(false)
const typingTimeout = ref<NodeJS.Timeout>()

// 表情数据
const emojiCategories = [
  { name: 'smileys', icon: '😊', emojis: ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳'] },
  { name: 'gestures', icon: '👍', emojis: ['👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👋', '🤚', '🖐️', '✋', '🖖', '👏', '🙌', '🤲', '🤝', '🙏'] },
  { name: 'hearts', icon: '❤️', emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝'] },
  { name: 'objects', icon: '🎉', emojis: ['🎉', '🎊', '🎈', '🎁', '🏆', '🥇', '🥈', '🥉', '⭐', '🌟', '💫', '✨', '🔥', '💯', '💢', '💥', '💦', '💨'] }
]

// 计算属性
const currentEmojis = computed(() => {
  const category = emojiCategories.find(cat => cat.name === selectedEmojiCategory.value)
  return category?.emojis || []
})

const typingUsers = computed(() => {
  const typing = matrixStore.typing.get(props.roomId) || []
  return typing.filter(userId => userId !== matrixStore.currentUser?.id)
})

const typingText = computed(() => {
  const users = typingUsers.value
  if (users.length === 0) return ''
  if (users.length === 1) return `${users[0]} 正在打字...`
  if (users.length === 2) return `${users[0]} 和 ${users[1]} 正在打字...`
  return `${users[0]} 等 ${users.length} 人正在打字...`
})

const inputPlaceholder = computed(() => {
  if (props.editingMessage) return '编辑消息...'
  if (props.threadRoot) return '回复线程...'
  if (props.replyingTo) return '回复消息...'
  return '输入消息...'
})

const inputHint = computed(() => {
  if (messageText.value.startsWith('/')) {
    return '输入命令...'
  }
  return 'Enter 发送，Shift+Enter 换行'
})

const canSend = computed(() => {
  return (messageText.value.trim().length > 0 || selectedFiles.value.length > 0) && !isTyping.value
})

// 方法
const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    sendMessage()
  } else if (event.key === 'Escape') {
    if (props.editingMessage) cancelEdit()
    else if (props.replyingTo) cancelReply()
    else if (props.threadRoot) cancelThread()
  }
}

const handleInput = () => {
  // 自动调整文本框高度
  nextTick(() => {
    if (textInput.value) {
      textInput.value.style.height = 'auto'
      textInput.value.style.height = Math.min(textInput.value.scrollHeight, 120) + 'px'
    }
  })

  // 显示输入提示
  showInputHint.value = messageText.value.startsWith('/')

  // 发送打字状态
  if (!isTyping.value && messageText.value.trim()) {
    isTyping.value = true
    // 这里可以发送打字状态到服务器
  }

  // 清除打字超时
  if (typingTimeout.value) {
    clearTimeout(typingTimeout.value)
  }

  // 设置新的打字超时
  typingTimeout.value = setTimeout(() => {
    isTyping.value = false
    // 这里可以停止发送打字状态
  }, 3000)
}

const handlePaste = (event: ClipboardEvent) => {
  const items = event.clipboardData?.items
  if (!items) return

  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    if (item.type.indexOf('image') !== -1) {
      const file = item.getAsFile()
      if (file) {
        selectedFiles.value.push(file)
      }
    }
  }
}

const handleFocus = () => {
  // 隐藏菜单
  showEmojiPicker.value = false
  showAttachmentMenu.value = false
}

const handleBlur = () => {
  showInputHint.value = false
}

const sendMessage = async () => {
  if (!canSend.value) return

  try {
    const content = messageText.value.trim()

    // 发送文件
    if (selectedFiles.value.length > 0) {
      for (const file of selectedFiles.value) {
        await matrixStore.sendFileMessage(props.roomId, file)
      }
      clearFiles()
    }

    // 发送文本消息
    if (content) {
      if (props.editingMessage) {
        // 编辑消息
        await matrixStore.editMessage(props.roomId, props.editingMessage.id, content)
        emit('editSave', props.editingMessage.id, content)
      } else if (props.threadRoot) {
        // 发送线程回复
        await matrixStore.sendThreadReply(props.roomId, props.threadRoot.id, content)
        emit('threadCancel')
      } else if (props.replyingTo) {
        // 发送回复消息 (这里需要实现回复功能)
        await matrixStore.sendMatrixMessage(props.roomId, content)
        emit('replyCancel')
      } else {
        // 发送普通消息
        await matrixStore.sendMatrixMessage(props.roomId, content)
      }

      messageText.value = ''
      emit('messageSent', content)
    }

    // 重置输入框高度
    if (textInput.value) {
      textInput.value.style.height = 'auto'
    }

    // 停止打字状态
    isTyping.value = false
    if (typingTimeout.value) {
      clearTimeout(typingTimeout.value)
    }

  } catch (error) {
    console.error('发送消息失败:', error)
  }
}

const cancelReply = () => {
  emit('replyCancel')
}

const cancelThread = () => {
  emit('threadCancel')
}

const cancelEdit = () => {
  messageText.value = ''
  emit('editCancel')
}

const insertEmoji = (emoji: string) => {
  const cursorPos = textInput.value?.selectionStart || 0
  const textBefore = messageText.value.substring(0, cursorPos)
  const textAfter = messageText.value.substring(cursorPos)
  messageText.value = textBefore + emoji + textAfter
  
  nextTick(() => {
    if (textInput.value) {
      textInput.value.focus()
      textInput.value.setSelectionRange(cursorPos + emoji.length, cursorPos + emoji.length)
    }
  })
  
  showEmojiPicker.value = false
}

const selectFiles = () => {
  if (fileInput.value) {
    fileInput.value.accept = '*/*'
    fileInput.value.click()
  }
  showAttachmentMenu.value = false
}

const selectImages = () => {
  if (fileInput.value) {
    fileInput.value.accept = 'image/*'
    fileInput.value.click()
  }
  showAttachmentMenu.value = false
}

const selectVideos = () => {
  if (fileInput.value) {
    fileInput.value.accept = 'video/*'
    fileInput.value.click()
  }
  showAttachmentMenu.value = false
}

const selectAudio = () => {
  if (fileInput.value) {
    fileInput.value.accept = 'audio/*'
    fileInput.value.click()
  }
  showAttachmentMenu.value = false
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = target.files
  if (files) {
    selectedFiles.value.push(...Array.from(files))
  }
  target.value = '' // 清除选择，允许重复选择同一文件
}

const handleFileDrop = (event: DragEvent) => {
  isDragging.value = false
  const files = event.dataTransfer?.files
  if (files) {
    selectedFiles.value.push(...Array.from(files))
  }
}

const clearFiles = () => {
  selectedFiles.value = []
}

const removeFile = (index: number) => {
  selectedFiles.value.splice(index, 1)
}

const isImageFile = (file: File) => {
  return file.type.startsWith('image/')
}

const getFilePreview = (file: File) => {
  return URL.createObjectURL(file)
}

const getFileIcon = (file: File) => {
  if (file.type.startsWith('image/')) return '🖼️'
  if (file.type.startsWith('video/')) return '🎥'
  if (file.type.startsWith('audio/')) return '🎵'
  if (file.type.includes('pdf')) return '📄'
  if (file.type.includes('word')) return '📝'
  if (file.type.includes('excel')) return '📊'
  if (file.type.includes('zip') || file.type.includes('rar')) return '📦'
  return '📁'
}

const formatFileSize = (bytes: number) => {
  return matrixStore.formatFileSize(bytes)
}

// 拖拽事件处理
const handleDragOver = (event: DragEvent) => {
  event.preventDefault()
  isDragging.value = true
}

const handleDragLeave = (event: DragEvent) => {
  event.preventDefault()
  // 只有当离开整个组件时才隐藏拖拽覆盖层
  if (!event.relatedTarget || !(event.currentTarget as Element).contains(event.relatedTarget as Node)) {
    isDragging.value = false
  }
}

// 监听编辑消息变化
watch(() => props.editingMessage, (newMessage) => {
  if (newMessage) {
    messageText.value = newMessage.content
    nextTick(() => {
      textInput.value?.focus()
    })
  }
})

// 点击外部关闭菜单
const handleClickOutside = (event: Event) => {
  const target = event.target as HTMLElement
  if (!target.closest('.emoji-picker') && !target.closest('.emoji-btn')) {
    showEmojiPicker.value = false
  }
  if (!target.closest('.attachment-menu') && !target.closest('.attachment-btn')) {
    showAttachmentMenu.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('dragover', handleDragOver)
  document.addEventListener('dragleave', handleDragLeave)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('dragover', handleDragOver)
  document.removeEventListener('dragleave', handleDragLeave)
  
  if (typingTimeout.value) {
    clearTimeout(typingTimeout.value)
  }
})
</script><
style scoped>
.matrix-message-input-v39 {
  background: rgba(0, 0, 0, 0.3);
  border-top: 1px solid #3a4a5c;
  position: relative;
}

/* 回复预览 */
.reply-preview,
.thread-preview,
.edit-preview {
  padding: 12px 20px;
  background: rgba(100, 181, 246, 0.1);
  border-bottom: 1px solid rgba(100, 181, 246, 0.2);
}

.reply-indicator,
.thread-indicator,
.edit-indicator {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.reply-line {
  width: 3px;
  height: 100%;
  background: #64b5f6;
  border-radius: 2px;
  min-height: 20px;
}

.thread-icon,
.edit-icon {
  font-size: 1.2rem;
}

.reply-content,
.thread-content,
.edit-content {
  flex: 1;
}

.reply-header,
.thread-header,
.edit-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.reply-to,
.thread-to,
.edit-to {
  font-size: 0.85rem;
  font-weight: 600;
  color: #64b5f6;
}

.cancel-reply,
.cancel-thread,
.cancel-edit {
  background: none;
  border: none;
  color: #b0bec5;
  cursor: pointer;
  font-size: 1.2rem;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.reply-text,
.thread-text {
  font-size: 0.8rem;
  color: #b0bec5;
  opacity: 0.8;
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 打字指示器 */
.typing-users {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 20px;
  background: rgba(100, 181, 246, 0.05);
  border-bottom: 1px solid rgba(100, 181, 246, 0.1);
}

.typing-animation {
  display: flex;
  gap: 2px;
}

.typing-dot {
  width: 4px;
  height: 4px;
  background: #64b5f6;
  border-radius: 50%;
  animation: typing 1.4s infinite ease-in-out;
}

.typing-dot:nth-child(1) { animation-delay: -0.32s; }
.typing-dot:nth-child(2) { animation-delay: -0.16s; }

@keyframes typing {
  0%, 80%, 100% {
    transform: scale(0);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

.typing-text {
  font-size: 0.8rem;
  color: #64b5f6;
  font-style: italic;
}

/* 拖拽覆盖层 */
.drag-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 255, 136, 0.1);
  border: 2px dashed #00ff88;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.drag-content {
  text-align: center;
  color: #00ff88;
}

.drag-icon {
  font-size: 3rem;
  margin-bottom: 8px;
}

.drag-text {
  font-size: 1.2rem;
  font-weight: 600;
}

/* 输入容器 */
.input-container {
  position: relative;
}

.input-wrapper {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  padding: 16px 20px;
}

.emoji-btn,
.attachment-btn {
  width: 36px;
  height: 36px;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.emoji-btn:hover,
.attachment-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.1);
}

.text-input-container {
  flex: 1;
  position: relative;
}

.message-input {
  width: 100%;
  min-height: 36px;
  max-height: 120px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 18px;
  color: #e0e6ed;
  font-size: 0.95rem;
  line-height: 1.4;
  resize: none;
  outline: none;
  transition: all 0.3s ease;
}

.message-input:focus {
  border-color: #00ff88;
  background: rgba(255, 255, 255, 0.15);
}

.message-input::placeholder {
  color: #b0bec5;
}

.input-hint {
  position: absolute;
  bottom: -24px;
  left: 16px;
  font-size: 0.75rem;
  color: #64b5f6;
  background: rgba(0, 0, 0, 0.8);
  padding: 2px 8px;
  border-radius: 4px;
  white-space: nowrap;
}

.send-btn {
  width: 36px;
  height: 36px;
  border: none;
  background: linear-gradient(135deg, #00ff88 0%, #00cc6a 100%);
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.send-btn:hover:not(:disabled) {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 255, 136, 0.4);
}

.send-btn:disabled {
  background: rgba(255, 255, 255, 0.1);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.send-btn svg {
  width: 18px;
  height: 18px;
  fill: #0f0f23;
}

.send-btn:disabled svg {
  fill: #666;
}

/* 表情选择器 */
.emoji-picker {
  position: absolute;
  bottom: 100%;
  left: 20px;
  width: 320px;
  background: rgba(0, 0, 0, 0.95);
  border: 1px solid #3a4a5c;
  border-radius: 12px;
  padding: 16px;
  backdrop-filter: blur(10px);
  z-index: 50;
}

.emoji-categories {
  display: flex;
  gap: 4px;
  margin-bottom: 12px;
  border-bottom: 1px solid #3a4a5c;
  padding-bottom: 8px;
}

.emoji-category-btn {
  padding: 6px;
  background: transparent;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1.2rem;
  transition: all 0.3s ease;
}

.emoji-category-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.emoji-category-btn.active {
  background: rgba(0, 255, 136, 0.2);
}

.emoji-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 4px;
  max-height: 200px;
  overflow-y: auto;
}

.emoji-btn-grid {
  padding: 6px;
  background: transparent;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1.2rem;
  transition: all 0.3s ease;
}

.emoji-btn-grid:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: scale(1.2);
}

/* 附件菜单 */
.attachment-menu {
  position: absolute;
  bottom: 100%;
  right: 60px;
  background: rgba(0, 0, 0, 0.95);
  border: 1px solid #3a4a5c;
  border-radius: 12px;
  padding: 8px;
  backdrop-filter: blur(10px);
  z-index: 50;
}

.attachment-option {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px 16px;
  background: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  color: #e0e6ed;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.attachment-option:hover {
  background: rgba(255, 255, 255, 0.1);
}

.option-icon {
  font-size: 1.2rem;
}

/* 文件预览 */
.file-preview {
  padding: 16px 20px;
  background: rgba(0, 0, 0, 0.2);
  border-top: 1px solid #3a4a5c;
}

.file-preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.file-preview-header span {
  color: #64b5f6;
  font-size: 0.9rem;
  font-weight: 500;
}

.clear-files {
  background: none;
  border: none;
  color: #ff6b6b;
  cursor: pointer;
  font-size: 0.8rem;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.clear-files:hover {
  background: rgba(255, 107, 107, 0.2);
}

.file-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  max-width: 200px;
}

.file-preview-content {
  flex-shrink: 0;
}

.file-thumbnail {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: 4px;
}

.file-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

.file-info {
  flex: 1;
  min-width: 0;
}

.file-name {
  font-size: 0.8rem;
  color: #e0e6ed;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-size {
  font-size: 0.7rem;
  color: #b0bec5;
  margin-top: 2px;
}

.remove-file {
  background: none;
  border: none;
  color: #ff6b6b;
  cursor: pointer;
  font-size: 1.2rem;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.remove-file:hover {
  background: rgba(255, 107, 107, 0.2);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .input-wrapper {
    padding: 12px 16px;
  }
  
  .emoji-picker {
    left: 16px;
    right: 16px;
    width: auto;
  }
  
  .attachment-menu {
    right: 16px;
  }
  
  .file-list {
    flex-direction: column;
  }
  
  .file-item {
    max-width: none;
  }
}

/* 滚动条样式 */
.emoji-grid::-webkit-scrollbar {
  width: 6px;
}

.emoji-grid::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

.emoji-grid::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
}

.emoji-grid::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}
</style>