<template>
  <div v-if="isVisible" class="voip-overlay" @click.self="handleOverlayClick">
    <div class="voip-dialog" :class="{ 'minimized': isMinimized, 'incoming': isIncoming }">
      <!-- 通话头部 -->
      <div class="call-header" @mousedown="startDrag">
        <div class="call-info">
          <div class="caller-avatar">
            <img v-if="callerAvatar" :src="callerAvatar" :alt="callerName" />
            <div v-else class="avatar-placeholder">{{ callerInitial }}</div>
          </div>
          <div class="caller-details">
            <h3 class="caller-name">{{ callerName }}</h3>
            <p class="call-status">{{ callStatusText }}</p>
          </div>
        </div>
        <div class="call-actions">
          <button 
            class="minimize-btn" 
            @click="toggleMinimize"
            :title="isMinimized ? '展开' : '最小化'"
          >
            <i :class="isMinimized ? 'icon-expand' : 'icon-minimize'"></i>
          </button>
        </div>
      </div>

      <!-- 视频区域 -->
      <div v-if="!isMinimized" class="video-container" :class="{ 'audio-only': !hasVideo }">
        <!-- 远程视频 -->
        <div class="remote-video-wrapper">
          <video 
            ref="remoteVideo" 
            class="remote-video" 
            autoplay 
            playsinline
            :muted="false"
          ></video>
          <div v-if="!remoteVideoEnabled" class="video-placeholder">
            <div class="avatar-large">
              <img v-if="callerAvatar" :src="callerAvatar" :alt="callerName" />
              <div v-else class="avatar-placeholder-large">{{ callerInitial }}</div>
            </div>
            <p>{{ callerName }}</p>
          </div>
        </div>

        <!-- 本地视频 -->
        <div v-if="hasVideo" class="local-video-wrapper" :class="{ 'dragging': isDragging }">
          <video 
            ref="localVideo" 
            class="local-video" 
            autoplay 
            playsinline 
            muted
          ></video>
          <div v-if="!localVideoEnabled" class="local-video-placeholder">
            <i class="icon-camera-off"></i>
          </div>
        </div>
      </div>

      <!-- 通话控制栏 -->
      <div class="call-controls" :class="{ 'minimized': isMinimized }">
        <!-- 音频控制 -->
        <button 
          class="control-btn audio-btn" 
          :class="{ 'muted': !audioEnabled }"
          @click="toggleAudio"
          :title="audioEnabled ? '静音' : '取消静音'"
        >
          <i :class="audioEnabled ? 'icon-mic' : 'icon-mic-off'"></i>
        </button>

        <!-- 视频控制 -->
        <button 
          v-if="hasVideo"
          class="control-btn video-btn" 
          :class="{ 'disabled': !localVideoEnabled }"
          @click="toggleVideo"
          :title="localVideoEnabled ? '关闭摄像头' : '开启摄像头'"
        >
          <i :class="localVideoEnabled ? 'icon-camera' : 'icon-camera-off'"></i>
        </button>

        <!-- 屏幕共享 -->
        <button 
          v-if="!isIncoming && callState === 'connected'"
          class="control-btn screen-btn" 
          :class="{ 'active': isScreenSharing }"
          @click="toggleScreenShare"
          :title="isScreenSharing ? '停止共享' : '共享屏幕'"
        >
          <i :class="isScreenSharing ? 'icon-screen-share-stop' : 'icon-screen-share'"></i>
        </button>

        <!-- 通话状态按钮 -->
        <button 
          v-if="isIncoming && callState === 'ringing'"
          class="control-btn answer-btn"
          @click="answerCall"
          title="接听"
        >
          <i class="icon-phone"></i>
        </button>

        <!-- 挂断按钮 -->
        <button 
          class="control-btn hangup-btn"
          @click="hangupCall"
          :title="isIncoming && callState === 'ringing' ? '拒绝' : '挂断'"
        >
          <i class="icon-phone-hangup"></i>
        </button>
      </div>

      <!-- 通话时长 -->
      <div v-if="callState === 'connected' && !isMinimized" class="call-duration">
        {{ formattedDuration }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useVoIPStore } from '@/stores/voip'

interface Props {
  callId: string
  isVisible: boolean
  isIncoming?: boolean
  callerName: string
  callerAvatar?: string
  hasVideo?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isIncoming: false,
  hasVideo: true
})

const emit = defineEmits<{
  close: []
  minimize: [minimized: boolean]
}>()

const voipStore = useVoIPStore()

// 组件状态
const isMinimized = ref(false)
const isDragging = ref(false)
const dragOffset = ref({ x: 0, y: 0 })

// 媒体状态
const audioEnabled = ref(true)
const localVideoEnabled = ref(props.hasVideo)
const remoteVideoEnabled = ref(false)
const isScreenSharing = ref(false)

