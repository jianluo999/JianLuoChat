/**
 * 加密管理器 - 处理Matrix加密初始化和设备ID冲突
 */

import { deviceIdManager } from './deviceIdManager'

export interface EncryptionConfig {
  useIndexedDB: boolean
  cryptoDatabasePrefix: string
  storagePassword?: string
  storageKey?: string
}

export interface EncryptionInitResult {
  success: boolean
  error?: string
  deviceId?: string
  fallbackToNonEncrypted?: boolean
}

export class EncryptionManager {
  private static instance: EncryptionManager

  static getInstance(): EncryptionManager {
    if (!EncryptionManager.instance) {
      EncryptionManager.instance = new EncryptionManager()
    }
    return EncryptionManager.instance
  }

  /**
   * 初始化加密功能，处理设备ID冲突
   */
  async initializeEncryption(client: any, userId: string, providedDeviceId?: string): Promise<EncryptionInitResult> {
    try {
      console.log('🔐 开始初始化加密功能...')

      // 首先检查加密环境
      const { initializeCryptoEnvironment } = await import('./wasmLoader')
      const envReady = await initializeCryptoEnvironment()
      
      if (!envReady) {
        console.warn('⚠️ 加密环境不满足要求，跳过加密初始化')
        return { success: false, error: '加密环境不满足要求', fallbackToNonEncrypted: true }
      }

      // 检查客户端是否支持加密
      if (typeof client.initRustCrypto !== 'function') {
        console.warn('⚠️ 客户端不支持Rust加密初始化方法')
        return { success: false, error: '客户端不支持加密', fallbackToNonEncrypted: true }
      }

      // 获取或创建一致的设备ID
      const deviceId = await deviceIdManager.getOrCreateDeviceId(userId, providedDeviceId)
      console.log(`🆔 使用设备ID: ${deviceId}`)

      // 验证设备ID一致性
      const validation = await deviceIdManager.validateDeviceIdConsistency(userId)
      if (!validation.isConsistent) {
        console.warn('⚠️ 设备ID不一致，尝试解决冲突:', validation.issues)
        
        // 尝试解决冲突
        await deviceIdManager.resolveDeviceIdConflict(userId)
        
        // 重新获取设备ID
        const newDeviceId = await deviceIdManager.getOrCreateDeviceId(userId, providedDeviceId)
        console.log(`🆔 冲突解决后的设备ID: ${newDeviceId}`)
      }

      // 尝试初始化加密
      const result = await this.tryInitializeRustCrypto(client, userId, deviceId)
      
      if (result.success) {
        console.log('✅ 加密功能初始化成功')
        return { success: true, deviceId }
      } else {
        console.warn('⚠️ 加密初始化失败，尝试恢复策略')
        
        // 尝试恢复策略
        const recoveryResult = await this.attemptEncryptionRecovery(client, userId, deviceId)
        
        if (recoveryResult.success) {
          console.log('✅ 加密恢复成功')
          return { success: true, deviceId }
        } else {
          console.warn('⚠️ 加密恢复失败，将以非加密模式运行')
          return { 
            success: false, 
            error: recoveryResult.error || '加密初始化失败', 
            fallbackToNonEncrypted: true,
            deviceId 
          }
        }
      }

    } catch (error: any) {
      console.error('❌ 加密初始化过程中出错:', error)
      return { 
        success: false, 
        error: error.message || '未知错误', 
        fallbackToNonEncrypted: true 
      }
    }
  }

  /**
   * 尝试初始化Rust加密
   */
  private async tryInitializeRustCrypto(client: any, userId: string, deviceId: string): Promise<EncryptionInitResult> {
    const configs: EncryptionConfig[] = [
      // 策略1: 使用IndexedDB，指定设备ID
      {
        useIndexedDB: true,
        cryptoDatabasePrefix: `jianluochat-crypto-${deviceId}`,
      },
      // 策略2: 使用IndexedDB，通用前缀
      {
        useIndexedDB: true,
        cryptoDatabasePrefix: 'jianluochat-crypto',
      },
      // 策略3: 使用内存存储
      {
        useIndexedDB: false,
        cryptoDatabasePrefix: 'jianluochat-crypto-memory',
      }
    ]

    for (let i = 0; i < configs.length; i++) {
      const config = configs[i]
      console.log(`🔧 尝试加密配置 ${i + 1}/${configs.length}:`, config)

      try {
        await client.initRustCrypto(config)
        
        // 验证加密是否真正可用
        const crypto = client.getCrypto()
        if (crypto) {
          console.log('✅ 加密API可用')
          return { success: true, deviceId }
        } else {
          console.warn('⚠️ 加密初始化完成但API不可用')
          continue
        }
      } catch (error: any) {
        console.warn(`⚠️ 配置 ${i + 1} 失败:`, error.message)
        
        // 如果是设备ID不匹配错误，尝试清理
        if (error.message.includes("account in the store doesn't match")) {
          console.log('🔧 检测到设备ID不匹配，清理加密存储...')
          await deviceIdManager.resolveDeviceIdConflict(userId)
          
          // 重试当前配置
          try {
            await client.initRustCrypto(config)
            const crypto = client.getCrypto()
            if (crypto) {
              console.log('✅ 清理后加密初始化成功')
              return { success: true, deviceId }
            }
          } catch (retryError: any) {
            console.warn('⚠️ 清理后重试仍失败:', retryError.message)
          }
        }
        
        // 继续尝试下一个配置
        continue
      }
    }

    return { success: false, error: '所有加密配置都失败了' }
  }

