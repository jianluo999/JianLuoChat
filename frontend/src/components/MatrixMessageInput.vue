<template>
  <div class="message-input-container">
    <!-- 回复预览 -->
    <div v-if="replyingTo" class="reply-preview">
      <div class="reply-content">
        <div class="reply-header">
          <span class="reply-icon">↳</span>
          <span class="reply-user">{{ replyingTo.senderName }}</span>
        </div>
        <div class="reply-message">{{ replyingTo.content }}</div>
      </div>
      <button @click="cancelReply" class="cancel-reply">×</button>
    </div>

    <!-- 输入区域 -->
    <div class="input-area">
      <!-- 工具栏 -->
      <div class="input-toolbar">
        <button
          @click="toggleEmoji"
          class="toolbar-btn"
          :class="{ active: showEmoji }"
          title="表情符号"
        >
          😊
        </button>
        
        <button
          @click="attachFile"
          class="toolbar-btn"
          title="附件"
        >
          📎
        </button>
        
        <button
          @click="toggleFormatting"
          class="toolbar-btn"
          :class="{ active: showFormatting }"
          title="格式化"
        >
          <svg viewBox="0 0 24 24">
            <path d="M5,4V7H10.5V19H13.5V7H19V4H5Z"/>
          </svg>
        </button>
        
        <button
          v-if="supportsEncryption"
          @click="toggleEncryption"
          class="toolbar-btn encryption-btn"
          :class="{ active: encryptionEnabled }"
          title="端到端加密"
        >
          🔐
        </button>
      </div>

      <!-- 格式化工具栏 -->
      <div v-if="showFormatting" class="formatting-toolbar">
        <button @click="insertFormat('**', '**')" class="format-btn" title="粗体">
          <strong>B</strong>
        </button>
        <button @click="insertFormat('*', '*')" class="format-btn" title="斜体">
          <em>I</em>
        </button>
        <button @click="insertFormat('`', '`')" class="format-btn" title="代码">
          <code>&lt;/&gt;</code>
        </button>
        <button @click="insertFormat('```\n', '\n```')" class="format-btn" title="代码块">
          { }
        </button>
        <button @click="insertFormat('> ', '')" class="format-btn" title="引用">
          "
        </button>
      </div>

      <!-- 表情选择器 -->
      <div v-if="showEmoji" class="emoji-picker">
        <div class="emoji-categories">
          <button
            v-for="category in emojiCategories"
            :key="category.name"
            @click="selectedEmojiCategory = category.name"
            :class="['emoji-category-btn', { active: selectedEmojiCategory === category.name }]"
          >
            {{ category.icon }}
          </button>
        </div>
        <div class="emoji-grid">
          <button
            v-for="emoji in currentEmojis"
            :key="emoji"
            @click="insertEmoji(emoji)"
            class="emoji-btn"
          >
            {{ emoji }}
          </button>
        </div>
      </div>

      <!-- 主输入框 -->
      <div class="input-wrapper">
        <textarea
          ref="messageInput"
          v-model="message"
          @keydown="handleKeyDown"
          @input="handleInput"
          @paste="handlePaste"
          :placeholder="placeholder"
          class="message-textarea"
          :disabled="disabled"
          rows="1"
        ></textarea>
        
        <div class="input-actions">
          <!-- 发送按钮 -->
          <button
            @click="sendMessage"
            :disabled="!canSend"
            class="send-button"
            :class="{ sending: sending }"
          >
            <svg v-if="!sending" viewBox="0 0 24 24">
              <path d="M2,21L23,12L2,3V10L17,12L2,14V21Z"/>
            </svg>
            <div v-else class="sending-spinner"></div>
          </button>
        </div>
      </div>

      <!-- 输入状态 -->
      <div class="input-status">
        <div class="typing-indicator" v-if="showTyping">
          <span class="typing-users">{{ typingUsers.join(', ') }}</span>
          <span class="typing-text">正在输入...</span>
        </div>
        
        <div class="message-info">
          <span v-if="encryptionEnabled" class="encryption-status">🔐 加密</span>
          <span class="char-count" :class="{ warning: message.length > 4000 }">
            {{ message.length }}/5000
          </span>
        </div>
      </div>
    </div>

    <!-- 文件上传预览 -->
    <div v-if="uploadingFiles.length > 0" class="file-upload-preview">
      <div
        v-for="file in uploadingFiles"
        :key="file.id"
        class="file-preview"
      >
        <div class="file-info">
          <div class="file-icon">📄</div>
          <div class="file-details">
            <div class="file-name">{{ file.name }}</div>
            <div class="file-size">{{ formatFileSize(file.size) }}</div>
          </div>
        </div>
        <div class="file-progress">
          <div class="progress-bar" :style="{ width: file.progress + '%' }"></div>
        </div>
        <button @click="removeFile(file.id)" class="remove-file">×</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue'

