<template>
  <div class="voip-manager">
    <!-- 来电通知 -->
    <div v-if="incomingCalls.length > 0" class="incoming-calls">
      <div
        v-for="call in incomingCalls"
        :key="call.callId"
        class="incoming-call-notification"
      >
        <div class="notification-content">
          <div class="caller-info">
            <div class="caller-avatar">
              <img v-if="call.userAvatar" :src="call.userAvatar" :alt="call.userName" />
              <div v-else class="avatar-placeholder">
                {{ call.userName.charAt(0).toUpperCase() }}
              </div>
            </div>
            <div class="caller-details">
              <h4>{{ call.userName }}</h4>
              <p>{{ call.type === 'video' ? '视频通话' : '语音通话' }}</p>
            </div>
          </div>
          <div class="call-actions">
            <button class="accept-btn" @click="acceptCall(call.callId)">
              <i class="icon-phone-accept"></i>
              接听
            </button>
            <button class="decline-btn" @click="declineCall(call.callId)">
              <i class="icon-phone-decline"></i>
              拒绝
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 通话对话框 -->
    <VoIPCallDialog
      v-for="call in activeCalls"
      :key="call.callId"
      :call-id="call.callId"
      :is-visible="true"
      :is-incoming="call.direction === 'inbound'"
      :caller-name="call.userName"
      :caller-avatar="call.userAvatar"
      :has-video="call.type === 'video'"
      @close="handleCallClose(call.callId)"
      @minimize="handleCallMinimize(call.callId, $event)"
    />

    <!-- 通话状态指示器 -->
    <div v-if="hasActiveCalls" class="call-status-indicator">
      <div class="status-dot"></div>
      <span>通话中</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { useVoIPStore } from '@/stores/voip'
import VoIPCallDialog from './VoIPCallDialog.vue'

const voipStore = useVoIPStore()

// 计算属性
const activeCalls = computed(() => voipStore.activeCalls)
const incomingCalls = computed(() => voipStore.incomingCalls)
const hasActiveCalls = computed(() => voipStore.hasActiveCalls)

// 接听通话
const acceptCall = async (callId: string) => {
  try {
    await voipStore.answerCall(callId)
    console.log('✅ 通话接听成功:', callId)
  } catch (error) {
    console.error('❌ 接听通话失败:', error)
    // 可以显示错误提示
  }
}

// 拒绝通话
const declineCall = async (callId: string) => {
  try {
    await voipStore.hangupCall(callId)
    console.log('✅ 通话拒绝成功:', callId)
  } catch (error) {
    console.error('❌ 拒绝通话失败:', error)
  }
}

// 处理通话关闭
const handleCallClose = (callId: string) => {
  console.log('📞 关闭通话界面:', callId)
  // 通话对话框关闭时的处理逻辑
}

// 处理通话最小化
const handleCallMinimize = (callId: string, minimized: boolean) => {
  console.log('📞 通话最小化状态变化:', callId, minimized)
  // 可以保存最小化状态到本地存储
}

// 键盘快捷键处理
const handleKeydown = (event: KeyboardEvent) => {
  // Ctrl/Cmd + Shift + A: 接听来电
  if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'A') {
    event.preventDefault()
    if (incomingCalls.value.length > 0) {
      acceptCall(incomingCalls.value[0].callId)
    }
  }
  
  // Ctrl/Cmd + Shift + D: 拒绝来电
  if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'D') {
    event.preventDefault()
    if (incomingCalls.value.length > 0) {
      declineCall(incomingCalls.value[0].callId)
    }
  }
  
  // Escape: 挂断当前通话
  if (event.key === 'Escape' && hasActiveCalls.value) {
    event.preventDefault()
    const currentCall = activeCalls.value.find(call => call.state === 'connected')
    if (currentCall) {
      voipStore.hangupCall(currentCall.callId)
    }
  }
}

// 生命周期
onMounted(async () => {
  // 初始化VoIP功能
  if (!voipStore.isInitialized) {
    try {
      await voipStore.initialize()
      console.log('✅ VoIP管理器初始化完成')
    } catch (error) {
      console.error('❌ VoIP管理器初始化失败:', error)
    }
  }
  
  // 添加键盘事件监听
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  // 移除键盘事件监听
  document.removeEventListener('keydown', handleKeydown)
  
  // 清理VoIP资源
  voipStore.cleanup()
})
</script>

<style scoped>
.voip-manager {
  position: relative;
  z-index: 10000;
}

/* 来电通知 */
.incoming-calls {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 10001;
}

.incoming-call-notification {
  background: linear-gradient(135deg, #4CAF50, #45a049);
  color: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  animation: slideInRight 0.3s ease-out;
  min-width: 320px;
  max-width: 400px;
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.notification-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.caller-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.caller-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}

.caller-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 18px;
}

.caller-details h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.caller-details p {
  margin: 4px 0 0;
  font-size: 14px;
  opacity: 0.9;
}

.call-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.accept-btn,
.decline-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.accept-btn {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.accept-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-1px);
}

.decline-btn {
  background: rgba(244, 67, 54, 0.8);
  color: white;
}

.decline-btn:hover {
  background: rgba(244, 67, 54, 1);
  transform: translateY(-1px);
}

/* 通话状态指示器 */
.call-status-indicator {
  position: fixed;
  top: 20px;
  left: 20px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  z-index: 9999;
  backdrop-filter: blur(4px);
}

.status-dot {
  width: 8px;
  height: 8px;
  background: #4CAF50;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.2);
  }
}

/* 图标样式 */
.icon-phone-accept::before {
  content: '📞';
  font-style: normal;
}

.icon-phone-decline::before {
  content: '📵';
  font-style: normal;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .incoming-calls {
    top: 10px;
    right: 10px;
    left: 10px;
  }
  
  .incoming-call-notification {
    min-width: auto;
    max-width: none;
    margin-bottom: 8px;
  }
  
  .call-status-indicator {
    top: 10px;
    left: 10px;
    font-size: 12px;
    padding: 6px 12px;
  }
  
  .caller-info {
    gap: 8px;
  }
  
  .caller-avatar {
    width: 40px;
    height: 40px;
  }
  
  .caller-details h4 {
    font-size: 14px;
  }
  
  .caller-details p {
    font-size: 12px;
  }
  
  .call-actions {
    gap: 8px;
  }
  
  .accept-btn,
  .decline-btn {
    padding: 6px 12px;
    font-size: 12px;
  }
}

/* 暗色主题支持 */
@media (prefers-color-scheme: dark) {
  .incoming-call-notification {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
  }
}

/* 无障碍支持 */
.accept-btn:focus,
.decline-btn:focus {
  outline: 2px solid white;
  outline-offset: 2px;
}

.accept-btn:focus:not(:focus-visible),
.decline-btn:focus:not(:focus-visible) {
  outline: none;
}

/* 高对比度模式支持 */
@media (prefers-contrast: high) {
  .incoming-call-notification {
    border: 2px solid white;
  }
  
  .accept-btn,
  .decline-btn {
    border: 2px solid white;
  }
}
</style>