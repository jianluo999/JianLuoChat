/**
 * 房间列表稳定器 - 智能缓存策略
 * 解决房间列表频繁变化和重复加载导致的卡顿问题
 */

interface CacheEntry<T> {
  data: T
  timestamp: number
  version: number
  hits: number
}

interface RoomCacheConfig {
  // 缓存时间配置
  roomListCacheDuration: number // 房间列表缓存时间（一旦加载就长期缓存）
  messageCacheDuration: number  // 消息缓存时间
  syncStateCacheDuration: number // 同步状态缓存时间
  
  // 分层渐进式加载配置
  messageLoadStages: number[]   // 消息加载阶段 [10, 30, 50, 1000]
  stageLoadDelays: number[]     // 每个阶段的延迟 [0, 1000, 3000, 8000]
  maxMessageLoad: number        // 最大消息加载数量
  
  // 频率控制
  maxRoomFetchPerMinute: number // 每分钟最大房间获取次数
  maxMessageFetchPerMinute: number // 每分钟最大消息获取次数
  
  // 缓存大小限制
  maxCachedRooms: number
  maxCachedMessages: number
  
  // 房间固定策略
  roomStabilizationEnabled: boolean // 启用房间稳定化
  roomStabilizationDuration: number // 房间稳定化持续时间（一旦稳定就长期保持）
}

class RoomListStabilizer {
  private static instance: RoomListStabilizer
  
  // 缓存存储
  private roomListCache = new Map<string, CacheEntry<any[]>>()
  private messageCache = new Map<string, CacheEntry<any[]>>()
  private syncStateCache = new Map<string, CacheEntry<any>>()
  
  // 频率控制
  private roomFetchHistory: number[] = []
  private messageFetchHistory: number[] = []
  private lastRoomFetch = new Map<string, number>()
  private lastMessageFetch = new Map<string, number>()
  
  // 配置
  private config: RoomCacheConfig = {
    roomListCacheDuration: 300000, // 5分钟（房间一旦加载就长期缓存）
    messageCacheDuration: 180000,  // 3分钟
    syncStateCacheDuration: 10000, // 10秒
    messageLoadStages: [10, 30, 50, 1000], // 分层加载：10→30→50→1000条
    stageLoadDelays: [0, 1000, 3000, 8000], // 延迟：立即→1秒→3秒→8秒
    maxMessageLoad: 1000,         // 最大1000条消息
    maxRoomFetchPerMinute: 2,     // 每分钟最多2次房间获取（更严格）
    maxMessageFetchPerMinute: 15, // 每分钟最多15次消息获取（支持渐进式加载）
    maxCachedRooms: 1000,         // 大幅增加房间缓存容量到1000个
    maxCachedMessages: 5000,      // 大幅增加消息缓存容量到5000条
    roomStabilizationEnabled: true, // 启用房间稳定化
    roomStabilizationDuration: 1800000 // 30分钟稳定期
  }
  
  // 状态跟踪
  private isRoomFetching = false
  private pendingRoomFetch: Promise<any> | null = null
  private roomFetchQueue: Array<{ resolve: Function, reject: Function }> = []
  
  // 房间稳定化状态
  private stabilizedRooms = new Map<string, { rooms: any[], stabilizedAt: number }>()
  private progressiveLoadingTasks = new Map<string, { promise: Promise<any>, cancel: Function }>()
  
  // 分层渐进式加载状态
  private messageLoadingStates = new Map<string, {
    currentStage: number        // 当前加载到第几阶段 (0, 1, 2, 3)
    stageMessages: any[][]      // 每个阶段的消息 [[stage0], [stage1], [stage2], [stage3]]
    loadingPromises: Map<number, Promise<any>> // 每个阶段的加载Promise
    completed: boolean[]        // 每个阶段是否完成 [true, false, false, false]
    lastStageTime: number       // 最后一个阶段完成时间
  }>()

