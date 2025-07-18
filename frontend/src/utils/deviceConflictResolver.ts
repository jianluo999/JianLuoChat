// 设备冲突解决工具
// 用于检测和解决Matrix客户端的设备ID冲突问题

export interface DeviceConflictInfo {
  hasConflict: boolean
  conflictType: 'key_exists' | 'device_deleted' | 'multiple_instances' | 'none'
  deviceId?: string
  errorMessage?: string
  recommendations: string[]
}

/**
 * 检测设备冲突
 */
export function detectDeviceConflict(error: any): DeviceConflictInfo {
  const info: DeviceConflictInfo = {
    hasConflict: false,
    conflictType: 'none',
    recommendations: []
  }

  if (!error) return info

  const errorMessage = error.message || error.toString()
  
  // 检测密钥已存在错误
  if (errorMessage.includes('One time key') && errorMessage.includes('already exists')) {
    info.hasConflict = true
    info.conflictType = 'key_exists'
    info.errorMessage = errorMessage
    info.recommendations = [
      '清理本地存储的设备ID',
      '重新生成设备ID',
      '清理加密存储',
      '重新登录Matrix账户'
    ]
  }
  
  // 检测设备被删除错误
  else if (errorMessage.includes('device might have been deleted')) {
    info.hasConflict = true
    info.conflictType = 'device_deleted'
    info.errorMessage = errorMessage
    info.recommendations = [
      '设备可能在其他客户端被删除',
      '清理本地设备数据',
      '重新登录以创建新设备'
    ]
  }
  
  // 检测多实例错误
  else if (errorMessage.includes('null pointer') || errorMessage.includes('wasm')) {
    info.hasConflict = true
    info.conflictType = 'multiple_instances'
    info.errorMessage = errorMessage
    info.recommendations = [
      '可能有多个Matrix客户端实例运行',
      '刷新页面清理所有实例',
      '检查是否有多个标签页打开'
    ]
  }

  return info
}

/**
 * 自动修复设备冲突
 */
export async function autoFixDeviceConflict(conflictInfo: DeviceConflictInfo): Promise<boolean> {
  if (!conflictInfo.hasConflict) return true

  try {
    console.log('🔧 开始自动修复设备冲突:', conflictInfo.conflictType)

    switch (conflictInfo.conflictType) {
      case 'key_exists':
      case 'device_deleted':
        // 清理设备相关数据
        await clearDeviceData()
        console.log('✅ 设备数据已清理')
        return true

      case 'multiple_instances':
        // 清理WASM相关数据
        await clearWasmData()
        console.log('✅ WASM数据已清理')
        return true

      default:
        console.warn('⚠️ 未知的冲突类型，无法自动修复')
        return false
    }
  } catch (error) {
    console.error('❌ 自动修复失败:', error)
    return false
  }
}

/**
 * 清理设备相关数据
 */
async function clearDeviceData(): Promise<void> {
  // 清理localStorage
  localStorage.removeItem('matrix-device-id')
  localStorage.removeItem('matrix-login-info')
  
  // 清理sessionStorage
  sessionStorage.removeItem('matrix-device-id')
  
  // 清理IndexedDB中的加密数据
  try {
    const databases = await indexedDB.databases()
    for (const db of databases) {
      if (db.name && (
        db.name.includes('matrix') || 
        db.name.includes('crypto') ||
        db.name.includes('jianluochat')
      )) {
        console.log('🗑️ 删除数据库:', db.name)
        indexedDB.deleteDatabase(db.name)
      }
    }
  } catch (error) {
    console.warn('清理IndexedDB失败:', error)
  }
}

/**
 * 清理WASM相关数据
 */
async function clearWasmData(): Promise<void> {
  // 清理全局WASM相关变量
  const globalKeys = Object.keys(window)
  for (const key of globalKeys) {
    if (key.includes('wasm') || key.includes('crypto') || key.includes('matrix')) {
      try {
        delete (window as any)[key]
      } catch (error) {
        // 忽略无法删除的属性
      }
    }
  }
  
  // 清理设备数据
  await clearDeviceData()
}

/**
 * 生成设备冲突报告
 */
export function generateConflictReport(conflictInfo: DeviceConflictInfo): string {
  if (!conflictInfo.hasConflict) {
    return '✅ 未检测到设备冲突'
  }

  let report = `🚨 检测到设备冲突\n`
  report += `类型: ${conflictInfo.conflictType}\n`
  
  if (conflictInfo.errorMessage) {
    report += `错误信息: ${conflictInfo.errorMessage}\n`
  }
  
  if (conflictInfo.deviceId) {
    report += `设备ID: ${conflictInfo.deviceId}\n`
  }
  
  report += `\n建议解决方案:\n`
  conflictInfo.recommendations.forEach((rec, index) => {
    report += `${index + 1}. ${rec}\n`
  })

  return report
}

/**
 * 监控设备冲突
 */
export function monitorDeviceConflicts(callback: (conflictInfo: DeviceConflictInfo) => void): () => void {
  // 监控console错误
  const originalError = console.error
  console.error = function(...args) {
    const message = args.join(' ')
    const conflictInfo = detectDeviceConflict({ message })
    
    if (conflictInfo.hasConflict) {
      callback(conflictInfo)
    }
    
    return originalError.apply(this, args)
  }

  // 监控未捕获的Promise错误
  const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
    const conflictInfo = detectDeviceConflict(event.reason)
    if (conflictInfo.hasConflict) {
      callback(conflictInfo)
    }
  }

  window.addEventListener('unhandledrejection', handleUnhandledRejection)

  // 返回清理函数
  return () => {
    console.error = originalError
    window.removeEventListener('unhandledrejection', handleUnhandledRejection)
  }
}

// 导出便捷函数
export const deviceConflictUtils = {
  detect: detectDeviceConflict,
  autoFix: autoFixDeviceConflict,
  generateReport: generateConflictReport,
  monitor: monitorDeviceConflicts,
  clearDeviceData,
  clearWasmData
}
