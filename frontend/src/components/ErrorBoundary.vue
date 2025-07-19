<template>
  <div class="error-boundary">
    <div v-if="hasError" class="error-boundary-content">
      <ErrorDisplay 
        :error="currentError" 
        :can-retry="true"
        @retry="handleRetry"
        @dismiss="handleDismiss"
      />
      
      <div v-if="showFallback" class="error-fallback">
        <div class="fallback-content">
          <h3>组件暂时不可用</h3>
          <p>我们正在努力修复这个问题，请稍后再试。</p>
          <button @click="handleRetry" class="fallback-retry-btn">
            重新加载
          </button>
        </div>
      </div>
    </div>
    
    <slot v-else />
  </div>
</template>

<script setup lang="ts">
import { ref, onErrorCaptured, nextTick } from 'vue'
import ErrorDisplay from './ErrorDisplay.vue'
import { useErrorHandler } from '@/utils/errorSetup'
import type { AppError } from '@/utils/errorTypes'

interface Props {
  fallbackComponent?: any
  showFallback?: boolean
  maxRetries?: number
}

const props = withDefaults(defineProps<Props>(), {
  showFallback: true,
  maxRetries: 3
})

const { handleAppError } = useErrorHandler()

const hasError = ref(false)
const currentError = ref<AppError | null>(null)
const retryCount = ref(0)

// 捕获子组件错误
onErrorCaptured((error: Error, instance: any, info: string) => {
  console.error('ErrorBoundary caught error:', error, info)
  
  const appError: Partial<AppError> = {
    message: error.message,
    componentName: instance?.$options?.name || instance?.$options?.__name || 'Unknown',
    stack: error.stack,
    context: {
      info,
      componentProps: instance?.$props,
      componentData: instance?.$data,
      retryCount: retryCount.value
    },
    isRecoverable: retryCount.value < props.maxRetries
  }
  
  // 使用错误处理器处理错误
  handleAppError(appError)
  
  // 设置当前错误状态
  currentError.value = {
    id: `boundary_${Date.now()}`,
    type: 'app',
    timestamp: Date.now(),
    ...appError
  } as AppError
  
  hasError.value = true
  
  // 阻止错误继续向上传播
  return false
})

// 处理重试
const handleRetry = async () => {
  if (retryCount.value >= props.maxRetries) {
    console.warn('Max retries reached, giving up')
    return
  }
  
  retryCount.value++
  hasError.value = false
  currentError.value = null
  
  // 等待下一个tick，让组件重新渲染
  await nextTick()
  
  console.log(`Retrying component render (attempt ${retryCount.value})`)
}

// 处理关闭错误显示
const handleDismiss = () => {
  hasError.value = false
  currentError.value = null
}

// 重置错误状态（供外部调用）
const reset = () => {
  hasError.value = false
  currentError.value = null
  retryCount.value = 0
}

// 暴露方法给父组件
defineExpose({
  reset,
  hasError: () => hasError.value,
  getCurrentError: () => currentError.value
})
</script>

<style scoped>
.error-boundary {
  width: 100%;
  height: 100%;
}

.error-boundary-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  padding: 20px;
}

.error-fallback {
  margin-top: 20px;
  text-align: center;
}

.fallback-content {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 24px;
  max-width: 400px;
}

.fallback-content h3 {
  margin: 0 0 12px 0;
  color: #495057;
  font-size: 18px;
}

.fallback-content p {
  margin: 0 0 16px 0;
  color: #6c757d;
  line-height: 1.5;
}

.fallback-retry-btn {
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s ease;
}

.fallback-retry-btn:hover {
  background: #0056b3;
}

.fallback-retry-btn:active {
  transform: translateY(1px);
}
</style>