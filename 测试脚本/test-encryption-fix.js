/**
 * 测试加密修复是否有效
 * 在浏览器控制台运行此脚本
 */

(function testEncryptionFix() {
  console.log('🧪 开始测试加密修复效果...')
  
  // 检查Matrix store
  const matrixStore = window.matrixStore
  if (!matrixStore) {
    console.error('❌ Matrix store未找到')
    return
  }
  
  const client = matrixStore.matrixClient
  if (!client) {
    console.error('❌ Matrix客户端未初始化')
    return
  }
  
  console.log('✅ Matrix客户端已找到')
  console.log('👤 用户ID:', client.getUserId())
  
  // 检查加密状态
  const crypto = client.getCrypto()
  console.log('🔐 加密API状态:', crypto ? '✅ 可用' : '❌ 不可用')
  
  if (crypto) {
    console.log('🔧 加密API方法检查:')
    console.log('- getUserDevices:', typeof crypto.getUserDevices)
    console.log('- requestDeviceVerification:', typeof crypto.requestDeviceVerification)
    console.log('- exportRoomKeys:', typeof crypto.exportRoomKeys)
  }
  
  // 检查房间加密状态
  const rooms = client.getRooms()
  console.log(`🏠 总房间数: ${rooms.length}`)
  
  const encryptedRooms = rooms.filter(room => room.hasEncryptionStateEvent())
  console.log(`🔐 加密房间数: ${encryptedRooms.length}`)
  
  if (encryptedRooms.length > 0) {
    console.log('🔐 加密房间列表:')
    encryptedRooms.forEach(room => {
      console.log(`  - ${room.name || room.roomId} (${room.roomId})`)
    })
    
    // 测试第一个加密房间
    const testRoom = encryptedRooms[0]
    console.log(`🧪 测试房间: ${testRoom.name || testRoom.roomId}`)
    
    // 检查是否可以发送消息
    const canSend = testRoom.maySendMessage()
    console.log(`📤 可以发送消息: ${canSend ? '✅ 是' : '❌ 否'}`)
    
    if (canSend && crypto) {
      console.log('🎉 加密房间应该可以正常发送消息了！')
      
      // 提供测试消息发送的代码
      console.log('💡 测试发送消息的代码:')
      console.log(`matrixStore.sendMatrixMessage('${testRoom.roomId}', '测试加密消息 - ${new Date().toLocaleTimeString()}')`)
    }
  } else {
    console.log('ℹ️ 当前没有加密房间')
  }
  
  // 检查客户端配置
  console.log('⚙️ 客户端配置检查:')
  console.log('- encryptionEnabled:', (client as any).encryptionEnabled)
  console.log('- timelineSupport:', (client as any).timelineSupport)
  console.log('- clientRunning:', client.clientRunning)
  
  // 总结
  console.log('\n📊 测试结果总结:')
  if (crypto && encryptedRooms.length > 0) {
    console.log('✅ 加密功能正常，可以在加密房间发送消息')
  } else if (!crypto && encryptedRooms.length > 0) {
    console.log('⚠️ 有加密房间但加密功能不可用')
  } else {
    console.log('ℹ️ 当前环境没有加密房间需要测试')
  }
  
  return {
    hasClient: !!client,
    hasCrypto: !!crypto,
    encryptedRoomsCount: encryptedRooms.length,
    totalRoomsCount: rooms.length
  }
})()