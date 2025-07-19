import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { matrixAPI, roomAPI } from '@/services/api'
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
      // 首先加载房间列表（即使未登录也可以显示之前的房间）
      loadRoomsFromStorage()

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

      // 设置Matrix事件监听器（在启动客户端之前）
      console.log('🎧 设置Matrix事件监听器...')

      // 监听同步状态变化
      client.on('sync' as any, (state: string, prevState: string, data: any) => {
        try {
          console.log(`🔄 Matrix同步状态变化: ${prevState} -> ${state}`, data)
          connection.value.syncState = { isActive: state === 'SYNCING' }

          // 当同步完成时，尝试获取房间
          if (state === 'SYNCING' || state === 'PREPARED') {
            console.log('✅ 同步状态良好，尝试获取房间...')
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
          } else if (state === 'SYNCING' && prevState !== 'SYNCING') {
            console.log('🎯 首次同步完成，强制更新房间列表')
            // 首次同步完成时，立即更新房间列表
            setTimeout(async () => {
              try {
                await fetchMatrixRooms()
                console.log('✅ 首次同步后房间列表更新完成')
              } catch (error) {
                console.warn('首次同步后房间列表更新失败:', error)
              }
            }, 2000)
          }
        } catch (syncError) {
          console.error('❌ 同步事件处理失败:', syncError)
        }
      })

        // 监听房间事件
      client.on('Room' as any, (room: any) => {
        console.log('🏠 新房间事件:', room.roomId)
        // 当有新房间时，立即更新房间列表
        setTimeout(() => {
          try {
            const allRooms = client.getRooms()
            console.log(`📊 房间事件后获取到 ${allRooms.length} 个房间`)
            if (allRooms.length > 0) {
              const convertedRooms = allRooms.map((r: any) => ({
                id: r.roomId,
                name: r.name || r.roomId,
                type: 'private' as const,
                isPublic: false,
                memberCount: r.getJoinedMemberCount(),
                unreadCount: 0,
                encrypted: false
              }))

              rooms.value.splice(0, rooms.value.length, ...convertedRooms)
              saveRoomsToStorage()
              console.log('✅ 房间列表已通过房间事件更新')
            }
          } catch (roomError) {
            console.warn('处理房间事件时出错:', roomError)
          }
        }, 500)
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
          initialSyncLimit: 10,
          lazyLoadMembers: true
        })
        console.log('✅ Matrix客户端启动命令已发送')

        // 立即检查同步状态
        const immediateState = client.getSyncState()
        console.log('📊 启动后立即检查同步状态:', immediateState)

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
                client.startClient({ initialSyncLimit: 3 }).catch((err: any) => {
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

          const content = event.getContent()?.body || event.getContent()?.formatted_body || ''
          const newMessage: MatrixMessage = {
            id: event.getId(),
            roomId: room.roomId,
            content,
            sender: event.getSender(),
            senderName: event.getSender(),
            timestamp: event.getTs(),
            type: event.getType(),
            eventId: event.getId(),
            encrypted: !!event.getContent()?.algorithm,
            status: 'sent' as const
          }

          // 添加到消息列表
          const roomMessages = messages.value.get(room.roomId) || []
          const existingMessage = roomMessages.find(m => m.id === newMessage.id)
          if (!existingMessage) {
            messages.value.set(room.roomId, [...roomMessages, newMessage])
            console.log('✅ 新消息已添加到本地列表')

            // 更新房间最后消息
            const targetRoom = rooms.value.find(r => r.id === room.roomId)
            if (targetRoom) {
              targetRoom.lastMessage = newMessage
            }
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
            initialSyncLimit: 20, // 增加初始同步限制
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
              initialSyncLimit: 50, // 增加同步限制
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

      // 更新房间列表
      rooms.value.splice(0, rooms.value.length, ...fetchedRooms)
      saveRoomsToStorage()
      console.log(`✅ 房间列表已更新，共 ${fetchedRooms.length} 个房间`)

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
  const fetchMatrixMessages = async (roomId: string, limit = 50) => {
    try {
      if (!matrixClient.value) {
        console.error('Matrix客户端未初始化')
        return []
      }

      console.log(`🔄 开始加载房间消息: ${roomId}`)

      let roomMessages: MatrixMessage[] = []

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
        if (events.length < 10) {
          console.log(`📚 当前事件较少(${events.length}条)，尝试加载更多历史消息...`)
          try {
            await matrixClient.value.scrollback(room, 30)
            events = timeline.getEvents()
            console.log(`📚 加载历史消息后，共有 ${events.length} 条事件`)
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
              const content = event.getContent()?.body || event.getContent()?.formatted_body || ''
              console.log(`📝 处理消息事件:`, {
                id: event.getId(),
                type: event.getType(),
                sender: event.getSender(),
                content: content.substring(0, 50) + (content.length > 50 ? '...' : ''),
                timestamp: new Date(event.getTs()).toLocaleString()
              })

              return {
                id: event.getId(),
                roomId,
                content,
                sender: event.getSender(),
                senderName: event.getSender(), // 可以后续优化为显示名
                timestamp: event.getTs(),
                type: event.getType(),
                eventId: event.getId(),
                encrypted: !!event.getContent()?.algorithm,
                status: 'sent' as const
              }
            })
            .slice(-limit) // 只取最后的limit条消息
        }
      }

      messages.value.set(roomId, roomMessages)
      console.log(`✅ 房间 ${roomId} 消息加载完成，共 ${roomMessages.length} 条`)
      return roomMessages
    } catch (err: any) {
      error.value = 'Failed to fetch Matrix messages'
      console.error('Error fetching Matrix messages:', err)
      // 如果加载失败，至少设置一个空数组
      messages.value.set(roomId, [])
      return []
    }
  }

  const sendMatrixMessage = async (roomId: string, content: string) => {
    try {
      if (!currentUser.value) {
        throw new Error('User not logged in')
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
    const existingRoom = rooms.value.find(r => r.id === room.id)
    if (!existingRoom) {
      rooms.value.unshift(room)
      saveRoomsToStorage() // 保存到localStorage
      console.log(`房间 "${room.name}" 已添加到房间列表`)
    } else {
      console.log(`房间 "${room.name}" 已存在于房间列表中`)
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
      const limit = 30 // 每次加载30条
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
            const content = event.getContent()
            return {
              id: event.getId(),
              roomId: roomId,
              content: content?.body || content?.formatted_body || '',
              sender: event.getSender(),
              timestamp: event.getTs(),
              type: event.getType(),
              eventId: event.getId(),
              encrypted: !!content?.algorithm,
              senderName: event.getSender(), // 可以后续优化为显示名
              status: 'sent' as const
            }
          } catch (eventError) {
            console.warn('处理历史消息事件失败:', eventError, event)
            return null
          }
        })
        .filter((msg): msg is MatrixMessage => msg !== null)

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
    retryMatrixInitialization,
    logout,
    loadWorldChannel,
    setClient,
    setLoginInfo,
    matrixLogin,
    fetchMatrixRooms,
    fetchRooms,
    createMatrixRoom,
    fetchMatrixMessages,
    sendMatrixMessage,
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
    loadMoreHistoryMessages
  }
})
