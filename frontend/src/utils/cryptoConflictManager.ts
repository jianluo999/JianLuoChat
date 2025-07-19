/**
 * 加密冲突管理器
 * 处理多个Matrix客户端之间的加密冲突问题
 */

export interface ConflictDetectionResult {
  hasConflicts: boolean
  conflictingSources: string[]
  recommendations: string[]
  riskLevel: 'low' | 'medium' | 'high'
}

export interface CryptoIsolationConfig {
  deviceIdPrefix: string
  storagePrefix: string
  useIsolatedStorage: boolean
  forceMemoryStorage: boolean
}

export class CryptoConflictManager {
  private static instance: CryptoConflictManager
  private readonly CLIENT_NAME = 'jianluochat'
  
  static getInstance(): CryptoConflictManager {
    if (!CryptoConflictManager.instance) {
      CryptoConflictManager.instance = new CryptoConflictManager()
    }
    return CryptoConflictManager.instance
  }

  /**
   * 检测潜在的加密冲突
   */
  detectConflicts(): ConflictDetectionResult {
    const result: ConflictDetectionResult = {
      hasConflicts: false,
      conflictingSources: [],
      recommendations: [],
      riskLevel: 'low'
    }

    // 检查localStorage中的冲突键
    const storageKeys = Object.keys(localStorage)
    const conflictingKeys = this.findConflictingKeys(storageKeys)
    
    if (conflictingKeys.length > 0) {
      result.hasConflicts = true
      result.conflictingSources.push('localStorage')
      result.recommendations.push('检测到其他Matrix客户端的存储数据')
    }

    // 检查IndexedDB中的冲突数据库
    this.checkIndexedDBConflicts().then(conflicts => {
      if (conflicts.length > 0) {
        result.hasConflicts = true
        result.conflictingSources.push('IndexedDB')
        result.recommendations.push('检测到其他Matrix客户端的加密数据库')
      }
    })

    // 检查是否有Element客户端在运行
    if (this.detectElementClient()) {
      result.hasConflicts = true
      result.conflictingSources.push('Element')
      result.recommendations.push('检测到Element客户端，建议使用不同的设备ID')
      result.riskLevel = 'high'
    }

    // 检查是否有其他Web Matrix客户端
    if (this.detectOtherWebClients()) {
      result.hasConflicts = true
      result.conflictingSources.push('其他Web客户端')
      result.recommendations.push('检测到其他Web Matrix客户端')
      result.riskLevel = result.riskLevel === 'high' ? 'high' : 'medium'
    }

    return result
  }

  /**
   * 生成隔离的加密配置
   */
  generateIsolatedConfig(userId: string, baseDeviceId?: string): CryptoIsolationConfig {
    const conflicts = this.detectConflicts()
    const userPrefix = userId.split(':')[0].substring(1) // 去掉@符号
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 6)
    
    return {
      deviceIdPrefix: `${this.CLIENT_NAME}_${userPrefix}_${timestamp}_${random}`,
      storagePrefix: `${this.CLIENT_NAME}-crypto-${userPrefix}-${random}`,
      useIsolatedStorage: conflicts.hasConflicts,
      forceMemoryStorage: conflicts.riskLevel === 'high'
    }
  }

  /**
   * 清理冲突的存储数据
   */
  async cleanupConflicts(userId: string): Promise<void> {
    console.log('🧹 开始清理加密冲突...')
    
    // 清理localStorage中的客户端特定数据
    const clientKeys = Object.keys(localStorage).filter(key => 
      key.startsWith(this.CLIENT_NAME)
    )
    
    clientKeys.forEach(key => {
      if (key.includes('crypto') || key.includes('device')) {
        localStorage.removeItem(key)
        console.log(`🗑️ 清理localStorage键: ${key}`)
      }
    })

    // 清理IndexedDB中的客户端特定数据库
    try {
      const databases = await indexedDB.databases()
      const clientDatabases = databases.filter(db => 
        db.name?.includes(this.CLIENT_NAME) && 
        (db.name.includes('crypto') || db.name.includes('matrix'))
      )

      for (const db of clientDatabases) {
        if (db.name) {
          indexedDB.deleteDatabase(db.name)
          console.log(`🗑️ 清理IndexedDB数据库: ${db.name}`)
        }
      }
    } catch (error) {
      console.warn('清理IndexedDB时出错:', error)
    }
  }

  /**
   * 创建安全的设备ID
   */
  createSafeDeviceId(userId: string): string {
    const config = this.generateIsolatedConfig(userId)
    return config.deviceIdPrefix
  }

  /**
   * 创建安全的存储配置
   */
  createSafeCryptoConfig(userId: string, deviceId: string) {
    const config = this.generateIsolatedConfig(userId, deviceId)
    
    return {
      useIndexedDB: !config.forceMemoryStorage,
      cryptoDatabasePrefix: config.storagePrefix,
      storagePassword: undefined,
      storageKey: undefined
    }
  }

  private findConflictingKeys(keys: string[]): string[] {
    const conflictPatterns = [
      /^mx_/,                    // Element客户端
      /^matrix_(?!jianluochat)/, // 其他Matrix客户端
      /^riot_/,                  // 旧版Riot客户端
      /^vector_/,                // Vector客户端
      /^crypto_/,                // 通用加密存储
      /^olm_/                    // Olm加密库
    ]

    return keys.filter(key => 
      conflictPatterns.some(pattern => pattern.test(key)) &&
      !key.includes(this.CLIENT_NAME)
    )
  }

  private async checkIndexedDBConflicts(): Promise<string[]> {
    try {
      const databases = await indexedDB.databases()
      const conflictingDbs = databases.filter(db => {
        const name = db.name?.toLowerCase() || ''
        return (
          (name.includes('matrix') || name.includes('crypto') || name.includes('olm')) &&
          !name.includes(this.CLIENT_NAME.toLowerCase())
        )
      })
      
      return conflictingDbs.map(db => db.name || 'unknown')
    } catch (error) {
      console.warn('无法检查IndexedDB冲突:', error)
      return []
    }
  }

  private detectElementClient(): boolean {
    const elementKeys = Object.keys(localStorage).filter(key => 
      key.startsWith('mx_') || key.includes('element')
    )
    return elementKeys.length > 0
  }

  private detectOtherWebClients(): boolean {
    const webClientKeys = Object.keys(localStorage).filter(key => 
      (key.includes('matrix') || key.includes('riot') || key.includes('vector')) &&
      !key.includes(this.CLIENT_NAME)
    )
    return webClientKeys.length > 0
  }

  /**
   * 获取冲突解决建议
   */
  getConflictResolutionAdvice(conflicts: ConflictDetectionResult): string[] {
    const advice: string[] = []

    if (conflicts.conflictingSources.includes('Element')) {
      advice.push('建议在不同的浏览器配置文件中使用Element和简洛聊天')
      advice.push('或者在Element中退出登录后再使用简洛聊天')
    }

    if (conflicts.riskLevel === 'high') {
      advice.push('检测到高风险冲突，将自动使用内存存储模式')
      advice.push('这可能会影响加密密钥的持久化')
    }

    if (conflicts.hasConflicts) {
      advice.push('建议定期清理浏览器存储以避免冲突')
      advice.push('如果遇到加密问题，请尝试重置加密设置')
    }

    return advice
  }
}

// 导出单例实例
export const cryptoConflictManager = CryptoConflictManager.getInstance()
