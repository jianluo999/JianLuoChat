/**
 * Matrix Store 协调管理器
 * 管理多个Matrix store的共存，实现冗余但有序的协调机制
 * 集成智能缓存策略，避免重复获取和卡顿
 */

import { roomListStabilizer, getStableRoomList, getStableMessages } from './roomListStabilizer'

export interface StoreInstance {
  id: string
  priority: number
  isActive: boolean
  lastActivity: number
  matrixClient: any
  rooms: any[]
  messages: Map<string, any[]>
  connection: any
}

export interface CoordinationEvent {
  type: 'sync' | 'room' | 'message' | 'error'
  source: string
  data: any
  timestamp: number
}

class MatrixStoreCoordinator {
  private static instance: MatrixStoreCoordinator
  private stores: Map<string, StoreInstance> = new Map()
  private primaryStore: string | null = null
  private eventQueue: CoordinationEvent[] = []
  private isProcessing = false
  private coordinationRules: Map<string, Function> = new Map()

  static getInstance(): MatrixStoreCoordinator {
    if (!MatrixStoreCoordinator.instance) {
      MatrixStoreCoordinator.instance = new MatrixStoreCoordinator()
    }
    return MatrixStoreCoordinator.instance
  }

  constructor() {
    this.setupCoordinationRules()
  }

  /**
   * 注册Matrix store实例 - 有序注册机制
   */
  registerStore(storeId: string, storeInstance: any, priority: number = 1): void {
    console.log(`🔗 [有序注册] Matrix Store: ${storeId} (优先级: ${priority})`)
    
    // 检查是否已存在同类型store
    const existingStore = this.stores.get(storeId)
    if (existingStore) {
      console.log(`⚠️ [重复注册] Store ${storeId} 已存在，更新实例`)
      this.updateExistingStore(storeId, storeInstance, priority)
      return
    }
    
    const store: StoreInstance = {
      id: storeId,
      priority,
      isActive: true,
      lastActivity: Date.now(),
      matrixClient: storeInstance.matrixClient?.value || storeInstance.matrixClient,
      rooms: storeInstance.rooms?.value || storeInstance.rooms || [],
      messages: storeInstance.messages?.value || storeInstance.messages || new Map(),
      connection: storeInstance.connection?.value || storeInstance.connection
    }

    this.stores.set(storeId, store)
    
    // 有序启动：根据优先级决定启动顺序
    this.orchestrateStoreStartup(storeId, store)
    this.updatePrimaryStore()
  }

  /**
   * 更新已存在的store
   */
  private updateExistingStore(storeId: string, storeInstance: any, priority: number): void {
    const existingStore = this.stores.get(storeId)!
    
    // 更新store实例，但保持协调状态
    existingStore.priority = priority
    existingStore.lastActivity = Date.now()
    existingStore.matrixClient = storeInstance.matrixClient?.value || storeInstance.matrixClient
    existingStore.rooms = storeInstance.rooms?.value || storeInstance.rooms || []
    existingStore.messages = storeInstance.messages?.value || storeInstance.messages || new Map()
    existingStore.connection = storeInstance.connection?.value || storeInstance.connection
    
    console.log(`✅ [更新完成] Store ${storeId} 实例已更新`)
  }

  /**
   * 有序启动协调 - 根据优先级和依赖关系启动stores
   */
  private orchestrateStoreStartup(storeId: string, store: StoreInstance): void {
    console.log(`🚀 [有序启动] 协调Store启动: ${storeId}`)
    
    // 定义启动顺序规则
    const startupRules = this.getStartupRules()
    const rule = startupRules.get(storeId)
    
    if (rule) {
      console.log(`📋 [启动规则] ${storeId}: ${rule.description}`)
      
      // 检查依赖
      if (rule.dependencies.length > 0) {
        const missingDeps = rule.dependencies.filter(dep => !this.stores.has(dep))
        if (missingDeps.length > 0) {
          console.log(`⏳ [等待依赖] ${storeId} 等待依赖: ${missingDeps.join(', ')}`)
          store.isActive = false // 暂时不激活
          return
        }
      }
      
      // 执行启动延迟
      if (rule.startupDelay > 0) {
        console.log(`⏱️ [启动延迟] ${storeId} 延迟${rule.startupDelay}ms启动`)
        setTimeout(() => {
          this.activateStore(storeId)
        }, rule.startupDelay)
        store.isActive = false
      } else {
        this.activateStore(storeId)
      }
    } else {
      // 默认立即激活
      this.activateStore(storeId)
    }
  }

