<template>
  <div class="thread-panel" :class="{ 'thread-panel-open': isOpen }">
    <!-- 线程头部 -->
    <div class="thread-header">
      <div class="thread-title">
        <span class="thread-icon">🧵</span>
        <span class="thread-text">线程</span>
        <span v-if="threadMessages.length > 0" class="thread-count">
          {{ threadMessages.length }}
        </span>
      </div>
      <button @click="closeThread" class="close-thread-btn">
        <span class="close-icon">✕</span>
      </button>
    </div>

    <!-- 原始消息 -->
    <div v-if="rootMessage" class="thread-root-message">
      <div class="root-message-header">
        <span class="root-message-label">原始消息</span>
      </div>
      <div class="root-message-content">
        <div class="message-sender">{{ rootMessage.senderName }}</div>
        <div class="message-text">{{ rootMessage.content }}</div>
        <div class="message-time">{{ formatTime(rootMessage.timestamp) }}</div>
      </div>
    </div>

    <!-- 线程消息列表 -->
    <div class="thread-messages" ref="threadMessagesContainer">
      <div v-if="threadMessages.length === 0" class="no-thread-messages">
        <div class="no-messages-icon">💬</div>
        <div class="no-messages-text">还没有回复</div>
        <div class="no-messages-hint">成为第一个回复的人</div>
      </div>

      <div v-else class="thread-message-list">
        <ThreadMessageItem
          v-for="message in threadMessages"
          :key="message.id"
          :message="message"
          :room-id="roomId"
          :is-thread-message="true"
          @reply="handleReply"
          @edit="handleEdit"
          @delete="handleDelete"
        />
      </div>
    </div>

    <!-- 线程输入框 -->
    <div class="thread-input-container">
      <div class="thread-input-wrapper">
        <textarea
          ref="threadInput"
          v-model="threadReplyContent"
          @keydown="handleKeydown"
          @input="handleInput"
          class="thread-input"
          placeholder="回复线程..."
          rows="1"
        ></textarea>
        <div class="thread-input-actions">
          <button
            @click="sendThreadReply"
            :disabled="!threadReplyContent.trim() || isSending"
            class="send-thread-btn"
          >
            <span v-if="isSending" class="sending-icon">⏳</span>
            <span v-else class="send-icon">📤</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { useMatrixStore } from '@/stores/matrix'
import ThreadMessageItem from './ThreadMessageItem.vue'

interface Props {
  isOpen: boolean
  roomId: string
  rootMessageId: string | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
  messageAdded: [message: any]
}>()

const matrixStore = useMatrixStore()

// 响应式数据
const threadReplyContent = ref('')
const isSending = ref(false)
const threadInput = ref<HTMLTextAreaElement>()
const threadMessagesContainer = ref<HTMLElement>()

// 计算属性
const rootMessage = computed(() => {
  if (!props.rootMessageId || !props.roomId) return null
  const roomMessages = matrixStore.messages.get(props.roomId) || []
  return roomMessages.find(msg => msg.id === props.rootMessageId)
})

const threadMessages = computed(() => {
  if (!props.rootMessageId || !props.roomId) return []
  const roomMessages = matrixStore.messages.get(props.roomId) || []
  return roomMessages.filter(msg => 
    msg.threadRootId === props.rootMessageId && 
    msg.id !== props.rootMessageId
  ).sort((a, b) => a.timestamp - b.timestamp)
})

// 方法
const closeThread = () => {
  emit('close')
}

const formatTime = (timestamp: number) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  if (diff < 24 * 60 * 60 * 1000) {
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  } else {
    return date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })
  }
}

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    sendThreadReply()
  }
}

const handleInput = () => {
  // 自动调整输入框高度
  if (threadInput.value) {
    threadInput.value.style.height = 'auto'
    threadInput.value.style.height = Math.min(threadInput.value.scrollHeight, 120) + 'px'
  }
}

const sendThreadReply = async () => {
  if (!threadReplyContent.value.trim() || isSending.value || !props.rootMessageId) {
    return
  }

  try {
    isSending.value = true
    
    // 发送线程回复
    await matrixStore.sendThreadReply(
      props.roomId,
      props.rootMessageId,
      threadReplyContent.value.trim()
    )

    // 清空输入框
    threadReplyContent.value = ''
    
    // 重置输入框高度
    if (threadInput.value) {
      threadInput.value.style.height = 'auto'
    }

    // 滚动到底部
    await nextTick()
    scrollToBottom()

    console.log('✅ 线程回复发送成功')
  } catch (error) {
    console.error('❌ 发送线程回复失败:', error)
    // 可以添加错误提示
  } finally {
    isSending.value = false
  }
}

