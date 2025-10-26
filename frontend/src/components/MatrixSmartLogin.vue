<template>
  <div class="matrix-smart-login">
    <!-- 快速登录模式指示器 -->
    <div v-if="showOptimizationStatus" class="optimization-status">
      <div class="status-indicator" :class="optimizationStatusClass">
        <span class="status-dot"></span>
        {{ optimizationStatusText }}
      </div>
      <button 
        v-if="canToggleOptimization" 
        @click="toggleOptimization" 
        class="toggle-btn"
      >
        {{ optimizationEnabled ? '禁用优化' : '启用优化' }}
      </button>
    </div>

    <!-- 登录表单 -->
    <div class="login-form">
      <div class="form-group">
        <label for="username">用户名</label>
        <input
          id="username"
          v-model="username"
          type="text"
          placeholder="输入Matrix用户名"
          :disabled="loading"
          @keyup.enter="handleLogin"
        />
      </div>
      
      <div class="form-group">
        <label for="password">密码</label>
        <input
          id="password"
          v-model="password"
          type="password"
          placeholder="输入密码"
          :disabled="loading"
          @keyup.enter="handleLogin"
        />
      </div>
      
      <button 
        @click="handleLogin" 
        :disabled="loading || !canLogin"
        class="login-btn"
        :class="{ 'quick-mode': isQuickMode }"
      >
        <span v-if="loading" class="loading-spinner"></span>
        {{ loginButtonText }}
      </button>
    </div>

    <!-- 登录进度 -->
    <div v-if="loading" class="login-progress">
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
      </div>
      <div class="progress-text">{{ progressText }}</div>
      
      <!-- 性能指标 -->
      <div v-if="showPerformanceMetrics" class="performance-metrics">
        <div v-if="metrics.quickLoginTime > 0" class="metric">
          快速登录: {{ metrics.quickLoginTime.toFixed(0) }}ms
        </div>
        <div v-if="metrics.totalOptimizationSaved > 0" class="metric saved">
          节省时间: {{ metrics.totalOptimizationSaved.toFixed(0) }}ms
        </div>
      </div>
    </div>

    <!-- 错误信息 -->
    <div v-if="error" class="error-message">
      {{ error }}
      <button @click="clearError" class="clear-error">×</button>
    </div>

    <!-- 调试信息 (仅开发环境) -->
    <div v-if="isDev && showDebugInfo" class="debug-info">
      <h4>调试信息</h4>
      <pre>{{ debugInfo }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMatrixProgressiveOptimization } from '../stores/matrix-progressive-optimization'
import { useMatrixV39Store } from '../stores/matrix-v39-clean'

// ==================== Props & Emits ====================

interface Props {
  showOptimizationStatus?: boolean
  canToggleOptimization?: boolean
  showPerformanceMetrics?: boolean
  showDebugInfo?: boolean
  autoRedirect?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showOptimizationStatus: true,
  canToggleOptimization: true,
  showPerformanceMetrics: true,
  showDebugInfo: false,
  autoRedirect: true
})

const emit = defineEmits<{
  loginSuccess: [user: any, mode: 'quick' | 'full']
  loginError: [error: string]
  optimizationToggled: [enabled: boolean]
}>()

// ==================== Stores & Router ====================

const router = useRouter()
const optimizationStore = useMatrixProgressiveOptimization()
const matrixV39Store = useMatrixV39Store()

// ==================== 响应式状态 ====================

const username = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')
const loginAttemptCount = ref(0)

// 环境检测
const isDev = import.meta.env.DEV

// ==================== 计算属性 ====================

const canLogin = computed(() => {
  return username.value.trim() && password.value.trim()
})

const optimizationEnabled = computed(() => optimizationStore.optimizationEnabled)
const isQuickMode = computed(() => optimizationStore.isQuickMode)
const loadingStage = computed(() => optimizationStore.loadingStage)
const metrics = computed(() => optimizationStore.performanceMetrics)

const optimizationStatusClass = computed(() => {
  if (!optimizationEnabled.value) return 'disabled'
  if (isQuickMode.value) return 'quick-mode'
  return 'enabled'
})

const optimizationStatusText = computed(() => {
  if (!optimizationEnabled.value) return '标准模式'
  if (isQuickMode.value) return '快速模式'
  return '优化模式'
})

