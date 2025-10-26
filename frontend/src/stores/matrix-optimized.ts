import { defineStore } from 'pinia'
import { ref, computed, shallowRef, shallowReactive, readonly, nextTick, onUnmounted } from 'vue'
import { passiveEventManager } from '@/utils/passiveEventManager'

// ==================== 类型定义 ====================

interface MatrixMessage {
  id: string
  roomId: string
  content: string
  sender: string
  senderName?: string
  timestamp: number
  type: string
  eventId?: string
  encrypted?: boolean
  status?: 'sending' | 'sent' | 'delivered' | 'failed'
  msgtype?: string
  fileInfo?: FileInfo
  replyTo?: ReplyInfo
  reactions?: Record<string, MessageReaction>
  threadInfo?: ThreadInfo
  location?: LocationInfo
  edited?: boolean
  editedAt?: number
  redacted?: boolean
  redactionReason?: string
}

interface ReplyInfo {
  eventId: string
  senderName: string
  content: string
  timestamp: number
}

interface MessageReaction {
  count: number
  users: string[]
  hasReacted: boolean
  key: string
}

interface ThreadInfo {
  rootEventId: string
  replyCount: number
  latestReply?: MatrixMessage
  isThread: boolean
}

interface LocationInfo {
  latitude: number
  longitude: number
  description?: string
  accuracy?: number
}

interface FileInfo {
  name: string
  size: number
  type: string
  url: string
  mxcUrl?: string
  isImage: boolean
  isVideo: boolean
  isAudio: boolean
}

interface MatrixRoom {
  id: string
  name: string
  alias?: string
  topic?: string
  type: 'public' | 'private' | 'space' | 'dm'
  isPublic: boolean
  isDirect: boolean
  isSpace: boolean
  memberCount: number
  joinedMemberCount: number
  invitedMemberCount: number
  members: RoomMember[]
  lastMessage?: MatrixMessage
  unreadCount: number
  notificationCount: number
  highlightCount: number
  encrypted: boolean
  encryptionAlgorithm?: string
  avatarUrl?: string
  canonicalAlias?: string
  altAliases: string[]
  powerLevels: PowerLevels
  joinRule: string
  historyVisibility: string
  guestAccess: string
  tags: Record<string, any>
  accountData: Record<string, any>
  summary?: RoomSummary
  typing: string[]
  receipts: Record<string, Receipt[]>
  presence: Record<string, PresenceInfo>
  childRooms: string[]
  parentSpaces: string[]
  updatedAt: number
  createdAt: number
}

interface RoomMember {
  userId: string
  displayName?: string
  avatarUrl?: string
  membership: 'join' | 'invite' | 'leave' | 'ban' | 'knock'
  powerLevel: number
  lastActiveAgo?: number
  presence?: 'online' | 'offline' | 'unavailable'
  statusMessage?: string
}

interface PowerLevels {
  users: Record<string, number>
  usersDefault: number
  events: Record<string, number>
  eventsDefault: number
  stateDefault: number
  ban: number
  kick: number
  redact: number
  invite: number
  notifications: {
    room: number
  }
}

interface RoomSummary {
  heroes: string[]
  joinedMemberCount: number
  invitedMemberCount: number
}

interface Receipt {
  userId: string
  timestamp: number
  eventId: string
  receiptType: string
}

interface PresenceInfo {
  presence: 'online' | 'offline' | 'unavailable'
  lastActiveAgo?: number
  statusMessage?: string
  currentlyActive?: boolean
}

interface MatrixUser {
  id: string
  username: string
  displayName?: string
  avatarUrl?: string
  presence?: 'online' | 'offline' | 'unavailable'
  lastSeen?: number
  statusMessage?: string
  currentlyActive?: boolean
  devices: Device[]
  crossSigningInfo?: CrossSigningInfo
}

interface Device {
  deviceId: string
  displayName?: string
  lastSeenIp?: string
  lastSeenTs?: number
  verified: boolean
  blocked: boolean
}

interface CrossSigningInfo {
  masterKey?: string
  selfSigningKey?: string
  userSigningKey?: string
  trustLevel: 'verified' | 'unverified' | 'unknown'
}

interface ConnectionState {
  connected: boolean
  homeserver: string
  userId?: string
  accessToken?: string
  deviceId?: string
  syncState: SyncStateInfo
  cryptoReady: boolean
  slidingSyncSupported: boolean
  voipSupported: boolean
  threadsSupported: boolean
  spacesSupported: boolean
}

interface CryptoStatus {
  ready: boolean
  crossSigningReady: boolean
  keyBackupEnabled: boolean
  secretStorageReady: boolean
  deviceVerified: boolean
  roomKeysBackedUp: number
  totalRoomKeys: number
}

