/**
 * E2EE 安全检查器
 * 用于立即检测当前E2EE实现的安全风险
 */

import type { MatrixClient } from 'matrix-js-sdk'

export interface SecurityCheckResult {
  category: string
  check: string
  status: 'pass' | 'fail' | 'warning' | 'unknown'
  message: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  recommendation?: string
}

export interface SecurityReport {
  timestamp: number
  overallStatus: 'secure' | 'vulnerable' | 'critical'
  criticalIssues: number
  highIssues: number
  mediumIssues: number
  lowIssues: number
  results: SecurityCheckResult[]
}

export class E2ESecurityChecker {
  private client: MatrixClient | null = null

  constructor(client: MatrixClient | null) {
    this.client = client
  }

  /**
   * 执行完整的安全检查
   */
  async performSecurityAudit(): Promise<SecurityReport> {
    const results: SecurityCheckResult[] = []
    
    console.log('🔍 开始E2EE安全检查...')

    // 1. 基础环境检查
    results.push(...await this.checkBasicEnvironment())
    
    // 2. Matrix客户端检查
    results.push(...await this.checkMatrixClient())
    
    // 3. 加密初始化检查
    results.push(...await this.checkCryptoInitialization())
    
    // 4. 密钥管理检查
    results.push(...await this.checkKeyManagement())
    
    // 5. 设备验证检查
    results.push(...await this.checkDeviceVerification())
    
    // 6. 消息加密检查
    results.push(...await this.checkMessageEncryption())
    
    // 7. 安全配置检查
    results.push(...await this.checkSecurityConfiguration())

    // 统计结果
    const criticalIssues = results.filter(r => r.severity === 'critical' && r.status === 'fail').length
    const highIssues = results.filter(r => r.severity === 'high' && r.status === 'fail').length
    const mediumIssues = results.filter(r => r.severity === 'medium' && r.status === 'fail').length
    const lowIssues = results.filter(r => r.severity === 'low' && r.status === 'fail').length

    let overallStatus: 'secure' | 'vulnerable' | 'critical' = 'secure'
    if (criticalIssues > 0) {
      overallStatus = 'critical'
    } else if (highIssues > 0) {
      overallStatus = 'vulnerable'
    }

    const report: SecurityReport = {
      timestamp: Date.now(),
      overallStatus,
      criticalIssues,
      highIssues,
      mediumIssues,
      lowIssues,
      results
    }

    console.log('📊 安全检查完成:', {
      总体状态: overallStatus,
      严重问题: criticalIssues,
      高风险问题: highIssues,
      中风险问题: mediumIssues,
      低风险问题: lowIssues
    })

    return report
  }

  /**
   * 检查基础环境
   */
  private async checkBasicEnvironment(): Promise<SecurityCheckResult[]> {
    const results: SecurityCheckResult[] = []

    // 检查HTTPS
    results.push({
      category: '基础环境',
      check: 'HTTPS连接',
      status: location.protocol === 'https:' ? 'pass' : 'fail',
      message: location.protocol === 'https:' ? '使用HTTPS连接' : '未使用HTTPS连接',
      severity: location.protocol === 'https:' ? 'low' : 'critical',
      recommendation: location.protocol !== 'https:' ? '必须使用HTTPS以确保传输安全' : undefined
    })

    // 检查Web Crypto API
    const cryptoSupported = 'crypto' in window && 'subtle' in window.crypto
    results.push({
      category: '基础环境',
      check: 'Web Crypto API',
      status: cryptoSupported ? 'pass' : 'fail',
      message: cryptoSupported ? 'Web Crypto API可用' : 'Web Crypto API不可用',
      severity: cryptoSupported ? 'low' : 'critical',
      recommendation: !cryptoSupported ? '需要支持Web Crypto API的现代浏览器' : undefined
    })

    // 检查IndexedDB
    const indexedDBSupported = 'indexedDB' in window && indexedDB !== null
    results.push({
      category: '基础环境',
      check: 'IndexedDB支持',
      status: indexedDBSupported ? 'pass' : 'fail',
      message: indexedDBSupported ? 'IndexedDB可用' : 'IndexedDB不可用',
      severity: indexedDBSupported ? 'low' : 'high',
      recommendation: !indexedDBSupported ? '需要支持IndexedDB的浏览器以安全存储密钥' : undefined
    })

    // 检查WebAssembly
    const wasmSupported = 'WebAssembly' in window
    results.push({
      category: '基础环境',
      check: 'WebAssembly支持',
      status: wasmSupported ? 'pass' : 'fail',
      message: wasmSupported ? 'WebAssembly可用' : 'WebAssembly不可用',
      severity: wasmSupported ? 'low' : 'high',
      recommendation: !wasmSupported ? '需要支持WebAssembly的浏览器以运行Rust加密引擎' : undefined
    })

    return results
  }