  /**
   * 尝试加密恢复策略
   */
  private async attemptEncryptionRecovery(client: any, userId: string, deviceId: string): Promise<EncryptionInitResult> {
    console.log('🔄 尝试加密恢复策略...')

    try {
      // 策略1: 完全清理并重新初始化
      console.log('🧹 策略1: 完全清理加密数据')
      await deviceIdManager.resolveDeviceIdConflict(userId)
      
      // 等待清理完成
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // 重新尝试初始化
      const result1 = await this.tryInitializeRustCrypto(client, userId, deviceId)
      if (result1.success) {
        return result1
      }

      // 策略2: 使用新的设备ID
      console.log('🆔 策略2: 生成新的设备ID')
      const newDeviceId = await deviceIdManager.getOrCreateDeviceId(userId)
      
      const result2 = await this.tryInitializeRustCrypto(client, userId, newDeviceId)
      if (result2.success) {
        return { success: true, deviceId: newDeviceId }
      }

      // 策略3: 尝试传统加密方法（如果可用）
      if (typeof client.initCrypto === 'function') {
        console.log('🔧 策略3: 尝试传统加密方法')
        try {
          await client.initCrypto()
          const crypto = client.getCrypto()
          if (crypto) {
            console.log('✅ 传统加密方法成功')
            return { success: true, deviceId }
          }
        } catch (legacyError: any) {
          console.warn('⚠️ 传统加密方法失败:', legacyError.message)
        }
      }

      return { success: false, error: '所有恢复策略都失败了' }

    } catch (error: any) {
      console.error('❌ 加密恢复过程中出错:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * 检查加密状态
   */
  checkEncryptionStatus(client: any): {
    isEnabled: boolean
    hasApi: boolean
    deviceId: string | null
    error?: string
  } {
    try {
      const crypto = client.getCrypto()
      const deviceId = client.getDeviceId()
      
      return {
        isEnabled: !!crypto,
        hasApi: typeof crypto?.encryptToDeviceMessages === 'function',
        deviceId,
      }
    } catch (error: any) {
      return {
        isEnabled: false,
        hasApi: false,
        deviceId: null,
        error: error.message
      }
    }
  }

  /**
   * 诊断加密问题
   */
  async diagnoseEncryptionIssues(client: any, userId: string): Promise<{
    hasIssues: boolean
    issues: string[]
    recommendations: string[]
    deviceIdDiagnosis: any
    encryptionStatus: any
  }> {
    const issues: string[] = []
    const recommendations: string[] = []

    // 检查设备ID问题
    const deviceIdDiagnosis = await deviceIdManager.diagnoseDeviceIdIssues()
    if (deviceIdDiagnosis.hasIssues) {
      issues.push('设备ID存在问题')
      recommendations.push(...deviceIdDiagnosis.recommendations)
    }

    // 检查加密状态
    const encryptionStatus = this.checkEncryptionStatus(client)
    if (!encryptionStatus.isEnabled) {
      issues.push('加密功能未启用')
      recommendations.push('尝试重新初始化加密功能')
    }

    if (encryptionStatus.error) {
      issues.push(`加密错误: ${encryptionStatus.error}`)
    }

    // 检查设备ID一致性
    const validation = await deviceIdManager.validateDeviceIdConsistency(userId)
    if (!validation.isConsistent) {
      issues.push('设备ID不一致')
      recommendations.push('解决设备ID冲突')
    }

    return {
      hasIssues: issues.length > 0,
      issues,
      recommendations,
      deviceIdDiagnosis,
      encryptionStatus
    }
  }
}

// 导出单例实例
export const encryptionManager = EncryptionManager.getInstance()