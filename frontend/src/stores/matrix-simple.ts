import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// 简化的Matrix客户端存储 - 基于Element Web的最佳实践
export const useMatrixSimpleStore = defineStore('matrix-simple', () => {
  // 状态
  const matrixClient = ref<any>(null)
  const isInitializing = ref(false)
  const error = ref<string | null>(null)
  const rooms = ref<any[]>([])
  const currentRoomId = ref<string | null>(null)

  // 计算属性
  const isConnected = computed(() => !!matrixClient.value)
  const currentRoom = computed(() => {
    return rooms.value.find(room => room.roomId === currentRoomId.value)
  })

  // 清理客户端
  const cleanup = async () => {
    if (matrixClient.value) {
      try {
        matrixClient.value.stopClient()
        matrixClient.value = null
      } catch (error) {
        console.warn('清理客户端时出错:', error)
      }
    }
    error.value = null
    rooms.value = []
    currentRoomId.value = null
  }

  // 创建Matrix客户端 - 按照Element Web的最佳实践
  const createClient = async (userId: string, accessToken: string, homeserver: string) => {
    if (isInitializing.value) {
      console.log('⚠️ 客户端正在初始化中')
      return false
    }

    try {
      isInitializing.value = true
      error.value = null

      console.log(`🚀 创建Matrix客户端: ${userId} @ ${homeserver}`)

      // 清理现有客户端
      await cleanup()

      // 动态导入matrix-js-sdk
      const { createClient, MemoryStore, IndexedDBStore } = await import('matrix-js-sdk')

      // 生成设备ID
      const deviceIdKey = `jianluochat-device-${userId.split(':')[0].substring(1)}`
      let deviceId = localStorage.getItem(deviceIdKey)
      
      if (!deviceId) {
        const timestamp = Date.now()
        const random = Math.random().toString(36).substring(2, 10)
        deviceId = `JIANLUOCHAT_${timestamp}_${random}`
        localStorage.setItem(deviceIdKey, deviceId)
        console.log('🆔 生成设备ID:', deviceId)
      }

      // 设置存储选项（参考Element）
      const storeOpts: any = {
        useAuthorizationHeader: true,
      }

      // 优先使用IndexedDB，回退到Memory
      try {
        if (window.indexedDB && localStorage) {
          storeOpts.store = new IndexedDBStore({
            indexedDB: window.indexedDB,
            dbName: `jianluochat-${userId.split(':')[0].substring(1)}`,
            localStorage: localStorage,
          })
          console.log('📦 使用IndexedDB存储')
        } else {
          storeOpts.store = new MemoryStore({ localStorage })
          console.log('📦 使用Memory存储')
        }
      } catch (storeError) {
        console.warn('存储设置失败，使用默认:', storeError)
        storeOpts.store = new MemoryStore({ localStorage })
      }

      // 创建客户端
      const client = createClient({
        baseUrl: `https://${homeserver}`,
        accessToken: accessToken,
        userId: userId,
        deviceId: deviceId,
        timelineSupport: true,
        ...storeOpts
      })

      // 初始化存储
      console.log('📦 初始化存储...')
      try {
        await client.store.startup()
        console.log('✅ 存储初始化成功')
      } catch (storeError: any) {
        console.warn('存储初始化失败，使用内存存储:', storeError.message)
        client.store = new MemoryStore({ localStorage })
        await client.store.startup()
      }

      // 设置事件监听器
      client.on('sync', (state: string, prevState: string | null, data: any) => {
        console.log(`🔄 同步状态: ${prevState} -> ${state}`)
        if (state === 'PREPARED' || state === 'SYNCING') {
          console.log('✅ 同步就绪，加载房间...')
          setTimeout(() => loadRooms(), 1000) // 延迟一秒确保数据就绪
        } else if (state === 'ERROR') {
          console.error('❌ 同步错误:', data)
          error.value = '同步失败，请检查网络连接'
        }
      })

      client.on('Room.timeline', (event: any, room: any) => {
        if (event.getType() === 'm.room.message') {
          console.log('💬 新消息:', event.getContent().body)
          // 刷新房间列表以更新最后消息
          loadRooms()
        }
      })

      client.on('error', (error: any) => {
        console.error('❌ 客户端错误:', error)
        if (error.message) {
          error.value = `客户端错误: ${error.message}`
        }
      })

      // 设置客户端
      matrixClient.value = client
      console.log('✅ Matrix客户端创建成功')

      // 启动客户端
      console.log('🚀 启动客户端...')
      await client.startClient({
        initialSyncLimit: 10,
        lazyLoadMembers: true
      })

      console.log('✅ 客户端启动成功')
      return true

    } catch (error: any) {
      console.error('❌ 创建客户端失败:', error)
      error.value = `创建客户端失败: ${error.message}`
      return false
    } finally {
      isInitializing.value = false
    }
  }

  // 加载房间列表
  const loadRooms = () => {
    if (!matrixClient.value) {
      console.warn('⚠️ 客户端未初始化，无法加载房间')
      return
    }

    try {
      const clientRooms = matrixClient.value.getRooms()
      console.log(`📊 获取到 ${clientRooms.length} 个房间`)

      if (clientRooms.length === 0) {
        console.log('📭 暂无房间数据')
        rooms.value = []
        return
      }

      rooms.value = clientRooms.map((room: any) => {
        try {
          return {
            roomId: room.roomId,
            name: room.name || room.roomId || '未命名房间',
            topic: getTopicSafely(room),
            memberCount: getMemberCountSafely(room),
            unreadCount: getUnreadCountSafely(room),
            lastMessage: getLastMessage(room)
          }
        } catch (roomError) {
          console.warn('⚠️ 处理房间数据失败:', room.roomId, roomError)
          return {
            roomId: room.roomId,
            name: room.roomId || '未命名房间',
            topic: '',
            memberCount: 0,
            unreadCount: 0,
            lastMessage: null
          }
        }
      }).filter(room => room !== null)

      console.log(`✅ 房间列表更新完成，共 ${rooms.value.length} 个房间`)
    } catch (error) {
      console.error('❌ 加载房间失败:', error)
      error.value = `加载房间失败: ${error}`
    }
  }

  // 安全获取房间主题
  const getTopicSafely = (room: any) => {
    try {
      const topicEvent = room.currentState?.getStateEvents('m.room.topic', '')
      return topicEvent?.getContent()?.topic || ''
    } catch (error) {
      return ''
    }
  }

  // 安全获取成员数量
  const getMemberCountSafely = (room: any) => {
    try {
      return room.getJoinedMemberCount() || 0
    } catch (error) {
      return 0
    }
  }

  // 安全获取未读数量
  const getUnreadCountSafely = (room: any) => {
    try {
      return room.getUnreadNotificationCount() || 0
    } catch (error) {
      return 0
    }
  }

  // 获取房间最后一条消息
  const getLastMessage = (room: any) => {
    try {
      const timeline = room.getLiveTimeline()
      const events = timeline.getEvents()
      
      for (let i = events.length - 1; i >= 0; i--) {
        const event = events[i]
        if (event.getType() === 'm.room.message') {
          return {
            body: event.getContent().body || '',
            sender: event.getSender(),
            timestamp: event.getTs()
          }
        }
      }
      return null
    } catch (error) {
      console.warn('获取最后消息失败:', error)
      return null
    }
  }

  // 发送消息
  const sendMessage = async (roomId: string, message: string) => {
    if (!matrixClient.value) {
      throw new Error('客户端未初始化')
    }

    try {
      const content = {
        body: message,
        msgtype: 'm.text'
      }

      await matrixClient.value.sendEvent(roomId, 'm.room.message', content)
      console.log('✅ 消息发送成功')
    } catch (error) {
      console.error('❌ 发送消息失败:', error)
      throw error
    }
  }

  // 选择房间
  const selectRoom = (roomId: string) => {
    currentRoomId.value = roomId
    console.log('📍 选择房间:', roomId)
  }

  // 清理所有存储数据
  const clearAllStorage = () => {
    console.log('🧹 清理所有Matrix相关存储数据...')

    // 清理localStorage中的Matrix相关数据
    const keysToRemove = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && (
        key.includes('matrix') ||
        key.includes('jianluochat') ||
        key.includes('Matrix') ||
        key.startsWith('mx_')
      )) {
        keysToRemove.push(key)
      }
    }

    keysToRemove.forEach(key => {
      localStorage.removeItem(key)
      console.log(`🗑️ 已清理: ${key}`)
    })

    // 清理IndexedDB（如果可能）
    if (window.indexedDB) {
      try {
        // 尝试删除可能的数据库
        const dbNames = ['jianluochat-sync', 'jianluochat-crypto', 'matrix-js-sdk:crypto']
        dbNames.forEach(dbName => {
          const deleteReq = window.indexedDB.deleteDatabase(dbName)
          deleteReq.onsuccess = () => console.log(`🗑️ 已清理数据库: ${dbName}`)
          deleteReq.onerror = () => console.log(`⚠️ 清理数据库失败: ${dbName}`)
        })
      } catch (error) {
        console.warn('清理IndexedDB时出错:', error)
      }
    }

    console.log('✅ 存储清理完成')
  }

  // 重试初始化
  const retryInitialization = async () => {
    console.log('🔄 开始重试初始化...')

    // 首先检查存储状态
    const loginInfo = localStorage.getItem('matrix-login-info')
    const accessToken = localStorage.getItem('matrix_access_token')

    console.log('📋 存储状态检查:', {
      hasLoginInfo: !!loginInfo,
      hasAccessToken: !!accessToken
    })

    // 如果状态不一致，清理并要求重新登录
    if (accessToken && !loginInfo) {
      console.warn('⚠️ 检测到存储状态不一致，建议清理后重新登录')
      error.value = '存储状态不一致，请清理后重新登录'
      return false
    }

    if (!loginInfo) {
      error.value = '没有找到登录信息，请重新登录'
      return false
    }

    try {
      const info = JSON.parse(loginInfo)
      console.log('📋 尝试使用登录信息:', {
        userId: info.userId,
        homeserver: info.homeserver,
        hasAccessToken: !!info.accessToken
      })

      return await createClient(info.userId, info.accessToken, info.homeserver)
    } catch (error: any) {
      console.error('重试初始化失败:', error)
      error.value = `重试失败: ${error.message}`
      return false
    }
  }

  return {
    // 状态
    matrixClient,
    isInitializing,
    error,
    rooms,
    currentRoomId,

    // 计算属性
    isConnected,
    currentRoom,

    // 方法
    createClient,
    cleanup,
    loadRooms,
    sendMessage,
    selectRoom,
    retryInitialization,
    clearAllStorage
  }
})