  /**
   * 获取启动规则 - 基于实际源码使用情况
   */
  private getStartupRules(): Map<string, any> {
    const rules = new Map()
    
    // matrix.ts - 主力store（25+组件使用，包括App.vue），最高优先级
    rules.set('matrix.ts', {
      description: '主力store（25+组件使用），包括App.vue',
      dependencies: [],
      startupDelay: 0, // 立即启动
      role: 'primary',
      priority: 15, // 最高优先级
      conflictsWith: []
    })
    
    // matrix-v39-clean.ts - 重要辅助store（12+组件使用），高优先级
    rules.set('matrix-v39-clean.ts', {
      description: '重要辅助store（12+组件使用），包括MatrixChatView',
      dependencies: [],
      startupDelay: 1500, // 短延迟，避免与主力冲突
      role: 'secondary',
      priority: 12, // 高优先级
      conflictsWith: []
    })
    
    // matrix-optimized.ts - 性能测试专用（2个组件使用）
    rules.set('matrix-optimized.ts', {
      description: '性能测试专用（PerformanceTestPage等）',
      dependencies: [],
      startupDelay: 2000,
      role: 'specialized',
      priority: 8,
      conflictsWith: []
    })
    
    // matrix-simple.ts - 基础测试专用（1个组件使用）
    rules.set('matrix-simple.ts', {
      description: '基础测试专用（MatrixTest.vue）',
      dependencies: [],
      startupDelay: 3000,
      role: 'testing',
      priority: 6,
      conflictsWith: []
    })
    
    // matrix-progressive-optimization.ts - 登录组件使用
    rules.set('matrix-progressive-optimization.ts', {
      description: '登录优化store（MatrixSmartLogin等使用）',
      dependencies: [],
      startupDelay: 2500,
      role: 'login-helper',
      priority: 7,
      conflictsWith: []
    })
    
    // 未直接使用的stores - 低优先级
    rules.set('matrix-unified.ts', {
      description: '统一store（未发现直接使用）',
      dependencies: [],
      startupDelay: 5000,
      role: 'unused',
      priority: 4,
      conflictsWith: []
    })
    
    rules.set('matrix-quick-login.ts', {
      description: '快速登录store（未发现直接使用）',
      dependencies: [],
      startupDelay: 6000,
      role: 'unused',
      priority: 3,
      conflictsWith: []
    })
    
    rules.set('matrix-rooms.ts', {
      description: '房间管理store（有语法错误，未使用）',
      dependencies: [],
      startupDelay: -1, // 禁用
      role: 'disabled',
      priority: 0,
      conflictsWith: []
    })
    
    return rules
  }

  /**
   * 激活store
   */
  private activateStore(storeId: string): void {
    const store = this.stores.get(storeId)
    if (store) {
      store.isActive = true
      console.log(`✅ [激活完成] Store ${storeId} 已激活`)
      
      // 检查是否需要更新主要store
      this.updatePrimaryStore()
      
      // 检查是否有等待此store的依赖
      this.checkPendingDependencies(storeId)
    }
  }

  /**
   * 检查等待的依赖
   */
  private checkPendingDependencies(activatedStoreId: string): void {
    for (const [storeId, store] of this.stores) {
      if (!store.isActive) {
        const rules = this.getStartupRules()
        const rule = rules.get(storeId)
        
        if (rule && rule.dependencies.includes(activatedStoreId)) {
          console.log(`🔄 [依赖检查] ${storeId} 的依赖 ${activatedStoreId} 已就绪`)
          
          // 检查所有依赖是否都满足
          const allDepsReady = rule.dependencies.every((dep: string) => {
            const depStore = this.stores.get(dep)
            return depStore && depStore.isActive
          })
          
          if (allDepsReady) {
            console.log(`✅ [依赖满足] ${storeId} 所有依赖已就绪，准备激活`)
            setTimeout(() => this.activateStore(storeId), rule.startupDelay || 0)
          }
        }
      }
    }
  }

  /**
   * 更新主要store（优先级最高且活跃的）
   */
  private updatePrimaryStore(): void {
    let highestPriority = -1
    let primaryCandidate: string | null = null

    for (const [storeId, store] of this.stores) {
      if (store.isActive && store.priority > highestPriority) {
        // 检查store是否真正可用
        if (this.isStoreHealthy(store)) {
          highestPriority = store.priority
          primaryCandidate = storeId
        }
      }
    }

    if (primaryCandidate !== this.primaryStore) {
      const oldPrimary = this.primaryStore
      this.primaryStore = primaryCandidate
      console.log(`🎯 主要Store切换: ${oldPrimary} -> ${this.primaryStore}`)
      
      // 触发数据同步
      if (this.primaryStore) {
        this.syncDataFromPrimary()
      }
    }
  }

  /**
   * 检查store健康状态
   */
  private isStoreHealthy(store: StoreInstance): boolean {
    return !!(
      store.matrixClient && 
      (store.matrixClient.clientRunning || store.matrixClient.getSyncState) &&
      store.rooms &&
      store.connection
    )
  }

  /**
   * 处理协调事件 - 带智能过滤
   */
  handleEvent(source: string, type: CoordinationEvent['type'], data: any): void {
    // 智能事件过滤 - 避免重复的房间列表更新
    if (type === 'sync' && this.shouldSuppressEvent(source, type, data)) {
      console.log(`🚫 抑制重复的${type}事件: ${source}`)
      return
    }

    const event: CoordinationEvent = {
      type,
      source,
      data,
      timestamp: Date.now()
    }

    this.eventQueue.push(event)
    this.updateStoreActivity(source)

    if (!this.isProcessing) {
      this.processEventQueue()
    }
  }

