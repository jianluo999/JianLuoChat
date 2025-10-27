<template>
  <div class="enhanced-message-input">
    <!-- 回复预览 -->
    <div v-if="replyingTo" class="reply-preview">
      <div class="reply-header">
        <span class="reply-label">回复 {{ replyingTo.senderName }}</span>
        <button @click="cancelReply" class="cancel-reply-btn">✕</button>
      </div>
      <div class="reply-content">{{ replyingTo.content }}</div>
    </div>

    <!-- 输入区域 -->
    <div class="input-container">
      <div class="input-wrapper">
        <!-- 表情按钮 -->
        <button @click="toggleEmojiPicker" class="emoji-btn" title="表情">
          😊
        </button>

        <!-- 文本输入框 -->
        <textarea
          ref="messageInput"
          v-model="messageText"
          @keydown="handleKeydown"
          @input="handleInput"
          @focus="handleFocus"
          @blur="handleBlur"
          placeholder="输入消息..."
          class="message-textarea"
          rows="1"
        ></textarea>

        <!-- 文件上传按钮 -->
        <input
          ref="fileInput"
          type="file"
          @change="handleFileSelect"
          multiple
          accept="*/*"
          style="display: none"
        />
        <button @click="triggerFileUpload" class="file-btn" title="发送文件">
          📎
        </button>

        <!-- 发送按钮 -->
        <button
          @click="sendMessage"
          :disabled="!canSend"
          class="send-btn"
          :class="{ active: canSend }"
          title="发送消息"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M2,21L23,12L2,3V10L17,12L2,14V21Z"/>
          </svg>
        </button>
      </div>

      <!-- 表情选择器 -->
      <div v-if="showEmojiPicker" class="emoji-picker" ref="emojiPickerRef">
        <div class="emoji-categories">
          <div
            v-for="category in emojiCategories"
            :key="category.name"
            class="emoji-category"
          >
            <div class="category-title">{{ category.title }}</div>
            <div class="emoji-grid">
              <button
                v-for="emoji in category.emojis"
                :key="emoji"
                @click="insertEmoji(emoji)"
                class="emoji-btn-grid"
                :title="emoji"
              >
                {{ emoji }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 文件预览 -->
      <div v-if="selectedFiles.length > 0" class="file-preview">
        <div class="file-preview-header">
          <span>准备发送 {{ selectedFiles.length }} 个文件</span>
          <button @click="clearFiles" class="clear-files-btn">清除</button>
        </div>
        <div class="file-list">
          <div
            v-for="(file, index) in selectedFiles"
            :key="index"
            class="file-item"
          >
            <div class="file-icon">
              {{ getFileIcon(file.type) }}
            </div>
            <div class="file-info">
              <div class="file-name">{{ file.name }}</div>
              <div class="file-size">{{ formatFileSize(file.size) }}</div>
            </div>
            <button @click="removeFile(index)" class="remove-file-btn">✕</button>
          </div>
        </div>
      </div>

      <!-- 输入提示 -->
      <div class="input-hints">
        <div class="hint-item">Enter 发送，Shift+Enter 换行</div>
        <div v-if="isTyping" class="typing-status">正在输入...</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { useMatrixStore } from '@/stores/matrix'

interface ReplyMessage {
  eventId: string
  senderName: string
  content: string
}

const props = defineProps<{
  roomId: string
  replyingTo?: ReplyMessage | null
}>()

const emit = defineEmits<{
  messageSent: [content: string, files?: File[]]
  replyCancel: []
  startTyping: []
  stopTyping: []
}>()

const matrixStore = useMatrixStore()

// 响应式数据
const messageText = ref('')
const selectedFiles = ref<File[]>([])
const showEmojiPicker = ref(false)
const isTyping = ref(false)
const typingTimeout = ref<NodeJS.Timeout>()

// 引用
const messageInput = ref<HTMLTextAreaElement>()
const fileInput = ref<HTMLInputElement>()
const emojiPickerRef = ref<HTMLElement>()

// 表情符号分类
const emojiCategories = ref([
  {
    name: 'recent',
    title: '🕒 最近使用',
    emojis: ['😀', '😂', '❤️', '👍', '👎', '😊', '🎉', '🔥']
  },
  {
    name: 'smileys',
    title: '😊 表情',
    emojis: ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳']
  },
  {
    name: 'gestures',
    title: '👍 手势',
    emojis: ['👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👋', '🤚', '🖐️', '✋', '🖖', '👏', '🙌', '🤲', '🤝', '🙏']
  },
  {
    name: 'objects',
    title: '🎯 物品',
    emojis: ['🎉', '🎊', '🎈', '🎁', '🏆', '🥇', '🥈', '🥉', '⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏉', '🎱', '🏓', '🏸', '🥅', '🏒', '🏑', '🥍', '🏏', '⛳']
  }
])

// 计算属性
const canSend = computed(() => {
  return messageText.value.trim() !== '' || selectedFiles.value.length > 0
})

// 方法
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    sendMessage()
  } else if (event.key === 'Escape' && props.replyingTo) {
    cancelReply()
  }
}