  static getInstance(): RoomListStabilizer {
    if (!RoomListStabilizer.instance) {
      RoomListStabilizer.instance = new RoomListStabilizer()
    }
    return RoomListStabilizer.instance
  }

  /**
   * 智能房间列表获取 - 带缓存和频率控制
   */
  async getStableRoomList(storeId: string, fetchFunction: () => Promise<any[]>): Promise<any[]> {
    console.log(`🏠 [房间稳定器] ${storeId} 请求房间列表`)
    
    // 1. 检查稳定化房间（最高优先级）
    const stabilized = this.getStabilizedRooms(storeId)
    if (stabilized) {
      console.log(`✅ [房间稳定] ${storeId} 使用稳定化房间 (${stabilized.length}个房间)`)
      return stabilized
    }
    
    // 2. 检查缓存
    const cached = this.getRoomListFromCache(storeId)
    if (cached) {
      console.log(`✅ [房间缓存] ${storeId} 使用缓存数据 (${cached.length}个房间)`)
      // 立即稳定化缓存的房间
      this.stabilizeRooms(storeId, cached)
      return cached
    }
    
    // 3. 频率控制检查
    if (!this.canFetchRooms(storeId)) {
      console.log(`🚫 [频率控制] ${storeId} 房间获取被限制`)
      // 返回最后一次的缓存数据，即使过期
      const lastCached = this.getLastCachedRoomList(storeId)
      if (lastCached) {
        console.log(`📋 [降级缓存] ${storeId} 使用过期缓存 (${lastCached.length}个房间)`)
        // 即使是过期缓存，也要稳定化
        this.stabilizeRooms(storeId, lastCached)
        return lastCached
      }
      return []
    }
    
    // 4. 防止重复请求 - 如果正在获取，等待结果
    if (this.isRoomFetching && this.pendingRoomFetch) {
      console.log(`⏳ [等待中] ${storeId} 等待正在进行的房间获取`)
      return new Promise((resolve, reject) => {
        this.roomFetchQueue.push({ resolve, reject })
      })
    }
    
    // 5. 执行获取并立即稳定化
    return this.executeRoomFetchWithStabilization(storeId, fetchFunction)
  }

  /**
   * 获取稳定化房间
   */
  private getStabilizedRooms(storeId: string): any[] | null {
    if (!this.config.roomStabilizationEnabled) return null
    
    const stabilized = this.stabilizedRooms.get(storeId)
    if (!stabilized) return null
    
    const now = Date.now()
    const age = now - stabilized.stabilizedAt
    
    // 检查稳定化是否仍然有效
    if (age < this.config.roomStabilizationDuration) {
      console.log(`🔒 [房间稳定] ${storeId} 稳定化房间仍有效 (${Math.round(age/1000)}秒前稳定化)`)
      return stabilized.rooms
    } else {
      console.log(`⏰ [房间稳定] ${storeId} 稳定化已过期，清除`)
      this.stabilizedRooms.delete(storeId)
      return null
    }
  }

  /**
   * 稳定化房间列表
   */
  private stabilizeRooms(storeId: string, rooms: any[]): void {
    if (!this.config.roomStabilizationEnabled) return
    
    const now = Date.now()
    this.stabilizedRooms.set(storeId, {
      rooms: [...rooms], // 深拷贝避免引用问题
      stabilizedAt: now
    })
    
    console.log(`🔒 [房间稳定] ${storeId} 房间已稳定化 (${rooms.length}个房间)`)
  }

