<template>
  <div class="thread-demo">
    <div class="demo-header">
      <h2>🧵 线程功能演示</h2>
      <p>这是一个完整的线程（Thread）支持演示</p>
    </div>

    <div class="demo-layout">
      <!-- 主消息区域 -->
      <div class="main-messages">
        <h3>主要消息</h3>
        <div class="message-list">
          <div
            v-for="message in mainMessages"
            :key="message.id"
            class="demo-message"
            :class="{ 'has-thread': message.threadReplyCount > 0 }"
          >
            <div class="message-content">
              <div class="message-header">
                <span class="sender">{{ message.senderName }}</span>
                <span class="time">{{ formatTime(message.timestamp) }}</span>
              </div>
              <div class="message-text">{{ message.content }}</div>
              
              <!-- 线程信息 -->
              <div v-if="message.threadReplyCount > 0" class="thread-info">
                <button @click="openThread(message)" class="thread-button">
                  <span class="thread-icon">🧵</span>
                  <span class="thread-count">{{ message.threadReplyCount }} 条回复</span>
                  <span class="thread-arrow">→</span>
                </button>
              </div>
              
              <!-- 操作按钮 -->
              <div class="message-actions">
                <button @click="replyToMessage(message)" class="action-btn">
                  ↩️ 回复
                </button>
                <button @click="startThread(message)" class="action-btn">
                  🧵 开始线程
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 消息输入 -->
        <div class="message-input">
          <textarea
            v-model="newMessage"
            @keydown="handleKeydown"
            placeholder="输入消息..."
            rows="2"
          ></textarea>
          <button @click="sendMessage" :disabled="!newMessage.trim()">
            发送
          </button>
        </div>
      </div>

      <!-- 线程面板 -->
      <div v-if="showThread" class="thread-panel">
        <div class="thread-header">
          <h3>🧵 线程</h3>
          <button @click="closeThread" class="close-btn">✕</button>
        </div>

        <!-- 原始消息 -->
        <div v-if="threadRootMessage" class="thread-root">
          <div class="root-label">原始消息</div>
          <div class="root-message">
            <div class="message-header">
              <span class="sender">{{ threadRootMessage.senderName }}</span>
              <span class="time">{{ formatTime(threadRootMessage.timestamp) }}</span>
            </div>
            <div class="message-text">{{ threadRootMessage.content }}</div>
          </div>
        </div>

        <!-- 线程消息 -->
        <div class="thread-messages">
          <div v-if="threadMessages.length === 0" class="no-replies">
            <div class="no-replies-icon">💬</div>
            <div class="no-replies-text">还没有回复</div>
            <div class="no-replies-hint">成为第一个回复的人</div>
          </div>
          
          <div v-else class="thread-message-list">
            <div
              v-for="message in threadMessages"
              :key="message.id"
              class="thread-message"
            >
              <div class="thread-message-avatar">
                {{ message.senderName.charAt(0).toUpperCase() }}
              </div>
              <div class="thread-message-content">
                <div class="message-header">
                  <span class="sender">{{ message.senderName }}</span>
                  <span class="time">{{ formatTime(message.timestamp) }}</span>
                </div>
                <div class="message-text">{{ message.content }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 线程回复输入 -->
        <div class="thread-input">
          <textarea
            v-model="threadReply"
            @keydown="handleThreadKeydown"
            placeholder="回复线程..."
            rows="2"
          ></textarea>
          <button @click="sendThreadReply" :disabled="!threadReply.trim()">
            发送回复
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

// 响应式数据
const newMessage = ref('')
const threadReply = ref('')
const showThread = ref(false)
const currentThreadId = ref<string | null>(null)

// 模拟消息数据
const messages = ref([
  {
    id: 'msg1',
    content: '大家好！我想讨论一下新的项目计划。',
    senderName: 'Alice',
    timestamp: Date.now() - 3600000,
    threadReplyCount: 3,
    isThreadRoot: true
  },
  {
    id: 'msg2',
    content: '这个想法很不错，我们可以从用户研究开始。',
    senderName: 'Bob',
    timestamp: Date.now() - 3000000,
    threadReplyCount: 0
  },
  {
    id: 'msg3',
    content: '我同意Bob的观点，用户研究是关键。',
    senderName: 'Charlie',
    timestamp: Date.now() - 2400000,
    threadReplyCount: 1,
    isThreadRoot: true
  },
  // 线程回复
  {
    id: 'thread1-1',
    content: '我可以负责用户访谈的部分。',
    senderName: 'Alice',
    timestamp: Date.now() - 3500000,
    threadRootId: 'msg1',
    isThreadReply: true
  },
  {
    id: 'thread1-2',
    content: '太好了！我来准备问卷调查。',
    senderName: 'David',
    timestamp: Date.now() - 3400000,
    threadRootId: 'msg1',
    isThreadReply: true
  },
  {
    id: 'thread1-3',
    content: '我们什么时候开始？',
    senderName: 'Eve',
    timestamp: Date.now() - 3300000,
    threadRootId: 'msg1',
    isThreadReply: true
  },
  {
    id: 'thread3-1',
    content: '我们需要多少个用户样本？',
    senderName: 'Frank',
    timestamp: Date.now() - 2300000,
    threadRootId: 'msg3',
    isThreadReply: true
  }
])

// 计算属性
const mainMessages = computed(() => {
  return messages.value.filter(msg => !msg.isThreadReply)
})

const threadRootMessage = computed(() => {
  if (!currentThreadId.value) return null
  return messages.value.find(msg => msg.id === currentThreadId.value)
})

const threadMessages = computed(() => {
  if (!currentThreadId.value) return []
  return messages.value
    .filter(msg => msg.threadRootId === currentThreadId.value)
    .sort((a, b) => a.timestamp - b.timestamp)
})

// 方法
const formatTime = (timestamp: number) => {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('zh-CN', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

const sendMessage = () => {
  if (!newMessage.value.trim()) return
  
  const message = {
    id: 'msg' + Date.now(),
    content: newMessage.value,
    senderName: 'You',
    timestamp: Date.now(),
    threadReplyCount: 0
  }
  
  messages.value.push(message)
  newMessage.value = ''
}

const replyToMessage = (message: any) => {
  newMessage.value = `@${message.senderName} `
}

const startThread = (message: any) => {
  if (!message.isThreadRoot) {
    message.isThreadRoot = true
    message.threadReplyCount = message.threadReplyCount || 0
  }
  openThread(message)
}

const openThread = (message: any) => {
  currentThreadId.value = message.id
  showThread.value = true
}

const closeThread = () => {
  showThread.value = false
  currentThreadId.value = null
}

const sendThreadReply = () => {
  if (!threadReply.value.trim() || !currentThreadId.value) return
  
  const reply = {
    id: 'thread' + Date.now(),
    content: threadReply.value,
    senderName: 'You',
    timestamp: Date.now(),
    threadRootId: currentThreadId.value,
    isThreadReply: true
  }
  
  messages.value.push(reply)
  
  // 更新根消息的回复计数
  const rootMessage = messages.value.find(msg => msg.id === currentThreadId.value)
  if (rootMessage) {
    rootMessage.threadReplyCount = (rootMessage.threadReplyCount || 0) + 1
  }
  
  threadReply.value = ''
}

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    sendMessage()
  }
}

const handleThreadKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    sendThreadReply()
  }
}
</script>

