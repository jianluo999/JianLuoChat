/**
 * 冗余登录系统测试工具
 * 用于验证多重备用方案是否正常工作
 */

import { useMatrixProgressiveOptimization } from '../stores/matrix-progressive-optimization'

export class RedundancyTester {
  private optimizationStore: any
  
  constructor() {
    this.optimizationStore = useMatrixProgressiveOptimization()
  }
  
  /**
   * 测试冗余登录系统
   */
  async testRedundantLogin(username: string, password: string) {
    console.log('🧪 [冗余测试] 开始测试冗余登录系统...')
    
    const testResults = {
      healthCheck: null as any,
      loginAttempt: null as any,
      autoRepair: null as any,
      finalStats: null as any
    }
    
    try {
      // 1. 健康检查测试
      console.log('🔍 [冗余测试] 执行健康检查...')
      testResults.healthCheck = await this.optimizationStore.performHealthCheck()
      console.log(`📊 [冗余测试] 健康度: ${testResults.healthCheck.redundancyLevel}/6`)
      
      // 2. 登录测试
      console.log('🚀 [冗余测试] 测试冗余登录...')
      testResults.loginAttempt = await this.optimizationStore.quickLogin(username, password)
      
      if (testResults.loginAttempt.success) {
        console.log(`✅ [冗余测试] 登录成功，方法: ${testResults.loginAttempt.method}`)
      } else {
        console.warn(`⚠️ [冗余测试] 登录失败，尝试了 ${testResults.loginAttempt.attempts || 0} 个服务器`)
        
        // 3. 自动修复测试
        console.log('🔧 [冗余测试] 测试自动修复...')
        testResults.autoRepair = await this.optimizationStore.autoRepairSystem()
        console.log(`🔧 [冗余测试] 修复结果: ${testResults.autoRepair.repaired ? '成功' : '无需修复'}`)
      }
      
      // 4. 最终统计
      testResults.finalStats = this.optimizationStore.getOptimizationStats()
      
      console.log('📋 [冗余测试] 测试完成，结果:')
      console.log('- 健康检查:', testResults.healthCheck.redundancyLevel >= 3 ? '✅ 良好' : '⚠️ 需要关注')
      console.log('- 登录功能:', testResults.loginAttempt.success ? '✅ 正常' : '❌ 异常')
      console.log('- 自动修复:', testResults.autoRepair?.repaired ? '✅ 已修复' : '✅ 无需修复')
      console.log('- 冗余级别:', Object.values(testResults.finalStats.redundancy).filter(Boolean).length, '/6')
      
      return testResults
      
    } catch (error) {
      console.error('❌ [冗余测试] 测试失败:', error)
      return { error, ...testResults }
    }
  }
  
  /**
   * 模拟故障测试
   */
  async testFailureRecovery() {
    console.log('💥 [故障测试] 开始模拟故障恢复测试...')
    
    // 备份当前状态
    const backups = {
      quickAuth: localStorage.getItem('matrix-quick-auth'),
      backupAuth: localStorage.getItem('matrix-quick-auth-backup'),
      v39Auth: localStorage.getItem('matrix-v39-login-info'),
      token: localStorage.getItem('matrix_access_token')
    }
    
    try {
      // 模拟故障：删除主要认证信息
      localStorage.removeItem('matrix-quick-auth')
      localStorage.removeItem('matrix_access_token')
      console.log('💥 [故障测试] 已模拟认证信息丢失')
      
      // 测试自动修复
      const repairResult = await this.optimizationStore.autoRepairSystem()
      console.log(`🔧 [故障测试] 修复结果:`, repairResult)
      
      // 检查修复后的健康状态
      const healthAfterRepair = await this.optimizationStore.performHealthCheck()
      console.log(`📊 [故障测试] 修复后健康度: ${healthAfterRepair.redundancyLevel}/6`)
      
      return {
        repairSuccessful: repairResult.repaired,
        healthImproved: healthAfterRepair.redundancyLevel > 0,
        repairActions: repairResult.actions
      }
      
    } finally {
      // 恢复备份状态
      Object.entries(backups).forEach(([key, value]) => {
        if (value) {
          const storageKey = key === 'quickAuth' ? 'matrix-quick-auth' :
                           key === 'backupAuth' ? 'matrix-quick-auth-backup' :
                           key === 'v39Auth' ? 'matrix-v39-login-info' :
                           'matrix_access_token'
          localStorage.setItem(storageKey, value)
        }
      })
      console.log('🔄 [故障测试] 已恢复原始状态')
    }
  }
  
  /**
   * 性能测试
   */
  async testPerformance(username: string, password: string) {
    console.log('⚡ [性能测试] 开始性能测试...')
    
    const performanceResults = {
      healthCheckTime: 0,
      loginTime: 0,
      repairTime: 0,
      totalTime: 0
    }
    
    const startTime = performance.now()
    
    try {
      // 健康检查性能
      const healthStart = performance.now()
      await this.optimizationStore.performHealthCheck()
      performanceResults.healthCheckTime = performance.now() - healthStart
      
      // 登录性能
      const loginStart = performance.now()
      await this.optimizationStore.quickLogin(username, password)
      performanceResults.loginTime = performance.now() - loginStart
      
      // 修复性能
      const repairStart = performance.now()
      await this.optimizationStore.autoRepairSystem()
      performanceResults.repairTime = performance.now() - repairStart
      
      performanceResults.totalTime = performance.now() - startTime
      
      console.log('⚡ [性能测试] 结果:')
      console.log(`- 健康检查: ${performanceResults.healthCheckTime.toFixed(2)}ms`)
      console.log(`- 冗余登录: ${performanceResults.loginTime.toFixed(2)}ms`)
      console.log(`- 自动修复: ${performanceResults.repairTime.toFixed(2)}ms`)
      console.log(`- 总耗时: ${performanceResults.totalTime.toFixed(2)}ms`)
      
      return performanceResults
      
    } catch (error) {
      console.error('❌ [性能测试] 测试失败:', error)
      return { error, ...performanceResults }
    }
  }
}

// 导出便捷测试函数
export const testRedundantSystem = async (username: string, password: string) => {
  const tester = new RedundancyTester()
  
  console.log('🧪 [完整测试] 开始完整的冗余系统测试...')
  
  const results = {
    redundancy: await tester.testRedundantLogin(username, password),
    failureRecovery: await tester.testFailureRecovery(),
    performance: await tester.testPerformance(username, password)
  }
  
  console.log('🎯 [完整测试] 所有测试完成')
  return results
}