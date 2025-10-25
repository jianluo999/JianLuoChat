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

// ==================== 加密管理 ====================

class MatrixCryptoManager {
  static async clearCryptoStores(userId: string): Promise<void> {
    try {
      console.log('🧹 清理加密存储...')
      
      // 清理 IndexedDB 中的加密数据
      const dbNames = [
        `jianluochat-matrix-v39-crypto-${userId}`,
        `matrix-js-sdk::matrix-sdk-crypto`,
        `matrix-js-sdk::crypto`
      ]
      
      for (const dbName of dbNames) {
        try {
          const deleteReq = indexedDB.deleteDatabase(dbName)
          await new Promise((resolve, reject) => {
            deleteReq.onsuccess = () => resolve(undefined)
            deleteReq.onerror = () => reject(deleteReq.error)
            deleteReq.onblocked = () => {
              console.warn(`数据库 ${dbName} 删除被阻塞`)
              resolve(undefined)
            }
          })
          console.log(`✅ 已清理数据库: ${dbName}`)
        } catch (error) {
          console.warn(`清理数据库 ${dbName} 失败:`, error)
        }
      }
      
      // 清理 localStorage 中的相关数据
      const keysToRemove = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && (key.includes('crypto') || key.includes('olm') || key.includes('matrix-sdk'))) {
          keysToRemove.push(key)
        }
      }
      
      keysToRemove.forEach(key => {
        localStorage.removeItem(key)
        console.log(`✅ 已清理 localStorage: ${key}`)
      })
      
    } catch (error) {
      console.warn('清理加密存储时出错:', error)
    }
  }

  static async initializeCrypto(client: any): Promise<boolean> {
    try {
      console.log('🔐 初始化 Rust 加密引擎...')

      // 检查浏览器支持
      if (!window.WebAssembly) {
        console.warn('浏览器不支持 WebAssembly，跳过加密')
        return false
      }

      // 检查客户端是否支持加密
      if (typeof client.initRustCrypto !== 'function') {
        console.warn('客户端不支持 Rust 加密，尝试传统加密')
        
        // 尝试传统加密初始化
        if (typeof client.initCrypto === 'function') {
          try {
            await client.initCrypto()
            console.log('✅ 传统加密引擎初始化成功')
            return true
          } catch (legacyError) {
            console.warn('传统加密也失败，跳过加密:', legacyError)
            return false
          }
        }
        return false
      }

      // 初始化 Rust 加密引擎，使用更宽松的配置
      try {
        await client.initRustCrypto({
          useIndexedDB: true,
          storagePrefix: 'jianluochat-crypto-v39',
          // 添加更多容错配置
          pickleKey: undefined, // 让SDK自动生成
          setupEncryptionOnLogin: false // 不在登录时强制设置加密
        })
        
        console.log('✅ Rust 加密引擎初始化成功')

        // 等待加密准备就绪，但不阻塞太久
        const crypto = client.getCrypto()
        if (crypto) {
          console.log('✅ 加密 API 可用')
          return true
        }

        console.warn('⚠️ 加密 API 不可用，但初始化成功')
        return false
        
      } catch (rustError) {
        console.warn('🔄 Rust 加密初始化失败，尝试清理并重试:', rustError)
        
        // 如果是设备ID不匹配错误，清理加密存储并重试
        if (rustError instanceof Error && rustError.message && rustError.message.includes("doesn't match the account")) {
          console.log('🧹 检测到设备ID不匹配，清理加密存储...')
          await this.clearCryptoStores(client.getUserId())
          
          // 重试初始化
          try {
            await client.initRustCrypto({
              useIndexedDB: true,
              storagePrefix: 'jianluochat-crypto-v39',
              pickleKey: undefined,
              setupEncryptionOnLogin: false
            })
            console.log('✅ 清理后 Rust 加密引擎初始化成功')
            return true
          } catch (retryError) {
            console.warn('🔄 重试后仍然失败，尝试传统加密:', retryError)
          }
        }
        
        // 回退到传统加密
        if (typeof client.initCrypto === 'function') {
          try {
            await client.initCrypto()
            console.log('✅ 传统加密引擎初始化成功')
            return true
          } catch (legacyError) {
            console.warn('传统加密也失败:', legacyError)
            return false
          }
        }
        
        throw rustError
      }

    } catch (error: any) {
      console.error('❌ 加密初始化完全失败:', error)
      console.warn('⚠️ 将以非加密模式继续运行')
      return false
    }
  }

  static async updateCryptoStatus(client: any): Promise<CryptoStatus> {
    try {
      const crypto = client.getCrypto()
      if (!crypto) {
        return {
          ready: false,
          crossSigningReady: false,
          keyBackupEnabled: false,
          secretStorageReady: false,
          deviceVerified: false,
          roomKeysBackedUp: 0,
          totalRoomKeys: 0
        }
      }

      const crossSigningInfo = await crypto.getCrossSigningStatus?.() || {}
      const keyBackupInfo = await crypto.getActiveSessionBackupVersion?.() || null
      const deviceInfo = await crypto.getOwnDeviceInfo?.() || {}

      return {
        ready: crypto.isReady?.() || false,
        crossSigningReady: crossSigningInfo.publicKeysOnDevice && crossSigningInfo.privateKeysInSecretStorage,
        keyBackupEnabled: !!keyBackupInfo,
        secretStorageReady: await crypto.isSecretStorageReady?.() || false,
        deviceVerified: deviceInfo?.verified || false,
        roomKeysBackedUp: 0, // TODO: 实现统计
        totalRoomKeys: 0 // TODO: 实现统计
      }
    } catch (error) {
      console.warn('更新加密状态失败:', error)
      return {
        ready: false,
        crossSigningReady: false,
        keyBackupEnabled: false,
        secretStorageReady: false,
        deviceVerified: false,
        roomKeysBackedUp: 0,
        totalRoomKeys: 0
      }
    }
  }

  static async setupCrossSigningIfNeeded(client: any, password?: string): Promise<boolean> {
    try {
      const crypto = client.getCrypto()
      if (!crypto) return false

      const status = await crypto.getCrossSigningStatus?.() || {}
      if (status.publicKeysOnDevice && status.privateKeysInSecretStorage) {
        console.log('✅ 交叉签名已设置')
        return true
      }

      console.log('🔧 设置交叉签名...')
      
      // 设置交叉签名
      await crypto.bootstrapCrossSigning?.({
        authUploadDeviceSigningKeys: async (makeRequest: any) => {
          // 如果需要密码认证
          if (password) {
            return makeRequest({
              type: 'm.login.password',
              identifier: {
                type: 'm.id.user',
                user: client.getUserId()!
              },
              password: password
            })
          }
          return makeRequest({})
        }
      })

      console.log('✅ 交叉签名设置完成')
      return true

    } catch (error) {
      console.error('❌ 设置交叉签名失败:', error)
      return false
    }
  }

  static async setupKeyBackupIfNeeded(client: any): Promise<boolean> {
    try {
      const crypto = client.getCrypto()
      if (!crypto) return false

      const backupInfo = await crypto.getActiveSessionBackupVersion?.() || null
      if (backupInfo) {
        console.log('✅ 密钥备份已启用')
        return true
      }

      console.log('🔧 设置密钥备份...')
      
      // 创建密钥备份
      await crypto.createKeyBackupVersion?.()
      console.log('✅ 密钥备份设置完成')
      
      return true

    } catch (error) {
      console.error('❌ 设置密钥备份失败:', error)
      return false
    }
  }
}