  /**
   * 执行房间获取并稳定化
   */
  private async executeRoomFetchWithStabilization(storeId: string, fetchFunction: () => Promise<any[]>): Promise<any[]> {
    this.isRoomFetching = true
    
    try {
      console.log(`🔄 [房间获取] ${storeId} 开始获取房间数据`)
      
      this.pendingRoomFetch = fetchFunction()
      const rooms = await this.pendingRoomFetch
      
      // 缓存结果
      this.cacheRoomList(storeId, rooms)
      
      // 立即稳定化
      this.stabilizeRooms(storeId, rooms)
      
      // 记录获取历史
      this.recordRoomFetch(storeId)
      
      console.log(`✅ [房间获取] ${storeId} 成功获取并稳定化 ${rooms.length} 个房间`)
      
      // 通知等待的请求
      this.roomFetchQueue.forEach(({ resolve }) => resolve(rooms))
      this.roomFetchQueue = []
      
      return rooms
      
    } catch (error) {
      console.error(`❌ [房间获取] ${storeId} 获取失败:`, error)
      
      // 通知等待的请求
      this.roomFetchQueue.forEach(({ reject }) => reject(error))
      this.roomFetchQueue = []
      
      // 返回缓存数据作为降级
      const fallback = this.getLastCachedRoomList(storeId)
      if (fallback) {
        console.log(`📋 [降级处理] ${storeId} 使用缓存数据并稳定化 (${fallback.length}个房间)`)
        this.stabilizeRooms(storeId, fallback)
        return fallback
      }
      
      throw error
      
    } finally {
      this.isRoomFetching = false
      this.pendingRoomFetch = null
    }
  }

  /**
   * 执行房间获取（保持向后兼容）
   */
  private async executeRoomFetch(storeId: string, fetchFunction: () => Promise<any[]>): Promise<any[]> {
    this.isRoomFetching = true
    
    try {
      console.log(`🔄 [房间获取] ${storeId} 开始获取房间数据`)
      
      this.pendingRoomFetch = fetchFunction()
      const rooms = await this.pendingRoomFetch
      
      // 缓存结果
      this.cacheRoomList(storeId, rooms)
      
      // 记录获取历史
      this.recordRoomFetch(storeId)
      
      console.log(`✅ [房间获取] ${storeId} 成功获取 ${rooms.length} 个房间`)
      
      // 通知等待的请求
      this.roomFetchQueue.forEach(({ resolve }) => resolve(rooms))
      this.roomFetchQueue = []
      
      return rooms
      
    } catch (error) {
      console.error(`❌ [房间获取] ${storeId} 获取失败:`, error)
      
      // 通知等待的请求
      this.roomFetchQueue.forEach(({ reject }) => reject(error))
      this.roomFetchQueue = []
      
      // 返回缓存数据作为降级
      const fallback = this.getLastCachedRoomList(storeId)
      if (fallback) {
        console.log(`📋 [降级处理] ${storeId} 使用缓存数据 (${fallback.length}个房间)`)
        return fallback
      }
      
      throw error
      
    } finally {
      this.isRoomFetching = false
      this.pendingRoomFetch = null
    }
  }

  /**
   * 智能消息获取 - 渐进式全量加载
   */
  async getStableMessages(roomId: string, storeId: string, fetchFunction: (limit?: number) => Promise<any[]>): Promise<any[]> {
    console.log(`💬 [消息稳定器] ${storeId} 请求房间 ${roomId} 消息`)
    
    const cacheKey = `${storeId}:${roomId}`
    
    // 1. 检查缓存
    const cached = this.getMessagesFromCache(cacheKey)
    if (cached) {
      console.log(`✅ [消息缓存] ${roomId} 使用缓存数据 (${cached.length}条消息)`)
      
      // 检查是否需要继续分层加载更多消息
      if (cached.length < this.config.maxMessageLoad) {
        this.scheduleProgressiveMessageLoad(roomId, storeId, fetchFunction, cached.length)
      }
      
      return cached
    }
    
    // 2. 频率控制检查
    if (!this.canFetchMessages(cacheKey)) {
      console.log(`🚫 [频率控制] ${roomId} 消息获取被限制`)
      const lastCached = this.getLastCachedMessages(cacheKey)
      if (lastCached) {
        console.log(`📋 [降级缓存] ${roomId} 使用过期缓存 (${lastCached.length}条消息)`)
        return lastCached
      }
      return []
    }
    
    // 3. 执行渐进式加载
    return this.executeProgressiveMessageLoad(roomId, storeId, fetchFunction)
  }

