import { ref, reactive } from 'vue'

export interface LoginStep {
  id: number
  name: string
  message: string
  completed: boolean
  startTime?: number
  endTime?: number
  error?: string
}

export interface LoginProgressState {
  isActive: boolean
  currentStep: number
  totalSteps: number
  progress: number
  steps: LoginStep[]
  startTime?: number
  endTime?: number
}

// 全局进度状态
const progressState = reactive<LoginProgressState>({
  isActive: false,
  currentStep: 0,
  totalSteps: 4,
  progress: 0,
  steps: [
    { id: 1, name: 'auth', message: '正在验证用户身份', completed: false },
    { id: 2, name: 'rooms', message: '正在连接聊天服务器', completed: false },
    { id: 3, name: 'messages', message: '正在加载聊天记录', completed: false },
    { id: 4, name: 'ready', message: '正在完成初始化', completed: false }
  ]
})

// 进度条组件引用
const progressBarRef = ref<any>(null)

export function useLoginProgress() {
  
  // 启动登录进度
  const startLoginProgress = () => {
    console.log('🚀 [进度管理] 启动登录进度跟踪')
    
    // 重置状态
    progressState.isActive = true
    progressState.currentStep = 0
    progressState.progress = 0
    progressState.startTime = Date.now()
    progressState.endTime = undefined
    
    // 重置所有步骤
    progressState.steps.forEach(step => {
      step.completed = false
      step.startTime = undefined
      step.endTime = undefined
      step.error = undefined
    })

    // 启动进度条组件
    if (progressBarRef.value) {
      progressBarRef.value.start()
    }

    return progressState
  }

  // 完成某个步骤
  const completeStep = (stepName: string, data?: any) => {
    const step = progressState.steps.find(s => s.name === stepName)
    if (!step) {
      console.warn(`⚠️ [进度管理] 未找到步骤: ${stepName}`)
      return
    }

    if (step.completed) {
      console.log(`✅ [进度管理] 步骤 ${stepName} 已完成，跳过`)
      return
    }

    console.log(`✅ [进度管理] 完成步骤: ${stepName} - ${step.message}`)
    
    step.completed = true
    step.endTime = Date.now()
    
    // 更新当前步骤
    const stepIndex = progressState.steps.indexOf(step)
    progressState.currentStep = Math.max(progressState.currentStep, stepIndex + 1)
    
    // 计算进度百分比
    const completedCount = progressState.steps.filter(s => s.completed).length
    progressState.progress = (completedCount / progressState.totalSteps) * 100

    // 通知进度条组件
    if (progressBarRef.value) {
      progressBarRef.value.completeStep(step.id)
    }

    // 如果所有步骤完成，结束进度
    if (completedCount === progressState.totalSteps) {
      finishLoginProgress()
    }

    return step
  }

  // 标记步骤出错
  const markStepError = (stepName: string, error: string) => {
    const step = progressState.steps.find(s => s.name === stepName)
    if (!step) return

    console.error(`❌ [进度管理] 步骤 ${stepName} 出错: ${error}`)
    
    step.error = error
    step.endTime = Date.now()

    // 错误不阻止进度，继续下一步
    // 但可以在UI上显示警告
  }

  // 完成整个登录进程
  const finishLoginProgress = () => {
    console.log('🎉 [进度管理] 登录进程完成')
    
    progressState.endTime = Date.now()
    progressState.progress = 100
    
    // 通知进度条组件完成
    if (progressBarRef.value) {
      progressBarRef.value.complete()
    }

    // 延迟停用状态，让用户看到完成效果
    setTimeout(() => {
      progressState.isActive = false
    }, 1000)

    // 打印性能统计
    if (progressState.startTime && progressState.endTime) {
      const totalTime = progressState.endTime - progressState.startTime
      console.log(`📊 [进度管理] 登录总耗时: ${totalTime}ms`)
      
      progressState.steps.forEach(step => {
        if (step.startTime && step.endTime) {
          const stepTime = step.endTime - step.startTime
          console.log(`  - ${step.name}: ${stepTime}ms`)
        }
      })
    }
  }

  // 取消登录进程
  const cancelLoginProgress = () => {
    console.log('🛑 [进度管理] 取消登录进程')
    
    progressState.isActive = false
    
    if (progressBarRef.value) {
      progressBarRef.value.hide()
    }
  }

  // 重置进度状态
  const resetLoginProgress = () => {
    console.log('🔄 [进度管理] 重置登录进度')
    
    progressState.isActive = false
    progressState.currentStep = 0
    progressState.progress = 0
    progressState.startTime = undefined
    progressState.endTime = undefined
    
    progressState.steps.forEach(step => {
      step.completed = false
      step.startTime = undefined
      step.endTime = undefined
      step.error = undefined
    })

    if (progressBarRef.value) {
      progressBarRef.value.reset()
    }
  }

  // 设置进度条组件引用
  const setProgressBarRef = (ref: any) => {
    progressBarRef.value = ref
  }

  // 获取当前步骤信息
  const getCurrentStep = () => {
    return progressState.steps[progressState.currentStep] || null
  }

  // 获取完成的步骤数
  const getCompletedStepsCount = () => {
    return progressState.steps.filter(s => s.completed).length
  }

  // 检查特定步骤是否完成
  const isStepCompleted = (stepName: string) => {
    const step = progressState.steps.find(s => s.name === stepName)
    return step ? step.completed : false
  }

  // 获取步骤错误
  const getStepError = (stepName: string) => {
    const step = progressState.steps.find(s => s.name === stepName)
    return step ? step.error : null
  }

  // 模拟步骤执行（用于测试）
  const simulateLoginSteps = async () => {
    console.log('🧪 [进度管理] 开始模拟登录步骤')
    
    startLoginProgress()

    // 模拟各个步骤的执行时间
    const stepDelays = [1000, 1500, 2000, 800] // 每个步骤的模拟延迟

    for (let i = 0; i < progressState.steps.length; i++) {
      const step = progressState.steps[i]
      
      // 标记步骤开始
      step.startTime = Date.now()
      
      // 模拟异步操作
      await new Promise(resolve => setTimeout(resolve, stepDelays[i]))
      
      // 完成步骤
      completeStep(step.name)
    }
  }

  return {
    // 状态
    progressState,
    
    // 方法
    startLoginProgress,
    completeStep,
    markStepError,
    finishLoginProgress,
    cancelLoginProgress,
    resetLoginProgress,
    setProgressBarRef,
    
    // 查询方法
    getCurrentStep,
    getCompletedStepsCount,
    isStepCompleted,
    getStepError,
    
    // 测试方法
    simulateLoginSteps
  }
}

// 创建全局实例
export const globalLoginProgress = useLoginProgress()