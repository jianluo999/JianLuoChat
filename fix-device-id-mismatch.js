/**
 * 快速修复设备ID不匹配问题
 * 专门针对: "the account in the store doesn't match the account in the constructor"
 */

async function fixDeviceIdMismatch() {
  console.log('🔧 开始修复设备ID不匹配问题...')
  
  try {
    // 1. 立即清理所有加密相关存储
    console.log('🧹 清理加密存储...')
    
    // 清理 localStorage 中的加密和设备ID数据
    const keysToRemove = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && (
        key.includes('crypto') || 
        key.includes('olm') || 
        key.includes('device-id') ||
        key.includes('matrix-sdk-crypto') ||
        key.startsWith('jianluochat-device-id-') ||
        key.includes('matrix-v39-login-info')
      )) {
        keysToRemove.push(key)
      }
    }
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key)
      console.log(`✅ 清理: ${key}`)
    })
    
    // 2. 清理 IndexedDB 中的加密数据库
    const cryptoDbNames = [
      'jianluochat-matrix-v39-crypto-@mybatis:matrix.org',
      'matrix-js-sdk::matrix-sdk-crypto',
      'matrix-js-sdk::crypto'
    ]
    
    for (const dbName of cryptoDbNames) {
      try {
        const deleteReq = indexedDB.deleteDatabase(dbName)
        await new Promise((resolve) => {
          deleteReq.onsuccess = () => {
            console.log(`✅ 删除加密数据库: ${dbName}`)
            resolve(undefined)
          }
          deleteReq.onerror = () => {
            console.log(`⚠️ 数据库 ${dbName} 不存在或已删除`)
            resolve(undefined)
          }
          deleteReq.onblocked = () => {
            console.log(`⚠️ 数据库 ${dbName} 删除被阻塞，但继续`)
            resolve(undefined)
          }
        })
      } catch (error) {
        console.log(`⚠️ 清理数据库 ${dbName} 时出错:`, error)
      }
    }
    
    // 3. 清理可能的用户特定数据库
    const userSpecificDbs = [
      'jianluochat-matrix-v39-store-@mybatis:matrix.org',
      'jianluochat-matrix-v39-crypto-@mybatis:matrix.org'
    ]
    
    for (const dbName of userSpecificDbs) {
      try {
        const deleteReq = indexedDB.deleteDatabase(dbName)
        await new Promise((resolve) => {
          deleteReq.onsuccess = () => {
            console.log(`✅ 删除用户数据库: ${dbName}`)
            resolve(undefined)
          }
          deleteReq.onerror = () => resolve(undefined)
          deleteReq.onblocked = () => resolve(undefined)
        })
      } catch (error) {
        console.log(`⚠️ 清理用户数据库时出错:`, error)
      }
    }
    
    console.log('✅ 设备ID不匹配问题修复完成！')
    console.log('💡 现在请刷新页面并重新登录')
    
    // 可选：自动刷新页面
    if (confirm('修复完成！是否立即刷新页面？')) {
      location.reload()
    }
    
    return true
    
  } catch (error) {
    console.error('❌ 修复过程中出错:', error)
    return false
  }
}

// 立即执行修复
fixDeviceIdMismatch()

// 也导出到全局作用域
window.fixDeviceIdMismatch = fixDeviceIdMismatch