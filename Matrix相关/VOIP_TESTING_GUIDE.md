# VoIP功能测试指南

## 🧪 测试环境要求

### 浏览器支持
- ✅ Chrome 88+
- ✅ Firefox 85+
- ✅ Safari 14+
- ✅ Edge 88+

### 设备要求
- 🎤 麦克风设备
- 📹 摄像头设备（视频通话）
- 🔊 音频输出设备

### 网络要求
- 稳定的互联网连接
- 支持WebRTC的网络环境
- 防火墙允许WebRTC流量

## 🚀 快速测试步骤

### 1. 基础功能测试

#### 1.1 VoIP初始化测试
```javascript
// 在浏览器控制台中执行
const { useVoIPStore } = await import('/src/stores/voip.ts')
const voipStore = useVoIPStore()

// 检查初始化状态
console.log('VoIP初始化状态:', voipStore.isInitialized)
console.log('支持的功能:', voipStore.supportedFeatures)

// 手动初始化（如果未初始化）
if (!voipStore.isInitialized) {
  await voipStore.initialize()
}
```

#### 1.2 设备检测测试
```javascript
// 检查可用的媒体设备
const devices = await navigator.mediaDevices.enumerateDevices()
console.log('音频输入设备:', devices.filter(d => d.kind === 'audioinput'))
console.log('视频输入设备:', devices.filter(d => d.kind === 'videoinput'))
console.log('音频输出设备:', devices.filter(d => d.kind === 'audiooutput'))
```

#### 1.3 权限测试
```javascript
// 测试麦克风权限
try {
  const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true })
  console.log('✅ 麦克风权限正常')
  audioStream.getTracks().forEach(track => track.stop())
} catch (error) {
  console.error('❌ 麦克风权限失败:', error)
}

// 测试摄像头权限
try {
  const videoStream = await navigator.mediaDevices.getUserMedia({ video: true })
  console.log('✅ 摄像头权限正常')
  videoStream.getTracks().forEach(track => track.stop())
} catch (error) {
  console.error('❌ 摄像头权限失败:', error)
}
```

### 2. 界面功能测试

#### 2.1 通话按钮测试
1. 登录到聊天界面
2. 选择一个私聊房间
3. 检查头部是否显示通话按钮
4. 点击语音通话按钮，观察是否有响应
5. 点击视频通话按钮，观察是否有响应

#### 2.2 VoIP面板测试
1. 点击侧边栏的通话图标（📞）
2. 检查是否显示VoIP面板
3. 查看最近联系人列表
4. 测试联系人的通话按钮

#### 2.3 通话界面测试
1. 发起一个测试通话
2. 检查通话对话框是否正确显示
3. 测试最小化功能
4. 测试拖拽功能（最小化状态下）
5. 测试各种控制按钮

### 3. 功能性测试

#### 3.1 语音通话测试
```javascript
// 模拟发起语音通话
const roomId = 'your-room-id'
const userId = 'target-user-id'

try {
  const callId = await voipStore.initiateCall(roomId, userId, 'voice')
  console.log('✅ 语音通话发起成功:', callId)
} catch (error) {
  console.error('❌ 语音通话发起失败:', error)
}
```

#### 3.2 视频通话测试
```javascript
// 模拟发起视频通话
try {
  const callId = await voipStore.initiateCall(roomId, userId, 'video')
  console.log('✅ 视频通话发起成功:', callId)
} catch (error) {
  console.error('❌ 视频通话发起失败:', error)
}
```

#### 3.3 通话控制测试
```javascript
// 假设已有活动通话
const activeCall = voipStore.activeCalls[0]
if (activeCall) {
  const callId = activeCall.callId
  
  // 测试音频切换
  await voipStore.toggleAudio(callId, false) // 静音
  await voipStore.toggleAudio(callId, true)  // 取消静音
  
  // 测试视频切换
  await voipStore.toggleVideo(callId, false) // 关闭摄像头
  await voipStore.toggleVideo(callId, true)  // 开启摄像头
  
  // 测试屏幕共享
  await voipStore.toggleScreenShare(callId, true)  // 开始共享
  await voipStore.toggleScreenShare(callId, false) // 停止共享
}
```

## 🔍 调试工具

### 1. VoIP状态监控
```javascript
// 监控VoIP状态变化
const voipStore = useVoIPStore()

// 监听活动通话变化
watch(() => voipStore.activeCalls, (newCalls) => {
  console.log('活动通话变化:', newCalls)
}, { deep: true })

// 监听来电
watch(() => voipStore.incomingCalls, (incomingCalls) => {
  console.log('来电变化:', incomingCalls)
}, { deep: true })
```

### 2. WebRTC连接监控
```javascript
// 监控WebRTC连接状态
const monitorPeerConnection = (pc) => {
  pc.addEventListener('connectionstatechange', () => {
    console.log('连接状态:', pc.connectionState)
  })
  
  pc.addEventListener('iceconnectionstatechange', () => {
    console.log('ICE连接状态:', pc.iceConnectionState)
  })
  
  pc.addEventListener('icegatheringstatechange', () => {
    console.log('ICE收集状态:', pc.iceGatheringState)
  })
}
```

