<template>
  <div v-if="visible" class="error-display" :class="errorClass">
    <div class="error-content">
      <div class="error-icon">
        <svg v-if="error.type === 'network'" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM13 17h-2v-6h2v6zm0-8h-2V7h2v2z"/>
        </svg>
        <svg v-else-if="error.type === 'auth'" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM12 17c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM15.1 8H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
        </svg>
        <svg v-else-if="error.type === 'matrix'" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
        <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
        </svg>
      </div>
      
      <div class="error-details">
        <h4 class="error-title">{{ errorTitle }}</h4>
        <p class="error-message">{{ error.message }}</p>
        
        <div v-if="showDetails" class="error-meta">
          <div class="error-time">
            {{ formatTime(error.timestamp) }}
          </div>
          <div v-if="error.context" class="error-context">
            <details>
              <summary>详细信息</summary>
              <pre>{{ JSON.stringify(error.context, null, 2) }}</pre>
            </details>
          </div>
        </div>
      </div>
      
      <div class="error-actions">
        <button 
          v-if="canRetry" 
          @click="handleRetry" 
          class="retry-btn"
          :disabled="retrying"
        >
          {{ retrying ? '重试中...' : '重试' }}
        </button>
        
        <button @click="handleDismiss" class="dismiss-btn">
          关闭
        </button>
        
        <button 
          v-if="!showDetails" 
          @click="showDetails = true" 
          class="details-btn"
        >
          详情
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { AppErrorType } from '@/utils/errorTypes'

interface Props {
  error: AppErrorType
  visible?: boolean
  canRetry?: boolean
  autoHide?: boolean
  autoHideDelay?: number
}

interface Emits {
  (e: 'retry'): void
  (e: 'dismiss'): void
}

const props = withDefaults(defineProps<Props>(), {
  visible: true,
  canRetry: false,
  autoHide: false,
  autoHideDelay: 5000
})

const emit = defineEmits<Emits>()

const showDetails = ref(false)
const retrying = ref(false)

// 计算错误标题
const errorTitle = computed(() => {
  switch (props.error.type) {
    case 'network':
      return '网络连接错误'
    case 'auth':
      return '认证错误'
    case 'matrix':
      return 'Matrix服务错误'
    case 'performance':
      return '性能问题'
    case 'app':
      return '应用错误'
    default:
      return '未知错误'
  }
})

// 计算错误样式类
const errorClass = computed(() => {
  return [
    `error-${props.error.type}`,
    {
      'error-retrying': retrying.value
    }
  ]
})

// 格式化时间
const formatTime = (timestamp: number): string => {
  return new Date(timestamp).toLocaleString('zh-CN')
}

// 处理重试
const handleRetry = async () => {
  if (retrying.value) return
  
  retrying.value = true
  try {
    emit('retry')
    // 等待一段时间后重置重试状态
    setTimeout(() => {
      retrying.value = false
    }, 2000)
  } catch (error) {
    retrying.value = false
  }
}

// 处理关闭
const handleDismiss = () => {
  emit('dismiss')
}

// 自动隐藏
if (props.autoHide) {
  setTimeout(() => {
    if (props.visible) {
      handleDismiss()
    }
  }, props.autoHideDelay)
}
</script>

<style scoped>
.error-display {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin: 16px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.error-display.error-network {
  border-left: 4px solid #f56565;
}

.error-display.error-auth {
  border-left: 4px solid #ed8936;
}

.error-display.error-matrix {
  border-left: 4px solid #9f7aea;
}

.error-display.error-performance {
  border-left: 4px solid #38b2ac;
}

.error-display.error-app {
  border-left: 4px solid #e53e3e;
}

.error-content {
  display: flex;
  align-items: flex-start;
  padding: 16px;
  gap: 12px;
}

.error-icon {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  color: #718096;
}

.error-display.error-network .error-icon {
  color: #f56565;
}

.error-display.error-auth .error-icon {
  color: #ed8936;
}

.error-display.error-matrix .error-icon {
  color: #9f7aea;
}

.error-display.error-performance .error-icon {
  color: #38b2ac;
}

.error-display.error-app .error-icon {
  color: #e53e3e;
}

.error-details {
  flex: 1;
  min-width: 0;
}

.error-title {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
  color: #2d3748;
}

.error-message {
  margin: 0 0 8px 0;
  color: #4a5568;
  line-height: 1.5;
}

.error-meta {
  font-size: 12px;
  color: #718096;
}

.error-time {
  margin-bottom: 4px;
}

.error-context details {
  margin-top: 8px;
}

.error-context summary {
  cursor: pointer;
  color: #4299e1;
}

.error-context pre {
  margin-top: 4px;
  padding: 8px;
  background: #f7fafc;
  border-radius: 4px;
  font-size: 11px;
  overflow-x: auto;
}

.error-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex-shrink: 0;
}

.retry-btn,
.dismiss-btn,
.details-btn {
  padding: 6px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  background: #fff;
  color: #4a5568;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s ease;
}

.retry-btn:hover {
  background: #4299e1;
  color: #fff;
  border-color: #4299e1;
}

.retry-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.dismiss-btn:hover {
  background: #f7fafc;
  border-color: #cbd5e0;
}

.details-btn:hover {
  background: #f7fafc;
  border-color: #cbd5e0;
}

.error-retrying {
  opacity: 0.8;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .error-content {
    flex-direction: column;
    gap: 8px;
  }
  
  .error-actions {
    flex-direction: row;
    justify-content: flex-end;
  }
}
</style>