interface PerformanceMetrics {
  syncDuration: number
  messageProcessingTime: number
  encryptionTime: number
  decryptionTime: number
  memoryUsage: number
  networkLatency: number
  roomsLoaded: number
  messagesLoaded: number
}

interface SyncStateInfo {
  state: string
  isActive: boolean
  lastSync?: number
  syncError?: string
  nextBatch?: string
  catchingUp: boolean
  syncProgress?: number
  reconnectAttempts: number
  lastReconnectAttempt?: number
}

// ==================== 工具函数 ====================

class MatrixErrorHandler {
  static handle(error: any, context: string): string {
    console.error(`❌ ${context}:`, error)
    
    if (error.name === 'NetworkError' || error.code === 'NETWORK_ERROR') {
      return '网络连接失败，请检查网络设置'
    }
    
    if (error.errcode === 'M_UNAUTHORIZED' || error.status === 401) {
      return '认证失败，请重新登录'
    }
    
    if (error.errcode === 'M_FORBIDDEN' || error.status === 403) {
      return '权限不足，无法执行此操作'
    }
    
    return error.message || error.errcode || '未知错误'
  }
}

const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      if (i === maxRetries - 1) throw error
      
      const delay = baseDelay * Math.pow(2, i)
      console.log(`⏳ 重试 ${i + 1}/${maxRetries}，${delay}ms后重试...`)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  throw new Error('重试次数已用完')
}

const throttle = <T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): T => {
  let lastCall = 0
  return ((...args: Parameters<T>) => {
    const now = Date.now()
    if (now - lastCall >= delay) {
      lastCall = now
      return fn(...args)
    }
  }) as T
}

