<template>
  <div id="app" class="app-container">
    <!-- 登录进度条 -->
    <LoginProgressBar 
      ref="progressBarRef"
      :visible="showLoginProgress"
      :show-overlay="false"
      @complete="onLoginProgressComplete"
      @step="onLoginProgressStep"
    />

    <!-- 移动端布局 -->
    <MobileLayout v-if="isMobile" />
    
    <!-- 桌面端布局 -->
    <div v-else class="desktop-layout">
      <!-- Matrix导航 -->
      <MatrixNavigation
        v-if="showMatrixNav"
        @create-room="handleCreateRoom"
        @test-connection="handleTestConnection"
      />

      <!-- 主内容区域 -->
      <div class="main-content" :class="{ 'with-nav': showMatrixNav }">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, onBeforeMount, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useMatrixStore } from '@/stores/matrix'
import { globalLoginProgress } from '@/composables/useLoginProgress'
import MatrixNavigation from '@/components/MatrixNavigation.vue'
import MobileLayout from '@/components/MobileLayout.vue'
import LoginProgressBar from '@/components/LoginProgressBar.vue'
import axios from 'axios'

const route = useRoute()
const authStore = useAuthStore()
const matrixStore = useMatrixStore()

// 进度条相关
const progressBarRef = ref<any>(null)
const showLoginProgress = ref(false)

// 响应式检测
const isMobile = ref(false)

// 检测是否为移动端
const checkIsMobile = () => {
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera
  const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i
  isMobile.value = mobileRegex.test(userAgent) || window.innerWidth <= 768
}

// 监听窗口大小变化
const handleResize = () => {
  checkIsMobile()
}

onBeforeMount(() => {
  checkIsMobile()
  window.addEventListener('resize', handleResize)
})

onMounted(() => {
  // 在组件销毁时清理事件监听器
  const cleanup = () => {
    window.removeEventListener('resize', handleResize)
  }
  
  // 使用 beforeunload 事件来清理
  window.addEventListener('beforeunload', cleanup)
})

// 显示Matrix导航的条件
const showMatrixNav = computed(() => {
  return false // 禁用侧边栏导航
})

const handleCreateRoom = () => {
  // 这里可以触发创建房间的事件
  console.log('Create room triggered from navigation')
}

const handleTestConnection = async () => {
  try {
    await matrixStore.initializeMatrix()
    console.log('Matrix connection test completed')
  } catch (error) {
    console.error('Matrix connection test failed:', error)
  }
}

// 进度条事件处理
const onLoginProgressComplete = () => {
  console.log('🎉 登录进度完成')
  showLoginProgress.value = false
}

const onLoginProgressStep = (step: number, message: string) => {
  console.log(`📊 进度步骤 ${step}: ${message}`)
}

// 监听进度状态变化
watch(() => globalLoginProgress.progressState.isActive, (isActive) => {
  showLoginProgress.value = isActive
  if (isActive && progressBarRef.value) {
    // 设置进度条引用
    globalLoginProgress.setProgressBarRef(progressBarRef.value)
  }
})

// 暴露测试函数到全局（开发环境）
if (import.meta.env.DEV) {
  (window as any).testLoginProgress = () => {
    console.log('🧪 启动登录进度条测试')
    globalLoginProgress.simulateLoginSteps()
  }
}

onMounted(() => {
  // 设置 axios 基础配置
  axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

  // 初始化认证状态
  authStore.initializeAuth()

  // 设置进度条引用
  if (progressBarRef.value) {
    globalLoginProgress.setProgressBarRef(progressBarRef.value)
  }

  // 如果在聊天相关路由，初始化Matrix连接
  if (route.path === '/chat' || route.path === '/wechat-layout') {
    console.log('Initializing Matrix for chat route:', route.path)
    matrixStore.initializeMatrix().catch(error => {
      console.error('Failed to initialize Matrix:', error)
    })
  }
})
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Courier+Prime:wght@400;700&family=Share+Tech+Mono&display=swap');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Courier Prime', 'Share Tech Mono', 'Courier New', monospace;
  background-color: #000;
  color: #00ff00;
  overflow: hidden;
}

