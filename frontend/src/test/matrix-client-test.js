// Matrix客户端测试脚本
// 用于验证修复后的Matrix客户端初始化是否正常工作

console.log('🧪 开始Matrix客户端测试...')

// 测试1: 检查是否有多个客户端实例
function testSingleClientInstance() {
  console.log('\n📋 测试1: 检查客户端实例唯一性')
  
  // 检查全局变量中是否有多个Matrix客户端
  const matrixClients = []
  
  // 检查window对象中的Matrix相关实例
  for (const key in window) {
    if (key.includes('matrix') || key.includes('Matrix')) {
      console.log(`发现Matrix相关全局变量: ${key}`)
    }
  }
  
  // 检查是否有多个WASM实例
  const wasmModules = []
  for (const key in window) {
    if (key.includes('wasm') || key.includes('crypto')) {
      wasmModules.push(key)
    }
  }
  
  if (wasmModules.length > 1) {
    console.warn(`⚠️ 发现多个WASM模块: ${wasmModules.join(', ')}`)
  } else {
    console.log('✅ WASM模块数量正常')
  }
}

// 测试2: 检查Matrix store状态
function testMatrixStoreState() {
  console.log('\n📋 测试2: 检查Matrix store状态')
  
  try {
    // 尝试获取Matrix store
    const matrixStore = window.__VUE_DEVTOOLS_GLOBAL_HOOK__?.apps?.[0]?.config?.globalProperties?.$pinia?.state?.value?.matrix
    
    if (matrixStore) {
      console.log('✅ Matrix store已找到')
      console.log(`- 客户端存在: ${!!matrixStore.matrixClient}`)
      console.log(`- 连接状态: ${matrixStore.connection?.connected}`)
      console.log(`- 房间数量: ${matrixStore.rooms?.length || 0}`)
      console.log(`- 初始化中: ${matrixStore.clientInitializing}`)
    } else {
      console.warn('⚠️ 无法找到Matrix store')
    }
  } catch (error) {
    console.error('❌ 检查Matrix store失败:', error)
  }
}

// 测试3: 检查网络请求
function testNetworkRequests() {
  console.log('\n📋 测试3: 监控Matrix网络请求')
  
  // 监控fetch请求
  const originalFetch = window.fetch
  let matrixRequestCount = 0
  let cryptoRequestCount = 0
  
  window.fetch = function(...args) {
    const url = args[0]
    if (typeof url === 'string') {
      if (url.includes('matrix.org')) {
        matrixRequestCount++
        if (url.includes('keys/upload')) {
          cryptoRequestCount++
          console.log(`🔑 密钥上传请求 #${cryptoRequestCount}: ${url}`)
        }
      }
    }
    return originalFetch.apply(this, args)
  }
  
  // 5秒后报告结果
  setTimeout(() => {
    console.log(`📊 Matrix请求统计:`)
    console.log(`- 总Matrix请求: ${matrixRequestCount}`)
    console.log(`- 密钥上传请求: ${cryptoRequestCount}`)
    
    if (cryptoRequestCount > 3) {
      console.warn(`⚠️ 密钥上传请求过多，可能有多个客户端实例`)
    } else {
      console.log('✅ 密钥上传请求数量正常')
    }
    
    // 恢复原始fetch
    window.fetch = originalFetch
  }, 5000)
}

// 测试4: 检查组件挂载次数
function testComponentMounting() {
  console.log('\n📋 测试4: 监控组件挂载')
  
  // 监控console.log来检测组件挂载
  const originalLog = console.log
  let layoutMountCount = 0
  
  console.log = function(...args) {
    const message = args.join(' ')
    if (message.includes('WeChatStyleLayout 组件挂载开始')) {
      layoutMountCount++
      console.warn(`🔄 WeChatStyleLayout挂载次数: ${layoutMountCount}`)
      
      if (layoutMountCount > 1) {
        console.warn('⚠️ 组件被多次挂载，这可能导致重复初始化')
        // 打印调用栈
        console.trace('组件挂载调用栈:')
      }
    }
    return originalLog.apply(this, args)
  }
  
  // 10秒后恢复
  setTimeout(() => {
    console.log = originalLog
    console.log(`📊 组件挂载统计: WeChatStyleLayout挂载了 ${layoutMountCount} 次`)
  }, 10000)
}

// 运行所有测试
function runAllTests() {
  testSingleClientInstance()
  testMatrixStoreState()
  testNetworkRequests()
  testComponentMounting()
  
  console.log('\n🎯 测试已启动，请观察控制台输出...')
  console.log('💡 建议：刷新页面并观察是否还有重复初始化的问题')
}

// 导出测试函数
window.matrixClientTest = {
  runAllTests,
  testSingleClientInstance,
  testMatrixStoreState,
  testNetworkRequests,
  testComponentMounting
}

// 自动运行测试
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', runAllTests)
} else {
  runAllTests()
}

console.log('🧪 Matrix客户端测试脚本已加载')
console.log('💡 可以在控制台中运行 matrixClientTest.runAllTests() 来重新运行测试')
