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
import { computed, onMounted, ref, onBeforeMount, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useMatrixStore } from '@/stores/matrix'
import { globalLoginProgress } from '@/composables/useLoginProgress'
import { useTheme } from '@/utils/themeManager'
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
  // 初始化主题系统
  const { loadTheme } = useTheme()
  loadTheme()

  // 监听主题变化事件
  document.addEventListener('themeChanged', (event: any) => {
    console.log('🎨 [App.vue] 收到主题变化事件:', event.detail.theme)
    // 强制重新渲染Vue组件
    nextTick(() => {
      // 触发响应式更新
      const app = document.getElementById('app')
      if (app) {
        app.style.opacity = '0.99'
        setTimeout(() => {
          app.style.opacity = '1'
        }, 50)
      }
    })
  })

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

/* ===== 全局主题系统 ===== */

/* 复古绿色主题 */
body.theme-retro-green {
  --primary-bg: #000000;
  --secondary-bg: #001100;
  --tertiary-bg: #002200;
  --primary-text: #00ff00;
  --secondary-text: #00cc00;
  --accent-color: #00ff00;
  --border-color: #003300;
  --hover-bg: rgba(0, 255, 0, 0.1);
  --message-sent-bg: #00ff00;
  --message-sent-text: #000000;
  --message-received-bg: #003300;
  --message-received-text: #00ff00;
  --input-bg: #001100;
  --input-border: #00ff00;
  --button-bg: #00ff00;
  --button-text: #000000;
  --shadow: 0 0 10px rgba(0, 255, 0, 0.3);
}

