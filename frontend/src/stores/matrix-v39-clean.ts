import { defineStore } from 'pinia'
import { ref, computed, shallowRef, shallowReactive, readonly } from 'vue'

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
  lastMessage?: MatrixMessage
  unreadCount: number
  encrypted: boolean
  avatarUrl?: string
  updatedAt: number
}

interface MatrixUser {
  id: string
  username: string
  displayName?: string
  avatarUrl?: string
}

interface ConnectionState {
  connected: boolean
  homeserver: string
  userId?: string
  accessToken?: string
  deviceId?: string
  syncState: SyncStateInfo
  cryptoReady: boolean
}

interface SyncStateInfo {
  state: string
  isActive: boolean
  lastSync?: number
  syncError?: string
  nextBatch?: string
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

// ==================== 客户端管理 ====================

class MatrixClientManager {
  static async createClient(userId: string, accessToken: string, homeserver: string) {
    try {
      console.log(`🚀 创建 Matrix 客户端: ${userId} @ ${homeserver}`)
      
      // 动态导入 Matrix SDK
      const sdk = await import('matrix-js-sdk')
      
      // 生成设备ID
      const deviceIdKey = `jianluochat-device-id-${userId.split(':')[0].substring(1)}`
      let deviceId = localStorage.getItem(deviceIdKey)
      
      if (!deviceId) {
        deviceId = generateDeviceId(userId)
        localStorage.setItem(deviceIdKey, deviceId)
        console.log('🆔 生成新的设备ID:', deviceId)
      }

      // 创建存储
      const { store, cryptoStore } = await this.createStores(userId, sdk)

      // 创建客户端配置
      const clientConfig = {
        baseUrl: homeserver.startsWith('http') ? homeserver : `https://${homeserver}`,
        accessToken: accessToken,
        userId: userId,
        deviceId: deviceId,
        store: store,
        cryptoStore: cryptoStore,
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

  static async createStores(userId: string, sdk: any) {
    try {
      // 尝试创建 IndexedDB 存储
      const store = new sdk.IndexedDBStore({
        indexedDB: globalThis.indexedDB,
        dbName: `jianluochat-matrix-store-${userId}`,
        localStorage: globalThis.localStorage
      })

      let cryptoStore
      try {
        cryptoStore = new sdk.IndexedDBCryptoStore(
          globalThis.indexedDB,
          `jianluochat-matrix-crypto-${userId}`
        )
      } catch {
        // 回退到 LocalStorage 加密存储
        cryptoStore = new sdk.LocalStorageCryptoStore(globalThis.localStorage)
      }

      // 启动存储
      await store.startup()
      if (cryptoStore.startup) {
        await cryptoStore.startup()
      }

      console.log('✅ 存储初始化成功')
      return { store, cryptoStore }
    } catch (error) {
      console.warn('⚠️ IndexedDB 不可用，使用内存存储:', error)
      
      // 回退到内存存储
      const store = new sdk.MemoryStore({
        localStorage: globalThis.localStorage
      })
      
      const cryptoStore = new sdk.MemoryCryptoStore()
      
      return { store, cryptoStore }
    }
  }

  static async initializeCrypto(client: any): Promise<boolean> {
    try {
      console.log('🔐 初始化加密引擎...')

      // 检查浏览器支持
      if (!window.WebAssembly) {
        console.warn('浏览器不支持 WebAssembly，跳过加密')
        return false
      }

      // 检查客户端是否支持加密
      if (typeof client.initRustCrypto !== 'function') {
        console.warn('客户端不支持 Rust 加密，跳过加密')
        return false
      }

      // 初始化 Rust 加密引擎
      await retryWithBackoff(async () => {
        await client.initRustCrypto({
          useIndexedDB: true,
          storagePrefix: 'jianluochat-crypto'
        })
      }, 3, 2000)

      console.log('✅ Rust 加密引擎初始化成功')

      // 等待加密准备就绪
      const crypto = client.getCrypto()
      if (crypto) {
        console.log('✅ 加密 API 可用')
        return true
      }

      return false
    } catch (error: any) {
      console.error('❌ 加密初始化失败:', error)
      console.warn('⚠️ 将以非加密模式继续运行')
      return false
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
        
        const crypto = client.getCrypto?.()
        if (crypto && crypto.stop) {
          await crypto.stop()
        }
        
        console.log('✅ Matrix 客户端清理完成')
      } catch (error) {
        console.warn('清理 Matrix 客户端时出错:', error)
      }
    }
  }
}

// ==================== Store 定义 ====================

export const useMatrixV39Store = defineStore('matrix-v39-clean', () => {
  // 状态管理
  const matrixClient = shallowRef<any>(null)
  const connection = shallowRef<ConnectionState>({
    connected: false,
    homeserver: 'https://matrix.jianluochat.com',
    syncState: { 
      state: 'STOPPED',
      isActive: false
    },
    cryptoReady: false
  })
  
  const rooms = shallowReactive<MatrixRoom[]>([])
  const spaces = shallowReactive<MatrixRoom[]>([])
  const directMessages = shallowReactive<MatrixRoom[]>([])
  const messages = shallowReactive(new Map<string, MatrixMessage[]>())
  
  const currentUser = shallowRef<MatrixUser | null>(null)
  const currentRoomId = ref<string | null>(null)
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

  const isConnected = computed(() => connection.value.connected)
  const isLoggedIn = computed(() => connection.value.connected && connection.value.userId)
  const isSyncing = computed(() => connection.value.syncState.isActive)
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

  const updateRoomsFromClient = (client: any) => {
    try {
      console.log('🔄 从客户端更新房间列表...')
      
      const clientRooms = client.getRooms()
      const convertedRooms: MatrixRoom[] = []
      const convertedSpaces: MatrixRoom[] = []
      const convertedDMs: MatrixRoom[] = []

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
            memberCount: room.getJoinedMemberCount() || 0,
            unreadCount: room.getUnreadNotificationCount() || 0,
            encrypted: room.hasEncryptionStateEvent(),
            avatarUrl: room.getAvatarUrl?.(client.baseUrl, 96, 96, 'scale'),
            updatedAt: Date.now()
          }

          // 分类房间
          if (isSpace) {
            convertedSpaces.push(matrixRoom)
          } else if (isDirect) {
            convertedDMs.push(matrixRoom)
          } else {
            convertedRooms.push(matrixRoom)
          }

        } catch (roomError) {
          console.warn(`处理房间 ${room.roomId} 失败:`, roomError)
        }
      })

      // 更新状态
      rooms.splice(0, rooms.length, ...convertedRooms)
      spaces.splice(0, spaces.length, ...convertedSpaces)
      directMessages.splice(0, directMessages.length, ...convertedDMs)

      console.log(`✅ 房间列表更新完成: ${convertedRooms.length} 房间, ${convertedSpaces.length} 空间, ${convertedDMs.length} 私聊`)

    } catch (error) {
      console.error('❌ 更新房间列表失败:', error)
    }
  }

