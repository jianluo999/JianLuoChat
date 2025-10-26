import { defineStore } from 'pinia'
import { ref, computed, shallowRef, shallowReactive, nextTick } from 'vue'
import { matrixAPI, roomAPI } from '@/services/api'

// 统一的Matrix Store - 整合三个版本的优点
export const useMatrixUnifiedStore = defineStore('matrix-unified', () => {
  // ==================== 类型定义 ====================
  
  interface MatrixMessage {
    id: string
    roomId: string
    content: string
    sender: string
    timestamp: number
    type: string
    eventId?: string
    encrypted?: boolean
    senderName?: string
    senderAvatar?: string
    edited?: boolean
    status?: 'sending' | 'sent' | 'delivered' | 'failed'
    fileInfo?: {
      name: string
      size: number
      type: string
      url: string
      isImage: boolean
      mxcUrl?: string
    }
    msgtype?: string
    senderId?: string
    isOwn?: boolean
    isEdited?: boolean
    isRedacted?: boolean
    redactionReason?: string
    reactions?: Record<string, MessageReaction>
    replyTo?: {
      eventId: string
      senderName: string
      content: string
    }
  }

  interface MessageReaction {
    count: number
    users: string[]
    hasReacted: boolean
  }

  interface MatrixRoom {
    id: string
    name: string
    alias?: string
    topic?: string
    type: 'public' | 'private' | 'world' | 'space'
    isPublic: boolean
    memberCount: number
    members?: string[]
    lastMessage?: MatrixMessage
    unreadCount: number
    encrypted?: boolean
    powerLevels?: any
    joinRule?: string
    historyVisibility?: string
    createdAt?: string
    updatedAt?: string
    avatarUrl?: string
    childRooms?: MatrixRoom[]
    encryptionInfo?: any
    deviceInfo?: any
    isFileTransferRoom?: boolean
  }

  interface MatrixUser {
    id: string
    username: string
    displayName?: string
    avatarUrl?: string
    presence?: 'online' | 'offline' | 'unavailable'
    lastSeen?: number
    statusMessage?: string
    userId?: string
  }

  interface MatrixConnectionState {
    connected: boolean
    homeserver: string
    userId?: string
    accessToken?: string
    deviceId?: string
    syncState: {
      isActive: boolean
      lastSync?: number
      syncError?: string
      nextBatch?: string
    }
  }

  // ==================== 状态管理 ====================
  
  // 使用 shallowRef 优化性能，减少响应式开销
  const matrixClient = shallowRef<any>(null)
  const connection = shallowRef<MatrixConnectionState>({
    connected: false,
    homeserver: 'https://matrix.jianluochat.com',
    syncState: { isActive: false }
  })
  
  // 使用 shallowReactive 优化大型数组性能
  const rooms = shallowReactive<MatrixRoom[]>([])
  const messages = shallowReactive(new Map<string, MatrixMessage[]>())
  
  // 其他状态
  const currentUser = shallowRef<MatrixUser | null>(null)
  const currentRoomId = ref<string | null>(null)
  const worldChannel = shallowRef<MatrixRoom | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const clientInitializing = ref(false)

  // 文件传输助手常量
  const FILE_TRANSFER_ROOM_ID = 'file-transfer-assistant'
  const FILE_TRANSFER_ROOM_NAME = '文件传输助手'
  const FILE_TRANSFER_ROOM_TOPIC = '发送文件、图片和消息的个人助手'

  // ==================== 计算属性 ====================
  
  const currentRoom = computed(() => {
    if (currentRoomId.value === 'world') {
      return worldChannel.value
    }
    return rooms.find(room => room.id === currentRoomId.value)
  })

  const currentMessages = computed(() => 
    currentRoomId.value ? messages.get(currentRoomId.value) || [] : []
  )

  const sortedRooms = computed(() => 
    [...rooms].sort((a, b) => {
      const aTime = a.lastMessage?.timestamp || 0
      const bTime = b.lastMessage?.timestamp || 0
      return bTime - aTime
    })
  )

  const totalUnreadCount = computed(() => 
    rooms.reduce((total, room) => total + room.unreadCount, 0) + 
    (worldChannel.value?.unreadCount || 0)
  )

  const isConnected = computed(() => connection.value.connected)
  const isLoggedIn = computed(() => connection.value.connected && connection.value.userId)
  const homeserver = computed(() => connection.value.homeserver)
  const syncStatus = computed(() => {
    if (connection.value.syncState.isActive) return 'syncing'
    if (connection.value.connected) return 'synced'
    return 'disconnected'
  })

  // ==================== 工具函数 ====================
  
  // 统一错误处理器
  class MatrixErrorHandler {
    static handle(error: any, context: string): string {
      console.error(`❌ ${context}:`, error)
      
      // 网络错误
      if (error.name === 'NetworkError' || error.code === 'NETWORK_ERROR') {
        return '网络连接失败，请检查网络设置'
      }
      
      // 认证错误
      if (error.errcode === 'M_UNAUTHORIZED' || error.status === 401) {
        return '认证失败，请重新登录'
      }
      
      // 加密错误
      if (error.message?.includes('crypto') || error.message?.includes('encryption')) {
        return '加密功能暂不可用，请使用非加密房间'
      }
      
      // 同步错误
      if (error.message?.includes('sync')) {
        return '同步失败，正在重试...'
      }
      
      return error.message || '未知错误'
    }
  }

  // 指数退避重试
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

  // 节流函数
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

  // 防抖函数
  const debounce = <T extends (...args: any[]) => any>(
    fn: T,
    delay: number
  ): T => {
    let timeoutId: any
    return ((...args: Parameters<T>) => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => fn(...args), delay)
    }) as T
  }

  // 格式化文件大小
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // ==================== 缓存管理 ====================
  
  class MatrixCacheManager {
    private static dbName = 'jianluochat-matrix-cache'
    private static version = 1
    private db: IDBDatabase | null = null

    async getDB(): Promise<IDBDatabase> {
      if (this.db) return this.db

      return new Promise((resolve, reject) => {
        const request = indexedDB.open(MatrixCacheManager.dbName, MatrixCacheManager.version)
        
        request.onerror = () => reject(request.error)
        request.onsuccess = () => {
          this.db = request.result
          resolve(this.db)
        }
        
        request.onupgradeneeded = () => {
          const db = request.result
          
          // 创建消息存储
          if (!db.objectStoreNames.contains('messages')) {
            const messageStore = db.createObjectStore('messages', { keyPath: 'roomId' })
            messageStore.createIndex('timestamp', 'timestamp')
          }
          
          // 创建房间存储
          if (!db.objectStoreNames.contains('rooms')) {
            const roomStore = db.createObjectStore('rooms', { keyPath: 'id' })
            roomStore.createIndex('lastActivity', 'lastActivity')
          }
        }
      })
    }

    async saveMessages(roomId: string, messages: MatrixMessage[]): Promise<void> {
      try {
        const db = await this.getDB()
        const tx = db.transaction(['messages'], 'readwrite')
        await tx.objectStore('messages').put({
          roomId,
          messages,
          timestamp: Date.now()
        })
        console.log(`💾 房间 ${roomId} 消息已缓存`)
      } catch (error) {
        console.warn('缓存消息失败:', error)
      }
    }

    async loadMessages(roomId: string): Promise<MatrixMessage[]> {
      try {
        const db = await this.getDB()
        const tx = db.transaction(['messages'], 'readonly')
        const cached = await tx.objectStore('messages').get(roomId)
        
        // 检查缓存是否过期（24小时）
        if (cached && Date.now() - (cached as any).timestamp < 24 * 60 * 60 * 1000) {
          console.log(`💾 从缓存加载房间 ${roomId} 消息`)
          return (cached as any).messages
        }
      } catch (error) {
        console.warn('加载缓存消息失败:', error)
      }
      return []
    }

    async saveRooms(rooms: MatrixRoom[]): Promise<void> {
      try {
        const db = await this.getDB()
        const tx = db.transaction(['rooms'], 'readwrite')
        const store = tx.objectStore('rooms')
        
        for (const room of rooms) {
          await store.put({
            ...room,
            timestamp: Date.now()
          })
        }
        console.log(`💾 ${rooms.length} 个房间已缓存`)
      } catch (error) {
        console.warn('缓存房间失败:', error)
      }
    }

    async loadRooms(): Promise<MatrixRoom[]> {
      try {
        const db = await this.getDB()
        const tx = db.transaction(['rooms'], 'readonly')
        const store = tx.objectStore('rooms')
        const request = store.getAll()
        
        return new Promise((resolve, reject) => {
          request.onsuccess = () => {
            const cachedRooms = request.result
              .filter((room: any) => Date.now() - room.timestamp < 24 * 60 * 60 * 1000)
              .map((room: any) => {
                const { timestamp, ...roomData } = room
                return roomData
              })
            
            console.log(`💾 从缓存加载 ${cachedRooms.length} 个房间`)
            resolve(cachedRooms)
          }
          request.onerror = () => reject(request.error)
        })
      } catch (error) {
        console.warn('加载缓存房间失败:', error)
        return []
      }
    }

    async clearCache(): Promise<void> {
      try {
        const db = await this.getDB()
        const tx = db.transaction(['messages', 'rooms'], 'readwrite')
        await Promise.all([
          tx.objectStore('messages').clear(),
          tx.objectStore('rooms').clear()
        ])
        console.log('🧹 缓存已清理')
      } catch (error) {
        console.warn('清理缓存失败:', error)
      }
    }
  }

  const cacheManager = new MatrixCacheManager()

  // ==================== 持久化存储 ====================
  
  const saveRoomsToStorage = async () => {
    try {
      // 同时保存到 localStorage 和 IndexedDB
      const roomsData = rooms.map(room => ({
        id: room.id,
        name: room.name,
        alias: room.alias,
        topic: room.topic,
        type: room.type,
        isPublic: room.isPublic,
        memberCount: room.memberCount,
        encrypted: room.encrypted,
        joinRule: room.joinRule,
        historyVisibility: room.historyVisibility,
        avatarUrl: room.avatarUrl,
        isFileTransferRoom: room.isFileTransferRoom
      }))
      
      localStorage.setItem('matrix-rooms', JSON.stringify(roomsData))
      await cacheManager.saveRooms(roomsData as any)
      
      console.log(`💾 ${roomsData.length} 个房间已保存`)
    } catch (error) {
      console.error('保存房间失败:', error)
    }
  }

  const loadRoomsFromStorage = async () => {
    try {
      // 优先从 IndexedDB 加载，回退到 localStorage
      let roomsData = await cacheManager.loadRooms()
      
      if (roomsData.length === 0) {
        const savedRooms = localStorage.getItem('matrix-rooms')
        if (savedRooms) {
          roomsData = JSON.parse(savedRooms)
        }
      }
      
      if (roomsData.length > 0) {
        rooms.splice(0, rooms.length, ...roomsData.map((room: any) => ({
          ...room,
          members: room.members || [],
          unreadCount: 0,
          lastMessage: null
        })))
        console.log(`💾 从存储加载 ${rooms.length} 个房间`)
        return true
      }
    } catch (error) {
      console.error('加载房间失败:', error)
    }
    return false
  }

  const saveMessagesToStorage = async () => {
    try {
      // 保存所有房间的消息到缓存
      for (const [roomId, msgs] of messages.entries()) {
        await cacheManager.saveMessages(roomId, msgs)
      }
      
      // 同时保存到 localStorage（作为备份）
      const messagesData: { [key: string]: MatrixMessage[] } = {}
      messages.forEach((msgs, roomId) => {
        messagesData[roomId] = msgs
      })
      localStorage.setItem('matrix_messages', JSON.stringify(messagesData))
      
      console.log('💾 消息数据已保存')
    } catch (error) {
      console.error('保存消息失败:', error)
    }
  }

  const loadMessagesFromStorage = async () => {
    try {
      // 优先从 IndexedDB 加载
      const roomIds = rooms.map(room => room.id)
      for (const roomId of roomIds) {
        const cachedMessages = await cacheManager.loadMessages(roomId)
        if (cachedMessages.length > 0) {
          messages.set(roomId, cachedMessages)
        }
      }
      
      // 如果 IndexedDB 没有数据，从 localStorage 加载
      if (messages.size === 0) {
        const savedMessages = localStorage.getItem('matrix_messages')
        if (savedMessages) {
          const messagesData = JSON.parse(savedMessages)
          Object.entries(messagesData).forEach(([roomId, msgs]) => {
            messages.set(roomId, msgs as MatrixMessage[])
          })
        }
      }
      
      console.log(`💾 从存储加载 ${messages.size} 个房间的消息`)
    } catch (error) {
      console.error('加载消息失败:', error)
    }
  }

  // ==================== 加密功能 ====================
  
  const initializeEncryption = async (client: any): Promise<boolean> => {
    try {
      // 检查浏览器支持
      if (!window.WebAssembly) {
        console.warn('浏览器不支持WebAssembly，跳过加密')
        return false
      }

      // 检查客户端是否支持加密
      if (typeof client.initRustCrypto !== 'function') {
        console.warn('客户端不支持Rust加密，跳过加密')
        return false
      }

      console.log('🔧 正在初始化加密引擎...')

      // 使用重试机制初始化加密
      const cryptoInitialized = await retryWithBackoff(async () => {
        // 尝试多种配置策略
        const cryptoConfigs = [
          // 策略1: 使用IndexedDB
          {
            useIndexedDB: true,
            cryptoDatabasePrefix: 'jianluochat-crypto'
          },
          // 策略2: 使用内存存储
          {
            useIndexedDB: false
          }
        ]

        for (const config of cryptoConfigs) {
          try {
            console.log(`🔧 尝试加密配置:`, config)
            await client.initRustCrypto(config)
            console.log('✅ Rust加密引擎初始化成功')
            return true
          } catch (configError: any) {
            console.warn(`⚠️ 配置失败:`, configError.message)
            if (!configError.message.includes('WebAssembly') && 
                !configError.message.includes('wasm')) {
              break // 非WASM错误，跳出循环
            }
          }
        }
        throw new Error('所有加密配置都失败了')
      }, 2, 2000)

      if (cryptoInitialized) {
        // 验证加密是否真正可用
        const crypto = client.getCrypto()
        if (crypto) {
          console.log('✅ 加密API可用')
          return true
        }
      }

      return false
    } catch (error: any) {
      console.error('❌ 加密初始化失败:', error)
      console.warn('⚠️ 将以非加密模式继续运行')
      return false
    }
  }

  // ==================== 客户端管理 ====================
  
  const cleanupMatrixClient = async () => {
    if (matrixClient.value) {
      try {
        console.log('🧹 清理Matrix客户端...')
        
        // 移除所有事件监听器
        matrixClient.value.removeAllListeners()
        
        // 停止客户端
        if (matrixClient.value.clientRunning) {
          matrixClient.value.stopClient()
        }
        
        // 清理加密存储
        const crypto = matrixClient.value.getCrypto()
        if (crypto) {
          try {
            await crypto.stop()
          } catch (cryptoError) {
            console.warn('清理加密存储时出错:', cryptoError)
          }
        }
        
        console.log('✅ Matrix客户端清理完成')
      } catch (error) {
        console.warn('清理Matrix客户端时出错:', error)
      } finally {
        matrixClient.value = null
      }
    }
  }

  const createMatrixClient = async (userId: string, accessToken: string, homeserver: string) => {
    // 防止并发创建多个客户端
    if (clientInitializing.value) {
      console.log('⚠️ 客户端正在初始化中，跳过重复创建')
      return matrixClient.value
    }

    try {
      clientInitializing.value = true
      console.log(`🚀 创建Matrix客户端: ${userId} @ ${homeserver}`)

      // 先清理现有客户端
      await cleanupMatrixClient()

      // 动态导入matrix-js-sdk
      const { createClient } = await import('matrix-js-sdk')

      // 生成设备ID
      const deviceIdKey = `jianluochat-device-id-${userId.split(':')[0].substring(1)}`
      let deviceId = localStorage.getItem(deviceIdKey)

      if (!deviceId) {
        const timestamp = Date.now()
        const random = Math.random().toString(36).substring(2, 8)
        deviceId = `jianluochat_web_${timestamp}_${random}`
        localStorage.setItem(deviceIdKey, deviceId)
        console.log('🆔 生成新的设备ID:', deviceId)
      }

      // 创建客户端配置
      const client = createClient({
        baseUrl: `https://${homeserver}`,
        accessToken: accessToken,
        userId: userId,
        deviceId: deviceId,
        timelineSupport: true,
        useAuthorizationHeader: true
      })

      console.log('✅ Matrix客户端创建成功')

      // 初始化加密（可选）
      const encryptionEnabled = await initializeEncryption(client)
      console.log(`🔐 加密状态: ${encryptionEnabled ? '已启用' : '已禁用'}`)

      // 设置优化的事件监听器
      setupOptimizedEventListeners(client)

      // 设置客户端实例
      matrixClient.value = client

      // 启动客户端
      console.log('🚀 启动Matrix客户端...')
      await client.startClient({
        initialSyncLimit: 50,  // 优化：减少初始同步负担
        lazyLoadMembers: true
      })

      console.log('✅ Matrix客户端启动成功')
      return client

    } catch (error) {
      console.error('❌ 创建Matrix客户端失败:', error)
      await cleanupMatrixClient()
      throw error
    } finally {
      clientInitializing.value = false
    }
  }

  // 设置优化的事件监听器
  const setupOptimizedEventListeners = (client: any) => {
    console.log('🎧 设置优化的事件监听器...')

    // 使用节流的同步事件处理器
    const throttledSyncHandler = throttle((state: string, prevState: string | null, data: any) => {
      console.log(`🔄 同步状态变化: ${prevState} -> ${state}`)
      
      try {
        if (state === 'SYNCING' || state === 'PREPARED') {
          connection.value.syncState = {
            isActive: true,
            lastSync: Date.now(),
            nextBatch: data?.response?.next_batch || connection.value.syncState.nextBatch
          }
          
          // 延迟更新房间列表
          setTimeout(() => {
            const clientRooms = client.getRooms()
            if (clientRooms.length > 0) {
              updateRoomsOptimized(clientRooms)
            }
          }, 1000)
        } else if (state === 'ERROR') {
          console.error('❌ 同步错误:', data?.error)
          connection.value.syncState = {
            isActive: false,
            syncError: data?.error?.errcode || data?.error?.message || 'Unknown sync error'
          }
          
          // 实施退避重试
          setTimeout(() => {
            console.log('🔄 尝试重启同步...')
            try {
              client.startClient({
                initialSyncLimit: 50,
                lazyLoadMembers: true
              })
            } catch (restartError) {
              console.error('重启同步失败:', restartError)
            }
          }, 5000)
        } else {
          connection.value.syncState = { isActive: state === 'SYNCING' }
        }
      } catch (syncError: any) {
        console.error('❌ 同步事件处理失败:', syncError)
        connection.value.syncState = {
          isActive: false,
          syncError: syncError.message || 'Unknown sync error'
        }
      }
    }, 1000)

    // 设置节流的房间事件处理器
    const throttledRoomHandler = throttle((room: any) => {
      console.log('🏠 新房间事件:', room.roomId)
      
      setTimeout(() => {
        const clientRooms = client.getRooms()
        if (clientRooms.length > 0) {
          updateRoomsOptimized(clientRooms)
        }
      }, 500)
    }, 500)

    // 节流消息事件处理器
    const throttledTimelineHandler = throttle((event: any, room: any) => {
      if (event.getType() === 'm.room.message') {
        const eventContent = event.getContent()
        const content = eventContent?.body || eventContent?.formatted_body || ''
        
        const message: MatrixMessage = {
          id: event.getId(),
          roomId: room.roomId,
          content,
          sender: event.getSender(),
          timestamp: event.getTs(),
          type: event.getType(),
          eventId: event.getId(),
          status: 'sent'
        }

        // 处理文件消息
        if (eventContent?.msgtype === 'm.image' || eventContent?.msgtype === 'm.file') {
          const isImage = eventContent.msgtype === 'm.image'
          let mxcUrl = eventContent.url
          if (typeof mxcUrl === 'object' && mxcUrl?.content_uri) {
            mxcUrl = mxcUrl.content_uri
          }
          
          const fileUrl = mxcUrl ? client.mxcUrlToHttp(mxcUrl) : null
          if (fileUrl) {
            message.fileInfo = {
              name: eventContent.filename || eventContent.body || 'Unknown file',
              size: eventContent.info?.size || 0,
              type: eventContent.info?.mimetype || 'application/octet-stream',
              url: fileUrl,
              isImage,
              mxcUrl: mxcUrl
            }
            
            message.content = `${isImage ? '🖼️' : '📎'} ${message.fileInfo.name}`
            if (message.fileInfo.size > 0) {
              message.content += ` (${formatFileSize(message.fileInfo.size)})`
            }
          }
        }

        // 添加到消息列表
        addMessageOptimized(room.roomId, message)
      }
    }, 100)

    // 绑定事件监听器
    client.on('sync', throttledSyncHandler)
    client.on('Room', throttledRoomHandler)
    client.on('Room.timeline', throttledTimelineHandler)
    client.on('error', (error: any) => {
      console.error('❌ Matrix客户端错误:', error)
      error.value = MatrixErrorHandler.handle(error, 'Matrix客户端')
    })
  }

  // 优化的房间更新函数
  const updateRoomsOptimized = (newRooms: any[]) => {
    console.log(`🔄 优化更新房间列表，新房间数: ${newRooms.length}`)
    
    const convertedRooms = newRooms.map((room: any) => ({
      id: room.roomId,
      name: room.name || room.roomId,
      alias: room.getCanonicalAlias(),
      topic: room.currentState?.getStateEvents('m.room.topic', '')?.getContent()?.topic || '',
      type: (room.getJoinRule() === 'public' ? 'public' : 'private') as 'public' | 'private',
      isPublic: room.getJoinRule() === 'public',
      memberCount: room.getJoinedMemberCount() || 0,
      members: [],
      unreadCount: room.getUnreadNotificationCount() || 0,
      encrypted: room.hasEncryptionStateEvent(),
      joinRule: room.getJoinRule() || 'invite',
      historyVisibility: room.getHistoryVisibility() || 'shared'
    }))

    // 确保文件传输助手存在并置顶
    const fileTransferRoom = ensureFileTransferRoom()
    const finalRooms = [fileTransferRoom, ...convertedRooms]

    // 批量更新
    rooms.splice(0, rooms.length, ...finalRooms)
    
    // 异步保存
    nextTick(() => {
      saveRoomsToStorage()
    })
    
    console.log(`✅ 房间列表已更新，共 ${finalRooms.length} 个房间`)
  }

  // 优化的消息添加函数
  const addMessageOptimized = (roomId: string, message: MatrixMessage) => {
    const roomMessages = messages.get(roomId) || []
    const existingMessage = roomMessages.find(m => m.id === message.id)
    
    if (!existingMessage) {
      roomMessages.push(message)
      messages.set(roomId, roomMessages)
      
      // 批量更新房间状态
      const room = rooms.find(r => r.id === roomId)
      if (room) {
        room.lastMessage = message
        if (currentRoomId.value !== roomId) {
          room.unreadCount += 1
        }
      }
      
      // 异步保存消息
      debounce(() => {
        cacheManager.saveMessages(roomId, roomMessages)
      }, 1000)()
    }
  }

  // 创建文件传输助手
  const ensureFileTransferRoom = (): MatrixRoom => {
    return {
      id: FILE_TRANSFER_ROOM_ID,
      name: FILE_TRANSFER_ROOM_NAME,
      alias: '',
      topic: FILE_TRANSFER_ROOM_TOPIC,
      type: 'private',
      isPublic: false,
      memberCount: 1,
      members: [],
      unreadCount: 0,
      encrypted: false,
      isFileTransferRoom: true,
      joinRule: 'invite',
      historyVisibility: 'shared'
    }
  }

  // ==================== 主要功能函数 ====================
  
  // 初始化Matrix
  const initializeMatrix = async (): Promise<boolean> => {
    if (clientInitializing.value) {
      console.log('⚠️ Matrix正在初始化中，跳过重复初始化')
      return false
    }

    try {
      // 首先加载缓存数据
      await loadRoomsFromStorage()
      await loadMessagesFromStorage()

      // 尝试恢复登录状态
      const savedLoginInfo = localStorage.getItem('matrix-login-info')
      if (savedLoginInfo) {
        const loginData = JSON.parse(savedLoginInfo)
        
        // 检查登录信息是否过期（24小时）
        const loginAge = loginData.loginTime ? (Date.now() - loginData.loginTime) : 0
        const maxAge = 24 * 60 * 60 * 1000
        
        if (!loginData.loginTime || loginAge < maxAge) {
          console.log('🔄 恢复Matrix登录状态:', loginData.userId)
          
          // 恢复连接状态
          connection.value = {
            connected: true,
            homeserver: loginData.homeserver,
            userId: loginData.userId,
            accessToken: loginData.accessToken,
            deviceId: loginData.deviceId,
            syncState: { isActive: false }
          }
          
          currentUser.value = {
            id: loginData.userId,
            username: loginData.userId.split(':')[0].substring(1),
            displayName: loginData.userId.split(':')[0].substring(1),
            presence: 'online'
          }
          
          // 尝试重新创建Matrix客户端
          try {
            await createMatrixClient(loginData.userId, loginData.accessToken, loginData.homeserver)
            
            // 延迟刷新房间列表
            setTimeout(async () => {
              try {
                await fetchMatrixRooms()
                console.log('✅ 房间列表刷新完成')
              } catch (error) {
                console.warn('刷新房间列表失败:', error)
              }
            }, 2000)
            
            console.log('✅ Matrix登录状态恢复成功')
            return true
          } catch (clientError) {
            console.error('❌ 创建Matrix客户端失败:', clientError)
            return false
          }
        } else {
          console.log('🕐 登录信息已过期，需要重新登录')
          localStorage.removeItem('matrix-login-info')
        }
      }
      
      return false
    } catch (error) {
      console.error('❌ 初始化Matrix失败:', error)
      return false
    }
  }

  // 登录
  const matrixLogin = async (username: string, password: string) => {
    try {
      loading.value = true
      error.value = null

      console.log(`🔐 尝试Matrix登录: ${username}`)

      // 调用登录API
      const response = await matrixAPI.login({ username, password })

      if (response.data.success) {
        const loginData = {
          userId: `@${username}:jianluochat.com`,
          accessToken: response.data.accessToken,
          deviceId: response.data.deviceId,
          homeserver: 'jianluochat.com',
          loginTime: Date.now()
        }

        // 保存登录信息
        localStorage.setItem('matrix-login-info', JSON.stringify(loginData))

        // 更新状态
        connection.value = {
          connected: true,
          homeserver: loginData.homeserver,
          userId: loginData.userId,
          accessToken: loginData.accessToken,
          deviceId: loginData.deviceId,
          syncState: { isActive: false }
        }

        currentUser.value = {
          id: loginData.userId,
          username,
          displayName: username,
          presence: 'online'
        }

        // 创建Matrix客户端
        await createMatrixClient(loginData.userId, loginData.accessToken, loginData.homeserver)

        console.log('✅ Matrix登录成功')
        
        // 注册到协调器（高优先级，统一版本）
        try {
          const { registerMatrixStore } = await import('@/utils/matrixStoreCoordinator')
          registerMatrixStore('matrix-unified.ts', {
            matrixClient,
            rooms,
            messages,
            connection
          }, 8) // 高优先级
          console.log('✅ Matrix Unified Store 已注册到协调器')
        } catch (coordError) {
          console.warn('⚠️ 协调器注册失败:', coordError)
        }
        
        return { success: true, user: currentUser.value }
      } else {
        throw new Error('登录失败')
      }
    } catch (err: any) {
      const errorMessage = MatrixErrorHandler.handle(err, 'Matrix登录')
      error.value = errorMessage
      console.error('❌ Matrix登录失败:', err)
      return { success: false, error: errorMessage }
    } finally {
      loading.value = false
    }
  }

  // 获取房间列表
  const fetchMatrixRooms = async () => {
    try {
      loading.value = true
      console.log('🔄 获取Matrix房间列表...')

      if (!matrixClient.value) {
        console.error('❌ Matrix客户端未初始化')
        return []
      }

      // 检查客户端状态
      if (!matrixClient.value.clientRunning) {
        console.log('🚀 启动Matrix客户端...')
        await matrixClient.value.startClient({
          initialSyncLimit: 50,
          lazyLoadMembers: true
        })
        
        // 等待同步开始
        await new Promise(resolve => setTimeout(resolve, 2000))
      }

      // 获取房间
      const clientRooms = matrixClient.value.getRooms()
      console.log(`📊 获取到 ${clientRooms.length} 个房间`)

      if (clientRooms.length > 0) {
        updateRoomsOptimized(clientRooms)
      } else {
        // 如果没有房间，尝试从缓存恢复
        const cachedRooms = await cacheManager.loadRooms()
        if (cachedRooms.length > 0) {
          rooms.splice(0, rooms.length, ...cachedRooms)
          console.log(`📦 从缓存恢复 ${cachedRooms.length} 个房间`)
        }
      }

      return rooms
    } catch (err: any) {
      const errorMessage = MatrixErrorHandler.handle(err, '获取房间列表')
      error.value = errorMessage
      console.error('❌ 获取房间列表失败:', err)
      return []
    } finally {
      loading.value = false
    }
  }

  // 获取消息
  const fetchMatrixMessages = async (roomId: string, limit = 200) => {
    try {
      console.log(`🔄 获取房间消息: ${roomId}`)

      // 特殊处理文件传输助手
      if (roomId === FILE_TRANSFER_ROOM_ID) {
        if (messages.has(roomId)) {
          return messages.get(roomId) || []
        }

        const welcomeMessage: MatrixMessage = {
          id: 'welcome-msg-' + Date.now(),
          sender: 'system',
          content: '欢迎使用文件传输助手！\n\n您可以在这里：\n• 发送文件和图片\n• 保存重要消息\n• 进行文件管理\n\n开始发送您的第一个文件吧！',
          timestamp: Date.now(),
          roomId: roomId,
          type: 'm.room.message'
        }

        const welcomeMessages = [welcomeMessage]
        messages.set(roomId, welcomeMessages)
        return welcomeMessages
      }

      // 先尝试从缓存加载
      const cachedMessages = await cacheManager.loadMessages(roomId)
      if (cachedMessages.length > 0) {
        messages.set(roomId, cachedMessages)
        console.log(`💾 从缓存加载 ${cachedMessages.length} 条消息`)
        return cachedMessages
      }

      if (!matrixClient.value) {
        console.error('❌ Matrix客户端未初始化')
        return []
      }

      const room = matrixClient.value.getRoom(roomId)
      if (!room) {
        console.warn(`❌ 房间 ${roomId} 不存在`)
        return []
      }

      // 获取房间消息
      const timeline = room.getLiveTimeline()
      let events = timeline.getEvents()

      // 如果消息较少，尝试加载更多
      if (events.length < 50) {
        try {
          await matrixClient.value.scrollback(room, 500)
          events = timeline.getEvents()
        } catch (scrollError) {
          console.warn('加载历史消息失败:', scrollError)
        }
      }

      const roomMessages = events
        .filter((event: any) => event.getType() === 'm.room.message')
        .map((event: any): MatrixMessage => {
          const eventContent = event.getContent()
          const content = eventContent?.body || eventContent?.formatted_body || ''

          const message: MatrixMessage = {
            id: event.getId(),
            roomId,
            content,
            sender: event.getSender(),
            senderName: event.getSender(),
            timestamp: event.getTs(),
            type: event.getType(),
            eventId: event.getId(),
            encrypted: !!eventContent?.algorithm,
            status: 'sent'
          }

          // 处理文件消息
          if (eventContent?.msgtype === 'm.image' || eventContent?.msgtype === 'm.file') {
            const isImage = eventContent.msgtype === 'm.image'
            const fileUrl = eventContent.url ? matrixClient.value?.mxcUrlToHttp(eventContent.url) : null

            if (fileUrl) {
              message.fileInfo = {
                name: eventContent.filename || eventContent.body || 'Unknown file',
                size: eventContent.info?.size || 0,
                type: eventContent.info?.mimetype || 'application/octet-stream',
                url: fileUrl,
                isImage
              }

              message.content = `${isImage ? '🖼️' : '📎'} ${message.fileInfo.name}`
              if (message.fileInfo.size > 0) {
                message.content += ` (${formatFileSize(message.fileInfo.size)})`
              }
            }
          }

          return message
        })
        .slice(-limit)

      messages.set(roomId, roomMessages)
      
      // 异步保存到缓存
      cacheManager.saveMessages(roomId, roomMessages)
      
      console.log(`✅ 房间 ${roomId} 消息加载完成，共 ${roomMessages.length} 条`)
      return roomMessages

    } catch (err: any) {
      const errorMessage = MatrixErrorHandler.handle(err, '获取消息')
      error.value = errorMessage
      console.error('❌ 获取消息失败:', err)
      messages.set(roomId, [])
      return []
    }
  }

  // 发送消息
  const sendMatrixMessage = async (roomId: string, content: string) => {
    try {
      if (!currentUser.value) {
        throw new Error('用户未登录')
      }

      // 特殊处理文件传输助手
      if (roomId === FILE_TRANSFER_ROOM_ID) {
        const newMessage: MatrixMessage = {
          id: 'msg-' + Date.now(),
          roomId,
          content,
          sender: currentUser.value.id,
          senderName: currentUser.value.displayName || currentUser.value.username,
          timestamp: Date.now(),
          type: 'm.room.message'
        }

        const currentMessages = messages.get(roomId) || []
        messages.set(roomId, [...currentMessages, newMessage])
        
        // 异步保存
        cacheManager.saveMessages(roomId, [...currentMessages, newMessage])
        
        console.log('✅ 文件传输助手消息已保存')
        return newMessage
      }

      if (!matrixClient.value) {
        throw new Error('Matrix客户端未初始化')
      }

      console.log(`📤 发送消息到房间 ${roomId}`)

      // 发送消息
      const response = await matrixClient.value.sendTextMessage(roomId, content)
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
        status: 'sent'
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

  // 登出
  const logout = async () => {
    await cleanupMatrixClient()
    
    // 清除状态
    connection.value = {
      connected: false,
      homeserver: 'https://matrix.jianluochat.com',
      syncState: { isActive: false }
    }
    currentUser.value = null
    clientInitializing.value = false
    
    // 清除存储
    localStorage.removeItem('matrix-login-info')
    localStorage.removeItem('matrix_access_token')
    
    // 清除缓存
    await cacheManager.clearCache()
    
    console.log('✅ Matrix登出完成')
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
    const room = roomId === 'world' ? worldChannel.value : rooms.find(r => r.id === roomId)
    if (room) {
      room.unreadCount = 0
    }
  }

  const clearError = () => {
    error.value = null
  }

  // ==================== 返回接口 ====================
  
  return {
    // 状态
    connection,
    currentUser,
    rooms,
    worldChannel,
    currentRoomId,
    messages,
    loading,
    error,
    clientInitializing,
    matrixClient,

    // 计算属性
    currentRoom,
    currentMessages,
    sortedRooms,
    totalUnreadCount,
    isConnected,
    isLoggedIn,
    homeserver,
    syncStatus,

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

    // 工具方法
    formatFileSize,
    retryWithBackoff
  }
})