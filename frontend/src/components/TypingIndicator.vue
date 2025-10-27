<template>
  <div class="typing-indicator" v-if="typingUsers.length > 0">
    <div class="typing-content">
      <div class="typing-dots">
        <span class="dot"></span>
        <span class="dot"></span>
        <span class="dot"></span>
      </div>
      <div class="typing-text">
        {{ getTypingText() }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useMatrixStore } from '@/stores/matrix'

const props = defineProps<{
  roomId: string
}>()

const matrixStore = useMatrixStore()
const typingUsers = ref<string[]>([])
const typingTimeouts = ref<Map<string, NodeJS.Timeout>>(new Map())

const getTypingText = (): string => {
  const count = typingUsers.value.length
  if (count === 0) return ''
  
  const userNames = typingUsers.value.map(userId => {
    // 简化用户名显示
    const name = userId.split(':')[0].replace('@', '')
    return name
  })
  
  if (count === 1) {
    return `${userNames[0]} 正在输入...`
  } else if (count === 2) {
    return `${userNames[0]} 和 ${userNames[1]} 正在输入...`
  } else {
    return `${userNames[0]} 等 ${count} 人正在输入...`
  }
}

const addTypingUser = (userId: string) => {
  if (!typingUsers.value.includes(userId)) {
    typingUsers.value.push(userId)
  }
  
  // 清除之前的超时
  const existingTimeout = typingTimeouts.value.get(userId)
  if (existingTimeout) {
    clearTimeout(existingTimeout)
  }
  
  // 设置新的超时，30秒后自动移除
  const timeout = setTimeout(() => {
    removeTypingUser(userId)
  }, 30000)
  
  typingTimeouts.value.set(userId, timeout)
}

const removeTypingUser = (userId: string) => {
  const index = typingUsers.value.indexOf(userId)
  if (index >= 0) {
    typingUsers.value.splice(index, 1)
  }
  
  const timeout = typingTimeouts.value.get(userId)
  if (timeout) {
    clearTimeout(timeout)
    typingTimeouts.value.delete(userId)
  }
}

const handleTypingEvent = (event: any) => {
  if (event.getRoomId() !== props.roomId) return
  
  const userId = event.getSender()
  const content = event.getContent()
  
  // 排除自己
  if (userId === matrixStore.currentUser?.id) return
  
  if (content.user_ids && content.user_ids.includes(userId)) {
    addTypingUser(userId)
  } else {
    removeTypingUser(userId)
  }
}

onMounted(() => {
  // 监听输入状态事件
  if (matrixStore.matrixClient) {
    matrixStore.matrixClient.on('RoomMember.typing', handleTypingEvent)
  }
})

onUnmounted(() => {
  // 清理事件监听器和超时
  if (matrixStore.matrixClient) {
    matrixStore.matrixClient.removeListener('RoomMember.typing', handleTypingEvent)
  }
  
  typingTimeouts.value.forEach(timeout => clearTimeout(timeout))
  typingTimeouts.value.clear()
})
</script>

<style scoped>
.typing-indicator {
  padding: 8px 15px;
  background: rgba(0, 255, 0, 0.05);
  border-left: 3px solid #00ff00;
  margin: 5px 0;
  border-radius: 0 8px 8px 0;
  animation: fadeIn 0.3s ease-in-out;
}

.typing-content {
  display: flex;
  align-items: center;
  gap: 10px;
}

.typing-dots {
  display: flex;
  gap: 3px;
}

.dot {
  width: 4px;
  height: 4px;
  background: #00ff00;
  border-radius: 50%;
  animation: typing 1.4s infinite ease-in-out;
}

.dot:nth-child(1) {
  animation-delay: 0s;
}

.dot:nth-child(2) {
  animation-delay: 0.2s;
}

.dot:nth-child(3) {
  animation-delay: 0.4s;
}

.typing-text {
  color: #00ff00;
  font-size: 12px;
  font-style: italic;
}

@keyframes typing {
  0%, 60%, 100% {
    transform: scale(1);
    opacity: 0.5;
  }
  30% {
    transform: scale(1.2);
    opacity: 1;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>