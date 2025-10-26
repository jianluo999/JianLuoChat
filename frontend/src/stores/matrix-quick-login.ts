import { defineStore } from 'pinia'
import { ref } from 'vue'

// 快速登录Matrix服务 - 仅用于快速登录，不进行完整初始化
export const useMatrixQuickLogin = defineStore('matrix-quick-login', () => {
  // 简化状态管理
  const connection = ref({
    connected: false,
    homeserver: 'https://matrix.org',
    userId: null,
    accessToken: null,
    deviceId: null
  })
  
  const loading = ref(false)
  const error = ref(null)
  const loginComplete = ref(false)
  
  // 快速登录 - 仅验证登录凭据，不进行完整初始化
  const quickLogin = async (username: string, password: string) => {
    try {
      loading.value = true
      error.value = null
      
      console.log(`🚀 快速登录: ${username}@matrix.org`)
      
      // 1. 快速登录 - 只验证凭据，不等待完整同步
      const response = await fetch(`https://matrix.org/_matrix/client/v3/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'm.login.password',
          user: username,
          password: password
        })
      })
      
      if (!response.ok) {
        throw new Error('登录失败，请检查用户名和密码')
      }
      
      const loginResponse = await response.json()
      
      // 仅设置基础状态，不启动完整同步
      connection.value = {
        connected: true,
        homeserver: 'https://matrix.org',
        userId: loginResponse.user_id,
        accessToken: loginResponse.access_token,
        deviceId: loginResponse.device_id
      }
      
      // 保存登录信息 - 同时保存路由守卫期望的键名
      const loginData = {
        ...loginResponse,
        timestamp: Date.now(),
        homeserver: 'https://matrix.org'
      }
      
      localStorage.setItem('quick-matrix-login', JSON.stringify(loginData))
      localStorage.setItem('matrix_access_token', loginResponse.access_token)
      localStorage.setItem('matrix_login_info', JSON.stringify(loginData))
      localStorage.setItem('matrix-v39-login-info', JSON.stringify(loginData))
      
      console.log('✅ 快速登录成功')
      return { success: true, user: { id: loginResponse.user_id } }
    } catch (err: any) {
      console.error('❌ 快速登录失败:', err)
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }
  
  // 后台初始化 - 触发完整的 Matrix V39 store 初始化
  const initializeFullMatrix = async () => {
    try {
      const loginData = localStorage.getItem('quick-matrix-login')
      if (!loginData) return
      
      console.log('🔄 触发完整Matrix功能初始化...')
      
      // 导入并使用 V39 store
      const { useMatrixV39Store } = await import('./matrix-v39-clean')
      const matrixV39Store = useMatrixV39Store()
      
      // 触发完整初始化
      const initialized = await matrixV39Store.initializeMatrix()
      
      if (initialized) {
        console.log('✅ 完整Matrix功能初始化成功')
      } else {
        console.warn('⚠️ 完整初始化失败，但快速登录仍然有效')
      }
      
    } catch (error) {
      console.warn('⚠️ 后台初始化失败:', error)
      // 失败不影响快速登录功能
    }
  }
  
  // 检查是否已登录
  const checkLoginStatus = () => {
    const quickLogin = localStorage.getItem('quick-matrix-login')
    const accessToken = localStorage.getItem('matrix_access_token')
    
    if (quickLogin && accessToken) {
      try {
        const loginData = JSON.parse(quickLogin)
        connection.value = {
          connected: true,
          homeserver: loginData.homeserver || 'https://matrix.org',
          userId: loginData.user_id,
          accessToken: loginData.access_token,
          deviceId: loginData.device_id
        }
        return true
      } catch (error) {
        console.warn('解析登录信息失败:', error)
        logout()
        return false
      }
    }
    return false
  }
  
  // 登出
  const logout = () => {
    connection.value = {
      connected: false,
      homeserver: 'https://matrix.org',
      userId: null,
      accessToken: null,
      deviceId: null
    }
    
    // 清理所有登录相关的存储
    localStorage.removeItem('quick-matrix-login')
    localStorage.removeItem('matrix_access_token')
    localStorage.removeItem('matrix_login_info')
    localStorage.removeItem('matrix-v39-login-info')
    
    console.log('✅ 快速登录已清理')
  }
  
  // 快速获取房间列表 - 从缓存或API获取最近房间
  const getQuickRooms = async (): Promise<any[]> => {
    try {
      if (!connection.value.accessToken) return []
      
      const response = await fetch(`${connection.value.homeserver}/_matrix/client/v3/joined_rooms`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${connection.value.accessToken}`
        }
      })
      
      if (!response.ok) return []
      
      const data = await response.json()
      return data.joined_rooms || []
    } catch (error) {
      console.warn('获取房间失败:', error)
      return []
    }
  }
  
  // 初始化时检查登录状态
  checkLoginStatus()
  
  return {
    // 状态
    connection,
    loading,
    error,
    loginComplete,
    // 方法
    quickLogin,
    initializeFullMatrix,
    getQuickRooms,
    checkLoginStatus,
    logout
  }
})