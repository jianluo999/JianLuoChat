<template>
  <div class="home-page">
    <h1>欢迎使用 JianLuoChat</h1>
    <div class="navigation">
      <!-- 基础功能 -->
      <router-link to="/login" class="nav-link">🔐 真实登录</router-link>
      <router-link to="/chat" class="nav-link">💬 聊天室列表</router-link>
      <router-link to="/chat-page" class="nav-link">📱 聊天页面</router-link>
      
      <!-- 消息相关功能 -->
      <router-link to="/message-features-test" class="nav-link">📝 消息功能测试</router-link>
      <router-link to="/matrix-message-area" class="nav-link">💬 基础消息区域</router-link>
      <router-link to="/matrix-message-area-enhanced" class="nav-link">⚡ 增强消息区域</router-link>
      <router-link to="/matrix-message-area-simple" class="nav-link">📋 简化消息区域</router-link>
      <router-link to="/matrix-message-input" class="nav-link">⌨️ 消息输入组件</router-link>
      <router-link to="/matrix-message-input-v39" class="nav-link">🔄 V39消息输入</router-link>
      <router-link to="/matrix-message-item" class="nav-link">📦 消息项组件</router-link>
      
      <!-- 房间管理功能 -->
      <router-link to="/matrix-room-list" class="nav-link">🏠 房间列表</router-link>
      <router-link to="/matrix-room-list-optimized" class="nav-link">🚀 优化房间列表</router-link>
      <router-link to="/matrix-room-browser" class="nav-link">🌐 房间浏览器</router-link>
      <router-link to="/matrix-room-manager" class="nav-link">🛠️ 房间管理器</router-link>
      
      <!-- 导航与用户信息 -->
      <router-link to="/matrix-navigation" class="nav-link">🧭 导航组件</router-link>
      <router-link to="/matrix-user-id" class="nav-link">👤 用户ID组件</router-link>
      
      <!-- 安全与加密功能 -->
      <router-link to="/encryption-settings" class="nav-link">🔒 加密设置</router-link>
      <router-link to="/encryption-test" class="nav-link">🧪 加密测试</router-link>
      <router-link to="/crypto-debug" class="nav-link">🔍 加密调试</router-link>
      <router-link to="/device-verification" class="nav-link">✅ 设备验证</router-link>
      
      <!-- 性能与安全测试 -->
      <router-link to="/performance" class="nav-link">⚡ 性能测试</router-link>
      <router-link to="/security" class="nav-link">🛡️ 安全审计</router-link>
      
      <!-- Matrix V39 功能 -->
      <router-link to="/matrix-test" class="nav-link">🧪 Matrix测试</router-link>
      <router-link to="/matrix-v39-demo" class="nav-link">🚀 V39演示</router-link>
      <router-link to="/matrix-chat-v39" class="nav-link">💬 V39聊天</router-link>
      
      <!-- 调试与日志 -->
      <router-link v-if="isDev" to="/log-report" class="nav-link debug">🔧 日志报告</router-link>
      <router-link to="/matrix-chat-demo" class="nav-link debug">🎭 聊天演示</router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const isDev = computed(() => import.meta.env.DEV)
</script>

<style scoped>
.home-page {
  padding: 40px 20px;
  text-align: center;
  max-width: 800px;
  margin: 0 auto;
}

h1 {
  color: #2c3e50;
  margin-bottom: 40px;
}

.navigation {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-top: 40px;
}

.nav-link {
  display: block;
  padding: 20px;
  background: white;
  border: 2px solid #e1e8ed;
  border-radius: 8px;
  text-decoration: none;
  color: #2c3e50;
  font-weight: 500;
  transition: all 0.2s;
}

.nav-link:hover {
  border-color: #3498db;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.nav-link.debug {
  border-color: #f39c12;
  background: #fef9e7;
}

.nav-link.debug:hover {
  border-color: #e67e22;
}
</style>