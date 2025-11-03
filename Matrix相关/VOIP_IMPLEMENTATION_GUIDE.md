# 音视频通话功能实现指南

## 🎯 功能概述

本项目已完整实现了基于Matrix协议的音视频通话功能，包括：

- ✅ 语音通话
- ✅ 视频通话  
- ✅ 屏幕共享
- ✅ 通话控制（静音、关闭摄像头等）
- ✅ 来电通知和管理
- ✅ 通话界面和用户体验

## 📁 文件结构

```
frontend/src/
├── components/
│   ├── VoIPCallDialog.vue      # 通话对话框组件
│   ├── VoIPCallButton.vue      # 通话按钮组件
│   ├── VoIPManager.vue         # VoIP管理器组件
│   └── WeChatStyleLayout.vue   # 主界面（已集成VoIP）
├── stores/
│   └── voip.ts                 # VoIP状态管理
└── ...

public/sounds/
└── ringtone.mp3               # 铃声文件（需要替换为真实音频）
```

## 🚀 核心组件说明

### 1. VoIPCallDialog.vue - 通话对话框
**功能特性：**
- 完整的通话界面，支持语音和视频通话
- 实时显示本地和远程视频流
- 通话控制按钮（静音、关闭摄像头、屏幕共享、挂断）
- 支持最小化和拖拽功能
- 通话时长显示
- 响应式设计，支持移动端

**主要Props：**
```typescript
interface Props {
  callId: string          // 通话ID
  isVisible: boolean      // 是否显示
  isIncoming?: boolean    // 是否为来电
  callerName: string      // 呼叫者姓名
  callerAvatar?: string   // 呼叫者头像
  hasVideo?: boolean      // 是否为视频通话
}
```

### 2. VoIPCallButton.vue - 通话按钮
**功能特性：**
- 语音和视频通话发起按钮
- 自动检测浏览器支持情况
- 禁用状态管理（无权限、无设备等）
- 多种尺寸支持
- 加载状态显示

**主要Props：**
```typescript
interface Props {
  roomId: string          // 房间ID
  userId?: string         // 目标用户ID
  showLabels?: boolean    // 是否显示文字标签
  size?: 'small' | 'medium' | 'large'  // 按钮尺寸
}
```

### 3. VoIPManager.vue - VoIP管理器
**功能特性：**
- 全局VoIP状态管理
- 来电通知显示
- 键盘快捷键支持
- 多通话管理
- 自动初始化VoIP功能

**键盘快捷键：**
- `Ctrl/Cmd + Shift + A`: 接听来电
- `Ctrl/Cmd + Shift + D`: 拒绝来电
- `Escape`: 挂断当前通话

### 4. VoIP Store (voip.ts) - 状态管理
**核心功能：**
- WebRTC连接管理
- 媒体流控制
- 通话状态跟踪
- Matrix事件处理
- 设备权限管理

## 🔧 技术实现

### WebRTC配置
```typescript
const RTC_CONFIGURATION: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    // 可添加TURN服务器
  ],
  iceCandidatePoolSize: 10
}
```

### Matrix集成
- 使用Matrix JS SDK的VoIP功能
- 监听`Call.incoming`、`call.state`、`call.feeds_changed`事件
- 支持端到端加密通话

### 媒体设备管理
```typescript
// 获取用户媒体
const constraints: MediaStreamConstraints = {
  audio: true,
  video: type === 'video'
}
const stream = await navigator.mediaDevices.getUserMedia(constraints)

// 屏幕共享
const screenStream = await navigator.mediaDevices.getDisplayMedia({
  video: true,
  audio: true
})
```

## 🎨 用户界面集成

### 在聊天界面中的集成位置：

1. **侧边栏导航** - 添加了VoIP导航图标
2. **聊天头部** - 当前聊天的快速通话按钮
3. **VoIP专用面板** - 显示最近联系人和通话功能
4. **全局管理器** - 处理来电通知和通话状态

### 界面特性：
- 微信风格的设计语言
- 流畅的动画和过渡效果
- 响应式布局，支持移动端
- 暗色主题和高对比度模式支持

## 📱 使用方法

### 1. 发起通话
```typescript
// 在聊天界面中点击通话按钮
// 或在VoIP面板中选择联系人发起通话

// 程序化发起通话
const callId = await voipStore.initiateCall(roomId, userId, 'video')
```

### 2. 接听通话
```typescript
// 来电时会显示通知，点击接听按钮
// 或使用键盘快捷键 Ctrl+Shift+A

await voipStore.answerCall(callId)
```

### 3. 通话控制
```typescript
// 切换音频
await voipStore.toggleAudio(callId, enabled)

// 切换视频
await voipStore.toggleVideo(callId, enabled)

// 屏幕共享
await voipStore.toggleScreenShare(callId, enabled)

// 挂断通话
await voipStore.hangupCall(callId)
```

## 🔒 安全和权限

### 浏览器权限要求：
- **麦克风权限** - 语音通话必需
- **摄像头权限** - 视频通话必需
- **屏幕共享权限** - 屏幕共享功能必需

### 安全特性：
- 基于Matrix的端到端加密
- WebRTC的DTLS加密
- 设备验证和身份认证
- 安全的信令传输

## 🚨 故障排除

### 常见问题：

1. **无法���起通话**
   - 检查Matrix客户端连接状态
   - 确认浏览器支持WebRTC
   - 检查麦克风/摄像头权限

2. **音视频质量问题**
   - 检查网络连接质量
   - 确认STUN/TURN服务器配置
   - 检查设备性能

3. **来电无铃声**
   - 确认铃声文件存在：`public/sounds/ringtone.mp3`
   - 检查浏览器音频播放权限
   - 确认音量设置

### 调试方法：
```typescript
// 检查VoIP支持情况
console.log('VoIP支持:', voipStore.supportedFeatures)

// 查看活动通话
console.log('活动通话:', voipStore.activeCalls)

// 检查设备列表
const devices = await navigator.mediaDevices.enumerateDevices()
console.log('可用设备:', devices)
```

## 🔮 未来扩展

### 计划中的功能：
- [ ] 群组通话支持
- [ ] 通话录制功能
- [ ] 更多通话特效
- [ ] 通话质量统计
- [ ] 自定义铃声
- [ ] 通话历史记录

### 性能优化：
- [ ] 自适应码率调整
- [ ] 网络质量检测
- [ ] 回声消除优化
- [ ] 延迟优化

## 📚 相关文档

- [Matrix VoIP规范](https://spec.matrix.org/v1.4/client-server-api/#voice-over-ip)
- [WebRTC API文档](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API)
- [Matrix JS SDK文档](https://matrix-org.github.io/matrix-js-sdk/)

## 🎉 总结

音视频通话功能已完整实现并集成到聊天界面中。用户可以：

1. **轻松发起通话** - 通过聊天界面的通话按钮或VoIP面板
2. **完整通话体验** - 支持语音、视频、屏幕共享等功能
3. **优雅的界面** - 符合微信风格的设计语言
4. **跨平台支持** - 响应式设计，支持桌面和移动端
5. **安全可靠** - 基于Matrix协议的端到端加密

该实现提供了企业级的音视频通话解决方案，可以满足各种通信需求。