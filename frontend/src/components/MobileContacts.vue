<template>
  <div class="mobile-contacts">
    <div class="contacts-header">
      <h1>通讯录</h1>
      <div class="header-actions">
        <button class="header-action">
          <svg viewBox="0 0 24 24" class="action-icon">
            <path d="M19,3H15.5L14.5,6.5L12,10.5L9.5,6.5L8.5,3H5A2,2 0 0,1 3,1V7A2,2 0 0,0 5,9H19A2,2 0 0,0 21,7V1A2,2 0 0,1 19,3Z"/>
          </svg>
        </button>
      </div>
    </div>

    <div class="contacts-search">
      <div class="search-container">
        <svg class="search-icon" viewBox="0 0 24 24">
          <path d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z"/>
        </svg>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜索"
          class="search-input"
        />
      </div>
    </div>

    <div class="contacts-section">
      <div class="contacts-list">
        <div class="section-title">我的朋友</div>
        
        <div class="contact-item">
          <div class="contact-avatar">
            <div class="avatar-placeholder">A</div>
          </div>
          <div class="contact-info">
            <div class="contact-name">张三</div>
            <div class="contact-status">正在输入中...</div>
          </div>
          <div class="contact-actions">
            <button class="action-btn">
              <svg viewBox="0 0 24 24" class="action-icon">
                <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6M12,8A4,4 0 0,0 8,12A4,4 0 0,0 12,16A4,4 0 0,0 16,12A4,4 0 0,0 12,8Z"/>
              </svg>
            </button>
          </div>
        </div>

        <div class="contact-item">
          <div class="contact-avatar">
            <div class="avatar-placeholder">L</div>
          </div>
          <div class="contact-info">
            <div class="contact-name">李四</div>
            <div class="contact-status">已离线</div>
          </div>
          <div class="contact-actions">
            <button class="action-btn">
              <svg viewBox="0 0 24 24" class="action-icon">
                <path d="M19,3H15.5L14.5,6.5L12,10.5L9.5,6.5L8.5,3H5A2,2 0 0,1 3,1V7A2,2 0 0,0 5,9H19A2,2 0 0,0 21,7V1A2,2 0 0,1 19,3Z"/>
              </svg>
            </button>
          </div>
        </div>

        <div class="empty-state" v-if="!searchQuery">
          <div class="empty-icon">👥</div>
          <div class="empty-title">暂无好友</div>
          <div class="empty-desc">添加新朋友开始聊天</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const searchQuery = ref('')
</script>

<style scoped>
.mobile-contacts {
  height: 100vh;
  background: #f8f9fa;
  display: flex;
  flex-direction: column;
}

.contacts-header {
  background: #ffffff;
  border-bottom: 1px solid #e8e8e8;
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.contacts-header h1 {
  font-size: 18px;
  font-weight: 600;
  color: #222;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.header-action {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s;
}

.header-action:hover {
  background: #f5f5f5;
}

.action-icon {
  width: 18px;
  height: 18px;
  fill: #888;
}

.contacts-search {
  background: #ffffff;
  border-bottom: 1px solid #e8e8e8;
  padding: 12px 16px;
}

.search-container {
  position: relative;
  background: #f5f5f5;
  border-radius: 20px;
  padding: 8px 12px;
}

.search-icon {
  position: absolute;
  left: 8px;
  width: 16px;
  height: 16px;
  fill: #888;
}

.search-input {
  width: 100%;
  padding: 8px 8px 8px 24px;
  background: transparent;
  border: none;
  border-radius: 20px;
  font-size: 14px;
  color: #222;
  outline: none;
}

.contacts-section {
  flex: 1;
  overflow-y: auto;
  background: #f8f9fa;
}

.contacts-list {
  padding: 16px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #222;
  margin-bottom: 12px;
}

.contact-item {
  display: flex;
  align-items: center;
  background: #ffffff;
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 8px;
  border: 1px solid #f5f5f5;
}

.contact-item:last-child {
  margin-bottom: 0;
}

.contact-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #07c160, #52c41a);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  color: white;
  font-weight: bold;
  font-size: 16px;
}

.contact-info {
  flex: 1;
  min-width: 0;
}

.contact-name {
  font-size: 16px;
  font-weight: 600;
  color: #222;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.contact-status {
  font-size: 12px;
  color: #880080;
}

.contact-actions {
  display: flex;
  align-items: center;
}

.action-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:hover {
  background: #f5f5f5;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #888;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #222;
}

.empty-desc {
  font-size: 14px;
  text-align: center;
}

/* 滚动条样式 */
.contacts-section::-webkit-scrollbar {
  width: 4px;
}

.contacts-section::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.contacts-section::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 2px;
}

.contacts-section::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>