const props = defineProps<{
  roomId: string
  placeholder?: string
  disabled?: boolean
  supportsEncryption?: boolean
  replyingTo?: any
}>()

const emit = defineEmits<{
  'send-message': [content: string, options?: any]
  'cancel-reply': []
  'typing-start': []
  'typing-stop': []
}>()

// 状态
const message = ref('')
const sending = ref(false)
const showEmoji = ref(false)
const showFormatting = ref(false)
const encryptionEnabled = ref(false)
const selectedEmojiCategory = ref('smileys')
const uploadingFiles = ref<any[]>([])
const typingUsers = ref<string[]>([])
const messageInput = ref<HTMLTextAreaElement>()

// 表情符号数据
const emojiCategories = ref([
  { name: 'smileys', icon: '😊', emojis: ['😊', '😂', '🥰', '😍', '🤔', '😅', '😎', '🙄', '😴', '🤗'] },
  { name: 'gestures', icon: '👍', emojis: ['👍', '👎', '👌', '✌️', '🤞', '👏', '🙌', '🤝', '💪', '🙏'] },
  { name: 'objects', icon: '🎉', emojis: ['🎉', '🎊', '🔥', '💯', '⭐', '❤️', '💔', '💡', '🚀', '🎯'] }
])

// 计算属性
const currentEmojis = computed(() => {
  const category = emojiCategories.value.find(c => c.name === selectedEmojiCategory.value)
  return category?.emojis || []
})

const canSend = computed(() => {
  return message.value.trim().length > 0 && !sending.value && !props.disabled
})

const showTyping = computed(() => {
  return typingUsers.value.length > 0
})

// 方法
const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    sendMessage()
  } else if (event.key === 'Escape') {
    if (props.replyingTo) {
      cancelReply()
    }
  }
}

const handleInput = () => {
  // 自动调整高度
  nextTick(() => {
    if (messageInput.value) {
      messageInput.value.style.height = 'auto'
      messageInput.value.style.height = messageInput.value.scrollHeight + 'px'
    }
  })

  // 发送输入状态
  emit('typing-start')
}

const handlePaste = (event: ClipboardEvent) => {
  const items = event.clipboardData?.items
  if (items) {
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      if (item.type.indexOf('image') !== -1) {
        const file = item.getAsFile()
        if (file) {
          uploadFile(file)
        }
      }
    }
  }
}

const sendMessage = async () => {
  if (!canSend.value) return

  const content = message.value.trim()
  sending.value = true

  try {
    const options = {
      encrypted: encryptionEnabled.value,
      replyTo: props.replyingTo?.id
    }

    emit('send-message', content, options)
    message.value = ''
    
    if (props.replyingTo) {
      cancelReply()
    }

    // 重置输入框高度
    nextTick(() => {
      if (messageInput.value) {
        messageInput.value.style.height = 'auto'
      }
    })
  } catch (error) {
    console.error('Failed to send message:', error)
  } finally {
    sending.value = false
  }
}

const cancelReply = () => {
  emit('cancel-reply')
}

const toggleEmoji = () => {
  showEmoji.value = !showEmoji.value
  showFormatting.value = false
}

const toggleFormatting = () => {
  showFormatting.value = !showFormatting.value
  showEmoji.value = false
}

const toggleEncryption = () => {
  encryptionEnabled.value = !encryptionEnabled.value
}

const insertEmoji = (emoji: string) => {
  const textarea = messageInput.value
  if (textarea) {
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const text = message.value
    message.value = text.substring(0, start) + emoji + text.substring(end)
    
    nextTick(() => {
      textarea.focus()
      textarea.setSelectionRange(start + emoji.length, start + emoji.length)
    })
  }
  showEmoji.value = false
}

const insertFormat = (before: string, after: string) => {
  const textarea = messageInput.value
  if (textarea) {
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const text = message.value
    const selectedText = text.substring(start, end)
    
    message.value = text.substring(0, start) + before + selectedText + after + text.substring(end)
    
    nextTick(() => {
      textarea.focus()
      const newPos = start + before.length + selectedText.length + after.length
      textarea.setSelectionRange(newPos, newPos)
    })
  }
}

const attachFile = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.multiple = true
  input.accept = 'image/*,video/*,audio/*,.pdf,.doc,.docx,.txt'
  
  input.onchange = (event: any) => {
    const files = event.target.files
    for (let i = 0; i < files.length; i++) {
      uploadFile(files[i])
    }
  }
  
  input.click()
}

