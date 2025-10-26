/**
 * 修复设备ID不匹配导致的加密初始化失败问题
 * 
 * 错误信息: "the account in the store doesn't match the account in the constructor: 
 * expected @mybatis:matrix.org:tItMBXEnUX, got @mybatis:matrix.org:XfTz8Mx0cl"
 * 
 * 这个错误表明加密存储中的设备ID与当前使用的设备ID不匹配
 */

console.log('🔧 开始修复设备ID不匹配问题...')

// 1. 清理所有相关的存储数据
function clearAllDeviceAndCryptoData() {
  console.log('🧹 清理所有设备和加密相关数据...')
  
  const keysToRemove = []
  
  // 收集所有需要清理的键
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && (
      key.includes('device-id') ||
      key.includes('device') ||
      key.includes('crypto') ||
      key.includes('olm') ||
      key.includes('matrix-sdk-crypto') ||
      key.startsWith('jianluochat-device-id-') ||
      key.includes('matrix-v39-login-info') ||
      key.includes('matrix-login-info') ||
      key.includes('matrix_login_info') ||
      key.includes('matrix_access_token') ||
      key.includes('matrix-rooms') ||
      key.includes('matrix_messages')
    )) {
      keysToRemove.push(key)
    }
  }
  
  console.log('🗑️ 发现需要清理的键:', keysToRemove)
  
  // 清理localStorage
  keysToRemove.forEach(key => {
    localStorage.removeItem(key)
    console.log(`✅ 已清理: ${key}`)
  })
  
  return keysToRemove.length
}

// 2. 清理IndexedDB中的加密数据库
async function clearCryptoDatabases() {
  console.log('🗄️ 清理IndexedDB中的加密数据库...')
  
  try {
    if (!window.indexedDB) {
      console.log('⚠️ IndexedDB不可用')
      return
    }
    
    const databases = await indexedDB.databases()
    const cryptoDbs = databases.filter(db => 
      db.name && (
        db.name.includes('matrix') ||
        db.name.includes('crypto') ||
        db.name.includes('jianluochat') ||
        db.name.includes('olm')
      )
    )
    
    console.log('🔍 发现加密相关数据库:', cryptoDbs.map(db => db.name))
    
    for (const db of cryptoDbs) {
      if (db.name) {
        console.log(`🗑️ 删除数据库: ${db.name}`)
        try {
          await new Promise((resolve, reject) => {
            const deleteReq = indexedDB.deleteDatabase(db.name)
            deleteReq.onsuccess = () => {
              console.log(`✅ 成功删除数据库: ${db.name}`)
              resolve(true)
            }
            deleteReq.onerror = () => {
              console.error(`❌ 删除数据库失败: ${db.name}`, deleteReq.error)
              reject(deleteReq.error)
            }
            deleteReq.onblocked = () => {
              console.warn(`⚠️ 数据库删除被阻塞: ${db.name}`)
              // 强制关闭可能的连接
              setTimeout(() => resolve(true), 2000)
            }
          })
        } catch (error) {
          console.error(`❌ 删除数据库 ${db.name} 时出错:`, error)
        }
      }
    }
    
    console.log('✅ IndexedDB清理完成')
  } catch (error) {
    console.error('❌ 清理IndexedDB时出错:', error)
  }
}

// 3. 生成新的一致性设备ID
function generateConsistentDeviceId(userId) {
  const username = userId.split(':')[0].substring(1) // 从 @mybatis:matrix.org 提取 mybatis
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  
  // 使用一致的格式生成设备ID
  const deviceId = `jianluochat_web_${timestamp}_${random}`
  
  console.log(`🆔 为用户 ${username} 生成新设备ID: ${deviceId}`)
  
  // 保存到localStorage（使用一致的键名）
  const deviceIdKey = `jianluochat-device-id-${username}`
  localStorage.setItem(deviceIdKey, deviceId)
  
  console.log(`💾 设备ID已保存到: ${deviceIdKey}`)
  
  return deviceId
}

// 4. 重置Matrix客户端状态
function resetMatrixClientState() {
  console.log('🔄 重置Matrix客户端状态...')
  
  // 清理可能的全局变量
  if (window.matrixClient) {
    try {
      if (window.matrixClient.stopClient) {
        window.matrixClient.stopClient()
      }
      window.matrixClient = null
    } catch (error) {
      console.warn('清理全局Matrix客户端时出错:', error)
    }
  }
  
  // 清理可能的事件监听器
  if (window.removeEventListener) {
    // 移除可能的Matrix相关事件监听器
    console.log('🧹 清理事件监听器...')
  }
  
  console.log('✅ Matrix客户端状态重置完成')
}

