/**
 * 设备ID管理器 - 解决设备ID冲突和加密初始化问题
 */

export interface DeviceIdInfo {
  deviceId: string
  userId: string
  createdAt: number
  lastUsed: number
}

export class DeviceIdManager {
  private static instance: DeviceIdManager
  private readonly DEVICE_ID_PREFIX = 'jianluochat-device-id-'
  private readonly CRYPTO_DB_PREFIX = 'jianluochat-crypto'

  static getInstance(): DeviceIdManager {
    if (!DeviceIdManager.instance) {
      DeviceIdManager.instance = new DeviceIdManager()
    }
    return DeviceIdManager.instance
  }

  /**
   * 获取或生成设备ID，确保与加密存储一致
   */
  async getOrCreateDeviceId(userId: string, providedDeviceId?: string): Promise<string> {
    const username = this.extractUsername(userId)
    const deviceIdKey = `${this.DEVICE_ID_PREFIX}${username}`

    console.log(`🆔 获取设备ID for ${userId}`)

    // 如果提供了设备ID，检查是否与存储的一致
    if (providedDeviceId) {
      const storedDeviceId = localStorage.getItem(deviceIdKey)
      
      if (storedDeviceId && storedDeviceId !== providedDeviceId) {
        console.warn(`⚠️ 设备ID冲突: 存储=${storedDeviceId}, 提供=${providedDeviceId}`)
        
        // 检查加密存储中使用的是哪个设备ID
        const cryptoDeviceId = await this.getCryptoStoreDeviceId(userId)
        
        if (cryptoDeviceId) {
          console.log(`🔍 加密存储中的设备ID: ${cryptoDeviceId}`)
          
          // 如果加密存储中的设备ID与提供的一致，使用提供的
          if (cryptoDeviceId === providedDeviceId) {
            console.log('✅ 使用提供的设备ID（与加密存储一致）')
            localStorage.setItem(deviceIdKey, providedDeviceId)
            return providedDeviceId
          }
          // 如果加密存储中的设备ID与存储的一致，使用存储的
          else if (cryptoDeviceId === storedDeviceId) {
            console.log('✅ 使用存储的设备ID（与加密存储一致）')
            return storedDeviceId
          }
          // 如果都不一致，清理加密存储并使用提供的
          else {
            console.warn('⚠️ 设备ID完全不匹配，清理加密存储')
            await this.clearCryptoStore(userId)
            localStorage.setItem(deviceIdKey, providedDeviceId)
            return providedDeviceId
          }
        } else {
          // 没有加密存储，使用提供的设备ID
          console.log('✅ 没有加密存储，使用提供的设备ID')
          localStorage.setItem(deviceIdKey, providedDeviceId)
          return providedDeviceId
        }
      } else {
        // 没有冲突或没有存储的设备ID
        localStorage.setItem(deviceIdKey, providedDeviceId)
        return providedDeviceId
      }
    }

    // 尝试从localStorage获取
    let deviceId = localStorage.getItem(deviceIdKey)
    
    if (deviceId) {
      // 验证设备ID是否与加密存储一致
      const cryptoDeviceId = await this.getCryptoStoreDeviceId(userId)
      
      if (cryptoDeviceId && cryptoDeviceId !== deviceId) {
        console.warn(`⚠️ 设备ID与加密存储不匹配: localStorage=${deviceId}, crypto=${cryptoDeviceId}`)
        
        // 清理加密存储，使用localStorage中的设备ID
        await this.clearCryptoStore(userId)
        console.log('✅ 已清理不匹配的加密存储')
      }
      
      console.log(`🆔 使用已存储的设备ID: ${deviceId}`)
      return deviceId
    }

    // 生成新的设备ID
    deviceId = this.generateDeviceId()
    localStorage.setItem(deviceIdKey, deviceId)
    
    console.log(`🆔 生成新的设备ID: ${deviceId}`)
    return deviceId
  }

