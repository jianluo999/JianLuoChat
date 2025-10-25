# Matrix JS SDK v39.0.0 高级功能完整指南

## 🚀 概述

基于 `matrix-v39-clean.ts` 的完整 Matrix JS SDK v39.0.0 集成，包含所有最新功能和性能优化。

## 🎯 新增高级功能

### 1. 🔐 增强的加密管理

#### Rust 加密引擎
```typescript
import { useMatrixV39Store } from '@/stores/matrix-v39-clean'

const matrixStore = useMatrixV39Store()

// 检查加密状态
console.log('加密就绪:', matrixStore.encryptionReady)
console.log('交叉签名:', matrixStore.crossSigningReady)
console.log('密钥备份:', matrixStore.keyBackupReady)
console.log('设备验证:', matrixStore.deviceVerified)

// 设置交叉签名
await matrixStore.setupCrossSigning('your-password')

// 设置密钥备份
await matrixStore.setupKeyBackup()

// 验证设备
await matrixStore.verifyDevice('userId', 'deviceId')
```

#### 加密状态监控
```typescript
// 实时监控加密状态
watch(() => matrixStore.cryptoStatus, (status) => {
  console.log('加密状态更新:', {
    ready: status.ready,
    crossSigningReady: status.crossSigningReady,
    keyBackupEnabled: status.keyBackupEnabled,
    deviceVerified: status.deviceVerified,
    roomKeysBackedUp: status.roomKeysBackedUp,
    totalRoomKeys: status.totalRoomKeys
  })
}, { deep: true })
```

### 2. 🧵 完整线程支持

#### 发送线程回复
```typescript
// 发送线程回复
await matrixStore.sendThreadReply(
  'roomId', 
  'rootEventId', 
  'This is a thread reply!'
)

// 获取线程消息
const threadMessages = await matrixStore.fetchThreadMessages('roomId', 'rootEventId')

// 设置当前线程
matrixStore.setCurrentThread('threadId')

// 获取当前线程消息
const currentThread = matrixStore.currentThread
```

#### 线程状态管理
```typescript
// 监控线程状态
watch(() => matrixStore.currentThreadId, (threadId) => {
  if (threadId) {
    console.log('切换到线程:', threadId)
    console.log('线程消息:', matrixStore.currentThread)
  }
})
```

### 3. 👍 消息反应系统

#### 添加和移除反应
```typescript
// 添加反应
await matrixStore.addReaction('roomId', 'eventId', '👍')
await matrixStore.addReaction('roomId', 'eventId', '❤️')
await matrixStore.addReaction('roomId', 'eventId', '😂')

// 移除反应
await matrixStore.removeReaction('roomId', 'eventId', '👍')

// 获取消息反应
const reactions = matrixStore.reactions.get('eventId')
console.log('消息反应:', reactions)
```

#### 反应状态监控
```typescript
// 监控反应变化
watch(() => matrixStore.reactions, (reactions) => {
  reactions.forEach((eventReactions, eventId) => {
    console.log(`事件 ${eventId} 的反应:`, eventReactions)
  })
}, { deep: true })
```

### 4. ✏️ 消息编辑和删除

#### 编辑消息
```typescript
// 编辑消息
await matrixStore.editMessage('roomId', 'eventId', 'Updated message content')

// 删除消息
await matrixStore.deleteMessage('roomId', 'eventId', 'Inappropriate content')
```

#### 消息状态跟踪
```typescript
// 检查消息状态
const message = matrixStore.currentMessages.find(m => m.id === 'eventId')
if (message) {
  console.log('消息已编辑:', message.edited)
  console.log('编辑时间:', message.editedAt)
  console.log('消息已删除:', message.redacted)
  console.log('删除原因:', message.redactionReason)
}
```

### 5. 🌌 空间管理

#### 创建和管理空间
```typescript
// 创建空间
const spaceResponse = await matrixStore.createSpace(
  'My Workspace',
  'A space for team collaboration',
  false // 私有空间
)

// 添加房间到空间
await matrixStore.addRoomToSpace(spaceResponse.room_id, 'roomId')

// 获取所有空间
const spaces = matrixStore.sortedSpaces
console.log('可用空间:', spaces)
```

#### 空间层级管理
```typescript
// 监控空间变化
watch(() => matrixStore.spaces, (spaces) => {
  spaces.forEach(space => {
    console.log(`空间: ${space.name}`)
    console.log(`子房间: ${space.childRooms.length}`)
    console.log(`父空间: ${space.parentSpaces.length}`)
  })
}, { deep: true })
```

### 6. 🔄 智能自动重连