  /**
   * 执行分层渐进式消息加载
   */
  private async executeProgressiveMessageLoad(roomId: string, storeId: string, fetchFunction: (limit?: number) => Promise<any[]>): Promise<any[]> {
    const cacheKey = `${storeId}:${roomId}`
    
    try {
      // 初始化加载状态
      const loadingState = {
        currentStage: 0,
        stageMessages: [],
        loadingPromises: new Map<number, Promise<any>>(),
        completed: new Array(this.config.messageLoadStages.length).fill(false),
        lastStageTime: Date.now()
      }
      this.messageLoadingStates.set(cacheKey, loadingState)
      
      console.log(`🔄 [分层加载] ${roomId} 开始分层渐进式加载`)
      console.log(`📋 [加载计划] 阶段: ${this.config.messageLoadStages.join('→')}条`)
      
      // 第一阶段：立即加载前10条消息
      const stage0Messages = await this.executeStageLoad(roomId, storeId, fetchFunction, 0)
      
      // 立即缓存和返回第一阶段消息
      this.cacheMessages(cacheKey, stage0Messages)
      this.recordMessageFetch(cacheKey)
      
      console.log(`✅ [阶段0] ${roomId} 立即加载完成 ${stage0Messages.length} 条消息`)
      
      // 安排后续阶段的加载
      this.scheduleRemainingStages(roomId, storeId, fetchFunction)
      
      return stage0Messages
      
    } catch (error) {
      console.error(`❌ [分层加载] ${roomId} 第一阶段加载失败:`, error)
      
      // 返回缓存数据作为降级
      const fallback = this.getLastCachedMessages(cacheKey)
      if (fallback) {
        console.log(`📋 [降级处理] ${roomId} 使用缓存数据 (${fallback.length}条消息)`)
        return fallback
      }
      
      return []
    }
  }

  /**
   * 执行单个阶段的加载
   */
  private async executeStageLoad(roomId: string, storeId: string, fetchFunction: (limit?: number) => Promise<any[]>, stage: number): Promise<any[]> {
    const limit = this.config.messageLoadStages[stage]
    const cacheKey = `${storeId}:${roomId}`
    
    console.log(`🔄 [阶段${stage}] ${roomId} 开始加载 ${limit} 条消息`)
    
    try {
      const messages = await fetchFunction(limit)
      
      // 更新加载状态
      const loadingState = this.messageLoadingStates.get(cacheKey)
      if (loadingState) {
        loadingState.stageMessages[stage] = messages
        loadingState.completed[stage] = true
        loadingState.currentStage = Math.max(loadingState.currentStage, stage)
        loadingState.lastStageTime = Date.now()
      }
      
      console.log(`✅ [阶段${stage}] ${roomId} 完成加载 ${messages.length} 条消息`)
      
      return messages
      
    } catch (error) {
      console.error(`❌ [阶段${stage}] ${roomId} 加载失败:`, error)
      throw error
    }
  }

  /**
   * 安排剩余阶段的加载
   */
  private scheduleRemainingStages(roomId: string, storeId: string, fetchFunction: (limit?: number) => Promise<any[]>): void {
    const cacheKey = `${storeId}:${roomId}`
    
    // 安排阶段1、2、3的加载
    for (let stage = 1; stage < this.config.messageLoadStages.length; stage++) {
      const delay = this.config.stageLoadDelays[stage]
      
      console.log(`📅 [阶段${stage}] ${roomId} 安排 ${delay}ms 后加载 ${this.config.messageLoadStages[stage]} 条消息`)
      
      const stagePromise = new Promise<void>((resolve) => {
        setTimeout(async () => {
          try {
            const stageMessages = await this.executeStageLoad(roomId, storeId, fetchFunction, stage)
            
            // 更新缓存为当前阶段的消息
            this.cacheMessages(cacheKey, stageMessages)
            
            console.log(`🔄 [阶段${stage}] ${roomId} 缓存已更新为 ${stageMessages.length} 条消息`)
            
          } catch (error) {
            console.error(`❌ [阶段${stage}] ${roomId} 后台加载失败:`, error)
          } finally {
            resolve()
          }
        }, delay)
      })
      
      // 记录Promise以便取消
      const loadingState = this.messageLoadingStates.get(cacheKey)
      if (loadingState) {
        loadingState.loadingPromises.set(stage, stagePromise)
      }
    }
  }

