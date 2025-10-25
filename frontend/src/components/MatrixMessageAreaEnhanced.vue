<template>
  <div class="message-area-enhanced">
    <!-- 消息搜索对话框 -->
    <MessageSearchDialog
      :visible="showSearchDialog"
      :room-id="roomId"
      @close="showSearchDialog = false"
      @jump-to-message="handleJumpToMessage"
    />

    <!-- 工具栏 -->
    <div class="message-toolbar">
      <button @click="showSearchDialog = true" class="toolbar-btn" title="搜索消息">
        🔍
      </button>
      <button @click="loadMoreHistory" class="toolbar-btn" title="加载更多历史" :disabled="loadingHistory">
        📚
      </button>
      <div class="toolbar-info">
        <span v-if="currentRoom">{{ currentRoom.name }}</span>
        <span class="message-count">{{ messages.length }} 条消息</span>
      </div>
    </div>

    <!-- 消息列表容器 -->
    <div 
      ref="messagesContainer" 
      class="messages-container"
      @scroll="handleScroll"
    >
      <!-- 加载更多指示器 -->
      <div v-if="loadingHistory" class="loading-more">
        <div class="loading-spinner"></div>
        <span>加载历史消息中...</span>
      </div>

      <!-- 消息列表 -->
      <div class="messages-list">
        <MatrixMessageItem
          v-for="message in messages"
          :key="message.eventId || message.id"
          :message="message"
          :room-id="roomId"
          @reply-to="handleReplyTo"
          @scroll-to="handleScrollToMessage"
        />
      </div>

      <!-- 滚动到底部按钮 -->
      <div v-if="showScrollToBottom" class="scroll-to-bottom">
        <button @click="scrollToBottom" class="scroll-btn">
          <span class="scroll-icon">↓</span>
          <span v-if="unreadCount > 0" class="unread-badge">{{ unreadCount }}</span>
        </button>
      </div>
    </div>

    <!-- 消息输入区域 -->
    <MatrixMessageInput
      :room-id="roomId"
      :replying-to="replyingTo"
      :supports-encryption="supportsEncryption"
      @send-message="handleSendMessage"
      @cancel-reply="cancelReply"
      @typing-start="handleTypingStart"
      @typing-stop="handleTypingStop"
    />

    <!-- 输入状态指示器 -->
    <div v-if="typingUsers.length > 0" class="typing-indicator">
      <div class="typing-animation">
        <span></span>
        <span></span>
        <span></span>
      </div>
      <span class="typing-text">
        {{ formatTypingUsers(typingUsers) }} 正在输入...
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useMatrixStore } from '@/stores/matrix'
import MatrixMessageItem from './MatrixMessageItem.vue'
import MatrixMessageInput from './MatrixMessageInput.vue'
import MessageSearchDialog from './MessageSearchDialog.vue'
import type { MatrixMessage } from '@/stores/matrix'

const props = defineProps<{
  roomId: string
}>()

const matrixStore = useMatrixStore()

// 状态
const messagesContainer = ref<HTMLElement>()
const showSearchDialog = ref(false)
const loadingHistory = ref(false)
const showScrollToBottom = ref(false)
const unreadCount = ref(0)
const replyingTo = ref<MatrixMessage | null>(null)
const typingUsers = ref<string[]>([])
const lastScrollTop = ref(0)
const isUserScrolling = ref(false)

// 计算属性
const currentRoom = computed(() => {
  return matrixStore.rooms.find(room => room.id === props.roomId)
})

const messages = computed(() => {
  return matrixStore.messages.get(props.roomId) || []
})

const supportsEncryption = computed(() => {
  return currentRoom.value?.encrypted || false
})

// 监听消息变化，自动滚动到底部
watch(messages, (newMessages, oldMessages) => {
  if (newMessages.length > (oldMessages?.length || 0)) {
    nextTick(() => {
      if (!isUserScrolling.value) {
        scrollToBottom()
      } else {
        // 如果用户在浏览历史消息，显示新消息提示
        const newMessageCount = newMessages.length - (oldMessages?.length || 0)
        unreadCount.value += newMessageCount
        showScrollToBottom.value = true
      }
    })
  }
}, { deep: true })

// 方法
const handleScroll = () => {
  if (!messagesContainer.value) return

  const container = messagesContainer.value
  const scrollTop = container.scrollTop
  const scrollHeight = container.scrollHeight
  const clientHeight = container.clientHeight

  // 检测是否滚动到顶部，加载更多历史消息
  if (scrollTop < 100 && !loadingHistory.value) {
    loadMoreHistory()
  }

  // 检测是否接近底部
  const isNearBottom = scrollHeight - scrollTop - clientHeight < 100
  showScrollToBottom.value = !isNearBottom
  
  if (isNearBottom) {
    unreadCount.value = 0
  }

  // 检测用户是否在主动滚动
  isUserScrolling.value = Math.abs(scrollTop - lastScrollTop.value) > 10
  lastScrollTop.value = scrollTop
}

