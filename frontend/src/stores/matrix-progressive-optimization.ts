import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

/**
 * Matrix 渐进式优化 Store
 * 
 * 设计原则：
 * 1. 完全保留现有的 matrix-v39-clean.ts 所有功能
 * 2. 添加快速登录能力，不破坏原有架构
 * 3. 通过智能缓存和分阶段加载提升性能
 * 4. 保持所有容错机制和冗余设计
 */
export const useMatrixProgressiveOptimization = defineStore('matrix-progressive-optimization', () => {
  // ==================== 状态管理 ====================
  
  const optimizationEnabled = ref(true)
  const quickLoginMode = ref(false)
  const loadingStage = ref<'idle' | 'quick-auth' | 'basic-sync' | 'full-sync' | 'complete'>('idle')
  
  // 缓存管理
  const roomListCache = ref<any[]>([])
  const lastCacheTime = ref(0)
  const cacheValidDuration = 30000 // 30秒缓存有效期
  
  // 性能监控
  const performanceMetrics = ref({
    quickLoginTime: 0,
    basicSyncTime: 0,
    fullSyncTime: 0,
    roomUpdateTime: 0,
    totalOptimizationSaved: 0
  })
  
  // ==================== 计算属性 ====================
  
  const isQuickMode = computed(() => quickLoginMode.value && optimizationEnabled.value)
  const canUseCache = computed(() => {
    return Date.now() - lastCacheTime.value < cacheValidDuration && roomListCache.value.length > 0
  })
  
  // ==================== 快速登录优化 ====================
  
  /**
   * 快速登录 - 仅验证凭据，不等待完整同步
   * 完全不影响原有的 matrix-v39-clean.ts 登录流程
   */
  const quickLogin = async (username: string, password: string) => {
    if (!optimizationEnabled.value) {
      // 优化被禁用，直接使用原有流程
      return { success: false, reason: 'optimization_disabled', useOriginal: true }
    }
    
    try {
      const startTime = performance.now()
      loadingStage.value = 'quick-auth'
      
      console.log(`🚀 [优化] 快速登录验证: ${username}@matrix.org`)
      
      // 1. 快速验证登录凭据
      const response = await fetch(`https://matrix.org/_matrix/client/v3/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'm.login.password',
          user: username,
          password: password
        })
      })
      
      if (!response.ok) {
        throw new Error('登录验证失败')
      }
      
      const loginData = await response.json()
      
      // 2. 保存快速登录状态（不影响原有存储）
      const quickLoginInfo = {
        ...loginData,
        timestamp: Date.now(),
        homeserver: 'https://matrix.org',
        quickMode: true
      }
      
      // 使用独立的存储键，不影响原有逻辑
      localStorage.setItem('matrix-quick-auth', JSON.stringify(quickLoginInfo))
      
      // 3. 同时保存原有格式，确保兼容性
      localStorage.setItem('matrix_access_token', loginData.access_token)
      localStorage.setItem('matrix_login_info', JSON.stringify(quickLoginInfo))
      
      quickLoginMode.value = true
      loadingStage.value = 'basic-sync'
      
      const quickLoginTime = performance.now() - startTime
      performanceMetrics.value.quickLoginTime = quickLoginTime
      
      console.log(`✅ [优化] 快速登录成功 [${quickLoginTime.toFixed(2)}ms]`)
      
      return { 
        success: true, 
        user: { id: loginData.user_id },
        accessToken: loginData.access_token,
        quickMode: true
      }
      
    } catch (error) {
      console.warn('⚠️ [优化] 快速登录失败，将使用原有流程:', error)
      loadingStage.value = 'idle'
      quickLoginMode.value = false
      
      // 返回失败，让调用方使用原有流程
      return { success: false, error, useOriginal: true }
    }
  }
  
  // ==================== 房间列表优化 ====================
  
  /**
   * 智能房间列表更新 - 使用缓存和分批加载
   * 完全不替换原有的 updateRoomsFromClient 函数
   */
  const optimizedRoomUpdate = async (client: any, forceUpdate = false) => {
    if (!optimizationEnabled.value || !client) {
      return null // 让原有逻辑处理
    }
    
    try {
      const startTime = performance.now()
      
      // 1. 检查缓存
      if (!forceUpdate && canUseCache.value) {
        console.log(`📋 [优化] 使用房间列表缓存 (${roomListCache.value.length} 房间)`)
        return roomListCache.value
      }
      
      // 2. 快速获取基础房间信息
      console.log('🔄 [优化] 快速获取房间列表...')
      
      const rooms = client.getRooms()
      const quickRooms = rooms.slice(0, 20).map((room: any) => ({
        id: room.roomId,
        name: room.name || room.roomId,
        type: room.isSpaceRoom?.() ? 'space' : 'room',
        unreadCount: room.getUnreadNotificationCount() || 0,
        avatarUrl: room.getAvatarUrl?.(client.baseUrl, 32, 32, 'scale'),
        lastActivity: room.getLastActiveTimestamp?.() || Date.now(),
        memberCount: room.getJoinedMemberCount() || 0,
        // 标记为快速加载
        quickLoaded: true,
        fullDataPending: rooms.length > 20
      }))
      
      // 3. 更新缓存
      roomListCache.value = quickRooms
      lastCacheTime.value = Date.now()
      
      const updateTime = performance.now() - startTime
      performanceMetrics.value.roomUpdateTime = updateTime
      
      console.log(`✅ [优化] 快速房间列表更新完成 [${updateTime.toFixed(2)}ms]: ${quickRooms.length} 房间`)
      
      // 4. 异步加载完整数据（不阻塞UI）
      if (rooms.length > 20) {
        setTimeout(() => {
          loadRemainingRooms(client, rooms.slice(20))
        }, 100)
      }
      
      return quickRooms
      
    } catch (error) {
      console.warn('⚠️ [优化] 房间列表优化失败，使用原有逻辑:', error)
      return null // 让原有逻辑处理
    }
  }
  
  /**
   * 异步加载剩余房间 - 不阻塞主线程
   */
  const loadRemainingRooms = async (client: any, remainingRooms: any[]) => {
    try {
      console.log(`🔄 [优化] 后台加载剩余 ${remainingRooms.length} 个房间...`)
      
      // 分批处理，每批5个房间
      const batchSize = 5
      for (let i = 0; i < remainingRooms.length; i += batchSize) {
        const batch = remainingRooms.slice(i, i + batchSize)
        
        const batchRooms = batch.map((room: any) => ({
          id: room.roomId,
          name: room.name || room.roomId,
          type: room.isSpaceRoom?.() ? 'space' : 'room',
          unreadCount: room.getUnreadNotificationCount() || 0,
          avatarUrl: room.getAvatarUrl?.(client.baseUrl, 32, 32, 'scale'),
          lastActivity: room.getLastActiveTimestamp?.() || Date.now(),
          memberCount: room.getJoinedMemberCount() || 0,
          quickLoaded: false
        }))
        
        // 追加到缓存
        roomListCache.value.push(...batchRooms)
        
        // 让出主线程
        await new Promise(resolve => setTimeout(resolve, 10))
      }
      
      console.log(`✅ [优化] 所有房间加载完成: ${roomListCache.value.length} 房间`)
      
    } catch (error) {
      console.warn('⚠️ [优化] 后台房间加载失败:', error)
    }
  }
  
  // ==================== 渐进式初始化 ====================
  
  /**
   * 渐进式Matrix初始化 - 分阶段加载，不阻塞UI
   * 与原有的 initializeMatrix 并行工作，不替换
   */
  const progressiveInitialize = async () => {
    if (!optimizationEnabled.value || !quickLoginMode.value) {
      return false
    }
    
    try {
      console.log('🔄 [优化] 启动渐进式初始化...')
      
      // 阶段1: 基础连接（已在快速登录中完成）
      loadingStage.value = 'basic-sync'
      
      // 阶段2: 获取基础房间列表
      const quickAuth = localStorage.getItem('matrix-quick-auth')
      if (quickAuth) {
        const authData = JSON.parse(quickAuth)
        
        // 创建轻量级客户端连接
        const basicResponse = await fetch(`https://matrix.org/_matrix/client/v3/joined_rooms`, {
          headers: { 'Authorization': `Bearer ${authData.access_token}` }
        })
        
        if (basicResponse.ok) {
          const roomsData = await basicResponse.json()
          console.log(`📋 [优化] 获取到 ${roomsData.joined_rooms?.length || 0} 个房间ID`)
        }
      }
      
      loadingStage.value = 'full-sync'
      
      // 阶段3: 触发完整初始化（异步，不阻塞）
      setTimeout(async () => {
        try {
          console.log('🔄 [优化] 触发完整Matrix初始化...')
          
          // 动态导入原有store，避免循环依赖
          const { useMatrixV39Store } = await import('./matrix-v39-clean')
          const matrixV39Store = useMatrixV39Store()
          
          // 触发完整初始化，但不等待
          matrixV39Store.initializeMatrix().then((success) => {
            if (success) {
              console.log('✅ [优化] 完整Matrix功能初始化成功')
              loadingStage.value = 'complete'
              
              // 计算总优化时间
              const totalSaved = performanceMetrics.value.quickLoginTime
              performanceMetrics.value.totalOptimizationSaved = totalSaved
              console.log(`📊 [优化] 总计节省时间: ${totalSaved.toFixed(2)}ms`)
            } else {
              console.warn('⚠️ [优化] 完整初始化失败，但快速登录仍然有效')
            }
          }).catch((error) => {
            console.warn('⚠️ [优化] 完整初始化异常:', error)
          })
          
        } catch (error) {
          console.warn('⚠️ [优化] 渐进式初始化失败:', error)
        }
      }, 500) // 500ms后开始完整初始化
      
      return true
      
    } catch (error) {
      console.warn('⚠️ [优化] 渐进式初始化失败:', error)
      loadingStage.value = 'idle'
      return false
    }
  }
  
  // ==================== 智能防抖优化 ====================
  
  let roomUpdateTimer: any = null
  let syncUpdateTimer: any = null
  
  /**
   * 智能房间更新防抖 - 减少不必要的更新
   * 不替换原有逻辑，只是提供优化建议
   */
  const debouncedRoomUpdate = (client: any, delay = 300) => {
    if (!optimizationEnabled.value) return
    
    if (roomUpdateTimer) {
      clearTimeout(roomUpdateTimer)
    }
    
    roomUpdateTimer = setTimeout(() => {
      optimizedRoomUpdate(client, true)
      roomUpdateTimer = null
    }, delay)
  }
  
  /**
   * 智能同步更新防抖
   */
  const debouncedSyncUpdate = (callback: () => void, delay = 500) => {
    if (!optimizationEnabled.value) {
      callback()
      return
    }
    
    if (syncUpdateTimer) {
      clearTimeout(syncUpdateTimer)
    }
    
    syncUpdateTimer = setTimeout(() => {
      callback()
      syncUpdateTimer = null
    }, delay)
  }
  
  // ==================== 配置管理 ====================
  
  /**
   * 启用/禁用优化
   */
  const toggleOptimization = (enabled: boolean) => {
    optimizationEnabled.value = enabled
    console.log(`🔧 [优化] ${enabled ? '启用' : '禁用'}渐进式优化`)
    
    if (!enabled) {
      // 清理优化状态
      quickLoginMode.value = false
      loadingStage.value = 'idle'
      roomListCache.value = []
      lastCacheTime.value = 0
    }
  }
  
  /**
   * 清理缓存
   */
  const clearCache = () => {
    roomListCache.value = []
    lastCacheTime.value = 0
    localStorage.removeItem('matrix-quick-auth')
    console.log('🧹 [优化] 缓存已清理')
  }
  
  /**
   * 获取优化统计
   */
  const getOptimizationStats = () => {
    return {
      enabled: optimizationEnabled.value,
      quickMode: quickLoginMode.value,
      stage: loadingStage.value,
      cacheSize: roomListCache.value.length,
      cacheValid: canUseCache.value,
      metrics: performanceMetrics.value
    }
  }
  
  // ==================== 返回接口 ====================
  
  return {
    // 状态
    optimizationEnabled,
    quickLoginMode,
    loadingStage,
    isQuickMode,
    canUseCache,
    
    // 快速登录
    quickLogin,
    progressiveInitialize,
    
    // 房间优化
    optimizedRoomUpdate,
    debouncedRoomUpdate,
    debouncedSyncUpdate,
    
    // 配置管理
    toggleOptimization,
    clearCache,
    getOptimizationStats,
    
    // 性能数据
    performanceMetrics,
    roomListCache
  }
})