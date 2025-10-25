<template>
  <div class="not-found-page">
    <div class="error-content">
      <div class="error-icon">🔍</div>
      <h1>页面未找到</h1>
      <p class="error-message">
        抱歉，您访问的页面不存在或已被移除。
      </p>
      <div class="error-details" v-if="isDev">
        <p><strong>请求路径:</strong> {{ $route.fullPath }}</p>
        <p><strong>来源页面:</strong> {{ referrer || '直接访问' }}</p>
      </div>
      <div class="actions">
        <button @click="goHome" class="primary-btn">🏠 返回首页</button>
        <button @click="goBack" class="secondary-btn">← 返回上页</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { analytics } from '../utils/analytics'

const router = useRouter()
const route = useRoute()
const referrer = ref(document.referrer)
const isDev = import.meta.env.DEV

function goHome() {
  router.push('/')
  analytics.track('404_go_home', { from: route.fullPath })
}

function goBack() {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/')
  }
  analytics.track('404_go_back', { from: route.fullPath })
}

onMounted(() => {
  // 上报404错误
  analytics.track('404_page_view', {
    path: route.fullPath,
    referrer: referrer.value
  })
  
  console.warn('🚨 404 页面被访问:', route.fullPath)
})
</script>

<style scoped>
.not-found-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 20px;
}

.error-content {
  text-align: center;
  background: white;
  padding: 60px 40px;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  max-width: 500px;
  width: 100%;
}

.error-icon {
  font-size: 80px;
  margin-bottom: 20px;
}

h1 {
  color: #2c3e50;
  margin-bottom: 16px;
  font-size: 32px;
}

.error-message {
  color: #7f8c8d;
  margin-bottom: 30px;
  font-size: 16px;
  line-height: 1.6;
}

.error-details {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 30px;
  text-align: left;
  font-size: 14px;
}

.error-details p {
  margin: 8px 0;
  color: #5a6c7d;
}

.actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}

.primary-btn, .secondary-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.primary-btn {
  background: #3498db;
  color: white;
}

.primary-btn:hover {
  background: #2980b9;
  transform: translateY(-1px);
}

.secondary-btn {
  background: #ecf0f1;
  color: #2c3e50;
}

.secondary-btn:hover {
  background: #d5dbdb;
  transform: translateY(-1px);
}

@media (max-width: 480px) {
  .error-content {
    padding: 40px 20px;
  }
  
  .actions {
    flex-direction: column;
  }
  
  .primary-btn, .secondary-btn {
    width: 100%;
  }
}
</style>