import { defineStore } from 'pinia'
import { ref, computed, nextTick } from 'vue'
import { matrixAPI, roomAPI } from '@/services/api'

// 房间管理相关方法
const getMatrixRooms = async () => {
  try {
    const response = await roomAPI.getRooms()
    return response.data
  } catch (error) {
    console.error('获取房间列表失败:', error)
    return { success: false, error: '获取房间失败' }
  }
}

const createMatrixRoom = async (roomData: { name: string; type?: string; description?: string }) => {
  try {
    const response = await roomAPI.createRoom(roomData)
    return response.data
  } catch (error) {
    console.error('创建房间失败:', error)
    return { success: false, error: '创建房间失败' }
  }
}

const joinMatrixRoom = async (roomId: string) => {
  try {
    // 使用现有的API方法或创建新的加入房间方法
    const response = await roomAPI.createRoom({ name: `Joined Room ${roomId}`, type: 'join' })
    return response.data
  } catch (error) {
    console.error('加入房间失败:', error)
    return { success: false, error: '加入房间失败' }
  }
}

const leaveRoom = async (roomId: string) => {
  try {
    const response = await roomAPI.getRoomInfo(roomId)
    return response.data
  } catch (error) {
    console.error('离开房间失败:', error)
    return { success: false, error: '离开房间失败' }
  }
}

const getRoomInfo = async (roomId: string) => {
  try {
    const response = await roomAPI.getRoomInfo(roomId)
    return response.data
  } catch (error) {
    console.error('获取房间信息失败:', error)
    return { success: false, error: '获取房间信息失败' }
  }
}

const updateMatrixRoom = async (roomId: string, settings: any) => {
  try {
    // 暂时返回模拟数据
    return { success: true, message: '房间设置已更新' }
  } catch (error) {
    return { success: false, error: '更新房间设置失败' }
  }
}

const getRoomMembers = async (roomId: string) => {
  try {
    // 暂时返回模拟数据
    return { success: true, members: [] }
  } catch (error) {
    return { success: false, error: '获取成员列表失败' }
  }
}

const inviteUserToRoom = async (roomId: string, invitee: string) => {
  try {
    // 暂时返回模拟数据
    return { success: true, message: '邀请已发送' }
  } catch (error) {
    return { success: false, error: '发送邀请失败' }
  }
}

const acceptRoomInvite = async (roomId: string) => {
  try {
    // 模拟接受邀请
    return { success: true, message: '邀请已接受' }
  } catch (error) {
    return { success: false, error: '接受邀请失败' }
  }
}

const rejectRoom = async (roomId: string) => {
  try {
    // 模拟拒绝邀请
    return { success: true, message: '邀请已拒绝' }
  } catch (error) {
    return { success: false, error: '拒绝邀请失败' }
  }
}

// 导出房间管理方法
export {
  getMatrixRooms,
  createMatrixRoom,
  joinMatrixRoom,
  leaveRoom,
  getRoomInfo,
  updateMatrixRoom,
  inviteUserToRoom,
  acceptRoomInvite,
  rejectRoom
}
// 暂时禁用加密相关导入
// import { deviceConflictUtils } from '@/utils/deviceConflictResolver'
// import { cryptoConflictManager } from '@/utils/cryptoConflictManager'

// Matrix消息接口
export interface MatrixMessage {
  id: string
  roomId: string
  content: string
  sender: string
  timestamp: number
  type: string
  eventId?: string
  encrypted?: boolean
  // 添加缺少的属性
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
  }
  // 新增消息功能字段
  msgtype?: string
  senderId?: string
  isOwn?: boolean
  isEdited?: boolean
  isRedacted?: boolean
  redactionReason?: string
  filename?: string
  filesize?: number
  reactions?: Record<string, MessageReaction>
  replyTo?: {
    eventId: string
    senderName: string
    content: string
  }
}

export interface MessageReaction {
  count: number
  users: string[]
  hasReacted: boolean
}

// Matrix房间接口
export interface MatrixRoom {
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
  // 添加缺少的属性
  avatarUrl?: string
  childRooms?: MatrixRoom[]
  encryptionInfo?: any
  deviceInfo?: any
  // 文件传输助手标记
  isFileTransferRoom?: boolean
}

// Matrix用户接口
export interface MatrixUser {
  id: string
  username: string
  displayName?: string
  avatarUrl?: string
  presence?: 'online' | 'offline' | 'unavailable'
  lastSeen?: number
  statusMessage?: string
  // 添加缺少的属性
  userId?: string
}

// Matrix同步状态
export interface MatrixSyncState {
  nextBatch?: string
  isActive: boolean
  lastSync?: number
  syncError?: string
}

// Matrix连接状态
export interface MatrixConnectionState {
  connected: boolean
  homeserver: string
  userId?: string
  accessToken?: string
  deviceId?: string
  syncState: MatrixSyncState
}
 
