<template>
  <div v-if="showIndicator" class="network-status-indicator" :class="statusClass">
    <div class="status-icon">
      <svg v-if="status.isOnline" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.07 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z"/>
      </svg>
      <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M24.24 2.76l-2.12-2.12L18 4.77C16.17 3.64 14.15 3 12 3 8.5 3 5.42 4.4 3.11 6.71l1.41 1.41C6.28 6.36 8.97 5.5 12 5.5c1.66 0 3.22.46 4.55 1.26L2.76 20.55l2.12 2.12L24.24 2.76zM3.9 8.9C2.66 10.14 2 11.5 2 13c0 .55.45 1 1 1s1-.45 1-1c0-.83.33-1.58.88-2.12L3.9 8.9zm4.95 4.95C7.63 14.07 7 14.97 7 16c0 .55.45 1 1 1s1-.45 1-1c0-.28.11-.53.29-.71l-.44-.44zm4.24 4.24C12.72 17.72 12.37 17.5 12 17.5s-.72.22-1.09.59L12 19.18l1.09-1.09z"/>
      </svg>
    </div>
    
    <div class="status-content">
      <div class="status-text">{{ statusText }}</div>
      <div v-if="showDetails" class="status-details">
        <span class="connection-type">{{ connectionTypeText }}</span>
        <span v-if="status.rtt > 0" class="rtt">{{ status.rtt }}ms</span>
      </div>
    </div>
    
    <button v-if="!status.isOnline" @click="retry" class="retry-button">
      重试
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { useNetworkStatus } from '@/utils/networkStatusMonitor'

interface Props {
  showWhenOnline?: boolean
  showDetails?: boolean
  autoHide?: boolean
  autoHideDelay?: number
}

const props = withDefaults(defineProps<Props>(), {
  showWhenOnline: false,
  showDetails: true,
  autoHide: true,
  autoHideDelay: 3000
})

const { status, getQuality, getQualityDescription, checkNow, unsubscribe } = useNetworkStatus()

// 计算是否显示指示器
const showIndicator = computed(() => {
  if (!status.value.isOnline) return true
  if (props.showWhenOnline) return true
  if (status.value.consecutiveFailures > 0) return true
  return false
})

// 计算状态样式类
const statusClass = computed(() => {
  const quality = getQuality()
  return [
    `status-${quality}`,
    {
      'status-offline': !status.value.isOnline,
      'status-unstable': status.value.consecutiveFailures > 0
    }
  ]
})

// 计算状态文本
const statusText = computed(() => {
  if (!status.value.isOnline) {
    return '网络连接断开'
  }
  
  if (status.value.consecutiveFailures > 0) {
    return '网络连接不稳定'
  }
  
  return getQualityDescription()
})

// 计算连接类型文本
const connectionTypeText = computed(() => {
  if (!status.value.isOnline) return ''
  
  const type = status.value.effectiveType
  switch (type) {
    case '4g': return '4G'
    case '3g': return '3G'
    case '2g': return '2G'
    case 'slow-2g': return '慢速2G'
    case 'wifi': return 'WiFi'
    case 'ethernet': return '以太网'
    default: return type || '未知'
  }
})

// 重试连接
const retry = async () => {
  console.log('🔄 手动检查网络连接...')
  try {
    await checkNow()
  } catch (error) {
    console.error('网络检查失败:', error)
  }
}

// 自动隐藏逻辑
let autoHideTimer: number | null = null

const setupAutoHide = () => {
  if (autoHideTimer) {
    clearTimeout(autoHideTimer)
  }
  
  if (props.autoHide && status.value.isOnline && status.value.consecutiveFailures === 0) {
    autoHideTimer = window.setTimeout(() => {
      // 这里可以添加隐藏逻辑，或者让父组件处理
    }, props.autoHideDelay)
  }
}

// 监听状态变化
const watchStatus = () => {
  setupAutoHide()
}

onMounted(() => {
  // 初始设置
  setupAutoHide()
})

onUnmounted(() => {
  unsubscribe()
  if (autoHideTimer) {
    clearTimeout(autoHideTimer)
  }
})

// 监听状态变化
status.value && watchStatus()
</script>

<style scoped>
.network-status-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 12px;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.status-excellent {
  background: rgba(76, 175, 80, 0.1);
  color: #4CAF50;
  border-color: rgba(76, 175, 80, 0.3);
}

.status-good {
  background: rgba(139, 195, 74, 0.1);
  color: #8BC34A;
  border-color: rgba(139, 195, 74, 0.3);
}

.status-fair {
  background: rgba(255, 193, 7, 0.1);
  color: #FFC107;
  border-color: rgba(255, 193, 7, 0.3);
}

.status-poor {
  background: rgba(255, 152, 0, 0.1);
  color: #FF9800;
  border-color: rgba(255, 152, 0, 0.3);
}

.status-offline {
  background: rgba(244, 67, 54, 0.1);
  color: #F44336;
  border-color: rgba(244, 67, 54, 0.3);
}

.status-unstable {
  background: rgba(255, 152, 0, 0.1);
  color: #FF9800;
  border-color: rgba(255, 152, 0, 0.3);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.status-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.status-content {
  flex: 1;
  min-width: 0;
}

.status-text {
  font-weight: 500;
  line-height: 1.2;
}

.status-details {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 2px;
  opacity: 0.8;
  font-size: 11px;
}

.connection-type,
.rtt {
  background: rgba(255, 255, 255, 0.1);
  padding: 1px 4px;
  border-radius: 3px;
}

.retry-button {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: inherit;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.retry-button:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.3);
}

.retry-button:active {
  transform: translateY(1px);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .network-status-indicator {
    font-size: 11px;
    padding: 6px 10px;
    gap: 6px;
  }
  
  .status-details {
    font-size: 10px;
    gap: 6px;
  }
  
  .retry-button {
    font-size: 10px;
    padding: 3px 6px;
  }
}
</style>