  /**
   * 批量预加载房间消息 - 支持自动预加载
   */
  async batchPreloadMessages(roomIds: string[], storeId: string, fetchFunction: (roomId: string, limit?: number) => Promise<any[]>, options?: {
    limit?: number
    batchSize?: number
    delay?: number
  }): Promise<void> {
    const { limit = 30, batchSize = 3, delay = 500 } = options || {}
    
    console.log(`🚀 [批量预加载] 开始预加载 ${roomIds.length} 个房间的消息`)
    
    let processedCount = 0
    
    // 分批处理，避免过度压力
    for (let i = 0; i < roomIds.length; i += batchSize) {
      const batch = roomIds.slice(i, i + batchSize)
      
      // 并行处理当前批次
      const batchPromises = batch.map(async (roomId) => {
        const cacheKey = `${storeId}:${roomId}`
        
        try {
          // 检查是否已有缓存
          const cached = this.getMessagesFromCache(cacheKey)
          if (cached && cached.length > 0) {
            console.log(`✅ [预加载跳过] ${roomId} 已有 ${cached.length} 条缓存消息`)
            return cached
          }
          
          // 检查频率限制
          if (!this.canFetchMessages(cacheKey)) {
            console.log(`🚫 [预加载限制] ${roomId} 受频率限制，跳过`)
            return []
          }
          
          console.log(`🔄 [预加载执行] ${roomId} 开始预加载 ${limit} 条消息`)
          
          // 执行预加载
          const messages = await fetchFunction(roomId, limit)
          
          // 缓存结果
          this.cacheMessages(cacheKey, messages)
          this.recordMessageFetch(cacheKey)
          
          console.log(`✅ [预加载完成] ${roomId} 预加载了 ${messages.length} 条消息`)
          return messages
          
        } catch (error) {
          console.warn(`⚠️ [预加载失败] ${roomId} 预加载失败:`, error)
          return []
        }
      })
      
      // 等待当前批次完成
      await Promise.all(batchPromises)
      processedCount += batch.length
      
      console.log(`📊 [批量进度] 已处理 ${processedCount}/${roomIds.length} 个房间`)
      
      // 批次间延迟
      if (i + batchSize < roomIds.length && delay > 0) {
        console.log(`⏳ [批量延迟] 等待 ${delay}ms 后处理下一批次`)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
    
    console.log(`🎉 [批量完成] 批量预加载完成，处理了 ${processedCount} 个房间`)
  }

  /**
   * 安排渐进式消息加载（检查是否需要继续加载）
   */
  private scheduleProgressiveMessageLoad(roomId: string, storeId: string, fetchFunction: (limit?: number) => Promise<any[]>, currentCount: number): void {
    const cacheKey = `${storeId}:${roomId}`
    
    // 检查当前消息数量对应的阶段
    let targetStage = -1
    for (let i = 0; i < this.config.messageLoadStages.length; i++) {
      if (currentCount >= this.config.messageLoadStages[i]) {
        targetStage = i
      } else {
        break
      }
    }
    
    // 如果已经是最高阶段，跳过
    if (targetStage >= this.config.messageLoadStages.length - 1) {
      console.log(`✅ [分层检查] ${roomId} 已达到最高阶段 (${currentCount}条消息)`)
      return
    }
    
    // 如果已经在加载，跳过
    if (this.progressiveLoadingTasks.has(cacheKey)) {
      console.log(`⏳ [分层检查] ${roomId} 已在后台加载中`)
      return
    }
    
    console.log(`📅 [分层检查] ${roomId} 当前${currentCount}条消息，安排继续分层加载`)
    
    // 从下一个阶段开始加载
    const startStage = targetStage + 1
    this.scheduleStagesFromIndex(roomId, storeId, fetchFunction, startStage)
  }

  /**
   * 从指定阶段开始安排加载
   */
  private scheduleStagesFromIndex(roomId: string, storeId: string, fetchFunction: (limit?: number) => Promise<any[]>, startStage: number): void {
    const cacheKey = `${storeId}:${roomId}`
    
    // 创建可取消的任务
    let cancelled = false
    const cancel = () => { 
      cancelled = true
      console.log(`🚫 [分层取消] ${roomId} 从阶段${startStage}开始的加载已取消`)
    }
    
    const loadPromise = new Promise<void>(async (resolve) => {
      try {
        // 依次执行各个阶段
        for (let stage = startStage; stage < this.config.messageLoadStages.length; stage++) {
          if (cancelled) break
          
          const delay = this.config.stageLoadDelays[stage]
          
          // 等待延迟
          if (delay > 0) {
            console.log(`⏳ [阶段${stage}] ${roomId} 等待 ${delay}ms`)
            await new Promise(r => setTimeout(r, delay))
          }
          
          if (cancelled) break
          
          try {
            const stageMessages = await this.executeStageLoad(roomId, storeId, fetchFunction, stage)
            
            if (!cancelled) {
              // 更新缓存
              this.cacheMessages(cacheKey, stageMessages)
              console.log(`🔄 [阶段${stage}] ${roomId} 缓存已更新为 ${stageMessages.length} 条消息`)
            }
            
          } catch (error) {
            if (!cancelled) {
              console.error(`❌ [阶段${stage}] ${roomId} 加载失败:`, error)
            }
          }
        }
        
        if (!cancelled) {
          console.log(`✅ [分层完成] ${roomId} 所有阶段加载完成`)
        }
        
      } finally {
        this.progressiveLoadingTasks.delete(cacheKey)
        resolve()
      }
    })
    
    this.progressiveLoadingTasks.set(cacheKey, { promise: loadPromise, cancel })
  }

  /**
   * 检查是否可以获取房间
   */
  private canFetchRooms(storeId: string): boolean {
    const now = Date.now()
    
    // 检查最后一次获取时间
    const lastFetch = this.lastRoomFetch.get(storeId) || 0
    if (now - lastFetch < 5000) { // 5秒内不重复获取
      return false
    }
    
    // 检查频率限制
    const recentFetches = this.roomFetchHistory.filter(time => now - time < 60000) // 1分钟内
    if (recentFetches.length >= this.config.maxRoomFetchPerMinute) {
      return false
    }
    
    return true
  }

  /**
   * 检查是否可以获取消息
   */
  private canFetchMessages(cacheKey: string): boolean {
    const now = Date.now()
    
    // 检查最后一次获取时间
    const lastFetch = this.lastMessageFetch.get(cacheKey) || 0
    if (now - lastFetch < 3000) { // 3秒内不重复获取
      return false
    }
    
    // 检查频率限制
    const recentFetches = this.messageFetchHistory.filter(time => now - time < 60000) // 1分钟内
    if (recentFetches.length >= this.config.maxMessageFetchPerMinute) {
      return false
    }
    
    return true
  }

  /**
   * 从缓存获取房间列表
   */
  private getRoomListFromCache(storeId: string): any[] | null {
    const cached = this.roomListCache.get(storeId)
    if (!cached) return null
    
    const now = Date.now()
    if (now - cached.timestamp > this.config.roomListCacheDuration) {
      return null // 缓存过期
    }
    
    cached.hits++
    return cached.data
  }

  /**
   * 获取最后缓存的房间列表（即使过期）
   */
  private getLastCachedRoomList(storeId: string): any[] | null {
    const cached = this.roomListCache.get(storeId)
    return cached ? cached.data : null
  }

  /**
   * 缓存房间列表
   */
  private cacheRoomList(storeId: string, rooms: any[]): void {
    const now = Date.now()
    const existing = this.roomListCache.get(storeId)
    
    this.roomListCache.set(storeId, {
      data: rooms,
      timestamp: now,
      version: (existing?.version || 0) + 1,
      hits: 0
    })
    
    // 清理过期缓存
    this.cleanupRoomCache()
  }

  /**
   * 从缓存获取消息
   */
  private getMessagesFromCache(cacheKey: string): any[] | null {
    const cached = this.messageCache.get(cacheKey)
    if (!cached) return null
    
    const now = Date.now()
    if (now - cached.timestamp > this.config.messageCacheDuration) {
      return null // 缓存过期
    }
    
    cached.hits++
    return cached.data
  }

  /**
   * 获取最后缓存的消息（即使过期）
   */
  private getLastCachedMessages(cacheKey: string): any[] | null {
    const cached = this.messageCache.get(cacheKey)
    return cached ? cached.data : null
  }

  /**
   * 缓存消息
   */
  private cacheMessages(cacheKey: string, messages: any[]): void {
    const now = Date.now()
    const existing = this.messageCache.get(cacheKey)
    
    this.messageCache.set(cacheKey, {
      data: messages,
      timestamp: now,
      version: (existing?.version || 0) + 1,
      hits: 0
    })
    
    // 清理过期缓存
    this.cleanupMessageCache()
  }

  /**
   * 记录房间获取历史
   */
  private recordRoomFetch(storeId: string): void {
    const now = Date.now()
    this.lastRoomFetch.set(storeId, now)
    this.roomFetchHistory.push(now)
    
    // 清理旧历史
    this.roomFetchHistory = this.roomFetchHistory.filter(time => now - time < 300000) // 保留5分钟内的历史
  }

  /**
   * 记录消息获取历史
   */
  private recordMessageFetch(cacheKey: string): void {
    const now = Date.now()
    this.lastMessageFetch.set(cacheKey, now)
    this.messageFetchHistory.push(now)
    
    // 清理旧历史
    this.messageFetchHistory = this.messageFetchHistory.filter(time => now - time < 300000) // 保留5分钟内的历史
  }

  /**
   * 清理房间缓存
   */
  private cleanupRoomCache(): void {
    if (this.roomListCache.size <= this.config.maxCachedRooms) return
    
    // 按最后使用时间排序，删除最旧的
    const entries = Array.from(this.roomListCache.entries())
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp)
    
    const toDelete = entries.slice(0, entries.length - this.config.maxCachedRooms)
    toDelete.forEach(([key]) => this.roomListCache.delete(key))
    
    console.log(`🧹 [缓存清理] 清理了 ${toDelete.length} 个房间缓存条目`)
  }

  /**
   * 清理消息缓存
   */
  private cleanupMessageCache(): void {
    if (this.messageCache.size <= this.config.maxCachedMessages) return
    
    // 按最后使用时间排序，删除最旧的
    const entries = Array.from(this.messageCache.entries())
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp)
    
    const toDelete = entries.slice(0, entries.length - this.config.maxCachedMessages)
    toDelete.forEach(([key]) => this.messageCache.delete(key))
    
    console.log(`🧹 [缓存清理] 清理了 ${toDelete.length} 个消息缓存条目`)
  }