  /**
   * 检查Matrix客户端
   */
  private async checkMatrixClient(): Promise<SecurityCheckResult[]> {
    const results: SecurityCheckResult[] = []

    // 检查客户端是否初始化
    results.push({
      category: 'Matrix客户端',
      check: '客户端初始化',
      status: this.client ? 'pass' : 'fail',
      message: this.client ? 'Matrix客户端已初始化' : 'Matrix客户端未初始化',
      severity: this.client ? 'low' : 'critical',
      recommendation: !this.client ? '必须先初始化Matrix客户端' : undefined
    })

    if (!this.client) return results

    // 检查用户ID和设备ID
    const userId = this.client.getUserId()
    const deviceId = this.client.getDeviceId()
    
    results.push({
      category: 'Matrix客户端',
      check: '用户身份',
      status: userId ? 'pass' : 'fail',
      message: userId ? `用户ID: ${userId}` : '用户ID不可用',
      severity: userId ? 'low' : 'high'
    })

    results.push({
      category: 'Matrix客户端',
      check: '设备身份',
      status: deviceId ? 'pass' : 'fail',
      message: deviceId ? `设备ID: ${deviceId}` : '设备ID不可用',
      severity: deviceId ? 'low' : 'high'
    })

    return results
  }

  /**
   * 检查加密初始化
   */
  private async checkCryptoInitialization(): Promise<SecurityCheckResult[]> {
    const results: SecurityCheckResult[] = []

    if (!this.client) {
      results.push({
        category: '加密初始化',
        check: '加密引擎',
        status: 'fail',
        message: 'Matrix客户端未初始化',
        severity: 'critical'
      })
      return results
    }

    // 检查加密API是否可用
    const crypto = this.client.getCrypto()
    results.push({
      category: '加密初始化',
      check: '加密API可用性',
      status: crypto ? 'pass' : 'fail',
      message: crypto ? '加密API可用' : '加密API不可用',
      severity: crypto ? 'low' : 'critical',
      recommendation: !crypto ? '需要初始化Rust加密引擎' : undefined
    })

    if (!crypto) return results

    // 检查关键加密方法
    const criticalMethods = [
      'exportRoomKeys',
      'importRoomKeys', 
      'getUserDevices',
      'requestDeviceVerification'
    ]

    for (const method of criticalMethods) {
      const available = typeof (crypto as any)[method] === 'function'
      results.push({
        category: '加密初始化',
        check: `加密方法: ${method}`,
        status: available ? 'pass' : 'fail',
        message: available ? `${method} 方法可用` : `${method} 方法不可用`,
        severity: available ? 'low' : 'high'
      })
    }

    return results
  }

  /**
   * 检查密钥管理
   */
  private async checkKeyManagement(): Promise<SecurityCheckResult[]> {
    const results: SecurityCheckResult[] = []

    if (!this.client) return results

    const crypto = this.client.getCrypto()
    if (!crypto) return results

    try {
      // 检查密钥备份状态
      const backupInfo = await crypto.getBackupInfo()
      results.push({
        category: '密钥管理',
        check: '密钥备份',
        status: backupInfo ? 'pass' : 'warning',
        message: backupInfo ? '密钥备份已配置' : '密钥备份未配置',
        severity: backupInfo ? 'low' : 'medium',
        recommendation: !backupInfo ? '建议配置密钥备份以防设备丢失' : undefined
      })

      // 检查交叉签名状态
      const userId = this.client.getUserId()
      if (userId) {
        const crossSigningInfo = await crypto.getCrossSigningKeyId()
        results.push({
          category: '密钥管理',
          check: '交叉签名',
          status: crossSigningInfo ? 'pass' : 'warning',
          message: crossSigningInfo ? '交叉签名已配置' : '交叉签名未配置',
          severity: crossSigningInfo ? 'low' : 'medium',
          recommendation: !crossSigningInfo ? '建议配置交叉签名以简化设备验证' : undefined
        })
      }

    } catch (error) {
      results.push({
        category: '密钥管理',
        check: '密钥管理检查',
        status: 'fail',
        message: `密钥管理检查失败: ${error.message}`,
        severity: 'high'
      })
    }

    return results
  }

  /**
   * 检查设备验证
   */
  private async checkDeviceVerification(): Promise<SecurityCheckResult[]> {
    const results: SecurityCheckResult[] = []

    if (!this.client) return results

    const crypto = this.client.getCrypto()
    if (!crypto) return results

    try {
      const userId = this.client.getUserId()
      const deviceId = this.client.getDeviceId()

      if (userId && deviceId) {
        // 检查当前设备验证状态
        const device = await crypto.getDevice(userId, deviceId)
        results.push({
          category: '设备验证',
          check: '当前设备验证',
          status: device?.verified ? 'pass' : 'warning',
          message: device?.verified ? '当前设备已验证' : '当前设备未验证',
          severity: device?.verified ? 'low' : 'medium',
          recommendation: !device?.verified ? '建议验证当前设备以启用完整的E2EE功能' : undefined
        })

        // 检查其他设备
        const devices = await crypto.getUserDevices(userId)
        const unverifiedDevices = Array.from(devices.values()).filter(d => !d.verified && d.deviceId !== deviceId)
        
        results.push({
          category: '设备验证',
          check: '其他设备验证',
          status: unverifiedDevices.length === 0 ? 'pass' : 'warning',
          message: unverifiedDevices.length === 0 ? '所有设备已验证' : `${unverifiedDevices.length}个设备未验证`,
          severity: unverifiedDevices.length === 0 ? 'low' : 'medium',
          recommendation: unverifiedDevices.length > 0 ? '建议验证所有设备以确保安全通信' : undefined
        })
      }

    } catch (error) {
      results.push({
        category: '设备验证',
        check: '设备验证检查',
        status: 'fail',
        message: `设备验证检查失败: ${error.message}`,
        severity: 'high'
      })
    }

    return results
  }