#### 重连状态监控
```typescript
// 监控连接状态
watch(() => matrixStore.connection.syncState, (syncState) => {
  console.log('同步状态:', {
    state: syncState.state,
    isActive: syncState.isActive,
    catchingUp: syncState.catchingUp,
    reconnectAttempts: syncState.reconnectAttempts,
    lastReconnectAttempt: syncState.lastReconnectAttempt,
    syncProgress: syncState.syncProgress
  })
}, { deep: true })

// 检查重连状态
console.log('正在追赶:', matrixStore.isCatchingUp)
console.log('同步进度:', matrixStore.syncProgress)
```

### 7. 📊 性能监控和优化

#### 性能指标获取
```typescript
// 获取性能指标
const metrics = matrixStore.getPerformanceMetrics()
console.log('性能指标:', {
  syncDuration: metrics.syncDuration,
  messageProcessingTime: metrics.messageProcessingTime,
  encryptionTime: metrics.encryptionTime,
  decryptionTime: metrics.decryptionTime,
  memoryUsage: matrixStore.formatFileSize(metrics.memoryUsage),
  networkLatency: metrics.networkLatency,
  roomsLoaded: metrics.roomsLoaded,
  messagesLoaded: metrics.messagesLoaded
})

// 输出性能报告
matrixStore.logPerformanceReport()
```

#### 性能监控
```typescript
// 实时监控性能
setInterval(() => {
  const metrics = matrixStore.getPerformanceMetrics()
  if (metrics.syncDuration > 5000) {
    console.warn('同步耗时过长:', metrics.syncDuration)
  }
  if (metrics.memoryUsage > 100 * 1024 * 1024) { // 100MB
    console.warn('内存使用过高:', matrixStore.formatFileSize(metrics.memoryUsage))
  }
}, 30000) // 每30秒检查一次
```

### 8. 👥 增强的房间管理

#### 创建不同类型的房间
```typescript
// 创建公开房间
await matrixStore.createRoom({
  name: 'Public Discussion',
  topic: 'Open discussion for everyone',
  isPublic: true,
  encrypted: false
})

// 创建私有加密房间
await matrixStore.createRoom({
  name: 'Private Team Chat',
  topic: 'Secure team communication',
  isPublic: false,
  encrypted: true,
  inviteUsers: ['@user1:matrix.org', '@user2:matrix.org']
})

// 创建直接消息
await matrixStore.createRoom({
  name: 'Direct Message',
  isDirect: true,
  encrypted: true,
  inviteUsers: ['@friend:matrix.org']
})
```

#### 房间状态监控
```typescript
// 监控房间详细信息
watch(() => matrixStore.currentRoom, (room) => {
  if (room) {
    console.log('当前房间:', {
      name: room.name,
      memberCount: room.memberCount,
      unreadCount: room.unreadCount,
      notificationCount: room.notificationCount,
      highlightCount: room.highlightCount,
      encrypted: room.encrypted,
      typing: room.typing,
      powerLevels: room.powerLevels
    })
  }
}, { deep: true })
```

### 9. 👤 在线状态和打字指示器

#### 在线状态监控
```typescript
// 监控用户在线状态
watch(() => matrixStore.presence, (presenceMap) => {
  presenceMap.forEach((presence, userId) => {
    console.log(`用户 ${userId}:`, {
      presence: presence.presence,
      lastActiveAgo: presence.lastActiveAgo,
      statusMessage: presence.statusMessage,
      currentlyActive: presence.currentlyActive
    })
  })
}, { deep: true })

// 监控打字状态
watch(() => matrixStore.typing, (typingMap) => {
  typingMap.forEach((users, roomId) => {
    if (users.length > 0) {
      console.log(`房间 ${roomId} 中正在打字:`, users)
    }
  })
}, { deep: true })
```

### 10. 🔍 高级搜索和过滤

#### 房间和消息过滤
```typescript
// 按类型过滤房间
const publicRooms = matrixStore.rooms.filter(room => room.isPublic)
const encryptedRooms = matrixStore.rooms.filter(room => room.encrypted)
const spacesWithChildren = matrixStore.spaces.filter(space => space.childRooms.length > 0)

// 按未读状态过滤
const unreadRooms = matrixStore.sortedRooms.filter(room => room.unreadCount > 0)
const highlightRooms = matrixStore.sortedRooms.filter(room => room.highlightCount > 0)

// 搜索消息
const searchMessages = (query: string, roomId?: string) => {
  const messagesToSearch = roomId 
    ? matrixStore.messages.get(roomId) || []
    : Array.from(matrixStore.messages.values()).flat()
  
  return messagesToSearch.filter(message => 
    message.content.toLowerCase().includes(query.toLowerCase())
  )
}
```

## 🎨 完整使用示例

