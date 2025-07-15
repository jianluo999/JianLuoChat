import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { matrixAPI } from '@/services/api'

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

  // Matrix初始化
  const initializeMatrix = async () => {
    try {
      loading.value = true
      error.value = null

      console.log('Initializing Matrix connection...')

      // 获取Matrix服务状态
      const statusResponse = await matrixAPI.getStatus()
      matrixStatus.value = statusResponse.data
      matrixFeatures.value = statusResponse.data.features

      console.log('Matrix status received:', statusResponse.data)

      // 获取连接状态
      const connectionResponse = await matrixAPI.getConnection()
      connection.value.homeserver = connectionResponse.data.homeserver
      connection.value.connected = true

      console.log('Matrix connection established:', connectionResponse.data)

      // 获取世界频道信息
      await loadWorldChannel()

      console.log('Matrix initialized successfully:', {
        status: matrixStatus.value,
        homeserver: connection.value.homeserver,
        features: matrixFeatures.value
      })

      return true
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Unknown error'
      error.value = `Failed to initialize Matrix connection: ${errorMessage}`
      connection.value.connected = false
      console.error('Matrix initialization error:', {
        error: err,
        response: err.response?.data,
        status: err.response?.status
      })
      return false
    } finally {
      loading.value = false
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

  // Matrix用户认证
  const matrixLogin = async (username: string, password: string) => {
    try {
      loading.value = true
      error.value = null

      const response = await matrixAPI.login({ username, password })
      
      if (response.data.success) {
        connection.value.userId = `@${username}:jianluochat.com`
        connection.value.accessToken = 'matrix_token_placeholder'
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

  // Matrix房间管理
  const fetchMatrixRooms = async () => {
    try {
      loading.value = true
      const response = await matrixRoomAPI.getUserRooms()
      
      rooms.value = response.data.map((room: any) => ({
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
        historyVisibility: room.historyVisibility || 'shared'
      }))

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
        username: currentUser.value.username,
        roomName: name
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
      if (!currentUser.value) {
        throw new Error('User not logged in')
      }

      let roomMessages: MatrixMessage[] = []

      if (roomId === 'world') {
        // 世界频道消息暂时为空，实际应该从API获取
        roomMessages = []
      } else {
        const response = await matrixAPI.getRoomMessages({
          username: currentUser.value.username,
          roomId,
          limit
        })
        
        if (response.data.success) {
          roomMessages = response.data.messages.map((msg: any) => ({
            id: msg.id,
            roomId,
            content: msg.content,
            sender: msg.sender,
            timestamp: msg.timestamp,
            type: msg.type || 'm.text',
            eventId: msg.eventId,
            encrypted: msg.encrypted || false
          }))
        }
      }
      
      messages.value.set(roomId, roomMessages)
      return roomMessages
    } catch (err: any) {
      error.value = 'Failed to fetch Matrix messages'
      console.error('Error fetching Matrix messages:', err)
      return []
    }
  }

  const sendMatrixMessage = async (roomId: string, content: string) => {
    try {
      if (!currentUser.value) {
        throw new Error('User not logged in')
      }

      const response = await matrixAPI.sendMessage({
        username: currentUser.value.username,
        roomId,
        message: content
      })
      
      if (response.data.success) {
        const newMessage: MatrixMessage = {
          id: response.data.messageInfo?.eventId || Date.now().toString(),
          roomId,
          content,
          sender: currentUser.value.username,
          timestamp: Date.now(),
          type: 'm.text',
          eventId: response.data.messageInfo?.eventId,
          encrypted: false
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
      } else {
        throw new Error('Failed to send message')
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
    
    // Matrix方法
    initializeMatrix,
    loadWorldChannel,
    matrixLogin,
    fetchMatrixRooms,
    createMatrixRoom,
    fetchMatrixMessages,
    sendMatrixMessage,
    startMatrixSync,
    
    // 辅助方法
    setCurrentRoom,
    addMatrixMessage,
    markRoomAsRead,
    clearError,
    disconnect
  }
})