const loadMoreHistory = async () => {
  if (loadingHistory.value) return

  loadingHistory.value = true
  try {
    const container = messagesContainer.value
    const oldScrollHeight = container?.scrollHeight || 0

    await matrixStore.loadMoreHistoryMessages(props.roomId)

    // 保持滚动位置
    nextTick(() => {
      if (container) {
        const newScrollHeight = container.scrollHeight
        container.scrollTop = newScrollHeight - oldScrollHeight
      }
    })
  } catch (error) {
    console.error('加载历史消息失败:', error)
  } finally {
    loadingHistory.value = false
  }
}

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
      showScrollToBottom.value = false
      unreadCount.value = 0
      isUserScrolling.value = false
    }
  })
}

const handleSendMessage = async (content: string, options?: any) => {
  try {
    if (options?.replyTo) {
      // 发送回复消息
      await matrixStore.sendReplyMessage(props.roomId, content, options.replyTo)
    } else {
      // 发送普通消息
      await matrixStore.sendMessage(props.roomId, content, options?.encrypted)
    }
    
    // 自动滚动到底部
    scrollToBottom()
  } catch (error) {
    console.error('发送消息失败:', error)
  }
}

const handleReplyTo = (message: MatrixMessage) => {
  replyingTo.value = message
}

const cancelReply = () => {
  replyingTo.value = null
}

const handleScrollToMessage = (eventId: string) => {
  // TODO: 实现滚动到指定消息
  console.log('滚动到消息:', eventId)
}

const handleJumpToMessage = (eventId: string, roomId?: string) => {
  if (roomId && roomId !== props.roomId) {
    // 跳转到其他房间的消息
    // TODO: 实现房间切换
    console.log('跳转到其他房间的消息:', eventId, roomId)
  } else {
    // 当前房间的消息
    handleScrollToMessage(eventId)
  }
}

const handleTypingStart = () => {
  // 发送输入状态
  matrixStore.sendTypingNotification(props.roomId, true)
}

const handleTypingStop = () => {
  // 停止输入状态
  matrixStore.sendTypingNotification(props.roomId, false)
}

const formatTypingUsers = (users: string[]) => {
  if (users.length === 1) {
    return users[0]
  } else if (users.length === 2) {
    return users.join(' 和 ')
  } else {
    return `${users.slice(0, 2).join('、')} 等 ${users.length} 人`
  }
}

// 生命周期
onMounted(async () => {
  // 加载房间消息
  try {
    await matrixStore.fetchMatrixMessages(props.roomId)
    scrollToBottom()
  } catch (error) {
    console.error('加载消息失败:', error)
  }

  // 监听输入状态事件
  // TODO: 实现输入状态监听
})

onUnmounted(() => {
  // 清理输入状态
  handleTypingStop()
})
</script>

<style scoped>
.message-area-enhanced {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #f8f9fa;
}

.message-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: white;
  border-bottom: 1px solid #e1e8ed;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.toolbar-btn {
  padding: 6px 12px;
  background: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
}

.toolbar-btn:hover:not(:disabled) {
  background: #e9ecef;
  border-color: #adb5bd;
}

.toolbar-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.toolbar-info {
  margin-left: auto;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  font-size: 12px;
  color: #666;
}

.message-count {
  color: #999;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  position: relative;
  scroll-behavior: smooth;
}

.loading-more {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  color: #666;
  font-size: 14px;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #2196F3;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.messages-list {
  padding: 16px;
  min-height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.scroll-to-bottom {
  position: absolute;
  bottom: 20px;
  right: 20px;
  z-index: 10;
}

.scroll-btn {
  position: relative;
  width: 48px;
  height: 48px;
  background: #2196F3;
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3);
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.scroll-btn:hover {
  background: #1976D2;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(33, 150, 243, 0.4);
}

.scroll-icon {
  font-size: 20px;
  font-weight: bold;
}

.unread-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background: #f44336;
  color: white;
  font-size: 10px;
  font-weight: bold;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 16px;
  text-align: center;
}

.typing-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.9);
  border-top: 1px solid #e1e8ed;
  font-size: 12px;
  color: #666;
}

.typing-animation {
  display: flex;
  gap: 2px;
}

.typing-animation span {
  width: 4px;
  height: 4px;
  background: #666;
  border-radius: 50%;
  animation: typing 1.4s infinite ease-in-out;
}

.typing-animation span:nth-child(1) {
  animation-delay: -0.32s;
}

.typing-animation span:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes typing {
  0%, 80%, 100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}
</style>