const loginButtonText = computed(() => {
  if (loading.value) {
    switch (loadingStage.value) {
      case 'quick-auth': return '快速验证中...'
      case 'basic-sync': return '基础同步中...'
      case 'full-sync': return '完整同步中...'
      default: return '登录中...'
    }
  }
  
  if (optimizationEnabled.value) {
    return '快速登录'
  }
  
  return '登录'
})

const progressPercentage = computed(() => {
  switch (loadingStage.value) {
    case 'quick-auth': return 25
    case 'basic-sync': return 50
    case 'full-sync': return 75
    case 'complete': return 100
    default: return 0
  }
})

const progressText = computed(() => {
  switch (loadingStage.value) {
    case 'quick-auth': return '验证登录凭据...'
    case 'basic-sync': return '获取基础数据...'
    case 'full-sync': return '同步完整数据...'
    case 'complete': return '登录完成'
    default: return '准备登录...'
  }
})

const debugInfo = computed(() => {
  const stats = optimizationStore.getOptimizationStats()
  return JSON.stringify({
    optimizationEnabled: optimizationEnabled.value,
    quickMode: isQuickMode.value,
    stage: loadingStage.value,
    metrics: metrics.value,
    loginAttempts: loginAttemptCount.value,
    redundancy: stats.redundancy,
    cacheInfo: {
      size: stats.cacheSize,
      valid: stats.cacheValid
    }
  }, null, 2)
})

// ==================== 核心登录逻辑 ====================

/**
 * 智能登录处理 - 自动选择最佳登录方式
 */
const handleLogin = async () => {
  if (loading.value || !canLogin.value) return
  
  try {
    loading.value = true
    error.value = ''
    loginAttemptCount.value++
    
    console.log('🔄 [智能登录] 开始登录流程...')
    
    // 策略1: 尝试快速登录（如果优化启用）
    if (optimizationEnabled.value) {
      const quickResult = await attemptQuickLogin()
      if (quickResult.success) {
        await handleQuickLoginSuccess(quickResult)
        return
      }
      
      // 快速登录失败，记录原因并继续标准流程
      console.warn('⚠️ [智能登录] 快速登录失败，使用标准流程:', quickResult.reason)
    }
    
    // 策略2: 使用原有的完整登录流程
    await attemptFullLogin()
    
  } catch (err: any) {
    console.error('❌ [智能登录] 登录失败:', err)
    error.value = err.message || '登录失败，请重试'
    emit('loginError', error.value)
  } finally {
    loading.value = false
  }
}

/**
 * 尝试冗余快速登录
 */
const attemptQuickLogin = async () => {
  try {
    console.log('🚀 [智能登录] 启动冗余快速登录...')
    
    // 先进行健康检查
    const healthStatus = await optimizationStore.performHealthCheck()
    console.log(`📊 [智能登录] 系统健康度: ${healthStatus.redundancyLevel}/6`)
    
    // 如果健康度太低，先尝试自动修复
    if (healthStatus.redundancyLevel < 2) {
      console.log('🔧 [智能登录] 系统健康度低，尝试自动修复...')
      const repairResult = await optimizationStore.autoRepairSystem()
      if (repairResult.repaired) {
        console.log(`✅ [智能登录] 自动修复完成: ${repairResult.actions.join(', ')}`)
      }
    }
    
    // 执行冗余登录
    const result = await optimizationStore.quickLogin(username.value, password.value)
    
    if (result.success) {
      console.log(`✅ [智能登录] 冗余登录成功，方法: ${result.method}`)
      return result
    }
    
    console.warn(`⚠️ [智能登录] 冗余登录失败，尝试了 ${result.attempts || 0} 个服务器`)
    return { success: false, reason: result.error || 'unknown', attempts: result.attempts }
    
  } catch (error) {
    console.error('❌ [智能登录] 冗余登录异常:', error)
    return { success: false, reason: 'exception', error }
  }
}

/**
 * 处理快速登录成功
 */
const handleQuickLoginSuccess = async (result: any) => {
  try {
    console.log('🎉 [智能登录] 快速登录成功，启动渐进式初始化...')
    
    // 触发渐进式初始化（异步，不阻塞跳转）
    optimizationStore.progressiveInitialize()
    
    // 立即跳转，提供快速体验
    emit('loginSuccess', result.user, 'quick')
    
    if (props.autoRedirect) {
      console.log('🔄 [智能登录] 快速跳转到聊天页面...')
      await router.push('/chat')
    }
    
  } catch (error) {
    console.warn('⚠️ [智能登录] 快速登录后处理失败:', error)
    // 即使后处理失败，登录仍然成功
  }
}