#app {
  height: 100vh;
  background:
    radial-gradient(circle at 20% 80%, rgba(0, 255, 0, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(0, 255, 0, 0.1) 0%, transparent 50%),
    linear-gradient(135deg, #001100 0%, #000800 50%, #000000 100%);
  position: relative;
}

.main-content {
  height: 100vh;
  width: 100vw;
  /* 移除过渡效果和边距 */
}

/* 扫描线效果 */
#app::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(0, 255, 0, 0.03) 2px,
    rgba(0, 255, 0, 0.03) 4px
  );
  pointer-events: none;
  z-index: 1000;
}

/* 闪烁效果 */
@keyframes flicker {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
}

/* 打字机效果 */
@keyframes typing {
  from { width: 0; }
  to { width: 100%; }
}

@keyframes blink-caret {
  from, to { border-color: transparent; }
  50% { border-color: #00ff00; }
}

/* 滚动条样式 - 复古绿色 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #001100;
  border: 1px solid #003300;
}

::-webkit-scrollbar-thumb {
  background: #00ff00;
  border: 1px solid #003300;
}

::-webkit-scrollbar-thumb:hover {
  background: #00cc00;
}

/* 全局文本样式 */
.retro-text {
  color: #00ff00;
  text-shadow: 0 0 5px #00ff00;
  font-family: 'Share Tech Mono', monospace;
}

.retro-title {
  color: #00ff00;
  text-shadow: 0 0 10px #00ff00, 0 0 20px #00ff00;
  font-family: 'Share Tech Mono', monospace;
  font-weight: bold;
  animation: flicker 2s infinite;
}

.retro-border {
  border: 2px solid #00ff00;
  box-shadow:
    0 0 10px #00ff00,
    inset 0 0 10px rgba(0, 255, 0, 0.1);
}

.retro-button {
  background: transparent;
  border: 2px solid #00ff00;
  color: #00ff00;
  padding: 10px 20px;
  font-family: 'Share Tech Mono', monospace;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
}

.retro-button:hover {
  background: rgba(0, 255, 0, 0.1);
  box-shadow: 0 0 15px #00ff00;
  text-shadow: 0 0 5px #00ff00;
}

.retro-input {
  background: transparent;
  border: 1px solid #00ff00;
  color: #00ff00;
  padding: 8px 12px;
  font-family: 'Share Tech Mono', monospace;
  outline: none;
}

.retro-input:focus {
  box-shadow: 0 0 10px #00ff00;
  border-color: #00ff00;
}

/* Element Plus 样式覆盖 - 复古风格 */
.el-message {
  z-index: 3000;
  background: #001100 !important;
  border: 1px solid #00ff00 !important;
  color: #00ff00 !important;
  font-family: 'Share Tech Mono', monospace !important;
}

.el-dialog {
  background: #000 !important;
  border: 2px solid #00ff00 !important;
  box-shadow: 0 0 20px #00ff00 !important;
}

.el-card {
  background: transparent !important;
  border: 2px solid #00ff00 !important;
  box-shadow: 0 0 15px rgba(0, 255, 0, 0.3) !important;
}

.el-button {
  background: transparent !important;
  border: 1px solid #00ff00 !important;
  color: #00ff00 !important;
  font-family: 'Share Tech Mono', monospace !important;
}

.el-button:hover {
  background: rgba(0, 255, 0, 0.1) !important;
  box-shadow: 0 0 10px #00ff00 !important;
}

.el-input__wrapper {
  background: transparent !important;
  border: 1px solid #00ff00 !important;
  box-shadow: none !important;
}

.el-input__inner {
  color: #00ff00 !important;
  font-family: 'Share Tech Mono', monospace !important;
}

.el-form-item__label {
  color: #00ff00 !important;
  font-family: 'Share Tech Mono', monospace !important;
}
</style>