export const useMatrixStore = defineStore('matrix', () => {
  // Matrix连接状态
  const connection = ref<MatrixConnectionState>({
    connected: false,
    homeserver: 'https://matrix.jianluochat.com',
    syncState: { isActive: false }
  })

  // Matrix服务状态
  const matrixStatus = ref<any>(null)
  const matrixFeatures = ref<any>(null)

  // 房间和消息状态
  const rooms = ref<MatrixRoom[]>([])
  const worldChannel = ref<MatrixRoom | null>(null)
  const currentRoomId = ref<string | null>(null)
  const messages = ref<Map<string, MatrixMessage[]>>(new Map())

  // 文件传输助手相关 - 纯客户端功能
  const FILE_TRANSFER_ROOM_ID = 'file-transfer-assistant'
  const FILE_TRANSFER_ROOM_NAME = '文件传输助手'
  const FILE_TRANSFER_ROOM_TOPIC = '发送文件、图片和消息的个人助手'

  // 房间持久化存储
  const saveRoomsToStorage = () => {
    try {
      const roomsData = rooms.value.map(room => ({
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
        // lastActivity: room.lastActivity || Date.now() // 暂时注释掉，因为接口中没有这个属性
      }))
      localStorage.setItem('matrix-rooms', JSON.stringify(roomsData))
      console.log('Rooms saved to localStorage:', roomsData.length)
    } catch (error) {
      console.error('Failed to save rooms to localStorage:', error)
    }
  }

  // 消息持久化存储
  const saveMessagesToStorage = () => {
    try {
      const messagesData: { [key: string]: MatrixMessage[] } = {}
      messages.value.forEach((msgs, roomId) => {
        messagesData[roomId] = msgs
      })
      localStorage.setItem('matrix_messages', JSON.stringify(messagesData))
      console.log('💾 消息数据已保存到localStorage')
    } catch (error) {
      console.error('保存消息数据失败:', error)
    }
  }

  const loadRoomsFromStorage = () => {
    try {
      const savedRooms = localStorage.getItem('matrix-rooms')
      if (savedRooms) {
        const roomsData = JSON.parse(savedRooms)
        rooms.value = roomsData.map((room: any) => ({
          ...room,
          members: room.members || [],
          unreadCount: 0, // 重置未读计数
          lastMessage: null // 重置最后消息
        }))
        console.log('Rooms loaded from localStorage:', rooms.value.length)
        return true
      }
    } catch (error) {
      console.error('Failed to load rooms from localStorage:', error)
    }
    return false
  }

  // 从localStorage加载消息
  const loadMessagesFromStorage = () => {
    try {
      const savedMessages = localStorage.getItem('matrix_messages')
      if (savedMessages) {
        const messagesData = JSON.parse(savedMessages)
        Object.entries(messagesData).forEach(([roomId, msgs]) => {
          messages.value.set(roomId, msgs as MatrixMessage[])
        })
        console.log('💾 消息数据已从localStorage加载')
      }
    } catch (error) {
      console.error('加载消息数据失败:', error)
    }
  }

  // 用户状态
  const currentUser = ref<MatrixUser | null>(null)
  const onlineUsers = ref<Map<string, MatrixUser>>(new Map())

  // UI状态
  const loading = ref(false)
  const error = ref<string | null>(null)

  // 加密初始化函数
  const initializeEncryption = async (client: any) => {
    try {
      // 首先初始化加密环境
      const { initializeCryptoEnvironment, getFriendlyErrorMessage, retryWithBackoff } = await import('@/utils/wasmLoader')

      const envReady = await initializeCryptoEnvironment()
      if (!envReady) {
        console.warn('⚠️ 加密环境不满足要求，跳过加密初始化')
        return false
      }

      // 检查客户端是否有加密方法
      console.log('🔍 检查可用的加密方法:', {
        initRustCrypto: typeof (client as any).initRustCrypto,
        getCrypto: typeof client.getCrypto,
        isCryptoEnabled: typeof (client as any).isCryptoEnabled === 'function' ? (client as any).isCryptoEnabled() : 'unknown'
      })

      // 确保在启动客户端之前初始化加密
      if (typeof (client as any).initRustCrypto === 'function') {
        console.log('🔧 正在初始化Rust加密引擎...')

        // 使用重试机制初始化加密
        const cryptoInitialized = await retryWithBackoff(async () => {
          // 尝试多种配置策略
          const cryptoConfigs = [
            // 策略1: 使用IndexedDB
            {
              useIndexedDB: true,
              cryptoDatabasePrefix: 'jianluochat-crypto',
              storagePassword: undefined,
              storageKey: undefined
            },
            // 策略2: 使用内存存储（如果IndexedDB失败）
            {
              useIndexedDB: false,
              cryptoDatabasePrefix: undefined,
              storagePassword: undefined,
              storageKey: undefined
            }
          ]

          let lastError: any = null

          for (const config of cryptoConfigs) {
            try {
              console.log(`🔧 尝试加密配置:`, config)
              await (client as any).initRustCrypto(config)
              console.log('✅ Rust加密引擎初始化成功')
              return true
            } catch (configError: any) {
              console.warn(`⚠️ 配置失败:`, configError.message)
              lastError = configError

              // 如果是WASM相关错误，尝试下一个配置
              if (configError.message.includes('WebAssembly') ||
                  configError.message.includes('wasm') ||
                  configError.message.includes('MIME type')) {
                continue
              }

              // 其他错误直接跳出
              break
            }
          }

          throw lastError || new Error('所有加密配置都失败了')
        }, 2, 2000) // 最多重试2次，每次间隔2秒

        if (!cryptoInitialized) {
          return false
        }

        // 验证加密是否真正可用
        const crypto = client.getCrypto()
        if (crypto) {
          console.log('✅ 加密API可用，支持的功能:', {
            canEncryptToDevice: typeof crypto.encryptToDeviceMessages === 'function',
            canVerifyDevice: typeof crypto.requestDeviceVerification === 'function',
            canBackupKeys: typeof crypto.exportRoomKeys === 'function'
          })
          return true
        } else {
          console.warn('⚠️ 加密初始化完成但API不可用')
          return false
        }
      } else {
        console.warn('⚠️ 客户端不支持Rust加密初始化方法')
        // 尝试检查是否已经有加密支持
        const crypto = client.getCrypto()
        if (crypto) {
          console.log('✅ 客户端已有加密支持')
          return true
        } else {
          console.warn('⚠️ 客户端没有加密支持，将以非加密模式运行')
          return false
        }
      }
    } catch (cryptoError: any) {
      console.error('❌ 加密初始化失败:', cryptoError)
      console.warn('⚠️ 将以非加密模式继续启动客户端')

      // 记录详细错误信息以便调试
      if (cryptoError.message) {
        console.error('错误详情:', cryptoError.message)
      }
      if (cryptoError.stack) {
        console.error('错误堆栈:', cryptoError.stack)
      }

      // 使用友好的错误信息
      try {
        const { getFriendlyErrorMessage } = await import('@/utils/wasmLoader')
        error.value = getFriendlyErrorMessage(cryptoError)
      } catch {
        error.value = `加密初始化失败: ${cryptoError.message || '未知错误'}`
      }

      return false
    }
  }

  // 计算属性
  const currentRoom = computed(() => {
    if (currentRoomId.value === 'world') {
      return worldChannel.value
    }
    return rooms.value.find(room => room.id === currentRoomId.value)
  })

  const currentMessages = computed(() => 
    currentRoomId.value ? messages.value.get(currentRoomId.value) || [] : []
  )

  const sortedRooms = computed(() => 
    [...rooms.value].sort((a, b) => {
      const aTime = a.lastMessage?.timestamp || 0
      const bTime = b.lastMessage?.timestamp || 0
      return bTime - aTime
    })
  )

  const totalUnreadCount = computed(() => 
    rooms.value.reduce((total, room) => total + room.unreadCount, 0) + 
    (worldChannel.value?.unreadCount || 0)
  )

  const isConnected = computed(() => connection.value.connected)

  // 添加缺少的计算属性
  const isLoggedIn = computed(() => connection.value.connected && connection.value.userId)
  const homeserver = computed(() => connection.value.homeserver)
  const syncStatus = computed(() => {
    if (connection.value.syncState.isActive) return 'syncing'
    if (connection.value.connected) return 'synced'
    return 'disconnected'
  })

  // 加入房间并确保同步
  const joinRoomAndSync = async (roomId: string, roomInfo?: any): Promise<boolean> => {
    if (!matrixClient.value) {
      throw new Error('Matrix客户端未初始化')
    }

    try {
      console.log(`🚀 开始加入房间: ${roomId}`)
      
      // 检查是否已经在房间中
      const existingRoom = matrixClient.value.getRoom(roomId)
      if (existingRoom && existingRoom.getMyMembership() === 'join') {
        console.log(`✅ 已经在房间 ${roomId} 中`)
        
        // 确保房间在列表中
        const roomInStore = rooms.value.find(r => r.id === roomId)
        if (!roomInStore && roomInfo) {
          const newRoom = {
            id: roomId,
            name: roomInfo.name || existingRoom.name || roomId,
            alias: roomInfo.canonical_alias || existingRoom.getCanonicalAlias(),
            topic: roomInfo.topic || existingRoom.currentState?.getStateEvents('m.room.topic', '')?.getContent()?.topic || '',
            type: 'private' as const,
            isPublic: roomInfo.world_readable || existingRoom.getJoinRule() === 'public',
            memberCount: roomInfo.num_joined_members || existingRoom.getJoinedMemberCount() || 0,
            members: [],
            unreadCount: 0,
            encrypted: existingRoom.hasEncryptionStateEvent(),
            joinRule: existingRoom.getJoinRule() || 'invite',
            historyVisibility: existingRoom.getHistoryVisibility() || 'shared',
            lastActivity: Date.now()
          }
          addRoom(newRoom)
        }
        return true
      }

      // 加入房间
      const joinResult = await matrixClient.value.joinRoom(roomId)
      console.log(`✅ 成功加入房间:`, joinResult)

      // 等待Matrix客户端同步
      console.log('⏳ 等待Matrix客户端同步新房间...')
      let attempts = 0
      const maxAttempts = 10
      
      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        const room = matrixClient.value.getRoom(roomId)
        if (room && room.getMyMembership() === 'join') {
          console.log(`✅ 房间 ${roomId} 同步完成`)
          
          // 创建房间对象并添加到列表
          const newRoom = {
            id: roomId,
            name: roomInfo?.name || room.name || roomId,
            alias: roomInfo?.canonical_alias || room.getCanonicalAlias(),
            topic: roomInfo?.topic || room.currentState?.getStateEvents('m.room.topic', '')?.getContent()?.topic || '',
            type: 'private' as const,
            isPublic: roomInfo?.world_readable || room.getJoinRule() === 'public',
            memberCount: roomInfo?.num_joined_members || room.getJoinedMemberCount() || 0,
            members: [],
            unreadCount: 0,
            encrypted: room.hasEncryptionStateEvent(),
            joinRule: room.getJoinRule() || 'invite',
            historyVisibility: room.getHistoryVisibility() || 'shared',
            lastActivity: Date.now()
          }
          
          addRoom(newRoom)
          console.log(`🎉 房间 "${newRoom.name}" 已成功加入并添加到列表`)
          return true
        }
        
        attempts++
        console.log(`⏳ 等待同步... (${attempts}/${maxAttempts})`)
      }

      // 如果同步超时，仍然尝试添加房间到本地列表
      console.warn('⚠️ 房间同步超时，使用备用方案添加到本地列表')
      if (roomInfo) {
        const newRoom = {
          id: roomId,
          name: roomInfo.name || roomId,
          alias: roomInfo.canonical_alias,
          topic: roomInfo.topic || '',
          type: 'private' as const,
          isPublic: roomInfo.world_readable || false,
          memberCount: roomInfo.num_joined_members || 0,
          members: [],
          unreadCount: 0,
          encrypted: false,
          joinRule: 'invite',
          historyVisibility: 'shared',
          lastActivity: Date.now()
        }
        addRoom(newRoom)
      }

      return true
    } catch (error) {
      console.error('❌ 加入房间失败:', error)
      throw error
    }
  }

  // 添加fetchRooms方法作为fetchMatrixRooms的别名
  const fetchRooms = async () => {
    return await fetchMatrixRooms()
  }

  // 添加startSync方法作为startMatrixSync的别名
  const startSync = async () => {
    if (currentUser.value?.username) {
      return await startMatrixSync(currentUser.value.username)
    }
  }



  // 加载世界频道
  const loadWorldChannel = async () => {
    try {
      const response = await matrixAPI.getWorldChannel()
      if (response.data.success) {
        const channelData = response.data.worldChannel
        worldChannel.value = {
          id: 'world',
          name: channelData.name || 'WORLD CHANNEL',
          alias: channelData.alias || '#world:jianluochat.com',
          topic: channelData.topic || 'Global Matrix communication channel',
          type: 'world',
          isPublic: true,
          memberCount: channelData.memberCount || 0,
          unreadCount: 0,
          encrypted: false,
          joinRule: 'public',
          historyVisibility: 'shared'
        }
      }
    } catch (err: any) {
      console.error('Failed to load world channel:', err)
    }
  }

  // Matrix客户端实例
  const matrixClient = ref<any>(null)
  const loginInfo = ref<any>(null)
  const clientInitializing = ref(false)

  // 清理现有Matrix客户端
  const cleanupMatrixClient = async () => {
    if (matrixClient.value) {
      try {
        console.log('🧹 清理现有Matrix客户端...')

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

  // 设置Matrix客户端
  const setClient = async (client: any) => {
    // 先清理现有客户端
    await cleanupMatrixClient()

    matrixClient.value = client
    console.log('Matrix client set:', client)
  }

  // 设置登录信息
  const setLoginInfo = async (info: any) => {
    loginInfo.value = info
    connection.value.userId = info.userId
    connection.value.accessToken = info.accessToken
    connection.value.deviceId = info.deviceId
    connection.value.homeserver = info.homeserver
    connection.value.connected = true

    currentUser.value = {
      id: info.userId,
      username: info.userId.split(':')[0].substring(1), // 从 @username:server 提取 username
      displayName: info.userId.split(':')[0].substring(1),
      presence: 'online'
    }

    // 持久化保存登录信息到localStorage（保存两种格式以保持兼容性）
    const persistentData = {
      userId: info.userId,
      accessToken: info.accessToken,
      deviceId: info.deviceId,
      homeserver: info.homeserver,
      loginTime: Date.now()
    }
    localStorage.setItem('matrix-login-info', JSON.stringify(persistentData)) // 新格式（连字符）
    localStorage.setItem('matrix_login_info', JSON.stringify(persistentData)) // 旧格式（下划线）
    localStorage.setItem('matrix_access_token', info.accessToken) // 单独保存访问令牌

    console.log('Matrix login info set and persisted:', info)
  }

  // 手动重试Matrix初始化
  const retryMatrixInitialization = async () => {
    console.log('🔄 手动重试Matrix初始化...')
    clientInitializing.value = false // 重置初始化状态
    return await initializeMatrix()
  }

  // 初始化Matrix状态（从localStorage恢复登录信息和房间列表）
  const initializeMatrix = async () => {
    // 防止重复初始化
    if (clientInitializing.value) {
      console.log('⚠️ Matrix正在初始化中，跳过重复初始化')
      return false
    }

    try {
      // 首先加载房间列表和消息（即使未登录也可以显示之前的数据）
      loadRoomsFromStorage()
      loadMessagesFromStorage()

      // 尝试两种可能的localStorage key（兼容性处理）
      let savedLoginInfo = localStorage.getItem('matrix-login-info') // 新格式（连字符）
      if (!savedLoginInfo) {
        savedLoginInfo = localStorage.getItem('matrix_login_info') // 旧格式（下划线）
      }

      // 检查是否有访问令牌但没有完整登录信息的情况
      const accessToken = localStorage.getItem('matrix_access_token')

      console.log('🔍 存储状态检查:', {
        hasLoginInfo: !!savedLoginInfo,
        hasAccessToken: !!accessToken,
        loginInfoLength: savedLoginInfo?.length || 0,
        tokenLength: accessToken?.length || 0
      })

      if (savedLoginInfo) {
        const loginData = JSON.parse(savedLoginInfo)

        // 检查登录信息是否过期（24小时）
        const loginAge = loginData.loginTime ? (Date.now() - loginData.loginTime) : 0
        const maxAge = 24 * 60 * 60 * 1000 // 24小时

        // 如果没有loginTime字段，认为是有效的（向后兼容）
        if (!loginData.loginTime || loginAge < maxAge) {
          console.log('Restoring Matrix login from localStorage:', loginData)

          // 恢复登录状态
          await setLoginInfo(loginData)

          // 尝试重新创建Matrix客户端
          try {
            await createMatrixClient(loginData.userId, loginData.accessToken, loginData.homeserver)

            // 登录成功后，刷新房间列表
            try {
              await fetchMatrixRooms()
            } catch (error) {
              console.warn('Failed to refresh rooms after login restore:', error)
            }

            console.log('Matrix login restored successfully')
            return true
          } catch (clientError) {
            console.error('Failed to create Matrix client during restore:', clientError)
            // 不清除登录信息，只是客户端创建失败
            // 用户可以稍后重试或手动重新登录
            console.warn('Matrix client creation failed, but login info preserved for retry')
            return false
          }
        } else {
          console.log('Saved Matrix login expired, clearing localStorage')
          localStorage.removeItem('matrix-login-info')
          localStorage.removeItem('matrix_login_info') // 清理两种格式
        }
      } else if (accessToken) {
        // 有访问令牌但没有完整登录信息的情况
        console.warn('⚠️ 检测到不一致的存储状态：有访问令牌但缺少登录信息')
        console.log('🧹 清理不一致的存储状态...')

        // 清理不一致的状态
        localStorage.removeItem('matrix_access_token')
        localStorage.removeItem('matrix-login-info')
        localStorage.removeItem('matrix_login_info')

        console.log('✅ 已清理不一致的存储状态，请重新登录')
        return false
      } else {
        console.log('💡 没有找到Matrix登录信息，需要重新登录')
        return false
      }
    } catch (error) {
      console.error('Failed to restore Matrix login:', error)
      // 只有在严重错误时才清除登录信息
      // 比如JSON解析错误等，而不是网络或客户端创建错误
      if (error instanceof SyntaxError) {
        console.warn('Login data corrupted, clearing localStorage')
        localStorage.removeItem('matrix-login-info')
        localStorage.removeItem('matrix_login_info')
      } else {
        console.warn('Temporary error during login restore, keeping login info for retry')
      }
      // 确保清理失败的状态
      await cleanupMatrixClient()
    }
    return false
  }

  // 登出函数
  const logout = async () => {
    // 先清理Matrix客户端
    await cleanupMatrixClient()

    // 清除内存状态
    connection.value = {
      connected: false,
      homeserver: 'https://matrix.jianluochat.com',
      syncState: { isActive: false }
    }
    currentUser.value = null
    loginInfo.value = null
    clientInitializing.value = false

    // 清除localStorage，包括设备ID（清理两种格式）
    localStorage.removeItem('matrix-login-info')
    localStorage.removeItem('matrix_login_info') // 清理旧格式
    localStorage.removeItem('matrix_access_token') // 清理访问令牌
    localStorage.removeItem('matrix-device-id')

    console.log('Matrix logout completed')
  }

  // 清理设备冲突的函数
  const clearDeviceConflicts = async () => {
    try {
      console.log('🧹 开始清理设备冲突...')

      // 清理localStorage中的设备相关数据
      localStorage.removeItem('matrix-device-id')
      localStorage.removeItem('matrix-login-info')

      // 清理IndexedDB中的加密存储
      try {
        const databases = await indexedDB.databases()
        for (const db of databases) {
          if (db.name && (db.name.includes('matrix') || db.name.includes('crypto'))) {
            console.log('🗑️ 删除数据库:', db.name)
            indexedDB.deleteDatabase(db.name)
          }
        }
      } catch (dbError) {
        console.warn('清理数据库失败:', dbError)
      }

      // 清理现有客户端
      await cleanupMatrixClient()

      console.log('✅ 设备冲突清理完成，建议重新登录')

    } catch (error) {
      console.error('❌ 清理设备冲突失败:', error)
    }
  }

  // 创建Matrix客户端实例 - 简化版本，专注于稳定性
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
      } else {
        console.log('🆔 使用已保存的设备ID:', deviceId)
      }

      // 创建简单的客户端配置
      const client = createClient({
        baseUrl: `https://${homeserver}`,
        accessToken: accessToken,
        userId: userId,
        deviceId: deviceId,
        timelineSupport: true,
        useAuthorizationHeader: true
      })

      console.log('✅ Matrix客户端创建成功')

      // 验证客户端配置
      console.log('🔍 验证Matrix客户端配置...')
      console.log('- 用户ID:', client.getUserId())
      console.log('- 服务器URL:', client.getHomeserverUrl())
      console.log('- 设备ID:', client.getDeviceId())
      console.log('- 访问令牌:', client.getAccessToken() ? '已设置' : '未设置')

      // 立即创建文件传输助手（不等待同步）
      console.log('📁 检查文件传输助手...')

      // 首先清理重复的文件传输助手
      const wasCleanedUp = cleanupDuplicateFileTransferRooms()

      // 检查是否已经存在文件传输助手
      const hasFileTransfer = rooms.value.some(r =>
        r.isFileTransferRoom ||
        r.id === FILE_TRANSFER_ROOM_ID
      )
      if (!hasFileTransfer || wasCleanedUp) {
        console.log('� 创建文件传输助手...')
        const fileTransferRoom = ensureFileTransferRoom()

        // 添加到房间列表开头
        rooms.value.unshift(fileTransferRoom)
        saveRoomsToStorage()
        console.log('✅ 文件传输助手已添加到房间列表')
      } else {
        console.log('✅ 文件传输助手已存在，跳过创建')
      }

      // 设置Matrix事件监听器（在启动客户端之前）
      console.log('🎧 设置Matrix事件监听器...')

      // 监听同步状态变化
      client.on('sync' as any, (state: string, prevState: string, data: any) => {
        try {
          console.log(`🔄 Matrix同步状态变化: ${prevState} -> ${state}`, data)
          
          // 安全处理同步状态
          if (state === 'SYNCING' || state === 'PREPARED') {
            connection.value.syncState = {
              isActive: true,
              lastSync: Date.now(),
              nextBatch: data?.response?.next_batch || connection.value.syncState.nextBatch
            }
            console.log('✅ 同步状态良好，客户端正在运行')
            
            // 当同步完成时，尝试获取房间
            setTimeout(() => {
              try {
                const clientRooms = client.getRooms()
                console.log(`📊 同步后获取到 ${clientRooms.length} 个房间`)
                if (clientRooms.length > 0) {
                  // 更新房间列表
                  const convertedRooms = clientRooms.map((room: any) => ({
                    id: room.roomId,
                    name: room.name || room.roomId,
                    type: 'private' as const,
                    isPublic: false,
                    memberCount: room.getJoinedMemberCount(),
                    unreadCount: 0,
                    encrypted: false // 加密已禁用
                  }))

                  // 更新store中的房间列表
                  rooms.value.splice(0, rooms.value.length, ...convertedRooms)
                  saveRoomsToStorage()
                  console.log('✅ 房间列表已通过同步事件更新')
                }
              } catch (roomError) {
                console.warn('获取房间时出错:', roomError)
              }
            }, 1000)
          } else if (state === 'ERROR') {
            console.error('❌ 同步错误:', data?.error)
            connection.value.syncState = {
              isActive: false,
              syncError: data?.error?.errcode || data?.error?.message || 'Unknown sync error'
            }
            
            // 尝试重启同步
            setTimeout(() => {
              console.log('🔄 尝试重启同步...')
              try {
                client.startClient({
                  initialSyncLimit: 200,
                  lazyLoadMembers: true
                })
              } catch (restartError) {
                console.error('重启同步失败:', restartError)
              }
            }, 5000)
          } else if (state === 'STOPPED') {
            console.log('⏹️ 同步已停止')
            connection.value.syncState = { isActive: false }
          } else {
            connection.value.syncState = { isActive: state === 'SYNCING' }
          }

          // 首次同步完成时，立即更新房间列表
          if (state === 'PREPARED' && prevState !== 'PREPARED') {
            console.log('🎯 首次同步完成，强制更新房间列表')
            setTimeout(async () => {
              try {
                await fetchMatrixRooms()
                console.log('✅ 首次同步后房间列表更新完成')
              } catch (error) {
                console.warn('首次同步后房间列表更新失败:', error)
              }
            }, 2000)
          }
        } catch (syncError: any) {
          console.error('❌ 同步事件处理失败:', syncError)
          connection.value.syncState = {
            isActive: false,
            syncError: syncError.message || 'Unknown sync error'
          }
        }
      })

        // 监听房间事件
      client.on('Room' as any, (room: any) => {
        console.log('🏠 新房间事件:', room.roomId, room.name)
        
        // 检查是否是新加入的房间
        const existingRoom = rooms.value.find(r => r.id === room.roomId)
        if (!existingRoom) {
          console.log('🆕 检测到新房间，立即添加到列表:', room.roomId)
          
          // 立即添加新房间到列表
          const newRoom = {
            id: room.roomId,
            name: room.name || room.roomId,
            alias: room.getCanonicalAlias(),
            topic: room.currentState?.getStateEvents('m.room.topic', '')?.getContent()?.topic || '',
            type: (room.getJoinRule() === 'public' ? 'public' : 'private') as 'public' | 'private',
            isPublic: room.getJoinRule() === 'public',
            memberCount: room.getJoinedMemberCount() || 0,
            members: [],
            unreadCount: 0,
            encrypted: room.hasEncryptionStateEvent(),
            joinRule: room.getJoinRule() || 'invite',
            historyVisibility: room.getHistoryVisibility() || 'shared',
            lastActivity: Date.now()
          }
          
          // 添加到房间列表（不包括文件传输助手的位置）
          const fileTransferIndex = rooms.value.findIndex(r => r.isFileTransferRoom)
          if (fileTransferIndex >= 0) {
            // 在文件传输助手后面插入
            rooms.value.splice(fileTransferIndex + 1, 0, newRoom)
          } else {
            // 如果没有文件传输助手，添加到开头
            rooms.value.unshift(newRoom)
          }
          
          saveRoomsToStorage()
          console.log(`✅ 新房间 "${newRoom.name}" 已立即添加到房间列表`)
        }
        
        // 延迟更新完整房间列表以确保同步
        setTimeout(async () => {
          try {
            console.log('🔄 房间事件后延迟更新完整房间列表...')
            await fetchMatrixRooms()
            console.log('✅ 房间列表已通过房间事件完全更新')
          } catch (roomError) {
            console.warn('处理房间事件时出错:', roomError)
          }
        }, 3000) // 增加延迟到3秒，确保同步完成
      })

      // 监听消息事件
      client.on('Room.timeline' as any, (event: any, room: any) => {
        if (event.getType() === 'm.room.message') {
          console.log('💬 新消息:', event.getContent().body)
        }
      })

      // 监听错误事件
      client.on('error' as any, (error: any) => {
        console.error('❌ Matrix客户端错误:', error)
      })

      // 设置客户端实例
      matrixClient.value = client

      // 启动客户端
      console.log('🚀 启动Matrix客户端...')
      try {
        await client.startClient({
          initialSyncLimit: 2000, // 增加到2000条历史消息
          lazyLoadMembers: true
        })
        console.log('✅ Matrix客户端启动命令已发送')

        // 立即检查同步状态
        const immediateState = client.getSyncState()
        console.log('📊 启动后立即检查同步状态:', immediateState)

        // 如果同步状态不佳，等待一段时间让同步开始
        if (immediateState === null || immediateState === 'STOPPED') {
          console.log('⏳ 初始同步状态不佳，等待同步开始...')
          await new Promise(resolve => setTimeout(resolve, 3000))
          
          // 再次检查状态
          const newState = client.getSyncState()
          console.log('📊 3秒后同步状态:', newState)
          
          if (newState === null || newState === 'STOPPED') {
            console.warn('⚠️ 同步仍未开始，尝试重新启动客户端...')
            try {
              // 尝试重新启动客户端
              await client.stopClient()
              await new Promise(resolve => setTimeout(resolve, 1000))
              await client.startClient({
                initialSyncLimit: 200,
                lazyLoadMembers: true
              })
              console.log('✅ 重新启动客户端成功')
            } catch (restartError) {
              console.warn('重新启动客户端失败:', restartError)
            }
          }
        }

      } catch (startError) {
        console.error('❌ 启动Matrix客户端失败:', startError)
        throw startError
      }

      // 改进的客户端同步等待逻辑
      console.log('⏳ 等待Matrix客户端同步...')
      await new Promise((resolve) => {
        let syncEventReceived = false
        let resolveCount = 0

        const safeResolve = (reason: string) => {
          if (resolveCount === 0) {
            resolveCount++
            console.log(`🎯 同步等待结束: ${reason}`)
            resolve(true)
          }
        }

        const timeout = setTimeout(() => {
          if (!syncEventReceived) {
            console.warn('⚠️ 同步等待超时，进行最终检查...')

            // 最终状态检查
            try {
              const finalState = client.getSyncState()
              const isRunning = client.clientRunning
              const roomCount = client.getRooms().length

              console.log('📊 超时时的最终状态:', {
                syncState: finalState,
                clientRunning: isRunning,
                roomCount: roomCount
              })

              // 如果客户端在运行且有房间，认为是成功的
              if (isRunning && roomCount > 0) {
                console.log('✅ 虽然同步事件未收到，但客户端状态良好')
                syncEventReceived = true
              } else if (finalState === null) {
                console.log('🔄 同步状态为null，尝试最后一次重启...')
                client.startClient({ initialSyncLimit: 100 }).catch((err: any) => {
                  console.error('最后重启尝试失败:', err)
                })
              }
            } catch (err) {
              console.error('最终状态检查失败:', err)
            }
          }

          client.removeListener('sync' as any, onSync)
          client.removeListener('error' as any, onError)
          safeResolve('超时')
        }, 12000) // 减少到12秒超时

        const onSync = (state: string, prevState: string | null, data: any) => {
          syncEventReceived = true
          console.log(`🔄 Matrix同步状态变化: ${prevState} -> ${state}`)

          if (data && data.error) {
            console.error('同步错误详情:', data.error)
          }

          if (state === 'PREPARED' || state === 'SYNCING') {
            clearTimeout(timeout)
            client.removeListener('sync' as any, onSync)
            client.removeListener('error' as any, onError)
            console.log('✅ Matrix客户端同步已准备就绪')
            safeResolve('同步成功')
          } else if (state === 'ERROR') {
            console.error('❌ Matrix客户端同步错误')
            // 给一些时间看是否能恢复
            setTimeout(() => {
              const currentState = client.getSyncState()
              if (currentState === 'ERROR') {
                clearTimeout(timeout)
                client.removeListener('sync' as any, onSync)
                client.removeListener('error' as any, onError)
                safeResolve('同步错误')
              }
            }, 2000)
          }
        }

        const onError = (error: any) => {
          console.error('❌ Matrix客户端错误事件:', error)
          // 不立即停止，可能是临时错误
        }

        client.on('sync' as any, onSync)
        client.on('error' as any, onError)

        // 立即检查当前状态
        const currentState = client.getSyncState()
        console.log(`📊 当前同步状态: ${currentState}`)
        if (currentState === 'PREPARED' || currentState === 'SYNCING') {
          clearTimeout(timeout)
          client.removeListener('sync' as any, onSync)
          client.removeListener('error' as any, onError)
          console.log('✅ Matrix客户端已经在同步中')
          safeResolve('已在同步')
          return
        }

        // 渐进式状态检查
        const checkStates = [3000, 6000, 9000]
        checkStates.forEach((delay, index) => {
          setTimeout(() => {
            if (!syncEventReceived && resolveCount === 0) {
              const state = client.getSyncState()
              const running = client.clientRunning
              const rooms = client.getRooms().length

              console.log(`📊 ${delay/1000}秒检查 - 状态:${state}, 运行:${running}, 房间:${rooms}`)

              // 如果检测到有效状态或房间，认为成功
              if ((state !== null && state !== 'STOPPED') || rooms > 0) {
                syncEventReceived = true
                clearTimeout(timeout)
                client.removeListener('sync' as any, onSync)
                client.removeListener('error' as any, onError)
                console.log(`🎉 通过${delay/1000}秒检查检测到有效状态`)
                safeResolve('状态检查成功')
              }
            }
          }, delay)
        })
      })

      // 设置Matrix事件监听器
      console.log('🎧 设置Matrix事件监听器...')

      // 监听新消息事件
      client.on('Room.timeline' as any, (event: any, room: any, toStartOfTimeline: boolean) => {
        if (toStartOfTimeline) return // 忽略历史消息

        if (event.getType() === 'm.room.message') {
          console.log('📨 收到新消息事件:', event.getId(), 'in room:', room.roomId)

          const eventContent = event.getContent()
          console.log('🔍 消息内容详情:', {
            msgtype: eventContent?.msgtype,
            body: eventContent?.body,
            url: eventContent?.url,
            filename: eventContent?.filename,
            info: eventContent?.info,
            fullContent: eventContent
          })

          const content = eventContent?.body || eventContent?.formatted_body || ''

          const newMessage: MatrixMessage = {
            id: event.getId(),
            roomId: room.roomId,
            content,
            sender: event.getSender(),
            senderName: event.getSender(),
            timestamp: event.getTs(),
            type: event.getType(),
            eventId: event.getId(),
            encrypted: !!eventContent?.algorithm,
            status: 'sent' as const
          }

          // 处理文件消息
          if (eventContent?.msgtype === 'm.image' || eventContent?.msgtype === 'm.file') {
            const isImage = eventContent.msgtype === 'm.image'
            // 处理不同的URL格式
            let mxcUrl = eventContent.url
            console.log('🔍 URL提取前:', { originalUrl: mxcUrl, type: typeof mxcUrl })
            if (typeof mxcUrl === 'object' && mxcUrl?.content_uri) {
              mxcUrl = mxcUrl.content_uri
              console.log('✅ 从对象中提取URL:', mxcUrl)
            }
            // 尝试多种URL格式
            let fileUrl = null
            if (mxcUrl && matrixClient.value) {
              console.log('🔍 开始URL转换，MXC URL:', mxcUrl)

              // 首先尝试不需要认证的URL
              const unauthUrl = matrixClient.value.mxcUrlToHttp(mxcUrl, undefined, undefined, undefined, false, true, false)
              console.log('🔗 未认证URL结果:', unauthUrl)

              // 然后尝试认证URL
              const authUrl = matrixClient.value.mxcUrlToHttp(mxcUrl, undefined, undefined, undefined, false, true, true)
              console.log('🔗 认证URL结果:', authUrl)

              // 优先使用未认证URL，如果不可用则使用认证URL
              fileUrl = unauthUrl || authUrl
              console.log('🎯 最终选择的URL:', fileUrl)

              // 如果选择了认证URL，标记需要特殊处理
              if (fileUrl === authUrl && authUrl) {
                console.log('⚠️ 使用认证URL，可能需要特殊处理')
              }
            }
            console.log('🔗 URL转换结果:', { mxcUrl, fileUrl })

            console.log('🖼️ 处理文件消息:', {
              msgtype: eventContent.msgtype,
              originalUrl: eventContent.url,
              extractedMxcUrl: mxcUrl,
              convertedUrl: fileUrl,
              filename: eventContent.filename,
              body: eventContent.body,
              isImage,
              clientExists: !!matrixClient.value,
              mxcUrlToHttpExists: !!(matrixClient.value?.mxcUrlToHttp)
            })

            if (fileUrl) {
              newMessage.fileInfo = {
                name: eventContent.filename || eventContent.body || 'Unknown file',
                size: eventContent.info?.size || 0,
                type: eventContent.info?.mimetype || 'application/octet-stream',
                url: fileUrl,
                isImage,
                mxcUrl: mxcUrl // 保存原始MXC URL用于重试
              } as any

              // 更新消息内容显示
              if (newMessage.fileInfo) {
                newMessage.content = `${isImage ? '🖼️' : '📎'} ${newMessage.fileInfo.name}`
                if (newMessage.fileInfo.size > 0) {
                  newMessage.content += ` (${formatFileSize(newMessage.fileInfo.size)})`
                }
              }

              console.log('✅ 文件信息已设置:', newMessage.fileInfo)
            } else {
              console.warn('❌ 无法转换文件URL:', eventContent.url)
            }
          }

          // 添加到消息列表 - 使用Set进行快速去重检查
          const roomMessages = messages.value.get(room.roomId) || []
          const existingMessageIds = new Set(roomMessages.map(m => m.id))
          
          if (!existingMessageIds.has(newMessage.id)) {
            messages.value.set(room.roomId, [...roomMessages, newMessage])
            console.log('✅ 新消息已添加到本地列表')
  
            // 更新房间最后消息
            const targetRoom = rooms.value.find(r => r.id === room.roomId)
            if (targetRoom) {
              targetRoom.lastMessage = newMessage
            }
          } else {
            console.log('🔄 消息已存在，跳过去重:', newMessage.id)
          }
        }
      })

      // 最终状态检查
      const finalState = client.getSyncState()
      console.log('🎉 Matrix客户端创建和启动完成，最终同步状态:', finalState)

      // 添加持续监控
      const monitor = setInterval(() => {
        const state = client.getSyncState()
        if (state !== null) {
          console.log('🔄 检测到同步状态变化:', state)
          clearInterval(monitor)
        }
      }, 2000)

      // 10秒后停止监控
      setTimeout(() => clearInterval(monitor), 10000)

      // 在客户端创建成功后，异步创建文件传输助手
      setTimeout(async () => {
        try {
          console.log('🔄 创建文件传输助手...')
          const fileTransferRoom = ensureFileTransferRoom()
          if (fileTransferRoom) {
            console.log('✅ 文件传输助手创建完成，更新房间列表')
            // 立即更新房间列表以包含文件传输助手
            await fetchMatrixRooms()
          }
        } catch (error) {
          console.warn('⚠️ 文件传输助手创建失败:', error)
        }
      }, 3000) // 等待3秒让同步稳定

      return client
    } catch (error) {
      console.error('Failed to create Matrix client:', error)
      // 清理失败的客户端
      await cleanupMatrixClient()
      throw error
    } finally {
      clientInitializing.value = false
    }
  }

  // 强制重新连接Matrix客户端
  const forceReconnect = async (): Promise<boolean> => {
    console.log('🔄 开始强制重新连接Matrix客户端...')

    try {
      // 停止当前客户端
      if (matrixClient.value) {
        console.log('⏹️ 停止当前Matrix客户端...')
        matrixClient.value.stopClient()
        matrixClient.value = null
        await new Promise(resolve => setTimeout(resolve, 2000)) // 等待2秒确保完全停止
      }

      // 重置所有状态
      connection.value = {
        connected: false,
        homeserver: '',
        userId: '',
        syncState: { isActive: false }
      }

      // 清除初始化标志
      clientInitializing.value = false

      // 重新初始化
      console.log('🚀 重新初始化Matrix客户端...')
      const success = await initializeMatrix()

      if (success) {
        console.log('✅ 强制重新连接成功')
        // 等待一下再获取房间
        setTimeout(async () => {
          try {
            await fetchRooms()
            console.log('✅ 房间列表已刷新')
          } catch (error) {
            console.error('刷新房间列表失败:', error)
          }
        }, 3000)
        return true
      } else {
        console.error('❌ 强制重新连接失败')
        return false
      }
    } catch (error) {
      console.error('❌ 强制重新连接过程中出错:', error)
      return false
    }
  }

  // 诊断Matrix客户端状态
  const diagnoseMatrixClient = () => {
    if (!matrixClient.value) {
      console.log('❌ Matrix客户端未初始化')
      return
    }

    const client = matrixClient.value
    console.log('🔍 Matrix客户端诊断信息:')
    console.log('- 用户ID:', client.getUserId())
    console.log('- 服务器URL:', client.getHomeserverUrl())
    console.log('- 设备ID:', client.getDeviceId())
    console.log('- 访问令牌:', client.getAccessToken() ? '已设置' : '未设置')
    console.log('- 客户端运行状态:', client.clientRunning)
    console.log('- 同步状态:', client.getSyncState())
    console.log('- 房间数量:', client.getRooms().length)

    try {
      console.log('- 存储状态:', client.store ? '已初始化' : '未初始化')
      console.log('- 同步令牌:', client.store.getSyncToken() ? '已设置' : '未设置')
    } catch (err) {
      console.log('- 存储状态检查失败:', err)
    }
  }

  // Matrix用户认证
  const matrixLogin = async (username: string, password: string) => {
    try {
      loading.value = true
      error.value = null

      // 如果是测试用户，创建真实的Matrix客户端连接
      if (username === 'testuser' && password === 'testpass') {
        const userId = `@testuser:matrix.org`
        const accessToken = 'test_matrix_token'
        const homeserver = 'matrix.org'

        connection.value.userId = userId
        connection.value.accessToken = accessToken
        connection.value.connected = true
        connection.value.homeserver = homeserver

        currentUser.value = {
          id: userId,
          username: 'testuser',
          displayName: 'Test User',
          presence: 'online'
        }

        // 创建Matrix客户端（用于公共房间探索等功能）
        try {
          await createMatrixClient(userId, accessToken, homeserver)
          console.log('Matrix client created for test user')
        } catch (clientError) {
          console.warn('Failed to create Matrix client for test user:', clientError)
          // 对于测试用户，即使客户端创建失败也继续，但设置一个模拟客户端
          matrixClient.value = {
            publicRooms: async (options: any) => {
              // 返回模拟的公共房间数据
              return {
                chunk: [
                  {
                    room_id: '!example:matrix.org',
                    name: 'Matrix HQ',
                    topic: 'Welcome to Matrix HQ',
                    canonical_alias: '#matrix:matrix.org',
                    num_joined_members: 1000,
                    world_readable: true,
                    guest_can_join: true,
                    avatar_url: null
                  },
                  {
                    room_id: '!test:matrix.org',
                    name: 'Test Room',
                    topic: 'A test room for demonstration',
                    canonical_alias: '#test:matrix.org',
                    num_joined_members: 50,
                    world_readable: true,
                    guest_can_join: true,
                    avatar_url: null
                  }
                ]
              }
            },
            joinRoom: async (roomId: string) => {
              console.log('Mock joining room:', roomId)
              return { room_id: roomId }
            },
            mxcUrlToHttp: (mxcUrl: string, width?: number, height?: number) => {
              return mxcUrl // 简单返回原URL
            }
          }
        }

        // 模拟加载世界频道
        await loadTestWorldChannel()

        return { success: true, user: currentUser.value }
      }

      // 尝试真实的Matrix登录
      const response = await matrixAPI.login({ username, password })

      if (response.data.success) {
        connection.value.userId = `@${username}:jianluochat.com`
        connection.value.accessToken = response.data.accessToken || 'matrix_token_placeholder'
        connection.value.connected = true

        currentUser.value = {
          id: connection.value.userId,
          username,
          displayName: username,
          presence: 'online'
        }

        // 开始同步
        await startMatrixSync(username)

        return { success: true, user: currentUser.value }
      } else {
        throw new Error('Matrix login failed')
      }
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Matrix login failed'
      connection.value.connected = false
      console.error('Matrix login error:', err)
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  // 加载测试世界频道
  const loadTestWorldChannel = async () => {
    try {
      // 创建测试世界频道
      const testWorldChannel: MatrixRoom = {
        id: 'world',
        name: '世界频道',
        alias: '#world:matrix.org',
        topic: 'Matrix协议全球交流频道 - 体验去中心化通信',
        type: 'world',
        isPublic: true,
        memberCount: 1337,
        members: ['@testuser:matrix.org'],
        unreadCount: 0,
        encrypted: false,
        joinRule: 'public',
        historyVisibility: 'world_readable',
        avatarUrl: undefined
      }

      worldChannel.value = testWorldChannel
      rooms.value = [testWorldChannel]

      // 添加一些测试消息
      const testMessages: MatrixMessage[] = [
        {
          id: 'msg1',
          roomId: 'world',
          content: '欢迎来到Matrix协议世界频道！这里是去中心化通信的体验空间。',
          sender: '@system:matrix.org',
          senderName: 'System',
          timestamp: Date.now() - 3600000,
          type: 'm.room.message'
        },
        {
          id: 'msg2',
          roomId: 'world',
          content: 'Matrix协议支持端到端加密、联邦化通信和实时同步。',
          sender: '@alice:matrix.org',
          senderName: 'Alice',
          timestamp: Date.now() - 1800000,
          type: 'm.room.message'
        },
        {
          id: 'msg3',
          roomId: 'world',
          content: '你可以在这里体验Matrix的各种功能，包括房间管理、消息发送等。',
          sender: '@bob:kde.org',
          senderName: 'Bob',
          timestamp: Date.now() - 900000,
          type: 'm.room.message'
        }
      ]

      messages.value.set('world', testMessages)

      console.log('Test world channel loaded successfully')
    } catch (err) {
      console.error('Failed to load test world channel:', err)
    }
  }

  // 增强的Matrix连接诊断功能
  const diagnoseMatrixConnection = async () => {
    console.log('🔍 开始Matrix连接诊断...')

    const diagnosis = {
      timestamp: new Date().toISOString(),
      clientExists: !!matrixClient.value,
      clientRunning: false,
      syncState: null as string | null,
      userId: null as string | null,
      homeserver: null as string | null,
      accessToken: false,
      deviceId: null as string | null,
      roomCount: 0,
      networkConnectivity: false,
      authValid: false,
      recommendations: [] as string[],
      localStorage: {
        hasToken: !!localStorage.getItem('matrix_access_token'),
        hasLoginInfo: !!localStorage.getItem('matrix_login_info'),
        hasRooms: !!localStorage.getItem('matrix-rooms'),
        hasDeviceId: !!localStorage.getItem('matrix-device-id')
      },
      networkStatus: navigator.onLine ? '在线' : '离线',
      performance: {
        memoryUsage: (performance as any).memory ? {
          used: Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024) + 'MB',
          total: Math.round((performance as any).memory.totalJSHeapSize / 1024 / 1024) + 'MB'
        } : '不可用'
      },
      connectionTest: null as any
    }

    if (matrixClient.value) {
      diagnosis.clientRunning = matrixClient.value.clientRunning
      diagnosis.syncState = matrixClient.value.getSyncState()
      diagnosis.userId = matrixClient.value.getUserId()
      diagnosis.homeserver = matrixClient.value.getHomeserverUrl()
      diagnosis.accessToken = !!matrixClient.value.getAccessToken()
      diagnosis.deviceId = matrixClient.value.getDeviceId()
      diagnosis.roomCount = matrixClient.value.getRooms().length

      // 测试网络连接
      try {
        const response = await fetch(diagnosis.homeserver + '/_matrix/client/versions')
        diagnosis.networkConnectivity = response.ok
      } catch (error) {
        console.error('网络连接测试失败:', error)
        diagnosis.recommendations.push('检查网络连接和Matrix服务器可达性')
      }

      // 测试认证状态
      try {
        console.log('🧪 执行Matrix认证测试...')
        const startTime = performance.now()
        const whoami = await matrixClient.value.whoami()
        const endTime = performance.now()

        diagnosis.authValid = !!whoami.user_id
        diagnosis.connectionTest = {
          success: true,
          responseTime: Math.round(endTime - startTime) + 'ms',
          result: whoami
        }
        console.log('✅ Matrix认证测试成功:', whoami)
      } catch (error: any) {
        console.error('❌ Matrix认证测试失败:', error)
        diagnosis.connectionTest = {
          success: false,
          error: error.message || error.toString(),
          errorCode: error.errcode || 'UNKNOWN'
        }
        diagnosis.recommendations.push('访问令牌可能已过期，请重新登录')
      }
    } else {
      diagnosis.recommendations.push('Matrix客户端未初始化')
    }

    // 生成建议
    if (diagnosis.syncState === null) {
      diagnosis.recommendations.push('同步状态为null，尝试重新启动客户端')
    }
    if (!diagnosis.clientRunning) {
      diagnosis.recommendations.push('客户端未运行，尝试启动客户端')
    }
    if (diagnosis.roomCount === 0) {
      diagnosis.recommendations.push('没有房间，可能需要加入一些房间或检查同步状态')
    }

    console.log('📊 Matrix连接诊断结果:', diagnosis)
    return diagnosis
  }

  // 调试工具：生成详细的系统报告
  const generateDebugReport = async () => {
    console.log('📋 生成调试报告...')

    const diagnosis = await diagnoseMatrixConnection()

    const report = {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      matrixDiagnosis: diagnosis,
      storeState: {
        roomsCount: rooms.value.length,
        messagesCount: Array.from(messages.value.values()).reduce((total, msgs) => total + msgs.length, 0),
        currentUser: currentUser.value,
        loading: loading.value,
        error: error.value
      },
      localStorage: {
        matrixToken: localStorage.getItem('matrix_access_token') ? '已设置' : '未设置',
        matrixLoginInfo: localStorage.getItem('matrix_login_info') ? '已设置' : '未设置',
        matrixRooms: localStorage.getItem('matrix-rooms') ? '已设置' : '未设置',
        matrixDeviceId: localStorage.getItem('matrix-device-id') ? '已设置' : '未设置'
      },
      recommendations: diagnosis.recommendations
    }

    console.log('📋 调试报告生成完成:', report)
    return report
  }

  // 调试工具：清理和重置
  const debugReset = async () => {
    console.log('🧹 执行调试重置...')

    try {
      // 停止客户端
      if (matrixClient.value) {
        matrixClient.value.stopClient()
        await new Promise(resolve => setTimeout(resolve, 1000))
      }

      // 清理状态
      await cleanupMatrixClient()

      // 清理localStorage
      localStorage.removeItem('matrix_access_token')
      localStorage.removeItem('matrix_login_info')
      localStorage.removeItem('matrix-rooms')
      localStorage.removeItem('matrix-device-id')

      // 重置store状态
      rooms.value.splice(0)
      messages.value.clear()
      currentUser.value = null
      error.value = null
      loading.value = false

      console.log('✅ 调试重置完成')
      return true
    } catch (error) {
      console.error('❌ 调试重置失败:', error)
      return false
    }
  }

  // 清理重复的文件传输助手
  const cleanupDuplicateFileTransferRooms = () => {
    console.log('🧹 清理重复的文件传输助手...')

    const fileTransferRooms = rooms.value.filter(r =>
      r.isFileTransferRoom ||
      r.id === FILE_TRANSFER_ROOM_ID ||
      r.name === FILE_TRANSFER_ROOM_NAME
    )

    console.log(`🔍 发现 ${fileTransferRooms.length} 个文件传输助手相关房间`)

    if (fileTransferRooms.length > 1) {
      console.log('🗑️ 删除所有重复的文件传输助手')

      // 删除所有文件传输助手
      rooms.value = rooms.value.filter(r =>
        !r.isFileTransferRoom &&
        r.id !== FILE_TRANSFER_ROOM_ID &&
        r.name !== FILE_TRANSFER_ROOM_NAME
      )

      saveRoomsToStorage()
      console.log('✅ 所有重复的文件传输助手已清理完成')
      return true // 表示进行了清理
    } else {
      console.log('✅ 没有发现重复的文件传输助手')
      return false
    }
  }

  // 创建文件传输助手（纯客户端功能）
  const ensureFileTransferRoom = (): MatrixRoom => {
    console.log('� 创建文件传输助手（客户端功能）')

    const fileTransferRoom = {
      id: FILE_TRANSFER_ROOM_ID,
      name: FILE_TRANSFER_ROOM_NAME,
      alias: '',
      topic: FILE_TRANSFER_ROOM_TOPIC,
      type: 'private' as const,
      isPublic: false,
      memberCount: 1,
      members: [],
      unreadCount: 0,
      encrypted: false,
      isFileTransferRoom: true,
      joinRule: 'invite',
      historyVisibility: 'shared'
    }

    console.log('📋 文件传输助手数据:', fileTransferRoom)
    return fileTransferRoom
  }

  // 改进的Matrix房间获取功能
  const fetchMatrixRooms = async () => {
    try {
      loading.value = true
      console.log('🔄 开始获取Matrix房间列表...')

      // 首先进行连接诊断
      const diagnosis = await diagnoseMatrixConnection()

      if (!matrixClient.value) {
        console.error('❌ Matrix客户端未初始化')
        throw new Error('Matrix客户端未初始化')
      }

      // 检查客户端是否正在运行
      if (!matrixClient.value.clientRunning) {
        console.log('🚀 客户端未运行，尝试启动...')
        try {
          await matrixClient.value.startClient({
            initialSyncLimit: 1000, // 增加初始同步限制到1000条
            lazyLoadMembers: true
          })
          console.log('✅ 客户端启动成功')

          // 等待一段时间让同步开始
          await new Promise(resolve => setTimeout(resolve, 2000))
        } catch (startError) {
          console.error('❌ 启动客户端失败:', startError)
          // 继续尝试获取房间，可能客户端已经有缓存的数据
        }
      }

      // 获取当前同步状态
      const syncState = matrixClient.value.getSyncState()
      console.log(`📡 当前Matrix同步状态: ${syncState}`)

      // 尝试多种策略获取房间
      let clientRooms = []

      // 策略1: 直接从客户端获取房间（即使同步状态不理想）
      try {
        clientRooms = matrixClient.value.getRooms()
        console.log(`📊 策略1 - 从客户端直接获取到 ${clientRooms.length} 个房间`)

        // 如果获取到房间，立即返回，不需要等待同步
        if (clientRooms.length > 0) {
          console.log('✅ 策略1成功，直接使用获取到的房间')
        }
      } catch (error) {
        console.error('策略1失败:', error)
      }

      // 策略2: 如果没有房间，尝试等待同步或强制同步
      if (clientRooms.length === 0) {
        console.log('⏳ 策略2 - 没有房间，尝试改进同步...')

        // 如果同步状态不佳，尝试重新启动同步
        if (syncState === null || syncState === 'STOPPED' || syncState === 'ERROR') {
          console.log('🔄 同步状态不佳，重新启动客户端...')
          try {
            // 停止客户端
            if (matrixClient.value.clientRunning) {
              matrixClient.value.stopClient()
              await new Promise(resolve => setTimeout(resolve, 1000))
            }

            // 重新启动客户端
            await matrixClient.value.startClient({
              initialSyncLimit: 2000, // 增加同步限制到2000条
              lazyLoadMembers: true
            })
            console.log('✅ 客户端重新启动成功')
          } catch (restartError) {
            console.error('❌ 重新启动客户端失败:', restartError)
          }
        }

        // 等待同步完成
        console.log('⏳ 等待同步完成...')
        await new Promise((resolve) => {
          let resolved = false
          const timeout = setTimeout(() => {
            if (!resolved) {
              resolved = true
              matrixClient.value?.removeListener('sync', onSync)
              console.warn('⚠️ 同步等待超时，继续使用现有数据')
              resolve(true)
            }
          }, 10000) // 增加等待时间到10秒

          const onSync = (state: string) => {
            console.log(`🔄 等待同步状态变化: ${state}`)
            if ((state === 'PREPARED' || state === 'SYNCING') && !resolved) {
              resolved = true
              clearTimeout(timeout)
              matrixClient.value?.removeListener('sync', onSync)
              console.log('✅ 同步状态已改善')
              resolve(true)
            }
          }

          matrixClient.value?.on('sync', onSync)
        })

        // 重新尝试获取房间
        try {
          clientRooms = matrixClient.value.getRooms()
          console.log(`📊 策略2 - 等待后获取到 ${clientRooms.length} 个房间`)
        } catch (error) {
          console.error('策略2获取房间失败:', error)
        }
      }

      // 策略3: 如果仍然没有房间，尝试从localStorage恢复或提供帮助信息
      if (clientRooms.length === 0) {
        console.log('� 策略3 - 尝试从localStorage恢复房间...')
        try {
          // 尝试从localStorage恢复房间
          const savedRooms = localStorage.getItem('matrix-rooms')
          if (savedRooms) {
            const parsedRooms = JSON.parse(savedRooms)
            if (Array.isArray(parsedRooms) && parsedRooms.length > 0) {
              console.log(`📦 从localStorage恢复了 ${parsedRooms.length} 个房间`)
              rooms.value.splice(0, rooms.value.length, ...parsedRooms)
              console.log('✅ 房间列表已从localStorage恢复')
              return parsedRooms
            }
          }
        } catch (error) {
          console.error('从localStorage恢复房间失败:', error)
        }

        // 如果还是没有房间，提供帮助信息
        console.warn('⚠️ 没有找到任何房间，可能需要：')
        console.warn('1. 加入一些房间')
        console.warn('2. 检查网络连接')
        console.warn('3. 重新登录')
        console.warn('4. 检查Matrix服务器状态')
      }

      // 转换房间数据
      const fetchedRooms = clientRooms.map((room: any) => {
        try {
          return {
            id: room.roomId,
            name: room.name || room.roomId,
            alias: room.getCanonicalAlias(),
            topic: room.currentState?.getStateEvents('m.room.topic', '')?.getContent()?.topic || '',
            type: (room.getJoinRule() === 'public' ? 'public' : 'private') as 'public' | 'private' | 'world' | 'space',
            isPublic: room.getJoinRule() === 'public',
            memberCount: room.getJoinedMemberCount() || 0,
            members: [],
            unreadCount: room.getUnreadNotificationCount() || 0,
            encrypted: room.hasEncryptionStateEvent(),
            joinRule: room.getJoinRule() || 'invite',
            historyVisibility: room.getHistoryVisibility() || 'shared',
            lastActivity: Date.now()
          }
        } catch (roomError) {
          console.error('处理房间数据失败:', roomError, room)
          return {
            id: room.roomId,
            name: room.roomId,
            alias: null,
            topic: '',
            type: 'private' as const,
            isPublic: false,
            memberCount: 0,
            members: [],
            unreadCount: 0,
            encrypted: false,
            joinRule: 'invite',
            historyVisibility: 'shared',
            lastActivity: Date.now()
          }
        }
      })

      // 确保文件传输助手存在并置顶
      console.log('🔍 确保文件传输助手存在...')
      const fileTransferRoom = ensureFileTransferRoom()

      // 更新房间列表，文件传输助手置顶
      const finalRooms = []
      if (fileTransferRoom) {
        finalRooms.push(fileTransferRoom)
        console.log('✅ 文件传输助手已置顶')
      } else {
        console.warn('⚠️ 文件传输助手创建失败或未找到')
      }

      // 添加其他房间（排除已存在的文件传输助手）
      const otherRooms = fetchedRooms.filter((room: any) =>
        room.name !== FILE_TRANSFER_ROOM_NAME &&
        !room.id.includes('file-transfer') &&
        room.id !== fileTransferRoom?.id
      )
      finalRooms.push(...otherRooms)

      // 强制更新房间列表
      console.log('🔄 强制更新房间列表...')
      console.log('📋 更新前房间数量:', rooms.value.length)
      console.log('📋 即将设置的房间数量:', finalRooms.length)

      rooms.value.splice(0, rooms.value.length, ...finalRooms)

      // 强制触发响应式更新
      await nextTick()

      saveRoomsToStorage()
      console.log(`✅ 房间列表已更新，共 ${finalRooms.length} 个房间（包含文件传输助手）`)
      console.log('📋 更新后房间数量:', rooms.value.length)
      console.log('📋 房间列表预览:', finalRooms.slice(0, 5).map(r => ({ name: r.name, id: r.id, isFileTransferRoom: r.isFileTransferRoom })))

      // 验证文件传输助手是否在列表中
      const hasFileTransfer = rooms.value.some(r => r.isFileTransferRoom)
      console.log('🔍 文件传输助手是否在列表中:', hasFileTransfer)

      // 如果仍然没有房间，提供建议
      if (fetchedRooms.length === 0) {
        console.warn('⚠️ 仍然没有获取到房间，可能的原因:')
        console.warn('1. 用户还没有加入任何房间')
        console.warn('2. Matrix服务器连接问题')
        console.warn('3. 访问令牌已过期')
        console.warn('4. 同步过程中断')

        // 显示诊断建议
        if (diagnosis.recommendations.length > 0) {
          console.warn('💡 建议:', diagnosis.recommendations)
        }
      }

      return rooms.value
    } catch (err: any) {
      error.value = 'Failed to fetch Matrix rooms'
      console.error('Error fetching Matrix rooms:', err)
      return []
    } finally {
      loading.value = false
    }
  }

  const createMatrixRoom = async (name: string, isPublic: boolean = false) => {
    try {
      loading.value = true
      
      if (!currentUser.value) {
        throw new Error('User not logged in')
      }

      const response = await matrixAPI.createRoom({
        name: name,
        public: isPublic,
        topic: ''
      })
      
      if (response.data.success) {
        const newRoom: MatrixRoom = {
          id: response.data.roomId,
          name,
          type: isPublic ? 'public' : 'private',
          isPublic,
          memberCount: 1,
          members: [currentUser.value.id],
          unreadCount: 0,
          encrypted: false,
          joinRule: isPublic ? 'public' : 'invite',
          historyVisibility: 'shared'
        }
        
        rooms.value.unshift(newRoom)
        saveRoomsToStorage() // 保存到localStorage
        return { success: true, room: newRoom }
      } else {
        throw new Error('Failed to create room')
      }
    } catch (err: any) {
      error.value = 'Failed to create Matrix room'
      console.error('Error creating Matrix room:', err)
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  // Matrix消息管理
  const fetchMatrixMessages = async (roomId: string, limit = 200, autoLoadMore = true) => {
    try {
      if (!matrixClient.value) {
        console.error('Matrix客户端未初始化')
        return []
      }

      console.log(`🔄 开始加载房间消息: ${roomId}`)

      let roomMessages: MatrixMessage[] = []

      // 特殊处理文件传输助手
      if (roomId === FILE_TRANSFER_ROOM_ID) {
        console.log('📁 加载文件传输助手消息')

        // 检查是否已有消息
        if (messages.value.has(roomId)) {
          console.log('📋 返回已缓存的文件传输助手消息')
          return messages.value.get(roomId) || []
        }

        // 创建欢迎消息
        const welcomeMessage: MatrixMessage = {
          id: 'welcome-msg-' + Date.now(),
          sender: 'system',
          content: '欢迎使用文件传输助手！\n\n您可以在这里：\n• 发送文件和图片\n• 保存重要消息\n• 进行文件管理\n\n开始发送您的第一个文件吧！',
          timestamp: Date.now(),
          roomId: roomId,
          type: 'm.room.message'
        }

        const welcomeMessages = [welcomeMessage]
        messages.value.set(roomId, welcomeMessages)
        console.log('✅ 文件传输助手欢迎消息已创建')
        return welcomeMessages
      }

      if (roomId === 'world') {
        // 世界频道消息从后端API获取
        try {
          const response = await matrixAPI.getWorldChannelMessages()
          console.log('World channel messages response:', response.data)

          if (response.data && Array.isArray(response.data)) {
            roomMessages = response.data.map((msg: any) => ({
              id: msg.id,
              roomId: 'world',
              content: msg.content,
              sender: msg.sender,
              senderName: msg.sender, // Matrix用户ID，可以后续优化显示名
              timestamp: msg.timestamp,
              type: 'm.room.message',
              eventId: msg.id,
              encrypted: false,
              status: 'sent' as const
            }))
          } else if (response.data && response.data.messages) {
            // 如果返回格式是 { messages: [...] }
            roomMessages = response.data.messages.map((msg: any) => ({
              id: msg.id,
              roomId: 'world',
              content: msg.content,
              sender: msg.sender,
              senderName: msg.sender,
              timestamp: msg.timestamp,
              type: 'm.room.message',
              eventId: msg.id,
              encrypted: false,
              status: 'sent' as const
            }))
          }
        } catch (error) {
          console.error('Failed to fetch world channel messages:', error)
          roomMessages = []
        }
      } else {
        // 使用Matrix客户端获取房间消息历史
        let room = matrixClient.value.getRoom(roomId)

        // 如果房间不存在，可能是刚创建的房间，等待同步
        if (!room) {
          console.log(`❌ 房间 ${roomId} 暂时不存在，等待同步...`)

          // 检查同步状态
          const syncState = matrixClient.value.getSyncState()
          console.log(`📊 当前同步状态: ${syncState}`)

          // 如果正在同步，等待同步完成
          if (syncState === 'SYNCING' || syncState === 'PREPARED') {
            console.log('⏳ 正在同步中，等待同步完成...')
            await new Promise(resolve => {
              const checkSync = () => {
                const currentState = matrixClient.value.getSyncState()
                if (currentState === 'SYNCING' || currentState === 'PREPARED') {
                  setTimeout(checkSync, 500)
                } else {
                  resolve(true)
                }
              }
              checkSync()
              // 最多等待10秒
              setTimeout(() => resolve(true), 10000)
            })
          } else {
            // 等待一段时间让Matrix客户端同步新房间
            await new Promise(resolve => setTimeout(resolve, 2000))
          }

          // 再次尝试获取房间
          room = matrixClient.value.getRoom(roomId)

          if (!room) {
            console.warn(`房间 ${roomId} 仍然不存在，尝试刷新房间列表`)
            // 尝试刷新房间列表
            try {
              await fetchMatrixRooms()
              room = matrixClient.value.getRoom(roomId)
              console.log(`🔄 刷新后房间状态: ${room ? '找到' : '仍未找到'}`)
            } catch (refreshError) {
              console.error('刷新房间列表失败:', refreshError)
            }
          }

          if (!room) {
            console.warn(`❌ 房间 ${roomId} 最终未找到`)
            return []
          }
        }

        // 检查房间权限和状态
        console.log(`🏠 房间信息:`, {
          roomId,
          name: room.name,
          myMembership: room.getMyMembership(),
          canSendMessage: room.maySendMessage(),
          isEncrypted: room.hasEncryptionStateEvent(),
          memberCount: room.getJoinedMemberCount(),
          visibility: room.getJoinRule()
        })

        // 获取房间的时间线事件
        const timeline = room.getLiveTimeline()
        let events = timeline.getEvents()

        // 如果事件很少，尝试加载更多历史消息
        if (events.length < 20) {
          console.log(`📚 当前事件较少(${events.length}条)，尝试加载更多历史消息...`)
          try {
            await matrixClient.value.scrollback(room, 200)
            events = timeline.getEvents()
            console.log(`📚 加载历史消息后，共有 ${events.length} 条事件`)
            
            // 如果仍然很少，继续加载更多
            if (events.length < 50) {
              console.log(`📚 事件仍然较少(${events.length}条)，继续加载更多历史消息...`)
              try {
                await matrixClient.value.scrollback(room, 500)
                events = timeline.getEvents()
                console.log(`📚 再次加载历史消息后，共有 ${events.length} 条事件`)
              } catch (scrollError2) {
                console.warn('第二次加载历史消息失败:', scrollError2)
              }
            }
          } catch (scrollError) {
            console.warn('加载历史消息失败:', scrollError)
          }
        }

        if (events && events.length > 0) {
          console.log(`📨 获取到 ${events.length} 条事件`)

          // 调试：显示所有事件类型
          const eventTypes = events.map((event: any) => event.getType())
          console.log(`🔍 事件类型分布:`, eventTypes)

          // 过滤消息事件
          const messageEvents = events.filter((event: any) => event.getType() === 'm.room.message')
          console.log(`💬 消息事件数量: ${messageEvents.length}`)

          // 调试：显示被过滤掉的事件
          const nonMessageEvents = events.filter((event: any) => event.getType() !== 'm.room.message')
          if (nonMessageEvents.length > 0) {
            console.log(`🚫 非消息事件:`, nonMessageEvents.map((e: any) => e.getType()))
          }

          roomMessages = messageEvents
            .map((event: any) => {
              const eventContent = event.getContent()
              let content = eventContent?.body || eventContent?.formatted_body || ''

              console.log(`📝 处理消息事件:`, {
                id: event.getId(),
                type: event.getType(),
                msgtype: eventContent?.msgtype,
                sender: event.getSender(),
                content: content.substring(0, 50) + (content.length > 50 ? '...' : ''),
                timestamp: new Date(event.getTs()).toLocaleString(),
                hasUrl: !!eventContent?.url,
                url: eventContent?.url,
                filename: eventContent?.filename
              })

              const message: MatrixMessage = {
                id: event.getId(),
                roomId,
                content,
                sender: event.getSender(),
                senderName: event.getSender(), // 可以后续优化为显示名
                timestamp: event.getTs(),
                type: event.getType(),
                eventId: event.getId(),
                encrypted: !!eventContent?.algorithm,
                status: 'sent' as const
              }

              // 处理文件消息
              if (eventContent?.msgtype === 'm.image' || eventContent?.msgtype === 'm.file') {
                const isImage = eventContent.msgtype === 'm.image'
                const fileUrl = eventContent.url ? matrixClient.value?.mxcUrlToHttp(eventContent.url) : null

                console.log(`📎 处理文件消息:`, {
                  msgtype: eventContent.msgtype,
                  filename: eventContent.filename,
                  body: eventContent.body,
                  url: eventContent.url,
                  httpUrl: fileUrl,
                  info: eventContent.info
                })

                if (fileUrl) {
                  message.fileInfo = {
                    name: eventContent.filename || eventContent.body || 'Unknown file',
                    size: eventContent.info?.size || 0,
                    type: eventContent.info?.mimetype || 'application/octet-stream',
                    url: fileUrl,
                    isImage
                  }

                  // 更新消息内容显示
                  message.content = `${isImage ? '🖼️' : '📎'} ${message.fileInfo.name}`
                  if (message.fileInfo.size > 0) {
                    message.content += ` (${formatFileSize(message.fileInfo.size)})`
                  }
                }
              }

              return message
            })
            .slice(-limit) // 只取最后的limit条消息
        }
      }

      messages.value.set(roomId, roomMessages)
      console.log(`✅ 房间 ${roomId} 消息加载完成，共 ${roomMessages.length} 条`)

      // 如果启用了自动加载更多，且消息数量较少，自动分页加载
      if (autoLoadMore && roomMessages.length < 50) {
        console.log(`🔄 检测到消息数量较少(${roomMessages.length}条)，启动自动分页加载...`)
        try {
          await autoLoadMoreHistory(roomId, 1000) // 尝试加载最多1000条消息
          // 重新获取更新后的消息
          const updatedMessages = messages.value.get(roomId) || []
          console.log(`✅ 自动分页加载后，房间 ${roomId} 共有 ${updatedMessages.length} 条消息`)
        } catch (error) {
          console.warn('⚠️ 自动分页加载失败:', error)
        }
      }

      return roomMessages
    } catch (err: any) {
      error.value = 'Failed to fetch Matrix messages'
      console.error('Error fetching Matrix messages:', err)
      // 如果加载失败，至少设置一个空数组
      messages.value.set(roomId, [])
      return []
    }
  }

  // 上传文件到Matrix
  const uploadFileToMatrix = async (file: File): Promise<string | null> => {
    if (!matrixClient.value) {
      throw new Error('Matrix客户端未初始化')
    }

    try {
      console.log(`📤 开始上传文件: ${file.name} (${file.size} bytes)`)

      // 上传文件到Matrix媒体仓库
      const response = await matrixClient.value.uploadContent(file, {
        name: file.name,
        type: file.type,
        rawResponse: false,
        onlyContentUri: true
      })

      console.log('✅ 文件上传成功:', response)
      return response as string
    } catch (error) {
      console.error('❌ 文件上传失败:', error)
      throw error
    }
  }

  // 创建认证的图片URL
  const createAuthenticatedImageUrl = async (mxcUrl: string): Promise<string | null> => {
    if (!matrixClient.value) return null

    try {
      console.log('🔐 尝试创建认证图片URL:', mxcUrl)

      // 获取认证的URL
      const authUrl = matrixClient.value.mxcUrlToHttp(mxcUrl, undefined, undefined, undefined, false, true, true)
      if (!authUrl) {
        console.log('❌ 无法生成认证URL')
        return null
      }

      console.log('🌐 使用认证URL获取图片:', authUrl)

      // 使用fetch获取图片数据，带上认证头
      const response = await fetch(authUrl, {
        headers: {
          'Authorization': `Bearer ${matrixClient.value.getAccessToken()}`
        }
      })

      if (!response.ok) {
        console.log('❌ 图片获取失败:', response.status, response.statusText)
        return null
      }

      // 创建blob URL
      const blob = await response.blob()
      const blobUrl = URL.createObjectURL(blob)
      console.log('✅ 创建blob URL成功:', blobUrl)

      return blobUrl
    } catch (error) {
      console.error('❌ 创建认证图片URL失败:', error)
      return null
    }
  }

  // 格式化文件大小
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // 将文件转换为base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  // 发送文件消息到Matrix房间
  const sendFileMessage = async (roomId: string, file: File, contentUri: string): Promise<void> => {
    // 特殊处理文件传输助手
    if (roomId === FILE_TRANSFER_ROOM_ID) {
      console.log('📁 发送文件到文件传输助手')

      const isImage = file.type.startsWith('image/')
      let fileUrl = ''

      try {
        // 对于图片，转换为base64以便持久化存储
        if (isImage) {
          fileUrl = await fileToBase64(file)
        } else {
          // 对于非图片文件，创建临时URL
          fileUrl = URL.createObjectURL(file)
        }
      } catch (error) {
        console.error('文件处理失败:', error)
        fileUrl = ''
      }

      const fileMessage: MatrixMessage = {
        id: 'file-' + Date.now(),
        roomId,
        content: `${isImage ? '🖼️' : '📎'} ${file.name} (${formatFileSize(file.size)})`,
        sender: currentUser.value?.id || 'user',
        senderName: currentUser.value?.displayName || currentUser.value?.username || 'User',
        timestamp: Date.now(),
        type: 'm.room.message',
        fileInfo: {
          name: file.name,
          size: file.size,
          type: file.type,
          url: fileUrl,
          isImage
        }
      }

      // 添加到消息列表
      const currentMessages = messages.value.get(roomId) || []
      messages.value.set(roomId, [...currentMessages, fileMessage])

      // 保存到localStorage
      saveMessagesToStorage()

      console.log('✅ 文件已保存到文件传输助手')
      return
    }

    if (!matrixClient.value) {
      throw new Error('Matrix客户端未初始化')
    }

    try {
      const isImage = file.type.startsWith('image/')
      const msgType = isImage ? 'm.image' : 'm.file'

      const content: any = {
        msgtype: msgType,
        body: file.name,
        filename: file.name,
        info: {
          size: file.size,
          mimetype: file.type
        },
        url: contentUri
      }

      // 如果是图片，添加图片特定信息
      if (isImage) {
        // 可以在这里添加图片尺寸等信息
        content.info.w = undefined // 宽度
        content.info.h = undefined // 高度
      }

      await matrixClient.value.sendEvent(roomId, 'm.room.message', content)
      console.log(`✅ 文件消息发送成功: ${file.name}`)
    } catch (error) {
      console.error('❌ 发送文件消息失败:', error)
      throw error
    }
  }

  const sendMatrixMessage = async (roomId: string, content: string) => {
    try {
      if (!currentUser.value) {
        throw new Error('User not logged in')
      }

      // 特殊处理文件传输助手
      if (roomId === FILE_TRANSFER_ROOM_ID) {
        console.log('📁 发送消息到文件传输助手')

        const newMessage: MatrixMessage = {
          id: 'msg-' + Date.now(),
          roomId,
          content,
          sender: currentUser.value.id,
          senderName: currentUser.value.displayName || currentUser.value.username,
          timestamp: Date.now(),
          type: 'm.room.message'
        }

        // 添加到消息列表
        const currentMessages = messages.value.get(roomId) || []
        messages.value.set(roomId, [...currentMessages, newMessage])

        console.log('✅ 文件传输助手消息已保存')
        return newMessage
      }

      // 如果是测试用户，直接添加到本地消息
      if (currentUser.value.username === 'testuser') {
        const newMessage: MatrixMessage = {
          id: Date.now().toString(),
          roomId,
          content,
          sender: currentUser.value.id,
          senderName: currentUser.value.displayName || 'Test User',
          timestamp: Date.now(),
          type: 'm.room.message',
          status: 'sent'
        }

        // 添加到本地消息列表
        const roomMessages = messages.value.get(roomId) || []
        messages.value.set(roomId, [...roomMessages, newMessage])

        // 更新房间最后消息
        const room = roomId === 'world' ? worldChannel.value : rooms.value.find(r => r.id === roomId)
        if (room) {
          room.lastMessage = newMessage
        }

        return newMessage
      }

      // 尝试真实的Matrix消息发送
      if (matrixClient.value) {
        // 检查房间是否加密
        const matrixRoom = matrixClient.value.getRoom(roomId)
        const isEncrypted = matrixRoom?.hasEncryptionStateEvent()

        if (isEncrypted) {
          console.log('🔐 检测到加密房间，检查加密支持...')
          const crypto = matrixClient.value.getCrypto()
          if (!crypto) {
            console.warn('⚠️ 房间需要加密但客户端不支持加密')
            throw new Error('🔐 此房间启用了端到端加密，当前版本暂不支持。\n\n💡 建议：\n• 选择非加密房间进行聊天\n• 或在Element等客户端中关闭房间加密\n• 加密功能正在开发中，敬请期待！')
          } else {
            console.log('✅ 客户端支持加密，准备发送加密消息')

            // 检查房间成员的设备状态
            try {
              const roomMembers = matrixRoom.getJoinedMembers()
              console.log(`🔍 检查房间成员设备状态 (${roomMembers.length} 个成员)`)

              // 确保我们有所有成员的设备密钥
              for (const member of roomMembers) {
                const userId = member.userId
                try {
                  const devices = await crypto.getUserDevices(userId)
                  console.log(`👤 用户 ${userId} 有 ${devices.size} 个设备`)
                } catch (deviceError) {
                  console.warn(`⚠️ 无法获取用户 ${userId} 的设备信息:`, deviceError)
                }
              }
            } catch (memberError) {
              console.warn('⚠️ 检查成员设备状态时出错:', memberError)
            }
          }
        }

        // 使用Matrix客户端发送消息
        console.log(`📤 发送消息到房间 ${roomId} (加密: ${isEncrypted ? '是' : '否'})`)

        // 先发送消息，成功后再添加到本地列表
        const response = await matrixClient.value.sendTextMessage(roomId, content)
        console.log('✅ Matrix消息发送成功:', response)

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

        // 只有发送成功后才添加到本地消息列表
        const roomMessages = messages.value.get(roomId) || []
        const existingMessage = roomMessages.find(m => m.id === newMessage.id)
        if (!existingMessage) {
          messages.value.set(roomId, [...roomMessages, newMessage])
          console.log('✅ 消息已添加到本地列表')
        }

        // 更新房间最后消息
        const targetRoom = rooms.value.find(r => r.id === roomId)
        if (targetRoom) {
          targetRoom.lastMessage = newMessage
        }

        return newMessage
      } else {
        // 如果没有Matrix客户端，尝试通过API发送
        const response = await matrixAPI.sendMessage({
          roomId,
          content,
          type: 'm.text'
        })
        console.log('API send message response:', response.data)

        // 处理API响应格式
        let messageInfo = response.data
        if (response.data.success) {
          messageInfo = response.data.messageInfo || response.data
        }

        const newMessage: MatrixMessage = {
          id: messageInfo.id || messageInfo.eventId || Date.now().toString(),
          roomId,
          content,
          sender: messageInfo.sender?.username || currentUser.value.username,
          senderName: messageInfo.sender?.displayName || currentUser.value.displayName || currentUser.value.username,
          timestamp: messageInfo.timestamp || Date.now(),
          type: 'm.room.message',
          eventId: messageInfo.id || messageInfo.eventId,
          encrypted: false,
          status: 'sent' as const
        }

        // 添加到本地消息列表
        const roomMessages = messages.value.get(roomId) || []
        messages.value.set(roomId, [...roomMessages, newMessage])

        // 更新房间最后消息
        const targetRoom = roomId === 'world' ? worldChannel.value : rooms.value.find(r => r.id === roomId)
        if (targetRoom) {
          targetRoom.lastMessage = newMessage
        }

        return newMessage
      }
    } catch (err: any) {
      error.value = 'Failed to send Matrix message'
      console.error('❌ Matrix消息发送失败:', err)

      // 如果是加密错误，提供更友好的错误信息
      if (err.message && err.message.includes('encryption')) {
        const friendlyError = new Error('🔐 此房间启用了端到端加密，当前版本暂不支持。\n\n💡 建议：\n• 选择非加密房间进行聊天\n• 或在Element等客户端中关闭房间加密\n• 加密功能正在开发中，敬请期待！')
        throw friendlyError
      }

      throw err
    }
  }

  // Matrix同步
  const startMatrixSync = async (username: string) => {
    try {
      connection.value.syncState.isActive = true
      
      const response = await matrixAPI.sync({ 
        username, 
        since: connection.value.syncState.nextBatch 
      })
      
      if (response.data.success) {
        connection.value.syncState.nextBatch = response.data.syncResult.nextBatch
        connection.value.syncState.lastSync = Date.now()
        
        // 处理同步事件
        const events = response.data.syncResult.events || []
        events.forEach((event: any) => {
          if (event.type === 'message') {
            addMatrixMessage(event.roomId, {
              id: event.eventId,
              roomId: event.roomId,
              content: event.content,
              sender: event.sender,
              timestamp: event.timestamp,
              type: 'message',
              eventId: event.eventId,
              encrypted: event.encrypted || false
            })
          }
        })
      }
    } catch (err: any) {
      console.error('Matrix sync error:', err)
      connection.value.syncState.isActive = false
      connection.value.syncState.syncError = err.message
    }
  }

  // 辅助方法
  const setCurrentRoom = (roomId: string | null) => {
    currentRoomId.value = roomId
    
    // 获取房间消息
    if (roomId && !messages.value.has(roomId)) {
      fetchMatrixMessages(roomId)
    }
    
    // 标记房间为已读
    if (roomId) {
      markRoomAsRead(roomId)
    }
  }

  const addMatrixMessage = (roomId: string, message: MatrixMessage) => {
    const roomMessages = messages.value.get(roomId) || []
    messages.value.set(roomId, [...roomMessages, message])
    
    // 更新房间状态
    const room = roomId === 'world' ? worldChannel.value : rooms.value.find(r => r.id === roomId)
    if (room) {
      room.lastMessage = message
      if (currentRoomId.value !== roomId) {
        room.unreadCount++
      }
    }
  }

  const markRoomAsRead = (roomId: string) => {
    const room = roomId === 'world' ? worldChannel.value : rooms.value.find(r => r.id === roomId)
    if (room) {
      room.unreadCount = 0
    }
  }

  const addRoom = (room: MatrixRoom) => {
    // 检查房间是否已存在
    const existingRoomIndex = rooms.value.findIndex(r => r.id === room.id)
    if (existingRoomIndex === -1) {
      // 房间不存在，添加到列表
      // 确保文件传输助手始终在最前面
      const fileTransferIndex = rooms.value.findIndex(r => r.isFileTransferRoom)
      if (fileTransferIndex >= 0) {
        // 在文件传输助手后面插入新房间
        rooms.value.splice(fileTransferIndex + 1, 0, room)
      } else {
        // 如果没有文件传输助手，添加到开头
        rooms.value.unshift(room)
      }
      
      saveRoomsToStorage() // 保存到localStorage
      console.log(`✅ 房间 "${room.name}" 已添加到房间列表 (位置: ${fileTransferIndex >= 0 ? fileTransferIndex + 1 : 0})`)
      
      // 强制触发响应式更新
      nextTick(() => {
        console.log(`📊 房间列表更新后总数: ${rooms.value.length}`)
      })
    } else {
      // 房间已存在，更新房间信息
      const existingRoom = rooms.value[existingRoomIndex]
      Object.assign(existingRoom, {
        ...room,
        // 保留一些现有的状态
        unreadCount: existingRoom.unreadCount,
        lastMessage: existingRoom.lastMessage || room.lastMessage
      })
      
      saveRoomsToStorage()
      console.log(`🔄 房间 "${room.name}" 信息已更新`)
    }
  }

  const clearError = () => {
    error.value = null
  }

  const disconnect = () => {
    connection.value.connected = false
    connection.value.accessToken = undefined
    connection.value.userId = undefined
    connection.value.syncState.isActive = false
    currentUser.value = null
    rooms.value = []
    messages.value.clear()
    onlineUsers.value.clear()
  }

  // 加载更多历史消息
  const loadMoreHistoryMessages = async (roomId: string): Promise<MatrixMessage[]> => {
    if (!matrixClient?.value) {
      console.error('Matrix客户端未初始化')
      return []
    }

    try {
      console.log(`📚 加载房间 ${roomId} 的更多历史消息...`)
      const room = matrixClient.value.getRoom(roomId)
      if (!room) {
        throw new Error('找不到房间')
      }

      // 获取当前时间线事件数量
      const timeline = room.getLiveTimeline()
      const currentEventCount = timeline.getEvents().length
      console.log(`📊 当前时间线事件数量: ${currentEventCount}`)

      // 使用 scrollback 方法加载更多历史消息
      const limit = 500 // 增加到每次加载500条
      console.log(`🔄 开始加载 ${limit} 条历史消息...`)

      await matrixClient.value.scrollback(room, limit)

      // 获取更新后的事件
      const updatedEvents = timeline.getEvents()
      const newEventCount = updatedEvents.length
      console.log(`📊 加载后事件数量: ${newEventCount}，新增: ${newEventCount - currentEventCount}`)

      // 只处理新加载的消息事件
      const newEvents = updatedEvents.slice(0, newEventCount - currentEventCount)
      const newMessages: MatrixMessage[] = newEvents
        .filter((event: any) => event.getType() === 'm.room.message')
        .map((event: any): MatrixMessage | null => {
          try {
            const eventContent = event.getContent()
            const message: MatrixMessage = {
              id: event.getId(),
              roomId: roomId,
              content: eventContent?.body || eventContent?.formatted_body || '',
              sender: event.getSender(),
              timestamp: event.getTs(),
              type: event.getType(),
              eventId: event.getId(),
              encrypted: !!eventContent?.algorithm,
              senderName: event.getSender(), // 可以后续优化为显示名
              status: 'sent' as const
            }

            // 处理文件消息
            if (eventContent?.msgtype === 'm.image' || eventContent?.msgtype === 'm.file') {
              const isImage = eventContent.msgtype === 'm.image'
              // 处理不同的URL格式
              let mxcUrl = eventContent.url
              if (typeof mxcUrl === 'object' && mxcUrl?.content_uri) {
                mxcUrl = mxcUrl.content_uri
              }
              // 尝试多种URL格式
              let fileUrl = null
              if (mxcUrl && matrixClient.value) {
                console.log('🔍 [历史消息] 开始URL转换，MXC URL:', mxcUrl)

                // 首先尝试不需要认证的URL
                const unauthUrl = matrixClient.value.mxcUrlToHttp(mxcUrl, undefined, undefined, undefined, false, true, false)
                console.log('🔗 [历史消息] 未认证URL结果:', unauthUrl)

                // 然后尝试认证URL
                const authUrl = matrixClient.value.mxcUrlToHttp(mxcUrl, undefined, undefined, undefined, false, true, true)
                console.log('🔗 [历史消息] 认证URL结果:', authUrl)

                // 优先使用未认证URL，如果不可用则使用认证URL
                fileUrl = unauthUrl || authUrl
                console.log('🎯 [历史消息] 最终选择的URL:', fileUrl)
              }

              if (fileUrl) {
                message.fileInfo = {
                  name: eventContent.filename || eventContent.body || 'Unknown file',
                  size: eventContent.info?.size || 0,
                  type: eventContent.info?.mimetype || 'application/octet-stream',
                  url: fileUrl,
                  isImage,
                  mxcUrl: mxcUrl // 保存原始MXC URL用于重试
                } as any

                // 更新消息内容显示
                if (message.fileInfo) {
                  message.content = `${isImage ? '🖼️' : '📎'} ${message.fileInfo.name}`
                  if (message.fileInfo.size > 0) {
                    message.content += ` (${formatFileSize(message.fileInfo.size)})`
                  }
                }
              }
            }

            return message
          } catch (eventError) {
            console.warn('处理历史消息事件失败:', eventError, event)
            return null
          }
        })
        .filter((msg: MatrixMessage | null): msg is MatrixMessage => msg !== null)

      // 更新消息列表 - 将新消息添加到开头
      if (messages.value.has(roomId)) {
        const currentMessages = messages.value.get(roomId) || []
        // 避免重复消息
        const existingIds = new Set(currentMessages.map(m => m.id))
        const uniqueNewMessages = newMessages.filter(m => !existingIds.has(m.id))

        if (uniqueNewMessages.length > 0) {
          messages.value.set(roomId, [...uniqueNewMessages, ...currentMessages])
          console.log(`✅ 成功加载了 ${uniqueNewMessages.length} 条新的历史消息`)
        } else {
          console.log('📝 没有新的历史消息')
        }
      } else {
        // 如果是第一次加载消息
        messages.value.set(roomId, newMessages)
        console.log(`✅ 首次加载了 ${newMessages.length} 条历史消息`)
      }

      return newMessages

    } catch (error) {
      console.error('加载历史消息失败:', error)
      // 提供更友好的错误信息
      if (error instanceof Error) {
        if (error.message.includes('scrollback')) {
          throw new Error('无法加载更多历史消息，可能已到达消息历史的开始')
        } else if (error.message.includes('network')) {
          throw new Error('网络连接问题，请检查网络后重试')
        }
      }
      throw error
    }
  }

  // 消息编辑功能
  const editMessage = async (roomId: string, eventId: string, newContent: string): Promise<void> => {
    if (!matrixClient?.value) {
      throw new Error('Matrix客户端未初始化')
    }

    try {
      console.log(`✏️ 编辑消息: ${eventId} -> ${newContent}`)

      // 发送编辑事件
      await matrixClient.value.sendEvent(roomId, 'm.room.message', {
        msgtype: 'm.text',
        body: '* ' + newContent, // 编辑后的内容，前缀*表示编辑
        format: 'org.matrix.custom.html',
        formatted_body: '* ' + newContent,
        'm.new_content': {
          msgtype: 'm.text',
          body: newContent,
          format: 'org.matrix.custom.html',
          formatted_body: newContent
        },
        'm.relates_to': {
          rel_type: 'm.replace',
          event_id: eventId
        }
      })

      console.log('✅ 消息编辑成功')
      
      // 更新本地消息状态
      const roomMessages = messages.value.get(roomId) || []
      const messageIndex = roomMessages.findIndex(msg => msg.eventId === eventId)
      if (messageIndex !== -1) {
        roomMessages[messageIndex].content = newContent
        roomMessages[messageIndex].isEdited = true
        messages.value.set(roomId, [...roomMessages])
      }

    } catch (error) {
      console.error('❌ 编辑消息失败:', error)
      throw error
    }
  }

  // 消息删除功能
  const deleteMessage = async (roomId: string, eventId: string, reason?: string): Promise<void> => {
    if (!matrixClient?.value) {
      throw new Error('Matrix客户端未初始化')
    }

    try {
      console.log(`🗑️ 删除消息: ${eventId}`)

      // 发送撤回事件
      await matrixClient.value.redactEvent(roomId, eventId, reason)

      console.log('✅ 消息删除成功')
      
      // 更新本地消息状态
      const roomMessages = messages.value.get(roomId) || []
      const messageIndex = roomMessages.findIndex(msg => msg.eventId === eventId)
      if (messageIndex !== -1) {
        roomMessages[messageIndex].isRedacted = true
        roomMessages[messageIndex].redactionReason = reason
        messages.value.set(roomId, [...roomMessages])
      }

    } catch (error) {
      console.error('❌ 删除消息失败:', error)
      throw error
    }
  }

  // 添加消息反应
  const addReaction = async (roomId: string, eventId: string, emoji: string): Promise<void> => {
    if (!matrixClient?.value) {
      throw new Error('Matrix客户端未初始化')
    }

    try {
      console.log(`😊 添加反应: ${emoji} -> ${eventId}`)

      // 发送反应事件
      await matrixClient.value.sendEvent(roomId, 'm.reaction', {
        'm.relates_to': {
          rel_type: 'm.annotation',
          event_id: eventId,
          key: emoji
        }
      })

      console.log('✅ 反应添加成功')
      
      // 更新本地反应状态
      updateLocalReaction(roomId, eventId, emoji, true)

    } catch (error) {
      console.error('❌ 添加反应失败:', error)
      throw error
    }
  }

  // 移除消息反应
  const removeReaction = async (roomId: string, eventId: string, emoji: string): Promise<void> => {
    if (!matrixClient?.value) {
      throw new Error('Matrix客户端未初始化')
    }

    try {
      console.log(`😐 移除反应: ${emoji} -> ${eventId}`)

      // 查找对应的反应事件ID
      const room = matrixClient.value.getRoom(roomId)
      if (!room) {
        throw new Error('房间不存在')
      }

      // 查找用户的反应事件
      const timeline = room.getLiveTimeline()
      const events = timeline.getEvents()
      
      const reactionEvent = events.find((event: any) => 
        event.getType() === 'm.reaction' &&
        event.getSender() === matrixClient.value?.getUserId() &&
        event.getContent()['m.relates_to']?.event_id === eventId &&
        event.getContent()['m.relates_to']?.key === emoji
      )

      if (reactionEvent) {
        // 撤回反应事件
        await matrixClient.value.redactEvent(roomId, reactionEvent.getId()!)
        console.log('✅ 反应移除成功')
        
        // 更新本地反应状态
        updateLocalReaction(roomId, eventId, emoji, false)
      }

    } catch (error) {
      console.error('❌ 移除反应失败:', error)
      throw error
    }
  }

  // 更新本地反应状态
  const updateLocalReaction = (roomId: string, eventId: string, emoji: string, hasReacted: boolean) => {
    const roomMessages = messages.value.get(roomId) || []
    const messageIndex = roomMessages.findIndex(msg => msg.eventId === eventId)
    
    if (messageIndex !== -1) {
      const message = roomMessages[messageIndex]
      if (!message.reactions) {
        message.reactions = {}
      }
      
      if (!message.reactions[emoji]) {
        message.reactions[emoji] = {
          count: 0,
          users: [],
          hasReacted: false
        }
      }
      
      const reaction = message.reactions[emoji]
      const userId = matrixClient.value?.getUserId() || ''
      
      if (hasReacted && !reaction.hasReacted) {
        reaction.count++
        reaction.users.push(userId)
        reaction.hasReacted = true
      } else if (!hasReacted && reaction.hasReacted) {
        reaction.count = Math.max(0, reaction.count - 1)
        reaction.users = reaction.users.filter(id => id !== userId)
        reaction.hasReacted = false
        
        // 如果没有人反应了，删除这个反应
        if (reaction.count === 0) {
          delete message.reactions[emoji]
        }
      }
      
      messages.value.set(roomId, [...roomMessages])
    }
  }

  // 消息搜索功能
  const searchMessages = async (roomId: string, query: string, limit: number = 50): Promise<any[]> => {
    if (!matrixClient?.value) {
      throw new Error('Matrix客户端未初始化')
    }

    try {
      console.log(`🔍 搜索消息: "${query}" in ${roomId}`)

      // 使用Matrix搜索API
      const searchResults = await matrixClient.value.searchMessageText({
        query: query,
        keys: ['content.body'],
        search_categories: {
          room_events: {
            keys: ['content.body'],
            filter: {
              rooms: [roomId]
            },
            order_by: 'recent',
            event_context: {
              before_limit: 1,
              after_limit: 1,
              include_profile: true
            }
          }
        }
      })

      console.log(`✅ 搜索完成，找到 ${searchResults.search_categories.room_events?.count || 0} 条结果`)
      
      return searchResults.search_categories.room_events?.results || []

    } catch (error) {
      console.error('❌ 搜索消息失败:', error)
      
      // 如果服务器不支持搜索，使用本地搜索
      return searchMessagesLocally(roomId, query, limit)
    }
  }

  // 本地消息搜索
  const searchMessagesLocally = (roomId: string, query: string, limit: number = 50): any[] => {
    const roomMessages = messages.value.get(roomId) || []
    const lowerQuery = query.toLowerCase()
    
    const results = roomMessages
      .filter(message => 
        message.content.toLowerCase().includes(lowerQuery) &&
        !message.isRedacted
      )
      .slice(0, limit)
      .map(message => ({
        result: {
          event_id: message.eventId,
          content: {
            body: message.content,
            msgtype: message.msgtype
          },
          sender: message.senderId,
          origin_server_ts: message.timestamp
        }
      }))

    console.log(`🔍 本地搜索完成，找到 ${results.length} 条结果`)
    return results
  }

  // 发送回复消息
  const sendReplyMessage = async (roomId: string, content: string, replyToEventId: string): Promise<void> => {
    if (!matrixClient?.value) {
      throw new Error('Matrix客户端未初始化')
    }

    try {
      console.log(`↩️ 发送回复消息: ${content} -> ${replyToEventId}`)

      // 获取被回复的消息
      const room = matrixClient.value.getRoom(roomId)
      if (!room) {
        throw new Error('房间不存在')
      }

      const replyToEvent = room.findEventById(replyToEventId)
      if (!replyToEvent) {
        throw new Error('被回复的消息不存在')
      }

      // 构建回复消息内容
      const replyContent = {
        msgtype: 'm.text',
        body: `> <${replyToEvent.getSender()}> ${replyToEvent.getContent().body}\n\n${content}`,
        format: 'org.matrix.custom.html',
        formatted_body: `<mx-reply><blockquote><a href="https://matrix.to/#/${roomId}/${replyToEventId}">In reply to</a> <a href="https://matrix.to/#/${replyToEvent.getSender()}">${replyToEvent.getSender()}</a><br>${replyToEvent.getContent().body}</blockquote></mx-reply>${content}`,
        'm.relates_to': {
          'm.in_reply_to': {
            event_id: replyToEventId
          }
        }
      }

      // 发送回复消息
      await matrixClient.value.sendEvent(roomId, 'm.room.message', replyContent)

      console.log('✅ 回复消息发送成功')

    } catch (error) {
      console.error('❌ 发送回复消息失败:', error)
      throw error
    }
  }

  // 发送输入状态通知
  const sendTypingNotification = async (roomId: string, isTyping: boolean, timeout: number = 30000): Promise<void> => {
    if (!matrixClient?.value) {
      return
    }

    try {
      await matrixClient.value.sendTyping(roomId, isTyping, timeout)
    } catch (error) {
      console.warn('发送输入状态失败:', error)
    }
  }

  // 自动分页加载历史消息
  const autoLoadMoreHistory = async (roomId: string, maxMessages: number = 2000): Promise<void> => {
    if (!matrixClient?.value) {
      console.error('Matrix客户端未初始化')
      return
    }

    try {
      console.log(`🔄 开始自动分页加载房间 ${roomId} 的历史消息...`)
      const room = matrixClient.value.getRoom(roomId)
      if (!room) {
        throw new Error('找不到房间')
      }

      let totalMessages = 0
      const messagesPerBatch = 500 // 增加到每批加载500条

      // 持续加载直到达到最大数量或无法加载更多
      while (totalMessages < maxMessages) {
        const currentEventCount = room.getLiveTimeline().getEvents().length
        console.log(`📊 当前消息数量: ${currentEventCount}, 已加载: ${totalMessages}, 目标: ${maxMessages}`)

        if (currentEventCount >= maxMessages) {
          console.log('✅ 已达到目标消息数量，停止加载')
          break
        }

        const messagesToLoad = Math.min(messagesPerBatch, maxMessages - totalMessages)
        console.log(`🔄 开始加载 ${messagesToLoad} 条消息...`)

        try {
          await matrixClient.value.scrollback(room, messagesToLoad)
          const newEventCount = room.getLiveTimeline().getEvents().length
          const newlyLoaded = newEventCount - currentEventCount
          
          if (newlyLoaded === 0) {
            console.log('📚 已到达消息历史的开始，停止加载')
            break
          }

          totalMessages += newlyLoaded
          console.log(`✅ 成功加载了 ${newlyLoaded} 条新消息，累计: ${totalMessages}`)
          
          // 短暂延迟避免服务器压力
          await new Promise(resolve => setTimeout(resolve, 500))

        } catch (scrollError: any) {
          console.warn('⚠️ 加载批次消息失败:', scrollError)
          // 如果是无法加载更多，停止循环
          if (scrollError?.message && (scrollError.message.includes('scrollback') || scrollError.message.includes('start'))) {
            console.log('📚 已到达消息历史的开始，停止加载')
            break
          }
        }
      }

      console.log(`🎉 自动分页加载完成，总共加载了 ${totalMessages} 条消息`)
    } catch (error) {
      console.error('❌ 自动分页加载历史消息失败:', error)
    }
  }

  // 智能自动加载历史消息
  const smartAutoLoadHistory = async (roomId: string): Promise<void> => {
    if (!matrixClient?.value) {
      console.error('Matrix客户端未初始化')
      return
    }

    try {
      console.log(`🧠 开始智能自动加载房间 ${roomId} 的历史消息...`)
      const room = matrixClient.value.getRoom(roomId)
      if (!room) {
        throw new Error('找不到房间')
      }

      const timeline = room.getLiveTimeline()
      const currentEventCount = timeline.getEvents().length
      console.log(`📊 当前消息数量: ${currentEventCount}`)

      // 如果消息少于20条，说明可能是新房间或同步不完整，进行深度加载
      if (currentEventCount < 20) {
        console.log('🔍 检测到消息数量极少，启动深度加载模式...')
        await autoLoadMoreHistory(roomId, 3000) // 加载最多3000条
      }
      // 如果消息在20-100条之间，进行中等加载
      else if (currentEventCount < 100) {
        console.log('🔍 检测到消息数量较少，启动中等加载模式...')
        await autoLoadMoreHistory(roomId, 1500) // 加载最多1500条
      }
      // 如果消息在100-500条之间，进行轻量加载
      else if (currentEventCount < 500) {
        console.log('🔍 检测到消息数量一般，启动轻量加载模式...')
        await autoLoadMoreHistory(roomId, 800) // 加载最多800条
      }
      // 如果消息超过500条，说明已经加载了足够多的历史消息
      else {
        console.log('✅ 已经加载了足够多的历史消息，跳过自动加载')
      }
    } catch (error) {
      console.error('❌ 智能自动加载历史消息失败:', error)
    }
  }

  // 优化的fetchMatrixMessages函数
  const fetchMatrixMessagesOptimized = async (roomId: string, limit = 200, autoLoadMore = true) => {
    try {
      if (!matrixClient.value) {
        console.error('Matrix客户端未初始化')
        return []
      }

      console.log(`🚀 优化版开始加载房间消息: ${roomId}`)

      let roomMessages: MatrixMessage[] = []

      // 特殊处理文件传输助手
      if (roomId === FILE_TRANSFER_ROOM_ID) {
        console.log('📁 加载文件传输助手消息')
        if (messages.value.has(roomId)) {
          return messages.value.get(roomId) || []
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
        messages.value.set(roomId, welcomeMessages)
        return welcomeMessages
      }

      if (roomId === 'world') {
        // 世界频道消息从后端API获取
        try {
          const response = await matrixAPI.getWorldChannelMessages()
          if (response.data && Array.isArray(response.data)) {
            roomMessages = response.data.map((msg: any) => ({
              id: msg.id,
              roomId: 'world',
              content: msg.content,
              sender: msg.sender,
              senderName: msg.sender,
              timestamp: msg.timestamp,
              type: 'm.room.message',
              eventId: msg.id,
              encrypted: false,
              status: 'sent' as const
            }))
          } else if (response.data && response.data.messages) {
            roomMessages = response.data.messages.map((msg: any) => ({
              id: msg.id,
              roomId: 'world',
              content: msg.content,
              sender: msg.sender,
              senderName: msg.sender,
              timestamp: msg.timestamp,
              type: 'm.room.message',
              eventId: msg.id,
              encrypted: false,
              status: 'sent' as const
            }))
          }
        } catch (error) {
          console.error('Failed to fetch world channel messages:', error)
          roomMessages = []
        }
      } else {
        let room = matrixClient.value.getRoom(roomId)

        // 如果房间不存在，可能是刚创建的房间，等待同步
        if (!room) {
          console.log(`❌ 房间 ${roomId} 暂时不存在，等待同步...`)
          const syncState = matrixClient.value.getSyncState()
          console.log(`📊 当前同步状态: ${syncState}`)

          if (syncState === 'SYNCING' || syncState === 'PREPARED') {
            console.log('⏳ 正在同步中，等待同步完成...')
            await new Promise(resolve => {
              const checkSync = () => {
                const currentState = matrixClient.value.getSyncState()
                if (currentState === 'SYNCING' || currentState === 'PREPARED') {
                  setTimeout(checkSync, 500)
                } else {
                  resolve(true)
                }
              }
              checkSync()
              setTimeout(() => resolve(true), 10000)
            })
          }

          // 再次尝试获取房间
          room = matrixClient.value.getRoom(roomId)
          if (!room) {
            console.warn(`房间 ${roomId} 仍然不存在，尝试刷新房间列表`)
            try {
              await fetchMatrixRooms()
              room = matrixClient.value.getRoom(roomId)
            } catch (refreshError) {
              console.error('刷新房间列表失败:', refreshError)
            }
          }

          if (!room) {
            console.warn(`❌ 房间 ${roomId} 最终未找到`)
            return []
          }
        }

        // 检查房间权限和状态
        console.log(`🏠 房间信息:`, {
          roomId,
          name: room.name,
          myMembership: room.getMyMembership(),
          canSendMessage: room.maySendMessage(),
          memberCount: room.getJoinedMemberCount()
        })

        // 获取房间的时间线事件
        const timeline = room.getLiveTimeline()
        let events = timeline.getEvents()

        // 如果事件很少，尝试加载更多历史消息
        if (events.length < 20) {
          console.log(`📚 当前事件较少(${events.length}条)，启动智能加载...`)
          try {
            // 先尝试加载500条
            await matrixClient.value.scrollback(room, 500)
            events = timeline.getEvents()
            console.log(`📚 加载历史消息后，共有 ${events.length} 条事件`)
            
            // 如果仍然很少，继续加载更多
            if (events.length < 50) {
              console.log(`📚 事件仍然较少(${events.length}条)，继续加载更多历史消息...`)
              try {
                await matrixClient.value.scrollback(room, 1000)
                events = timeline.getEvents()
                console.log(`📚 再次加载历史消息后，共有 ${events.length} 条事件`)
              } catch (scrollError2) {
                console.warn('第二次加载历史消息失败:', scrollError2)
              }
            }
          } catch (scrollError) {
            console.warn('加载历史消息失败:', scrollError)
          }
        }

        if (events && events.length > 0) {
          console.log(`📨 获取到 ${events.length} 条事件`)
          const messageEvents = events.filter((event: any) => event.getType() === 'm.room.message')
          console.log(`💬 消息事件数量: ${messageEvents.length}`)

          roomMessages = messageEvents
            .map((event: any) => {
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
                status: 'sent' as const
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
        }
      }

      messages.value.set(roomId, roomMessages)
      console.log(`✅ 房间 ${roomId} 消息加载完成，共 ${roomMessages.length} 条`)

      // 如果启用了自动加载更多，且消息数量较少，启动智能自动加载
      if (autoLoadMore && roomMessages.length < 100) {
        console.log(`🔄 检测到消息数量较少(${roomMessages.length}条)，启动智能自动加载...`)
        try {
          await smartAutoLoadHistory(roomId)
          const updatedMessages = messages.value.get(roomId) || []
          console.log(`✅ 智能自动加载后，房间 ${roomId} 共有 ${updatedMessages.length} 条消息`)
        } catch (error) {
          console.warn('⚠️ 智能自动加载失败:', error)
        }
      }

      return roomMessages
    } catch (err: any) {
      error.value = 'Failed to fetch Matrix messages'
      console.error('Error fetching Matrix messages:', err)
      messages.value.set(roomId, [])
      return []
    }
  }

  return {
    // Matrix状态
    connection,
    matrixStatus,
    matrixFeatures,
    currentUser,
    onlineUsers,
    
    // 房间和消息
    rooms,
    worldChannel,
    currentRoomId,
    messages,
    
    // UI状态
    loading,
    error,
    
    // 计算属性
    currentRoom,
    currentMessages,
    sortedRooms,
    totalUnreadCount,
    isConnected,
    isLoggedIn,
    homeserver,
    syncStatus,

    // Matrix客户端
    matrixClient,

    // Matrix方法
    initializeMatrix,
    forceReconnect,
    retryMatrixInitialization,
    logout,
    loadWorldChannel,
    setClient,
    setLoginInfo,
    matrixLogin,
    fetchMatrixRooms,
    fetchRooms,
    joinRoomAndSync,
    createMatrixRoom,
    fetchMatrixMessages,
    fetchMatrixMessagesOptimized, // 新增优化版函数
    sendMatrixMessage,
    uploadFileToMatrix,
    sendFileMessage,
    startMatrixSync,
    diagnoseMatrixConnection,
    generateDebugReport,
    debugReset,
    startSync,
    cleanupMatrixClient,
    clearDeviceConflicts,

    // 辅助方法
    setCurrentRoom,
    addMatrixMessage,
    markRoomAsRead,
    addRoom,
    clearError,
    disconnect,
    loadMoreHistoryMessages,
    smartAutoLoadHistory, // 新增智能自动加载函数
    
    // 消息功能增强
    editMessage,
    deleteMessage,
    addReaction,
    removeReaction,
    searchMessages,
    sendReplyMessage,
    sendTypingNotification
  }
})