  /**
   * 判断是否应该抑制事件 - 智能冲突检测
   */
  private shouldSuppressEvent(source: string, type: CoordinationEvent['type'], data: any): boolean {
    const now = Date.now()
    
    // 1. 同步事件冲突检测
    if (type === 'sync') {
      // 非主要store的同步事件严格控制
      if (source !== this.primaryStore) {
        const recentSyncEvents = this.eventQueue
          .filter(e => e.type === 'sync' && e.timestamp > now - 3000) // 3秒内
          .length
        
        if (recentSyncEvents > 0) {
          console.log(`🚫 [冲突抑制] ${source}的同步事件被抑制，避免与主要store冲突`)
          return true
        }
        
        // 检查主要store是否正在同步
        const primaryStore = this.stores.get(this.primaryStore!)
        if (primaryStore && this.isStoreSyncing(primaryStore)) {
          console.log(`🚫 [冲突抑制] ${source}的同步事件被抑制，主要store正在同步`)
          return true
        }
      }
    }
    
    // 2. 房间更新事件冲突检测
    if (type === 'room') {
      const recentRoomEvents = this.eventQueue
        .filter(e => e.type === 'room' && e.timestamp > now - 1000) // 1秒内
        .length
      
      if (recentRoomEvents > 2) { // 允许少量房间事件
        console.log(`🚫 [冲突抑制] ${source}的房间事件被抑制，频率过高`)
        return true
      }
    }
    
    // 3. 消息事件去重检测
    if (type === 'message' && data?.messages) {
      const isDuplicate = this.checkMessageDuplication(data.messages, source)
      if (isDuplicate) {
        console.log(`🚫 [冲突抑制] ${source}的消息事件被抑制，检测到重复消息`)
        return true
      }
    }

    return false
  }

  /**
   * 检查store是否正在同步
   */
  private isStoreSyncing(store: StoreInstance): boolean {
    // 检查最近活动时间
    const timeSinceLastActivity = Date.now() - store.lastActivity
    return timeSinceLastActivity < 5000 // 5秒内有活动认为正在同步
  }

  /**
   * 检查消息重复
   */
  private checkMessageDuplication(newMessages: any[], source: string): boolean {
    const primaryStore = this.stores.get(this.primaryStore!)
    if (!primaryStore || !newMessages.length) return false
    
    // 检查是否有重复的消息ID
    for (const message of newMessages) {
      for (const [roomId, existingMessages] of primaryStore.messages) {
        if (existingMessages.some((existing: any) => existing.id === message.id)) {
          return true // 发现重复消息
        }
      }
    }
    
    return false
  }

  /**
   * 更新store活动时间
   */
  private updateStoreActivity(storeId: string): void {
    const store = this.stores.get(storeId)
    if (store) {
      store.lastActivity = Date.now()
    }
  }

  /**
   * 处理事件队列
   */
  private async processEventQueue(): Promise<void> {
    if (this.isProcessing || this.eventQueue.length === 0) return

    this.isProcessing = true

    try {
      while (this.eventQueue.length > 0) {
        const event = this.eventQueue.shift()!
        await this.processEvent(event)
      }
    } catch (error) {
      console.error('❌ 事件处理失败:', error)
    } finally {
      this.isProcessing = false
    }
  }

  /**
   * 处理单个事件
   */
  private async processEvent(event: CoordinationEvent): Promise<void> {
    const rule = this.coordinationRules.get(event.type)
    if (rule) {
      try {
        await rule(event)
      } catch (error) {
        console.error(`❌ 处理${event.type}事件失败:`, error)
      }
    }
  }

  /**
   * 设置协调规则
   */
  private setupCoordinationRules(): void {
    // 同步事件协调规则 - 确保数据加载
    this.coordinationRules.set('sync', async (event: CoordinationEvent) => {
      console.log(`🔄 协调同步事件: ${event.source} (房间数: ${event.data.roomCount})`)
      
      // 获取当前主要store和事件源store
      const primaryStore = this.stores.get(this.primaryStore!)
      const sourceStore = this.stores.get(event.source)
      
      if (event.source === this.primaryStore) {
        console.log('✅ 主要store处理同步事件')
        
        // 确保主要store执行房间和消息加载
        await this.ensureDataLoading(this.primaryStore, event.data)
        
        this.broadcastToSecondaryStores('syncUpdate', event.data)
      } else {
        // 非主要store的同步事件 - 智能处理
        console.log(`⚠️ 非主要store (${event.source}) 的同步事件`)
        
        // 检查主要store是否需要数据补充
        const needsDataSupplement = await this.checkDataSupplementNeeds(primaryStore, sourceStore, event.data)
        
        if (needsDataSupplement) {
          console.log(`� ${event.soource} 有更多数据，触发主要store数据加载`)
          
          // 触发主要store重新加载数据
          await this.triggerPrimaryStoreDataLoad()
          
          // 补充缺失数据
          this.supplementRoomData(sourceStore?.rooms || [], event.source)
        } else {
          console.log(`🚫 ${event.source} 同步事件被抑制，主要store数据充足`)
        }
      }
    })

    // 房间事件协调规则 - 智能资源隔离
    this.coordinationRules.set('room', async (event: CoordinationEvent) => {
      console.log(`🏠 [房间协调] 来源: ${event.source}`)
      
      // 资源隔离检查
      if (!this.checkResourceIsolation(event.source, 'room')) {
        console.log(`🚫 [资源隔离] ${event.source}的房间事件被隔离`)
        return
      }
      
      const primaryStore = this.stores.get(this.primaryStore!)
      if (primaryStore && event.source === this.primaryStore) {
        // 主要store的房间事件优先处理
        console.log(`✅ [主要处理] ${event.source}处理房间事件`)
        this.mergeRoomData(event.data)
        this.broadcastToSecondaryStores('roomUpdate', event.data)
      } else {
        // 次要store的房间事件 - 智能补充
        console.log(`📋 [补充处理] ${event.source}补充房间数据`)
        const shouldSupplement = this.shouldSupplementRoomData(event.data, event.source)
        if (shouldSupplement) {
          this.supplementRoomData(event.data, event.source)
        } else {
          console.log(`🚫 [补充跳过] ${event.source}的房间数据无需补充`)
        }
      }
    })

    // 消息事件协调规则
    this.coordinationRules.set('message', async (event: CoordinationEvent) => {
      console.log(`💬 协调消息事件: ${event.source}`)
      
      // 消息事件需要合并，避免重复
      this.mergeMessageData(event.data, event.source)
    })

    // 错误事件协调规则
    this.coordinationRules.set('error', async (event: CoordinationEvent) => {
      console.log(`❌ 协调错误事件: ${event.source}`)
      
      // 错误事件触发故障转移
      await this.handleStoreError(event.source, event.data)
    })
  }