/* 微信经典主题 */
body.theme-wechat-classic {
  --primary-bg: #f7f7f7;
  --secondary-bg: #ffffff;
  --tertiary-bg: #ededed;
  --primary-text: #000000;
  --secondary-text: #666666;
  --accent-color: #07c160;
  --border-color: #e0e0e0;
  --hover-bg: rgba(7, 193, 96, 0.1);
  --message-sent-bg: #95ec69;
  --message-sent-text: #000000;
  --message-received-bg: #ffffff;
  --message-received-text: #000000;
  --input-bg: #ffffff;
  --input-border: #e0e0e0;
  --button-bg: #07c160;
  --button-text: #ffffff;
  --shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 深蓝夜间主题 */
body.theme-dark-blue {
  --primary-bg: #1a1a2e;
  --secondary-bg: #16213e;
  --tertiary-bg: #0f3460;
  --primary-text: #ffffff;
  --secondary-text: #b0b0b0;
  --accent-color: #4fc3f7;
  --border-color: #2a2a4e;
  --hover-bg: rgba(79, 195, 247, 0.1);
  --message-sent-bg: #0f3460;
  --message-sent-text: #ffffff;
  --message-received-bg: #533483;
  --message-received-text: #ffffff;
  --input-bg: #16213e;
  --input-border: #4fc3f7;
  --button-bg: #4fc3f7;
  --button-text: #000000;
  --shadow: 0 4px 12px rgba(79, 195, 247, 0.2);
}

/* 紫色梦幻主题 */
body.theme-purple-dream {
  --primary-bg: #2d1b69;
  --secondary-bg: #11998e;
  --tertiary-bg: #38ef7d;
  --primary-text: #ffffff;
  --secondary-text: #e0e0e0;
  --accent-color: #667eea;
  --border-color: #4d3b89;
  --hover-bg: rgba(102, 126, 234, 0.1);
  --message-sent-bg: #38ef7d;
  --message-sent-text: #000000;
  --message-received-bg: #667eea;
  --message-received-text: #ffffff;
  --input-bg: #11998e;
  --input-border: #667eea;
  --button-bg: #667eea;
  --button-text: #ffffff;
  --shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
}

/* ===== 全局组件主题样式 ===== */

/* 主布局 */
.wechat-layout {
  background: var(--primary-bg) !important;
  color: var(--primary-text) !important;
}

/* 侧边栏 */
.wechat-sidebar {
  background: var(--secondary-bg) !important;
}

.nav-item {
  color: var(--secondary-text) !important;
  transition: all 0.3s ease;
}

.nav-item:hover {
  background: var(--hover-bg) !important;
  color: var(--accent-color) !important;
}

.nav-item.active {
  background: var(--hover-bg) !important;
  color: var(--accent-color) !important;
}

/* 聊天列表 */
.chat-list {
  background: var(--secondary-bg) !important;
}

.chat-item {
  background: var(--secondary-bg) !important;
  color: var(--primary-text) !important;
  border-bottom: 1px solid var(--border-color) !important;
  transition: all 0.3s ease;
}

.chat-item:hover {
  background: var(--hover-bg) !important;
}

.chat-item.active {
  background: var(--hover-bg) !important;
  border-left: 3px solid var(--accent-color) !important;
}

.chat-name {
  color: var(--primary-text) !important;
}

.last-message {
  color: var(--secondary-text) !important;
}

.chat-time {
  color: var(--secondary-text) !important;
}

/* 消息区域 */
.message-area {
  background: var(--primary-bg) !important;
}

.message-item {
  color: var(--primary-text) !important;
}

.message-content {
  background: var(--message-received-bg) !important;
  color: var(--message-received-text) !important;
  box-shadow: var(--shadow);
}

.message-item.own-message .message-content {
  background: var(--message-sent-bg) !important;
  color: var(--message-sent-text) !important;
}

/* 输入框 */
.message-input,
.search-input,
input[type="text"],
textarea {
  background: var(--input-bg) !important;
  color: var(--primary-text) !important;
  border: 1px solid var(--input-border) !important;
}

.message-input:focus,
.search-input:focus,
input[type="text"]:focus,
textarea:focus {
  border-color: var(--accent-color) !important;
  box-shadow: 0 0 5px var(--accent-color) !important;
}

/* 按钮 */
.send-btn,
.action-btn,
button {
  background: var(--button-bg) !important;
  color: var(--button-text) !important;
  border: 1px solid var(--accent-color) !important;
  transition: all 0.3s ease;
}

.send-btn:hover,
.action-btn:hover,
button:hover {
  opacity: 0.8;
  box-shadow: var(--shadow);
}

/* 头部区域 */
.chat-list-header,
.room-header {
  background: var(--secondary-bg) !important;
  color: var(--primary-text) !important;
  border-bottom: 1px solid var(--border-color) !important;
}

.user-info .username {
  color: var(--primary-text) !important;
}

/* 搜索框 */
.search-container {
  background: var(--secondary-bg) !important;
}

.search-box {
  background: var(--input-bg) !important;
  border: 1px solid var(--border-color) !important;
}

/* 通讯录面板 */
.contacts-panel {
  background: var(--primary-bg) !important;
  color: var(--primary-text) !important;
}

.contact-item {
  background: var(--secondary-bg) !important;
  color: var(--primary-text) !important;
  border: 1px solid var(--border-color) !important;
}

.contact-item:hover {
  background: var(--hover-bg) !important;
}

/* 主题面板 */
.theme-panel {
  background: var(--primary-bg) !important;
}

/* 右键菜单 */
.context-menu,
.wechat-context-menu {
  background: var(--secondary-bg) !important;
  border: 1px solid var(--border-color) !important;
  box-shadow: var(--shadow);
}

.context-menu-item {
  color: var(--primary-text) !important;
}

.context-menu-item:hover {
  background: var(--hover-bg) !important;
  color: var(--accent-color) !important;
}

/* 加载状态 */
.loading-spinner {
  border-color: var(--accent-color) !important;
}

.loading-message {
  color: var(--secondary-text) !important;
}

/* 空状态 */
.empty-message {
  color: var(--secondary-text) !important;
}

/* 滚动条 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: var(--tertiary-bg);
}

::-webkit-scrollbar-thumb {
  background: var(--accent-color);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--secondary-text);
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
