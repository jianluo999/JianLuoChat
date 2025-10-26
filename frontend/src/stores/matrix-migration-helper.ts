/**
 * Matrix Store 迁移辅助工具
 * 帮助从旧版本 matrix.ts 迁移到新版本 matrix-v39-clean.ts
 */

import { useMatrixV39Store } from './matrix-v39-clean'

// 创建兼容层，保持旧 API 的兼容性
export const useMatrixStore = () => {
  const v39Store = useMatrixV39Store()
  
  // 返回兼容的 API 接口
  return {
    // 状态映射 - 保持旧版本的属性名
    connection: v39Store.connection,
    currentUser: v39Store.currentUser,
    rooms: v39Store.rooms,
    messages: v39Store.messages,
    currentRoomId: v39Store.currentRoomId,
    loading: v39Store.loading,
    error: v39Store.error,
    
    // 计算属性映射
    currentRoom: v39Store.currentRoom,
    currentMessages: v39Store.currentMessages,
    sortedRooms: v39Store.sortedRooms,
    totalUnreadCount: v39Store.totalUnreadCount,
    isConnected: v39Store.isConnected,
    isLoggedIn: v39Store.isLoggedIn,
    
    // 方法映射 - 保持旧版本的方法名
    initializeMatrix: v39Store.initializeMatrix,
    login: v39Store.matrixLogin, // 旧版本使用 login，新版本使用 matrixLogin
    quickLogin: v39Store.quickLogin, // 新增的快速登录功能
    fetchRooms: v39Store.fetchMatrixRooms, // 旧版本使用 fetchRooms
    fetchMessages: v39Store.fetchMatrixMessages, // 旧版本使用 fetchMessages
    sendMessage: v39Store.sendMatrixMessage, // 旧版本使用 sendMessage
    sendFile: v39Store.sendFileMessage,
    logout: v39Store.logout,
    resetClient: v39Store.resetClientState,
    
    // 房间管理方法
    setCurrentRoom: v39Store.setCurrentRoom,
    markRoomAsRead: v39Store.markRoomAsRead,
    createRoom: v39Store.createRoom,
    joinRoom: v39Store.joinRoom,
    leaveRoom: v39Store.leaveRoom,
    
    // 新功能 - 逐步暴露给旧组件
    spaces: v39Store.spaces,
    directMessages: v39Store.directMessages,
    threads: v39Store.threads,
    reactions: v39Store.reactions,
    
    // 高级功能
    sendThreadReply: v39Store.sendThreadReply,
    addReaction: v39Store.addReaction,
    removeReaction: v39Store.removeReaction,
    editMessage: v39Store.editMessage,
    deleteMessage: v39Store.deleteMessage,
    
    // 加密功能
    cryptoStatus: v39Store.cryptoStatus,
    encryptionReady: v39Store.encryptionReady,
    setupCrossSigning: v39Store.setupCrossSigning,
    setupKeyBackup: v39Store.setupKeyBackup,
    verifyDevice: v39Store.verifyDevice,
    
    // 性能监控
    performanceMetrics: v39Store.performanceMetrics,
    getPerformanceMetrics: v39Store.getPerformanceMetrics,
    logPerformanceReport: v39Store.logPerformanceReport,
    
    // 工具方法
    clearError: v39Store.clearError,
    formatFileSize: v39Store.formatFileSize,
    
    // 迁移标识
    __isV39Enhanced: true,
    __migrationHelper: true
  }
}

// 创建迁移检查工具
export const createMigrationChecker = () => {
  return {
    // 检查组件是否已迁移到新版本
    isUsingV39: (storeInstance: any) => {
      return storeInstance.__isV39Enhanced === true
    },
    
    // 检查组件是否使用了新功能
    isUsingNewFeatures: (storeInstance: any) => {
      return !!(storeInstance.spaces || storeInstance.threads || storeInstance.quickLogin)
    },
    
    // 获取迁移建议
    getMigrationSuggestions: (componentName: string) => {
      return {
        component: componentName,
        suggestions: [
          '1. 将 useMatrixStore 导入改为从 matrix-migration-helper 导入',
          '2. 测试现有功能是否正常工作',
          '3. 逐步使用新功能（spaces, threads, quickLogin等）',
          '4. 最终直接导入 useMatrixV39Store'
        ],
        newFeatures: [
          'quickLogin - 快速登录功能',
          'spaces - 空间管理',
          'threads - 线程消息',
          'reactions - 消息反应',
          'encryption - 端到端加密',
          'performance - 性能监控'
        ]
      }
    }
  }
}

