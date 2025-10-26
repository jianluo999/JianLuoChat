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
  roomListCacheDuration: number // 房间列表缓存时间
  messageCacheDuration: number  // 消息缓存时间
  syncStateCacheDuration: number // 同步状态缓存时间
  
  // 频率控制
  maxRoomFetchPerMinute: number // 每分钟最大房间获取次数
  maxMessageFetchPerMinute: number // 每分钟最大消息获取次数
  
  // 缓存大小限制
  maxCachedRooms: number
  maxCachedMessages: number
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
    roomListCacheDuration: 30000, // 30秒
    messageCacheDuration: 60000,  // 1分钟
    syncStateCacheDuration: 10000, // 10秒
    maxRoomFetchPerMinute: 3,     // 每分钟最多3次房间获取
    maxMessageFetchPerMinute: 10, // 每分钟最多10次消息获取
    maxCachedRooms: 100,
    maxCachedMessages: 1000
  }
  
  // 状态跟踪
  private isRoomFetching = false
  private pendingRoomFetch: Promise<any> | null = null
  private roomFetchQueue: Array<{ resolve: Function, reject: Function }> = []

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
    
    // 1. 检查缓存
    const cached = this.getRoomListFromCache(storeId)
    if (cached) {
      console.log(`✅ [房间缓存] ${storeId} 使用缓存数据 (${cached.length}个房间)`)
      return cached
    }
    
    // 2. 频率控制检查
    if (!this.canFetchRooms(storeId)) {
      console.log(`🚫 [频率控制] ${storeId} 房间获取被限制`)
      // 返回最后一次的缓存数据，即使过期
      const lastCached = this.getLastCachedRoomList(storeId)
      if (lastCached) {
        console.log(`📋 [降级缓存] ${storeId} 使用过期缓存 (${lastCached.length}个房间)`)
        return lastCached
      }
      return []
    }
    
    // 3. 防止重复请求 - 如果正在获取，等待结果
    if (this.isRoomFetching && this.pendingRoomFetch) {
      console.log(`⏳ [等待中] ${storeId} 等待正在进行的房间获取`)
      return new Promise((resolve, reject) => {
        this.roomFetchQueue.push({ resolve, reject })
      })
    }
    
    // 4. 执行获取
    return this.executeRoomFetch(storeId, fetchFunction)
  }

  /**
   * 执行房间获取
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
   * 智能消息获取 - 带缓存和频率控制
   */
  async getStableMessages(roomId: string, storeId: string, fetchFunction: () => Promise<any[]>): Promise<any[]> {
    console.log(`💬 [消息稳定器] ${storeId} 请求房间 ${roomId} 消息`)
    
    const cacheKey = `${storeId}:${roomId}`
    
    // 1. 检查缓存
    const cached = this.getMessagesFromCache(cacheKey)
    if (cached) {
      console.log(`✅ [消息缓存] ${roomId} 使用缓存数据 (${cached.length}条消息)`)
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
    
    // 3. 执行获取
    try {
      console.log(`🔄 [消息获取] ${roomId} 开始获取消息数据`)
      
      const messages = await fetchFunction()
      
      // 缓存结果
      this.cacheMessages(cacheKey, messages)
      
      // 记录获取历史
      this.recordMessageFetch(cacheKey)
      
      console.log(`✅ [消息获取] ${roomId} 成功获取 ${messages.length} 条消息`)
      
      return messages
      
    } catch (error) {
      console.error(`❌ [消息获取] ${roomId} 获取失败:`, error)
      
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
      console.log(`🔄 [强制刷新] ${storeId} 缓存已清除`)
    } else {
      this.roomListCache.clear()
      this.messageCache.clear()
      this.lastRoomFetch.clear()
      this.lastMessageFetch.clear()
      this.roomFetchHistory = []
      this.messageFetchHistory = []
      console.log(`🔄 [强制刷新] 所有缓存已清除`)
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