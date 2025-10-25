import { defineStore } from 'pinia'
import { ref, computed, shallowRef } from 'vue'

// 简化的类型定义
interface SimpleMessage {
  id: string
  roomId: string
  content: string
  sender: string
  senderName?: string
  timestamp: number
  type: string
}

interface SimpleRoom {
  id: string
  name: string
  lastMessage?: string
  unreadCount: number
  lastEventTimestamp?: number
}

interface SimpleUser {
  id: string
  username: string
  displayName?: string
}

// 简化的Matrix Store
export const useMatrixSimpleStore = defineStore('matrix-simple', () => {
  // 基础状态
  const matrixClient = shallowRef<any>(null)
  const currentUser = ref<SimpleUser | null>(null)
  const rooms = ref<SimpleRoom[]>([])
  const messages = ref(new Map<string, SimpleMessage[]>())
  const currentRoomId = ref<string>('')
  const loading = ref(false)
  const error = ref<string | null>(null)

  // 计算属性
  const isLoggedIn = computed(() => !!currentUser.value)
  const currentRoom = computed(() => 
    rooms.value.find(room => room.id === currentRoomId.value) || null
  )
  const currentMessages = computed(() => 
    currentRoomId.value ? messages.value.get(currentRoomId.value) || [] : []
  )

  // 初始化Matrix
  const initializeMatrix = async (): Promise<boolean> => {
    try {
      console.log('🚀 初始化简化Matrix客户端...')
      
      const savedLoginInfo = localStorage.getItem('matrix-v39-login-info')
      if (!savedLoginInfo) {
        console.log('没有保存的登录信息')
        return false
      }

      const loginData = JSON.parse(savedLoginInfo)
      console.log('恢复登录状态:', loginData.userId)

      // 动态导入Matrix SDK
      const sdk = await import('matrix-js-sdk')
      
      // 创建简化的客户端配置
      const client = sdk.createClient({
        baseUrl: loginData.homeserver,
        accessToken: loginData.accessToken,
        userId: loginData.userId,
        deviceId: loginData.deviceId,
        timelineSupport: false, // 禁用时间线支持以提高性能
        useAuthorizationHeader: true
      })

      // 设置基本事件监听
      client.on('sync', (state: string) => {
        console.log('同步状态:', state)
        if (state === 'PREPARED' || state === 'SYNCING') {
          updateRoomsFromClient(client)
        }
      })

      client.on('Room.timeline', (event: any, room: any) => {
        if (event.getType() === 'm.room.message') {
          addMessageFromEvent(event, room)
        }
      })

      // 启动客户端
      await client.startClient({
        initialSyncLimit: 20, // 限制初始同步
        lazyLoadMembers: true
      })

      matrixClient.value = client
      currentUser.value = {
        id: loginData.userId,
        username: loginData.userId.split(':')[0].substring(1),
        displayName: loginData.displayName || loginData.userId.split(':')[0].substring(1)
      }

      console.log('✅ 简化Matrix客户端初始化成功')
      return true

    } catch (error) {
      console.error('❌ 初始化失败:', error)
      return false
    }
  }

  // 登录
  const login = async (username: string, password: string, homeserver?: string) => {
    try {
      loading.value = true
      error.value = null
      
      const serverUrl = homeserver || 'matrix.jianluochat.com'
      console.log(`🔐 简化登录: ${username} @ ${serverUrl}`)

      const sdk = await import('matrix-js-sdk')
      const tempClient = sdk.createClient({
        baseUrl: serverUrl.startsWith('http') ? serverUrl : `https://${serverUrl}`
      })

      const loginResponse = await tempClient.login('m.login.password', {
        user: username,
        password: password,
        initial_device_display_name: 'JianLuo Chat Web Simple'
      })

      // 保存登录信息
      const loginData = {
        userId: loginResponse.user_id,
        accessToken: loginResponse.access_token,
        deviceId: loginResponse.device_id,
        homeserver: serverUrl,
        loginTime: Date.now(),
        displayName: username
      }
      localStorage.setItem('matrix-v39-login-info', JSON.stringify(loginData))
      localStorage.setItem('matrix_access_token', loginResponse.access_token)

      // 初始化客户端
      await initializeMatrix()

      console.log('✅ 简化登录成功')
      return { success: true, user: currentUser.value }

    } catch (err: any) {
      error.value = err.message || '登录失败'
      console.error('❌ 登录失败:', err)
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  // 更新房间列表
  const updateRoomsFromClient = (client: any) => {
    try {
      const clientRooms = client.getRooms()
      const simpleRooms: SimpleRoom[] = []

      clientRooms.forEach((room: any) => {
        const simpleRoom: SimpleRoom = {
          id: room.roomId,
          name: room.name || room.roomId,
          unreadCount: room.getUnreadNotificationCount() || 0,
          lastEventTimestamp: room.getLastActiveTimestamp?.() || Date.now()
        }

        // 获取最后一条消息
        const timeline = room.getLiveTimeline()
        const events = timeline.getEvents()
        const lastMessageEvent = events.reverse().find((event: any) => 
          event.getType() === 'm.room.message'
        )
        
        if (lastMessageEvent) {
          const content = lastMessageEvent.getContent()
          simpleRoom.lastMessage = content.body || '新消息'
        }

        simpleRooms.push(simpleRoom)
      })

      // 按最后活动时间排序
      simpleRooms.sort((a, b) => (b.lastEventTimestamp || 0) - (a.lastEventTimestamp || 0))
      
      rooms.value = simpleRooms
      console.log(`✅ 更新房间列表: ${simpleRooms.length} 个房间`)

    } catch (error) {
      console.error('❌ 更新房间列表失败:', error)
    }
  }

  // 从事件添加消息
  const addMessageFromEvent = (event: any, room: any) => {
    try {
      const content = event.getContent()
      const message: SimpleMessage = {
        id: event.getId(),
        roomId: room.roomId,
        content: content.body || '',
        sender: event.getSender(),
        senderName: event.getSender()?.split(':')[0]?.substring(1) || '未知',
        timestamp: event.getTs(),
        type: event.getType()
      }

      const roomMessages = messages.value.get(room.roomId) || []
      roomMessages.push(message)
      
      // 限制消息数量
      if (roomMessages.length > 100) {
        roomMessages.splice(0, roomMessages.length - 100)
      }
      
      messages.value.set(room.roomId, roomMessages)

      // 更新房间最后消息
      const roomIndex = rooms.value.findIndex(r => r.id === room.roomId)
      if (roomIndex >= 0) {
        rooms.value[roomIndex].lastMessage = message.content
        rooms.value[roomIndex].lastEventTimestamp = message.timestamp
      }

    } catch (error) {
      console.error('❌ 添加消息失败:', error)
    }
  }

  // 获取房间消息
  const fetchMessages = async (roomId: string) => {
    try {
      if (!matrixClient.value) return []

      const room = matrixClient.value.getRoom(roomId)
      if (!room) return []

      const timeline = room.getLiveTimeline()
      const events = timeline.getEvents()
      
      const roomMessages: SimpleMessage[] = []
      events.forEach((event: any) => {
        if (event.getType() === 'm.room.message') {
          const content = event.getContent()
          roomMessages.push({
            id: event.getId(),
            roomId: roomId,
            content: content.body || '',
            sender: event.getSender(),
            senderName: event.getSender()?.split(':')[0]?.substring(1) || '未知',
            timestamp: event.getTs(),
            type: event.getType()
          })
        }
      })

      // 按时间排序并限制数量
      roomMessages.sort((a, b) => a.timestamp - b.timestamp)
      const limitedMessages = roomMessages.slice(-50) // 只保留最近50条

      messages.value.set(roomId, limitedMessages)
      return limitedMessages

    } catch (error) {
      console.error('❌ 获取消息失败:', error)
      return []
    }
  }

  // 发送消息
  const sendMessage = async (roomId: string, content: string) => {
    try {
      if (!matrixClient.value) throw new Error('客户端未初始化')

      const messageContent = {
        msgtype: 'm.text',
        body: content
      }

      const response = await matrixClient.value.sendEvent(roomId, 'm.room.message', messageContent)
      
      // 添加到本地消息列表
      const message: SimpleMessage = {
        id: response.event_id,
        roomId,
        content,
        sender: matrixClient.value.getUserId(),
        senderName: currentUser.value?.displayName || '我',
        timestamp: Date.now(),
        type: 'm.room.message'
      }

      const roomMessages = messages.value.get(roomId) || []
      roomMessages.push(message)
      messages.value.set(roomId, roomMessages)

      return message

    } catch (error) {
      console.error('❌ 发送消息失败:', error)
      throw error
    }
  }

  // 发送文件
  const sendFileMessage = async (roomId: string, file: File) => {
    try {
      if (!matrixClient.value) throw new Error('客户端未初始化')

      // 上传文件
      const uploadResponse = await matrixClient.value.uploadContent(file)

      // 发送文件消息
      const messageContent = {
        msgtype: 'm.file',
        body: file.name,
        filename: file.name,
        info: {
          size: file.size,
          mimetype: file.type
        },
        url: uploadResponse.content_uri
      }

      const response = await matrixClient.value.sendEvent(roomId, 'm.room.message', messageContent)
      return response

    } catch (error) {
      console.error('❌ 发送文件失败:', error)
      throw error
    }
  }

  // 设置当前房间
  const setCurrentRoom = (roomId: string | null) => {
    currentRoomId.value = roomId || ''
    if (roomId && !messages.value.has(roomId)) {
      fetchMessages(roomId)
    }
  }

  // 登出
  const logout = () => {
    matrixClient.value = null
    currentUser.value = null
    rooms.value = []
    messages.value.clear()
    currentRoomId.value = ''
    localStorage.removeItem('matrix-v39-login-info')
    localStorage.removeItem('matrix_access_token')
  }

  return {
    // 状态
    matrixClient,
    currentUser,
    rooms,
    messages,
    currentRoomId,
    loading,
    error,

    // 计算属性
    isLoggedIn,
    currentRoom,
    currentMessages,

    // 方法
    initializeMatrix,
    login,
    fetchMessages,
    sendMessage,
    sendFileMessage,
    setCurrentRoom,
    logout
  }
})