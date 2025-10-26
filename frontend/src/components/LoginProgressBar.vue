<template>
  <!-- 顶部进度通知条 - 完全不阻塞用户操作 -->
  <div v-if="isVisible" class="top-progress-bar">
    <!-- 主进度条容器 -->
    <div class="progress-container">
      <!-- 左侧图标和标题 -->
      <div class="progress-header">
        <div class="progress-icon">💬</div>
        <div class="progress-title-text">
          <div class="main-title">正在登录聊天系统</div>
          <div class="sub-title">{{ currentMessage }}</div>
        </div>
      </div>
      
      <!-- 右侧进度信息 -->
      <div class="progress-info-right">
        <div class="progress-percentage">{{ Math.round(progress) }}%</div>
        <div class="progress-status">{{ getCompletedStepsCount() }}/{{ detailedStatuses.length }}</div>
      </div>
    </div>
    
    <!-- 进度条 -->
    <div class="progress-bar-container">
      <div class="progress-bar">
        <div 
          class="progress-fill" 
          :style="{ width: `${progress}%` }"
        ></div>
        <div class="progress-shine"></div>
      </div>
    </div>
    
    <!-- 详细状态信息 -->
    <div class="progress-details">
      <div class="current-detail">{{ currentDetails }}</div>
      <div class="status-indicators">
        <div 
          v-for="status in detailedStatuses.slice(0, 6)" 
          :key="status.id"
          class="status-dot"
          :class="{ 
            completed: status.completed, 
            current: status.current,
            pending: !status.completed && !status.current 
          }"
          :title="status.text"
        >
          <span v-if="status.completed">✓</span>
          <span v-else-if="status.current">●</span>
          <span v-else>○</span>
        </div>
        <div class="more-status" v-if="detailedStatuses.length > 6">
          +{{ detailedStatuses.length - 6 }}
        </div>
      </div>
    </div>
    
    <!-- 底部提示 -->
    <div class="progress-tip">
      <span class="tip-text">{{ currentTip }}</span>
      <div class="loading-dots">
        <span class="dot"></span>
        <span class="dot"></span>
        <span class="dot"></span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

interface Props {
  visible?: boolean
  showOverlay?: boolean
  autoHide?: boolean
  maxDuration?: number // 最大持续时间（毫秒）
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  showOverlay: false,
  autoHide: true,
  maxDuration: 20000 // 20秒兜底
})

const emit = defineEmits<{
  complete: []
  step: [step: number, message: string]
}>()

// 进度状态
const progress = ref(0)
const currentStep = ref(0)
const isVisible = ref(props.visible)
const completedSteps = ref(0)

// 进度步骤定义 - 更多细节给用户安全感
const progressSteps = [
  { 
    id: 1, 
    message: '正在验证用户身份', 
    details: '检查登录凭据和权限设置',
    minProgress: 0, 
    maxProgress: 25 
  },
  { 
    id: 2, 
    message: '正在连接聊天服务器', 
    details: '建立安全连接并同步用户数据',
    minProgress: 25, 
    maxProgress: 50 
  },
  { 
    id: 3, 
    message: '正在加载聊天记录', 
    details: '获取最新消息和群组信息',
    minProgress: 50, 
    maxProgress: 75 
  },
  { 
    id: 4, 
    message: '正在完成初始化', 
    details: '优化界面显示和功能配置',
    minProgress: 75, 
    maxProgress: 100 
  }
]

// 详细状态列表 - 给用户更多信息
const detailedStatuses = ref([
  { id: 1, text: '验证用户登录凭据', completed: false, current: false },
  { id: 2, text: '检查账户安全状态', completed: false, current: false },
  { id: 3, text: '连接Matrix聊天服务器', completed: false, current: false },
  { id: 4, text: '同步用户个人资料', completed: false, current: false },
  { id: 5, text: '获取好友和群组列表', completed: false, current: false },
  { id: 6, text: '加载最近聊天记录', completed: false, current: false },
  { id: 7, text: '初始化消息推送服务', completed: false, current: false },
  { id: 8, text: '配置界面显示设置', completed: false, current: false },
  { id: 9, text: '检查系统更新状态', completed: false, current: false },
  { id: 10, text: '完成登录流程', completed: false, current: false }
])

