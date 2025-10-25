<template>
  <div class="chat-page">
    <div class="chat-header">
      <h1>💬 聊天页面</h1>
      <button @click="goBack" class="back-btn">← 返回</button>
    </div>
    
    <div class="chat-container">
      <div class="messages">
        <div 
          v-for="message in messages" 
          :key="message.id"
          class="message"
          :class="{ 'own': message.isOwn }"
        >
          <div class="message-content">{{ message.content }}</div>
          <div class="message-time">{{ formatTime(message.timestamp) }}</div>
        </div>
      </div>
      
      <div class="input-area">
        <input 
          v-model="newMessage"
          @keyup.enter="sendMessage"
          placeholder="输入消息..."
          class="message-input"
        />
        <button @click="sendMessage" :disabled="!newMessage.trim()" class="send-btn">
          发送
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { analytics } from '../utils/analytics'

interface Message {
  id: number
  content: string
  timestamp: number
  isOwn: boolean
}

const router = useRouter()
const messages = ref<Message[]>([
  {
    id: 1,
    content: '欢迎来到聊天页面！',
    timestamp: Date.now() - 60000,
    isOwn: false
  }
])
const newMessage = ref('')

function goBack() {
  router.back()
}

function sendMessage() {
  if (!newMessage.value.trim()) return
  
  const message: Message = {
    id: Date.now(),
    content: newMessage.value.trim(),
    timestamp: Date.now(),
    isOwn: true
  }
  
  messages.value.push(message)
  
  // 上报用户行为
  analytics.track('message_sent', {
    messageLength: message.content.length,
    timestamp: message.timestamp
  })
  
  newMessage.value = ''
  
  // 模拟回复
  setTimeout(() => {
    messages.value.push({
      id: Date.now(),
      content: `收到您的消息: "${message.content}"`,
      timestamp: Date.now(),
      isOwn: false
    })
  }, 1000)
}

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString()
}

onMounted(() => {
  analytics.pageView('聊天页面')
})
</script>

<style scoped>
.chat-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: white;
  border-bottom: 1px solid #e1e8ed;
}

.chat-header h1 {
  margin: 0;
  color: #2c3e50;
}

.back-btn {
  padding: 8px 16px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.back-btn:hover {
  background: #2980b9;
}

.chat-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
}

.messages {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background: #f8f9fa;
}

.message {
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
}

.message.own {
  align-items: flex-end;
}

.message-content {
  background: white;
  padding: 12px 16px;
  border-radius: 18px;
  max-width: 70%;
  word-wrap: break-word;
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
  color: #000000;
}

.message.own .message-content {
  background: #3498db;
  color: white;
}

.message-time {
  font-size: 12px;
  color: #7f8c8d;
  margin-top: 4px;
  padding: 0 8px;
}

.input-area {
  display: flex;
  padding: 20px;
  background: white;
  border-top: 1px solid #e1e8ed;
  gap: 12px;
}

.message-input {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #e1e8ed;
  border-radius: 20px;
  outline: none;
  font-size: 14px;
}

.message-input:focus {
  border-color: #3498db;
}

.send-btn {
  padding: 12px 24px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-weight: 500;
}

.send-btn:hover:not(:disabled) {
  background: #2980b9;
}

.send-btn:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
}
</style>