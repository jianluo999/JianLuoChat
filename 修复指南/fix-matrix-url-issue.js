/**
 * Fix Matrix URL Double Protocol Issue
 * 
 * This script fixes the "https://https//matrix.org" URL issue
 * by cleaning up localStorage and ensuring proper URL formatting.
 */

console.log('🔧 Matrix URL 修复工具启动...')

// 1. 检查并修复localStorage中的URL
function fixStoredUrls() {
  const storageKeys = [
    'matrix-quick-auth',
    'matrix-quick-auth-backup',
    'matrix_login_info',
    'matrix-v39-login-info',
    'matrix-emergency-backup'
  ]
  
  let fixedCount = 0
  
  storageKeys.forEach(key => {
    try {
      const data = localStorage.getItem(key)
      if (data) {
        const parsed = JSON.parse(data)
        
        // 检查并修复homeserver URL
        if (parsed.homeserver && parsed.homeserver.includes('https://https://')) {
          console.log(`🔧 修复 ${key} 中的URL: ${parsed.homeserver}`)
          parsed.homeserver = parsed.homeserver.replace('https://https://', 'https://')
          localStorage.setItem(key, JSON.stringify(parsed))
          fixedCount++
          console.log(`✅ 已修复为: ${parsed.homeserver}`)
        }
      }
    } catch (error) {
      console.warn(`⚠️ 处理 ${key} 时出错:`, error)
    }
  })
  
  return fixedCount
}

// 2. 验证URL格式的辅助函数
function validateUrl(url) {
  try {
    const urlObj = new URL(url)
    return urlObj.protocol === 'https:' && !url.includes('https://https://')
  } catch {
    return false
  }
}

// 3. 测试Matrix连接
async function testMatrixConnection() {
  try {
    const authData = localStorage.getItem('matrix-quick-auth')
    if (!authData) {
      console.log('❌ 没有找到认证数据')
      return false
    }
    
    const parsed = JSON.parse(authData)
    const homeserver = parsed.homeserver || 'https://matrix.org'
    
    console.log(`🧪 测试连接到: ${homeserver}`)
    
    if (!validateUrl(homeserver)) {
      console.error('❌ URL格式无效:', homeserver)
      return false
    }
    
    const response = await fetch(`${homeserver}/_matrix/client/versions`)
    
    if (response.ok) {
      console.log('✅ Matrix服务器连接成功')
      const versions = await response.json()
      console.log('📋 支持的版本:', versions.versions?.slice(0, 3))
      return true
    } else {
      console.error('❌ 服务器响应错误:', response.status, response.statusText)
      return false
    }
    
  } catch (error) {
    console.error('❌ 连接测试失败:', error.message)
    return false
  }
}

// 4. 主修复流程
async function main() {
  console.log('🔍 开始检查和修复...')
  
  // 修复存储的URL
  const fixedCount = fixStoredUrls()
  console.log(`🔧 修复了 ${fixedCount} 个存储项`)
  
  // 测试连接
  const connectionOk = await testMatrixConnection()
  
  if (connectionOk) {
    console.log('🎉 修复完成！Matrix连接正常')
    
    // 建议刷新页面
    if (confirm('修复完成！是否刷新页面以应用更改？')) {
      window.location.reload()
    }
  } else {
    console.log('⚠️ 连接仍有问题，可能需要重新登录')
    
    // 提供清理选项
    if (confirm('是否清理所有认证数据并重新开始？')) {
      const authKeys = [
        'matrix-quick-auth',
        'matrix-quick-auth-backup',
        'matrix_login_info',
        'matrix-v39-login-info',
        'matrix_access_token',
        'matrix-emergency-backup'
      ]
      
      authKeys.forEach(key => localStorage.removeItem(key))
      console.log('🧹 认证数据已清理，请重新登录')
      
      if (confirm('是否刷新页面？')) {
        window.location.reload()
      }
    }
  }
}

// 运行修复
main().catch(error => {
  console.error('❌ 修复过程出错:', error)
})

// 导出辅助函数供手动使用
window.matrixUrlFix = {
  fixStoredUrls,
  validateUrl,
  testMatrixConnection,
  
  // 手动清理函数
  clearAuth() {
    const keys = [
      'matrix-quick-auth',
      'matrix-quick-auth-backup', 
      'matrix_login_info',
      'matrix-v39-login-info',
      'matrix_access_token',
      'matrix-emergency-backup'
    ]
    keys.forEach(key => localStorage.removeItem(key))
    console.log('🧹 所有认证数据已清理')
  },
  
  // 检查当前状态
  checkStatus() {
    const authData = localStorage.getItem('matrix-quick-auth')
    if (authData) {
      try {
        const parsed = JSON.parse(authData)
        console.log('📊 当前状态:', {
          homeserver: parsed.homeserver,
          userId: parsed.user_id,
          hasToken: !!parsed.access_token,
          urlValid: validateUrl(parsed.homeserver || 'https://matrix.org')
        })
      } catch (error) {
        console.error('❌ 解析认证数据失败:', error)
      }
    } else {
      console.log('❌ 没有认证数据')
    }
  }
}

console.log('💡 可以使用 window.matrixUrlFix 访问修复工具')