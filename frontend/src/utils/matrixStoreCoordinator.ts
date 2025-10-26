/**
 * Matrix Store 协调管理器
 * 管理多个Matrix store的共存，实现冗余但有序的协调机制
 */

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
   * 注册Matrix store实例
   */
  registerStore(storeId: string, storeInstance: any, priority: number = 1): void {
    console.log(`🔗 注册Matrix Store: ${storeId} (优先级: ${priority})`)
    
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
    this.updatePrimaryStore()
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
   * 处理协调事件
   */
  handleEvent(source: string, type: CoordinationEvent['type'], data: any): void {
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
    // 同步事件协调规则
    this.coordinationRules.set('sync', async (event: CoordinationEvent) => {
      console.log(`🔄 协调同步事件: ${event.source}`)
      
      // 只允许主要store处理同步事件
      if (event.source === this.primaryStore) {
        console.log('✅ 主要store处理同步事件')
        this.broadcastToSecondaryStores('syncUpdate', event.data)
      } else {
        console.log('⚠️ 非主要store的同步事件被忽略')
      }
    })

    // 房间事件协调规则
    this.coordinationRules.set('room', async (event: CoordinationEvent) => {
      console.log(`🏠 协调房间事件: ${event.source}`)
      
      // 房间事件允许多个store处理，但要去重
      const primaryStore = this.stores.get(this.primaryStore!)
      if (primaryStore && event.source === this.primaryStore) {
        // 主要store的房间事件优先
        this.mergeRoomData(event.data)
        this.broadcastToSecondaryStores('roomUpdate', event.data)
      } else {
        // 次要store的房间事件作为补充
        this.supplementRoomData(event.data, event.source)
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
   * 获取协调状态
   */
  getCoordinationStatus(): any {
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
      }))
    }
  }

  /**
   * 手动切换主要store
   */
  switchPrimaryStore(storeId: string): boolean {
    const store = this.stores.get(storeId)
    if (!store || !store.isActive || !this.isStoreHealthy(store)) {
      console.error(`❌ 无法切换到store ${storeId}: 不存在或不健康`)
      return false
    }

    const oldPrimary = this.primaryStore
    this.primaryStore = storeId
    console.log(`🔄 手动切换主要store: ${oldPrimary} -> ${storeId}`)
    
    this.syncDataFromPrimary()
    return true
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