// 通话状态
const callState = ref<'ringing' | 'connecting' | 'connected' | 'ended'>('ringing')
const callStartTime = ref<number | null>(null)
const callDuration = ref(0)

// DOM引用
const localVideo = ref<HTMLVideoElement>()
const remoteVideo = ref<HTMLVideoElement>()

// 计算属性
const callerInitial = computed(() => 
  props.callerName.charAt(0).toUpperCase()
)

const callStatusText = computed(() => {
  switch (callState.value) {
    case 'ringing':
      return props.isIncoming ? '来电中...' : '呼叫中...'
    case 'connecting':
      return '连接中...'
    case 'connected':
      return '通话中'
    case 'ended':
      return '通话结束'
    default:
      return ''
  }
})

const formattedDuration = computed(() => {
  const minutes = Math.floor(callDuration.value / 60)
  const seconds = callDuration.value % 60
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
})

// 通话时长计时器
let durationTimer: number | null = null

const startDurationTimer = () => {
  if (durationTimer) return
  
  callStartTime.value = Date.now()
  durationTimer = window.setInterval(() => {
    if (callStartTime.value) {
      callDuration.value = Math.floor((Date.now() - callStartTime.value) / 1000)
    }
  }, 1000)
}

const stopDurationTimer = () => {
  if (durationTimer) {
    clearInterval(durationTimer)
    durationTimer = null
  }
}

// 媒体控制
const toggleAudio = async () => {
  try {
    audioEnabled.value = !audioEnabled.value
    await voipStore.toggleAudio(props.callId, audioEnabled.value)
  } catch (error) {
    console.error('切换音频失败:', error)
    audioEnabled.value = !audioEnabled.value // 回滚状态
  }
}

const toggleVideo = async () => {
  try {
    localVideoEnabled.value = !localVideoEnabled.value
    await voipStore.toggleVideo(props.callId, localVideoEnabled.value)
  } catch (error) {
    console.error('切换视频失败:', error)
    localVideoEnabled.value = !localVideoEnabled.value // 回滚状态
  }
}

const toggleScreenShare = async () => {
  try {
    isScreenSharing.value = !isScreenSharing.value
    await voipStore.toggleScreenShare(props.callId, isScreenSharing.value)
  } catch (error) {
    console.error('切换屏幕共享失败:', error)
    isScreenSharing.value = !isScreenSharing.value // 回滚状态
  }
}

// 通话控制
const answerCall = async () => {
  try {
    callState.value = 'connecting'
    await voipStore.answerCall(props.callId)
    callState.value = 'connected'
    startDurationTimer()
  } catch (error) {
    console.error('接听通话失败:', error)
    callState.value = 'ended'
    setTimeout(() => emit('close'), 2000)
  }
}

const hangupCall = async () => {
  try {
    await voipStore.hangupCall(props.callId)
    callState.value = 'ended'
    stopDurationTimer()
    setTimeout(() => emit('close'), 1000)
  } catch (error) {
    console.error('挂断通话失败:', error)
    emit('close')
  }
}

// UI控制
const toggleMinimize = () => {
  isMinimized.value = !isMinimized.value
  emit('minimize', isMinimized.value)
}

const handleOverlayClick = () => {
  if (isMinimized.value) {
    toggleMinimize()
  }
}

// 拖拽功能
const startDrag = (event: MouseEvent) => {
  if (isMinimized.value) {
    isDragging.value = true
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
    dragOffset.value = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    }
    
    document.addEventListener('mousemove', handleDrag)
    document.addEventListener('mouseup', stopDrag)
  }
}

const handleDrag = (event: MouseEvent) => {
  if (!isDragging.value) return
  
  const dialog = document.querySelector('.voip-dialog') as HTMLElement
  if (dialog) {
    dialog.style.left = `${event.clientX - dragOffset.value.x}px`
    dialog.style.top = `${event.clientY - dragOffset.value.y}px`
  }
}

const stopDrag = () => {
  isDragging.value = false
  document.removeEventListener('mousemove', handleDrag)
  document.removeEventListener('mouseup', stopDrag)
}

// 媒体流处理
const setupMediaStreams = async () => {
  try {
    // 获取本地媒体流
    const localStream = await voipStore.getLocalStream(props.callId)
    if (localStream && localVideo.value) {
      localVideo.value.srcObject = localStream
    }

    // 获取远程媒体流
    const remoteStream = await voipStore.getRemoteStream(props.callId)
    if (remoteStream && remoteVideo.value) {
      remoteVideo.value.srcObject = remoteStream
      remoteVideoEnabled.value = remoteStream.getVideoTracks().length > 0
    }
  } catch (error) {
    console.error('设置媒体流失败:', error)
  }
}

