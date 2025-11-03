<template>
  <div class="voip-call-button">
    <!-- 语音通话按钮 -->
    <button
      class="call-btn voice-call"
      :disabled="!canMakeCall || isLoading"
      @click="initiateVoiceCall"
      :title="voiceCallTooltip"
    >
      <i class="icon-phone"></i>
      <span v-if="showLabels">语音</span>
    </button>

    <!-- 视频通话按钮 -->
    <button
      class="call-btn video-call"
      :disabled="!canMakeVideoCall || isLoading"
      @click="initiateVideoCall"
      :title="videoCallTooltip"
    >
      <i class="icon-video"></i>
      <span v-if="showLabels">视频</span>
    </button>

    <!-- 加载状态 -->
    <div v-if="isLoading" class="loading-indicator">
      <i class="icon-loading"></i>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useVoIPStore } from '@/stores/voip'
import { useMatrixStore } from '@/stores/matrix'

interface Props {
  roomId: string
  userId?: string
  showLabels?: boolean
  size?: 'small' | 'medium' | 'large'
}

const props = withDefaults(defineProps<Props>(), {
  showLabels: false,
  size: 'medium'
})

const emit = defineEmits<{
  callInitiated: [callId: string, type: 'voice' | 'video']
  error: [error: string]
}>()

const voipStore = useVoIPStore()
const matrixStore = useMatrixStore()

const isLoading = ref(false)

// 计算属性
const canMakeCall = computed(() => {
  return (
    matrixStore.isConnected &&
    voipStore.supportedFeatures.audio &&
    !voipStore.hasActiveCalls &&
    props.roomId &&
    props.userId
  )
})

const canMakeVideoCall = computed(() => {
  return canMakeCall.value && voipStore.supportedFeatures.video
})

const voiceCallTooltip = computed(() => {
  if (!matrixStore.isConnected) return '未连接到Matrix服务器'
  if (!voipStore.supportedFeatures.audio) return '浏览器不支持音频通话'
  if (voipStore.hasActiveCalls) return '当前有通话进行中'
  if (!props.userId) return '无法获取用户信息'
  return '发起语音通话'
})

const videoCallTooltip = computed(() => {
  if (!canMakeCall.value) return voiceCallTooltip.value
  if (!voipStore.supportedFeatures.video) return '浏览器不支持视频通话'
  return '发起视频通话'
})

// 发起语音通话
const initiateVoiceCall = async () => {
  if (!canMakeCall.value || !props.userId) return

  try {
    isLoading.value = true
    console.log('📞 发起语音通话:', { roomId: props.roomId, userId: props.userId })

    const callId = await voipStore.initiateCall(props.roomId, props.userId, 'voice')
    
    emit('callInitiated', callId, 'voice')
    console.log('✅ 语音通话发起成功:', callId)

  } catch (error: any) {
    console.error('❌ 发起语音通话失败:', error)
    emit('error', error.message || '发起语音通话失败')
  } finally {
    isLoading.value = false
  }
}

// 发起视频通话
const initiateVideoCall = async () => {
  if (!canMakeVideoCall.value || !props.userId) return

  try {
    isLoading.value = true
    console.log('📹 发起视频通话:', { roomId: props.roomId, userId: props.userId })

    const callId = await voipStore.initiateCall(props.roomId, props.userId, 'video')
    
    emit('callInitiated', callId, 'video')
    console.log('✅ 视频通话发起成功:', callId)

  } catch (error: any) {
    console.error('❌ 发起视频通话失败:', error)
    emit('error', error.message || '发起视频通话失败')
  } finally {
    isLoading.value = false
  }
}

// 初始化VoIP功能
onMounted(async () => {
  if (!voipStore.isInitialized) {
    try {
      await voipStore.initialize()
    } catch (error) {
      console.error('❌ VoIP初始化失败:', error)
    }
  }
})
</script>

<style scoped>
.voip-call-button {
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
}

.call-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
  font-weight: 500;
  color: white;
  position: relative;
  overflow: hidden;
}

/* 按钮尺寸 */
.call-btn {
  padding: 8px 12px;
  min-width: 40px;
  height: 36px;
}

.voip-call-button[data-size="small"] .call-btn {
  padding: 6px 10px;
  min-width: 32px;
  height: 28px;
  font-size: 12px;
}

.voip-call-button[data-size="large"] .call-btn {
  padding: 12px 16px;
  min-width: 48px;
  height: 44px;
  font-size: 16px;
}

/* 语音通话按钮 */
.voice-call {
  background: linear-gradient(135deg, #4CAF50, #45a049);
  box-shadow: 0 2px 8px rgba(76, 175, 80, 0.3);
}

.voice-call:hover:not(:disabled) {
  background: linear-gradient(135deg, #45a049, #3d8b40);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.4);
}

.voice-call:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 2px 6px rgba(76, 175, 80, 0.3);
}

/* 视频通话按钮 */
.video-call {
  background: linear-gradient(135deg, #2196F3, #1976D2);
  box-shadow: 0 2px 8px rgba(33, 150, 243, 0.3);
}

.video-call:hover:not(:disabled) {
  background: linear-gradient(135deg, #1976D2, #1565C0);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(33, 150, 243, 0.4);
}

.video-call:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 2px 6px rgba(33, 150, 243, 0.3);
}

/* 禁用状态 */
.call-btn:disabled {
  background: #ccc;
  color: #999;
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
}

.call-btn:disabled:hover {
  background: #ccc;
  transform: none;
  box-shadow: none;
}

/* 加载状态 */
.loading-indicator {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.8);
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 12px;
}

/* 图标样式 */
.icon-phone::before {
  content: '📞';
  font-style: normal;
}

.icon-video::before {
  content: '📹';
  font-style: normal;
}

.icon-loading::before {
  content: '⏳';
  font-style: normal;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 按钮文字 */
.call-btn span {
  font-size: inherit;
  white-space: nowrap;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .voip-call-button {
    gap: 6px;
  }
  
  .call-btn {
    padding: 6px 8px;
    min-width: 36px;
    height: 32px;
    font-size: 12px;
  }
  
  .call-btn span {
    display: none;
  }
}

/* 暗色主题支持 */
@media (prefers-color-scheme: dark) {
  .call-btn:disabled {
    background: #444;
    color: #666;
  }
}

/* 无障碍支持 */
.call-btn:focus {
  outline: 2px solid #fff;
  outline-offset: 2px;
}

.call-btn:focus:not(:focus-visible) {
  outline: none;
}

/* 动画效果 */
.call-btn::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  transition: width 0.3s, height 0.3s;
}

.call-btn:active:not(:disabled)::before {
  width: 100%;
  height: 100%;
}
</style>