  // 事件处理器
  const setupEventListeners = (client: any) => {
    console.log('🎧 设置事件监听器...')

    // 同步事件
    const handleSync = throttle((state: string, prevState: string | null, data: any) => {
      console.log(`🔄 同步状态: ${prevState} -> ${state}`)
      
      connection.value.syncState = {
        state,
        isActive: state === 'SYNCING' || state === 'CATCHUP',
        lastSync: Date.now(),
        nextBatch: data?.response?.next_batch || connection.value.syncState.nextBatch
      }

      if (state === 'PREPARED' || state === 'SYNCING') {
        setTimeout(() => {
          if (matrixClient.value) {
            updateRoomsFromClient(matrixClient.value)
          }
        }, 100)
      } else if (state === 'ERROR') {
        console.error('❌ 同步错误:', data?.error)
        connection.value.syncState.syncError = data?.error?.message || 'Unknown sync error'
      }
    }, 500)

    const handleNewRoom = throttle((room: any) => {
      console.log('🏠 新房间:', room.roomId, room.name)
      setTimeout(() => {
        if (matrixClient.value) {
          updateRoomsFromClient(matrixClient.value)
        }
      }, 100)
    }, 200)

    const handleRoomTimeline = throttle((event: any, room: any, toStartOfTimeline: boolean) => {
      if (toStartOfTimeline) return
      
      try {
        if (event.getType() === 'm.room.message') {
          const message = convertEventToMessage(event, room)
          if (message) {
            addMessageToRoom(room.roomId, message)
          }
        }
      } catch (error) {
        console.error('处理时间线事件失败:', error)
      }
    }, 50)

    const handleClientError = (error: any) => {
      console.error('❌ 客户端错误:', error)
      error.value = MatrixErrorHandler.handle(error, 'Matrix 客户端')
    }

    client.on('sync', handleSync)
    client.on('Room', handleNewRoom)
    client.on('Room.timeline', handleRoomTimeline)
    client.on('error', handleClientError)

    console.log('✅ 事件监听器设置完成')
  }

  // 主要功能函数
  const initializeMatrix = async (): Promise<boolean> => {
    if (clientInitializing.value) {
      console.log('⚠️ Matrix 正在初始化中，跳过重复初始化')
      return false
    }

    try {
      clientInitializing.value = true
      console.log('🚀 初始化 Matrix SDK v39.0.0...')

      // 尝试恢复登录状态
      const savedLoginInfo = localStorage.getItem('matrix-v39-login-info')
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
              loginData.homeserver
            )
            
            // 初始化加密
            const cryptoEnabled = await MatrixClientManager.initializeCrypto(client)
            connection.value.cryptoReady = cryptoEnabled
            
            // 设置事件监听器
            setupEventListeners(client)
            
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
              displayName: loginData.displayName || loginData.userId.split(':')[0].substring(1)
            }
            
            // 启动客户端
            console.log('🚀 启动 Matrix 客户端...')
            await client.startClient({
              initialSyncLimit: 50,
              lazyLoadMembers: true
            })
            