const uploadFile = (file: File) => {
  const fileObj = {
    id: Date.now() + Math.random(),
    name: file.name,
    size: file.size,
    progress: 0,
    file
  }
  
  uploadingFiles.value.push(fileObj)
  
  // 模拟文件上传进度
  const interval = setInterval(() => {
    fileObj.progress += 10
    if (fileObj.progress >= 100) {
      clearInterval(interval)
      // 这里应该调用实际的文件上传API
    }
  }, 200)
}

const removeFile = (fileId: number) => {
  const index = uploadingFiles.value.findIndex(f => f.id === fileId)
  if (index !== -1) {
    uploadingFiles.value.splice(index, 1)
  }
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 生命周期
onMounted(() => {
  if (messageInput.value) {
    messageInput.value.focus()
  }
})

onUnmounted(() => {
  emit('typing-stop')
})
</script>

<style scoped>
.message-input-container {
  background: rgba(0, 0, 0, 0.2);
  border-top: 1px solid #3a4a5c;
}

.reply-preview {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: rgba(100, 181, 246, 0.1);
  border-bottom: 1px solid rgba(100, 181, 246, 0.3);
}

.reply-content {
  flex: 1;
}

.reply-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.reply-icon {
  color: #64b5f6;
  font-size: 1.2rem;
}

.reply-user {
  color: #64b5f6;
  font-weight: 600;
  font-size: 0.9rem;
}

.reply-message {
  color: #b0bec5;
  font-size: 0.85rem;
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cancel-reply {
  background: none;
  border: none;
  color: #e0e6ed;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: background 0.3s ease;
}

.cancel-reply:hover {
  background: rgba(255, 255, 255, 0.1);
}

.input-area {
  padding: 16px;
}

.input-toolbar {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.toolbar-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.toolbar-btn:hover,
.toolbar-btn.active {
  background: rgba(100, 181, 246, 0.2);
}

.toolbar-btn svg {
  width: 16px;
  height: 16px;
  fill: #e0e6ed;
}

.encryption-btn.active {
  background: rgba(255, 167, 38, 0.2);
}

.formatting-toolbar {
  display: flex;
  gap: 4px;
  margin-bottom: 12px;
  padding: 8px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.format-btn {
  padding: 4px 8px;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  color: #e0e6ed;
  cursor: pointer;
  font-size: 0.8rem;
  transition: background 0.3s ease;
}

.format-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.emoji-picker {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
}

.emoji-categories {
  display: flex;
  gap: 4px;
  margin-bottom: 8px;
}

.emoji-category-btn {
  padding: 6px;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.3s ease;
}

.emoji-category-btn:hover,
.emoji-category-btn.active {
  background: rgba(100, 181, 246, 0.2);
}

.emoji-grid {
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  gap: 4px;
  max-height: 120px;
  overflow-y: auto;
}

.emoji-btn {
  padding: 6px;
  border: none;
  background: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1.2rem;
  transition: background 0.3s ease;
}

.emoji-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.input-wrapper {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 12px;
}

.message-textarea {
  flex: 1;
  background: none;
  border: none;
  color: #e0e6ed;
  font-size: 1rem;
  line-height: 1.4;
  resize: none;
  min-height: 20px;
  max-height: 120px;
  overflow-y: auto;
}

.message-textarea:focus {
  outline: none;
}

.message-textarea::placeholder {
  color: #666;
}

.input-actions {
  display: flex;
  align-items: center;
}

.send-button {
  width: 36px;
  height: 36px;
  border: none;
  background: #64b5f6;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.send-button:hover:not(:disabled) {
  background: #42a5f5;
  transform: scale(1.05);
}

.send-button:disabled {
  background: #555;
  cursor: not-allowed;
  transform: none;
}

.send-button svg {
  width: 20px;
  height: 20px;
  fill: #1a1a2e;
}

.sending-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(26, 26, 46, 0.3);
  border-top: 2px solid #1a1a2e;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.input-status {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
  font-size: 0.8rem;
}

.typing-indicator {
  color: #64b5f6;
}

.typing-users {
  font-weight: 600;
}

.message-info {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #b0bec5;
}

.encryption-status {
  color: #ffa726;
}

.char-count.warning {
  color: #f44336;
}

.file-upload-preview {
  padding: 12px 16px;
  border-top: 1px solid #3a4a5c;
}

.file-preview {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  margin-bottom: 8px;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.file-icon {
  font-size: 1.5rem;
}

.file-details {
  flex: 1;
}

.file-name {
  font-size: 0.9rem;
  color: #e0e6ed;
}

.file-size {
  font-size: 0.8rem;
  color: #b0bec5;
}

.file-progress {
  width: 100px;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: #64b5f6;
  transition: width 0.3s ease;
}

.remove-file {
  background: none;
  border: none;
  color: #e0e6ed;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: background 0.3s ease;
}

.remove-file:hover {
  background: rgba(244, 67, 54, 0.2);
  color: #f44336;
}
</style>
