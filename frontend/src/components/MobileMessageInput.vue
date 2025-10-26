<template>
  <div class="mobile-message-input">
    <div class="input-container">
      <div class="input-actions">
        <button class="input-action" @click="handleEmoji">
          <svg viewBox="0 0 24 24" class="action-icon">
            <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M12,7A5,5 0 0,0 7,12A5,5 0 0,0 12,17A5,5 0 0,0 17,12A5,5 0 0,0 12,7M17,12C17,12.55 16.55,13 16,13C15.45,13 15,12.55 15,12C15,11.45 15.45,11 16,11C16.55,11 17,11.45 17,12M7,12C7,12.55 6.55,13 6,13C5.45,13 5,12.55 5,12C5,11.45 5.45,11 6,11C6.55,11 7,11.45 7,12Z"/>
          </svg>
        </button>
        
        <button class="input-action" @click="handlePhoto">
          <svg viewBox="0 0 24 24" class="action-icon">
            <path d="M21,19H3V5H21M21,3A2,2 0 0,1 23,5V19A2,2 0 0,1 21,21H3A2,2 0 0,1 1,19V5A2,2 0 0,1 3,3H21M17,7L13,11L17,15M21,17V19H19V17H17V15H19V13H21V15H23V17H21M11,11L7,7L11,3M11,11L7,15L11,19M11,11L15,15L11,19M11,11L15,7L11,3"/>
          </svg>
        </button>
        
        <button class="input-action" @click="handleCamera">
          <svg viewBox="0 0 24 24" class="action-icon">
            <path d="M19,5V19A2,2 0 0,1 17,21H7A2,2 0 0,1 5,19V5A2,2 0 0,1 7,3H17A2,2 0 0,1 19,5M17,5H7V19H17V5M12,7A5,5 0 0,0 7,12A5,5 0 0,0 12,17A5,5 0 0,0 17,12A5,5 0 0,0 12,7Z"/>
          </svg>
        </button>
      </div>
      
      <textarea
        ref="inputRef"
        v-model="messageText"
        :placeholder="placeholder"
        class="message-input"
        @input="handleInput"
        @keydown.enter="handleEnter"
        @focus="handleFocus"
        @blur="handleBlur"
      ></textarea>
      
      <div class="input-actions">
        <button v-if="showEncryptionToggle" class="input-action" @click="toggleEncryption">
          <svg viewBox="0 0 24 24" class="action-icon" :class="{ active: encryptionEnabled }">
            <path d="M12,17A2,2 0 0,0 14,15C14,13.89 13.1,13 12,13A2,2 0 0,0 10,15A2,2 0 0,0 12,17M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V10C4,8.89 4.9,8 6,8H7V6A5,5 0 0,1 12,1A5,5 0 0,1 17,6V8H18M12,3A3,3 0 0,0 9,6V8H15V6A3,3 0 0,0 12,3Z"/>
          </svg>
        </button>
        
        <button class="send-btn" @click="sendMessage" :disabled="!messageText.trim()">
          <span v-if="sending" class="sending-spinner"></span>
          <span v-else>发送</span>
        </button>
      </div>
    </div>
    
    <!-- 语音输入 -->
    <div v-if="showVoiceInput" class="voice-input">
      <button class="voice-btn" @click="toggleVoiceInput">
        <svg viewBox="0 0 24 24" class="voice-icon">
          <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M12,7A5,5 0 0,0 7,12A5,5 0 0,0 12,17A5,5 0 0,0 17,12A5,5 0 0,0 12,7M17,12C17,12.55 16.55,13 16,13C15.45,13 15,12.55 15,12C15,11.45 15.45,11 16,11C16.55,11 17,11.45 17,12M7,12C7,12.55 6.55,13 6,13C5.45,13 5,12.55 5,12C5,11.45 5.45,11 6,11C6.55,11 7,11.45 7,12Z"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useMatrixStore } from '@/stores/matrix'

interface Props {
  roomId: string
  placeholder?: string
  supportsEncryption?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '输入消息...',
  supportsEncryption: false
})

const emit = defineEmits<{
  'send-message': [content: string, options?: any]
  'cancel-reply': []
}>

const matrixStore = useMatrixStore()

