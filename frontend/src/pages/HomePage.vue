<template>
  <div class="home-page">
    <h1>欢迎使用应用</h1>
    <div class="navigation">
      <router-link to="/chat" class="nav-link">💬 聊天</router-link>
      <router-link to="/rooms" class="nav-link">🏠 房间列表</router-link>
      <router-link to="/message-features-test" class="nav-link">📝 消息功能测试</router-link>
      <router-link to="/performance" class="nav-link">⚡ 性能测试</router-link>
      <router-link to="/security" class="nav-link">🔒 安全审计</router-link>
      <router-link v-if="isDev" to="/debug/log-report" class="nav-link debug">🔧 日志调试</router-link>
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