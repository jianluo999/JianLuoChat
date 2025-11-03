// 修复微信界面和性能问题
console.log('🔧 开始修复微信界面和性能问题...')

// 1. 清理可能导致卡顿的数据
function clearLaggyData() {
  console.log('🧹 清理卡顿数据...')
  
  // 清理大量的同步数据
  const keysToRemove = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && (
      key.includes('sync-accumulator') ||
      key.includes('timeline') ||
      key.includes('crypto-store') ||
      key.includes('matrix-js-sdk::store') ||
      key.includes('matrix-js-sdk::crypto')
    )) {
      keysToRemove.push(key)
    }
  }
  
  console.log(`清理 ${keysToRemove.length} 个可能导致卡顿的项目`)
  keysToRemove.forEach(key => {
    try {
      localStorage.removeItem(key)
    } catch (e) {
      console.warn(`清理 ${key} 失败:`, e)
    }
  })
}

// 2. 重置Matrix客户端为轻量模式
function resetToLightMode() {
  console.log('⚡ 设置轻量模式...')
  
  // 保存登录信息
  const loginInfo = localStorage.getItem('matrix-v39-login-info')
  const accessToken = localStorage.getItem('matrix_access_token')
  
  // 设置轻量模式标志
  localStorage.setItem('matrix-light-mode', 'true')
  localStorage.setItem('matrix-disable-crypto', 'true')
  localStorage.setItem('matrix-limit-sync', '50')
  
  // 恢复登录信息
  if (loginInfo) localStorage.setItem('matrix-v39-login-info', loginInfo)
  if (accessToken) localStorage.setItem('matrix_access_token', accessToken)
}

// 3. 清理IndexedDB
async function clearIndexedDB() {
  console.log('🗄️ 清理IndexedDB...')
  
  const dbNames = [
    'matrix-js-sdk::matrix-sdk-crypto',
    'matrix-js-sdk::crypto',
    'matrix-js-sdk::store',
    'jianluochat-matrix-v39-store',
    'jianluochat-matrix-v39-crypto'
  ]
  
  for (const dbName of dbNames) {
    try {
      await new Promise((resolve, reject) => {
        const deleteReq = indexedDB.deleteDatabase(dbName)
        deleteReq.onsuccess = () => {
          console.log(`✅ 清理数据库: ${dbName}`)
          resolve(true)
        }
        deleteReq.onerror = () => {
          console.warn(`清理数据库 ${dbName} 失败`)
          resolve(false)
        }
        deleteReq.onblocked = () => {
          console.warn(`数据库 ${dbName} 被阻塞`)
          resolve(false)
        }
      })
    } catch (e) {
      console.warn(`清理数据库 ${dbName} 异常:`, e)
    }
  }
}

// 4. 强制跳转到微信界面
function forceWeChatInterface() {
  console.log('📱 强制跳转到微信界面...')
  
  // 设置界面偏好
  localStorage.setItem('preferred-interface', 'wechat')
  
  // 跳转到微信界面
  const currentPath = window.location.pathname
  if (currentPath !== '/wechat-layout') {
    console.log('跳转到微信界面...')
    window.location.href = '/wechat-layout'
  }
}

// 执行修复
async function performFix() {
  try {
    console.log('🚀 开始执行修复...')
    
    // 步骤1: 清理卡顿数据
    clearLaggyData()
    
    // 步骤2: 设置轻量模式
    resetToLightMode()
    
    // 步骤3: 清理IndexedDB
    await clearIndexedDB()
    
    // 步骤4: 跳转到微信界面
    forceWeChatInterface()
    
    console.log('✅ 修复完成！')
    
    // 如果还在当前页面，刷新页面
    setTimeout(() => {
      if (window.location.pathname !== '/wechat-layout') {
        window.location.href = '/wechat-layout'
      } else {
        window.location.reload()
      }
    }, 1000)
    
  } catch (error) {
    console.error('❌ 修复过程中出错:', error)
    alert('修复过程中出错，请手动刷新页面')
  }
}

// 立即执行修复
performFix()

// 导出修复函数供手动调用
window.fixWeChatInterface = performFix