<style scoped>
.thread-demo {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.demo-header {
  text-align: center;
  margin-bottom: 30px;
}

.demo-header h2 {
  color: #333;
  margin-bottom: 10px;
}

.demo-header p {
  color: #666;
  font-size: 14px;
}

.demo-layout {
  display: flex;
  gap: 20px;
  height: 600px;
}

.main-messages {
  flex: 1;
  display: flex;
  flex-direction: column;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
}

.main-messages h3 {
  background: #f8f9fa;
  padding: 15px 20px;
  margin: 0;
  border-bottom: 1px solid #e0e0e0;
  color: #333;
}

.message-list {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
}

.demo-message {
  margin-bottom: 15px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.demo-message:hover {
  background: #f1f3f4;
}

.demo-message.has-thread {
  border-left: 3px solid #007bff;
}

.message-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.sender {
  font-weight: 600;
  color: #007bff;
  font-size: 14px;
}

.time {
  font-size: 12px;
  color: #999;
}

.message-text {
  color: #333;
  line-height: 1.4;
  margin-bottom: 10px;
}

.thread-info {
  margin-bottom: 10px;
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

.message-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  padding: 4px 8px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: #f8f9fa;
  border-color: #007bff;
  color: #007bff;
}

.message-input {
  padding: 15px;
  border-top: 1px solid #e0e0e0;
  background: white;
  display: flex;
  gap: 10px;
}

.message-input textarea {
  flex: 1;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 8px;
  resize: none;
  font-family: inherit;
}

.message-input button {
  padding: 8px 16px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.message-input button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

/* 线程面板 */
.thread-panel {
  width: 400px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  background: white;
}

.thread-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 20px;
  border-bottom: 1px solid #e0e0e0;
  background: #f8f9fa;
}

.thread-header h3 {
  margin: 0;
  color: #333;
}

.close-btn {
  width: 24px;
  height: 24px;
  border: none;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.thread-root {
  padding: 15px 20px;
  border-bottom: 1px solid #e0e0e0;
  background: #f8f9fa;
}

.root-label {
  font-size: 12px;
  color: #666;
  text-transform: uppercase;
  margin-bottom: 8px;
  font-weight: 500;
}

.root-message {
  background: white;
  padding: 12px;
  border-radius: 6px;
  border: 1px solid #e0e0e0;
}

.thread-messages {
  flex: 1;
  overflow-y: auto;
  padding: 15px 20px;
}

.no-replies {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 150px;
  color: #999;
  text-align: center;
}

.no-replies-icon {
  font-size: 32px;
  margin-bottom: 10px;
  opacity: 0.5;
}

.no-replies-text {
  font-weight: 500;
  margin-bottom: 4px;
}

.no-replies-hint {
  font-size: 12px;
  opacity: 0.7;
}

.thread-message {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.thread-message-avatar {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 12px;
  font-weight: bold;
  flex-shrink: 0;
}

.thread-message-content {
  flex: 1;
  background: #f8f9fa;
  padding: 10px;
  border-radius: 8px;
}

.thread-input {
  padding: 15px;
  border-top: 1px solid #e0e0e0;
  display: flex;
  gap: 10px;
}

.thread-input textarea {
  flex: 1;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 8px;
  resize: none;
  font-family: inherit;
}

.thread-input button {
  padding: 8px 12px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.thread-input button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .demo-layout {
    flex-direction: column;
    height: auto;
  }
  
  .thread-panel {
    width: 100%;
  }
}
</style>