// 批量迁移工具
export const createBatchMigrationTool = () => {
  const migrationChecker = createMigrationChecker()
  
  return {
    // 扫描项目中使用旧版本的组件
    scanOldUsage: () => {
      console.log('🔍 扫描使用旧版本 Matrix Store 的组件...')
      // 这里可以添加自动扫描逻辑
      return [
        'frontend/src/components/MatrixChatDemo.vue',
        'frontend/src/components/MatrixMessageArea.vue',
        'frontend/src/components/MatrixRoomList.vue',
        // ... 其他组件
      ]
    },
    
    // 生成迁移报告
    generateMigrationReport: () => {
      const oldUsageFiles = [
        'frontend/src/components/MatrixChatDemo.vue',
        'frontend/src/components/MatrixMessageArea.vue',
        'frontend/src/components/MatrixRoomList.vue',
        'frontend/src/components/MatrixMessageInput.vue',
        'frontend/src/components/MatrixRoomManager.vue',
        'frontend/src/components/WeChatStyleLayout.vue',
        'frontend/src/pages/CryptoDebug.vue',
        'frontend/src/pages/EncryptionSettings.vue'
      ]
      
      return {
        totalFiles: oldUsageFiles.length,
        files: oldUsageFiles,
        priority: {
          high: ['MatrixChatDemo.vue', 'MatrixMessageArea.vue'], // 核心组件
          medium: ['MatrixRoomList.vue', 'MatrixMessageInput.vue'], // 重要组件
          low: ['CryptoDebug.vue', 'EncryptionSettings.vue'] // 辅助组件
        },
        estimatedTime: '3-5 天',
        risks: [
          '部分组件可能依赖旧版本特有的功能',
          '需要测试加密功能的兼容性',
          '性能优化可能影响现有行为'
        ]
      }
    },
    
    // 创建迁移计划
    createMigrationPlan: () => {
      return {
        phase1: {
          name: '准备阶段',
          duration: '1天',
          tasks: [
            '备份当前版本',
            '创建测试环境',
            '验证新版本功能'
          ]
        },
        phase2: {
          name: '核心组件迁移',
          duration: '2天',
          tasks: [
            '迁移 MatrixChatDemo.vue',
            '迁移 MatrixMessageArea.vue',
            '测试核心聊天功能'
          ]
        },
        phase3: {
          name: '辅助组件迁移',
          duration: '2天',
          tasks: [
            '迁移房间列表组件',
            '迁移消息输入组件',
            '迁移设置页面'
          ]
        },
        phase4: {
          name: '清理整合',
          duration: '1天',
          tasks: [
            '移除旧版本文件',
            '更新文档',
            '性能测试'
          ]
        }
      }
    }
  }
}

// 导出便捷的迁移工具
export const migrationHelper = {
  checker: createMigrationChecker(),
  batchTool: createBatchMigrationTool()
}

// 使用示例和说明
export const MIGRATION_USAGE_EXAMPLES = {
  // 1. 最简单的迁移方式 - 只需要改变导入
  simple: `
// 旧版本
import { useMatrixStore } from '@/stores/matrix'

// 新版本（兼容层）
import { useMatrixStore } from '@/stores/matrix-migration-helper'

// 使用方式完全相同
const matrixStore = useMatrixStore()
`,

  // 2. 逐步使用新功能
  gradual: `
// 使用兼容层 + 新功能
import { useMatrixStore } from '@/stores/matrix-migration-helper'

const matrixStore = useMatrixStore()

// 旧功能继续工作
await matrixStore.login(username, password)

// 新功能逐步使用
await matrixStore.quickLogin(username, password) // 快速登录
console.log(matrixStore.spaces) // 空间列表
console.log(matrixStore.threads) // 线程消息
`,

  // 3. 完全迁移到新版本
  complete: `
// 直接使用新版本
import { useMatrixV39Store } from '@/stores/matrix-v39-clean'

const matrixStore = useMatrixV39Store()

// 使用所有新功能
await matrixStore.quickLogin(username, password)
await matrixStore.initializeFullMatrixFromQuickLogin()
await matrixStore.sendThreadReply(roomId, rootEventId, content)
`
}