// 监听通话状态变化
watch(() => voipStore.getCallState(props.callId), (newState) => {
  if (newState) {
    callState.value = newState as any
    
    if (newState === 'connected') {
      startDurationTimer()
      setupMediaStreams()
    } else if (newState === 'ended') {
      stopDurationTimer()
      setTimeout(() => emit('close'), 1000)
    }
  }
})

// 生命周期
onMounted(async () => {
  if (!props.isIncoming) {
    // 发起通话
    try {
      callState.value = 'connecting'
      await voipStore.initiateCall(props.callId, props.hasVideo)
      callState.value = 'connected'
      startDurationTimer()
    } catch (error) {
      console.error('发起通话失败:', error)
      callState.value = 'ended'
      setTimeout(() => emit('close'), 2000)
    }
  }
  
  await nextTick()
  setupMediaStreams()
})

onUnmounted(() => {
  stopDurationTimer()
  document.removeEventListener('mousemove', handleDrag)
  document.removeEventListener('mouseup', stopDrag)
})
</script>

<style scoped>
.voip-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(4px);
}

.voip-dialog {
  background: #1a1a1a;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
  transition: all 0.3s ease;
  max-width: 800px;
  max-height: 600px;
  position: relative;
}

.voip-dialog.minimized {
  position: fixed;
  top: 20px;
  right: 20px;
  width: 320px;
  height: auto;
  max-width: none;
  max-height: none;
  cursor: move;
}

.voip-dialog.incoming {
  border: 2px solid #4CAF50;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { border-color: #4CAF50; }
  50% { border-color: #81C784; }
}

.call-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: linear-gradient(135deg, #2c3e50, #34495e);
  color: white;
  cursor: move;
}

.call-info {
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
  background: linear-gradient(135deg, #667eea, #764ba2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 18px;
  color: white;
}

.caller-details h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.caller-details p {
  margin: 4px 0 0;
  font-size: 14px;
  opacity: 0.8;
}

.call-actions {
  display: flex;
  gap: 8px;
}

.minimize-btn {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 8px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  transition: background 0.2s;
}

.minimize-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.video-container {
  position: relative;
  width: 800px;
  height: 450px;
  background: #000;
}

.video-container.audio-only {
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.remote-video-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
}

.remote-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.video-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #2c3e50, #34495e);
  color: white;
}

.avatar-large {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  margin-bottom: 16px;
}

.avatar-large img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder-large {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 48px;
  color: white;
}

.local-video-wrapper {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 200px;
  height: 150px;
  border-radius: 12px;
  overflow: hidden;
  border: 2px solid rgba(255, 255, 255, 0.3);
  background: #000;
  cursor: move;
  transition: transform 0.2s;
}

.local-video-wrapper:hover {
  transform: scale(1.05);
}

.local-video-wrapper.dragging {
  transform: scale(1.1);
  z-index: 10;
}

.local-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.local-video-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  font-size: 24px;
}

.call-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 20px;
  background: rgba(0, 0, 0, 0.9);
}

.call-controls.minimized {
  padding: 12px 16px;
  gap: 12px;
}

.control-btn {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  cursor: pointer;
  transition: all 0.2s;
  color: white;
}

.call-controls.minimized .control-btn {
  width: 40px;
  height: 40px;
  font-size: 16px;
}

.audio-btn {
  background: #4CAF50;
}

.audio-btn.muted {
  background: #f44336;
}

.video-btn {
  background: #2196F3;
}

.video-btn.disabled {
  background: #757575;
}

.screen-btn {
  background: #FF9800;
}

.screen-btn.active {
  background: #FF5722;
}

.answer-btn {
  background: #4CAF50;
  animation: pulse-green 1.5s infinite;
}

@keyframes pulse-green {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.hangup-btn {
  background: #f44336;
}

.control-btn:hover {
  transform: scale(1.1);
}

.call-duration {
  position: absolute;
  top: 20px;
  left: 20px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  font-weight: bold;
}

/* 图标样式 */
.icon-minimize::before { content: '−'; }
.icon-expand::before { content: '□'; }
.icon-mic::before { content: '🎤'; }
.icon-mic-off::before { content: '🚫'; }
.icon-camera::before { content: '📹'; }
.icon-camera-off::before { content: '📷'; }
.icon-screen-share::before { content: '📺'; }
.icon-screen-share-stop::before { content: '⏹️'; }
.icon-phone::before { content: '📞'; }
.icon-phone-hangup::before { content: '📵'; }

/* 响应式设计 */
@media (max-width: 768px) {
  .voip-dialog {
    width: 100vw;
    height: 100vh;
    max-width: none;
    max-height: none;
    border-radius: 0;
  }
  
  .video-container {
    width: 100%;
    height: calc(100vh - 200px);
  }
  
  .local-video-wrapper {
    width: 120px;
    height: 90px;
    top: 10px;
    right: 10px;
  }
  
  .call-controls {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: rgba(0, 0, 0, 0.95);
  }
}
</style>