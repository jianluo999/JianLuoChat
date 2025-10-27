import { ref } from 'vue'
import { EncryptionManager } from './encryptionManager'
import { useMatrixStore } from '../stores/matrix'

export interface KeyImportResult {
  success: boolean
  importedKeys: number
  totalKeys: number
  error?: string
  importedRoomKeys: string[]
  errorDetails?: string
}

export interface KeyImportProgress {
  progress: number
  status: 'pending' | 'importing' | 'completed' | 'failed'
  message: string
  importedKeys: number
  totalKeys: number
}

export interface KeyImportOptions {
  progressCallback?: (progress: KeyImportProgress) => void
  overwriteExistingKeys?: boolean
  validateKeys?: boolean
}

export class KeyImportManager {
  private static instance: KeyImportManager
  private progress = ref<KeyImportProgress>({
    progress: 0,
    status: 'pending',
    message: '等待开始导入',
    importedKeys: 0,
    totalKeys: 0
  })

  static getInstance(): KeyImportManager {
    if (!KeyImportManager.instance) {
      KeyImportManager.instance = new KeyImportManager()
    }
    return KeyImportManager.instance
  }

  async importRoomKeysFromJson(backupData: string, options?: KeyImportOptions): Promise<KeyImportResult> {
    try {
      this.progress.value = {
        progress: 0,
        status: 'pending',
        message: '正在解析备份文件...',
        importedKeys: 0,
        totalKeys: 0
      }
      
      // 解析JSON格式
      let keys: any[]
      
      try {
        keys = JSON.parse(backupData)
      } catch (error) {
        throw new Error('无效的JSON格式')
      }
      
      // 验证JSON格式
      if (!Array.isArray(keys)) {
        throw new Error('无效的密钥数据格式，期望数组格式')
      }
      
      // 验证密钥格式
      if (options?.validateKeys) {
        this.validateKeys(keys)
      }
      
      // 导入密钥
      const result = await this.importKeys(keys, options)
      
      this.progress.value = {
        progress: 100,
        status: 'completed',
        message: `成功导入 ${result.importedKeys} 个密钥`,
        importedKeys: result.importedKeys,
        totalKeys: result.totalKeys
      }
      
      return result
      
    } catch (error: any) {
      console.error('密钥导入失败:', error)
      this.progress.value = {
        progress: 0,
        status: 'failed',
        message: error.message,
        importedKeys: 0,
        totalKeys: 0
      }
      throw error
    }
  }

  async importKeys(keys: any[], options?: KeyImportOptions): Promise<KeyImportResult> {
    const matrixStore = useMatrixStore()
    const encryptionManager = EncryptionManager.getInstance()
    
    if (!matrixStore.matrixClient) {
      throw new Error('Matrix客户端未初始化')
    }
    
    const crypto = matrixStore.matrixClient.getCrypto()
    if (!crypto) {
      throw new Error('加密模块未初始化')
    }
    
    const totalKeys = keys.length
    let importedKeys: string[] = []
    
    if (totalKeys === 0) {
      return {
        success: true,
        importedKeys: 0,
        totalKeys: 0,
        error: undefined,
        importedRoomKeys: []
      }
    }
    
    try {
      // 调用Matrix SDK的importRoomKeys方法
      await crypto.importRoomKeys(keys, {
        progressCallback: (progress: any) => {
          const progressPercent = Math.min(100, Math.max(0, (progress.loaded / progress.total) * 100))
          
          if (options?.progressCallback) {
            options.progressCallback({
              progress: progressPercent,
              status: 'importing',
              message: `正在导入密钥: ${progress.loaded}/${progress.total}`,
              importedKeys: progress.loaded,
              totalKeys: progress.total
            })
          }
        }
      })
      
      return {
        success: true,
        importedKeys: keys.length,
        totalKeys: keys.length,
        error: undefined,
        importedRoomKeys: []
      }
      
    } catch (error: any) {
      console.error('密钥导入失败:', error)
      throw new Error(`密钥导入失败: ${error.message}`)
    }
  }

  private validateKeys(keys: any[]): void {
    for (const key of keys) {
      if (!key.room_id) {
        throw new Error('密钥缺少房间ID')
      }
      if (!key.session_id) {
        throw new Error('密钥缺少会话ID')
      }
      if (!key.first_message_index) {
        throw new Error('密钥缺少起始消息索引')
      }
      if (!key.session_data) {
        throw new Error('密钥缺少会话数据')
      }
    }
  }

  getProgress() {
    return this.progress.value
  }

  resetProgress() {
    this.progress.value = {
      progress: 0,
      status: 'pending',
      message: '等待开始导入',
      importedKeys: 0,
      totalKeys: 0
    }
  }
}