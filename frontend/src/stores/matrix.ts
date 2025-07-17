import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { matrixAPI, roomAPI } from '@/services/api'

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
        lastActivity: room.lastActivity || Date.now()
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

  // 设置Matrix客户端
  const setClient = async (client: any) => {
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

    // 持久化保存登录信息到localStorage
    const persistentData = {
      userId: info.userId,
      accessToken: info.accessToken,
      deviceId: info.deviceId,
      homeserver: info.homeserver,
      loginTime: Date.now()
    }
    localStorage.setItem('matrix-login-info', JSON.stringify(persistentData))

    console.log('Matrix login info set and persisted:', info)
  }

  // 初始化Matrix状态（从localStorage恢复登录信息和房间列表）
  const initializeMatrix = async () => {
    try {
      // 首先加载房间列表（即使未登录也可以显示之前的房间）
      loadRoomsFromStorage()

      const savedLoginInfo = localStorage.getItem('matrix-login-info')
      if (savedLoginInfo) {
        const loginData = JSON.parse(savedLoginInfo)

        // 检查登录信息是否过期（24小时）
        const loginAge = Date.now() - loginData.loginTime
        const maxAge = 24 * 60 * 60 * 1000 // 24小时

        if (loginAge < maxAge) {
          console.log('Restoring Matrix login from localStorage:', loginData)

          // 恢复登录状态
          await setLoginInfo(loginData)

          // 重新创建Matrix客户端
          await createMatrixClient(loginData.userId, loginData.accessToken, loginData.homeserver)

          // 登录成功后，刷新房间列表
          try {
            await fetchMatrixRooms()
          } catch (error) {
            console.warn('Failed to refresh rooms after login restore:', error)
          }

          console.log('Matrix login restored successfully')
          return true
        } else {
          console.log('Saved Matrix login expired, clearing localStorage')
          localStorage.removeItem('matrix-login-info')
        }
      }
    } catch (error) {
      console.error('Failed to restore Matrix login:', error)
      localStorage.removeItem('matrix-login-info')
    }
    return false
  }

  // 登出函数
  const logout = () => {
    // 清除内存状态
    connection.value = {
      connected: false,
      homeserver: 'https://matrix.jianluochat.com',
      syncState: { isActive: false }
    }
    currentUser.value = null
    loginInfo.value = null
    matrixClient.value = null

    // 清除localStorage
    localStorage.removeItem('matrix-login-info')

    console.log('Matrix logout completed')
  }

  // 创建Matrix客户端实例
  const createMatrixClient = async (userId: string, accessToken: string, homeserver: string) => {
    try {
      // 动态导入matrix-js-sdk
      const { createClient } = await import('matrix-js-sdk')

      const client = createClient({
        baseUrl: `https://${homeserver}`,
        accessToken: accessToken,
        userId: userId,
        deviceId: 'jianluochat_web_client',
        timelineSupport: true,
        unstableClientRelationAggregation: true
      })

      // 设置客户端
      matrixClient.value = client
      console.log('Matrix client created successfully:', client)

      // 启动客户端
      await client.startClient({ initialSyncLimit: 10 })

      return client
    } catch (error) {
      console.error('Failed to create Matrix client:', error)
      throw error
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

  // Matrix房间管理
  const fetchMatrixRooms = async () => {
    try {
      loading.value = true

      // 如果有Matrix客户端，直接从客户端获取房间
      if (matrixClient.value) {
        const clientRooms = matrixClient.value.getRooms()
        const fetchedRooms = clientRooms.map((room: any) => ({
          id: room.roomId,
          name: room.name || room.roomId,
          alias: room.getCanonicalAlias(),
          topic: room.currentState.getStateEvents('m.room.topic', '')?.getContent()?.topic || '',
          type: room.getJoinRule() === 'public' ? 'public' : 'private',
          isPublic: room.getJoinRule() === 'public',
          memberCount: room.getJoinedMemberCount() || 0,
          members: [],
          unreadCount: room.getUnreadNotificationCount() || 0,
          encrypted: room.hasEncryptionStateEvent(),
          joinRule: room.getJoinRule() || 'invite',
          historyVisibility: room.getHistoryVisibility() || 'shared',
          lastActivity: Date.now()
        }))

        // 更新房间列表
        rooms.value.splice(0, rooms.value.length, ...fetchedRooms)
        saveRoomsToStorage()
        return rooms.value
      }

      // 如果没有Matrix客户端，尝试从API获取
      const response = await roomAPI.getRooms()

      const fetchedRooms = response.data.map((room: any) => ({
        id: room.id,
        name: room.name,
        alias: room.alias,
        topic: room.topic,
        type: room.isPublic ? 'public' : 'private',
        isPublic: room.isPublic,
        memberCount: room.memberCount || 0,
        members: room.members || [],
        unreadCount: 0,
        encrypted: room.encrypted || false,
        joinRule: room.joinRule || 'invite',
        historyVisibility: room.historyVisibility || 'shared',
        lastActivity: Date.now()
      }))

      // 合并本地存储的房间和服务器获取的房间
      const existingRoomIds = new Set(rooms.value.map(r => r.id))
      const newRooms = fetchedRooms.filter(room => !existingRoomIds.has(room.id))

      // 更新现有房间信息
      rooms.value.forEach(localRoom => {
        const serverRoom = fetchedRooms.find(r => r.id === localRoom.id)
        if (serverRoom) {
          Object.assign(localRoom, serverRoom)
        }
      })

      // 添加新房间
      rooms.value.push(...newRooms)

      // 保存到localStorage
      saveRoomsToStorage()

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
        const room = matrixClient.value.getRoom(roomId)
        if (!room) {
          console.warn(`房间 ${roomId} 不存在`)
          return []
        }

        // 获取房间的时间线事件
        const timeline = room.getLiveTimeline()
        const events = timeline.getEvents()

        if (events && events.length > 0) {
          console.log(`📨 获取到 ${events.length} 条事件`)

          roomMessages = events
            .filter((event: any) => event.getType() === 'm.room.message')
            .map((event: any) => {
              const content = event.getContent()?.body || event.getContent()?.formatted_body || ''
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
        // 使用Matrix客户端发送消息
        const response = await matrixClient.value.sendTextMessage(roomId, content)
        console.log('Matrix client send message response:', response)

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
        const roomMessages = messages.value.get(roomId) || []
        messages.value.set(roomId, [...roomMessages, newMessage])

        // 更新房间最后消息
        const room = rooms.value.find(r => r.id === roomId)
        if (room) {
          room.lastMessage = newMessage
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
        const room = roomId === 'world' ? worldChannel.value : rooms.value.find(r => r.id === roomId)
        if (room) {
          room.lastMessage = newMessage
        }

        return newMessage
      }
    } catch (err: any) {
      error.value = 'Failed to send Matrix message'
      console.error('Error sending Matrix message:', err)
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
    startSync,
    
    // 辅助方法
    setCurrentRoom,
    addMatrixMessage,
    markRoomAsRead,
    addRoom,
    clearError,
    disconnect
  }
})
