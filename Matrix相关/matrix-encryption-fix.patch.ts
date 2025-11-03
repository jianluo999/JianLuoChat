/**
 * Matrix Store 加密修复补丁
 * 
 * 这个文件包含了修复设备ID不匹配问题的代码片段
 * 可以直接替换 matrix.ts 中的相关函数
 */

// 1. 替换 initializeEncryption 函数
export const improvedInitializeEncryption = async (client: any) => {
  try {
    console.log('🔐 开始改进的加密初始化...')
    
    // 动态导入加密管理器
    const { encryptionManager } = await import('@/utils/encryptionManager')
    const { deviceIdManager } = await import('@/utils/deviceIdManager')
    
    // 获取用户ID
    const userId = client.getUserId()
    if (!userId) {
      console.error('❌ 无法获取用户ID')
      return false
    }
    
    // 获取当前设备ID
    const currentDeviceId = client.getDeviceId()
    
    // 使用加密管理器初始化
    const result = await encryptionManager.initializeEncryption(client, userId, currentDeviceId)
    
    if (result.success) {
      console.log('✅ 加密功能初始化成功')
      
      // 如果设备ID发生了变化，更新客户端
      if (result.deviceId && result.deviceId !== currentDeviceId) {
        console.log(`🆔 设备ID已更新: ${currentDeviceId} -> ${result.deviceId}`)
        // 注意：这里可能需要重新创建客户端
      }
      
      return true
    } else if (result.fallbackToNonEncrypted) {
      console.warn('⚠️ 加密初始化失败，以非加密模式运行')
      console.warn('错误详情:', result.error)
      return false
    } else {
      console.error('❌ 加密初始化失败:', result.error)
      return false
    }
    
  } catch (error: any) {
    console.error('❌ 改进的加密初始化失败:', error)
    return false
  }
}

// 2. 替换 createMatrixClient 函数中的设备ID生成部分
export const improvedDeviceIdGeneration = async (userId: string, providedDeviceId?: string) => {
  try {
    // 动态导入设备ID管理器
    const { deviceIdManager } = await import('@/utils/deviceIdManager')
    
    // 使用设备ID管理器获取一致的设备ID
    const deviceId = await deviceIdManager.getOrCreateDeviceId(userId, providedDeviceId)
    
    console.log(`🆔 使用设备ID: ${deviceId}`)
    return deviceId
    
  } catch (error) {
    console.error('❌ 设备ID生成失败:', error)
    
    // 回退到原始方法
    const username = userId.split(':')[0].substring(1)
    const deviceIdKey = `jianluochat-device-id-${username}`
    let deviceId = localStorage.getItem(deviceIdKey)
    
    if (!deviceId) {
      const timestamp = Date.now()
      const random = Math.random().toString(36).substring(2, 8)
      deviceId = `jianluochat_web_${timestamp}_${random}`
      localStorage.setItem(deviceIdKey, deviceId)
      console.log('🆔 生成新的设备ID (回退):', deviceId)
    }
    
    return deviceId
  }
}

// 3. 新增加密诊断函数
export const diagnoseEncryptionIssues = async (client: any) => {
  try {
    const { encryptionManager } = await import('@/utils/encryptionManager')
    
    const userId = client.getUserId()
    if (!userId) {
      console.error('❌ 无法获取用户ID进行诊断')
      return null
    }
    
    const diagnosis = await encryptionManager.diagnoseEncryptionIssues(client, userId)
    
    console.log('🔍 加密诊断结果:', diagnosis)
    
    if (diagnosis.hasIssues) {
      console.warn('⚠️ 发现加密问题:', diagnosis.issues)
      console.log('💡 建议:', diagnosis.recommendations)
    } else {
      console.log('✅ 加密状态正常')
    }
    
    return diagnosis
    
  } catch (error) {
    console.error('❌ 加密诊断失败:', error)
    return null
  }
}

