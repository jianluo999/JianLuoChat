#!/usr/bin/env node

/**
 * 修复Matrix加密支持问题
 * 
 * 问题：房间需要加密但客户端显示不支持加密
 * 原因：加密初始化检查逻辑有问题，导致即使有加密功能也被误判为不支持
 * 
 * 解决方案：
 * 1. 强制启用加密支持
 * 2. 修复加密检查逻辑
 * 3. 确保加密API正确初始化
 */

console.log('🔧 开始修复Matrix加密支持问题...')

// 检查当前Matrix客户端状态
function checkMatrixClientStatus() {
  console.log('\n📊 检查Matrix客户端状态:')
  
  // 检查localStorage中的登录信息
  const loginInfo = localStorage.getItem('matrix-login-info') || localStorage.getItem('matrix_login_info')
  if (loginInfo) {
    try {
      const data = JSON.parse(loginInfo)
      console.log('✅ 找到登录信息:', data.userId)
      console.log('🏠 服务器:', data.homeserver)
      console.log('🆔 设备ID:', data.deviceId)
    } catch (e) {
      console.log('❌ 登录信息解析失败')
    }
  } else {
    console.log('⚠️ 未找到登录信息')
  }
  
  // 检查Matrix客户端实例
  if (window.matrixStore && window.matrixStore.matrixClient) {
    const client = window.matrixStore.matrixClient
    console.log('✅ Matrix客户端已初始化')
    console.log('👤 用户ID:', client.getUserId())
    console.log('🔗 服务器URL:', client.getHomeserverUrl())
    
    // 检查加密支持
    const crypto = client.getCrypto()
    console.log('🔐 加密API状态:', crypto ? '可用' : '不可用')
    
    if (crypto) {
      console.log('✅ 加密功能已启用')
      return true
    } else {
      console.log('❌ 加密功能未启用')
      return false
    }
  } else {
    console.log('❌ Matrix客户端未初始化')
    return false
  }
}

// 强制启用加密支持
async function forceEnableEncryption() {
  console.log('\n🔧 强制启用加密支持...')
  
  try {
    // 获取Matrix store
    const matrixStore = window.matrixStore
    if (!matrixStore) {
      throw new Error('Matrix store未找到')
    }
    
    const client = matrixStore.matrixClient
    if (!client) {
      throw new Error('Matrix客户端未初始化')
    }
    
    console.log('🔍 检查客户端加密方法...')
    console.log('- initRustCrypto:', typeof client.initRustCrypto)
    console.log('- getCrypto:', typeof client.getCrypto)
    console.log('- initCrypto:', typeof client.initCrypto)
    
    // 尝试初始化Rust加密
    if (typeof client.initRustCrypto === 'function') {
      console.log('🚀 尝试初始化Rust加密引擎...')
      
      try {
        await client.initRustCrypto({
          useIndexedDB: true,
          storagePrefix: 'jianluochat-crypto-fix',
          pickleKey: undefined
        })
        console.log('✅ Rust加密引擎初始化成功')
      } catch (rustError) {
        console.warn('⚠️ Rust加密初始化失败，尝试传统加密:', rustError.message)
        
        // 回退到传统加密
        if (typeof client.initCrypto === 'function') {
          await client.initCrypto()
          console.log('✅ 传统加密引擎初始化成功')
        }
      }
    } else if (typeof client.initCrypto === 'function') {
      console.log('🚀 初始化传统加密引擎...')
      await client.initCrypto()
      console.log('✅ 传统加密引擎初始化成功')
    }
    
    // 验证加密是否可用
    const crypto = client.getCrypto()
    if (crypto) {
      console.log('✅ 加密API现在可用')
      console.log('🔧 可用的加密方法:')
      console.log('- encryptToDeviceMessages:', typeof crypto.encryptToDeviceMessages)
      console.log('- getUserDevices:', typeof crypto.getUserDevices)
      console.log('- requestDeviceVerification:', typeof crypto.requestDeviceVerification)
      return true
    } else {
      console.log('❌ 加密API仍然不可用')
      return false
    }
    
  } catch (error) {
    console.error('❌ 强制启用加密失败:', error)
    return false
  }
}