  /**
   * 合并房间数据
   */
  private mergeRoomData(roomData: any): void {
    const primaryStore = this.stores.get(this.primaryStore!)
    if (!primaryStore) return

    // 更新主要store的房间数据
    if (Array.isArray(roomData)) {
      primaryStore.rooms = roomData
    } else if (roomData.roomId) {
      // 单个房间更新
      const existingIndex = primaryStore.rooms.findIndex(r => r.id === roomData.roomId)
      if (existingIndex >= 0) {
        primaryStore.rooms[existingIndex] = { ...primaryStore.rooms[existingIndex], ...roomData }
      } else {
        primaryStore.rooms.push(roomData)
      }
    }

    console.log(`🔄 房间数据已合并，当前房间数: ${primaryStore.rooms.length}`)
  }

  /**
   * 补充房间数据（来自次要store）
   */
  private supplementRoomData(roomData: any, source: string): void {
    const primaryStore = this.stores.get(this.primaryStore!)
    const sourceStore = this.stores.get(source)
    
    if (!primaryStore || !sourceStore) return

    // 检查主要store是否缺少某些房间
    if (Array.isArray(roomData)) {
      const missingRooms = roomData.filter(room => 
        !primaryStore.rooms.find(r => r.id === room.id)
      )
      
      if (missingRooms.length > 0) {
        console.log(`📋 从${source}补充${missingRooms.length}个缺失房间`)
        primaryStore.rooms.push(...missingRooms)
      }
    }
  }

  /**
   * 合并消息数据
   */
  private mergeMessageData(messageData: any, source: string): void {
    const primaryStore = this.stores.get(this.primaryStore!)
    if (!primaryStore) return

    const { roomId, messages } = messageData

    if (!primaryStore.messages.has(roomId)) {
      primaryStore.messages.set(roomId, [])
    }

    const existingMessages = primaryStore.messages.get(roomId)!
    const existingIds = new Set(existingMessages.map(m => m.id))

    // 只添加不重复的消息
    const newMessages = messages.filter((msg: any) => !existingIds.has(msg.id))
    
    if (newMessages.length > 0) {
      existingMessages.push(...newMessages)
      // 按时间戳排序
      existingMessages.sort((a, b) => a.timestamp - b.timestamp)
      console.log(`💬 合并${newMessages.length}条新消息到房间${roomId}`)
    }
  }

  /**
   * 处理store错误
   */
  private async handleStoreError(storeId: string, error: any): Promise<void> {
    console.error(`❌ Store ${storeId} 发生错误:`, error)
    
    const store = this.stores.get(storeId)
    if (!store) return

    // 标记store为不活跃
    store.isActive = false

    // 如果是主要store出错，切换到备用store
    if (storeId === this.primaryStore) {
      console.log('🔄 主要store出错，尝试故障转移...')
      this.updatePrimaryStore()
      
      if (this.primaryStore && this.primaryStore !== storeId) {
        console.log(`✅ 故障转移成功，新主要store: ${this.primaryStore}`)
      } else {
        console.error('❌ 故障转移失败，没有可用的备用store')
      }
    }

    // 尝试恢复出错的store
    setTimeout(() => {
      this.attemptStoreRecovery(storeId)
    }, 5000)
  }

  /**
   * 尝试恢复store
   */
  private async attemptStoreRecovery(storeId: string): Promise<void> {
    const store = this.stores.get(storeId)
    if (!store) return

    console.log(`🔄 尝试恢复store: ${storeId}`)

    try {
      // 检查store是否已经恢复
      if (this.isStoreHealthy(store)) {
        store.isActive = true
        console.log(`✅ Store ${storeId} 已自动恢复`)
        this.updatePrimaryStore()
      } else {
        console.log(`⚠️ Store ${storeId} 仍未恢复，稍后重试`)
        // 继续重试
        setTimeout(() => {
          this.attemptStoreRecovery(storeId)
        }, 10000)
      }
    } catch (error) {
      console.error(`❌ 恢复store ${storeId} 失败:`, error)
    }
  }