### 3. 媒体流监控
```javascript
// 监控媒体流状态
const monitorMediaStream = (stream, label) => {
  console.log(`${label} 媒体流:`, stream)
  
  stream.getTracks().forEach((track, index) => {
    console.log(`  轨道 ${index}:`, {
      kind: track.kind,
      enabled: track.enabled,
      muted: track.muted,
      readyState: track.readyState
    })
    
    track.addEventListener('ended', () => {
      console.log(`${label} 轨道 ${index} 已结束`)
    })
  })
}
```

## 🐛 常见问题排查

### 1. 通话无法发起
**可能原因：**
- Matrix客户端未连接
- 目标用户不在线
- 网络连接问题
- 浏览器不支持WebRTC

**排查步骤：**
```javascript
// 检查Matrix客户端状态
console.log('Matrix客户端:', matrixStore.matrixClient)
console.log('连接状态:', matrixStore.isConnected)

// 检查WebRTC支持
console.log('WebRTC支持:', !!window.RTCPeerConnection)
console.log('getUserMedia支持:', !!navigator.mediaDevices?.getUserMedia)
```

### 2. 音视频无法播放
**可能原因：**
- 设备权限未授予
- 设备被其他应用占用
- 浏览器自动播放策略

**排查步骤：**
```javascript
// 检查权限状态
const permissions = await Promise.all([
  navigator.permissions.query({ name: 'microphone' }),
  navigator.permissions.query({ name: 'camera' })
])
console.log('权限状态:', permissions.map(p => p.state))

// 测试设备访问
try {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: true,
    video: true
  })
  console.log('✅ 设备访问正常')
  stream.getTracks().forEach(track => track.stop())
} catch (error) {
  console.error('❌ 设备访问失败:', error)
}
```

### 3. 通话质量问题
**可能原因：**
- 网络带宽不足
- STUN/TURN服务器配置问题
- 设备性能不足

**排查步骤：**
```javascript
// 检查网络质量
const testNetworkSpeed = async () => {
  const startTime = Date.now()
  try {
    await fetch('https://httpbin.org/bytes/1024', { cache: 'no-cache' })
    const endTime = Date.now()
    const speed = 1024 / (endTime - startTime) * 1000 // bytes/second
    console.log('网络速度测试:', speed, 'bytes/s')
  } catch (error) {
    console.error('网络测试失败:', error)
  }
}

testNetworkSpeed()
```

## 📊 性能测试

### 1. 内存使用监控
```javascript
// 监控内存使用
const monitorMemory = () => {
  if (performance.memory) {
    console.log('内存使用:', {
      used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024) + 'MB',
      total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024) + 'MB',
      limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024) + 'MB'
    })
  }
}

// 每5秒监控一次
setInterval(monitorMemory, 5000)
```

### 2. CPU使用监控
```javascript
// 简单的CPU使用监控
const monitorCPU = () => {
  const start = performance.now()
  setTimeout(() => {
    const end = performance.now()
    const delay = end - start - 100 // 期望延迟100ms
    console.log('CPU负载指示器 (延迟):', delay + 'ms')
  }, 100)
}

setInterval(monitorCPU, 5000)
```

## ✅ 测试检查清单

### 基础功能
- [ ] VoIP初始化成功
- [ ] 设备检测正常
- [ ] 权限获取成功
- [ ] 界面显示正确

### 通话功能
- [ ] 语音通话发起
- [ ] 视频通话发起
- [ ] 来电接听
- [ ] 通话挂断
- [ ] 音频控制
- [ ] 视频控制
- [ ] 屏幕共享

### 界面交互
- [ ] 通话按钮响应
- [ ] 通话界面显示
- [ ] 最小化功能
- [ ] 拖拽功能
- [ ] 响应式布局

### 异常处理
- [ ] 权限拒绝处理
- [ ] 网络断开处理
- [ ] 设备占用处理
- [ ] 通话中断处理

## 🎯 自动化测试

### 单元测试示例
```javascript
// VoIP Store 测试
describe('VoIP Store', () => {
  test('初始化功能', async () => {
    const voipStore = useVoIPStore()
    const result = await voipStore.initialize()
    expect(result).toBe(true)
    expect(voipStore.isInitialized).toBe(true)
  })
  
  test('设备检测', async () => {
    const voipStore = useVoIPStore()
    await voipStore.initialize()
    expect(voipStore.supportedFeatures.audio).toBe(true)
  })
})
```

### 集成测试示例
```javascript
// 通话流程测试
describe('通话流程', () => {
  test('发起语音通话', async () => {
    const voipStore = useVoIPStore()
    const callId = await voipStore.initiateCall('room1', 'user1', 'voice')
    expect(callId).toBeDefined()
    expect(voipStore.activeCalls.length).toBe(1)
  })
})
```

通过以上测试指南，可以全面验证VoIP功能的正确性和稳定性。