// ==================== 自动重连管理 ====================

class MatrixReconnectionManager {
  private static reconnectTimer: any = null
  private static maxReconnectAttempts = 10
  private static baseReconnectDelay = 1000

  static startReconnection(client: any, syncState: any) {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
    }

    const attempts = syncState.reconnectAttempts || 0
    if (attempts >= this.maxReconnectAttempts) {
      console.error('❌ 达到最大重连次数，停止重连')
      return
    }

    const delay = Math.min(
      this.baseReconnectDelay * Math.pow(2, attempts),
      30000 // 最大 30 秒
    )

    console.log(`🔄 ${delay}ms 后尝试重连 (${attempts + 1}/${this.maxReconnectAttempts})`)

    this.reconnectTimer = setTimeout(async () => {
      try {
        syncState.reconnectAttempts = attempts + 1
        syncState.lastReconnectAttempt = Date.now()

        console.log('🔄 尝试重新启动客户端...')
        await client.startClient({
          initialSyncLimit: 20,
          lazyLoadMembers: true
        })

        console.log('✅ 客户端重启成功')
        syncState.reconnectAttempts = 0
      } catch (error) {
        console.error('❌ 重连失败:', error)
        this.startReconnection(client, syncState)
      }
    }, delay)
  }

  static stopReconnection() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
  }

  static resetReconnectionState(syncState: any) {
    syncState.reconnectAttempts = 0
    syncState.lastReconnectAttempt = undefined
    this.stopReconnection()
  }
}

// ==================== 智能存储管理 ====================

class MatrixStorageManager {
  private static dbName = 'jianluochat-matrix-v39'
  private static version = 3

