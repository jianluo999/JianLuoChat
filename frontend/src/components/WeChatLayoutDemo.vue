<template>
  <div class="demo-container">
    <h1>微信风格界面改进演示</h1>
    <div class="demo-description">
      <h2>改进内容：</h2>
      <ul>
        <li>✅ 在左侧添加了通讯录功能</li>
        <li>✅ 简化了右键菜单，移除了过多的功能</li>
        <li>✅ 在左下角添加了横杠符号(☰)，整合了多余功能</li>
        <li>✅ 保持了微信风格的简洁设计</li>
      </ul>
    </div>
    
    <div class="demo-layout">
      <WeChatStyleLayout />
    </div>
  </div>
</template>

<script setup lang="ts">
import WeChatStyleLayout from './WeChatStyleLayout.vue'
</script>

<style scoped>
.demo-container {
  padding: 20px;
  background: #f5f5f5;
  min-height: 100vh;
}

.demo-description {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.demo-description h2 {
  color: #2d5a27;
  margin-bottom: 15px;
}

.demo-description ul {
  list-style: none;
  padding: 0;
}

.demo-description li {
  padding: 8px 0;
  font-size: 14px;
  color: #333;
}

.demo-layout {
  height: 600px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
}
</style>