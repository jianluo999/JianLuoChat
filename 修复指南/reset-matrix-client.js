/**
 * Matrix Client Reset Utility
 * 用于解决设备ID不匹配和加密初始化问题
 */

// 清理所有 Matrix 相关的存储数据
function clearMatrixStorage() {
  console.log('🧹 开始清理 Matrix 存储数据...')
  
  // 清理 localStorage
  const keysToRemove = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && (
      key.includes('matrix') || 
      key.includes('crypto') || 
      key.includes('olm') || 
      key.startsWith('jianluochat-') ||
      key.includes('device-id')
    )) {
      keysToRemove.push(key)
    }
  }
  
  keysToRemove.forEach(key => {
    localStorage.removeItem(key)
    console.log(`✅ 已清理 localStorage: ${key}`)
  })
  
  // 清理 sessionStorage
  const sessionKeysToRemove = []
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i)
    if (key && (
      key.includes('matrix') || 
      key.includes('crypto') || 
      key.includes('olm') || 
      key.startsWith('jianluochat-')
    )) {
      sessionKeysToRemove.push(key)
    }
  }
  
  sessionKeysToRemove.forEach(key => {
    sessionStorage.removeItem(key)
    console.log(`✅ 已清理 sessionStorage: ${key}`)
  })
  
  console.log(`✅ 清理完成，共清理 ${keysToRemove.length + sessionKeysToRemove.length} 个存储项`)
}

// 清理 IndexedDB 数据库
async function clearMatrixIndexedDB() {
  console.log('🗄️ 开始清理 IndexedDB 数据库...')
  
  const dbNames = [
    'jianluochat-matrix-v39',
    'jianluochat-matrix-v39-crypto',
    'matrix-js-sdk',
    'matrix-js-sdk::matrix-sdk-crypto',
    'matrix-js-sdk::crypto'
  ]
  
  for (const dbName of dbNames) {
    try {
      const deleteReq = indexedDB.deleteDatabase(dbName)
      await new Promise((resolve, reject) => {
        deleteReq.onsuccess = () => {
          console.log(`✅ 已删除数据库: ${dbName}`)
          resolve(undefined)
        }
        deleteReq.onerror = () => {
          console.warn(`❌ 删除数据库失败: ${dbName}`, deleteReq.error)
          resolve(undefined) // 继续处理其他数据库
        }
        deleteReq.onblocked = () => {
          console.warn(`⚠️ 数据库删除被阻塞: ${dbName}`)
          resolve(undefined)
        }
      })
    } catch (error) {
      console.warn(`清理数据库 ${dbName} 时出错:`, error)
    }
  }
  
  console.log('✅ IndexedDB 清理完成')
}

// 完整重置函数
async function resetMatrixClient() {
  try {
    console.log('🔄 开始重置 Matrix 客户端...')
    
    // 1. 清理存储数据
    clearMatrixStorage()
    
    // 2. 清理 IndexedDB
    await clearMatrixIndexedDB()
    
    // 3. 清理可能的缓存
    if ('caches' in window) {
      const cacheNames = await caches.keys()
      for (const cacheName of cacheNames) {
        if (cacheName.includes('matrix') || cacheName.includes('jianluochat')) {
          await caches.delete(cacheName)
          console.log(`✅ 已清理缓存: ${cacheName}`)
        }
      }
    }
    
    console.log('✅ Matrix 客户端重置完成！')
    console.log('💡 请刷新页面并重新登录')
    
    return true
  } catch (error) {
    console.error('❌ 重置过程中出错:', error)
    return false
  }
}

// 检查是否有设备ID冲突
function checkDeviceIdConflict() {
  console.log('🔍 检查设备ID冲突...')
  
  const deviceIdKeys = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && key.startsWith('jianluochat-device-id-')) {
      deviceIdKeys.push(key)
    }
  }
  
  if (deviceIdKeys.length > 0) {
    console.log('📱 发现存储的设备ID:')
    deviceIdKeys.forEach(key => {
      const deviceId = localStorage.getItem(key)
      console.log(`  ${key}: ${deviceId}`)
    })
    return true
  } else {
    console.log('✅ 未发现设备ID冲突')
    return false
  }
}

// 导出到全局作用域，方便在控制台使用
window.matrixReset = {
  clearStorage: clearMatrixStorage,
  clearIndexedDB: clearMatrixIndexedDB,
  resetClient: resetMatrixClient,
  checkDeviceIdConflict: checkDeviceIdConflict
}

console.log('🛠️ Matrix 重置工具已加载')
console.log('💡 使用方法:')
console.log('  - window.matrixReset.resetClient() - 完整重置')
console.log('  - window.matrixReset.clearStorage() - 仅清理存储')
console.log('  - window.matrixReset.clearIndexedDB() - 仅清理数据库')
console.log('  - window.matrixReset.checkDeviceIdConflict() - 检查设备ID冲突')