  /**
   * 向次要stores广播更新
   */
  private broadcastToSecondaryStores(eventType: string, data: any): void {
    for (const [storeId, store] of this.stores) {
      if (storeId !== this.primaryStore && store.isActive) {
        console.log(`📡 向${storeId}广播${eventType}`)
        // 这里可以调用具体store的更新方法
      }
    }
  }

  /**
   * 从主要store同步数据
   */
  private syncDataFromPrimary(): void {
    const primaryStore = this.stores.get(this.primaryStore!)
    if (!primaryStore) return

    console.log(`🔄 从主要store同步数据: ${this.primaryStore}`)

    // 同步房间数据到其他stores
    for (const [storeId, store] of this.stores) {
      if (storeId !== this.primaryStore && store.isActive) {
        try {
          // 同步房间列表
          if (primaryStore.rooms.length > store.rooms.length) {
            console.log(`📋 向${storeId}同步房间数据`)
            // 这里需要调用具体store的更新方法
          }

          // 同步消息数据
          for (const [roomId, messages] of primaryStore.messages) {
            if (!store.messages.has(roomId) || store.messages.get(roomId)!.length < messages.length) {
              console.log(`💬 向${storeId}同步房间${roomId}的消息`)
              // 这里需要调用具体store的更新方法
            }
          }
        } catch (error) {
          console.error(`❌ 向${storeId}同步数据失败:`, error)
        }
      }
    }
  }

  /**
   * 获取协调状态（包含缓存信息）
   */
  getCoordinationStatus(): any {
    const cacheStats = roomListStabilizer.getCacheStats()
    
    return {
      primaryStore: this.primaryStore,
      totalStores: this.stores.size,
      activeStores: Array.from(this.stores.values()).filter(s => s.isActive).length,
      eventQueueLength: this.eventQueue.length,
      isProcessing: this.isProcessing,
      stores: Array.from(this.stores.entries()).map(([id, store]) => ({
        id,
        priority: store.priority,
        isActive: store.isActive,
        lastActivity: new Date(store.lastActivity).toLocaleTimeString(),
        roomCount: store.rooms.length,
        messageRoomCount: store.messages.size,
        isHealthy: this.isStoreHealthy(store)
      })),
      cache: cacheStats
    }
  }

  /**
   * 强制刷新缓存
   */
  forceRefreshCache(storeId?: string): void {
    console.log(`🔄 [强制刷新] ${storeId ? `${storeId}的` : '所有'}缓存`)
    roomListStabilizer.forceRefresh(storeId)
  }

  /**
   * 更新缓存配置
   */
  updateCacheConfig(config: any): void {
    console.log(`⚙️ [缓存配置] 更新缓存配置`, config)
    roomListStabilizer.updateConfig(config)
  }

  /**
   * 检查资源隔离
   */
  private checkResourceIsolation(storeId: string, resourceType: string): boolean {
    const store = this.stores.get(storeId)
    if (!store) return false
    
    // 检查store是否在隔离期
    const isolationKey = `${storeId}_${resourceType}_isolation`
    const isolationEnd = (store as any)[isolationKey] || 0
    
    if (Date.now() < isolationEnd) {
      console.log(`🚫 [资源隔离] ${storeId}的${resourceType}资源仍在隔离期`)
      return false
    }
    
    // 检查资源冲突
    if (this.hasResourceConflict(storeId, resourceType)) {
      // 设置短期隔离
      (store as any)[isolationKey] = Date.now() + 5000 // 5秒隔离
      console.log(`⚠️ [资源冲突] ${storeId}的${resourceType}资源被隔离5秒`)
      return false
    }
    
    return true
  }

  /**
   * 检查资源冲突
   */
  private hasResourceConflict(storeId: string, resourceType: string): boolean {
    // 检查是否有其他store正在处理相同资源
    const recentEvents = this.eventQueue
      .filter(e => e.type === resourceType && e.source !== storeId && e.timestamp > Date.now() - 2000)
    
    return recentEvents.length > 0
  }

  /**
   * 判断是否应该补充房间数据
   */
  private shouldSupplementRoomData(roomData: any, source: string): boolean {
    const primaryStore = this.stores.get(this.primaryStore!)
    if (!primaryStore) return false
    
    // 检查数据新鲜度
    const sourceStore = this.stores.get(source)
    if (!sourceStore) return false
    
    // 如果次要store的数据更新，且主要store缺少数据，则允许补充
    if (Array.isArray(roomData)) {
      const newRoomCount = roomData.length
      const primaryRoomCount = primaryStore.rooms?.length || 0
      
      // 如果次要store有更多房间，允许补充
      if (newRoomCount > primaryRoomCount) {
        console.log(`📊 [数据补充] ${source}有${newRoomCount}个房间，主要store只有${primaryRoomCount}个`)
        return true
      }
    }
    
    return false
  }

