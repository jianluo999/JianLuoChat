<template>
  <div class="mobile-discovery">
    <div class="discovery-header">
      <h1>发现</h1>
    </div>

    <div class="discovery-content">
      <!-- 发现好友 -->
      <div class="discovery-section">
        <div class="section-header">
          <h3>发现好友</h3>
        </div>
        
        <div class="discovery-cards">
          <div class="discovery-card" @click="handleAddFriend">
            <div class="card-icon">
              <svg viewBox="0 0 24 24" class="card-icon-svg">
                <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,6A6,6 0 0,0 6,12A6,6 0 0,0 18,12A6,6 0 0,0 12,6M12,18A6,16 0 0,0 12,2A6,16 0 0,0 12,18M12,16A4,4 0 0,0 8,12A4,4 0 0,0 12,8A4,4 0 0,0 16,12A4,4 0 0,0 12,16M12,14A2,2 0 0,0 10,12A2,2 0 0,0 12,10A2,2 0 0,0 14,12A2,2 0 0,0 12,14Z"/>
              </svg>
            </div>
            <div class="card-content">
              <div class="card-title">添加朋友</div>
              <div class="card-desc">添加新的聊天对象</div>
            </div>
          </div>

          <div class="discovery-card" @click="handleScanQRCode">
            <div class="card-icon">
              <div class="qr-code-icon">🔍</div>
            </div>
            <div class="card-content">
              <div class="card-title">扫一扫</div>
              <div class="card-desc">扫描二维码</div>
            </div>
          </div>

          <div class="discovery-card" @click="handleShake">
            <div class="card-icon">
              <div class="shake-icon">🔀</div>
            </div>
            <div class="card-content">
              <div class="card-title">摇一摇</div>
              <div class="card-desc">摇一摇添加朋友</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 功能介绍 -->
      <div class="features-section">
        <div class="section-header">
          <h3>功能</h3>
        </div>
        
        <div class="features-list">
          <div class="feature-item">
            <div class="feature-icon">
              <svg viewBox="0 0 24 24" class="feature-icon-svg">
                <path d="M20,2H4C2.89,2 2,2.9 2,4V22L6,20V4L20,22V4C20,2.89 19,2 18,2H20M14,17L15,12L10,7V9L13,12L10,15V17M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,18L12,14M4,6H2V8H8L2,12H4M6,10L4,8L8,12M6,14L4,12L8,16L6,18M10,6L8,8L12,4M10,10L8,8L12,12M10,14L8,12L12,16L10,18M12,6L10,8L14,4M12,10L10,8L14,12M12,14L10,12L14,16L12,18M14,6L12,8L16,4M14,10L12,8L16,12M14,14L12,12L16,16L14,18"/>
              </svg>
            </div>
            <div class="feature-content">
              <div class="feature-title">聊天</div>
              <div class="feature-desc">与好友进行文字、语音、视频聊天</div>
            </div>
          </div>

          <div class="feature-item">
            <div class="feature-icon">
              <svg viewBox="0 0 24 24" class="feature-icon-svg">
                <path d="M20,2H4C2.89,2 2,2.9 2,4V22L6,20V4L20,22V4C20,2.89 19,2 18,2H20M14,17L15,12L10,7V9L13,12L10,15V17M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,18L12,14M4,6H2V8H8L2,12H4M6,10L4,8L8,12M6,14L4,12L8,16L6,18M10,6L8,8L12,4M10,10L8,8L12,12M10,14L8,12L12,16L10,18M12,6L10,8L14,4M12,10L10,8L14,12M12,14L10,12L14,16L12,18M14,6L12,8L16,4M14,10L12,8L16,12M14,14L12,12L16,16L14,18"/>
              </svg>
            </div>
            <div class="feature-content">
              <div class="feature-title">群聊</div>
              <div class="feature-desc">创建群聊，与多人同时聊天</div>
            </div>
          </div>

          <div class="feature-item">
            <div class="feature-icon">
              <div class="contact-icon">👥</div>
            </div>
            <div class="feature-content">
              <div class="feature-title">联系人</div>
              <div class="feature-desc">管理好友列表和联系人信息</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const handleAddFriend = () => {
  console.log('添加好友')
}

const handleScanQRCode = () => {
  console.log('扫描二维码')
}

const handleShake = () => {
  console.log('摇一摇')
}
</script>

<style scoped>
.mobile-discovery {
  height: 100vh;
  background: #f8f9fa;
  display: flex;
  flex-direction: column;
}

.discovery-header {
  background: #ffffff;
  border-bottom: 1px solid #e8e8e8;
  padding: 16px;
}

.discovery-header h1 {
  font-size: 18px;
  font-weight: 600;
  color: #222;
  text-align: center;
}

.discovery-content {
  flex: 1;
  padding: 16px 0;
}

.discovery-section {
  background: #ffffff;
  border-radius: 12px;
  margin-bottom: 16px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.discovery-section:last-child {
  margin-bottom: 0;
}

.section-header {
  padding: 16px;
  border-bottom: 1px solid #f5f5f5;
}

.section-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: #222;
}

.discovery-cards {
  padding: 16px 0;
}

.discovery-card {
  display: flex;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #f5f5f5;
  cursor: pointer;
  transition: background-color 0.2s;
}

.discovery-card:last-child {
  border-bottom: none;
}

.discovery-card:hover {
  background: #f5f5f5;
}

.card-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
}

.card-icon svg {
  width: 24px;
  height: 24px;
  fill: #666;
}

.card-content {
  flex: 1;
  min-width: 0;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #222;
  margin-bottom: 4px;
}

.card-desc {
  font-size: 12px;
  color: #888;
}

.features-section {
  background: #ffffff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.features-list {
  padding: 16px 0;
}

.feature-item {
  display: flex;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #f5f5f5;
}

.feature-item:last-child {
  border-bottom: none;
}

.feature-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  flex-shrink: 0;
}

.feature-icon svg {
  width: 20px;
  height: 20px;
  fill: #666;
}

.feature-content {
  flex: 1;
  min-width: 0;
}

.feature-title {
  font-size: 14px;
  font-weight: 600;
  color: #222;
  margin-bottom: 4px;
}

.feature-desc {
  font-size: 12px;
  color: #888;
  line-height: 1.3;
}

/* 响应式适配 */
@media (max-width: 320px) {
  .discovery-content {
    padding: 12px 0;
  }
  
  .discovery-section {
    margin-bottom: 12px;
  }
  
  .discovery-cards {
    padding: 12px 0;
  }
  
  .discovery-card {
    padding: 12px;
  }
  
  .card-icon {
    width: 44px;
    height: 44px;
  }
  
  .card-title {
    font-size: 14px;
  }
  
  .card-desc {
    font-size: 11px;
  }
  
  .features-section {
    margin-bottom: 12px;
  }
  
  .feature-item {
    padding: 12px;
  }
  
  .feature-icon {
    width: 36px;
    height: 36px;
  }
  
  .feature-title {
    font-size: 13px;
  }
  
  .feature-desc {
    font-size: 11px;
  }
}
</style>