// 提示文字轮换
const tips = [
  '正在为您准备最佳的聊天体验...',
  '安全连接已建立，数据传输加密保护',
  '正在同步您的聊天记录和联系人',
  '即将完成，感谢您的耐心等待',
  '系统正在优化性能以提供流畅体验',
  '正在加载您的个性化设置',
  '检查网络连接状态和服务器响应',
  '准备就绪，马上就能开始聊天了'
]

const currentTip = ref(tips[0])
let tipIndex = 0

const currentMessage = computed(() => {
  const step = progressSteps[currentStep.value]
  return step ? step.message : '正在初始化系统...'
})

const currentDetails = computed(() => {
  const step = progressSteps[currentStep.value]
  return step ? step.details : '请稍候，系统正在准备中'
})

// 获取完成的步骤数
const getCompletedStepsCount = () => {
  return detailedStatuses.value.filter(s => s.completed).length
}

// 计时器
let fallbackTimer: NodeJS.Timeout | null = null
let stepTimer: NodeJS.Timeout | null = null
let tipTimer: NodeJS.Timeout | null = null
let statusTimer: NodeJS.Timeout | null = null

// 启动进度条
const start = () => {
  console.log('🚀 启动登录进度条')
  isVisible.value = true
  progress.value = 0
  currentStep.value = 0
  completedSteps.value = 0

  // 重置详细状态
  detailedStatuses.value.forEach(status => {
    status.completed = false
    status.current = false
  })

  // 启动兜底计时器（平滑推进到95%）
  startFallbackProgress()
  
  // 启动提示文字轮换
  startTipRotation()
  
  // 启动详细状态模拟
  startDetailedStatusSimulation()
}

// 兜底进度推进
const startFallbackProgress = () => {
  if (fallbackTimer) {
    clearInterval(fallbackTimer)
  }

  fallbackTimer = setInterval(() => {
    if (progress.value < 95) {
      // 更缓慢推进，适应20秒的时长
      const increment = Math.random() * 0.3 + 0.1 // 0.1-0.4的随机增量，更慢
      progress.value = Math.min(progress.value + increment, 95)
    }
  }, 150) // 每150ms更新一次，更慢的更新频率

  // 最大时长后强制完成
  setTimeout(() => {
    if (progress.value < 100) {
      console.log('⏰ 进度条兜底时间到，强制完成')
      completeStep(4) // 强制完成最后一步
    }
  }, props.maxDuration)
}

// 完成某个步骤
const completeStep = (stepId: number) => {
  const stepIndex = stepId - 1
  if (stepIndex < 0 || stepIndex >= progressSteps.length) return

  const step = progressSteps[stepIndex]
  console.log(`✅ 完成步骤 ${stepId}: ${step.message}`)

  // 更新当前步骤
  currentStep.value = Math.max(currentStep.value, stepIndex)
  completedSteps.value = Math.max(completedSteps.value, stepId)

  // 平滑更新进度到目标值
  const targetProgress = step.maxProgress
  smoothUpdateProgress(targetProgress)

  // 发出步骤完成事件
  emit('step', stepId, step.message)

  // 如果是最后一步，准备完成
  if (stepId === progressSteps.length) {
    setTimeout(() => {
      complete()
    }, 300) // 短暂延迟让用户看到100%
  }
}

// 平滑更新进度
const smoothUpdateProgress = (targetProgress: number) => {
  if (stepTimer) {
    clearInterval(stepTimer)
  }

  const startProgress = progress.value
  const duration = 500 // 500ms内完成动画
  const startTime = Date.now()

  stepTimer = setInterval(() => {
    const elapsed = Date.now() - startTime
    const ratio = Math.min(elapsed / duration, 1)
    
    // 使用缓动函数让动画更自然
    const easeOutQuart = 1 - Math.pow(1 - ratio, 4)
    progress.value = startProgress + (targetProgress - startProgress) * easeOutQuart

    if (ratio >= 1) {
      clearInterval(stepTimer!)
      stepTimer = null
      progress.value = targetProgress
    }
  }, 16) // 约60fps
}

