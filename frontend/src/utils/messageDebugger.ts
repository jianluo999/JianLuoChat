/**
 * 消息调试工具
 * 用于调试消息显示问题
 */

export const debugMessages = (roomId: string, messages: any[]) => {
  console.group(`🔍 消息调试 - 房间: ${roomId}`)
  
  console.log(`📊 消息总数: ${messages.length}`)
  
  if (messages.length === 0) {
    console.warn('❌ 没有消息数据')
    console.groupEnd()
    return
  }
  
  // 检查前几条消息的结构
  const sampleMessages = messages.slice(0, 3)
  
  sampleMessages.forEach((msg, index) => {
    console.group(`消息 ${index + 1}:`)
    console.log('ID:', msg.id)
    console.log('内容:', msg.content)
    console.log('发送者:', msg.sender)
    console.log('发送者名称:', msg.senderName)
    console.log('时间戳:', msg.timestamp, new Date(msg.timestamp))
    console.log('消息类型:', msg.msgtype)
    console.log('是否为自己的消息:', msg.isOwn)
    console.log('完整消息对象:', msg)
    console.groupEnd()
  })
  
  // 检查必要字段
  const missingFields = []
  const firstMsg = messages[0]
  
  if (!firstMsg.id) missingFields.push('id')
  if (!firstMsg.content) missingFields.push('content')
  if (!firstMsg.senderName) missingFields.push('senderName')
  if (!firstMsg.timestamp) missingFields.push('timestamp')
  
  if (missingFields.length > 0) {
    console.warn('⚠️ 缺少必要字段:', missingFields)
  } else {
    console.log('✅ 消息结构完整')
  }
  
  console.groupEnd()
}

export const debugMessageComponent = (message: any) => {
  console.group('🔍 消息组件调试')
  console.log('消息对象:', message)
  console.log('是否有内容:', !!message.content)
  console.log('是否有发送者名称:', !!message.senderName)
  console.log('消息类型:', message.msgtype)
  console.log('是否为自己的消息:', message.isOwn)
  console.groupEnd()
}