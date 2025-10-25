// 快速性能修复脚本
console.log('🚀 开始快速性能修复...')

// 清理可能导致卡顿的数据
function clearPerformanceBlockers() {
  try {
    // 清理大量的localStorage数据
    const keysToRemove = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && (
        key.includes('matrix-js-sdk') ||
        key.includes('crypto') ||
        key.includes('olm') ||
        key.includes('indexeddb') ||
        key.includes('sync-accumulator')
      )) {
        keysToRemove.push(key)
      }
    }
    
    console.log(`🧹 清理 ${keysToRemove.length} 个可能导致卡顿的存储项...`)
    keysToRemove.forEach(key => {
      try {
        localStorage.removeItem(key)
      } catch (e) {
        console.warn(`清理 ${key} 失败:`, e)
      }
    })
    
    // 清理IndexedDB
    const dbNames = [
      'matrix-js-sdk::matrix-sdk-crypto',
      'matrix-js-sdk::crypto',
      'jianluochat-matrix-v39-store',
      'jianluochat-matrix-v39-crypto'
    ]
    
    dbNames.forEach(dbName => {
      try {
        const deleteReq = indexedDB.deleteDatabase(dbName)
        deleteReq.onsuccess = () => console.log(`✅ 清理数据库: ${dbName}`)
        deleteReq.onerror = () => console.warn(`清理数据库 ${dbName} 失败`)
      } catch (e) {
        console.warn(`清理数据库 ${dbName} 失败:`, e)
      }
    })
    
    console.log('✅ 性能阻塞数据清理完成')
    return true
  } catch (error) {
    console.error('❌ 清理性能阻塞数据失败:', error)
    return false
  }
}

// 重置Matrix客户端状态
function resetMatrixState() {
  try {
    console.log('🔄 重置Matrix状态...')
    
    // 保留登录信息但清理其他状态
    const loginInfo = localStorage.getItem('matrix-v39-login-info')
    const accessToken = localStorage.getItem('matrix_access_token')
    
    // 清理Matrix相关的所有状态
    const matrixKeys = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.includes('matrix') && 
          key !== 'matrix-v39-login-info' && 
          key !== 'matrix_access_token' &&
          key !== 'matrix_login_info') {
        matrixKeys.push(key)
      }
    }
    
    matrixKeys.forEach(key => localStorage.removeItem(key))
    
    // 恢复关键登录信息
    if (loginInfo) {
      localStorage.setItem('matrix-v39-login-info', loginInfo)
    }
    if (accessToken) {
      localStorage.setItem('matrix_access_token', accessToken)
    }
    
    console.log('✅ Matrix状态重置完成')
    return true
  } catch (error) {
    console.error('❌ 重置Matrix状态失败:', error)
    return false
  }
}

// 优化内存使用
function optimizeMemory() {
  try {
    console.log('🧠 优化内存使用...')
    
    // 强制垃圾回收（如果可用）
    if (window.gc) {
      window.gc()
      console.log('✅ 强制垃圾回收完成')
    }
    
    // 清理可能的内存泄漏
    if (window.performance && window.performance.memory) {
      const memory = window.performance.memory
      console.log('📊 内存使用情况:', {
        used: Math.round(memory.usedJSHeapSize / 1024 / 1024) + 'MB',
        total: Math.round(memory.totalJSHeapSize / 1024 / 1024) + 'MB',
        limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024) + 'MB'
      })
    }
    
    return true
  } catch (error) {
    console.error('❌ 内存优化失败:', error)
    return false
  }
}

// 执行修复
async function performQuickFix() {
  console.log('🔧 开始执行快速修复...')
  
  const results = {
    clearPerformanceBlockers: clearPerformanceBlockers(),
    resetMatrixState: resetMatrixState(),
    optimizeMemory: optimizeMemory()
  }
  
  console.log('📋 修复结果:', results)
  
  const successCount = Object.values(results).filter(Boolean).length
  const totalCount = Object.keys(results).length
  
  if (successCount === totalCount) {
    console.log('✅ 快速修复完成！建议刷新页面以应用更改。')
    alert('✅ 快速修复完成！\n\n建议刷新页面以获得最佳性能。\n\n点击确定后将自动刷新页面。')
    window.location.reload()
  } else {
    console.warn(`⚠️ 部分修复失败 (${successCount}/${totalCount})`)
    alert(`⚠️ 部分修复完成 (${successCount}/${totalCount})\n\n建议手动刷新页面。`)
  }
}

// 立即执行修复
performQuickFix()