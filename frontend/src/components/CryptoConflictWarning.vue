<template>
  <div v-if="showWarning" class="crypto-conflict-warning">
    <el-alert
      :title="warningTitle"
      :type="alertType"
      :closable="false"
      show-icon
    >
      <template #default>
        <div class="warning-content">
          <p class="warning-description">{{ warningDescription }}</p>
          
          <div v-if="conflictSources.length > 0" class="conflict-sources">
            <p><strong>检测到的冲突源:</strong></p>
            <ul>
              <li v-for="source in conflictSources" :key="source">
                {{ getSourceDescription(source) }}
              </li>
            </ul>
          </div>

          <div v-if="recommendations.length > 0" class="recommendations">
            <p><strong>建议:</strong></p>
            <ul>
              <li v-for="recommendation in recommendations" :key="recommendation">
                {{ recommendation }}
              </li>
            </ul>
          </div>

          <div class="warning-actions">
            <el-button 
              type="primary" 
              size="small"
              @click="handleResolveConflict"
              :loading="resolving"
            >
              自动解决冲突
            </el-button>
            <el-button 
              type="default" 
              size="small"
              @click="showDetails = !showDetails"
            >
              {{ showDetails ? '隐藏详情' : '查看详情' }}
            </el-button>
            <el-button 
              type="text" 
              size="small"
              @click="dismissWarning"
            >
              暂时忽略
            </el-button>
          </div>

          <div v-if="showDetails" class="conflict-details">
            <el-divider />
            <h4>技术详情</h4>
            <div class="detail-item">
              <strong>风险级别:</strong> 
              <el-tag :type="riskLevelType" size="small">{{ riskLevelText }}</el-tag>
            </div>
            <div class="detail-item">
              <strong>当前设备ID:</strong> 
              <code>{{ currentDeviceId }}</code>
            </div>
            <div class="detail-item">
              <strong>存储模式:</strong> 
              {{ storageMode }}
            </div>
            <div class="detail-item">
              <strong>检测时间:</strong> 
              {{ detectionTime }}
            </div>
          </div>
        </div>
      </template>
    </el-alert>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { cryptoConflictManager, type ConflictDetectionResult } from '@/utils/cryptoConflictManager'
import { useMatrixStore } from '@/stores/matrix'

// Props
interface Props {
  autoDetect?: boolean
  showOnMount?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  autoDetect: true,
  showOnMount: true
})

// Emits
const emit = defineEmits<{
  conflictDetected: [result: ConflictDetectionResult]
  conflictResolved: []
  warningDismissed: []
}>()

// Store
const matrixStore = useMatrixStore()

// 响应式数据
const showWarning = ref(false)
const showDetails = ref(false)
const resolving = ref(false)
const conflictResult = ref<ConflictDetectionResult | null>(null)
const detectionTime = ref<string>('')

// 计算属性
const warningTitle = computed(() => {
  if (!conflictResult.value) return ''
  
  switch (conflictResult.value.riskLevel) {
    case 'high':
      return '⚠️ 检测到高风险加密冲突'
    case 'medium':
      return '⚠️ 检测到加密冲突'
    case 'low':
      return 'ℹ️ 检测到潜在加密冲突'
    default:
      return '检测到加密冲突'
  }
})

const warningDescription = computed(() => {
  if (!conflictResult.value) return ''
  
  const sourceCount = conflictResult.value.conflictingSources.length
  return `检测到 ${sourceCount} 个潜在的Matrix客户端冲突源。这可能会影响端到端加密的正常工作。`
})

const alertType = computed(() => {
  if (!conflictResult.value) return 'info'
  
  switch (conflictResult.value.riskLevel) {
    case 'high':
      return 'error'
    case 'medium':
      return 'warning'
    case 'low':
      return 'info'
    default:
      return 'info'
  }
})

const riskLevelType = computed(() => {
  if (!conflictResult.value) return 'info'
  
  switch (conflictResult.value.riskLevel) {
    case 'high':
      return 'danger'
    case 'medium':
      return 'warning'
    case 'low':
      return 'info'
    default:
      return 'info'
  }
})