// 状态管理
const messageText = ref('')
const inputRef = ref<HTMLTextAreaElement>()
const sending = ref(false)
const isFocused = ref(false)
const showVoiceInput = ref(false)

// 计算属性
const showEncryptionToggle = computed(() => {
  return props.supportsEncryption
})

const encryptionEnabled = ref(false)

// 方法
const handleInput = () => {
  // 自动调整高度
  if (inputRef.value) {
    inputRef.value.style.height = 'auto'
    inputRef.value.style.height = Math.min(inputRef.value.scrollHeight, 100) + 'px'
  }
}

const handleEnter = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    sendMessage()
  }
}

const handleFocus = () => {
  isFocused.value = true
}

const handleBlur = () => {
  isFocused.value = false
}

const handleEmoji = () => {
  console.log('打开表情选择器')
}

const handlePhoto = () => {
  console.log('选择图片')
}

const handleCamera = () => {
  console.log('打开相机')
}

const toggleEncryption = () => {
  encryptionEnabled.value = !encryptionEnabled.value
}

const toggleVoiceInput = () => {
  showVoiceInput.value = !showVoiceInput.value
}

const sendMessage = async () => {
  if (!messageText.value.trim()) return

  const content = messageText.value.trim()
  const options: any = {}

  if (encryptionEnabled.value) {
    options.encrypted = true
  }

  try {
    sending.value = true
    emit('send-message', content, options)
    messageText.value = ''
    
    if (inputRef.value) {
      inputRef.value.style.height = 'auto'
    }
  } catch (error) {
    console.error('发送消息失败:', error)
  } finally {
    sending.value = false
  }
}

// 监听roomId变化，重置状态
watch(() => props.roomId, () => {
  messageText.value = ''
  encryptionEnabled.value = false
  if (inputRef.value) {
    inputRef.value.style.height = 'auto'
  }
})
</script>

<style scoped>
.mobile-message-input {
  background: #ffffff;
  border-top: 1px solid #e8e8e8;
  padding: 8px 16px;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
}

.input-container {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 8px 0;
}

.input-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.input-action {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.input-action:hover {
  background: #f5f5f5;
}

.input-action.active {
  background: #07c160;
}

.action-icon {
  width: 18px;
  height: 18px;
  fill: #888;
  transition: fill 0.2s;
}

.input-action:hover .action-icon {
  fill: #07c160;
}

.message-input {
  flex: 1;
  background: #f5f5f5;
  border: none;
  border-radius: 20px;
  padding: 8px 16px;
  font-size: 14px;
  color: #222;
  resize: none;
  overflow: hidden;
  outline: none;
  min-height: 36px;
  max-height: 100px;
  line-height: 1.4;
}

.message-input:focus {
  background: #e6f7ff;
}

.send-btn {
  background: #07c160;
  color: white;
  border: none;
  border-radius: 18px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  min-width: 56px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.send-btn:hover:not(:disabled) {
  background: #52c41a;
  transform: translateY(-1px);
}

.send-btn:disabled {
  background: #bfbfbf;
  cursor: not-allowed;
}

.sending-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid #ffffff;
  border-top: 2px solid transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.voice-input {
  margin-top: 8px;
}

.voice-btn {
  width: 48px;
  height: 48px;
  border: 2px solid #07c160;
  border-radius: 50%;
  background: #f5f5f5;
  color: #07c160;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.voice-btn:hover {
  background: #07c160;
  color: white;
  transform: scale(1.05);
}

.voice-icon {
  width: 20px;
  height: 20px;
}

/* 动画 */
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 响应式适配 */
@media (max-width: 320px) {
  .input-container {
    gap: 6px;
  }
  
  .input-action {
    width: 28px;
    height: 28px;
  }
  
  .action-icon {
    width: 16px;
    height: 16px;
  }
  
  .message-input {
    padding: 6px 12px;
    min-height: 32px;
  }
  
  .send-btn {
    padding: 6px 12px;
    min-width: 48px;
    height: 32px;
    font-size: 12px;
  }
  
  .voice-btn {
    width: 40px;
    height: 40px;
  }
  
  .voice-icon {
    width: 18px;
    height: 18px;
  }
}
</style>