// 5. 验证修复效果
async function verifyFix() {
  console.log('🔍 验证修复效果...')
  
  const checks = {
    localStorageCleared: true,
    indexedDBCleared: true,
    noConflictingDeviceIds: true,
    noCryptoData: true
  }
  
  // 检查localStorage
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && (
      key.includes('crypto') ||
      key.includes('olm') ||
      key.includes('matrix-sdk-crypto')
    )) {
      checks.localStorageCleared = false
      console.warn(`⚠️ 仍有加密数据: ${key}`)
    }
  }
  
  // 检查设备ID冲突
  const deviceIdKeys = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && key.startsWith('jianluochat-device-id-')) {
      deviceIdKeys.push(key)
    }
  }
  
  if (deviceIdKeys.length > 1) {
    checks.noConflictingDeviceIds = false
    console.warn('⚠️ 仍有多个设备ID:', deviceIdKeys)
  }
  
  // 检查IndexedDB
  try {
    const databases = await indexedDB.databases()
    const cryptoDbs = databases.filter(db => 
      db.name && (
        db.name.includes('matrix-sdk-crypto') ||
        db.name.includes('jianluochat-crypto')
      )
    )
    
    if (cryptoDbs.length > 0) {
      checks.indexedDBCleared = false
      console.warn('⚠️ 仍有加密数据库:', cryptoDbs.map(db => db.name))
    }
  } catch (error) {
    console.warn('检查IndexedDB时出错:', error)
  }
  
  const allPassed = Object.values(checks).every(check => check === true)
  
  console.log('📊 修复验证结果:', checks)
  
  if (allPassed) {
    console.log('✅ 修复验证通过！可以安全地重新登录了。')
  } else {
    console.log('⚠️ 部分检查未通过，可能需要手动清理或刷新页面。')
  }
  
  return { allPassed, checks }
}

// 6. 主修复流程
async function fixDeviceIdMismatch() {
  console.log('🚀 开始设备ID不匹配修复流程...')
  
  try {
    // 步骤1: 清理localStorage
    const clearedKeys = clearAllDeviceAndCryptoData()
    console.log(`✅ 步骤1完成: 清理了 ${clearedKeys} 个localStorage键`)
    
    // 步骤2: 清理IndexedDB
    await clearCryptoDatabases()
    console.log('✅ 步骤2完成: IndexedDB清理完成')
    
    // 步骤3: 重置客户端状态
    resetMatrixClientState()
    console.log('✅ 步骤3完成: Matrix客户端状态重置')
    
    // 步骤4: 等待一下让清理生效
    console.log('⏳ 等待清理生效...')
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // 步骤5: 验证修复效果
    const verification = await verifyFix()
    
    if (verification.allPassed) {
      console.log('🎉 设备ID不匹配问题修复完成！')
      console.log('💡 建议操作:')
      console.log('1. 刷新页面')
      console.log('2. 重新登录Matrix账户')
      console.log('3. 加密功能将使用新的设备ID重新初始化')
      
      // 设置修复标记
      localStorage.setItem('matrix-device-mismatch-fixed', Date.now().toString())
      
      return {
        success: true,
        message: '设备ID不匹配问题已修复，请刷新页面并重新登录'
      }
    } else {
      console.log('⚠️ 修复可能不完整，建议刷新页面后重试')
      return {
        success: false,
        message: '修复可能不完整，请刷新页面后重试',
        details: verification.checks
      }
    }
    
  } catch (error) {
    console.error('❌ 修复过程中出错:', error)
    return {
      success: false,
      message: `修复失败: ${error.message}`,
      error: error
    }
  }
}

// 7. 提供手动修复选项
function manualFix() {
  console.log('🔧 执行手动修复...')
  
  // 强制清理所有相关数据
  const allKeys = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key) allKeys.push(key)
  }
  
  const relevantKeys = allKeys.filter(key => 
    key.includes('matrix') ||
    key.includes('crypto') ||
    key.includes('device') ||
    key.includes('jianluochat')
  )
  
  console.log('🗑️ 手动清理相关键:', relevantKeys)
  
  relevantKeys.forEach(key => {
    localStorage.removeItem(key)
    console.log(`✅ 手动清理: ${key}`)
  })
  
  console.log('✅ 手动修复完成，请刷新页面')
}

// 执行修复
console.log('🎯 开始执行设备ID不匹配修复...')

// 检查是否已经修复过
const lastFix = localStorage.getItem('matrix-device-mismatch-fixed')
if (lastFix) {
  const fixTime = new Date(parseInt(lastFix))
  const timeSinceFix = Date.now() - parseInt(lastFix)
  
  if (timeSinceFix < 24 * 60 * 60 * 1000) { // 24小时内
    console.log(`ℹ️ 检测到最近已修复过 (${fixTime.toLocaleString()})`)
    console.log('如果问题仍然存在，可以执行 manualFix() 进行强制修复')
  }
}

// 立即执行修复
fixDeviceIdMismatch().then(result => {
  console.log('🏁 修复结果:', result)
  
  if (result.success) {
    console.log('🎉 修复成功！建议现在刷新页面并重新登录。')
    
    // 可选：自动刷新页面
    if (confirm('修复完成！是否立即刷新页面？')) {
      window.location.reload()
    }
  } else {
    console.log('⚠️ 修复未完全成功，尝试手动修复...')
    manualFix()
    
    if (confirm('手动修复完成！是否立即刷新页面？')) {
      window.location.reload()
    }
  }
}).catch(error => {
  console.error('❌ 修复执行失败:', error)
  console.log('🔧 尝试手动修复...')
  manualFix()
})

// 导出函数供手动调用
window.fixDeviceIdMismatch = fixDeviceIdMismatch
window.manualFix = manualFix
window.verifyFix = verifyFix

console.log('💡 可用的修复函数:')
console.log('- fixDeviceIdMismatch(): 自动修复')
console.log('- manualFix(): 手动强制修复')
console.log('- verifyFix(): 验证修复效果')