  /**
   * 强制刷新缓存
   */
  forceRefresh(storeId?: string): void {
    if (storeId) {
      this.roomListCache.delete(storeId)
      this.lastRoomFetch.delete(storeId)
      this.stabilizedRooms.delete(storeId)
      
      // 取消该store的渐进式加载任务
      for (const [key, task] of this.progressiveLoadingTasks) {
        if (key.startsWith(`${storeId}:`)) {
          task.cancel()
          this.progressiveLoadingTasks.delete(key)
        }
      }
      
      console.log(`🔄 [强制刷新] ${storeId} 缓存和稳定化已清除`)
    } else {
      this.roomListCache.clear()
      this.messageCache.clear()
      this.lastRoomFetch.clear()
      this.lastMessageFetch.clear()
      this.roomFetchHistory = []
      this.messageFetchHistory = []
      this.stabilizedRooms.clear()
      
      // 取消所有渐进式加载任务
      for (const [key, task] of this.progressiveLoadingTasks) {
        task.cancel()
      }
      this.progressiveLoadingTasks.clear()
      this.messageLoadingStates.clear()
      
      console.log(`🔄 [强制刷新] 所有缓存、稳定化和渐进式加载已清除`)
    }
  }

  /**
   * 获取缓存统计
   */
  getCacheStats(): any {
    const now = Date.now()
    
    return {
      roomCache: {
        size: this.roomListCache.size,
        entries: Array.from(this.roomListCache.entries()).map(([key, entry]) => ({
          storeId: key,
          roomCount: entry.data.length,
          age: now - entry.timestamp,
          hits: entry.hits,
          version: entry.version,
          expired: now - entry.timestamp > this.config.roomListCacheDuration
        }))
      },
      messageCache: {
        size: this.messageCache.size,
        entries: Array.from(this.messageCache.entries()).map(([key, entry]) => ({
          cacheKey: key,
          messageCount: entry.data.length,
          age: now - entry.timestamp,
          hits: entry.hits,
          version: entry.version,
          expired: now - entry.timestamp > this.config.messageCacheDuration
        }))
      },
      stabilizedRooms: {
        size: this.stabilizedRooms.size,
        entries: Array.from(this.stabilizedRooms.entries()).map(([key, entry]) => ({
          storeId: key,
          roomCount: entry.rooms.length,
          stabilizedAge: now - entry.stabilizedAt,
          isValid: now - entry.stabilizedAt < this.config.roomStabilizationDuration
        }))
      },
      progressiveLoading: {
        activeTasks: this.progressiveLoadingTasks.size,
        tasks: Array.from(this.progressiveLoadingTasks.keys()),
        loadingStates: Array.from(this.messageLoadingStates.entries()).map(([key, state]) => ({
          cacheKey: key,
          currentStage: state.currentStage,
          completedStages: state.completed.filter(Boolean).length,
          totalStages: state.completed.length,
          stageProgress: state.completed.map((completed, index) => ({
            stage: index,
            target: this.config.messageLoadStages[index],
            completed,
            messageCount: state.stageMessages[index]?.length || 0
          }))
        }))
      },
      fetchHistory: {
        roomFetches: this.roomFetchHistory.length,
        messageFetches: this.messageFetchHistory.length,
        recentRoomFetches: this.roomFetchHistory.filter(time => now - time < 60000).length,
        recentMessageFetches: this.messageFetchHistory.filter(time => now - time < 60000).length
      },
      config: this.config
    }
  }

  /**
   * 更新配置
   */
  updateConfig(newConfig: Partial<RoomCacheConfig>): void {
    this.config = { ...this.config, ...newConfig }
    console.log(`⚙️ [配置更新] 缓存配置已更新`, this.config)
  }
}

// 导出单例
export const roomListStabilizer = RoomListStabilizer.getInstance()

// 便捷函数
export const getStableRoomList = (storeId: string, fetchFunction: () => Promise<any[]>) => {
  return roomListStabilizer.getStableRoomList(storeId, fetchFunction)
}

export const getStableMessages = (roomId: string, storeId: string, fetchFunction: () => Promise<any[]>) => {
  return roomListStabilizer.getStableMessages(roomId, storeId, fetchFunction)
}

export const forceRefreshCache = (storeId?: string) => {
  roomListStabilizer.forceRefresh(storeId)
}

export const getCacheStats = () => {
  return roomListStabilizer.getCacheStats()
}

export const batchPreloadMessages = (roomIds: string[], storeId: string, fetchFunction: (roomId: string, limit?: number) => Promise<any[]>, options?: any) => {
  return roomListStabilizer.batchPreloadMessages(roomIds, storeId, fetchFunction, options)
}