// 完成进度条
const complete = () => {
  console.log('🎉 登录进度条完成')
  
  // 停止所有计时器
  stopAllTimers()

  // 确保进度到100%
  progress.value = 100
  
  // 完成所有状态
  detailedStatuses.value.forEach(status => {
    status.completed = true
    status.current = false
  })
  
  // 显示完成提示
  currentTip.value = '登录成功！正在进入聊天界面...'
  
  // 发出完成事件
  emit('complete')

  // 自动隐藏
  if (props.autoHide) {
    setTimeout(() => {
      hide()
    }, 1200) // 让用户看到完成状态
  }
}

// 隐藏进度条
const hide = () => {
  console.log('👋 隐藏登录进度条')
  isVisible.value = false
  
  // 停止所有计时器
  stopAllTimers()
}

// 重置进度条
const reset = () => {
  hide()
  progress.value = 0
  currentStep.value = 0
  completedSteps.value = 0
}

// 手动设置进度（用于特殊情况）
const setProgress = (value: number, message?: string) => {
  progress.value = Math.max(0, Math.min(100, value))
  if (message) {
    // 找到对应的步骤或使用自定义消息
    const step = progressSteps.find(s => value >= s.minProgress && value <= s.maxProgress)
    if (step) {
      currentStep.value = progressSteps.indexOf(step)
    }
  }
}

// 暴露方法给父组件
defineExpose({
  start,
  completeStep,
  complete,
  hide,
  reset,
  setProgress
})

// 提示文字轮换
const startTipRotation = () => {
  if (tipTimer) {
    clearInterval(tipTimer)
  }
  
  tipTimer = setInterval(() => {
    tipIndex = (tipIndex + 1) % tips.length
    currentTip.value = tips[tipIndex]
  }, 2000) // 每2秒换一个提示
}

// 详细状态模拟 - 适应20秒时长
const startDetailedStatusSimulation = () => {
  if (statusTimer) {
    clearInterval(statusTimer)
  }
  
  let statusIndex = 0
  statusTimer = setInterval(() => {
    if (statusIndex < detailedStatuses.value.length) {
      // 完成前一个状态
      if (statusIndex > 0) {
        detailedStatuses.value[statusIndex - 1].completed = true
        detailedStatuses.value[statusIndex - 1].current = false
      }
      
      // 设置当前状态
      if (statusIndex < detailedStatuses.value.length) {
        detailedStatuses.value[statusIndex].current = true
      }
      
      statusIndex++
    }
  }, 1800) // 每1.8秒完成一个状态，总共18秒完成10个状态
}

// 停止所有计时器
const stopAllTimers = () => {
  if (fallbackTimer) {
    clearInterval(fallbackTimer)
    fallbackTimer = null
  }
  if (stepTimer) {
    clearInterval(stepTimer)
    stepTimer = null
  }
  if (tipTimer) {
    clearInterval(tipTimer)
    tipTimer = null
  }
  if (statusTimer) {
    clearInterval(statusTimer)
    statusTimer = null
  }
}

// 清理
onUnmounted(() => {
  stopAllTimers()
})

// 监听props变化
onMounted(() => {
  if (props.visible) {
    start()
  }
})
</script>

<style scoped>
/* 顶部进度通知条 - 完全不阻塞用户操作 */
.top-progress-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 9999;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border-bottom: 1px solid #e9ecef;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  padding: 16px 20px;
  pointer-events: none; /* 不阻塞用户操作 */
  animation: slideDown 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.progress-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.progress-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.progress-icon {
  font-size: 20px;
  animation: iconPulse 2s ease-in-out infinite;
}