  /**
   * 智能数据同步 - 避免覆盖冲突
   */
  private intelligentDataSync(targetStoreId: string, sourceData: any): void {
    const targetStore = this.stores.get(targetStoreId)
    if (!targetStore) return
    
    console.log(`🔄 [智能同步] 向${targetStoreId}同步数据`)
    
    // 房间数据智能合并
    if (sourceData.rooms && Array.isArray(sourceData.rooms)) {
      const existingRooms = targetStore.rooms || []
      const existingRoomIds = new Set(existingRooms.map((r: any) => r.id))
      
      // 只添加不存在的房间
      const newRooms = sourceData.rooms.filter((room: any) => !existingRoomIds.has(room.id))
      if (newRooms.length > 0) {
        targetStore.rooms = [...existingRooms, ...newRooms]
        console.log(`📋 [房间同步] 向${targetStoreId}添加${newRooms.length}个新房间`)
      }
    }
    
    // 消息数据智能合并
    if (sourceData.messages && sourceData.messages instanceof Map) {
      for (const [roomId, messages] of sourceData.messages) {
        if (!targetStore.messages.has(roomId)) {
          targetStore.messages.set(roomId, [...messages])
        } else {
          // 合并消息，避免重复
          const existingMessages = targetStore.messages.get(roomId)!
          const existingIds = new Set(existingMessages.map((m: any) => m.id))
          const newMessages = messages.filter((m: any) => !existingIds.has(m.id))
          
          if (newMessages.length > 0) {
            existingMessages.push(...newMessages)
            existingMessages.sort((a: any, b: any) => a.timestamp - b.timestamp)
            console.log(`💬 [消息同步] 向${targetStoreId}房间${roomId}添加${newMessages.length}条消息`)
          }
        }
      }
    }
  }

  /**
   * 手动切换主要store - 安全切换
   */
  switchPrimaryStore(storeId: string): boolean {
    const store = this.stores.get(storeId)
    if (!store || !store.isActive || !this.isStoreHealthy(store)) {
      console.error(`❌ 无法切换到store ${storeId}: 不存在或不健康`)
      return false
    }

    const oldPrimary = this.primaryStore
    
    // 安全切换：先暂停旧主要store的事件处理
    if (oldPrimary) {
      console.log(`⏸️ [安全切换] 暂停${oldPrimary}的事件处理`)
      this.pauseStoreEvents(oldPrimary)
    }
    
    this.primaryStore = storeId
    console.log(`🔄 [主要切换] ${oldPrimary} -> ${storeId}`)
    
    // 智能数据同步
    if (oldPrimary) {
      const oldStore = this.stores.get(oldPrimary)
      if (oldStore) {
        this.intelligentDataSync(storeId, oldStore)
      }
    }
    
    // 恢复事件处理
    setTimeout(() => {
      if (oldPrimary) {
        console.log(`▶️ [安全切换] 恢复${oldPrimary}的事件处理`)
        this.resumeStoreEvents(oldPrimary)
      }
    }, 2000) // 2秒后恢复
    
    return true
  }

  /**
   * 暂停store事件处理
   */
  private pauseStoreEvents(storeId: string): void {
    const store = this.stores.get(storeId)
    if (store) {
      (store as any).eventsPaused = true
    }
  }

  /**
   * 恢复store事件处理
   */
  private resumeStoreEvents(storeId: string): void {
    const store = this.stores.get(storeId)
    if (store) {
      (store as any).eventsPaused = false
    }
  }

  /**
   * 确保数据加载 - 核心功能（集成智能缓存）
   */
  private async ensureDataLoading(storeId: string, syncData: any): Promise<void> {
    const store = this.stores.get(storeId)
    if (!store || !store.matrixClient) return

    console.log(`🔄 [智能数据加载] 确保${storeId}执行数据加载`)

    try {
      // 检查房间数据是否需要更新
      const currentRoomCount = store.rooms?.length || 0
      const syncRoomCount = syncData.roomCount || 0

      // 使用智能缓存策略，避免频繁获取
      if (syncRoomCount > currentRoomCount || currentRoomCount === 0) {
        console.log(`📋 [智能房间加载] ${storeId}需要加载房间数据 (当前:${currentRoomCount}, 同步:${syncRoomCount})`)
        
        // 使用稳定器获取房间数据，避免重复请求
        const stableRooms = await getStableRoomList(storeId, async () => {
          return await this.executeRoomDataLoad(storeId)
        })
        
        if (stableRooms && stableRooms.length > 0) {
          store.rooms = stableRooms
          console.log(`✅ [智能房间加载] ${storeId}房间数据已更新: ${stableRooms.length}个房间`)
        }
      } else {
        console.log(`✅ [智能房间加载] ${storeId}房间数据充足，跳过加载`)
      }

      // 检查是否需要加载消息（使用智能策略）
      await this.ensureMessageLoadingWithCache(storeId)

    } catch (error) {
      console.error(`❌ [智能数据加载] ${storeId}数据加载失败:`, error)
    }
  }