  /**
   * 检查消息加密
   */
  private async checkMessageEncryption(): Promise<SecurityCheckResult[]> {
    const results: SecurityCheckResult[] = []

    // 这里应该实现真实的消息加密测试
    // 目前只能做基础检查
    results.push({
      category: '消息加密',
      check: '加密测试',
      status: 'warning',
      message: '缺乏真实的端到端加密测试',
      severity: 'critical',
      recommendation: '需要实现完整的端到端加密测试以验证消息确实被加密且服务器无法解密'
    })

    return results
  }

  /**
   * 检查安全配置
   */
  private async checkSecurityConfiguration(): Promise<SecurityCheckResult[]> {
    const results: SecurityCheckResult[] = []

    // 检查存储配置安全性
    try {
      const databases = await indexedDB.databases()
      const cryptoDatabases = databases.filter(db => 
        db.name && (db.name.includes('crypto') || db.name.includes('matrix'))
      )

      results.push({
        category: '安全配置',
        check: '加密数据库',
        status: cryptoDatabases.length > 0 ? 'pass' : 'warning',
        message: cryptoDatabases.length > 0 ? `发现${cryptoDatabases.length}个加密数据库` : '未发现加密数据库',
        severity: 'medium'
      })

      // 检查是否有多个客户端数据库（可能的冲突）
      if (cryptoDatabases.length > 2) {
        results.push({
          category: '安全配置',
          check: '数据库冲突',
          status: 'warning',
          message: `发现${cryptoDatabases.length}个加密数据库，可能存在冲突`,
          severity: 'medium',
          recommendation: '建议清理多余的加密数据库以避免冲突'
        })
      }

    } catch (error) {
      results.push({
        category: '安全配置',
        check: '存储配置检查',
        status: 'fail',
        message: `存储配置检查失败: ${error.message}`,
        severity: 'medium'
      })
    }

    return results
  }

  /**
   * 生成安全报告摘要
   */
  generateReportSummary(report: SecurityReport): string {
    const { overallStatus, criticalIssues, highIssues, mediumIssues, lowIssues } = report
    
    let summary = `🔍 E2EE安全检查报告\n`
    summary += `📅 检查时间: ${new Date(report.timestamp).toLocaleString()}\n`
    summary += `📊 总体状态: ${this.getStatusEmoji(overallStatus)} ${overallStatus.toUpperCase()}\n\n`
    
    summary += `📈 问题统计:\n`
    summary += `🔴 严重问题: ${criticalIssues}\n`
    summary += `🟠 高风险问题: ${highIssues}\n`
    summary += `🟡 中风险问题: ${mediumIssues}\n`
    summary += `🟢 低风险问题: ${lowIssues}\n\n`

    if (criticalIssues > 0) {
      summary += `⚠️ 发现严重安全问题，建议立即修复！\n\n`
    }

    // 列出关键问题
    const criticalResults = report.results.filter(r => r.severity === 'critical' && r.status === 'fail')
    if (criticalResults.length > 0) {
      summary += `🚨 严重问题详情:\n`
      criticalResults.forEach(result => {
        summary += `• ${result.category} - ${result.check}: ${result.message}\n`
        if (result.recommendation) {
          summary += `  建议: ${result.recommendation}\n`
        }
      })
    }

    return summary
  }

  private getStatusEmoji(status: string): string {
    switch (status) {
      case 'secure': return '✅'
      case 'vulnerable': return '⚠️'
      case 'critical': return '🚨'
      default: return '❓'
    }
  }
}

/**
 * 快速安全检查函数
 */
export async function quickSecurityCheck(client: MatrixClient | null): Promise<SecurityReport> {
  const checker = new E2ESecurityChecker(client)
  return await checker.performSecurityAudit()
}

/**
 * 在控制台输出安全报告
 */
export async function logSecurityReport(client: MatrixClient | null): Promise<void> {
  const checker = new E2ESecurityChecker(client)
  const report = await checker.performSecurityAudit()
  const summary = checker.generateReportSummary(report)
  
  console.log(summary)
  console.log('📋 详细结果:', report.results)
}