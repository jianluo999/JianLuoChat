<template>
  <div class="message-input-container">
    <div class="input-toolbar">
      <div class="toolbar-left">
        <el-button type="text" @click="showEmojiPicker = !showEmojiPicker">
          <el-icon><ChatDotRound /></el-icon>
        </el-button>
        
        <el-upload
          ref="fileUploadRef"
          :show-file-list="false"
          :before-upload="handleFileUpload"
          accept="image/*,application/pdf,.doc,.docx,.txt"
        >
          <el-button type="text">
            <el-icon><Paperclip /></el-icon>
          </el-button>
        </el-upload>
        
        <el-upload
          ref="imageUploadRef"
          :show-file-list="false"
          :before-upload="handleImageUpload"
          accept="image/*"
        >
          <el-button type="text">
            <el-icon><Picture /></el-icon>
          </el-button>
        </el-upload>
      </div>
    </div>

    <!-- 表情选择器 -->
    <div v-if="showEmojiPicker" class="emoji-picker">
      <div class="emoji-grid">
        <span
          v-for="emoji in commonEmojis"
          :key="emoji"
          class="emoji-item"
          @click="insertEmoji(emoji)"
        >
          {{ emoji }}
        </span>
      </div>
    </div>

    <div class="input-area">
      <el-input
        ref="inputRef"
        v-model="messageText"
        type="textarea"
        :rows="3"
        resize="none"
        placeholder="输入消息... (Ctrl+Enter 发送)"
        @keydown="handleKeydown"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
      />
      
      <div class="input-actions">
        <el-button
          type="primary"
          :disabled="!messageText.trim()"
          @click="sendMessage"
        >
          发送
        </el-button>
      </div>
    </div>

    <!-- 文件上传进度 -->
    <div v-if="uploadProgress > 0 && uploadProgress < 100" class="upload-progress">
      <el-progress :percentage="uploadProgress" :show-text="false" />
      <span class="progress-text">上传中... {{ uploadProgress }}%</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { ElMessage, type UploadInstance } from 'element-plus'
import { ChatDotRound, Paperclip, Picture } from '@element-plus/icons-vue'
import { fileAPI } from '@/services/api'

interface Emits {
  (e: 'send', message: string): void
  (e: 'typing', isTyping: boolean): void
}

const emit = defineEmits<Emits>()

const inputRef = ref<any>()
const fileUploadRef = ref<UploadInstance>()
const imageUploadRef = ref<UploadInstance>()

const messageText = ref('')
const showEmojiPicker = ref(false)
const uploadProgress = ref(0)
const isTyping = ref(false)
const typingTimer = ref<NodeJS.Timeout>()

const commonEmojis = [
  '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣',
  '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰',
  '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜',
  '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏',
  '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣',
  '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠',
  '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨',
  '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥',
  '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧',
  '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐',
  '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑',
  '🤠', '😈', '👿', '👹', '👺', '🤡', '💩', '👻',
  '💀', '☠️', '👽', '👾', '🤖', '🎃', '😺', '😸',
  '😹', '😻', '😼', '😽', '🙀', '😿', '😾', '👋',
  '🤚', '🖐️', '✋', '🖖', '👌', '🤏', '✌️', '🤞',
  '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇',
  '☝️', '👍', '👎', '👊', '✊', '🤛', '🤜', '👏',
  '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💅', '🤳'
]

const handleKeydown = (event: KeyboardEvent) => {
  if (event.ctrlKey && event.key === 'Enter') {
    event.preventDefault()
    sendMessage()
  }
}

const handleInput = () => {
  if (!isTyping.value) {
    isTyping.value = true
    emit('typing', true)
  }
  
  // 清除之前的定时器
  if (typingTimer.value) {
    clearTimeout(typingTimer.value)
  }
  
  // 设置新的定时器，1秒后停止输入状态
  typingTimer.value = setTimeout(() => {
    isTyping.value = false
    emit('typing', false)
  }, 1000)
}

const handleFocus = () => {
  showEmojiPicker.value = false
}

const handleBlur = () => {
  if (isTyping.value) {
    isTyping.value = false
    emit('typing', false)
  }
}

const sendMessage = () => {
  const message = messageText.value.trim()
  if (!message) return
  
  emit('send', message)
  messageText.value = ''
  
  if (isTyping.value) {
    isTyping.value = false
    emit('typing', false)
  }
  
  // 聚焦输入框
  nextTick(() => {
    inputRef.value?.focus()
  })
}

const insertEmoji = (emoji: string) => {
  const textarea = inputRef.value?.textarea
  if (!textarea) return
  
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const text = messageText.value
  
  messageText.value = text.substring(0, start) + emoji + text.substring(end)
  
  nextTick(() => {
    textarea.selectionStart = textarea.selectionEnd = start + emoji.length
    textarea.focus()
  })
  
  showEmojiPicker.value = false
}

const handleFileUpload = async (file: File) => {
  try {
    uploadProgress.value = 0
    
    // 模拟上传进度
    const progressInterval = setInterval(() => {
      uploadProgress.value += 10
      if (uploadProgress.value >= 90) {
        clearInterval(progressInterval)
      }
    }, 200)
    
    const response = await fileAPI.uploadFile(file)
    
    clearInterval(progressInterval)
    uploadProgress.value = 100
    
    // 发送文件消息
    emit('send', `[文件] ${file.name}`)
    
    setTimeout(() => {
      uploadProgress.value = 0
    }, 1000)
    
  } catch (error) {
    uploadProgress.value = 0
    ElMessage.error('文件上传失败')
  }
  
  return false // 阻止默认上传行为
}

const handleImageUpload = async (file: File) => {
  try {
    uploadProgress.value = 0
    
    // 模拟上传进度
    const progressInterval = setInterval(() => {
      uploadProgress.value += 10
      if (uploadProgress.value >= 90) {
        clearInterval(progressInterval)
      }
    }, 200)
    
    const response = await fileAPI.uploadFile(file)
    
    clearInterval(progressInterval)
    uploadProgress.value = 100
    
    // 发送图片消息
    emit('send', `[图片] ${file.name}`)
    
    setTimeout(() => {
      uploadProgress.value = 0
    }, 1000)
    
  } catch (error) {
    uploadProgress.value = 0
    ElMessage.error('图片上传失败')
  }
  
  return false // 阻止默认上传行为
}
</script>

<style scoped>
.message-input-container {
  position: relative;
}

.input-toolbar {
  padding: 8px 16px;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.toolbar-left {
  display: flex;
  gap: 4px;
}

.emoji-picker {
  position: absolute;
  bottom: 100%;
  left: 16px;
  background: white;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  padding: 12px;
  max-width: 300px;
}

.emoji-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 8px;
  max-height: 200px;
  overflow-y: auto;
}

.emoji-item {
  font-size: 20px;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  text-align: center;
  transition: background-color 0.2s;
}

.emoji-item:hover {
  background: #f5f7fa;
}

.input-area {
  padding: 16px;
  display: flex;
  gap: 12px;
  align-items: flex-end;
}

.input-area :deep(.el-textarea) {
  flex: 1;
}

.input-area :deep(.el-textarea__inner) {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 12px;
  font-size: 14px;
  line-height: 1.4;
  resize: none;
}

.input-area :deep(.el-textarea__inner):focus {
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.input-actions {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.upload-progress {
  padding: 8px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  background: #f8f9fa;
  border-top: 1px solid #e4e7ed;
}

.upload-progress :deep(.el-progress) {
  flex: 1;
}

.progress-text {
  font-size: 12px;
  color: #909399;
  white-space: nowrap;
}
</style>