  static async createAdvancedStores(userId: string, sdk: any) {
    try {
      // 尝试创建 IndexedDB 存储
      const store = new sdk.IndexedDBStore({
        indexedDB: globalThis.indexedDB,
        dbName: `${this.dbName}-store-${userId}`,
        localStorage: globalThis.localStorage,
        workerScript: null // 禁用 worker 以避免兼容性问题
      })

      let cryptoStore
      try {
        cryptoStore = new sdk.IndexedDBCryptoStore(
          globalThis.indexedDB,
          `${this.dbName}-crypto-${userId}`
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

      console.log('✅ 高级存储初始化成功')
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

  static async clearUserData(userId: string) {
    try {
      const storeDbName = `${this.dbName}-store-${userId}`
      const cryptoDbName = `${this.dbName}-crypto-${userId}`
      
      // 删除数据库
      await new Promise<void>((resolve, reject) => {
        const deleteStore = indexedDB.deleteDatabase(storeDbName)
        deleteStore.onsuccess = () => resolve()
        deleteStore.onerror = () => reject(deleteStore.error)
      })
      
      await new Promise<void>((resolve, reject) => {
        const deleteCrypto = indexedDB.deleteDatabase(cryptoDbName)
        deleteCrypto.onsuccess = () => resolve()
        deleteCrypto.onerror = () => reject(deleteCrypto.error)
      })
      
      // 清理 localStorage
      const keys = Object.keys(localStorage)
      keys.forEach(key => {
        if (key.includes(userId) || key.includes('matrix-v39')) {
          localStorage.removeItem(key)
        }
      })
      
      console.log('🧹 用户数据清理完成')
    } catch (error) {
      console.warn('清理用户数据失败:', error)
    }
  }
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
        deviceId = localStorage.getItem(deviceIdKey) || undefined
        
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

      // 创建高级存储
      const { store, cryptoStore } = await MatrixStorageManager.createAdvancedStores(userId, sdk)

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

  static async initializeCrypto(client: any): Promise<boolean> {
    return await MatrixCryptoManager.initializeCrypto(client)
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

  // 新功能状态
  const threads = shallowReactive(new Map<string, MatrixMessage[]>())
  const reactions = shallowReactive(new Map<string, Record<string, MessageReaction>>())
  const typing = shallowReactive(new Map<string, string[]>())
  const presence = shallowReactive(new Map<string, PresenceInfo>())
  const voipCalls = shallowReactive(new Map<string, any>())
  const widgets = shallowReactive(new Map<string, any>())

  // 加密和性能状态
  const cryptoStatus = shallowRef<CryptoStatus>({
    ready: false,
    crossSigningReady: false,
    keyBackupEnabled: false,
    secretStorageReady: false,
    deviceVerified: false,
    roomKeysBackedUp: 0,
    totalRoomKeys: 0
  })

  const performanceMetrics = shallowRef<PerformanceMetrics>({
    syncDuration: 0,
    messageProcessingTime: 0,
    encryptionTime: 0,
    decryptionTime: 0,
    memoryUsage: 0,
    networkLatency: 0,
    roomsLoaded: 0,
    messagesLoaded: 0
  })

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
    currentThreadId.value ? threads.get(currentThreadId.value) || [] : []
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

  // 加密相关计算属性
  const encryptionReady = computed(() => cryptoStatus.value.ready)
  const crossSigningReady = computed(() => cryptoStatus.value.crossSigningReady)
  const keyBackupReady = computed(() => cryptoStatus.value.keyBackupEnabled)
  const deviceVerified = computed(() => cryptoStatus.value.deviceVerified)

  // 功能支持计算属性
  const supportsThreads = computed(() => connection.value.threadsSupported)
  const supportsSpaces = computed(() => connection.value.spacesSupported)
  const supportsVoip = computed(() => connection.value.voipSupported)
  const supportsSlidingSync = computed(() => connection.value.slidingSyncSupported)

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
          const powerLevelsEvent = room.currentState?.getStateEvents('m.room.power_levels', '')
          const powerLevels = powerLevelsEvent?.getContent() || {}

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
              users: powerLevels.users || {},
              usersDefault: powerLevels.users_default || 0,
              events: powerLevels.events || {},
              eventsDefault: powerLevels.events_default || 0,
              stateDefault: powerLevels.state_default || 50,
              ban: powerLevels.ban || 50,
              kick: powerLevels.kick || 50,
              redact: powerLevels.redact || 50,
              invite: powerLevels.invite || 50,
              notifications: {
                room: powerLevels.notifications?.room || 50
              }
            },
            joinRule: joinRule || 'invite',
            historyVisibility: room.getHistoryVisibility() || 'shared',
            guestAccess: room.getGuestAccess() || 'can_join',
            tags: room.tags || {},
            accountData: {},
            summary: room.summary ? {
              heroes: room.summary.heroes || [],
              joinedMemberCount: room.summary.joinedMemberCount || 0,
              invitedMemberCount: room.summary.invitedMemberCount || 0
            } : undefined,
            typing: [],
            receipts: {},
            presence: {},
            childRooms: [],
            parentSpaces: [],
            updatedAt: Date.now(),
            createdAt: (() => {
              try {
                return room.getCreatedAt?.() || Date.now()
              } catch (e) {
                return Date.now()
              }
            })()
          }

          // 获取房间成员
          const members = room.getJoinedMembers()
          matrixRoom.members = members.map((member: any) => ({
            userId: member.userId,
            displayName: member.name,
            avatarUrl: member.getAvatarUrl?.(client.baseUrl, 32, 32, 'scale'),
            membership: member.membership,
            powerLevel: powerLevels.users?.[member.userId] || powerLevels.users_default || 0,
            presence: presence.get(member.userId)?.presence
          }))

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

      // 更新性能指标
      MatrixPerformanceManager.updateCounts(
        convertedRooms.length + convertedSpaces.length + convertedDMs.length,
        Array.from(messages.values()).reduce((total, msgs) => total + msgs.length, 0)
      )

      console.log(`✅ 房间列表更新完成: ${convertedRooms.length} 房间, ${convertedSpaces.length} 空间, ${convertedDMs.length} 私聊`)
      
      // 如果房间列表仍然为空，尝试强制刷新
      if (convertedRooms.length === 0 && convertedSpaces.length === 0 && convertedDMs.length === 0) {
        console.warn('⚠️ 房间列表为空，可能需要等待同步完成')
      }

    } catch (error) {
      console.error('❌ 更新房间列表失败:', error)
    }
  }

  // 新增辅助函数
  const updateRoomMember = (roomId: string, member: RoomMember) => {
    const allRooms = [...rooms, ...spaces, ...directMessages]
    const room = allRooms.find(r => r.id === roomId)
    if (room) {
      const existingIndex = room.members.findIndex(m => m.userId === member.userId)
      if (existingIndex >= 0) {
        room.members[existingIndex] = { ...room.members[existingIndex], ...member }
      } else {
        room.members.push(member)
      }
      room.updatedAt = Date.now()
    }
  }

  const updateRoomReceipt = (roomId: string, receipt: Receipt) => {
    const allRooms = [...rooms, ...spaces, ...directMessages]
    const room = allRooms.find(r => r.id === roomId)
    if (room) {
      if (!room.receipts[receipt.eventId]) {
        room.receipts[receipt.eventId] = []
      }
      
      const existingIndex = room.receipts[receipt.eventId].findIndex(r => r.userId === receipt.userId)
      if (existingIndex >= 0) {
        room.receipts[receipt.eventId][existingIndex] = receipt
      } else {
        room.receipts[receipt.eventId].push(receipt)
      }
    }
  }

  // 事件处理器
  const setupEventListeners = (client: any) => {
    console.log('🎧 设置高级事件监听器...')

    // 同步事件 - 增强版
    const handleSync = throttle((state: string, prevState: string | null, data: any) => {
      const endTimer = MatrixPerformanceManager.startTimer('sync')
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
        // 重置重连状态
        MatrixReconnectionManager.resetReconnectionState(connection.value.syncState)
        
        // 立即更新房间列表，然后再延迟更新一次确保完整性
        if (matrixClient.value) {
          updateRoomsFromClient(matrixClient.value)
          
          // 延迟更新以确保所有房间都已加载
          setTimeout(() => {
            if (matrixClient.value) {
              updateRoomsFromClient(matrixClient.value)
            }
          }, 500)
        }
      } else if (state === 'ERROR') {
        console.error('❌ 同步错误:', data?.error)
        connection.value.syncState.syncError = data?.error?.message || 'Unknown sync error'
        
        // 启动自动重连
        MatrixReconnectionManager.startReconnection(client, connection.value.syncState)
      } else if (state === 'STOPPED') {
        MatrixReconnectionManager.stopReconnection()
      }

      endTimer()
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
      
      const endTimer = MatrixPerformanceManager.startTimer('messageProcessing')
      
      try {
        const eventType = event.getType()
        
        if (eventType === 'm.room.message') {
          const message = convertEventToMessage(event, room)
          if (message) {
            addMessageToRoom(room.roomId, message)
          }
        } else if (eventType === 'm.reaction') {
          handleReactionEvent(event, room)
        } else if (eventType === 'm.room.member') {
          handleMemberEvent(event, room)
        } else if (eventType === 'm.typing') {
          handleTypingEvent(event, room)
        } else if (eventType === 'm.receipt') {
          handleReceiptEvent(event, room)
        }
      } catch (error) {
        console.error('处理时间线事件失败:', error)
      }

      endTimer()
    }, 50)

    const handleClientError = (error: any) => {
      console.error('❌ 客户端错误:', error)
      error.value = MatrixErrorHandler.handle(error, 'Matrix 客户端')
    }

    // 新增事件处理函数
    const handleReactionEvent = (event: any, room: any) => {
      try {
        const content = event.getContent()
        const relatesTo = content['m.relates_to']
        if (relatesTo?.rel_type === 'm.annotation') {
          const targetEventId = relatesTo.event_id
          const reactionKey = relatesTo.key
          const sender = event.getSender()
          
          if (!reactions.has(targetEventId)) {
            reactions.set(targetEventId, {})
          }
          
          const eventReactions = reactions.get(targetEventId)!
          if (!eventReactions[reactionKey]) {
            eventReactions[reactionKey] = {
              count: 0,
              users: [],
              hasReacted: false,
              key: reactionKey
            }
          }
          
          const reaction = eventReactions[reactionKey]
          if (!reaction.users.includes(sender)) {
            reaction.users.push(sender)
            reaction.count++
            reaction.hasReacted = sender === currentUser.value?.id
          }
        }
      } catch (error) {
        console.error('处理反应事件失败:', error)
      }
    }

    const handleMemberEvent = (event: any, room: any) => {
      try {
        const content = event.getContent()
        const userId = event.getStateKey()
        const membership = content.membership
        
        // 更新房间成员信息
        updateRoomMember(room.roomId, {
          userId,
          displayName: content.displayname,
          avatarUrl: content.avatar_url,
          membership,
          powerLevel: 0 // 需要从 power_levels 事件获取
        })
      } catch (error) {
        console.error('处理成员事件失败:', error)
      }
    }

    const handleTypingEvent = (event: any, room: any) => {
      try {
        const content = event.getContent()
        const typingUsers = content.user_ids || []
        typing.set(room.roomId, typingUsers)
        
        // 更新房间的 typing 状态
        const roomObj = [...rooms, ...spaces, ...directMessages].find(r => r.id === room.roomId)
        if (roomObj) {
          roomObj.typing = typingUsers
        }
      } catch (error) {
        console.error('处理打字事件失败:', error)
      }
    }

    const handleReceiptEvent = (event: any, room: any) => {
      try {
        const content = event.getContent()
        Object.entries(content).forEach(([eventId, receipts]: [string, any]) => {
          Object.entries(receipts).forEach(([receiptType, users]: [string, any]) => {
            Object.entries(users).forEach(([userId, receiptData]: [string, any]) => {
              // 更新已读回执信息
              updateRoomReceipt(room.roomId, {
                userId,
                timestamp: receiptData.ts,
                eventId,
                receiptType
              })
            })
          })
        })
      } catch (error) {
        console.error('处理回执事件失败:', error)
      }
    }

    const handlePresenceEvent = (event: any) => {
      try {
        const content = event.getContent()
        const userId = event.getSender()
        
        presence.set(userId, {
          presence: content.presence,
          lastActiveAgo: content.last_active_ago,
          statusMessage: content.status_msg,
          currentlyActive: content.currently_active
        })
      } catch (error) {
        console.error('处理在线状态事件失败:', error)
      }
    }

    // 绑定所有事件监听器
    client.on('sync', handleSync)
    client.on('Room', handleNewRoom)
    client.on('Room.timeline', handleRoomTimeline)
    client.on('User.presence', handlePresenceEvent)
    client.on('error', handleClientError)

    // 加密事件
    if (client.getCrypto) {
      client.on('crypto.keyBackupStatus', (enabled: boolean) => {
        cryptoStatus.value.keyBackupEnabled = enabled
      })
      
      client.on('crypto.keyBackupFailed', (error: any) => {
        console.error('❌ 密钥备份失败:', error)
      })
    }

    console.log('✅ 高级事件监听器设置完成')
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
              loginData.homeserver,
              loginData.deviceId
            )
            
