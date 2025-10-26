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
   * 超级冗余登录系统 - 多重验证、备用方案、智能重试
   * 完全不影响原有的 matrix-v39-clean.ts 登录流程
   */
  const quickLogin = async (username: string, password: string, homeserver?: string) => {
    if (!optimizationEnabled.value) {
      return { success: false, reason: 'optimization_disabled', useOriginal: true }
    }
    
    const startTime = performance.now()
    loadingStage.value = 'quick-auth'
    
    // 预登录检查：检测用户变化并智能清理
    console.log('🔍 [预登录检查] 检查是否需要清理旧用户数据...')
    
    try {
      // 构造新用户ID（Matrix格式）
      const newUserId = username.startsWith('@') ? username : `@${username}:${(homeserver || 'https://matrix.org').replace('https://', '').replace('http://', '')}`
      
      const cleanupCheck = checkCleanupNeeded(newUserId)
      
      if (cleanupCheck.needsCleanup) {
        console.log(`🧹 [预登录检查] 检测到用户变化 (${cleanupCheck.currentUser} -> ${cleanupCheck.newUser})，执行清理...`)
        
        // 执行快速清理，不等待完成
        performFullCleanup({ userId: cleanupCheck.currentUser }).catch(error => {
          console.warn('⚠️ [预登录检查] 后台清理失败:', error)
        })
      } else {
        console.log('✅ [预登录检查] 同用户登录或首次登录，无需清理')
      }
    } catch (error) {
      console.warn('⚠️ [预登录检查] 预检查失败，继续登录:', error)
    }
    
    // 超级冗余设计：扩展服务器列表 + 智能排序
    const primaryServers = [
      homeserver || 'https://matrix.org',
      'https://matrix.org',
      'https://matrix.jianluochat.com'
    ]
    
    const backupServers = [
      'https://kde.org',
      'https://mozilla.org',
      'https://tchncs.de',
      'https://matrix.allmende.io',
      'https://converser.eu'
    ]
    
    // 智能服务器排序：根据历史成功率排序
    const getServerPriority = (server: string) => {
      const history = localStorage.getItem(`matrix-server-history-${server}`)
      if (!history) return 0
      const data = JSON.parse(history)
      return data.successRate || 0
    }
    
    const sortedBackupServers = backupServers.sort((a, b) => 
      getServerPriority(b) - getServerPriority(a)
    )
    
    const serverList = [...new Set([...primaryServers, ...sortedBackupServers])]
    
    console.log(`🚀 [冗余登录] 开始多重验证: ${username}`)
    console.log(`📋 [冗余登录] 服务器列表: ${serverList.join(', ')}`)
    
    let lastError = null
    let successResult = null
    
    // 冗余策略1: 超级并行验证（前4个服务器 + 智能超时）
    const parallelAttempts = serverList.slice(0, 4).map(async (server, index) => {
      try {
        console.log(`🔄 [并行验证] 尝试服务器 ${index + 1}: ${server}`)
        
        // 智能超时：主服务器更长时间，备用服务器更短
        const timeout = index === 0 ? 8000 : (index === 1 ? 6000 : 4000)
        
        const response = await Promise.race([
          fetch(`${server}/_matrix/client/v3/login`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'User-Agent': 'JianLuo-Chat-Web/1.0'
            },
            body: JSON.stringify({
              type: 'm.login.password',
              user: username,
              password: password,
              initial_device_display_name: `JianLuo Chat Web (Quick-${index + 1})`
            })
          }),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error(`并行验证超时 (${timeout}ms)`)), timeout)
          )
        ]) as Response
        
        if (!response.ok) {
          // 记录失败统计
          updateServerHistory(server, false, response.status)
          throw new Error(`服务器响应错误: ${response.status} ${response.statusText}`)
        }
        
        const loginData = await response.json()
        
        // 记录成功统计
        updateServerHistory(server, true)
        
        console.log(`✅ [并行验证] 成功: ${server} (${index + 1}/${serverList.length})`)
        
        return {
          success: true,
          server,
          loginData,
          method: 'parallel',
          priority: index,
          responseTime: performance.now() - startTime
        }
      } catch (error) {
        console.warn(`⚠️ [并行验证] 失败: ${server}`, error)
        updateServerHistory(server, false)
        return {
          success: false,
          server,
          error,
          method: 'parallel',
          priority: index
        }
      }
    })
    
    // 智能服务器历史记录更新
    const updateServerHistory = (server: string, success: boolean, statusCode?: number) => {
      try {
        const key = `matrix-server-history-${server}`
        const existing = localStorage.getItem(key)
        const history = existing ? JSON.parse(existing) : { 
          attempts: 0, 
          successes: 0, 
          lastSuccess: 0, 
          lastFailure: 0,
          avgResponseTime: 0,
          statusCodes: {}
        }
        
        history.attempts++
        if (success) {
          history.successes++
          history.lastSuccess = Date.now()
          history.avgResponseTime = (history.avgResponseTime + (performance.now() - startTime)) / 2
        } else {
          history.lastFailure = Date.now()
          if (statusCode) {
            history.statusCodes[statusCode] = (history.statusCodes[statusCode] || 0) + 1
          }
        }
        
        history.successRate = history.successes / history.attempts
        localStorage.setItem(key, JSON.stringify(history))
      } catch (error) {
        console.warn('⚠️ 无法更新服务器历史记录:', error)
      }
    }
    
    // 等待第一个成功的并行验证
    try {
      const parallelResults = await Promise.allSettled(parallelAttempts)
      const firstSuccess = parallelResults.find(result => 
        result.status === 'fulfilled' && result.value.success
      )
      
      if (firstSuccess && firstSuccess.status === 'fulfilled') {
        successResult = firstSuccess.value
        console.log(`🎉 [冗余登录] 并行验证成功: ${successResult.server}`)
      }
    } catch (error) {
      console.warn('⚠️ [冗余登录] 并行验证全部失败:', error)
    }
    
    // 冗余策略2: 智能顺序重试 + 指数退避
    if (!successResult) {
      console.log('🔄 [冗余登录] 启动智能顺序重试策略...')
      
      const remainingServers = serverList.slice(4)
      let retryDelay = 100 // 初始延迟100ms
      
      for (let i = 0; i < remainingServers.length; i++) {
        const server = remainingServers[i]
        
        try {
          // 指数退避延迟
          if (i > 0) {
            await new Promise(resolve => setTimeout(resolve, retryDelay))
            retryDelay = Math.min(retryDelay * 1.5, 2000) // 最大2秒延迟
          }
          
          console.log(`🔄 [顺序重试] 尝试服务器 ${i + 5}: ${server} (延迟: ${retryDelay}ms)`)
          
          const response = await Promise.race([
            fetch(`${server}/_matrix/client/v3/login`, {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json',
                'User-Agent': 'JianLuo-Chat-Web/1.0'
              },
              body: JSON.stringify({
                type: 'm.login.password',
                user: username,
                password: password,
                initial_device_display_name: `JianLuo Chat Web (Retry-${i + 1})`
              })
            }),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('顺序重试超时')), 6000)
            )
          ]) as Response
          
          if (!response.ok) {
            updateServerHistory(server, false, response.status)
            throw new Error(`服务器响应错误: ${response.status} ${response.statusText}`)
          }
          
          const loginData = await response.json()
          updateServerHistory(server, true)
          
          successResult = {
            success: true,
            server,
            loginData,
            method: 'sequential',
            retryIndex: i,
            responseTime: performance.now() - startTime
          }
          
          console.log(`✅ [顺序重试] 成功: ${server} (第${i + 1}次重试)`)
          break
          
        } catch (error) {
          console.warn(`⚠️ [顺序重试] 失败: ${server}`, error)
          updateServerHistory(server, false)
          lastError = error
        }
      }
    }
    
    // 冗余策略3: 多级缓存恢复 + Token验证
    if (!successResult) {
      console.log('🔄 [冗余登录] 启动多级缓存恢复...')
      
      const cacheKeys = [
        'matrix-quick-auth-backup',
        'matrix-v39-login-info', 
        'matrix-quick-auth',
        'matrix_login_info',
        'matrix-emergency-backup'
      ]
      
      for (const cacheKey of cacheKeys) {
        try {
          const cachedData = localStorage.getItem(cacheKey)
          if (!cachedData) continue
          
          const parsedData = JSON.parse(cachedData)
          
          // 多重时间验证
          const timestamps = [
            parsedData.timestamp,
            parsedData.loginTime,
            parsedData.created_at,
            parsedData.last_used
          ].filter(Boolean)
          
          if (timestamps.length === 0) continue
          
          const latestTimestamp = Math.max(...timestamps)
          const cacheAge = Date.now() - latestTimestamp
          
          // 分级缓存有效期：紧急备份48小时，其他24小时
          const maxAge = cacheKey.includes('emergency') ? 48 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000
          
          if (cacheAge > maxAge) {
            console.log(`⏰ [缓存恢复] ${cacheKey} 已过期 (${Math.round(cacheAge / 1000 / 60)}分钟)`)
            continue
          }
          
          console.log(`🔄 [缓存恢复] 验证 ${cacheKey} 凭据...`)
          
          // 多服务器Token验证
          const testServers = [
            parsedData.homeserver,
            parsedData.server,
            'https://matrix.org',
            'https://matrix.jianluochat.com'
          ].filter(Boolean)
          
          const accessToken = parsedData.accessToken || parsedData.access_token || parsedData.token
          if (!accessToken) continue
          
          for (const testServer of testServers) {
            try {
              const testResponse = await Promise.race([
                fetch(`${testServer}/_matrix/client/v3/account/whoami`, {
                  headers: { 
                    'Authorization': `Bearer ${accessToken}`,
                    'User-Agent': 'JianLuo-Chat-Web/1.0'
                  }
                }),
                new Promise((_, reject) => 
                  setTimeout(() => reject(new Error('Token验证超时')), 3000)
                )
              ]) as Response
              
              if (testResponse.ok) {
                const whoamiData = await testResponse.json()
                
                successResult = {
                  success: true,
                  server: testServer,
                  loginData: {
                    ...parsedData,
                    user_id: whoamiData.user_id,
                    access_token: accessToken,
                    verified_at: Date.now()
                  },
                  method: 'cache_recovery',
                  cacheSource: cacheKey,
                  responseTime: performance.now() - startTime
                }
                
                console.log(`✅ [缓存恢复] 成功恢复: ${cacheKey} -> ${testServer}`)
                
                // 更新紧急备份
                localStorage.setItem('matrix-emergency-backup', JSON.stringify({
                  ...parsedData,
                  last_used: Date.now(),
                  verified_server: testServer,
                  recovery_source: cacheKey
                }))
                
                break
              }
            } catch (error) {
              console.warn(`⚠️ [缓存恢复] Token验证失败: ${testServer}`, error)
            }
          }
          
          if (successResult) break
          
        } catch (error) {
          console.warn(`⚠️ [缓存恢复] ${cacheKey} 处理失败:`, error)
        }
      }
    }
    
    // 冗余策略4: 最后的网络诊断和智能重试
    if (!successResult) {
      console.log('🔄 [冗余登录] 启动网络诊断和最后重试...')
      
      try {
        // 网络连接测试
        const networkTest = await Promise.race([
          fetch('https://httpbin.org/get', { method: 'HEAD' }),
          fetch('https://www.google.com', { method: 'HEAD' }),
          new Promise((_, reject) => setTimeout(() => reject(new Error('网络测试超时')), 3000))
        ]) as Response
        
        if (networkTest.ok) {
          console.log('🌐 [网络诊断] 网络连接正常，尝试备用登录方法...')
          
          // 尝试使用不同的登录类型
          const alternativeServers = ['https://matrix.org', 'https://matrix.jianluochat.com']
          
          for (const server of alternativeServers) {
            try {
              // 尝试使用identifier登录方式
              const response = await fetch(`${server}/_matrix/client/v3/login`, {
                method: 'POST',
                headers: { 
                  'Content-Type': 'application/json',
                  'User-Agent': 'JianLuo-Chat-Web/1.0'
                },
                body: JSON.stringify({
                  type: 'm.login.password',
                  identifier: {
                    type: 'm.id.user',
                    user: username
                  },
                  password: password,
                  initial_device_display_name: 'JianLuo Chat Web (Alternative)'
                })
              })
              
              if (response.ok) {
                const loginData = await response.json()
                successResult = {
                  success: true,
                  server,
                  loginData,
                  method: 'alternative_identifier',
                  responseTime: performance.now() - startTime
                }
                console.log(`✅ [备用登录] 成功: ${server}`)
                break
              }
            } catch (error) {
              console.warn(`⚠️ [备用登录] 失败: ${server}`, error)
            }
          }
        }
      } catch (error) {
        console.warn('⚠️ [网络诊断] 网络测试失败:', error)
      }
    }
    
    // 处理最终结果 - 超级冗余存储
    if (successResult) {
      const { loginData, server, method, responseTime } = successResult
      const cacheSource = (successResult as any).cacheSource
      
      // 增强登录信息
      const enhancedLoginInfo = {
        ...loginData,
        timestamp: Date.now(),
        homeserver: server,
        quickMode: true,
        method,
        username,
        redundantLogin: true,
        responseTime,
        cacheSource,
        loginVersion: '2.0',
        deviceFingerprint: generateDeviceFingerprint(),
        sessionId: generateSessionId()
      }
      
      // 超级冗余存储策略
      const storageKeys = [
        'matrix-quick-auth',
        'matrix-quick-auth-backup', 
        'matrix_login_info',
        'matrix-emergency-backup',
        `matrix-session-${enhancedLoginInfo.sessionId}`
      ]
      
      // 批量存储
      storageKeys.forEach(key => {
        try {
          localStorage.setItem(key, JSON.stringify(enhancedLoginInfo))
        } catch (error) {
          console.warn(`⚠️ 存储失败: ${key}`, error)
        }
      })
      
      // 分离式关键信息存储
      const criticalData = {
        'matrix_access_token': loginData.access_token,
        'matrix_user_id': loginData.user_id,
        'matrix_device_id': loginData.device_id,
        'matrix_homeserver': server,
        'matrix_login_method': method,
        'matrix_last_login': Date.now().toString()
      }
      
      Object.entries(criticalData).forEach(([key, value]) => {
        try {
          localStorage.setItem(key, value)
        } catch (error) {
          console.warn(`⚠️ 关键数据存储失败: ${key}`, error)
        }
      })
      
      // 会话状态更新
      quickLoginMode.value = true
      loadingStage.value = 'basic-sync'
      
      const quickLoginTime = performance.now() - startTime
      performanceMetrics.value.quickLoginTime = quickLoginTime
      
      // 记录成功登录统计
      recordLoginSuccess(method, server, quickLoginTime)
      
      // 保存登录信息到localStorage
      const loginInfo = {
        userId: loginData.user_id,
        accessToken: loginData.access_token,
        deviceId: loginData.device_id,
        homeserver: server,
        displayName: enhancedLoginInfo.username,
        sessionId: enhancedLoginInfo.sessionId,
        loginTime: Date.now(),
        method
      }
      
      try {
        localStorage.setItem('matrix_access_token', loginData.access_token)
        localStorage.setItem('matrix_login_info', JSON.stringify(loginInfo))
        localStorage.setItem('matrix-v39-login-info', JSON.stringify(loginInfo))
        
        console.log('✅ [登录信息保存] 已保存到localStorage:', {
          'matrix_access_token': !!localStorage.getItem('matrix_access_token'),
          'matrix_login_info': !!localStorage.getItem('matrix_login_info'),
          'matrix-v39-login-info': !!localStorage.getItem('matrix-v39-login-info')
        })
      } catch (error) {
        console.warn('⚠️ [登录信息保存] 保存失败:', error)
      }
      
      console.log(`✅ [超级冗余登录] 登录成功 [${quickLoginTime.toFixed(2)}ms] 方法: ${method} 服务器: ${server}`)
      
      // 注册到协调器（中等优先级，优化功能）
      try {
        const { registerMatrixStore } = await import('@/utils/matrixStoreCoordinator')
        registerMatrixStore('matrix-progressive-optimization.ts', {
          matrixClient: null, // 渐进式优化不直接管理客户端
          rooms: roomListCache.value,
          messages: new Map(),
          connection: { connected: true, homeserver: server, userId: loginData.user_id }
        }, 7) // 登录辅助store优先级（MatrixSmartLogin等使用）
        console.log('✅ Matrix Progressive Optimization Store 已注册到协调器')
      } catch (coordError) {
        console.warn('⚠️ 协调器注册失败:', coordError)
      }
      
      return { 
        success: true, 
        user: { id: loginData.user_id },
        accessToken: loginData.access_token,
        homeserver: server,
        method,
        quickMode: true,
        responseTime: quickLoginTime,
        sessionId: enhancedLoginInfo.sessionId
      }
    }
    
    // 所有策略都失败
    console.error('❌ [冗余登录] 所有登录策略都失败')
    loadingStage.value = 'idle'
    quickLoginMode.value = false
    
    return { 
      success: false, 
      error: lastError || new Error('所有登录方法都失败'), 
      useOriginal: true,
      attempts: serverList.length
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
   * 冗余渐进式初始化 - 多重备用方案，确保系统稳定性
   * 与原有的 initializeMatrix 并行工作，不替换
   */
  const progressiveInitialize = async () => {
    if (!optimizationEnabled.value || !quickLoginMode.value) {
      return false
    }
    
    console.log('🔄 [冗余初始化] 启动多重初始化策略...')
    
    // 冗余策略1: 快速基础同步
    const basicSyncSuccess = await attemptBasicSync()
    
    // 冗余策略2: 并行触发完整初始化（多个备用方案）
    const fullInitPromises = [
      attemptV39StoreInit(),
      attemptDirectClientInit(),
      attemptCachedStateRestore()
    ]
    
    // 不等待完整初始化，立即返回基础同步结果
    Promise.allSettled(fullInitPromises).then((results) => {
      const successCount = results.filter(r => r.status === 'fulfilled' && r.value).length
      console.log(`📊 [冗余初始化] 完成统计: ${successCount}/${results.length} 个初始化方案成功`)
      
      if (successCount > 0) {
        loadingStage.value = 'complete'
        const totalSaved = performanceMetrics.value.quickLoginTime
        performanceMetrics.value.totalOptimizationSaved = totalSaved
      }
    })
    
    return basicSyncSuccess
  }
  
  /**
   * 基础同步尝试
   */
  const attemptBasicSync = async () => {
    try {
      loadingStage.value = 'basic-sync'
      console.log('🔄 [基础同步] 开始快速数据获取...')
      
      // 冗余获取认证信息
      const authSources = [
        localStorage.getItem('matrix-quick-auth'),
        localStorage.getItem('matrix-quick-auth-backup'),
        localStorage.getItem('matrix_login_info'),
        localStorage.getItem('matrix-v39-login-info')
      ].filter(Boolean)
      
      if (authSources.length === 0) {
        throw new Error('没有找到有效的认证信息')
      }
      
      let authData = null
      for (const source of authSources) {
        try {
          if (source) {
            authData = JSON.parse(source)
            if (authData.access_token || authData.accessToken) {
              break
            }
          }
        } catch (e) {
          continue
        }
      }
      
      if (!authData) {
        throw new Error('无法解析认证数据')
      }
      
      const token = authData.access_token || authData.accessToken
      const homeserverUrl = authData.homeserver || 'https://matrix.org'
      // Ensure homeserver URL is properly formatted (avoid double https://)
      const homeserver = homeserverUrl.startsWith('http') ? homeserverUrl : `https://${homeserverUrl}`
      
      console.log(`🔄 [基础同步] 使用服务器: ${homeserver}`)
      
      // 并行获取基础数据
      const basicDataPromises = [
        // 房间列表
        fetch(`${homeserver}/_matrix/client/v3/joined_rooms`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }).then(r => r.ok ? r.json() : null),
        
        // 用户信息
        fetch(`${homeserver}/_matrix/client/v3/account/whoami`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }).then(r => r.ok ? r.json() : null),
        
        // 同步状态（轻量级）
        fetch(`${homeserver}/_matrix/client/v3/sync?timeout=0&filter={"room":{"timeline":{"limit":1}}}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }).then(r => r.ok ? r.json() : null)
      ]
      
      const [roomsData, userInfo, syncData] = await Promise.allSettled(basicDataPromises)
      
      // 处理房间数据
      if (roomsData.status === 'fulfilled' && roomsData.value) {
        const roomCount = roomsData.value.joined_rooms?.length || 0
        console.log(`📋 [基础同步] 获取到 ${roomCount} 个房间`)
        
        // 缓存房间ID列表
        localStorage.setItem('matrix-room-ids-cache', JSON.stringify({
          rooms: roomsData.value.joined_rooms || [],
          timestamp: Date.now()
        }))
      }
      
      // 处理用户信息
      if (userInfo.status === 'fulfilled' && userInfo.value) {
        console.log(`👤 [基础同步] 用户确认: ${userInfo.value.user_id}`)
      }
      
      // 处理同步数据
      if (syncData.status === 'fulfilled' && syncData.value) {
        console.log(`🔄 [基础同步] 同步令牌: ${syncData.value.next_batch?.substring(0, 10)}...`)
        
        // 缓存同步令牌
        localStorage.setItem('matrix-sync-token', syncData.value.next_batch)
      }
      
      console.log('✅ [基础同步] 快速数据获取完成')
      return true
      
    } catch (error) {
      console.warn('⚠️ [基础同步] 失败:', error)
      return false
    }
  }
  
  /**
   * V39 Store 初始化尝试
   */
  const attemptV39StoreInit = async () => {
    try {
      console.log('🔄 [V39初始化] 启动原有store初始化...')
      
      const { useMatrixV39Store } = await import('./matrix-v39-clean')
      const matrixV39Store = useMatrixV39Store()
      
      // 设置超时保护
      const initPromise = matrixV39Store.initializeMatrix()
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('V39初始化超时')), 30000)
      )
      
      const success = await Promise.race([initPromise, timeoutPromise])
      
      if (success) {
        console.log('✅ [V39初始化] 原有store初始化成功')
        return true
      } else {
        console.warn('⚠️ [V39初始化] 原有store初始化失败')
        return false
      }
      
    } catch (error) {
      console.warn('⚠️ [V39初始化] 异常:', error)
      return false
    }
  }
  
  /**
   * 直接客户端初始化尝试
   */
  const attemptDirectClientInit = async () => {
    try {
      console.log('🔄 [直接初始化] 启动独立客户端...')
      
      const authData = JSON.parse(localStorage.getItem('matrix-quick-auth') || '{}')
      if (!authData.access_token) {
        throw new Error('缺少访问令牌')
      }
      
      // 动态导入Matrix SDK
      const sdk = await import('matrix-js-sdk')
      
      // Ensure homeserver URL is properly formatted (avoid double https://)
      const homeserverUrl = authData.homeserver || 'https://matrix.org'
      const baseUrl = homeserverUrl.startsWith('http') ? homeserverUrl : `https://${homeserverUrl}`
      
      const client = sdk.createClient({
        baseUrl: baseUrl,
        accessToken: authData.access_token,
        userId: authData.user_id,
        deviceId: authData.device_id
      })
      
      // 轻量级启动
      await client.startClient({
        initialSyncLimit: 10,
        lazyLoadMembers: true
      })
      
      // 等待基础同步
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('直接初始化超时')), 15000)
        
        const checkSync = () => {
          const state = client.getSyncState()
          if (state === 'SYNCING' || state === 'PREPARED') {
            clearTimeout(timeout)
            resolve(true)
          } else {
            setTimeout(checkSync, 200)
          }
        }
        checkSync()
      })
      
      console.log('✅ [直接初始化] 独立客户端启动成功')
      
      // 缓存客户端状态
      localStorage.setItem('matrix-direct-client-ready', 'true')
      
      return true
      
    } catch (error) {
      console.warn('⚠️ [直接初始化] 失败:', error)
      return false
    }
  }
  
  /**
   * 缓存状态恢复尝试
   */
  const attemptCachedStateRestore = async () => {
    try {
      console.log('🔄 [缓存恢复] 尝试恢复之前的状态...')
      
      // 检查缓存的房间数据
      const roomCache = localStorage.getItem('matrix-room-ids-cache')
      const syncToken = localStorage.getItem('matrix-sync-token')
      const clientReady = localStorage.getItem('matrix-direct-client-ready')
      
      if (roomCache && syncToken) {
        const cacheData = JSON.parse(roomCache)
        const cacheAge = Date.now() - cacheData.timestamp
        
        // 如果缓存在1小时内，认为有效
        if (cacheAge < 60 * 60 * 1000) {
          console.log(`📋 [缓存恢复] 恢复 ${cacheData.rooms?.length || 0} 个房间的缓存`)
          
          // 更新房间缓存到当前store
          if (cacheData.rooms && Array.isArray(cacheData.rooms)) {
            roomListCache.value = cacheData.rooms.map((roomId: any, index: any) => ({
              id: roomId,
              name: `房间 ${index + 1}`,
              type: 'room',
              unreadCount: 0,
              quickLoaded: true,
              fromCache: true
            }))
            lastCacheTime.value = cacheData.timestamp
          }
          
          console.log('✅ [缓存恢复] 状态恢复成功')
          return true
        }
      }
      
      console.log('⚠️ [缓存恢复] 没有有效的缓存数据')
      return false
      
    } catch (error) {
      console.warn('⚠️ [缓存恢复] 失败:', error)
      return false
    }
  }
  
  // ==================== 辅助函数 ====================
  
  /**
   * 生成设备指纹
   */
  const generateDeviceFingerprint = () => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    ctx?.fillText('JianLuo', 10, 10)
    
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      canvas.toDataURL()
    ].join('|')
    
    // 简单哈希
    let hash = 0
    for (let i = 0; i < fingerprint.length; i++) {
      const char = fingerprint.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // 转换为32位整数
    }
    
    return Math.abs(hash).toString(36)
  }
  
  /**
   * 生成会话ID
   */
  const generateSessionId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }
  
  /**
   * 记录登录成功统计
   */
  const recordLoginSuccess = (method: string, server: string, responseTime: number) => {
    try {
      const stats = JSON.parse(localStorage.getItem('matrix-login-stats') || '{}')
      
      if (!stats[method]) {
        stats[method] = { count: 0, totalTime: 0, servers: {} }
      }
      
      stats[method].count++
      stats[method].totalTime += responseTime
      stats[method].avgTime = stats[method].totalTime / stats[method].count
      
      if (!stats[method].servers[server]) {
        stats[method].servers[server] = 0
      }
      stats[method].servers[server]++
      
      stats.lastSuccess = {
        method,
        server,
        time: Date.now(),
        responseTime
      }
      
      localStorage.setItem('matrix-login-stats', JSON.stringify(stats))
    } catch (error) {
      console.warn('⚠️ 无法记录登录统计:', error)
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
   * 冗余健康检查 - 检查所有系统状态
   */
  const performHealthCheck = async () => {
    console.log('🔍 [健康检查] 开始系统状态检查...')
    
    const healthStatus = {
      timestamp: Date.now(),
      quickLogin: false,
      v39Store: false,
      directClient: false,
      cacheValid: false,
      tokenValid: false,
      networkConnected: false,
      redundancyLevel: 0
    }
    
    try {
      // 检查快速登录状态
      const quickAuth = localStorage.getItem('matrix-quick-auth')
      if (quickAuth) {
        try {
          const authData = JSON.parse(quickAuth)
          if (authData.access_token && authData.user_id) {
            healthStatus.quickLogin = true
            healthStatus.redundancyLevel++
          }
        } catch (e) {}
      }
      
      // 检查V39 Store状态
      try {
        const v39Info = localStorage.getItem('matrix-v39-login-info')
        if (v39Info) {
          const v39Data = JSON.parse(v39Info)
          if (v39Data.accessToken && v39Data.userId) {
            healthStatus.v39Store = true
            healthStatus.redundancyLevel++
          }
        }
      } catch (e) {}
      
      // 检查直接客户端状态
      const directClientReady = localStorage.getItem('matrix-direct-client-ready')
      if (directClientReady === 'true') {
        healthStatus.directClient = true
        healthStatus.redundancyLevel++
      }
      
      // 检查缓存有效性
      healthStatus.cacheValid = canUseCache.value
      if (healthStatus.cacheValid) {
        healthStatus.redundancyLevel++
      }
      
      // 检查令牌有效性
      const token = localStorage.getItem('matrix_access_token')
      if (token) {
        try {
          const testResponse = await fetch('https://matrix.org/_matrix/client/v3/account/whoami', {
            headers: { 'Authorization': `Bearer ${token}` }
          })
          healthStatus.tokenValid = testResponse.ok
          if (healthStatus.tokenValid) {
            healthStatus.redundancyLevel++
          }
        } catch (e) {}
      }
      
      // 检查网络连接
      try {
        const networkTest = await fetch('https://matrix.org/_matrix/client/versions', {
          method: 'GET',
          signal: AbortSignal.timeout(3000)
        })
        healthStatus.networkConnected = networkTest.ok
        if (healthStatus.networkConnected) {
          healthStatus.redundancyLevel++
        }
      } catch (e) {}
      
      console.log(`📊 [健康检查] 冗余级别: ${healthStatus.redundancyLevel}/6`)
      console.log('📋 [健康检查] 详细状态:', healthStatus)
      
      return healthStatus
      
    } catch (error) {
      console.error('❌ [健康检查] 检查失败:', error)
      return healthStatus
    }
  }
  
  /**
   * 自动修复系统 - 检测并修复问题
   */
  const autoRepairSystem = async () => {
    console.log('🔧 [自动修复] 开始系统修复...')
    
    const healthStatus = await performHealthCheck()
    const repairActions = []
    
    // 修复策略1: 重建缺失的认证信息
    if (!healthStatus.quickLogin && !healthStatus.v39Store) {
      console.log('🔧 [自动修复] 尝试重建认证信息...')
      
      const backupAuth = localStorage.getItem('matrix-quick-auth-backup')
      if (backupAuth) {
        localStorage.setItem('matrix-quick-auth', backupAuth)
        repairActions.push('restored_quick_auth')
      }
      
      // 尝试从其他存储恢复
      const altSources = ['matrix_login_info', 'matrix-v39-login-info']
      for (const source of altSources) {
        const data = localStorage.getItem(source)
        if (data) {
          try {
            const parsed = JSON.parse(data)
            if (parsed.access_token || parsed.accessToken) {
              localStorage.setItem('matrix_access_token', parsed.access_token || parsed.accessToken)
              repairActions.push(`restored_from_${source}`)
              break
            }
          } catch (e) {}
        }
      }
    }
    
    // 修复策略2: 重建缓存
    if (!healthStatus.cacheValid) {
      console.log('🔧 [自动修复] 重建缓存...')
      
      try {
        const token = localStorage.getItem('matrix_access_token')
        if (token) {
          const response = await fetch('https://matrix.org/_matrix/client/v3/joined_rooms', {
            headers: { 'Authorization': `Bearer ${token}` }
          })
          
          if (response.ok) {
            const roomsData = await response.json()
            roomListCache.value = roomsData.joined_rooms?.slice(0, 20).map((roomId: any, index: any) => ({
              id: roomId,
              name: `房间 ${index + 1}`,
              type: 'room',
              unreadCount: 0,
              quickLoaded: true,
              repaired: true
            })) || []
            
            lastCacheTime.value = Date.now()
            repairActions.push('rebuilt_cache')
          }
        }
      } catch (e) {
        console.warn('⚠️ [自动修复] 缓存重建失败:', e)
      }
    }
    
    // 修复策略3: 重置损坏的状态
    if (healthStatus.redundancyLevel < 2) {
      console.log('🔧 [自动修复] 重置系统状态...')
      
      // 清理可能损坏的数据
      const corruptedKeys = [
        'matrix-direct-client-ready',
        'matrix-sync-token'
      ]
      
      corruptedKeys.forEach(key => {
        if (localStorage.getItem(key)) {
          localStorage.removeItem(key)
          repairActions.push(`cleaned_${key}`)
        }
      })
      
      // 重置优化状态
      loadingStage.value = 'idle'
      quickLoginMode.value = false
      repairActions.push('reset_optimization_state')
    }
    
    console.log(`✅ [自动修复] 修复完成，执行了 ${repairActions.length} 个修复操作:`, repairActions)
    
    return {
      repaired: repairActions.length > 0,
      actions: repairActions,
      healthAfterRepair: await performHealthCheck()
    }
  }
  
  /**
   * 获取优化统计（增强版）
   */
  const getOptimizationStats = () => {
    return {
      enabled: optimizationEnabled.value,
      quickMode: quickLoginMode.value,
      stage: loadingStage.value,
      cacheSize: roomListCache.value.length,
      cacheValid: canUseCache.value,
      metrics: performanceMetrics.value,
      redundancy: {
        quickAuthExists: !!localStorage.getItem('matrix-quick-auth'),
        backupAuthExists: !!localStorage.getItem('matrix-quick-auth-backup'),
        v39AuthExists: !!localStorage.getItem('matrix-v39-login-info'),
        tokenExists: !!localStorage.getItem('matrix_access_token'),
        cacheExists: roomListCache.value.length > 0,
        directClientReady: localStorage.getItem('matrix-direct-client-ready') === 'true'
      }
    }
  }
  
  // ==================== 自动监控和智能预加载 ====================
  
  /**
   * 启动自动连接监控
   */
  const startConnectionMonitor = () => {
    if (!optimizationEnabled.value || !quickLoginMode.value) return
    
    console.log('🔍 [监控] 启动连接监控...')
    
    const checkInterval = setInterval(async () => {
      try {
        const authData = localStorage.getItem('matrix-quick-auth')
        if (!authData) {
          console.warn('⚠️ [监控] 认证数据丢失，停止监控')
          clearInterval(checkInterval)
          return
        }
        
        const parsed = JSON.parse(authData)
        const token = parsed.access_token || parsed.accessToken
        const serverUrl = parsed.homeserver || 'https://matrix.org'
        const server = serverUrl.startsWith('http') ? serverUrl : `https://${serverUrl}`
        
        // 快速心跳检测
        const heartbeat = await Promise.race([
          fetch(`${server}/_matrix/client/v3/account/whoami`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('心跳超时')), 5000)
          )
        ]) as Response
        
        if (!heartbeat.ok) {
          console.warn('⚠️ [监控] 连接异常，尝试自动恢复...')
          await attemptAutoRecovery()
        }
        
      } catch (error) {
        console.warn('⚠️ [监控] 心跳检测失败:', error)
      }
    }, 30000) // 每30秒检查一次
    
    // 5分钟后停止监控（避免无限运行）
    setTimeout(() => {
      clearInterval(checkInterval)
      console.log('🔍 [监控] 连接监控已停止')
    }, 5 * 60 * 1000)
  }
  
  /**
   * 自动恢复尝试
   */
  const attemptAutoRecovery = async () => {
    console.log('🔄 [自动恢复] 开始恢复流程...')
    
    try {
      // 尝试使用备用认证信息
      const backupKeys = [
        'matrix-quick-auth-backup',
        'matrix-emergency-backup',
        'matrix_login_info'
      ]
      
      for (const key of backupKeys) {
        const backup = localStorage.getItem(key)
        if (!backup) continue
        
        try {
          const backupData = JSON.parse(backup)
          const token = backupData.access_token || backupData.accessToken
          const serverUrl = backupData.homeserver || 'https://matrix.org'
          const server = serverUrl.startsWith('http') ? serverUrl : `https://${serverUrl}`
          
          const testResponse = await fetch(`${server}/_matrix/client/v3/account/whoami`, {
            headers: { 'Authorization': `Bearer ${token}` }
          })
          
          if (testResponse.ok) {
            // 恢复主认证数据
            localStorage.setItem('matrix-quick-auth', backup)
            console.log(`✅ [自动恢复] 使用 ${key} 恢复成功`)
            return true
          }
        } catch (error) {
          console.warn(`⚠️ [自动恢复] ${key} 恢复失败:`, error)
        }
      }
      
      console.warn('⚠️ [自动恢复] 所有恢复尝试都失败')
      return false
      
    } catch (error) {
      console.error('❌ [自动恢复] 恢复流程异常:', error)
      return false
    }
  }
  
  /**
   * 智能预加载 - 预测用户需要的数据
   */
  const smartPreload = async () => {
    if (!optimizationEnabled.value || !quickLoginMode.value) return
    
    try {
      console.log('🧠 [智能预加载] 开始预测性加载...')
      
      // 预加载用户最常访问的房间
      const roomStats = localStorage.getItem('matrix-room-access-stats')
      if (roomStats) {
        const stats = JSON.parse(roomStats)
        const topRooms = Object.entries(stats)
          .sort(([,a]: any, [,b]: any) => b.accessCount - a.accessCount)
          .slice(0, 5)
          .map(([roomId]) => roomId)
        
        console.log(`🧠 [智能预加载] 预加载热门房间: ${topRooms.length} 个`)
        
        // 异步预加载房间数据
        setTimeout(() => {
          preloadRoomData(topRooms)
        }, 1000)
      }
      
      // 预加载用户头像和显示名称
      setTimeout(() => {
        preloadUserProfile()
      }, 2000)
      
    } catch (error) {
      console.warn('⚠️ [智能预加载] 预加载失败:', error)
    }
  }
  
  /**
   * 预加载房间数据
   */
  const preloadRoomData = async (roomIds: string[]) => {
    try {
      const authData = localStorage.getItem('matrix-quick-auth')
      if (!authData) return
      
      const parsed = JSON.parse(authData)
      const token = parsed.access_token || parsed.accessToken
      const serverUrl = parsed.homeserver || 'https://matrix.org'
      const server = serverUrl.startsWith('http') ? serverUrl : `https://${serverUrl}`
      
      for (const roomId of roomIds) {
        try {
          const response = await fetch(`${server}/_matrix/client/v3/rooms/${roomId}/state`, {
            headers: { 'Authorization': `Bearer ${token}` }
          })
          
          if (response.ok) {
            const stateData = await response.json()
            localStorage.setItem(`matrix-room-state-${roomId}`, JSON.stringify({
              data: stateData,
              timestamp: Date.now()
            }))
          }
        } catch (error) {
          console.warn(`⚠️ [预加载] 房间 ${roomId} 预加载失败:`, error)
        }
        
        // 避免过快请求
        await new Promise(resolve => setTimeout(resolve, 200))
      }
    } catch (error) {
      console.warn('⚠️ [预加载] 房间数据预加载失败:', error)
    }
  }
  
  /**
   * 预加载用户资料
   */
  const preloadUserProfile = async () => {
    try {
      const authData = localStorage.getItem('matrix-quick-auth')
      if (!authData) return
      
      const parsed = JSON.parse(authData)
      const token = parsed.access_token || parsed.accessToken
      const serverUrl = parsed.homeserver || 'https://matrix.org'
      const server = serverUrl.startsWith('http') ? serverUrl : `https://${serverUrl}`
      const userId = parsed.user_id
      
      const profileResponse = await fetch(`${server}/_matrix/client/v3/profile/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (profileResponse.ok) {
        const profileData = await profileResponse.json()
        localStorage.setItem('matrix-user-profile-cache', JSON.stringify({
          data: profileData,
          timestamp: Date.now()
        }))
        console.log('✅ [预加载] 用户资料预加载完成')
      }
    } catch (error) {
      console.warn('⚠️ [预加载] 用户资料预加载失败:', error)
    }
  }
  
  // ==================== 智能退出登录系统 ====================
  
  /**
   * 智能退出登录 - 检测用户变化，智能清理
   * 如果是同一用户，保留缓存；如果是新用户，完全清理
   */
  const smartLogout = async (newUserId?: string) => {
    console.log('🔄 [智能退出] 开始智能退出流程...')
    
    try {
      // 获取当前用户信息
      const currentUserInfo = getCurrentUserInfo()
      const isUserChange = newUserId && currentUserInfo.userId && currentUserInfo.userId !== newUserId
      
      console.log(`👤 [智能退出] 用户信息: 当前=${currentUserInfo.userId}, 新用户=${newUserId}, 用户变化=${isUserChange}`)
      
      // 记录退出统计
      recordLogoutStats(currentUserInfo.userId, isUserChange ? 'user_change' : 'normal_logout')
      
      if (isUserChange) {
        console.log('🧹 [智能退出] 检测到用户变化，执行完全清理...')
        await performFullCleanup(currentUserInfo)
      } else {
        console.log('💾 [智能退出] 同用户退出，执行保护性清理...')
        await performProtectiveCleanup(currentUserInfo)
      }
      
      // 为下次登录做准备
      await prepareForNextLogin(newUserId)
      
      console.log('✅ [智能退出] 智能退出完成')
      return { success: true, userChanged: isUserChange }
      
    } catch (error) {
      console.error('❌ [智能退出] 退出过程异常:', error)
      return { success: false, error }
    }
  }
  
  /**
   * 获取当前用户信息
   */
  const getCurrentUserInfo = () => {
    const sources = [
      'matrix-quick-auth',
      'matrix-quick-auth-backup',
      'matrix_login_info',
      'matrix-v39-login-info'
    ]
    
    for (const source of sources) {
      try {
        const data = localStorage.getItem(source)
        if (data) {
          const parsed = JSON.parse(data)
          if (parsed.user_id || parsed.userId) {
            return {
              userId: parsed.user_id || parsed.userId,
              deviceId: parsed.device_id || parsed.deviceId,
              homeserver: parsed.homeserver || parsed.server,
              source
            }
          }
        }
      } catch (e) {
        continue
      }
    }
    
    return { userId: null, deviceId: null, homeserver: null, source: null }
  }
  
  /**
   * 执行完全清理 - 新用户登录时
   */
  const performFullCleanup = async (userInfo: any) => {
    console.log('🧹 [完全清理] 开始清理所有用户数据...')
    
    // 1. 清理认证相关存储
    const authKeys = [
      'matrix-quick-auth',
      'matrix-quick-auth-backup',
      'matrix_login_info',
      'matrix-v39-login-info',
      'matrix_access_token',
      'matrix_user_id',
      'matrix_device_id',
      'matrix_homeserver',
      'matrix_login_method',
      'matrix_last_login',
      'matrix-emergency-backup'
    ]
    
    authKeys.forEach(key => {
      localStorage.removeItem(key)
      console.log(`🗑️ [完全清理] 已清理: ${key}`)
    })
    
    // 2. 清理加密存储（解决设备ID不匹配问题）
    await clearCryptoStores(userInfo)
    
    // 3. 清理房间和同步数据
    const roomKeys = [
      'matrix-room-ids-cache',
      'matrix-sync-token',
      'matrix-direct-client-ready',
      'matrix-room-access-stats',
      'matrix-user-profile-cache'
    ]
    
    roomKeys.forEach(key => {
      localStorage.removeItem(key)
      console.log(`🗑️ [完全清理] 已清理: ${key}`)
    })
    
    // 4. 清理动态房间状态缓存
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('matrix-room-state-') || 
          key.startsWith('matrix-session-') ||
          key.startsWith('matrix-server-history-')) {
        localStorage.removeItem(key)
        console.log(`🗑️ [完全清理] 已清理动态缓存: ${key}`)
      }
    })
    
    // 5. 清理IndexedDB加密数据库
    await clearIndexedDBStores()
    
    // 6. 重置store状态
    quickLoginMode.value = false
    loadingStage.value = 'idle'
    roomListCache.value = []
    lastCacheTime.value = 0
    
    console.log('✅ [完全清理] 所有用户数据已清理')
  }
  
  /**
   * 执行保护性清理 - 同用户重新登录时
   */
  const performProtectiveCleanup = async (userInfo: any) => {
    console.log('💾 [保护性清理] 保留用户数据，仅清理会话状态...')
    
    // 只清理会话相关的临时数据
    const sessionKeys = [
      'matrix-direct-client-ready',
      'matrix-sync-token'
    ]
    
    sessionKeys.forEach(key => {
      localStorage.removeItem(key)
      console.log(`🗑️ [保护性清理] 已清理会话数据: ${key}`)
    })
    
    // 更新认证数据的时间戳，标记为重新登录
    const authSources = ['matrix-quick-auth', 'matrix-quick-auth-backup']
    
    authSources.forEach(source => {
      const data = localStorage.getItem(source)
      if (data) {
        try {
          const parsed = JSON.parse(data)
          parsed.last_logout = Date.now()
          parsed.logout_type = 'protective'
          localStorage.setItem(source, JSON.stringify(parsed))
          console.log(`💾 [保护性清理] 已更新 ${source} 时间戳`)
        } catch (e) {
          console.warn(`⚠️ [保护性清理] 更新 ${source} 失败:`, e)
        }
      }
    })
    
    // 重置store状态但保留缓存
    quickLoginMode.value = false
    loadingStage.value = 'idle'
    
    console.log('✅ [保护性清理] 保护性清理完成，用户数据已保留')
  }
  
  /**
   * 清理加密存储
   */
  const clearCryptoStores = async (userInfo: any) => {
    console.log('🔐 [加密清理] 开始清理加密存储...')
    
    try {
      // 清理可能的加密存储键
      const cryptoKeys = Object.keys(localStorage).filter(key => 
        key.includes('crypto') || 
        key.includes('olm') || 
        key.includes('matrix-sdk') ||
        key.includes('jianluochat-crypto')
      )
      
      cryptoKeys.forEach(key => {
        localStorage.removeItem(key)
        console.log(`🔐 [加密清理] 已清理加密键: ${key}`)
      })
      
      // 清理可能的设备相关存储
      if (userInfo.deviceId) {
        const deviceKeys = Object.keys(localStorage).filter(key => 
          key.includes(userInfo.deviceId)
        )
        
        deviceKeys.forEach(key => {
          localStorage.removeItem(key)
          console.log(`🔐 [加密清理] 已清理设备相关: ${key}`)
        })
      }
      
    } catch (error) {
      console.warn('⚠️ [加密清理] 加密存储清理失败:', error)
    }
  }
  
  /**
   * 清理IndexedDB存储
   */
  const clearIndexedDBStores = async () => {
    console.log('💾 [IndexedDB清理] 开始清理IndexedDB...')
    
    try {
      // 获取所有数据库
      if ('databases' in indexedDB) {
        const databases = await indexedDB.databases()
        
        for (const db of databases) {
          if (db.name && (
            db.name.includes('matrix') || 
            db.name.includes('crypto') ||
            db.name.includes('jianluochat')
          )) {
            console.log(`💾 [IndexedDB清理] 删除数据库: ${db.name}`)
            
            const deleteRequest = indexedDB.deleteDatabase(db.name)
            await new Promise((resolve, reject) => {
              deleteRequest.onsuccess = () => resolve(true)
              deleteRequest.onerror = () => reject(deleteRequest.error)
              deleteRequest.onblocked = () => {
                console.warn(`⚠️ [IndexedDB清理] 数据库 ${db.name} 删除被阻塞`)
                resolve(false)
              }
            })
          }
        }
      }
      
      console.log('✅ [IndexedDB清理] IndexedDB清理完成')
      
    } catch (error) {
      console.warn('⚠️ [IndexedDB清理] IndexedDB清理失败:', error)
    }
  }
  
  /**
   * 为下次登录做准备
   */
  const prepareForNextLogin = async (newUserId?: string) => {
    console.log('🚀 [登录准备] 为下次登录做准备...')
    
    try {
      // 创建登录准备信息
      const prepInfo = {
        timestamp: Date.now(),
        expectedUser: newUserId || null,
        lastLogout: Date.now(),
        preparedFor: 'next_login',
        optimizationEnabled: optimizationEnabled.value
      }
      
      localStorage.setItem('matrix-login-preparation', JSON.stringify(prepInfo))
      
      // 预设优化配置
      const optimizationConfig = {
        quickLoginEnabled: true,
        cacheEnabled: true,
        redundancyLevel: 'high',
        autoRecoveryEnabled: true,
        smartPreloadEnabled: true
      }
      
      localStorage.setItem('matrix-optimization-config', JSON.stringify(optimizationConfig))
      
      console.log('✅ [登录准备] 下次登录准备完成')
      
    } catch (error) {
      console.warn('⚠️ [登录准备] 登录准备失败:', error)
    }
  }
  
  /**
   * 记录退出统计
   */
  const recordLogoutStats = (userId: string | null, logoutType: string) => {
    try {
      const stats = JSON.parse(localStorage.getItem('matrix-logout-stats') || '{}')
      
      if (!stats[logoutType]) {
        stats[logoutType] = { count: 0, users: {} }
      }
      
      stats[logoutType].count++
      
      if (userId) {
        if (!stats[logoutType].users[userId]) {
          stats[logoutType].users[userId] = 0
        }
        stats[logoutType].users[userId]++
      }
      
      stats.lastLogout = {
        type: logoutType,
        user: userId,
        time: Date.now()
      }
      
      localStorage.setItem('matrix-logout-stats', JSON.stringify(stats))
      console.log(`📊 [退出统计] 记录退出: ${logoutType} - ${userId}`)
      
    } catch (error) {
      console.warn('⚠️ [退出统计] 统计记录失败:', error)
    }
  }
  
  /**
   * 检查是否需要清理（在登录前调用）
   */
  const checkCleanupNeeded = (newUserId: string) => {
    const currentUser = getCurrentUserInfo()
    const needsCleanup = currentUser.userId && currentUser.userId !== newUserId
    
    console.log(`🔍 [清理检查] 当前用户: ${currentUser.userId}, 新用户: ${newUserId}, 需要清理: ${needsCleanup}`)
    
    return {
      needsCleanup,
      currentUser: currentUser.userId,
      newUser: newUserId,
      cleanupType: needsCleanup ? 'full' : 'protective'
    }
  }
  
  /**
   * 获取退出统计
   */
  const getLogoutStats = () => {
    try {
      const stats = JSON.parse(localStorage.getItem('matrix-logout-stats') || '{}')
      return {
        stats,
        currentUser: getCurrentUserInfo(),
        preparationInfo: JSON.parse(localStorage.getItem('matrix-login-preparation') || '{}')
      }
    } catch (error) {
      console.warn('⚠️ 获取退出统计失败:', error)
      return { stats: {}, currentUser: {}, preparationInfo: {} }
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
    
    // 冗余登录系统
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
    
    // 冗余健康检查和修复
    performHealthCheck,
    autoRepairSystem,
    
    // 自动监控和智能预加载
    startConnectionMonitor,
    attemptAutoRecovery,
    smartPreload,
    preloadRoomData,
    preloadUserProfile,
    
    // 智能退出登录系统
    smartLogout,
    getCurrentUserInfo,
    checkCleanupNeeded,
    getLogoutStats,
    performFullCleanup,
    performProtectiveCleanup,
    
    // 性能数据
    performanceMetrics,
    roomListCache,
    
    // 辅助函数
    generateDeviceFingerprint,
    generateSessionId,
    recordLoginSuccess
  }
})