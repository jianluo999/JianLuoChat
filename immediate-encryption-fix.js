/**
 * 立即修复Matrix加密问题
 * 在浏览器控制台中运行此脚本
 */

(async function immediateEncryptionFix() {
  console.log('🔧 开始立即修复Matrix加密问题...')
  
  try {
    // 检查Matrix store是否可用
    let matrixStore = null
    
    // 尝试多种方式获取Matrix store
    if (window.matrixStore) {
      matrixStore = window.matrixStore
    } else if (window.__VUE__ && window.__VUE__[0]) {
      // 尝试从Vue实例获取
      const vueApp = window.__VUE__[0]
      if (vueApp.config && vueApp.config.globalProperties) {
        matrixStore = vueApp.config.globalProperties.$matrixStore
      }
    }
    
    if (!matrixStore) {
      console.error('❌ 无法找到Matrix store')
      alert('无法找到Matrix store，请确保页面已完全加载')
      return
    }
    
    console.log('✅ 找到Matrix store')
    
    const client = matrixStore.matrixClient
    if (!client) {
      console.error('❌ Matrix客户端未初始化')
      alert('Matrix客户端未初始化，请先登录')
      return
    }
    
    console.log('✅ Matrix客户端已初始化')
    console.log('👤 用户:', client.getUserId())
    
    // 检查当前加密状态
    let crypto = client.getCrypto()
    console.log('🔐 当前加密状态:', crypto ? '可用' : '不可用')
    
    if (!crypto) {
      console.log('🚀 尝试初始化加密功能...')
      
      // 尝试多种加密初始化方法
      const initMethods = [
        {
          name: 'Rust加密',
          method: async () => {
            if (typeof client.initRustCrypto === 'function') {
              await client.initRustCrypto({
                useIndexedDB: true,
                storagePrefix: 'jianluochat-crypto-fix',
                pickleKey: undefined
              })
              return client.getCrypto()
            }
            return null
          }
        },
        {
          name: '传统加密',
          method: async () => {
            if (typeof client.initCrypto === 'function') {
              await client.initCrypto()
              return client.getCrypto()
            }
            return null
          }
        }
      ]
      
      for (const initMethod of initMethods) {
        try {
          console.log(`🔧 尝试${initMethod.name}初始化...`)
          crypto = await initMethod.method()
          if (crypto) {
            console.log(`✅ ${initMethod.name}初始化成功`)
            break
          }
        } catch (error) {
          console.warn(`⚠️ ${initMethod.name}初始化失败:`, error.message)
        }
      }
    }
    
    if (crypto) {
      console.log('🎉 加密功能现在可用！')
      console.log('🔧 可用的加密方法:')
      console.log('- getUserDevices:', typeof crypto.getUserDevices)
      console.log('- requestDeviceVerification:', typeof crypto.requestDeviceVerification)
      
      // 修复发送消息函数
      console.log('🔧 修复发送消息函数...')
      
      const originalSendMessage = matrixStore.sendMatrixMessage
      matrixStore.sendMatrixMessage = async function(roomId, content) {
        try {
          console.log(`📤 发送消息到房间: ${roomId}`)
          
          // 检查房间加密状态
          const matrixRoom = client.getRoom(roomId)
          const isEncrypted = matrixRoom?.hasEncryptionStateEvent()
          
          if (isEncrypted) {
            console.log('🔐 房间已加密，使用加密发送')
            const currentCrypto = client.getCrypto()
            if (!currentCrypto) {
              throw new Error('加密功能不可用，请刷新页面重试')
            }
          }
          
          // 发送消息
          const response = await client.sendTextMessage(roomId, content)
          console.log('✅ 消息发送成功:', response.event_id)
          
          // 创建本地消息对象
          const newMessage = {
            id: response.event_id,
            roomId,
            content,
            sender: client.getUserId(),
            senderName: matrixStore.currentUser?.displayName || matrixStore.currentUser?.username,
            timestamp: Date.now(),
            type: 'm.room.message',
            eventId: response.event_id,
            status: 'sent'
          }
          
          // 添加到本地消息列表
          const roomMessages = matrixStore.messages.get(roomId) || []
          matrixStore.messages.set(roomId, [...roomMessages, newMessage])
          
          return newMessage
          
        } catch (error) {
          console.error('❌ 发送消息失败:', error)
          throw error
        }
      }
      
      console.log('✅ 发送消息函数已修复')
      
      alert('🎉 加密功能修复成功！\n\n现在可以在加密房间发送消息了。\n\n如果仍有问题，请刷新页面重试。')
      
    } else {
      console.log('❌ 无法初始化加密功能')
      
      // 提供降级方案
      console.log('🔧 应用降级方案...')
      
      const originalSendMessage = matrixStore.sendMatrixMessage
      matrixStore.sendMatrixMessage = async function(roomId, content) {
        try {
          console.log(`📤 发送消息到房间: ${roomId}`)
          
          // 检查房间加密状态
          const matrixRoom = client.getRoom(roomId)
          const isEncrypted = matrixRoom?.hasEncryptionStateEvent()
          
          if (isEncrypted) {
            console.log('⚠️ 房间已加密但加密功能不可用')
            throw new Error('🔐 此房间启用了端到端加密，但当前无法初始化加密功能。\n\n💡 解决方案：\n• 刷新页面重试\n• 清理浏览器缓存后重新登录\n• 或选择非加密房间进行聊天')
          }
          
          // 发送非加密消息
          const response = await client.sendTextMessage(roomId, content)
          console.log('✅ 消息发送成功:', response.event_id)
          
          // 创建本地消息对象
          const newMessage = {
            id: response.event_id,
            roomId,
            content,
            sender: client.getUserId(),
            senderName: matrixStore.currentUser?.displayName || matrixStore.currentUser?.username,
            timestamp: Date.now(),
            type: 'm.room.message',
            eventId: response.event_id,
            status: 'sent'
          }
          
          // 添加到本地消息列表
          const roomMessages = matrixStore.messages.get(roomId) || []
          matrixStore.messages.set(roomId, [...roomMessages, newMessage])
          
          return newMessage
          
        } catch (error) {
          console.error('❌ 发送消息失败:', error)
          throw error
        }
      }
      
      alert('⚠️ 无法初始化加密功能\n\n已应用降级方案，可以在非加密房间正常发送消息。\n\n对于加密房间，建议：\n• 刷新页面重试\n• 或选择非加密房间')
    }
    
  } catch (error) {
    console.error('❌ 修复过程中出错:', error)
    alert('修复过程中出错: ' + error.message)
  }
})()

console.log('💡 修复脚本已执行完成')
console.log('📝 如果问题仍然存在，请：')
console.log('1. 刷新页面')
console.log('2. 清理浏览器缓存')
console.log('3. 重新登录')
console.log('4. 或选择非加密房间进行聊天')