const handleInput = () => {
  // 自动调整文本框高度
  if (messageInput.value) {
    messageInput.value.style.height = 'auto'
    messageInput.value.style.height = messageInput.value.scrollHeight + 'px'
  }

  // 发送输入状态
  if (!isTyping.value) {
    isTyping.value = true
    emit('startTyping')
    matrixStore.sendTypingNotification(props.roomId, true)
  }

  // 重置输入状态超时
  if (typingTimeout.value) {
    clearTimeout(typingTimeout.value)
  }

  typingTimeout.value = setTimeout(() => {
    isTyping.value = false
    emit('stopTyping')
    matrixStore.sendTypingNotification(props.roomId, false)
  }, 3000)
}

const handleFocus = () => {
  // 聚焦时可以做一些处理
}

const handleBlur = () => {
  // 失焦时停止输入状态
  if (isTyping.value) {
    isTyping.value = false
    emit('stopTyping')
    matrixStore.sendTypingNotification(props.roomId, false)
  }
}

const sendMessage = async () => {
  if (!canSend.value) return

  const content = messageText.value.trim()
  const files = [...selectedFiles.value]

  try {
    // 如果是回复消息
    if (props.replyingTo && content) {
      await matrixStore.sendReplyMessage(props.roomId, content, props.replyingTo.eventId)
    } else if (content) {
      // 普通文本消息
      await matrixStore.sendMatrixMessage(props.roomId, content)
    }

    // 发送文件
    for (const file of files) {
      try {
        const contentUri = await matrixStore.uploadFileToMatrix(file)
        if (contentUri) {
          await matrixStore.sendFileMessage(props.roomId, file, contentUri)
        }
      } catch (fileError) {
        console.error('发送文件失败:', fileError)
      }
    }

    // 清空输入
    messageText.value = ''
    selectedFiles.value = []
    
    // 重置文本框高度
    if (messageInput.value) {
      messageInput.value.style.height = 'auto'
    }

    // 取消回复
    if (props.replyingTo) {
      cancelReply()
    }

    // 停止输入状态
    if (isTyping.value) {
      isTyping.value = false
      emit('stopTyping')
      matrixStore.sendTypingNotification(props.roomId, false)
    }

    emit('messageSent', content, files)

  } catch (error) {
    console.error('发送消息失败:', error)
  }
}

const cancelReply = () => {
  emit('replyCancel')
}

const toggleEmojiPicker = () => {
  showEmojiPicker.value = !showEmojiPicker.value
}

const insertEmoji = (emoji: string) => {
  const input = messageInput.value
  if (input) {
    const start = input.selectionStart || 0
    const end = input.selectionEnd || 0
    const text = messageText.value
    messageText.value = text.slice(0, start) + emoji + text.slice(end)
    
    // 恢复光标位置
    nextTick(() => {
      const newPos = start + emoji.length
      input.setSelectionRange(newPos, newPos)
      input.focus()
    })
  } else {
    messageText.value += emoji
  }
  
  showEmojiPicker.value = false
}

const triggerFileUpload = () => {
  fileInput.value?.click()
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files) {
    selectedFiles.value.push(...Array.from(target.files))
    target.value = '' // 清空input以允许重复选择同一文件
  }
}

const removeFile = (index: number) => {
  selectedFiles.value.splice(index, 1)
}

const clearFiles = () => {
  selectedFiles.value = []
}