.progress-title-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.main-title {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.sub-title {
  font-size: 13px;
  color: #6c757d;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.progress-info-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
}

.progress-percentage {
  font-size: 18px;
  font-weight: 700;
  color: #4CAF50;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.progress-status {
  font-size: 12px;
  color: #6c757d;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.progress-bar-container {
  margin-bottom: 12px;
}

.progress-bar {
  width: 100%;
  height: 6px;
  background: #e9ecef;
  border-radius: 3px;
  overflow: hidden;
  position: relative;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4CAF50, #45a049, #4CAF50);
  background-size: 200% 100%;
  animation: progressFlow 2s ease-in-out infinite;
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 3px;
  position: relative;
}

.progress-shine {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, 
    transparent, 
    rgba(255, 255, 255, 0.4), 
    transparent
  );
  animation: shine 2s ease-in-out infinite;
}

.progress-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.current-detail {
  font-size: 12px;
  color: #6c757d;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  flex: 1;
}

.status-indicators {
  display: flex;
  align-items: center;
  gap: 6px;
}

.status-dot {
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.status-dot.completed {
  background: #4CAF50;
  color: white;
  font-weight: bold;
}

.status-dot.current {
  background: #2196F3;
  color: white;
  animation: currentPulse 1.5s ease-in-out infinite;
}

.status-dot.pending {
  background: #e9ecef;
  color: #bdc3c7;
}

.more-status {
  font-size: 11px;
  color: #6c757d;
  font-weight: 500;
  margin-left: 4px;
}

.progress-tip {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 8px;
  border-top: 1px solid #f1f3f4;
}

.tip-text {
  font-size: 12px;
  color: #6c757d;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  flex: 1;
}

.loading-dots {
  display: flex;
  gap: 3px;
}

.dot {
  width: 4px;
  height: 4px;
  background: #4CAF50;
  border-radius: 50%;
  animation: dotBounce 1.4s ease-in-out infinite both;
}

.dot:nth-child(1) { animation-delay: -0.32s; }
.dot:nth-child(2) { animation-delay: -0.16s; }
.dot:nth-child(3) { animation-delay: 0s; }

/* 动画定义 */
@keyframes slideDown {
  0% {
    opacity: 0;
    transform: translateY(-100%);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes progressFlow {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

@keyframes shine {
  0% { left: -100%; }
  100% { left: 100%; }
}

@keyframes iconPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

@keyframes currentPulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(0.9); }
}

@keyframes dotBounce {
  0%, 80%, 100% { 
    transform: scale(0);
    opacity: 0.5;
  } 
  40% { 
    transform: scale(1);
    opacity: 1;
  }
}

/* 移动端适配 */
@media (max-width: 768px) {
  .top-progress-bar {
    padding: 12px 16px;
  }
  
  .progress-container {
    margin-bottom: 10px;
  }
  
  .main-title {
    font-size: 14px;
  }
  
  .sub-title {
    font-size: 12px;
  }
  
  .progress-percentage {
    font-size: 16px;
  }
  
  .progress-status {
    font-size: 11px;
  }
  
  .current-detail {
    font-size: 11px;
  }
  
  .tip-text {
    font-size: 11px;
  }
  
  .status-dot {
    width: 14px;
    height: 14px;
    font-size: 9px;
  }
  
  .more-status {
    font-size: 10px;
  }
}

/* 暗色模式支持 */
@media (prefers-color-scheme: dark) {
  .top-progress-bar {
    background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
    border-bottom-color: #34495e;
    color: #ecf0f1;
  }
  
  .main-title {
    color: #ecf0f1;
  }
  
  .sub-title {
    color: #bdc3c7;
  }
  
  .current-detail {
    color: #bdc3c7;
  }
  
  .tip-text {
    color: #bdc3c7;
  }
  
  .progress-status {
    color: #bdc3c7;
  }
  
  .progress-tip {
    border-top-color: #34495e;
  }
  
  .progress-bar {
    background: #34495e;
  }
  
  .status-dot.pending {
    background: #34495e;
    color: #7f8c8d;
  }
}

.progress-title {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
  text-align: center;
  justify-content: center;
}

.title-icon {
  font-size: 24px;
  animation: iconBounce 2s ease-in-out infinite;
}

.progress-title h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.progress-bar-wrapper {
  margin-bottom: 20px;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
  position: relative;
  margin-bottom: 8px;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4CAF50, #45a049, #4CAF50);
  background-size: 200% 100%;
  animation: progressFlow 2s ease-in-out infinite;
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 4px;
  position: relative;
}

.progress-shine {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, 
    transparent, 
    rgba(255, 255, 255, 0.4), 
    transparent
  );
  animation: shine 2s ease-in-out infinite;
}

.progress-percentage {
  text-align: center;
  font-size: 14px;
  font-weight: 600;
  color: #4CAF50;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.progress-info {
  text-align: center;
  margin-bottom: 24px;
}

.current-step {
  font-size: 16px;
  font-weight: 500;
  color: #2c3e50;
  margin-bottom: 6px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.step-details {
  font-size: 13px;
  color: #6c757d;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.status-list {
  max-height: 200px;
  overflow-y: auto;
  margin-bottom: 20px;
  padding: 0 4px;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 6px 0;
  font-size: 13px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  transition: all 0.3s ease;
}

.status-icon {
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  flex-shrink: 0;
}

.status-item.completed .status-icon {
  color: #4CAF50;
  font-weight: bold;
}

.status-item.current .status-icon {
  color: #2196F3;
}

.status-item.current .status-text {
  color: #2196F3;
  font-weight: 500;
}

.status-item.pending .status-icon {
  color: #bdc3c7;
}

.status-item.pending .status-text {
  color: #95a5a6;
}

.status-text {
  flex: 1;
  color: #2c3e50;
}

.loading-dot {
  animation: loadingPulse 1.5s ease-in-out infinite;
}

.progress-tips {
  text-align: center;
  padding-top: 16px;
  border-top: 1px solid #e9ecef;
}

.tip-text {
  font-size: 13px;
  color: #6c757d;
  margin-bottom: 12px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  min-height: 18px;
}

.loading-animation {
  display: flex;
  justify-content: center;
  gap: 4px;
}

.dot {
  width: 6px;
  height: 6px;
  background: #4CAF50;
  border-radius: 50%;
  animation: dotBounce 1.4s ease-in-out infinite both;
}

.dot:nth-child(1) { animation-delay: -0.32s; }
.dot:nth-child(2) { animation-delay: -0.16s; }
.dot:nth-child(3) { animation-delay: 0s; }

/* 动画定义 */
@keyframes modalSlideIn {
  0% {
    opacity: 0;
    transform: translateY(-30px) scale(0.9);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes progressFlow {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

@keyframes shine {
  0% { left: -100%; }
  100% { left: 100%; }
}

@keyframes iconBounce {
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-4px); }
  60% { transform: translateY(-2px); }
}

@keyframes loadingPulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.8); }
}