            console.log('✅ Matrix 登录状态恢复成功')
            return true
            
          } catch (clientError) {
            console.error('❌ 恢复客户端失败:', clientError)
            localStorage.removeItem('matrix-v39-login-info')
            return false
          }
        } else {
          console.log('🕐 登录信息已过期，需要重新登录')
          localStorage.removeItem('matrix-v39-login-info')
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
        initial_device_display_name: 'JianLuo Chat Web'
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
      localStorage.setItem('matrix-v39-login-info', JSON.stringify(loginData))

      // 创建正式客户端
      const client = await MatrixClientManager.createClient(userId, accessToken, serverUrl)
      
      // 初始化加密
      const cryptoEnabled = await MatrixClientManager.initializeCrypto(client)
      connection.value.cryptoReady = cryptoEnabled
      
      // 设置事件监听器
      setupEventListeners(client)
      
      // 设置客户端
      matrixClient.value = client
      
      // 更新连接状态
      connection.value = {
        ...connection.value,
        connected: true,
        homeserver: serverUrl,
        userId,
        accessToken,
        deviceId,
        cryptoReady: cryptoEnabled
      }
      
      // 设置当前用户
      currentUser.value = {
        id: userId,
        username,
        displayName: username
      }
      
      // 启动客户端
      console.log('🚀 启动 Matrix 客户端...')
      await client.startClient({
        initialSyncLimit: 50,
        lazyLoadMembers: true
      })

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
        await new Promise(resolve => setTimeout(resolve, 2000))
      }

      // 从客户端更新房间
      updateRoomsFromClient(matrixClient.value)
      
      console.log(`✅ 房间列表获取完成: ${rooms.length} 房间, ${spaces.length} 空间, ${directMessages.length} 私聊`)
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

  const fetchMatrixMessages = async (roomId: string, limit = 200) => {
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
      if (events.length < Math.min(limit, 100)) {
        try {
          console.log('📜 加载历史消息...')
          await matrixClient.value.scrollback(room, Math.min(limit, 500))
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
      addMessageToRoom(roomId, newMessage)

      return newMessage

    } catch (err: any) {
      const errorMessage = MatrixErrorHandler.handle(err, '发送消息')
      error.value = errorMessage
      console.error('❌ 发送消息失败:', err)
      throw new Error(errorMessage)
    }
  }

  const sendFileMessage = async (roomId: string, file: File) => {
    try {
      if (!matrixClient.value) {
        throw new Error('Matrix 客户端未初始化')
      }

      console.log(`📎 发送文件到房间 ${roomId}:`, file.name)

      // 上传文件
      const uploadResponse = await matrixClient.value.uploadContent(file, {
        name: file.name,
        type: file.type,
        rawResponse: false,
        onlyContentUri: false
      })

      console.log('✅ 文件上传成功:', uploadResponse)

      // 确定消息类型
      let msgtype = 'm.file'
      if (file.type.startsWith('image/')) {
        msgtype = 'm.image'
      } else if (file.type.startsWith('video/')) {
        msgtype = 'm.video'
      } else if (file.type.startsWith('audio/')) {
        msgtype = 'm.audio'
      }

      // 构建文件消息内容
      const messageContent = {
        msgtype,
        body: file.name,
        filename: file.name,
        info: {
          size: file.size,
          mimetype: file.type
        },
        url: uploadResponse.content_uri
      }

      // 发送文件消息
      const response = await matrixClient.value.sendEvent(roomId, 'm.room.message', messageContent)
      console.log('✅ 文件消息发送成功:', response)

      return response

    } catch (err: any) {
      const errorMessage = MatrixErrorHandler.handle(err, '发送文件')
      error.value = errorMessage
      console.error('❌ 发送文件失败:', err)
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
          isActive: false
        },
        cryptoReady: false
      }
      
      currentUser.value = null
      clientInitializing.value = false
      
      // 清空数据
      rooms.splice(0, rooms.length)
      spaces.splice(0, spaces.length)
      directMessages.splice(0, directMessages.length)
      messages.clear()
      
      // 清除存储
      localStorage.removeItem('matrix-v39-login-info')
      
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
    loading: readonly(loading),
    error: readonly(error),
    clientInitializing: readonly(clientInitializing),
    matrixClient: readonly(matrixClient),

    // 计算属性
    currentRoom,
    currentMessages,
    sortedRooms,
    totalUnreadCount,
    isConnected,
    isLoggedIn,
    isSyncing,
    homeserver,

    // 主要方法
    initializeMatrix,
    matrixLogin,
    fetchMatrixRooms,
    fetchMatrixMessages,
    sendMatrixMessage,
    sendFileMessage,
    logout,

    // 辅助方法
    setCurrentRoom,
    markRoomAsRead,
    clearError,

    // 工具方法
    formatFileSize,
    retryWithBackoff,
    generateDeviceId
  }
})

// 导出客户端管理器供外部使用
export { MatrixClientManager }