// 4. 新增设备ID冲突解决函数
export const resolveDeviceIdConflict = async (userId: string) => {
  try {
    const { deviceIdManager } = await import('@/utils/deviceIdManager')
    
    console.log('🔧 开始解决设备ID冲突...')
    
    // 诊断问题
    const diagnosis = await deviceIdManager.diagnoseDeviceIdIssues()
    console.log('🔍 设备ID诊断:', diagnosis)
    
    if (diagnosis.hasIssues) {
      // 解决冲突
      await deviceIdManager.resolveDeviceIdConflict(userId)
      console.log('✅ 设备ID冲突已解决')
      
      // 重新诊断
      const newDiagnosis = await deviceIdManager.diagnoseDeviceIdIssues()
      console.log('🔍 解决后诊断:', newDiagnosis)
      
      return !newDiagnosis.hasIssues
    } else {
      console.log('✅ 没有发现设备ID冲突')
      return true
    }
    
  } catch (error) {
    console.error('❌ 解决设备ID冲突失败:', error)
    return false
  }
}

// 5. 使用示例 - 在 matrix.ts 中的集成方式
export const integrateEncryptionFix = `
// 在 createMatrixClient 函数中替换设备ID生成部分:

// 原来的代码:
// const deviceIdKey = \`jianluochat-device-id-\${userId.split(':')[0].substring(1)}\`
// let deviceId = localStorage.getItem(deviceIdKey)
// if (!deviceId) {
//   const timestamp = Date.now()
//   const random = Math.random().toString(36).substring(2, 8)
//   deviceId = \`jianluochat_web_\${timestamp}_\${random}\`
//   localStorage.setItem(deviceIdKey, deviceId)
//   console.log('🆔 生成新的设备ID:', deviceId)
// }

// 替换为:
const deviceId = await improvedDeviceIdGeneration(userId, providedDeviceId)

// 在 initializeEncryption 调用处替换:
// 原来的代码:
// const encryptionInitialized = await initializeEncryption(client)

// 替换为:
const encryptionInitialized = await improvedInitializeEncryption(client)

// 添加诊断功能:
if (!encryptionInitialized) {
  console.log('🔍 进行加密诊断...')
  await diagnoseEncryptionIssues(client)
}
`

// 6. 快速修复函数 - 可以在控制台直接调用
export const quickEncryptionFix = async () => {
  console.log('🚀 执行快速加密修复...')
  
  try {
    // 清理所有设备ID和加密数据
    const keysToRemove: string[] = []
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && (
        key.includes('device-id') ||
        key.includes('crypto') ||
        key.includes('matrix-sdk-crypto') ||
        key.includes('jianluochat-crypto')
      )) {
        keysToRemove.push(key)
      }
    }
    
    console.log('🗑️ 清理键:', keysToRemove)
    keysToRemove.forEach(key => localStorage.removeItem(key))
    
    // 清理IndexedDB
    if (window.indexedDB) {
      const databases = await indexedDB.databases()
      const cryptoDbs = databases.filter(db => 
        db.name && (
          db.name.includes('crypto') ||
          db.name.includes('matrix')
        )
      )
      
      for (const db of cryptoDbs) {
        if (db.name) {
          console.log(`🗑️ 删除数据库: ${db.name}`)
          indexedDB.deleteDatabase(db.name)
        }
      }
    }
    
    console.log('✅ 快速修复完成，请刷新页面并重新登录')
    
    // 设置修复标记
    localStorage.setItem('encryption-quick-fix-applied', Date.now().toString())
    
    return true
    
  } catch (error) {
    console.error('❌ 快速修复失败:', error)
    return false
  }
}

// 导出到全局，方便控制台调用
if (typeof window !== 'undefined') {
  (window as any).quickEncryptionFix = quickEncryptionFix
  (window as any).diagnoseEncryptionIssues = diagnoseEncryptionIssues
  (window as any).resolveDeviceIdConflict = resolveDeviceIdConflict
}

console.log('💡 可用的修复函数:')
console.log('- quickEncryptionFix(): 快速修复加密问题')
console.log('- diagnoseEncryptionIssues(client): 诊断加密问题')
console.log('- resolveDeviceIdConflict(userId): 解决设备ID冲突')