const getFileIcon = (mimeType: string): string => {
  if (mimeType.startsWith('image/')) return '🖼️'
  if (mimeType.startsWith('video/')) return '🎥'
  if (mimeType.startsWith('audio/')) return '🎵'
  if (mimeType.includes('pdf')) return '📄'
  if (mimeType.includes('word')) return '📝'
  if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊'
  if (mimeType.includes('zip') || mimeType.includes('rar')) return '📦'
  return '📎'
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 点击外部关闭表情选择器
const handleClickOutside = (event: MouseEvent) => {
  if (emojiPickerRef.value && !emojiPickerRef.value.contains(event.target as Node)) {
    showEmojiPicker.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  if (typingTimeout.value) {
    clearTimeout(typingTimeout.value)
  }
})

// 监听回复状态变化
watch(() => props.replyingTo, (newReply) => {
  if (newReply) {
    nextTick(() => {
      messageInput.value?.focus()
    })
  }
})
</script>

<style scoped>
.enhanced-message-input {
  background: #f8f8f8;
  border-top: 1px solid #e0e0e0;
}

.reply-preview {
  background: #f0f0f0;
  border-left: 3px solid #00ff00;
  padding: 10px 15px;
  margin: 10px;
  border-radius: 8px;
}

.reply-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
}

.reply-label {
  font-size: 12px;
  color: #00ff00;
  font-weight: bold;
}

.cancel-reply-btn {
  background: none;
  border: none;
  color: #888;
  cursor: pointer;
  padding: 2px;
  border-radius: 50%;
}

.cancel-reply-btn:hover {
  background: #ddd;
}

.reply-content {
  font-size: 13px;
  color: #666;
  max-height: 40px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.input-container {
  position: relative;
}

.input-wrapper {
  display: flex;
  align-items: flex-end;
  padding: 10px 15px;
  gap: 10px;
}

.emoji-btn, .file-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  padding: 5px;
  border-radius: 50%;
  transition: background 0.2s ease;
}

.emoji-btn:hover, .file-btn:hover {
  background: #e0e0e0;
}

.message-textarea {
  flex: 1;
  border: 1px solid #ddd;
  border-radius: 20px;
  padding: 10px 15px;
  font-size: 14px;
  line-height: 1.4;
  resize: none;
  max-height: 120px;
  overflow-y: auto;
  outline: none;
  font-family: inherit;
}

.message-textarea:focus {
  border-color: #00ff00;
  box-shadow: 0 0 5px rgba(0, 255, 0, 0.3);
}

.send-btn {
  background: #ddd;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #666;
}

.send-btn.active {
  background: #00ff00;
  color: white;
}

.send-btn:hover.active {
  background: #00cc00;
}

.send-btn:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.emoji-picker {
  position: absolute;
  bottom: 100%;
  left: 15px;
  right: 15px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  max-height: 300px;
  overflow-y: auto;
  z-index: 1000;
  padding: 15px;
}

.emoji-categories {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.emoji-category {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.category-title {
  font-size: 12px;
  font-weight: bold;
  color: #666;
  padding-bottom: 5px;
  border-bottom: 1px solid #eee;
}

.emoji-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 4px;
}

.emoji-btn-grid {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: background 0.2s ease;
}

.emoji-btn-grid:hover {
  background: #f0f0f0;
}

.file-preview {
  margin: 10px 15px;
  background: #f9f9f9;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 10px;
}

.file-preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  font-size: 12px;
  color: #666;
}

.clear-files-btn {
  background: none;
  border: none;
  color: #ff4444;
  cursor: pointer;
  font-size: 12px;
}

.file-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px;
  background: white;
  border-radius: 6px;
  border: 1px solid #e0e0e0;
}

.file-icon {
  font-size: 20px;
}

.file-info {
  flex: 1;
}

.file-name {
  font-size: 13px;
  font-weight: bold;
  color: #333;
}

.file-size {
  font-size: 11px;
  color: #888;
}

.remove-file-btn {
  background: none;
  border: none;
  color: #ff4444;
  cursor: pointer;
  padding: 2px;
  border-radius: 50%;
}

.remove-file-btn:hover {
  background: #ffe0e0;
}

.input-hints {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 15px;
  font-size: 11px;
  color: #888;
}

.typing-status {
  color: #00ff00;
  font-style: italic;
}

/* 滚动条样式 */
.emoji-picker::-webkit-scrollbar {
  width: 6px;
}

.emoji-picker::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.emoji-picker::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.emoji-picker::-webkit-scrollbar-thumb:hover {
  background: #a1a1a1;
}
</style>