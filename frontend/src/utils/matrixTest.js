// Matrix 互通性测试工具
import * as sdk from 'matrix-js-sdk'

export class MatrixInteroperabilityTest {
  constructor() {
    this.client = null
    this.username = 'mybatis'
    this.homeserver = 'matrix.org'
    this.password = 'Twqk3HhqwPjVQqC'
    this.callbacks = []
  }

  // 添加日志回调
  onLog(callback) {
    this.callbacks.push(callback)
  }

  // 记录日志
  log(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString()
    const logEntry = { timestamp, message, type }
    console.log(`[${timestamp}] ${message}`)
    this.callbacks.forEach(callback => callback(logEntry))
  }

  // 测试登录
  async testLogin() {
    this.log('🚀 开始测试 Matrix 登录...')
    
    try {
      const baseUrl = `https://${this.homeserver}`
      
      // 创建 Matrix 客户端
      this.log('📡 创建 Matrix 客户端...')
      this.client = sdk.createClient({
        baseUrl: baseUrl,
        userId: `@${this.username}:${this.homeserver}`
      })
      
      // 尝试登录
      this.log('🔐 尝试登录到 Matrix...')
      const loginResponse = await this.client.login('m.login.password', {
        user: this.username,
        password: this.password,
        initial_device_display_name: 'JianLuoChat Test Client'
      })
      
      this.log('✅ 登录成功！', 'success')
      this.log(`用户ID: ${loginResponse.user_id}`, 'success')
      this.log(`设备ID: ${loginResponse.device_id}`, 'success')
      
      // 启动客户端同步
      this.log('🔄 启动客户端同步...')
      await this.client.startClient()
      
      // 等待初始同步完成
      return new Promise((resolve) => {
        this.client.once('sync', (state) => {
          if (state === 'PREPARED') {
            this.log('✅ 初始同步完成！', 'success')
            resolve({ success: true, client: this.client })
          }
        })
      })
      
    } catch (error) {
      this.log(`❌ 登录失败: ${error.message}`, 'error')
      if (error.errcode) {
        this.log(`错误代码: ${error.errcode}`, 'error')
      }
      return { success: false, error }
    }
  }

  // 获取房间列表
  async testRooms() {
    if (!this.client) {
      this.log('❌ 请先登录', 'error')
      return { success: false, error: '未登录' }
    }

    try {
      this.log('🏠 获取房间列表...')
      const rooms = this.client.getRooms()
      this.log(`✅ 找到 ${rooms.length} 个房间:`, 'success')
      
      const roomList = []
      rooms.slice(0, 10).forEach((room, index) => {
        const name = room.name || room.roomId
        const memberCount = room.getJoinedMemberCount()
        const unreadCount = room.getUnreadNotificationCount()
        const roomInfo = `${index + 1}. ${name} (成员: ${memberCount}, 未读: ${unreadCount})`
        this.log(`  ${roomInfo}`)
        roomList.push({
          id: room.roomId,
          name,
          memberCount,
          unreadCount
        })
      })
      
      return { success: true, rooms: roomList }
      
    } catch (error) {
      this.log(`❌ 获取房间失败: ${error.message}`, 'error')
      return { success: false, error }
    }
  }

  // 发送测试消息
  async testSendMessage() {
    if (!this.client) {
      this.log('❌ 请先登录', 'error')
      return { success: false, error: '未登录' }
    }

    try {
      const rooms = this.client.getRooms()
      if (rooms.length === 0) {
        this.log('❌ 没有可用的房间', 'error')
        return { success: false, error: '没有房间' }
      }

      const testRoom = rooms[0]
      const message = `🧪 JianLuoChat 互通性测试消息 - ${new Date().toLocaleString()}`
      
      this.log(`📝 向房间 "${testRoom.name || testRoom.roomId}" 发送测试消息...`)
      await this.client.sendTextMessage(testRoom.roomId, message)
      this.log('✅ 消息发送成功！', 'success')
      this.log('💡 现在可以在 Element 客户端中查看这条消息！', 'success')
      
      return { 
        success: true, 
        roomId: testRoom.roomId, 
        roomName: testRoom.name || testRoom.roomId,
        message 
      }
      
    } catch (error) {
      this.log(`❌ 消息发送失败: ${error.message}`, 'error')
      return { success: false, error }
    }
  }

  // 创建测试房间
  async testCreateRoom() {
    if (!this.client) {
      this.log('❌ 请先登录', 'error')
      return { success: false, error: '未登录' }
    }

    try {
      this.log('🏗️ 测试创建房间...')
      const roomOptions = {
        name: 'JianLuoChat 测试房间',
        topic: '这是一个由 JianLuoChat 客户端创建的测试房间',
        visibility: 'private'
      }
      
      const newRoom = await this.client.createRoom(roomOptions)
      this.log(`✅ 房间创建成功: ${newRoom.room_id}`, 'success')
      
      // 发送欢迎消息
      const welcomeMessage = '🎉 欢迎来到 JianLuoChat 测试房间！这条消息证明了与标准 Matrix 客户端的完全互通性。'
      await this.client.sendTextMessage(newRoom.room_id, welcomeMessage)
      this.log('✅ 欢迎消息发送成功！', 'success')
      this.log('💡 现在可以在 Element 客户端中找到这个新房间！', 'success')
      
      return { 
        success: true, 
        roomId: newRoom.room_id,
        roomName: roomOptions.name
      }
      
    } catch (error) {
      this.log(`❌ 房间创建失败: ${error.message}`, 'error')
      return { success: false, error }
    }
  }

  // 运行完整测试套件
  async runFullTest() {
    this.log('🌟 开始完整的 Matrix 互通性测试套件')
    
    // 1. 登录测试
    const loginResult = await this.testLogin()
    if (!loginResult.success) {
      return { success: false, step: 'login', error: loginResult.error }
    }

    // 等待一秒让同步完成
    await new Promise(resolve => setTimeout(resolve, 1000))

    // 2. 房间列表测试
    const roomsResult = await this.testRooms()
    if (!roomsResult.success) {
      return { success: false, step: 'rooms', error: roomsResult.error }
    }

    // 3. 发送消息测试
    const messageResult = await this.testSendMessage()
    if (!messageResult.success) {
      return { success: false, step: 'message', error: messageResult.error }
    }

    // 4. 创建房间测试
    const createRoomResult = await this.testCreateRoom()
    if (!createRoomResult.success) {
      return { success: false, step: 'createRoom', error: createRoomResult.error }
    }

    this.log('🎉 所有测试完成！Matrix 互通性验证成功！', 'success')
    this.log('📋 测试结果总结:', 'success')
    this.log('  ✅ Matrix 协议登录', 'success')
    this.log('  ✅ 客户端同步', 'success')
    this.log('  ✅ 房间列表获取', 'success')
    this.log('  ✅ 消息发送', 'success')
    this.log('  ✅ 房间创建', 'success')

    return { 
      success: true, 
      results: {
        login: loginResult,
        rooms: roomsResult,
        message: messageResult,
        createRoom: createRoomResult
      }
    }
  }

  // 停止客户端
  stop() {
    if (this.client) {
      this.client.stopClient()
      this.client = null
      this.log('🛑 Matrix 客户端已停止')
    }
  }
}