            // 初始化加密（允许失败）
            let cryptoEnabled = false
            try {
              cryptoEnabled = await MatrixClientManager.initializeCrypto(client)
              connection.value.cryptoReady = cryptoEnabled
              
              // 更新加密状态
              if (cryptoEnabled) {
                cryptoStatus.value = await MatrixCryptoManager.updateCryptoStatus(client)
              }
            } catch (cryptoError) {
              console.warn('⚠️ 加密初始化失败，但继续正常运行:', cryptoError)
              connection.value.cryptoReady = false
            }
            
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
              displayName: loginData.displayName || loginData.userId.split(':')[0].substring(1),
              devices: [],
              crossSigningInfo: {
                trustLevel: 'unknown'
              }
            }
            
            // 启动客户端
            console.log('🚀 启动 Matrix 客户端...')
            await client.startClient({
              initialSyncLimit: 50,
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

      // 检查并清理可能冲突的加密数据
      const userId = `@${username}:${serverUrl.replace('https://', '').replace('http://', '')}`
      const storedDeviceId = localStorage.getItem(`jianluochat-device-id-${username}`)
      
      // 如果存在存储的设备ID，检查是否有加密数据冲突
      if (storedDeviceId) {
        console.log(`🔍 检查设备ID冲突: 存储的设备ID = ${storedDeviceId}`)
        // 预防性清理，避免设备ID不匹配
        await MatrixCryptoManager.clearCryptoStores(userId)
      }

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

      const loggedInUserId = loginResponse.user_id
      const accessToken = loginResponse.access_token
      const deviceId = loginResponse.device_id

      // 保存登录信息
      const loginData = {
        userId: loggedInUserId,
        accessToken,
        deviceId,
        homeserver: serverUrl,
        loginTime: Date.now(),
        displayName: username
      }
      localStorage.setItem('matrix-v39-login-info', JSON.stringify(loginData))

      // 创建正式客户端，使用服务器返回的设备ID
      const client = await MatrixClientManager.createClient(loggedInUserId, accessToken, serverUrl, deviceId)
      
      // 初始化加密（允许失败）
      let cryptoEnabled = false
      try {
        cryptoEnabled = await MatrixClientManager.initializeCrypto(client)
        connection.value.cryptoReady = cryptoEnabled
        
        // 更新加密状态
        if (cryptoEnabled) {
          cryptoStatus.value = await MatrixCryptoManager.updateCryptoStatus(client)
        }
      } catch (cryptoError) {
        console.warn('⚠️ 加密初始化失败，但继续正常运行:', cryptoError)
        connection.value.cryptoReady = false
      }
      
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
        displayName: username,
        devices: [],
        crossSigningInfo: {
          trustLevel: 'unknown'
        }
      }
      
      // 启动客户端
      console.log('🚀 启动 Matrix 客户端...')
      await client.startClient({
        initialSyncLimit: 50,
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
      localStorage.removeItem('matrix-v39-login-info')
      
      // 清理设备ID相关存储
      const keysToRemove = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith('jianluochat-device-id-')) {
          keysToRemove.push(key)
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key))
      
      console.log('✅ Matrix 登出完成')

    } catch (error) {
      console.error('❌ 登出过程中出错:', error)
    }
  }

  const resetClientState = async () => {
    try {
      console.log('🔄 重置客户端状态...')
      
      // 停止当前客户端
      if (matrixClient.value) {
        await MatrixClientManager.cleanup(matrixClient.value)
        matrixClient.value = null
      }
      
      // 清理所有状态
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
      
      // 清理所有存储数据
      const loginInfo = localStorage.getItem('matrix-v39-login-info')
      if (loginInfo) {
        try {
          const parsed = JSON.parse(loginInfo)
          await MatrixCryptoManager.clearCryptoStores(parsed.userId)
        } catch (e) {
          console.warn('解析登录信息失败:', e)
        }
      }
      
      localStorage.removeItem('matrix-v39-login-info')
      localStorage.removeItem('matrix-v39-access-token')
      
      // 清理设备ID和加密相关数据
      const keysToRemove = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && (key.startsWith('jianluochat-') || key.includes('matrix') || key.includes('crypto') || key.includes('olm'))) {
          keysToRemove.push(key)
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key))
      
      console.log('✅ 客户端状态重置完成')
      
    } catch (error) {
      console.error('❌ 重置客户端状态失败:', error)
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

  // ==================== 高级功能方法 ====================
  
  // 加密管理
  const setupCrossSigning = async (password?: string) => {
    try {
      if (!matrixClient.value) {
        throw new Error('Matrix 客户端未初始化')
      }

      console.log('🔐 设置交叉签名...')
      
      const result = await MatrixCryptoManager.setupCrossSigningIfNeeded(matrixClient.value, password)
      if (result) {
        cryptoStatus.value = await MatrixCryptoManager.updateCryptoStatus(matrixClient.value)
      }
      
      return result
    } catch (error) {
      console.error('❌ 设置交叉签名失败:', error)
      return false
    }
  }

  const setupKeyBackup = async () => {
    try {
      if (!matrixClient.value) {
        throw new Error('Matrix 客户端未初始化')
      }

      console.log('🔐 设置密钥备份...')
      
      const result = await MatrixCryptoManager.setupKeyBackupIfNeeded(matrixClient.value)
      if (result) {
        cryptoStatus.value = await MatrixCryptoManager.updateCryptoStatus(matrixClient.value)
      }
      
      return result
    } catch (error) {
      console.error('❌ 设置密钥备份失败:', error)
      return false
    }
  }

  const verifyDevice = async (userId: string, deviceId: string) => {
    try {
      if (!matrixClient.value) {
        throw new Error('Matrix 客户端未初始化')
      }

      const crypto = matrixClient.value.getCrypto()
      if (!crypto) {
        throw new Error('加密功能未启用')
      }

      console.log(`🔐 验证设备: ${userId}/${deviceId}`)
      
      // 获取设备信息
      const device = await crypto.getDeviceInfo?.(userId, deviceId)
      if (!device) {
        throw new Error('设备不存在')
      }

      // 标记设备为已验证
      await crypto.setDeviceVerified?.(userId, deviceId, true)
      
      console.log('✅ 设备验证成功')
      cryptoStatus.value = await MatrixCryptoManager.updateCryptoStatus(matrixClient.value)
      
      return true
    } catch (error) {
      console.error('❌ 设备验证失败:', error)
      return false
    }
  }

  // 线程功能
  const sendThreadReply = async (roomId: string, rootEventId: string, content: string) => {
    try {
      if (!matrixClient.value) {
        throw new Error('Matrix 客户端未初始化')
      }

      console.log(`💬 发送线程回复: ${roomId}/${rootEventId}`)

      const messageContent = {
        msgtype: 'm.text',
        body: content,
        'm.relates_to': {
          event_id: rootEventId,
          rel_type: 'm.thread'
        }
      }

      const response = await matrixClient.value.sendEvent(roomId, 'm.room.message', messageContent)
      console.log('✅ 线程回复发送成功:', response)

      return response
    } catch (error) {
      console.error('❌ 发送线程回复失败:', error)
      throw error
    }
  }

  const fetchThreadMessages = async (roomId: string, rootEventId: string) => {
    try {
      if (!matrixClient.value) {
        throw new Error('Matrix 客户端未初始化')
      }

      console.log(`🧵 获取线程消息: ${roomId}/${rootEventId}`)

      const room = matrixClient.value.getRoom(roomId)
      if (!room) {
        throw new Error('房间不存在')
      }

      // 获取线程事件
      const threadEvents = room.getThreads?.()?.get(rootEventId)?.events || []
      
      const threadMessages = threadEvents
        .filter((event: any) => event.getType() === 'm.room.message')
        .map((event: any) => convertEventToMessage(event, room))
        .filter(Boolean)

      threads.set(rootEventId, threadMessages)
      
      console.log(`✅ 线程消息获取完成: ${threadMessages.length} 条`)
      return threadMessages
    } catch (error) {
      console.error('❌ 获取线程消息失败:', error)
      return []
    }
  }

  // 反应功能
  const addReaction = async (roomId: string, eventId: string, reaction: string) => {
    try {
      if (!matrixClient.value) {
        throw new Error('Matrix 客户端未初始化')
      }

      console.log(`👍 添加反应: ${roomId}/${eventId} -> ${reaction}`)

      const content = {
        'm.relates_to': {
          rel_type: 'm.annotation',
          event_id: eventId,
          key: reaction
        }
      }

      const response = await matrixClient.value.sendEvent(roomId, 'm.reaction', content)
      console.log('✅ 反应添加成功:', response)

      return response
    } catch (error) {
      console.error('❌ 添加反应失败:', error)
      throw error
    }
  }

  const removeReaction = async (roomId: string, eventId: string, reaction: string) => {
    try {
      if (!matrixClient.value) {
        throw new Error('Matrix 客户端未初始化')
      }

      console.log(`👎 移除反应: ${roomId}/${eventId} -> ${reaction}`)

      const room = matrixClient.value.getRoom(roomId)
      if (!room) {
        throw new Error('房间不存在')
      }

      // 查找对应的反应事件
      const relations = room.getUnfilteredTimelineSet?.()?.relations?.getChildEventsForEvent?.(
        eventId, 'm.annotation', 'm.reaction'
      )

      const reactionEvent = relations?.find((event: any) => {
        const content = event.getContent()
        return content['m.relates_to']?.key === reaction && 
               event.getSender() === matrixClient.value.getUserId()
      })

      if (reactionEvent) {
        const response = await matrixClient.value.redactEvent(roomId, reactionEvent.getId())
        console.log('✅ 反应移除成功:', response)
        return response
      } else {
        console.warn('未找到对应的反应事件')
        return null
      }
    } catch (error) {
      console.error('❌ 移除反应失败:', error)
      throw error
    }
  }

  // 消息编辑
  const editMessage = async (roomId: string, eventId: string, newContent: string) => {
    try {
      if (!matrixClient.value) {
        throw new Error('Matrix 客户端未初始化')
      }

      console.log(`✏️ 编辑消息: ${roomId}/${eventId}`)

      const content = {
        msgtype: 'm.text',
        body: `* ${newContent}`,
        'm.new_content': {
          msgtype: 'm.text',
          body: newContent
        },
        'm.relates_to': {
          rel_type: 'm.replace',
          event_id: eventId
        }
      }

      const response = await matrixClient.value.sendEvent(roomId, 'm.room.message', content)
      console.log('✅ 消息编辑成功:', response)

      return response
    } catch (error) {
      console.error('❌ 编辑消息失败:', error)
      throw error
    }
  }

  // 删除消息
  const deleteMessage = async (roomId: string, eventId: string, reason?: string) => {
    try {
      if (!matrixClient.value) {
        throw new Error('Matrix 客户端未初始化')
      }

      console.log(`🗑️ 删除消息: ${roomId}/${eventId}`)

      const response = await matrixClient.value.redactEvent(roomId, eventId, reason)
      console.log('✅ 消息删除成功:', response)

      return response
    } catch (error) {
      console.error('❌ 删除消息失败:', error)
      throw error
    }
  }

  // 空间功能
  const createSpace = async (name: string, topic?: string, isPublic: boolean = false) => {
    try {
      if (!matrixClient.value) {
        throw new Error('Matrix 客户端未初始化')
      }

      console.log('🌌 创建空间:', name)

      const createOptions = {
        name,
        topic,
        visibility: isPublic ? 'public' : 'private',
        preset: isPublic ? 'public_chat' : 'private_chat',
        creation_content: {
          type: 'm.space'
        },
        initial_state: [
          {
            type: 'm.room.history_visibility',
            content: {
              history_visibility: 'world_readable'
            }
          }
        ]
      }

      const response = await matrixClient.value.createRoom(createOptions)
      console.log('✅ 空间创建成功:', response)

      return response
    } catch (error) {
      console.error('❌ 创建空间失败:', error)
      throw error
    }
  }

  const addRoomToSpace = async (spaceId: string, roomId: string) => {
    try {
      if (!matrixClient.value) {
        throw new Error('Matrix 客户端未初始化')
      }

      console.log(`🌌 添加房间到空间: ${roomId} -> ${spaceId}`)

      const content = {
        via: [matrixClient.value.getDomain?.() || 'matrix.org']
      }

      const response = await matrixClient.value.sendStateEvent(
        spaceId, 
        'm.space.child', 
        content, 
        roomId
      )
      
      console.log('✅ 房间添加到空间成功:', response)
      return response
    } catch (error) {
      console.error('❌ 添加房间到空间失败:', error)
      throw error
    }
  }

  // 房间管理
  const createRoom = async (options: {
    name: string
    topic?: string
    isPublic?: boolean
    isDirect?: boolean
    inviteUsers?: string[]
    encrypted?: boolean
  }) => {
    try {
      if (!matrixClient.value) {
        throw new Error('Matrix 客户端未初始化')
      }

      console.log('🏠 创建房间:', options.name)

      const createOptions: any = {
        name: options.name,
        topic: options.topic,
        visibility: options.isPublic ? 'public' : 'private',
        preset: options.isDirect ? 'trusted_private_chat' : 
                options.isPublic ? 'public_chat' : 'private_chat',
        is_direct: options.isDirect || false,
        invite: options.inviteUsers || []
      }

      if (options.encrypted) {
        createOptions.initial_state = [
          {
            type: 'm.room.encryption',
            content: {
              algorithm: 'm.megolm.v1.aes-sha2'
            }
          }
        ]
      }

      const response = await matrixClient.value.createRoom(createOptions)
      console.log('✅ 房间创建成功:', response)

      // 刷新房间列表
      setTimeout(() => {
        updateRoomsFromClient(matrixClient.value)
      }, 1000)

      return response

    } catch (err: any) {
      const errorMessage = MatrixErrorHandler.handle(err, '创建房间')
      error.value = errorMessage
      console.error('❌ 创建房间失败:', err)
      throw new Error(errorMessage)
    }
  }

  const joinRoom = async (roomIdOrAlias: string) => {
    try {
      if (!matrixClient.value) {
        throw new Error('Matrix 客户端未初始化')
      }

      console.log('🚪 加入房间:', roomIdOrAlias)

      const response = await matrixClient.value.joinRoom(roomIdOrAlias)
      console.log('✅ 房间加入成功:', response)

      // 刷新房间列表
      setTimeout(() => {
        updateRoomsFromClient(matrixClient.value)
      }, 1000)

      return response

    } catch (err: any) {
      const errorMessage = MatrixErrorHandler.handle(err, '加入房间')
      error.value = errorMessage
      console.error('❌ 加入房间失败:', err)
      throw new Error(errorMessage)
    }
  }

  const leaveRoom = async (roomId: string) => {
    try {
      if (!matrixClient.value) {
        throw new Error('Matrix 客户端未初始化')
      }

      console.log('🚪 离开房间:', roomId)

      const response = await matrixClient.value.leave(roomId)
      console.log('✅ 房间离开成功:', response)

      // 从本地移除房间
      const roomIndex = rooms.findIndex(r => r.id === roomId)
      if (roomIndex >= 0) rooms.splice(roomIndex, 1)
      
      const spaceIndex = spaces.findIndex(r => r.id === roomId)
      if (spaceIndex >= 0) spaces.splice(spaceIndex, 1)
      
      const dmIndex = directMessages.findIndex(r => r.id === roomId)
      if (dmIndex >= 0) directMessages.splice(dmIndex, 1)
      
      messages.delete(roomId)
      threads.delete(roomId)

      return response

    } catch (err: any) {
      const errorMessage = MatrixErrorHandler.handle(err, '离开房间')
      error.value = errorMessage
      console.error('❌ 离开房间失败:', err)
      throw new Error(errorMessage)
    }
  }

  // 性能和监控
  const getPerformanceMetrics = (): PerformanceMetrics => {
    return MatrixPerformanceManager.getMetrics()
  }

  const logPerformanceReport = () => {
    MatrixPerformanceManager.logPerformanceReport()
  }

  // 辅助方法增强
  const setCurrentRoomEnhanced = (roomId: string | null) => {
    currentRoomId.value = roomId
    
    if (roomId && !messages.has(roomId)) {
      fetchMatrixMessages(roomId)
    }
    
    if (roomId) {
      markRoomAsRead(roomId)
    }
  }

  const setCurrentThreadEnhanced = (threadId: string | null) => {
    currentThreadId.value = threadId
    
    if (threadId && !threads.has(threadId)) {
      const [roomId] = threadId.split('/')
      if (roomId) {
        fetchThreadMessages(roomId, threadId)
      }
    }
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
    threads: readonly(threads),
    reactions: readonly(reactions),
    typing: readonly(typing),
    presence: readonly(presence),
    voipCalls: readonly(voipCalls),
    widgets: readonly(widgets),
    currentRoomId: readonly(currentRoomId),
    currentThreadId: readonly(currentThreadId),
    loading: readonly(loading),
    error: readonly(error),
    clientInitializing: readonly(clientInitializing),
    matrixClient: readonly(matrixClient),
    cryptoStatus: readonly(cryptoStatus),
    performanceMetrics: readonly(performanceMetrics),

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
    encryptionReady,
    crossSigningReady,
    keyBackupReady,
    deviceVerified,
    supportsThreads,
    supportsSpaces,
    supportsVoip,
    supportsSlidingSync,

    // 主要方法
    initializeMatrix,
    matrixLogin,
    fetchMatrixRooms,
    fetchMatrixMessages,
    sendMatrixMessage,
    sendFileMessage,
    logout,
    resetClientState,

    // 高级功能
    setupCrossSigning,
    setupKeyBackup,
    verifyDevice,
    sendThreadReply,
    fetchThreadMessages,
    addReaction,
    removeReaction,
    editMessage,
    deleteMessage,
    createSpace,
    addRoomToSpace,
    createRoom,
    joinRoom,
    leaveRoom,

    // 辅助方法
    setCurrentRoom: setCurrentRoomEnhanced,
    setCurrentThread: setCurrentThreadEnhanced,
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
  MatrixCryptoManager,
  MatrixReconnectionManager,
  MatrixStorageManager,
  MatrixPerformanceManager
}