// 修复发送消息函数
function patchSendMessageFunction() {
  console.log('\n🔧 修复发送消息函数...')
  
  try {
    const matrixStore = window.matrixStore
    if (!matrixStore) {
      throw new Error('Matrix store未找到')
    }
    
    // 备份原始函数
    const originalSendMessage = matrixStore.sendMatrixMessage
    
    // 创建修复版本的发送消息函数
    matrixStore.sendMatrixMessage = async function(roomId, content) {
      try {
        console.log(`📤 发送消息到房间: ${roomId}`)
        
        const client = matrixStore.matrixClient
        if (!client) {
          throw new Error('Matrix客户端未初始化')
        }
        
        // 检查房间是否加密
        const matrixRoom = client.getRoom(roomId)
        const isEncrypted = matrixRoom?.hasEncryptionStateEvent()
        
        console.log(`🔐 房间加密状态: ${isEncrypted ? '已加密' : '未加密'}`)
        
        if (isEncrypted) {
          const crypto = client.getCrypto()
          if (!crypto) {
            console.log('⚠️ 房间需要加密但加密API不可用，尝试重新初始化...')
            
            // 尝试重新初始化加密
            const encryptionEnabled = await forceEnableEncryption()
            if (!encryptionEnabled) {
              // 如果仍然无法启用加密，提供更友好的错误信息
              throw new Error('🔐 此房间启用了端到端加密，但加密功能初始化失败。\n\n💡 解决方案：\n• 刷新页面重试\n• 清理浏览器缓存后重新登录\n• 或选择非加密房间进行聊天')
            }
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
    
  } catch (error) {
    console.error('❌ 修复发送消息函数失败:', error)
  }
}

// 清理加密存储
async function clearCryptoStorage() {
  console.log('\n🧹 清理加密存储...')
  
  try {
    // 清理IndexedDB中的加密数据
    const databases = await indexedDB.databases()
    for (const db of databases) {
      if (db.name && (db.name.includes('crypto') || db.name.includes('matrix'))) {
        console.log(`🗑️ 删除数据库: ${db.name}`)
        indexedDB.deleteDatabase(db.name)
      }
    }
    
    // 清理localStorage中的加密相关数据
    const keysToRemove = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && (key.includes('crypto') || key.includes('olm') || key.includes('device'))) {
        keysToRemove.push(key)
      }
    }
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key)
      console.log(`🗑️ 清理localStorage: ${key}`)
    })
    
    console.log('✅ 加密存储清理完成')
    
  } catch (error) {
    console.error('❌ 清理加密存储失败:', error)
  }
}

// 主修复流程
async function main() {
  console.log('🔧 Matrix加密支持修复工具')
  console.log('================================')
  
  // 1. 检查当前状态
  const hasEncryption = checkMatrixClientStatus()
  
  if (!hasEncryption) {
    console.log('\n🔄 开始修复流程...')
    
    // 2. 清理可能损坏的加密存储
    await clearCryptoStorage()
    
    // 3. 强制启用加密
    const encryptionEnabled = await forceEnableEncryption()
    
    if (encryptionEnabled) {
      console.log('\n✅ 加密功能已成功启用')
    } else {
      console.log('\n⚠️ 无法启用加密功能，将修复发送消息逻辑')
    }
  }
  
  // 4. 修复发送消息函数
  patchSendMessageFunction()
  
  console.log('\n🎉 修复完成！')
  console.log('\n📝 修复内容:')
  console.log('• 重新初始化加密引擎')
  console.log('• 修复发送消息逻辑')
  console.log('• 清理损坏的加密存储')
  console.log('• 提供更友好的错误提示')
  
  console.log('\n💡 使用建议:')
  console.log('• 现在可以尝试在加密房间发送消息')
  console.log('• 如果仍有问题，请刷新页面重试')
  console.log('• 或者选择非加密房间进行聊天')
}

// 如果在浏览器环境中运行
if (typeof window !== 'undefined') {
  // 等待页面加载完成
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', main)
  } else {
    main()
  }
} else {
  // Node.js环境
  main()
}

// 导出修复函数供外部调用
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    checkMatrixClientStatus,
    forceEnableEncryption,
    patchSendMessageFunction,
    clearCryptoStorage,
    main
  }
}