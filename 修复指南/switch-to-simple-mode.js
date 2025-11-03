// 切换到简化模式解决卡顿问题
console.log('⚡ 切换到简化模式...')

// 1. 清理所有可能导致卡顿的数据
function clearAllLaggyData() {
  console.log('🧹 清理所有卡顿数据...')
  
  // 保存重要的登录信息
  const loginInfo = localStorage.getItem('matrix-v39-login-info')
  const accessToken = localStorage.getItem('matrix_access_token')
  
  // 清理所有Matrix相关数据
  const allKeys = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key) allKeys.push(key)
  }
  
  // 清理除了登录信息外的所有数据
  allKeys.forEach(key => {
    if (key !== 'matrix-v39-login-info' && key !== 'matrix_access_token') {
      localStorage.removeItem(key)
    }
  })
  
  // 恢复登录信息
  if (loginInfo) localStorage.setItem('matrix-v39-login-info', loginInfo)
  if (accessToken) localStorage.setItem('matrix_access_token', accessToken)
  
  // 设置简化模式标志
  localStorage.setItem('use-simple-mode', 'true')
  localStorage.setItem('disable-crypto', 'true')
  localStorage.setItem('limit-messages', '50')
  localStorage.setItem('limit-rooms', '100')
  
  console.log('✅ 数据清理完成，已启用简化模式')
}

// 2. 清理IndexedDB
async function clearAllIndexedDB() {
  console.log('🗄️ 清理所有IndexedDB...')
  
  try {
    // 获取所有数据库
    const databases = await indexedDB.databases()
    
    for (const db of databases) {
      if (db.name) {
        try {
          await new Promise((resolve) => {
            const deleteReq = indexedDB.deleteDatabase(db.name)
            deleteReq.onsuccess = () => {
              console.log(`✅ 清理数据库: ${db.name}`)
              resolve(true)
            }
            deleteReq.onerror = () => {
              console.warn(`清理数据库 ${db.name} 失败`)
              resolve(false)
            }
            deleteReq.onblocked = () => {
              console.warn(`数据库 ${db.name} 被阻塞`)
              resolve(false)
            }
          })
        } catch (e) {
          console.warn(`清理数据库 ${db.name} 异常:`, e)
        }
      }
    }
  } catch (e) {
    console.warn('获取数据库列表失败，使用备用清理方法')
    
    // 备用清理方法
    const commonDbNames = [
      'matrix-js-sdk::matrix-sdk-crypto',
      'matrix-js-sdk::crypto',
      'matrix-js-sdk::store',
      'jianluochat-matrix-v39-store',
      'jianluochat-matrix-v39-crypto'
    ]
    
    for (const dbName of commonDbNames) {
      try {
        indexedDB.deleteDatabase(dbName)
      } catch (e) {
        console.warn(`清理数据库 ${dbName} 失败:`, e)
      }
    }
  }
  
  console.log('✅ IndexedDB清理完成')
}

// 3. 强制内存清理
function forceMemoryCleanup() {
  console.log('🧠 强制内存清理...')
  
  // 清理可能的全局变量
  if (window.matrixClient) {
    try {
      window.matrixClient.removeAllListeners()
      window.matrixClient.stopClient()
      window.matrixClient = null
    } catch (e) {
      console.warn('清理全局Matrix客户端失败:', e)
    }
  }
  
  // 强制垃圾回收
  if (window.gc) {
    window.gc()
    console.log('✅ 强制垃圾回收完成')
  }
  
  // 显示内存使用情况
  if (window.performance && window.performance.memory) {
    const memory = window.performance.memory
    console.log('📊 内存使用情况:', {
      used: Math.round(memory.usedJSHeapSize / 1024 / 1024) + 'MB',
      total: Math.round(memory.totalJSHeapSize / 1024 / 1024) + 'MB',
      limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024) + 'MB'
    })
  }
}

// 4. 重定向到微信界面
function redirectToWeChatInterface() {
  console.log('📱 重定向到微信界面...')
  
  // 设置界面偏好
  localStorage.setItem('preferred-interface', 'wechat')
  localStorage.setItem('force-simple-mode', 'true')
  
  // 重定向
  const targetUrl = '/wechat-layout'
  if (window.location.pathname !== targetUrl) {
    console.log(`跳转到: ${targetUrl}`)
    window.location.href = targetUrl
  } else {
    console.log('已在目标页面，刷新页面')
    window.location.reload()
  }
}

// 执行完整的简化模式切换
async function switchToSimpleMode() {
  try {
    console.log('🚀 开始切换到简化模式...')
    
    // 显示进度
    const steps = [
      '清理卡顿数据',
      '清理IndexedDB',
      '内存清理',
      '跳转到微信界面'
    ]
    
    console.log('📋 执行步骤:', steps)
    
    // 步骤1: 清理数据
    console.log('1/4 清理卡顿数据...')
    clearAllLaggyData()
    
    // 步骤2: 清理IndexedDB
    console.log('2/4 清理IndexedDB...')
    await clearAllIndexedDB()
    
    // 步骤3: 内存清理
    console.log('3/4 内存清理...')
    forceMemoryCleanup()
    
    // 步骤4: 跳转
    console.log('4/4 跳转到微信界面...')
    redirectToWeChatInterface()
    
    console.log('✅ 简化模式切换完成！')
    
  } catch (error) {
    console.error('❌ 切换简化模式失败:', error)
    alert('切换简化模式失败，请手动刷新页面')
  }
}

// 立即执行
switchToSimpleMode()

// 导出函数供手动调用
window.switchToSimpleMode = switchToSimpleMode