  /**
   * 执行房间数据加载（被稳定器调用）
   */
  private async executeRoomDataLoad(storeId: string): Promise<any[]> {
    console.log(`🏠 [房间加载执行] 执行${storeId}房间数据加载`)

    try {
      // 根据不同的store类型调用相应的加载方法
      if (storeId === 'matrix-v39-clean.ts') {
        // 调用matrix-v39-clean的房间加载方法
        const { useMatrixV39Store } = await import('@/stores/matrix-v39-clean')
        const store = useMatrixV39Store()
        
        if (store.matrixClient && store.fetchMatrixRooms) {
          console.log('🔄 [V39执行] 执行fetchMatrixRooms')
          const rooms = await store.fetchMatrixRooms()
          return Array.isArray(rooms) ? rooms : []
        } else if (store.matrixClient) {
          console.log('🔄 [V39执行] 直接从客户端获取房间')
          const client = store.matrixClient
          if (client && client.getRooms) {
            const rooms = client.getRooms() || []
            console.log(`📊 [V39执行] 从客户端获取到${rooms.length}个房间`)
            return rooms
          }
        }
      } else if (storeId === 'matrix.ts') {
        // 调用matrix.ts的房间加载方法
        const { useMatrixStore } = await import('@/stores/matrix')
        const store = useMatrixStore()
        
        if (store.fetchMatrixRooms) {
          console.log('🔄 [Matrix执行] 执行fetchMatrixRooms')
          const rooms = await store.fetchMatrixRooms()
          return Array.isArray(rooms) ? rooms : []
        }
      }
      
      return []

    } catch (error) {
      console.error(`❌ [房间加载执行] ${storeId}房间加载失败:`, error)
      return []
    }
  }

  /**
   * 触发房间数据加载（保持向后兼容）
   */
  private async triggerRoomDataLoad(storeId: string): Promise<void> {
    console.log(`🏠 [房间加载] 触发${storeId}房间数据加载`)
    
    try {
      const rooms = await this.executeRoomDataLoad(storeId)
      const store = this.stores.get(storeId)
      if (store && rooms.length > 0) {
        store.rooms = rooms
        console.log(`✅ [房间加载] ${storeId}房间数据已更新: ${rooms.length}个房间`)
      }
    } catch (error) {
      console.error(`❌ [房间加载] ${storeId}房间加载失败:`, error)
    }
  }

  /**
   * 确保消息加载（使用智能缓存）
   */
  private async ensureMessageLoadingWithCache(storeId: string): Promise<void> {
    const store = this.stores.get(storeId)
    if (!store) return

    console.log(`💬 [智能消息加载] 检查${storeId}消息加载需求`)

    try {
      // 检查是否有房间但没有消息
      const rooms = store.rooms || []
      const loadedRooms = store.messages?.size || 0

      if (rooms.length > 0 && loadedRooms < Math.min(rooms.length, 15)) { // 增加到15个房间
        console.log(`📨 [智能消息加载] ${storeId}需要加载消息 (房间:${rooms.length}, 已加载:${loadedRooms})`)
        
        // 为前15个房间加载消息，使用渐进式加载
        const roomsToLoad = rooms.slice(0, 15) // 增加到15个房间
        
        for (const room of roomsToLoad) {
          const roomId = room.id || room.roomId
          if (roomId && (!store.messages?.has(roomId) || store.messages.get(roomId)?.length === 0)) {
            
            // 使用稳定器获取消息，支持渐进式加载
            const stableMessages = await getStableMessages(roomId, storeId, async (limit?: number) => {
              return await this.executeMessageLoad(storeId, roomId, limit)
            })
            
            if (stableMessages && stableMessages.length > 0) {
              if (!store.messages) {
                store.messages = new Map()
              }
              store.messages.set(roomId, stableMessages)
              console.log(`✅ [智能消息加载] ${roomId}消息已缓存: ${stableMessages.length}条`)
            }
          }
        }
      } else {
        console.log(`✅ [智能消息加载] ${storeId}消息数据充足，跳过加载`)
      }

    } catch (error) {
      console.error(`❌ [智能消息加载] ${storeId}消息加载检查失败:`, error)
    }
  }

  /**
   * 确保消息加载（保持向后兼容）
   */
  private async ensureMessageLoading(storeId: string): Promise<void> {
    return this.ensureMessageLoadingWithCache(storeId)
  }

  /**
   * 执行消息加载（被稳定器调用，支持渐进式加载）
   */
  private async executeMessageLoad(storeId: string, roomId: string, limit?: number): Promise<any[]> {
    const actualLimit = limit || 500 // 默认500条消息
    console.log(`💬 [消息加载执行] 执行${storeId}房间${roomId}消息加载 (限制:${actualLimit}条)`)

    try {
      if (storeId === 'matrix-v39-clean.ts') {
        const { useMatrixV39Store } = await import('@/stores/matrix-v39-clean')
        const store = useMatrixV39Store()
        
        if (store.fetchMatrixMessages) {
          console.log(`🔄 [V39消息执行] 加载房间${roomId}消息 (${actualLimit}条)`)
          const messages = await store.fetchMatrixMessages(roomId, actualLimit)
          return Array.isArray(messages) ? messages : []
        }
      } else if (storeId === 'matrix.ts') {
        const { useMatrixStore } = await import('@/stores/matrix')
        const store = useMatrixStore()
        
        if (store.fetchMatrixMessages) {
          console.log(`🔄 [Matrix消息执行] 加载房间${roomId}消息 (${actualLimit}条)`)
          const messages = await store.fetchMatrixMessages(roomId, actualLimit)
          return Array.isArray(messages) ? messages : []
        }
      }

      return []

    } catch (error) {
      console.error(`❌ [消息加载执行] ${storeId}房间${roomId}消息加载失败:`, error)
      return []
    }
  }