const debounce = <T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): T => {
  let timeoutId: number | null = null
  return ((...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    timeoutId = window.setTimeout(() => fn(...args), delay)
  }) as T
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const generateDeviceId = (userId: string): string => {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  const userPart = userId.split(':')[0].substring(1)
  return `jianluochat_web_${userPart}_${timestamp}_${random}`
}

// ==================== 性能监控管理 ====================

class MatrixPerformanceManager {
  private static metrics: PerformanceMetrics = {
    syncDuration: 0,
    messageProcessingTime: 0,
    encryptionTime: 0,
    decryptionTime: 0,
    memoryUsage: 0,
    networkLatency: 0,
    roomsLoaded: 0,
    messagesLoaded: 0
  }

  static startTimer(operation: string): () => void {
    const startTime = performance.now()
    return () => {
      const duration = performance.now() - startTime
      this.recordMetric(operation, duration)
    }
  }

  static recordMetric(operation: string, value: number) {
    switch (operation) {
      case 'sync':
        this.metrics.syncDuration = value
        break
      case 'messageProcessing':
        this.metrics.messageProcessingTime = value
        break
      case 'encryption':
        this.metrics.encryptionTime = value
        break
      case 'decryption':
        this.metrics.decryptionTime = value
        break
      case 'networkLatency':
        this.metrics.networkLatency = value
        break
    }
  }

  static updateCounts(roomsLoaded: number, messagesLoaded: number) {
    this.metrics.roomsLoaded = roomsLoaded
    this.metrics.messagesLoaded = messagesLoaded
  }

  static getMetrics(): PerformanceMetrics {
    // 更新内存使用情况
    if ((performance as any).memory) {
      this.metrics.memoryUsage = (performance as any).memory.usedJSHeapSize
    }

    return { ...this.metrics }
  }

  static logPerformanceReport() {
    const metrics = this.getMetrics()
    console.group('📊 Matrix 性能报告')
    console.log(`同步耗时: ${metrics.syncDuration.toFixed(2)}ms`)
    console.log(`消息处理: ${metrics.messageProcessingTime.toFixed(2)}ms`)
    console.log(`加密耗时: ${metrics.encryptionTime.toFixed(2)}ms`)
    console.log(`解密耗时: ${metrics.decryptionTime.toFixed(2)}ms`)
    console.log(`网络延迟: ${metrics.networkLatency.toFixed(2)}ms`)
    console.log(`内存使用: ${formatFileSize(metrics.memoryUsage)}`)
    console.log(`房间数量: ${metrics.roomsLoaded}`)
    console.log(`消息数量: ${metrics.messagesLoaded}`)
    console.groupEnd()
  }
}

// ==================== 客户端管理 ====================

class MatrixClientManager {
  static async createClient(userId: string, accessToken: string, homeserver: string, providedDeviceId?: string) {
    try {
      console.log(`🚀 创建 Matrix 客户端: ${userId} @ ${homeserver}`)
      
      // 动态导入 Matrix SDK
      const sdk = await import('matrix-js-sdk')
      
      // 使用提供的设备ID或从存储中获取/生成
      let deviceId = providedDeviceId
      
      if (!deviceId) {
        const deviceIdKey = `jianluochat-device-id-${userId.split(':')[0].substring(1)}`
        const storedDeviceId = localStorage.getItem(deviceIdKey)
        deviceId = storedDeviceId || undefined
        
        if (!deviceId) {
          deviceId = generateDeviceId(userId)
          localStorage.setItem(deviceIdKey, deviceId)
          console.log('🆔 生成新的设备ID:', deviceId)
        }
      } else {
        // 如果提供了设备ID，也保存到localStorage
        const deviceIdKey = `jianluochat-device-id-${userId.split(':')[0].substring(1)}`
        localStorage.setItem(deviceIdKey, deviceId)
        console.log('🆔 使用服务器提供的设备ID:', deviceId)
      }

      // 创建客户端配置（简化版本，避免复杂的存储初始化）
      const clientConfig = {
        baseUrl: homeserver.startsWith('http') ? homeserver : `https://${homeserver}`,
        accessToken: accessToken,
        userId: userId,
        deviceId: deviceId,
        timelineSupport: true,
        useAuthorizationHeader: true
      }

      const client = sdk.createClient(clientConfig)
      console.log('✅ Matrix 客户端创建成功')

      return client
    } catch (error) {
      console.error('❌ 创建 Matrix 客户端失败:', error)
      throw error
    }
  }

  static async cleanup(client: any) {
    if (client) {
      try {
        console.log('🧹 清理 Matrix 客户端...')
        
        client.removeAllListeners()
        
        if (client.clientRunning) {
          client.stopClient()
        }
        
        console.log('✅ Matrix 客户端清理完成')
      } catch (error) {
        console.warn('清理 Matrix 客户端时出错:', error)
      }
    }
  }
}

// ==================== 优化的Store定义 ====================

export const useMatrixOptimizedStore = defineStore('matrix-optimized', () => {
  // 状态管理（使用浅层响应式以提高性能）
  const matrixClient = shallowRef<any>(null)
  const connection = shallowRef<ConnectionState>({
    connected: false,
    homeserver: 'https://matrix.jianluochat.com',
    syncState: { 
      state: 'STOPPED',
      isActive: false,
      catchingUp: false,
      reconnectAttempts: 0
    },
    cryptoReady: false,
    slidingSyncSupported: false,
    voipSupported: false,
    threadsSupported: true,
    spacesSupported: true
  })
  
  const rooms = shallowReactive<MatrixRoom[]>([])
  const spaces = shallowReactive<MatrixRoom[]>([])
  const directMessages = shallowReactive<MatrixRoom[]>([])
  const messages = shallowReactive(new Map<string, MatrixMessage[]>())
  
  const currentUser = shallowRef<MatrixUser | null>(null)
  const currentRoomId = ref<string | null>(null)
  const currentThreadId = ref<string | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const clientInitializing = ref(false)

  // 计算属性
  const currentRoom = computed(() => {
    return [...rooms, ...spaces, ...directMessages].find(room => room.id === currentRoomId.value) || null
  })

  const currentMessages = computed(() => 
    currentRoomId.value ? messages.get(currentRoomId.value) || [] : []
  )

  const sortedRooms = computed(() => 
    [...rooms].sort((a, b) => {
      const aTime = a.lastMessage?.timestamp || a.updatedAt || 0
      const bTime = b.lastMessage?.timestamp || b.updatedAt || 0
      return bTime - aTime
    })
  )

  const totalUnreadCount = computed(() => 
    [...rooms, ...spaces, ...directMessages].reduce((total, room) => total + room.unreadCount, 0)
  )

  const totalNotificationCount = computed(() => 
    [...rooms, ...spaces, ...directMessages].reduce((total, room) => total + (room.notificationCount || 0), 0)
  )

  const totalHighlightCount = computed(() => 
    [...rooms, ...spaces, ...directMessages].reduce((total, room) => total + (room.highlightCount || 0), 0)
  )

  const currentThread = computed(() => 
    currentThreadId.value ? [] : []
  )

  const sortedSpaces = computed(() => 
    [...spaces].sort((a, b) => (a.name || '').localeCompare(b.name || ''))
  )

  const sortedDirectMessages = computed(() => 
    [...directMessages].sort((a, b) => {
      const aTime = a.lastMessage?.timestamp || a.updatedAt || 0
      const bTime = b.lastMessage?.timestamp || b.updatedAt || 0
      return bTime - aTime
    })
  )

  const isConnected = computed(() => connection.value.connected)
  const isLoggedIn = computed(() => connection.value.connected && connection.value.userId)
  const isSyncing = computed(() => connection.value.syncState.isActive)
  const isCatchingUp = computed(() => connection.value.syncState.catchingUp)
  const syncProgress = computed(() => connection.value.syncState.syncProgress || 0)
  const homeserver = computed(() => connection.value.homeserver)

  // 辅助函数
  const convertEventToMessage = (event: any, room: any): MatrixMessage | null => {
    try {
      const eventContent = event.getContent()
      const content = eventContent?.body || eventContent?.formatted_body || ''
      
      const message: MatrixMessage = {
        id: event.getId(),
        roomId: room.roomId,
        content,
        sender: event.getSender(),
        senderName: event.getSender(),
        timestamp: event.getTs(),
        type: event.getType(),
        eventId: event.getId(),
        encrypted: !!eventContent?.algorithm,
        status: 'sent',
        msgtype: eventContent?.msgtype
      }

      // 处理文件消息
      if (eventContent?.msgtype === 'm.image' || eventContent?.msgtype === 'm.file' || 
          eventContent?.msgtype === 'm.video' || eventContent?.msgtype === 'm.audio') {
        const isImage = eventContent.msgtype === 'm.image'
        const isVideo = eventContent.msgtype === 'm.video'
        const isAudio = eventContent.msgtype === 'm.audio'
        
        let mxcUrl = eventContent.url
        if (typeof mxcUrl === 'object' && mxcUrl?.content_uri) {
          mxcUrl = mxcUrl.content_uri
        }
        
        const fileUrl = mxcUrl ? matrixClient.value?.mxcUrlToHttp(mxcUrl) : null
        
        if (fileUrl) {
          message.fileInfo = {
            name: eventContent.filename || eventContent.body || 'Unknown file',
            size: eventContent.info?.size || 0,
            type: eventContent.info?.mimetype || 'application/octet-stream',
            url: fileUrl,
            mxcUrl: mxcUrl,
            isImage,
            isVideo,
            isAudio
          }
          
          const emoji = isImage ? '🖼️' : isVideo ? '🎥' : isAudio ? '🎵' : '📎'
          message.content = `${emoji} ${message.fileInfo.name}`
          if (message.fileInfo.size > 0) {
            message.content += ` (${formatFileSize(message.fileInfo.size)})`
          }
        }
      }

      return message
    } catch (error) {
      console.error('转换事件为消息失败:', error)
      return null
    }
  }

  const addMessageToRoom = (roomId: string, message: MatrixMessage) => {
    const roomMessages = messages.get(roomId) || []
    const existingIndex = roomMessages.findIndex(m => m.id === message.id)
    
    if (existingIndex >= 0) {
      roomMessages[existingIndex] = message
    } else {
      roomMessages.push(message)
      roomMessages.sort((a, b) => a.timestamp - b.timestamp)
    }
    
    messages.set(roomId, roomMessages)
    
    // 更新房间最后消息
    const allRooms = [...rooms, ...spaces, ...directMessages]
    const room = allRooms.find(r => r.id === roomId)
    if (room) {
      room.lastMessage = message
      room.updatedAt = Date.now()
      if (currentRoomId.value !== roomId) {
        room.unreadCount += 1
      }
    }
  }

  const updateRoomsOptimized = (newRooms: MatrixRoom[]) => {
    const newRoomIds = new Set(newRooms.map(r => r.id))
    const existingIds = new Set(rooms.map(r => r.id))
    
    // 找出需要更新的房间
    const roomsToUpdate = rooms.filter(r => newRoomIds.has(r.id))
    const roomObjects = newRooms.map(room => ({ ...room }))
    
    // 批量更新房间列表
    roomsToUpdate.forEach(room => {
      const newRoomData = roomObjects.find(r => r.id === room.id)
      if (newRoomData) {
        Object.assign(room, newRoomData)
      }
    })
    
    // 添加新房间
    const newRoomsToAdd = roomObjects.filter(r => !existingIds.has(r.id))
    rooms.push(...newRoomsToAdd)
    
    // 保存到localStorage
    try {
      localStorage.setItem('matrix-rooms-optimized', JSON.stringify(rooms.map(r => ({
        id: r.id,
        name: r.name,
        alias: r.alias,
        topic: r.topic,
        type: r.type,
        isPublic: r.isPublic,
        memberCount: r.memberCount,
        encrypted: r.encrypted,
        joinRule: r.joinRule,
        historyVisibility: r.historyVisibility,
        avatarUrl: r.avatarUrl
      }))))
    } catch (error) {
      console.error('保存房间列表失败:', error)
    }
  }

  const addMessageOptimized = (roomId: string, message: MatrixMessage) => {
    const roomMessages = messages.get(roomId) || []
    const existingMessage = roomMessages.find(m => m.id === message.id)
    
    if (existingMessage) {
      Object.assign(existingMessage, message)
    } else {
      roomMessages.push(message)
      roomMessages.sort((a, b) => a.timestamp - b.timestamp)
    }
    
    messages.set(roomId, roomMessages)
    
    // 更新房间最后消息
    const room = rooms.find(r => r.id === roomId)
    if (room) {
      room.lastMessage = message
      room.updatedAt = Date.now()
      if (currentRoomId.value !== roomId) {
        room.unreadCount += 1
      }
    }
  }

  // 优化的事件监听器设置
  const setupOptimizedEventListeners = (client: any) => {
    console.log('🎧 设置优化的事件监听器...')
    
    // 使用节流优化同步事件处理
    const throttledSyncHandler = throttle((state: string, prevState: string | null, data: any) => {
      console.log(`🔄 同步状态: ${prevState} -> ${state}`)
      
      connection.value.syncState = {
        ...connection.value.syncState,
        state,
        isActive: state === 'SYNCING' || state === 'CATCHUP',
        catchingUp: state === 'CATCHUP',
        lastSync: Date.now(),
        nextBatch: data?.response?.next_batch || connection.value.syncState.nextBatch,
        syncProgress: data?.progress || 0
      }

      if (state === 'PREPARED' || state === 'SYNCING') {
        // 立即更新房间列表
        if (matrixClient.value) {
          updateRoomsFromClient(matrixClient.value)
        }
      } else if (state === 'ERROR') {
        console.error('❌ 同步错误:', data?.error)
        connection.value.syncState.syncError = data?.error?.message || 'Unknown sync error'
      }

    }, 500)

    // 使用节流优化消息事件处理
    const throttledMessageHandler = throttle((event: any, room: any, toStartOfTimeline: boolean) => {
      if (toStartOfTimeline) return
      
      if (event.getType() === 'm.room.message') {
        const message = convertEventToMessage(event, room)
        if (message) {
          addMessageOptimized(room.roomId, message)
        }
      }
    }, 100)

    // 绑定事件监听器
    client.on('sync', throttledSyncHandler)
    client.on('Room.timeline', throttledMessageHandler)
    
    console.log('✅ 优化的事件监听器设置完成')
  }

  const updateRoomsFromClient = (client: any) => {
    try {
      console.log('🔄 从客户端更新房间列表...')
      
      const clientRooms = client.getRooms()
      const convertedRooms: MatrixRoom[] = []

      clientRooms.forEach((room: any) => {
        try {
          const joinRule = room.getJoinRule()
          const isSpace = room.isSpaceRoom?.() || false
          const isDirect = client.isRoomDirect?.(room.roomId) || false

          const matrixRoom: MatrixRoom = {
            id: room.roomId,
            name: room.name || room.roomId,
            alias: room.getCanonicalAlias(),
            topic: room.currentState?.getStateEvents('m.room.topic', '')?.getContent()?.topic || '',
            type: isSpace ? 'space' : isDirect ? 'dm' : (joinRule === 'public' ? 'public' : 'private'),
            isPublic: joinRule === 'public',
            isDirect,
            isSpace,
            memberCount: room.currentState?.getJoinedMemberCount() || 0,
            joinedMemberCount: room.getJoinedMemberCount() || 0,
            invitedMemberCount: room.getInvitedMemberCount() || 0,
            members: [],
            unreadCount: room.getUnreadNotificationCount() || 0,
            notificationCount: room.getUnreadNotificationCount() || 0,
            highlightCount: room.getUnreadNotificationCount('highlight') || 0,
            encrypted: room.hasEncryptionStateEvent(),
            encryptionAlgorithm: room.hasEncryptionStateEvent() ? 'm.megolm.v1.aes-sha2' : undefined,
            avatarUrl: room.getAvatarUrl?.(client.baseUrl, 96, 96, 'scale'),
            canonicalAlias: room.getCanonicalAlias(),
            altAliases: room.getAltAliases() || [],
            powerLevels: {
              users: {},
              usersDefault: 0,
              events: {},
              eventsDefault: 0,
              stateDefault: 50,
              ban: 50,
              kick: 50,
              redact: 50,
              invite: 50,
              notifications: { room: 50 }
            },
            joinRule: joinRule || 'invite',
            historyVisibility: room.getHistoryVisibility() || 'shared',
            guestAccess: room.getGuestAccess() || 'can_join',
            tags: room.tags || {},
            accountData: {},
            summary: undefined,
            typing: [],
            receipts: {},
            presence: {},
            childRooms: [],
            parentSpaces: [],
            updatedAt: Date.now(),
            createdAt: Date.now()
          }

          convertedRooms.push(matrixRoom)

        } catch (roomError) {
          console.warn(`处理房间 ${room.roomId} 失败:`, roomError)
        }
      })

      // 优化的房间更新
      updateRoomsOptimized(convertedRooms)

      console.log(`✅ 房间列表更新完成: ${convertedRooms.length} 房间`)

    } catch (error) {
      console.error('❌ 更新房间列表失败:', error)
    }
  }

  // 主要功能函数
  const initializeMatrix = async (): Promise<boolean> => {
    if (clientInitializing.value) {
      console.log('⚠️ Matrix 正在初始化中，跳过重复初始化')
      return false
    }

    try {
      clientInitializing.value = true
      console.log('🚀 初始化优化版 Matrix SDK...')

      // 尝试恢复登录状态
      const savedLoginInfo = localStorage.getItem('matrix-optimized-login-info')
      if (savedLoginInfo) {
        const loginData = JSON.parse(savedLoginInfo)
        
        // 检查登录信息是否过期（7天）
        const loginAge = loginData.loginTime ? (Date.now() - loginData.loginTime) : 0
        const maxAge = 7 * 24 * 60 * 60 * 1000
        
        if (!loginData.loginTime || loginAge < maxAge) {
          console.log('🔄 恢复 Matrix 登录状态:', loginData.userId)
          
          try {
            const client = await MatrixClientManager.createClient(
              loginData.userId, 
              loginData.accessToken, 
              loginData.homeserver,
              loginData.deviceId
            )
            
            // 设置事件监听器
            setupOptimizedEventListeners(client)
            
            // 设置客户端
            matrixClient.value = client
            
            // 更新连接状态
            connection.value = {
              ...connection.value,
              connected: true,
              homeserver: loginData.homeserver,
              userId: loginData.userId,
              accessToken: loginData.accessToken,
              deviceId: loginData.deviceId
            }

            // 设置当前用户
            currentUser.value = {
              id: loginData.userId,
              username: loginData.userId.split(':')[0].substring(1),
              displayName: loginData.displayName || loginData.userId.split(':')[0].substring(1),
              devices: [],
              crossSigningInfo: {
                trustLevel: 'unknown'
              }
            }
            
            // 启动客户端
            console.log('🚀 启动 Matrix 客户端...')
            await client.startClient({
              initialSyncLimit: 20, // 减少初始同步限制以提高性能
              lazyLoadMembers: true
            })
            
            // 等待初始同步完成
            console.log('⏳ 等待初始同步完成...')
            await new Promise((resolve) => {
              const checkSync = () => {
                const state = client.getSyncState()
                if (state === 'SYNCING' || state === 'PREPARED') {
                  console.log('✅ 初始同步完成')
                  resolve(true)
                } else {
                  setTimeout(checkSync, 100)
                }
              }
              checkSync()
            })

            // 强制更新房间列表
            setTimeout(() => {
              if (client) {
                updateRoomsFromClient(client)
              }
            }, 1000)

            console.log('✅ Matrix 登录状态恢复成功')
            return true
            
          } catch (clientError) {
            console.error('❌ 恢复客户端失败:', clientError)
            localStorage.removeItem('matrix-optimized-login-info')
            return false
          }
        } else {
          console.log('🕐 登录信息已过期，需要重新登录')
          localStorage.removeItem('matrix-optimized-login-info')
        }
      }
      
      return false
    } catch (error) {
      console.error('❌ 初始化 Matrix 失败:', error)
      return false
    } finally {
      clientInitializing.value = false
    }
  }

  const matrixLogin = async (username: string, password: string, homeserver?: string) => {
    try {
      loading.value = true
      error.value = null
      
      const serverUrl = homeserver || 'matrix.jianluochat.com'
      console.log(`🔐 尝试 Matrix 登录: ${username} @ ${serverUrl}`)

      // 加载 SDK
      const sdk = await import('matrix-js-sdk')
      
      // 创建临时客户端用于登录
      const tempClient = sdk.createClient({
        baseUrl: serverUrl.startsWith('http') ? serverUrl : `https://${serverUrl}`
      })

      // 执行登录
      const loginResponse = await tempClient.login('m.login.password', {
        user: username,
        password: password,
        initial_device_display_name: 'JianLuo Chat Web Optimized'
      })

      console.log('✅ 登录响应:', loginResponse)

      const userId = loginResponse.user_id
      const accessToken = loginResponse.access_token
      const deviceId = loginResponse.device_id

      // 保存登录信息
      const loginData = {
        userId,
        accessToken,
        deviceId,
        homeserver: serverUrl,
        loginTime: Date.now(),
        displayName: username
      }
      localStorage.setItem('matrix-optimized-login-info', JSON.stringify(loginData))

      // 创建正式客户端，使用服务器返回的设备ID
      const client = await MatrixClientManager.createClient(userId, accessToken, serverUrl, deviceId)
      
      // 设置事件监听器
      setupOptimizedEventListeners(client)
      
      // 设置客户端
      matrixClient.value = client
      
      // 更新连接状态
      connection.value = {
        ...connection.value,
        connected: true,
        homeserver: serverUrl,
        userId,
        accessToken,
        deviceId
      }

      // 设置当前用户
      currentUser.value = {
        id: userId,
        username,
        displayName: username,
        devices: [],
        crossSigningInfo: {
          trustLevel: 'unknown'
        }
      }
      
      // 启动客户端
      console.log('🚀 启动 Matrix 客户端...')
      await client.startClient({
        initialSyncLimit: 20, // 减少初始同步限制
        lazyLoadMembers: true
      })

      // 等待初始同步完成
      console.log('⏳ 等待初始同步完成...')
      await new Promise((resolve) => {
        const checkSync = () => {
          const state = client.getSyncState()
          if (state === 'SYNCING' || state === 'PREPARED') {
            console.log('✅ 初始同步完成')
            resolve(true)
          } else {
            setTimeout(checkSync, 100)
          }
        }
        checkSync()
      })

      // 注册到协调器（中等优先级，优化版本）
      try {
        const { registerMatrixStore } = await import('@/utils/matrixStoreCoordinator')
        registerMatrixStore('matrix-optimized.ts', {
          matrixClient,
          rooms,
          messages,
          connection
        }, 8) // 性能测试专用store优先级（PerformanceTestPage等使用）
        console.log('✅ Matrix Optimized Store 已注册到协调器')
      } catch (coordError) {
        console.warn('⚠️ 协调器注册失败:', coordError)
      }

      // 强制更新房间列表
      setTimeout(() => {
        if (client) {
          updateRoomsFromClient(client)
        }
      }, 1000)

      console.log('✅ Matrix 登录成功')
      return { success: true, user: currentUser.value }

    } catch (err: any) {
      const errorMessage = MatrixErrorHandler.handle(err, 'Matrix 登录')
      error.value = errorMessage
      console.error('❌ Matrix 登录失败:', err)
      return { success: false, error: errorMessage }
    } finally {
      loading.value = false
    }
  }

  const fetchMatrixRooms = async () => {
    try {
      loading.value = true
      console.log('🔄 获取 Matrix 房间列表...')

      if (!matrixClient.value) {
        console.error('❌ Matrix 客户端未初始化')
        return []
      }

      // 等待客户端准备就绪
      if (!matrixClient.value.clientRunning) {
        console.log('⏳ 等待客户端启动...')
        await new Promise(resolve => setTimeout(resolve, 1000)) // 减少等待时间
      }

      // 从客户端更新房间
      updateRoomsFromClient(matrixClient.value)
      
      console.log(`✅ 房间列表获取完成: ${rooms.length} 房间`)
      return [...rooms, ...spaces, ...directMessages]

    } catch (err: any) {
      const errorMessage = MatrixErrorHandler.handle(err, '获取房间列表')
      error.value = errorMessage
      console.error('❌ 获取房间列表失败:', err)
      return []
    } finally {
      loading.value = false
    }
  }

  const fetchMatrixMessages = async (roomId: string, limit = 50) => {
    try {
      console.log(`🔄 获取房间消息: ${roomId}`)

      if (!matrixClient.value) {
        console.error('❌ Matrix 客户端未初始化')
        return []
      }

      const room = matrixClient.value.getRoom(roomId)
      if (!room) {
        console.warn(`❌ 房间 ${roomId} 不存在`)
        return []
      }

      // 获取房间时间线
      const timeline = room.getLiveTimeline()
      let events = timeline.getEvents()

      // 如果消息较少，尝试加载更多历史消息
      if (events.length < Math.min(limit, 50)) { // 减少历史消息加载
        try {
          console.log('📜 加载历史消息...')
          await matrixClient.value.scrollback(room, Math.min(limit, 100)) // 减少加载数量
          events = timeline.getEvents()
        } catch (scrollError) {
          console.warn('加载历史消息失败:', scrollError)
        }
      }

      // 转换事件为消息
      const roomMessages: MatrixMessage[] = []
      
      events.forEach((event: any) => {
        if (event.getType() === 'm.room.message') {
          const message = convertEventToMessage(event, room)
          if (message) {
            roomMessages.push(message)
          }
        }
      })

      // 按时间排序并限制数量
      roomMessages.sort((a, b) => a.timestamp - b.timestamp)
      const limitedMessages = roomMessages.slice(-limit)

      // 更新消息存储
      messages.set(roomId, limitedMessages)
      
      console.log(`✅ 房间 ${roomId} 消息加载完成，共 ${limitedMessages.length} 条`)
      return limitedMessages

    } catch (err: any) {
      const errorMessage = MatrixErrorHandler.handle(err, '获取消息')
      error.value = errorMessage
      console.error('❌ 获取消息失败:', err)
      messages.set(roomId, [])
      return []
    }
  }

  const sendMatrixMessage = async (roomId: string, content: string, msgtype: string = 'm.text') => {
    try {
      if (!currentUser.value) {
        throw new Error('用户未登录')
      }

      if (!matrixClient.value) {
        throw new Error('Matrix 客户端未初始化')
      }

      console.log(`📤 发送消息到房间 ${roomId}`)

      // 构建消息内容
      const messageContent = {
        msgtype,
        body: content
      }

      // 发送消息
      const response = await matrixClient.value.sendEvent(roomId, 'm.room.message', messageContent)
      console.log('✅ 消息发送成功:', response)

      // 创建本地消息对象
      const newMessage: MatrixMessage = {
        id: response.event_id,
        roomId,
        content,
        sender: matrixClient.value.getUserId() || currentUser.value.id,
        senderName: currentUser.value.displayName || currentUser.value.username,
        timestamp: Date.now(),
        type: 'm.room.message',
        eventId: response.event_id,
        status: 'sent',
        msgtype
      }

      // 添加到本地消息列表
      addMessageOptimized(roomId, newMessage)

      return newMessage

    } catch (err: any) {
      const errorMessage = MatrixErrorHandler.handle(err, '发送消息')
      error.value = errorMessage
      console.error('❌ 发送消息失败:', err)
      throw new Error(errorMessage)
    }
  }

  const logout = async () => {
    try {
      console.log('🚪 Matrix 登出...')

      if (matrixClient.value) {
        // 清理客户端
        await MatrixClientManager.cleanup(matrixClient.value)
        matrixClient.value = null
      }
      
      // 清除状态
      connection.value = {
        connected: false,
        homeserver: 'https://matrix.jianluochat.com',
        syncState: { 
          state: 'STOPPED',
          isActive: false,
          catchingUp: false,
          reconnectAttempts: 0
        },
        cryptoReady: false,
        slidingSyncSupported: false,
        voipSupported: false,
        threadsSupported: true,
        spacesSupported: true
      }
      
      currentUser.value = null
      clientInitializing.value = false
      
      // 清空数据
      rooms.splice(0, rooms.length)
      spaces.splice(0, spaces.length)
      directMessages.splice(0, directMessages.length)
      messages.clear()
      
      // 清除存储
      localStorage.removeItem('matrix-optimized-login-info')
      localStorage.removeItem('matrix-rooms-optimized')
      
      console.log('✅ Matrix 登出完成')

    } catch (error) {
      console.error('❌ 登出过程中出错:', error)
    }
  }

  // 辅助方法
  const setCurrentRoom = (roomId: string | null) => {
    currentRoomId.value = roomId
    
    if (roomId && !messages.has(roomId)) {
      fetchMatrixMessages(roomId)
    }
    
    if (roomId) {
      markRoomAsRead(roomId)
    }
  }

  const markRoomAsRead = (roomId: string) => {
    const allRooms = [...rooms, ...spaces, ...directMessages]
    const room = allRooms.find(r => r.id === roomId)
    if (room) {
      room.unreadCount = 0
    }
  }

  const clearError = () => {
    error.value = null
  }

  // 性能和监控
  const getPerformanceMetrics = (): PerformanceMetrics => {
    return MatrixPerformanceManager.getMetrics()
  }

  const logPerformanceReport = () => {
    MatrixPerformanceManager.logPerformanceReport()
  }

  // 返回接口
  return {
    // 状态
    connection: readonly(connection),
    currentUser: readonly(currentUser),
    rooms: readonly(rooms),
    spaces: readonly(spaces),
    directMessages: readonly(directMessages),
    messages: readonly(messages),
    currentRoomId: readonly(currentRoomId),
    currentThreadId: readonly(currentThreadId),
    loading: readonly(loading),
    error: readonly(error),
    clientInitializing: readonly(clientInitializing),
    matrixClient: readonly(matrixClient),

    // 计算属性
    currentRoom,
    currentMessages,
    currentThread,
    sortedRooms,
    sortedSpaces,
    sortedDirectMessages,
    totalUnreadCount,
    totalNotificationCount,
    totalHighlightCount,
    isConnected,
    isLoggedIn,
    isSyncing,
    isCatchingUp,
    syncProgress,
    homeserver,

    // 主要方法
    initializeMatrix,
    matrixLogin,
    fetchMatrixRooms,
    fetchMatrixMessages,
    sendMatrixMessage,
    logout,

    // 辅助方法
    setCurrentRoom,
    markRoomAsRead,
    clearError,
    getPerformanceMetrics,
    logPerformanceReport,

    // 工具方法
    formatFileSize,
    retryWithBackoff,
    generateDeviceId
  }
})

// 导出管理器供外部使用
export { 
  MatrixClientManager,
  MatrixPerformanceManager
}