const scrollToBottom = () => {
  if (threadMessagesContainer.value) {
    threadMessagesContainer.value.scrollTop = threadMessagesContainer.value.scrollHeight
  }
}

const handleReply = (message: any) => {
  // 在线程中回复消息
  threadReplyContent.value = `@${message.senderName} `
  threadInput.value?.focus()
}

const handleEdit = (message: any) => {
  // 编辑线程消息
  console.log('编辑线程消息:', message.id)
}

const handleDelete = (message: any) => {
  // 删除线程消息
  console.log('删除线程消息:', message.id)
}

// 监听线程打开状态
watch(() => props.isOpen, async (isOpen) => {
  if (isOpen) {
    // 线程打开时，加载线程消息
    if (props.rootMessageId && props.roomId) {
      try {
        await matrixStore.fetchThreadMessages(props.roomId, props.rootMessageId)
        await nextTick()
        scrollToBottom()
      } catch (error) {
        console.error('加载线程消息失败:', error)
      }
    }
    
    // 聚焦输入框
    await nextTick()
    threadInput.value?.focus()
  }
})

// 监听新的线程消息
watch(threadMessages, async () => {
  await nextTick()
  scrollToBottom()
}, { deep: true })

onMounted(() => {
  // 如果线程已经打开，立即加载消息
  if (props.isOpen && props.rootMessageId && props.roomId) {
    matrixStore.fetchThreadMessages(props.roomId, props.rootMessageId)
      .catch(error => console.error('加载线程消息失败:', error))
  }
})
</script>

<style scoped>
.thread-panel {
  position: fixed;
  top: 0;
  right: -400px;
  width: 400px;
  height: 100vh;
  background: #ffffff;
  border-left: 1px solid #e0e0e0;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  transition: right 0.3s ease;
  z-index: 1000;
}

.thread-panel-open {
  right: 0;
}

/* 线程头部 */
.thread-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #e0e0e0;
  background: #f8f9fa;
}

.thread-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #333;
}

.thread-icon {
  font-size: 18px;
}

.thread-count {
  background: #007bff;
  color: white;
  border-radius: 12px;
  padding: 2px 8px;
  font-size: 12px;
  min-width: 20px;
  text-align: center;
}

.close-thread-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
}

.close-thread-btn:hover {
  background: rgba(0, 0, 0, 0.1);
}

.close-icon {
  font-size: 14px;
  color: #666;
}

/* 原始消息 */
.thread-root-message {
  padding: 16px 20px;
  border-bottom: 1px solid #e0e0e0;
  background: #f8f9fa;
}

.root-message-header {
  margin-bottom: 8px;
}

.root-message-label {
  font-size: 12px;
  color: #666;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.root-message-content {
  background: white;
  border-radius: 8px;
  padding: 12px;
  border: 1px solid #e0e0e0;
}

.message-sender {
  font-weight: 600;
  color: #007bff;
  font-size: 14px;
  margin-bottom: 4px;
}

.message-text {
  color: #333;
  line-height: 1.4;
  margin-bottom: 8px;
}

.message-time {
  font-size: 12px;
  color: #999;
}

/* 线程消息列表 */
.thread-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px 0;
}

.no-thread-messages {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #999;
  text-align: center;
}

.no-messages-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.no-messages-text {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 4px;
}

.no-messages-hint {
  font-size: 14px;
  opacity: 0.7;
}

.thread-message-list {
  padding: 0 20px;
}

/* 线程输入框 */
.thread-input-container {
  border-top: 1px solid #e0e0e0;
  padding: 16px 20px;
  background: white;
}

.thread-input-wrapper {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  background: #f8f9fa;
  border-radius: 20px;
  padding: 8px 12px;
  border: 1px solid #e0e0e0;
}

.thread-input {
  flex: 1;
  border: none;
  background: transparent;
  outline: none;
  resize: none;
  font-size: 14px;
  line-height: 1.4;
  min-height: 20px;
  max-height: 120px;
  font-family: inherit;
}

.thread-input::placeholder {
  color: #999;
}

.thread-input-actions {
  display: flex;
  align-items: center;
}

.send-thread-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: #007bff;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.send-thread-btn:hover:not(:disabled) {
  background: #0056b3;
  transform: scale(1.05);
}

.send-thread-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
}

.send-icon,
.sending-icon {
  font-size: 14px;
  color: white;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .thread-panel {
    width: 100vw;
    right: -100vw;
  }
  
  .thread-panel-open {
    right: 0;
  }
}
</style>