  /**
   * 触发消息加载（保持向后兼容）
   */
  private async triggerMessageLoad(storeId: string, roomId: string): Promise<void> {
    console.log(`💬 [消息加载] 触发${storeId}房间${roomId}消息加载`)
    
    try {
      const messages = await this.executeMessageLoad(storeId, roomId)
      const store = this.stores.get(storeId)
      if (store && messages.length > 0) {
        if (!store.messages) {
          store.messages = new Map()
        }
        store.messages.set(roomId, messages)
        console.log(`✅ [消息加载] ${roomId}消息已更新: ${messages.length}条`)
      }
    } catch (error) {
      console.error(`❌ [消息加载] ${storeId}房间${roomId}消息加载失败:`, error)
    }
  }

  /**
   * 检查数据补充需求
   */
  private async checkDataSupplementNeeds(primaryStore: StoreInstance | undefined, sourceStore: StoreInstance | undefined, syncData: any): Promise<boolean> {
    if (!primaryStore || !sourceStore) return false

    // 检查房间数量差异
    const primaryRoomCount = primaryStore.rooms?.length || 0
    const sourceRoomCount = sourceStore.rooms?.length || 0
    const syncRoomCount = syncData.roomCount || 0

    // 如果次要store有更多房间数据，需要补充
    if (sourceRoomCount > primaryRoomCount || syncRoomCount > primaryRoomCount) {
      console.log(`📊 [数据检查] 需要补充数据 - 主要:${primaryRoomCount}, 来源:${sourceRoomCount}, 同步:${syncRoomCount}`)
      return true
    }

    // 检查消息数据
    const primaryMessageRooms = primaryStore.messages?.size || 0
    const sourceMessageRooms = sourceStore.messages?.size || 0

    if (sourceMessageRooms > primaryMessageRooms) {
      console.log(`💬 [数据检查] 需要补充消息数据 - 主要:${primaryMessageRooms}, 来源:${sourceMessageRooms}`)
      return true
    }

    return false
  }

  /**
   * 触发主要store数据加载
   */
  private async triggerPrimaryStoreDataLoad(): Promise<void> {
    if (!this.primaryStore) return

    console.log(`🎯 [主要加载] 触发主要store ${this.primaryStore} 数据加载`)
    
    try {
      await this.triggerRoomDataLoad(this.primaryStore)
      await this.ensureMessageLoading(this.primaryStore)
    } catch (error) {
      console.error(`❌ [主要加载] 主要store数据加载失败:`, error)
    }
  }

  /**
   * 获取store角色
   */
  private getStoreRole(storeId: string): string {
    const rules = this.getStartupRules()
    const rule = rules.get(storeId)
    return rule?.role || 'unknown'
  }

  /**
   * 检查同步冲突
   */
  private async checkSyncConflict(storeId: string, syncData: any): Promise<boolean> {
    // 检查主要store是否正在同步
    const primaryStore = this.stores.get(this.primaryStore!)
    if (!primaryStore) return false

    // 检查最近的同步活动
    const timeSinceLastActivity = Date.now() - primaryStore.lastActivity
    if (timeSinceLastActivity < 3000) { // 3秒内有活动
      console.log(`⚠️ [冲突检测] 主要store ${this.primaryStore} 最近有活动，可能冲突`)
      return true
    }

    // 检查事件队列中是否有主要store的同步事件
    const recentPrimarySyncEvents = this.eventQueue
      .filter(e => e.type === 'sync' && e.source === this.primaryStore && e.timestamp > Date.now() - 2000)
      .length

    if (recentPrimarySyncEvents > 0) {
      console.log(`⚠️ [冲突检测] 检测到主要store的近期同步事件`)
      return true
    }

    return false
  }

  /**
   * 处理延迟同步
   */
  private async handleDelayedSync(storeId: string, syncData: any): Promise<void> {
    console.log(`⏳ [延迟同步] 处理${storeId}的延迟同步事件`)
    
    try {
      // 重新检查冲突
      const hasConflict = await this.checkSyncConflict(storeId, syncData)
      if (!hasConflict) {
        console.log(`✅ [延迟同步] ${storeId}延迟同步事件现在可以处理`)
        // 这里可以触发实际的同步处理
      } else {
        console.log(`🚫 [延迟同步] ${storeId}延迟同步事件仍有冲突，跳过`)
      }
    } catch (error) {
      console.error(`❌ [延迟同步] ${storeId}延迟同步处理失败:`, error)
    }
  }
}

// 导出单例实例
export const matrixStoreCoordinator = MatrixStoreCoordinator.getInstance()

// 便捷的注册函数
export const registerMatrixStore = (storeId: string, storeInstance: any, priority: number = 1) => {
  matrixStoreCoordinator.registerStore(storeId, storeInstance, priority)
}

// 便捷的事件处理函数
export const handleMatrixEvent = (source: string, type: CoordinationEvent['type'], data: any) => {
  matrixStoreCoordinator.handleEvent(source, type, data)
}