@keyframes dotBounce {
  0%, 80%, 100% { 
    transform: scale(0);
    opacity: 0.5;
  } 
  40% { 
    transform: scale(1);
    opacity: 1;
  }
}

/* 滚动条样式 */
.status-list::-webkit-scrollbar {
  width: 4px;
}

.status-list::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 2px;
}

.status-list::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 2px;
}

.status-list::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .progress-modal {
    width: 340px;
    padding: 24px;
    margin: 20px;
  }
  
  .progress-title h3 {
    font-size: 16px;
  }
  
  .current-step {
    font-size: 14px;
  }
  
  .step-details {
    font-size: 12px;
  }
  
  .status-item {
    font-size: 12px;
    padding: 4px 0;
  }
  
  .tip-text {
    font-size: 12px;
  }
  
  .status-list {
    max-height: 160px;
  }
}

/* 暗色模式支持 */
@media (prefers-color-scheme: dark) {
  .progress-modal {
    background: linear-gradient(145deg, #2c3e50, #34495e);
    color: #ecf0f1;
  }
  
  .progress-title h3 {
    color: #ecf0f1;
  }
  
  .current-step {
    color: #ecf0f1;
  }
  
  .step-details {
    color: #bdc3c7;
  }
  
  .status-text {
    color: #ecf0f1;
  }
  
  .tip-text {
    color: #bdc3c7;
  }
  
  .progress-tips {
    border-top-color: #34495e;
  }
  
  .progress-bar {
    background: #34495e;
  }
}
</style>