const riskLevelText = computed(() => {
  if (!conflictResult.value) return '未知'
  
  switch (conflictResult.value.riskLevel) {
    case 'high':
      return '高风险'
    case 'medium':
      return '中等风险'
    case 'low':
      return '低风险'
    default:
      return '未知'
  }
})

const conflictSources = computed(() => {
  return conflictResult.value?.conflictingSources || []
})

const recommendations = computed(() => {
  if (!conflictResult.value) return []
  return cryptoConflictManager.getConflictResolutionAdvice(conflictResult.value)
})

const currentDeviceId = computed(() => {
  return matrixStore.matrixClient?.getDeviceId() || '未知'
})

const storageMode = computed(() => {
  // 这里可以根据实际的存储配置来显示
  return '自动选择'
})

// 方法
const detectConflicts = () => {
  console.log('🔍 检测加密冲突...')
  const result = cryptoConflictManager.detectConflicts()
  
  if (result.hasConflicts) {
    conflictResult.value = result
    showWarning.value = true
    detectionTime.value = new Date().toLocaleString()
    
    emit('conflictDetected', result)
    
    console.warn('⚠️ 检测到加密冲突:', result)
  } else {
    console.log('✅ 未检测到加密冲突')
  }
}

const handleResolveConflict = async () => {
  if (!conflictResult.value) return
  
  try {
    await ElMessageBox.confirm(
      '这将清理冲突的存储数据并重新初始化加密设置。此操作可能需要重新验证设备。是否继续？',
      '解决加密冲突',
      {
        confirmButtonText: '继续',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    resolving.value = true
    
    // 清理冲突
    const userId = matrixStore.matrixClient?.getUserId()
    if (userId) {
      await cryptoConflictManager.cleanupConflicts(userId)
    }
    
    ElMessage.success('冲突已解决，建议刷新页面以重新初始化')
    
    showWarning.value = false
    emit('conflictResolved')
    
  } catch (error) {
    if (error !== 'cancel') {
      console.error('解决冲突失败:', error)
      ElMessage.error('解决冲突失败')
    }
  } finally {
    resolving.value = false
  }
}

const dismissWarning = () => {
  showWarning.value = false
  emit('warningDismissed')
}

const getSourceDescription = (source: string): string => {
  const descriptions: Record<string, string> = {
    'localStorage': '浏览器本地存储中的其他Matrix客户端数据',
    'IndexedDB': '浏览器数据库中的其他Matrix客户端数据',
    'Element': 'Element客户端',
    '其他Web客户端': '其他Web Matrix客户端'
  }
  
  return descriptions[source] || source
}

// 生命周期
onMounted(() => {
  if (props.autoDetect && props.showOnMount) {
    // 延迟检测，确保Matrix客户端已初始化
    setTimeout(detectConflicts, 1000)
  }
})

// 暴露方法给父组件
defineExpose({
  detectConflicts,
  dismissWarning
})
</script>

<style scoped>
.crypto-conflict-warning {
  margin-bottom: 20px;
}

.warning-content {
  line-height: 1.6;
}

.warning-description {
  margin-bottom: 16px;
  color: #606266;
}

.conflict-sources,
.recommendations {
  margin-bottom: 16px;
}

.conflict-sources ul,
.recommendations ul {
  margin: 8px 0 0 20px;
  padding: 0;
}

.conflict-sources li,
.recommendations li {
  margin-bottom: 4px;
  color: #606266;
}

.warning-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 16px;
}

.conflict-details {
  margin-top: 16px;
}

.conflict-details h4 {
  margin: 0 0 12px 0;
  color: #303133;
  font-size: 14px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 13px;
}

.detail-item strong {
  min-width: 80px;
  color: #606266;
}

.detail-item code {
  background: #f5f7fa;
  padding: 2px 6px;
  border-radius: 3px;
  font-family: 'Courier New', monospace;
  font-size: 12px;
}
</style>
