<template>
  <div class="mobile-layout">
    <!-- 应用内容 -->
    <div class="app-content">
      <router-view />
    </div>
    
    <!-- 底部标签栏 -->
    <MobileTabBar v-if="showTabBar" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import MobileTabBar from './MobileTabBar.vue'

const route = useRoute()

// 根据路由决定是否显示标签栏
const showTabBar = computed(() => {
  const tabBarRoutes = ['chat', 'rooms', 'contacts', 'discovery']
  return tabBarRoutes.includes(route.name as string)
})
</script>

<style scoped>
.mobile-layout {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f8f9fa;
}

.app-content {
  flex: 1;
  overflow-y: auto;
}

/* 移动端专用样式 */
@media (max-width: 768px) {
  .mobile-layout {
    padding-bottom: 60px; /* 为底部标签栏预留空间 */
  }
}
</style>