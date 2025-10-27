import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useMatrixStore } from './matrix'

// VoIP通话状态
export type CallState = 'idle' | 'ringing' | 'connecting' | 'connected' | 'ended' | 'failed'

// 通话类型
export type CallType = 'voice' | 'video'

// 通话方向
export type CallDirection = 'inbound' | 'outbound'

// 通话信息接口
export interface CallInfo {
  callId: string
  roomId: string
  userId: string
  userName: string
  userAvatar?: string
  type: CallType
  direction: CallDirection
  state: CallState
  startTime?: number
  endTime?: number
  duration?: number
  localStream?: MediaStream
  remoteStream?: MediaStream
  peerConnection?: RTCPeerConnection
  isAudioEnabled: boolean
  isVideoEnabled: boolean
  isScreenSharing: boolean
  error?: string
}

// WebRTC配置
const RTC_CONFIGURATION: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    // 可以添加TURN服务器配置
    // {
    //   urls: 'turn:your-turn-server.com:3478',
    //   username: 'username',
    //   credential: 'password'
    // }
  ],
  iceCandidatePoolSize: 10
}

export const useVoIPStore = defineStore('voip', () => {
  const matrixStore = useMatrixStore()

  // 状态管理
  const activeCalls = ref<Map<string, CallInfo>>(new Map())
  const currentCallId = ref<string | null>(null)
  const isInitialized = ref(false)
  const supportedFeatures = ref({
    audio: false,
    video: false,
    screenShare: false
  })

  // 计算属性
  const hasActiveCalls = computed(() => activeCalls.value.size > 0)
  const currentCall = computed(() => 
    currentCallId.value ? activeCalls.value.get(currentCallId.value) : null
  )
  const incomingCalls = computed(() => 
    Array.from(activeCalls.value.values()).filter(call => 
      call.direction === 'inbound' && call.state === 'ringing'
    )
  )

  // 初始化VoIP功能
  const initialize = async (): Promise<boolean> => {
    if (isInitialized.value) return true

    try {
      console.log('🎯 初始化VoIP功能...')

      // 检查浏览器支持
      if (!window.RTCPeerConnection) {
        console.error('❌ 浏览器不支持WebRTC')
        return false
      }

      // 检查媒体设备支持
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error('❌ 浏览器不支持媒体设备访问')
        return false
      }

      // 检测可用的媒体设备
      const devices = await navigator.mediaDevices.enumerateDevices()
      supportedFeatures.value = {
        audio: devices.some(device => device.kind === 'audioinput'),
        video: devices.some(device => device.kind === 'videoinput'),
        screenShare: 'getDisplayMedia' in navigator.mediaDevices
      }

      console.log('✅ VoIP功能检测结果:', supportedFeatures.value)

      // 设置Matrix客户端事件监听
      setupMatrixEventListeners()

      isInitialized.value = true
      console.log('🎉 VoIP功能初始化完成')
      return true

    } catch (error) {
      console.error('❌ VoIP初始化失败:', error)
      return false
    }
  }

  // 设置Matrix事件监听器
  const setupMatrixEventListeners = () => {
    const client = matrixStore.matrixClient
    if (!client) {
      console.warn('⚠️ Matrix客户端未初始化，无法设置VoIP事件监听')
      return
    }

    // 监听来电事件
    client.on('Call.incoming', handleIncomingCall)
    
    // 监听通话状态变化
    client.on('call.state', handleCallStateChange)
    
    // 监听媒体流事件
    client.on('call.feeds_changed', handleFeedsChanged)

    console.log('📞 Matrix VoIP事件监听器已设置')
  }

  // 处理来电
  const handleIncomingCall = (call: any) => {
    console.log('📞 收到来电:', call)

    const callInfo: CallInfo = {
      callId: call.callId,
      roomId: call.roomId,
      userId: call.getOpponentUserId(),
      userName: call.getOpponentMember()?.name || call.getOpponentUserId(),
      userAvatar: call.getOpponentMember()?.getAvatarUrl(),
      type: call.hasLocalVideoFeed() || call.hasRemoteVideoFeed() ? 'video' : 'voice',
      direction: 'inbound',
      state: 'ringing',
      isAudioEnabled: true,
      isVideoEnabled: call.hasLocalVideoFeed(),
      isScreenSharing: false,
      peerConnection: call.peerConn
    }

    activeCalls.value.set(call.callId, callInfo)
    
    // 如果没有当前通话，设置为当前通话
    if (!currentCallId.value) {
      currentCallId.value = call.callId
    }

    // 播放铃声
    playRingtone()
  }

  // 处理通话状态变化
  const handleCallStateChange = (newState: string, oldState: string, call: any) => {
    console.log(`📞 通话状态变化: ${oldState} -> ${newState}`, call.callId)

    const callInfo = activeCalls.value.get(call.callId)
    if (!callInfo) return

    callInfo.state = mapMatrixCallState(newState)

    if (newState === 'connected') {
      callInfo.startTime = Date.now()
      stopRingtone()
    } else if (newState === 'ended') {
      callInfo.endTime = Date.now()
      if (callInfo.startTime) {
        callInfo.duration = callInfo.endTime - callInfo.startTime
      }
      
      // 清理资源
      cleanupCall(call.callId)
      stopRingtone()
    }
  }

  // 处理媒体流变化
  const handleFeedsChanged = (call: any) => {
    console.log('📞 媒体流变化:', call.callId)

    const callInfo = activeCalls.value.get(call.callId)
    if (!callInfo) return

    // 更新本地流
    const localFeed = call.getLocalVideoFeed() || call.getLocalAudioFeed()
    if (localFeed) {
      callInfo.localStream = localFeed.stream
    }

    // 更新远程流
    const remoteFeed = call.getRemoteVideoFeed() || call.getRemoteAudioFeed()
    if (remoteFeed) {
      callInfo.remoteStream = remoteFeed.stream
    }
  }

  // 映射Matrix通话状态到本地状态
  const mapMatrixCallState = (matrixState: string): CallState => {
    switch (matrixState) {
      case 'wait_local_media':
      case 'create_offer':
      case 'create_answer':
        return 'connecting'
      case 'send_offer':
      case 'send_answer':
        return 'ringing'
      case 'connected':
        return 'connected'
      case 'ended':
        return 'ended'
      case 'error':
        return 'failed'
      default:
        return 'idle'
    }
  }

  // 发起通话
  const initiateCall = async (roomId: string, userId: string, type: CallType = 'voice'): Promise<string> => {
    if (!isInitialized.value) {
      await initialize()
    }

    const client = matrixStore.matrixClient
    if (!client) {
      throw new Error('Matrix客户端未初始化')
    }

    try {
      console.log(`📞 发起${type === 'video' ? '视频' : '语音'}通话:`, { roomId, userId })

      // 获取本地媒体流
      const constraints: MediaStreamConstraints = {
        audio: true,
        video: type === 'video'
      }

      const localStream = await navigator.mediaDevices.getUserMedia(constraints)
      
      // 创建通话
      const call = client.createCall(roomId)
      const callId = call.callId

      // 创建通话信息
      const callInfo: CallInfo = {
        callId,
        roomId,
        userId,
        userName: userId, // 可以从Matrix获取显示名称
        type,
        direction: 'outbound',
        state: 'connecting',
        localStream,
        isAudioEnabled: true,
        isVideoEnabled: type === 'video',
        isScreenSharing: false,
        peerConnection: call.peerConn
      }

      activeCalls.value.set(callId, callInfo)
      currentCallId.value = callId

      // 发起通话
      await call.placeCall(type === 'video')

      console.log('✅ 通话发起成功:', callId)
      return callId

    } catch (error) {
      console.error('❌ 发起通话失败:', error)
      throw error
    }
  }

  // 接听通话
  const answerCall = async (callId: string): Promise<void> => {
    const callInfo = activeCalls.value.get(callId)
    if (!callInfo) {
      throw new Error('通话不存在')
    }

    const client = matrixStore.matrixClient
    if (!client) {
      throw new Error('Matrix客户端未初始化')
    }

    try {
      console.log('📞 接听通话:', callId)

      // 获取本地媒体流
      const constraints: MediaStreamConstraints = {
        audio: true,
        video: callInfo.type === 'video'
      }

      const localStream = await navigator.mediaDevices.getUserMedia(constraints)
      callInfo.localStream = localStream

      // 获取Matrix通话对象
      const call = client.getCall(callId)
      if (!call) {
        throw new Error('找不到通话对象')
      }

      // 接听通话
      await call.answer()

      callInfo.state = 'connected'
      callInfo.startTime = Date.now()
      
      stopRingtone()
      console.log('✅ 通话接听成功:', callId)

    } catch (error) {
      console.error('❌ 接听通话失败:', error)
      callInfo.state = 'failed'
      callInfo.error = error.message
      throw error
    }
  }

  // 挂断通话
  const hangupCall = async (callId: string): Promise<void> => {
    const callInfo = activeCalls.value.get(callId)
    if (!callInfo) {
      console.warn('⚠️ 尝试挂断不存在的通话:', callId)
      return
    }

    const client = matrixStore.matrixClient
    if (!client) {
      throw new Error('Matrix客户端未初始化')
    }

    try {
      console.log('📞 挂断通话:', callId)

      // 获取Matrix通话对象
      const call = client.getCall(callId)
      if (call) {
        await call.hangup()
      }

      // 更新通话状态
      callInfo.state = 'ended'
      callInfo.endTime = Date.now()
      if (callInfo.startTime) {
        callInfo.duration = callInfo.endTime - callInfo.startTime
      }

      // 清理资源
      cleanupCall(callId)
      stopRingtone()

      console.log('✅ 通话挂断成功:', callId)

    } catch (error) {
      console.error('❌ 挂断通话失败:', error)
      // 即使挂断失败，也要清理本地资源
      cleanupCall(callId)
      throw error
    }
  }

  // 切换音频
  const toggleAudio = async (callId: string, enabled: boolean): Promise<void> => {
    const callInfo = activeCalls.value.get(callId)
    if (!callInfo || !callInfo.localStream) {
      throw new Error('通话或媒体流不存在')
    }

    try {
      const audioTracks = callInfo.localStream.getAudioTracks()
      audioTracks.forEach(track => {
        track.enabled = enabled
      })

      callInfo.isAudioEnabled = enabled
      console.log(`🎤 音频${enabled ? '开启' : '关闭'}:`, callId)

    } catch (error) {
      console.error('❌ 切换音频失败:', error)
      throw error
    }
  }

  // 切换视频
  const toggleVideo = async (callId: string, enabled: boolean): Promise<void> => {
    const callInfo = activeCalls.value.get(callId)
    if (!callInfo) {
      throw new Error('通话不存在')
    }

    try {
      if (enabled && !callInfo.localStream?.getVideoTracks().length) {
        // 需要获取视频流
        const videoStream = await navigator.mediaDevices.getUserMedia({ video: true })
        const videoTrack = videoStream.getVideoTracks()[0]
        
        if (callInfo.localStream) {
          callInfo.localStream.addTrack(videoTrack)
        }
      } else if (callInfo.localStream) {
        // 切换现有视频轨道
        const videoTracks = callInfo.localStream.getVideoTracks()
        videoTracks.forEach(track => {
          track.enabled = enabled
        })
      }

      callInfo.isVideoEnabled = enabled
      console.log(`📹 视频${enabled ? '开启' : '关闭'}:`, callId)

    } catch (error) {
      console.error('❌ 切换视频失败:', error)
      throw error
    }
  }

  // 切换屏幕共享
  const toggleScreenShare = async (callId: string, enabled: boolean): Promise<void> => {
    const callInfo = activeCalls.value.get(callId)
    if (!callInfo) {
      throw new Error('通话不存在')
    }

    if (!supportedFeatures.value.screenShare) {
      throw new Error('浏览器不支持屏幕共享')
    }

    try {
      if (enabled) {
        // 开始屏幕共享
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true
        })

        // 替换视频轨道
        if (callInfo.localStream && callInfo.peerConnection) {
          const videoTrack = screenStream.getVideoTracks()[0]
          const sender = callInfo.peerConnection.getSenders().find(s => 
            s.track && s.track.kind === 'video'
          )
          
          if (sender) {
            await sender.replaceTrack(videoTrack)
          }
        }

        // 监听屏幕共享结束
        screenStream.getVideoTracks()[0].addEventListener('ended', () => {
          callInfo.isScreenSharing = false
        })

      } else {
        // 停止屏幕共享，恢复摄像头
        const cameraStream = await navigator.mediaDevices.getUserMedia({ video: true })
        const videoTrack = cameraStream.getVideoTracks()[0]
        
        if (callInfo.peerConnection) {
          const sender = callInfo.peerConnection.getSenders().find(s => 
            s.track && s.track.kind === 'video'
          )
          
          if (sender) {
            await sender.replaceTrack(videoTrack)
          }
        }
      }

      callInfo.isScreenSharing = enabled
      console.log(`📺 屏幕共享${enabled ? '开启' : '关闭'}:`, callId)

    } catch (error) {
      console.error('❌ 切换屏幕共享失败:', error)
      throw error
    }
  }

  // 获取本地媒体流
  const getLocalStream = (callId: string): MediaStream | null => {
    const callInfo = activeCalls.value.get(callId)
    return callInfo?.localStream || null
  }

  // 获取远程媒体流
  const getRemoteStream = (callId: string): MediaStream | null => {
    const callInfo = activeCalls.value.get(callId)
    return callInfo?.remoteStream || null
  }

  // 获取通话状态
  const getCallState = (callId: string): CallState | null => {
    const callInfo = activeCalls.value.get(callId)
    return callInfo?.state || null
  }

  // 清理通话资源
  const cleanupCall = (callId: string) => {
    const callInfo = activeCalls.value.get(callId)
    if (!callInfo) return

    try {
      // 停止本地媒体流
      if (callInfo.localStream) {
        callInfo.localStream.getTracks().forEach(track => {
          track.stop()
        })
      }

      // 关闭PeerConnection
      if (callInfo.peerConnection) {
        callInfo.peerConnection.close()
      }

      // 从活动通话中移除
      activeCalls.value.delete(callId)

      // 如果是当前通话，清除当前通话ID
      if (currentCallId.value === callId) {
        currentCallId.value = null
      }

      console.log('🧹 通话资源清理完成:', callId)

    } catch (error) {
      console.error('❌ 清理通话资源失败:', error)
    }
  }

  // 铃声管理
  let ringtoneAudio: HTMLAudioElement | null = null

  const playRingtone = () => {
    try {
      if (!ringtoneAudio) {
        ringtoneAudio = new Audio('/sounds/ringtone.mp3')
        ringtoneAudio.loop = true
        ringtoneAudio.volume = 0.5
      }
      ringtoneAudio.play().catch(error => {
        console.warn('⚠️ 播放铃声失败:', error)
      })
    } catch (error) {
      console.warn('⚠️ 创建铃声失败:', error)
    }
  }

  const stopRingtone = () => {
    if (ringtoneAudio) {
      ringtoneAudio.pause()
      ringtoneAudio.currentTime = 0
    }
  }

  // 清理所有通话
  const cleanup = () => {
    console.log('🧹 清理所有VoIP资源...')
    
    // 清理所有活动通话
    for (const callId of activeCalls.value.keys()) {
      cleanupCall(callId)
    }

    // 停止铃声
    stopRingtone()

    // 重置状态
    activeCalls.value.clear()
    currentCallId.value = null
    isInitialized.value = false

    console.log('✅ VoIP资源清理完成')
  }

  return {
    // 状态
    activeCalls: computed(() => Array.from(activeCalls.value.values())),
    currentCall,
    hasActiveCalls,
    incomingCalls,
    isInitialized,
    supportedFeatures,

    // 方法
    initialize,
    initiateCall,
    answerCall,
    hangupCall,
    toggleAudio,
    toggleVideo,
    toggleScreenShare,
    getLocalStream,
    getRemoteStream,
    getCallState,
    cleanup
  }
})