  /**
   * 清理设备ID冲突
   */
  async resolveDeviceIdConflict(userId: string): Promise<void> {
    console.log(`🔧 解决设备ID冲突: ${userId}`)
    
    const username = this.extractUsername(userId)
    
    // 清理所有相关的设备ID
    const keysToRemove: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(this.DEVICE_ID_PREFIX)) {
        keysToRemove.push(key)
      }
    }
    
    console.log(`🗑️ 清理设备ID键: ${keysToRemove.join(', ')}`)
    keysToRemove.forEach(key => localStorage.removeItem(key))
    
    // 清理加密存储
    await this.clearCryptoStore(userId)
    
    console.log('✅ 设备ID冲突解决完成')
  }

  /**
   * 从加密存储中获取设备ID
   */
  private async getCryptoStoreDeviceId(userId: string): Promise<string | null> {
    try {
      if (!window.indexedDB) {
        return null
      }

      const databases = await indexedDB.databases()
      const cryptoDb = databases.find(db => 
        db.name && db.name.includes(this.CRYPTO_DB_PREFIX)
      )

      if (!cryptoDb || !cryptoDb.name) {
        return null
      }

      return new Promise((resolve) => {
        const request = indexedDB.open(cryptoDb.name)
        
        request.onsuccess = () => {
          const db = request.result
          
          try {
            // 尝试从不同的可能存储位置获取设备ID
            const transaction = db.transaction(['account'], 'readonly')
            const store = transaction.objectStore('account')
            const getRequest = store.get('account')
            
            getRequest.onsuccess = () => {
              const accountData = getRequest.result
              if (accountData && accountData.device_id) {
                resolve(accountData.device_id)
              } else {
                resolve(null)
              }
            }
            
            getRequest.onerror = () => resolve(null)
          } catch (error) {
            console.warn('读取加密存储设备ID失败:', error)
            resolve(null)
          } finally {
            db.close()
          }
        }
        
        request.onerror = () => resolve(null)
      })
    } catch (error) {
      console.warn('获取加密存储设备ID失败:', error)
      return null
    }
  }

  /**
   * 清理加密存储
   */
  private async clearCryptoStore(userId: string): Promise<void> {
    try {
      if (!window.indexedDB) {
        return
      }

      const databases = await indexedDB.databases()
      const cryptoDbs = databases.filter(db => 
        db.name && (
          db.name.includes(this.CRYPTO_DB_PREFIX) ||
          db.name.includes('matrix-sdk-crypto') ||
          db.name.includes('matrix-js-sdk')
        )
      )

      console.log(`🗑️ 清理加密数据库: ${cryptoDbs.map(db => db.name).join(', ')}`)

      for (const db of cryptoDbs) {
        if (db.name) {
          await new Promise<void>((resolve, reject) => {
            const deleteRequest = indexedDB.deleteDatabase(db.name!)
            
            deleteRequest.onsuccess = () => {
              console.log(`✅ 删除加密数据库: ${db.name}`)
              resolve()
            }
            
            deleteRequest.onerror = () => {
              console.error(`❌ 删除加密数据库失败: ${db.name}`)
              reject(deleteRequest.error)
            }
            
            deleteRequest.onblocked = () => {
              console.warn(`⚠️ 删除加密数据库被阻塞: ${db.name}`)
              // 等待一段时间后继续
              setTimeout(() => resolve(), 2000)
            }
          })
        }
      }
    } catch (error) {
      console.error('清理加密存储失败:', error)
      throw error
    }
  }

  /**
   * 生成设备ID
   */
  private generateDeviceId(): string {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 8)
    return `jianluochat_web_${timestamp}_${random}`
  }

  /**
   * 从用户ID中提取用户名
   */
  private extractUsername(userId: string): string {
    return userId.split(':')[0].substring(1)
  }

  /**
   * 验证设备ID一致性
   */
  async validateDeviceIdConsistency(userId: string): Promise<{
    isConsistent: boolean
    localStorageDeviceId: string | null
    cryptoStoreDeviceId: string | null
    issues: string[]
  }> {
    const username = this.extractUsername(userId)
    const deviceIdKey = `${this.DEVICE_ID_PREFIX}${username}`
    
    const localStorageDeviceId = localStorage.getItem(deviceIdKey)
    const cryptoStoreDeviceId = await this.getCryptoStoreDeviceId(userId)
    
    const issues: string[] = []
    
    if (!localStorageDeviceId) {
      issues.push('localStorage中没有设备ID')
    }
    
    if (cryptoStoreDeviceId && localStorageDeviceId && cryptoStoreDeviceId !== localStorageDeviceId) {
      issues.push(`设备ID不匹配: localStorage=${localStorageDeviceId}, crypto=${cryptoStoreDeviceId}`)
    }
    
    const isConsistent = issues.length === 0
    
    return {
      isConsistent,
      localStorageDeviceId,
      cryptoStoreDeviceId,
      issues
    }
  }

  /**
   * 诊断设备ID问题
   */
  async diagnoseDeviceIdIssues(): Promise<{
    hasIssues: boolean
    deviceIds: Record<string, string>
    cryptoDatabases: string[]
    recommendations: string[]
  }> {
    const deviceIds: Record<string, string> = {}
    const recommendations: string[] = []
    
    // 收集所有设备ID
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(this.DEVICE_ID_PREFIX)) {
        const deviceId = localStorage.getItem(key)
        if (deviceId) {
          deviceIds[key] = deviceId
        }
      }
    }
    
    // 检查加密数据库
    let cryptoDatabases: string[] = []
    try {
      if (window.indexedDB) {
        const databases = await indexedDB.databases()
        cryptoDatabases = databases
          .filter(db => db.name && (
            db.name.includes('crypto') ||
            db.name.includes('matrix')
          ))
          .map(db => db.name!)
      }
    } catch (error) {
      console.warn('检查IndexedDB失败:', error)
    }
    
    // 生成建议
    const deviceIdCount = Object.keys(deviceIds).length
    
    if (deviceIdCount === 0) {
      recommendations.push('没有找到设备ID，需要重新登录')
    } else if (deviceIdCount > 1) {
      recommendations.push('发现多个设备ID，可能存在冲突')
      recommendations.push('建议清理冲突的设备ID')
    }
    
    if (cryptoDatabases.length > 1) {
      recommendations.push('发现多个加密数据库，可能存在冲突')
      recommendations.push('建议清理旧的加密数据库')
    }
    
    const hasIssues = deviceIdCount !== 1 || cryptoDatabases.length > 1
    
    return {
      hasIssues,
      deviceIds,
      cryptoDatabases,
      recommendations
    }
  }
}

// 导出单例实例
export const deviceIdManager = DeviceIdManager.getInstance()