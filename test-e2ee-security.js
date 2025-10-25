/**
 * E2EE 安全测试脚本
 * 在浏览器控制台中运行此脚本来快速检查E2EE安全状态
 */

(async function testE2EESecurity() {
  console.log('🔍 开始E2EE安全快速检查...')
  
  const results = []
  
  // 1. 检查基础环境
  console.log('\n📋 检查基础环境...')
  
  // HTTPS检查
  const isHTTPS = location.protocol === 'https:'
  results.push({
    check: 'HTTPS连接',
    status: isHTTPS ? '✅ 通过' : '❌ 失败',
    critical: !isHTTPS
  })
  console.log(`HTTPS连接: ${isHTTPS ? '✅ 通过' : '❌ 失败'}`)
  
  // Web Crypto API检查
  const hasCrypto = 'crypto' in window && 'subtle' in window.crypto
  results.push({
    check: 'Web Crypto API',
    status: hasCrypto ? '✅ 通过' : '❌ 失败',
    critical: !hasCrypto
  })
  console.log(`Web Crypto API: ${hasCrypto ? '✅ 通过' : '❌ 失败'}`)
  
  // IndexedDB检查
  const hasIndexedDB = 'indexedDB' in window && indexedDB !== null
  results.push({
    check: 'IndexedDB支持',
    status: hasIndexedDB ? '✅ 通过' : '❌ 失败',
    critical: false
  })
  console.log(`IndexedDB支持: ${hasIndexedDB ? '✅ 通过' : '❌ 失败'}`)
  
  // WebAssembly检查
  const hasWASM = 'WebAssembly' in window
  results.push({
    check: 'WebAssembly支持',
    status: hasWASM ? '✅ 通过' : '❌ 失败',
    critical: false
  })
  console.log(`WebAssembly支持: ${hasWASM ? '✅ 通过' : '❌ 失败'}`)
  
  // 2. 检查Matrix客户端状态
  console.log('\n📋 检查Matrix客户端状态...')
  
  let matrixClient = null
  try {
    // 尝试从Vue应用获取Matrix客户端
    if (window.__VUE_APP__ && window.__VUE_APP__.config && window.__VUE_APP__.config.globalProperties) {
      const app = window.__VUE_APP__
      // 这里需要根据实际的应用结构调整
    }
    
    // 或者从全局变量获取（如果有的话）
    if (window.matrixClient) {
      matrixClient = window.matrixClient
    }
    
    console.log(`Matrix客户端: ${matrixClient ? '✅ 已初始化' : '❌ 未初始化'}`)
    results.push({
      check: 'Matrix客户端',
      status: matrixClient ? '✅ 已初始化' : '❌ 未初始化',
      critical: !matrixClient
    })
    
  } catch (error) {
    console.log(`Matrix客户端检查失败: ${error.message}`)
    results.push({
      check: 'Matrix客户端',
      status: `❌ 检查失败: ${error.message}`,
      critical: true
    })
  }
  
  // 3. 检查加密状态
  if (matrixClient) {
    console.log('\n📋 检查加密状态...')
    
    try {
      const crypto = matrixClient.getCrypto()
      console.log(`加密API: ${crypto ? '✅ 可用' : '❌ 不可用'}`)
      results.push({
        check: '加密API',
        status: crypto ? '✅ 可用' : '❌ 不可用',
        critical: !crypto
      })
      
      if (crypto) {
        // 检查关键方法
        const methods = ['exportRoomKeys', 'importRoomKeys', 'getUserDevices', 'requestDeviceVerification']
        for (const method of methods) {
          const available = typeof crypto[method] === 'function'
          console.log(`${method}: ${available ? '✅ 可用' : '❌ 不可用'}`)
          results.push({
            check: method,
            status: available ? '✅ 可用' : '❌ 不可用',
            critical: !available
          })
        }
        
        // 检查用户和设备信息
        const userId = matrixClient.getUserId()
        const deviceId = matrixClient.getDeviceId()
        console.log(`用户ID: ${userId || '❌ 不可用'}`)
        console.log(`设备ID: ${deviceId || '❌ 不可用'}`)
        
        results.push({
          check: '用户身份',
          status: userId ? `✅ ${userId}` : '❌ 不可用',
          critical: !userId
        })
        
        results.push({
          check: '设备身份',
          status: deviceId ? `✅ ${deviceId}` : '❌ 不可用',
          critical: !deviceId
        })
      }
      
    } catch (error) {
      console.log(`加密状态检查失败: ${error.message}`)
      results.push({
        check: '加密状态检查',
        status: `❌ 失败: ${error.message}`,
        critical: true
      })
    }
  }
  
  // 4. 检查存储状态
  console.log('\n📋 检查存储状态...')
  
  try {
    if (hasIndexedDB) {
      const databases = await indexedDB.databases()
      const cryptoDatabases = databases.filter(db => 
        db.name && (db.name.includes('crypto') || db.name.includes('matrix'))
      )
      
      console.log(`加密数据库: 发现${cryptoDatabases.length}个`)
      cryptoDatabases.forEach(db => {
        console.log(`  - ${db.name}`)
      })
      
      results.push({
        check: '加密数据库',
        status: `✅ 发现${cryptoDatabases.length}个`,
        critical: false
      })
    }
  } catch (error) {
    console.log(`存储状态检查失败: ${error.message}`)
    results.push({
      check: '存储状态检查',
      status: `❌ 失败: ${error.message}`,
      critical: false
    })
  }
  
  // 5. 生成总结报告
  console.log('\n📊 安全检查总结:')
  console.log('=' .repeat(50))
  
  const criticalIssues = results.filter(r => r.critical && r.status.includes('❌')).length
  const totalIssues = results.filter(r => r.status.includes('❌')).length
  const totalChecks = results.length
  
  console.log(`总检查项: ${totalChecks}`)
  console.log(`发现问题: ${totalIssues}`)
  console.log(`严重问题: ${criticalIssues}`)
  
  if (criticalIssues > 0) {
    console.log('\n🚨 发现严重安全问题:')
    results.filter(r => r.critical && r.status.includes('❌')).forEach(r => {
      console.log(`  ❌ ${r.check}: ${r.status}`)
    })
    console.log('\n⚠️ 建议立即修复这些问题后再使用E2EE功能!')
  } else if (totalIssues > 0) {
    console.log('\n⚠️ 发现一些问题，建议修复:')
    results.filter(r => r.status.includes('❌')).forEach(r => {
      console.log(`  ❌ ${r.check}: ${r.status}`)
    })
  } else {
    console.log('\n✅ 基础检查通过，但仍需要进行深度安全测试!')
  }
  
  console.log('\n📋 详细结果:')
  console.table(results)
  
  console.log('\n🔗 下一步建议:')
  console.log('1. 访问 /security-audit 页面进行完整的安全检查')
  console.log('2. 实施 E2EE_FIX_IMPLEMENTATION_PLAN.md 中的修复方案')
  console.log('3. 运行端到端加密测试验证消息确实被加密')
  console.log('4. 验证服务器无法解密加密消息')
  
  return {
    totalChecks,
    totalIssues,
    criticalIssues,
    results,
    recommendation: criticalIssues > 0 ? 'CRITICAL - 立即修复' : 
                   totalIssues > 0 ? 'WARNING - 建议修复' : 'OK - 基础检查通过'
  }
})()