### Vue 组件集成示例
```vue
<template>
  <div class="matrix-advanced-chat">
    <!-- 连接状态 -->
    <div class="connection-status">
      <el-tag :type="connectionStatusType">
        {{ connectionStatusText }}
      </el-tag>
      <el-progress 
        v-if="matrixStore.isSyncing" 
        :percentage="matrixStore.syncProgress" 
        :show-text="false"
        size="small"
      />
    </div>

    <!-- 加密状态 -->
    <div class="crypto-status" v-if="matrixStore.encryptionReady">
      <el-tooltip content="加密已启用">
        <el-icon color="green"><Lock /></el-icon>
      </el-tooltip>
      <el-tooltip content="交叉签名已设置" v-if="matrixStore.crossSigningReady">
        <el-icon color="blue"><Shield /></el-icon>
      </el-tooltip>
      <el-tooltip content="密钥备份已启用" v-if="matrixStore.keyBackupReady">
        <el-icon color="orange"><Key /></el-icon>
      </el-tooltip>
    </div>

    <!-- 房间列表 -->
    <div class="room-list">
      <!-- 空间 -->
      <div class="spaces" v-if="matrixStore.spaces.length > 0">
        <h3>空间</h3>
        <div 
          v-for="space in matrixStore.sortedSpaces" 
          :key="space.id"
          class="space-item"
          @click="matrixStore.setCurrentRoom(space.id)"
        >
          <span>🌌 {{ space.name }}</span>
          <el-badge :value="space.childRooms.length" type="info" />
        </div>
      </div>

      <!-- 房间 -->
      <div class="rooms">
        <h3>房间</h3>
        <div 
          v-for="room in matrixStore.sortedRooms" 
          :key="room.id"
          class="room-item"
          :class="{ active: room.id === matrixStore.currentRoomId }"
          @click="matrixStore.setCurrentRoom(room.id)"
        >
          <div class="room-info">
            <span class="room-name">
              {{ room.encrypted ? '🔒' : '' }} {{ room.name }}
            </span>
            <span class="room-topic" v-if="room.topic">{{ room.topic }}</span>
          </div>
          <div class="room-badges">
            <el-badge :value="room.unreadCount" v-if="room.unreadCount > 0" />
            <el-badge :value="room.highlightCount" type="danger" v-if="room.highlightCount > 0" />
          </div>
        </div>
      </div>
    </div>

    <!-- 消息区域 -->
    <div class="message-area" v-if="matrixStore.currentRoom">
      <div class="message-list">
        <div 
          v-for="message in matrixStore.currentMessages" 
          :key="message.id"
          class="message-item"
          :class="{ own: message.sender === matrixStore.currentUser?.id }"
        >
          <div class="message-header">
            <span class="sender">{{ message.senderName }}</span>
            <span class="timestamp">{{ formatTime(message.timestamp) }}</span>
            <el-tag size="small" v-if="message.encrypted">🔒</el-tag>
            <el-tag size="small" type="warning" v-if="message.edited">已编辑</el-tag>
          </div>
          
          <div class="message-content">
            <!-- 文本消息 -->
            <p v-if="!message.fileInfo">{{ message.content }}</p>
            
            <!-- 文件消息 -->
            <div v-else class="file-message">
              <img v-if="message.fileInfo.isImage" :src="message.fileInfo.url" alt="图片" />
              <video v-else-if="message.fileInfo.isVideo" :src="message.fileInfo.url" controls />
              <audio v-else-if="message.fileInfo.isAudio" :src="message.fileInfo.url" controls />
              <a v-else :href="message.fileInfo.url" target="_blank">
                📎 {{ message.fileInfo.name }}
              </a>
            </div>

            <!-- 位置消息 -->
            <div v-if="message.location" class="location-message">
              📍 {{ message.location.description }}
              <small>({{ message.location.latitude }}, {{ message.location.longitude }})</small>
            </div>
          </div>

          <!-- 消息反应 -->
          <div class="message-reactions" v-if="messageReactions(message.id)">
            <el-button
              v-for="(reaction, key) in messageReactions(message.id)"
              :key="key"
              size="small"
              :type="reaction.hasReacted ? 'primary' : 'default'"
              @click="toggleReaction(message.roomId, message.id, key)"
            >
              {{ key }} {{ reaction.count }}
            </el-button>
          </div>

          <!-- 消息操作 -->
          <div class="message-actions">
            <el-button size="small" @click="addReaction(message.roomId, message.id, '👍')">👍</el-button>
            <el-button size="small" @click="replyToMessage(message)">回复</el-button>
            <el-button size="small" @click="startThread(message)" v-if="matrixStore.supportsThreads">线程</el-button>
            <el-button size="small" @click="editMessage(message)" v-if="canEdit(message)">编辑</el-button>
            <el-button size="small" type="danger" @click="deleteMessage(message)" v-if="canDelete(message)">删除</el-button>
          </div>
        </div>
      </div>

      <!-- 打字指示器 -->
      <div class="typing-indicator" v-if="typingUsers.length > 0">
        {{ typingUsers.join(', ') }} 正在打字...
      </div>

      <!-- 消息输入 -->
      <div class="message-input">
        <el-input
          v-model="messageText"
          type="textarea"
          :rows="3"
          placeholder="输入消息..."
          @keydown.ctrl.enter="sendMessage"
        />
        <div class="input-actions">
          <el-upload :before-upload="sendFile" :show-file-list="false">
            <el-button>📎 文件</el-button>
          </el-upload>
          <el-button type="primary" @click="sendMessage">发送</el-button>
        </div>
      </div>
    </div>

    <!-- 性能监控 -->
    <div class="performance-monitor" v-if="showPerformance">
      <h4>性能监控</h4>
      <div class="metrics">
        <div>同步: {{ performanceMetrics.syncDuration.toFixed(2) }}ms</div>
        <div>消息处理: {{ performanceMetrics.messageProcessingTime.toFixed(2) }}ms</div>
        <div>内存: {{ matrixStore.formatFileSize(performanceMetrics.memoryUsage) }}</div>
        <div>房间: {{ performanceMetrics.roomsLoaded }}</div>
        <div>消息: {{ performanceMetrics.messagesLoaded }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useMatrixV39Store } from '@/stores/matrix-v39-clean'

const matrixStore = useMatrixV39Store()
const messageText = ref('')
const showPerformance = ref(false)

// 计算属性
const connectionStatusType = computed(() => {
  if (matrixStore.isConnected) return 'success'
  if (matrixStore.isSyncing) return 'warning'
  return 'danger'
})

const connectionStatusText = computed(() => {
  if (matrixStore.isCatchingUp) return '追赶中'
  if (matrixStore.isSyncing) return '同步中'
  if (matrixStore.isConnected) return '已连接'
  return '未连接'
})

const typingUsers = computed(() => {
  if (!matrixStore.currentRoomId) return []
  return matrixStore.typing.get(matrixStore.currentRoomId) || []
})

const performanceMetrics = computed(() => matrixStore.getPerformanceMetrics())

// 方法
const messageReactions = (eventId: string) => {
  return matrixStore.reactions.get(eventId)
}

const toggleReaction = async (roomId: string, eventId: string, reaction: string) => {
  const reactions = matrixStore.reactions.get(eventId)
  const hasReacted = reactions?.[reaction]?.hasReacted
  
  if (hasReacted) {
    await matrixStore.removeReaction(roomId, eventId, reaction)
  } else {
    await matrixStore.addReaction(roomId, eventId, reaction)
  }
}

const sendMessage = async () => {
  if (!messageText.value.trim() || !matrixStore.currentRoomId) return
  
  try {
    await matrixStore.sendMatrixMessage(matrixStore.currentRoomId, messageText.value)
    messageText.value = ''
  } catch (error) {
    console.error('发送消息失败:', error)
  }
}

const sendFile = async (file: File) => {
  if (!matrixStore.currentRoomId) return false
  
  try {
    await matrixStore.sendFileMessage(matrixStore.currentRoomId, file)
  } catch (error) {
    console.error('发送文件失败:', error)
  }
  
  return false
}

const canEdit = (message: any) => {
  return message.sender === matrixStore.currentUser?.id && !message.redacted
}

const canDelete = (message: any) => {
  return message.sender === matrixStore.currentUser?.id || 
         matrixStore.currentRoom?.powerLevels.users[matrixStore.currentUser?.id || ''] >= 50
}

const formatTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleTimeString()
}

// 初始化
onMounted(async () => {
  await matrixStore.initializeMatrix()
})
</script>
```

## 🎉 总结

Matrix JS SDK v39.0.0 的完整集成提供了：

### ✅ 核心功能
- 完整的用户认证和会话管理
- 实时消息同步和处理
- 端到端加密支持
- 文件上传和媒体处理

### ✅ 高级功能
- 🧵 线程消息支持
- 👍 消息反应系统
- ✏️ 消息编辑和删除
- 🌌 空间管理
- 🔄 智能自动重连
- 📊 性能监控
- 👥 增强的房间管理
- 👤 在线状态和打字指示器

### ✅ 性能优化
- Rust 加密引擎
- 智能存储策略
- 节流的事件处理
- 内存使用优化
- 网络请求优化

这个完整的实现为现代 Matrix 客户端提供了坚实的基础，支持所有最新的 Matrix 协议功能！🚀