/**
 * 尝试完整登录（原有流程）
 */
const attemptFullLogin = async () => {
  try {
    console.log('🔄 [智能登录] 使用标准登录流程...')
    
    // 使用原有的 matrix-v39-clean store
    const result = await matrixV39Store.login(username.value, password.value)
    
    if (result.success) {
      console.log('✅ [智能登录] 标准登录成功')
      
      emit('loginSuccess', result.user, 'full')
      
      if (props.autoRedirect) {
        console.log('🔄 [智能登录] 跳转到聊天页面...')
        await router.push('/chat')
      }
    } else {
      throw new Error(result.error || '标准登录失败')
    }
    
  } catch (error) {
    console.error('❌ [智能登录] 标准登录失败:', error)
    throw error
  }
}

// ==================== 优化控制 ====================

/**
 * 切换优化模式
 */
const toggleOptimization = () => {
  const newState = !optimizationEnabled.value
  optimizationStore.toggleOptimization(newState)
  emit('optimizationToggled', newState)
  
  console.log(`🔧 [智能登录] 优化模式${newState ? '启用' : '禁用'}`)
}

/**
 * 清理错误
 */
const clearError = () => {
  error.value = ''
}

// ==================== 生命周期 ====================

onMounted(() => {
  console.log('🔧 [智能登录] 组件初始化完成')
  
  // 检查是否已有登录状态
  const hasToken = localStorage.getItem('matrix_access_token')
  const hasQuickAuth = localStorage.getItem('matrix-quick-auth')
  
  if (hasToken || hasQuickAuth) {
    console.log('🔍 [智能登录] 检测到已有登录状态')
  }
})

// ==================== 监听器 ====================

// 监听优化状态变化
watch(optimizationEnabled, (enabled) => {
  console.log(`🔧 [智能登录] 优化状态变更: ${enabled}`)
})

// 监听加载阶段变化
watch(loadingStage, (stage) => {
  console.log(`📊 [智能登录] 加载阶段: ${stage}`)
})
</script>

<style scoped>
.matrix-smart-login {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

/* 优化状态指示器 */
.optimization-status {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 10px;
  background: #f5f5f5;
  border-radius: 6px;
  font-size: 14px;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ccc;
}

.status-indicator.enabled .status-dot {
  background: #4CAF50;
}

.status-indicator.quick-mode .status-dot {
  background: #2196F3;
  animation: pulse 1.5s infinite;
}

.status-indicator.disabled .status-dot {
  background: #999;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.toggle-btn {
  padding: 4px 8px;
  font-size: 12px;
  border: 1px solid #ddd;
  background: #fff;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.toggle-btn:hover {
  background: #f0f0f0;
}

/* 登录表单 */
.login-form {
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  color: #333;
}

.form-group input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: #2196F3;
}

.form-group input:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
}

.login-btn {
  width: 100%;
  padding: 12px;
  background: #2196F3;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.login-btn:hover:not(:disabled) {
  background: #1976D2;
}

.login-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.login-btn.quick-mode {
  background: linear-gradient(45deg, #2196F3, #4CAF50);
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 登录进度 */
.login-progress {
  margin-bottom: 20px;
}

.progress-bar {
  width: 100%;
  height: 4px;
  background: #f0f0f0;
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #2196F3, #4CAF50);
  transition: width 0.3s ease;
}

.progress-text {
  text-align: center;
  font-size: 14px;
  color: #666;
  margin-bottom: 10px;
}

.performance-metrics {
  display: flex;
  justify-content: center;
  gap: 16px;
  font-size: 12px;
  color: #888;
}

.metric.saved {
  color: #4CAF50;
  font-weight: 500;
}

/* 错误信息 */
.error-message {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background: #ffebee;
  color: #c62828;
  border-radius: 4px;
  margin-bottom: 16px;
  font-size: 14px;
}

.clear-error {
  background: none;
  border: none;
  color: #c62828;
  font-size: 18px;
  cursor: pointer;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 调试信息 */
.debug-info {
  margin-top: 20px;
  padding: 10px;
  background: #f5f5f5;
  border-radius: 4px;
  font-size: 12px;
}

.debug-info h4 {
  margin: 0 0 10px 0;
  font-size: 14px;
  color: #666;
}

.debug-info pre {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
  color: #333;
}
</style>