<template>
  <div class="matrix-client">
    <!-- 真正的Matrix登录 -->
    <MatrixRealLogin
      v-if="!matrixStore.isLoggedIn"
      @login-success="handleRealLoginSuccess"
    />



    <!-- Matrix主界面 -->
    <div v-else-if="matrixStore.isLoggedIn" class="matrix-main-interface">
      <!-- 顶部导航栏 -->
      <div class="matrix-header">
        <div class="server-info">
          <div class="server-indicator">
            <div class="server-dot online"></div>
            <span class="server-name">{{ selectedServer }}</span>
            <span class="federation-badge">{{ $t('matrix.federated') }}</span>
          </div>
          <div class="user-info">
            <MatrixUserID 
              :user-id="matrixStore.currentUser?.userId || ''"
              :display-name="matrixStore.currentUser?.displayName"
              :avatar-url="matrixStore.currentUser?.avatarUrl"
              :show-status="true"
              :status="userStatus"
              :is-current-user="true"
              clickable
              @click="showUserProfile = true"
            />
          </div>
        </div>
        
        <div class="header-actions">
          <button 
            @click="showRoomBrowser = true"
            class="header-button"
            :title="$t('matrix.browseRooms')"
          >
            <svg viewBox="0 0 24 24">
              <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6M12,8A4,4 0 0,0 8,12A4,4 0 0,0 12,16A4,4 0 0,0 16,12A4,4 0 0,0 12,8Z"/>
            </svg>
          </button>
          
          <button 
            @click="showCreateRoom = true"
            class="header-button"
            :title="$t('matrix.createRoom')"
          >
            <svg viewBox="0 0 24 24">
              <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z"/>
            </svg>
          </button>
          
          <button
            v-if="hasJwtToken"
            @click="showInvitations = true"
            class="header-button"
            :title="$t('matrix.invitations')"
          >
            <svg viewBox="0 0 24 24">
              <path d="M15,14C12.33,14 7,15.33 7,18V20H23V18C23,15.33 17.67,14 15,14M6,10V7H4V10H1V12H4V15H6V12H9V10M15,12A4,4 0 0,0 19,8A4,4 0 0,0 15,4A4,4 0 0,0 11,8A4,4 0 0,0 15,12Z"/>
            </svg>
            <span v-if="pendingInvitations > 0" class="notification-badge">{{ pendingInvitations }}</span>
          </button>
          
          <!-- 加密设置按钮 -->
          <button
            v-if="matrixStore.encryptionReady"
            @click="showEncryptionSetup = true"
            class="header-button encryption-button"
            :class="encryptionStatusClass"
            :title="encryptionStatusText"
          >
            <svg viewBox="0 0 24 24">
              <path d="M12,17A2,2 0 0,0 14,15C14,13.89 13.1,13 12,13A2,2 0 0,0 10,15A2,2 0 0,0 12,17M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V10C4,8.89 4.9,8 6,8H7V6A5,5 0 0,1 12,1A5,5 0 0,1 17,6V8H18M12,3A3,3 0 0,0 9,6V8H15V6A3,3 0 0,0 12,3Z"/>
            </svg>
            <span v-if="!matrixStore.crossSigningReady" class="warning-dot"></span>
          </button>

          <!-- 性能监控按钮 -->
          <button
            @click="showPerformanceMonitor = !showPerformanceMonitor"
            class="header-button performance-button"
            title="性能监控"
          >
            <svg viewBox="0 0 24 24">
              <path d="M3,3V21H21V19H5V3H3M9,17H7V10H9V17M13,17H11V7H13V17M17,17H15V13H17V17Z"/>
            </svg>
          </button>

          <button
            @click="showSettings = true"
            class="header-button"
            :title="$t('matrix.settings')"
          >
            <svg viewBox="0 0 24 24">
              <path d="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.22,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.22,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.68 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z"/>
            </svg>
          </button>

          <!-- v39 高级功能按钮 -->
          <button
            @click="openV39Demo"
            class="header-button v39-features-button"
            :class="{ active: showPerformanceMonitor }"
            title="Matrix v39 高级功能"
          >
            <svg viewBox="0 0 24 24">
              <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M11,16.5L6.5,12L7.91,10.59L11,13.67L16.59,8.09L18,9.5L11,16.5Z"/>
            </svg>
          </button>

          <button
            @click="handleLogout"
            class="header-button logout-button"
            :title="$t('matrix.logout')"
          >
            <svg viewBox="0 0 24 24">
              <path d="M16,17V14H9V10H16V7L21,12L16,17M14,2A2,2 0 0,1 16,4V6H14V4H5V20H14V18H16V20A2,2 0 0,1 14,22H5A2,2 0 0,1 3,20V4A2,2 0 0,1 5,2H14Z"/>
            </svg>
          </button>
        </div>
      </div>
      
      <!-- 主内容区域 -->
      <div class="matrix-content">
        <!-- 左侧：房间和空间列表 -->
        <div class="matrix-sidebar">
          <MatrixNavigation 
            @room-selected="handleRoomSelected"
            @create-space="showCreateSpace = true"
          />
        </div>

        <!-- 中间：房间列表 (性能优化版) -->
        <div class="matrix-room-panel">
          <MatrixRoomListOptimized 
            :selected-space="selectedSpace"
            :selected-room="selectedRoom"
            @room-selected="handleRoomSelected"
            @create-room="showCreateRoom = true"
          />
        </div>

        <!-- 右侧：消息区域 -->
        <div class="matrix-message-panel">
          <MatrixMessageAreaV39 
            v-if="selectedRoom"
            :room-id="selectedRoom"
            :replying-to="replyingToMessage"
            :thread-root="threadRootMessage"
            :editing-message="editingMessage"
            @user-clicked="handleUserClicked"
            @message-reply="handleMessageReply"
            @message-edit="handleMessageEdit"
            @thread-start="handleThreadStart"
            @reaction-add="handleReactionAdd"
            @reaction-remove="handleReactionRemove"
            @message-delete="handleMessageDelete"
          />
          <MatrixMessageInputV39
            v-if="selectedRoom"
            :room-id="selectedRoom"
            :replying-to="replyingToMessage"
            :thread-root="threadRootMessage"
            :editing-message="editingMessage"
            @message-sent="handleMessageSent"
            @reply-cancel="replyingToMessage = null"
            @thread-cancel="threadRootMessage = null"
            @edit-cancel="editingMessage = null"
            @edit-save="handleEditSave"
          />
          <div v-else class="no-room-selected">
            <div class="welcome-container">
              <!-- 用户欢迎信息 -->
              <div class="user-welcome-section">
                <div class="user-avatar-large">
                  <img v-if="matrixStore.currentUser?.avatarUrl"
                       :src="matrixStore.currentUser.avatarUrl"
                       :alt="matrixStore.currentUser.displayName" />
                  <div v-else class="avatar-placeholder-large">
                    {{ getUserInitial() }}
                  </div>
                </div>
                <div class="welcome-text">
                  <h1 class="welcome-title">欢迎 {{ matrixStore.currentUser?.displayName || matrixStore.currentUser?.userId }}</h1>
                  <p class="welcome-subtitle">现在，让我们开始你的聊天之旅</p>
                </div>
              </div>

              <!-- 快速操作卡片 -->
              <div class="quick-actions-grid">
                <div class="action-card" @click="showCreateRoom = true">
                  <div class="card-icon create-room">
                    <svg viewBox="0 0 24 24">
                      <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z"/>
                    </svg>
                  </div>
                  <div class="card-content">
                    <h3>发起私聊</h3>
                    <p>与其他用户开始一对一对话</p>
                  </div>
                </div>

                <div class="action-card" @click="showRoomBrowser = true">
                  <div class="card-icon browse-rooms">
                    <svg viewBox="0 0 24 24">
                      <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6M12,8A4,4 0 0,0 8,12A4,4 0 0,0 12,16A4,4 0 0,0 16,12A4,4 0 0,0 12,8Z"/>
                    </svg>
                  </div>
                  <div class="card-content">
                    <h3>探索公共房间</h3>
                    <p>发现并加入感兴趣的社区</p>
                  </div>
                </div>

                <div class="action-card" @click="showCreateRoom = true">
                  <div class="card-icon create-space">
                    <svg viewBox="0 0 24 24">
                      <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6M12,8A4,4 0 0,0 8,12A4,4 0 0,0 12,16A4,4 0 0,0 16,12A4,4 0 0,0 12,8Z"/>
                    </svg>
                  </div>
                  <div class="card-content">
                    <h3>创建一个房间</h3>
                    <p>建立你自己的聊天空间</p>
                  </div>
                </div>
              </div>

              <!-- Matrix协议信息 -->
              <div class="matrix-info-section">
                <div class="protocol-badge">
                  <svg class="protocol-icon" viewBox="0 0 24 24">
                    <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6M12,8A4,4 0 0,0 8,12A4,4 0 0,0 12,16A4,4 0 0,0 16,12A4,4 0 0,0 12,8Z"/>
                  </svg>
                  <span>Matrix 协议</span>
                </div>
                <div class="protocol-features">
                  <div class="feature-item">
                    <svg class="feature-icon" viewBox="0 0 24 24">
                      <path d="M12,17A2,2 0 0,0 14,15C14,13.89 13.1,13 12,13A2,2 0 0,0 10,15A2,2 0 0,0 12,17M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V10C4,8.89 4.9,8 6,8H7V6A5,5 0 0,1 12,1A5,5 0 0,1 17,6V8H18M12,3A3,3 0 0,0 9,6V8H15V6A3,3 0 0,0 12,3Z"/>
                    </svg>
                    <span>端到端加密</span>
                  </div>
                  <div class="feature-item">
                    <svg class="feature-icon" viewBox="0 0 24 24">
                      <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6M12,8A4,4 0 0,0 8,12A4,4 0 0,0 12,16A4,4 0 0,0 16,12A4,4 0 0,0 12,8Z"/>
                    </svg>
                    <span>去中心化网络</span>
                  </div>
                  <div class="feature-item">
                    <svg class="feature-icon" viewBox="0 0 24 24">
                      <path d="M13,9H11V7H13M13,17H11V11H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/>
                    </svg>
                    <span>实时同步</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 创建房间模态框 -->
    <div v-if="showCreateRoom" class="modal-overlay" @click="showCreateRoom = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ $t('matrix.createRoom') }}</h3>
          <button @click="showCreateRoom = false" class="close-btn">×</button>
        </div>
        <form @submit.prevent="createRoom" class="create-room-form">
          <div class="form-group">
            <label>{{ $t('matrix.roomName') }}</label>
            <input v-model="newRoom.name" type="text" required />
          </div>
          <div class="form-group">
            <label>{{ $t('matrix.roomType') }}</label>
            <select v-model="newRoom.isPublic">
              <option :value="false">{{ $t('matrix.privateRoom') }}</option>
              <option :value="true">{{ $t('matrix.publicRoom') }}</option>
            </select>
          </div>
          <div class="form-group">
            <label class="checkbox-label">
              <input type="checkbox" v-model="newRoom.encrypted" />
              {{ $t('matrix.enableEncryption') }}
            </label>
          </div>
          <div class="form-actions">
            <button type="button" @click="showCreateRoom = false">{{ $t('common.cancel') }}</button>
            <button type="submit" :disabled="!newRoom.name.trim()">{{ $t('common.create') }}</button>
          </div>
        </form>
      </div>
    </div>

    <!-- 房间浏览器 -->
    <MatrixRoomBrowser
      v-if="showRoomBrowser"
      @close="showRoomBrowser = false"
      @room-selected="handleRoomSelected"
    />

    <!-- 加密设置模态框 -->
    <div v-if="showEncryptionSetup" class="modal-overlay" @click="showEncryptionSetup = false">
      <div class="encryption-modal" @click.stop>
        <div class="modal-header">
          <h3>🔐 端到端加密设置</h3>
          <button @click="showEncryptionSetup = false" class="close-btn">×</button>
        </div>
        <div class="encryption-content">
          <div class="encryption-status">
            <div class="status-item">
              <span class="status-label">加密引擎:</span>
              <span :class="['status-value', matrixStore.encryptionReady ? 'ready' : 'not-ready']">
                {{ matrixStore.encryptionReady ? '✅ 已就绪' : '❌ 未就绪' }}
              </span>
            </div>
            <div class="status-item">
              <span class="status-label">交叉签名:</span>
              <span :class="['status-value', matrixStore.crossSigningReady ? 'ready' : 'not-ready']">
                {{ matrixStore.crossSigningReady ? '✅ 已设置' : '⚠️ 未设置' }}
              </span>
            </div>
            <div class="status-item">
              <span class="status-label">密钥备份:</span>
              <span :class="['status-value', matrixStore.keyBackupEnabled ? 'ready' : 'not-ready']">
                {{ matrixStore.keyBackupEnabled ? '✅ 已启用' : '❌ 未启用' }}
              </span>
            </div>
          </div>
          
          <div class="encryption-actions">
            <button 
              v-if="!matrixStore.crossSigningReady"
              @click="setupCrossSigning"
              class="encryption-btn primary"
            >
              设置交叉签名
            </button>
            <button 
              v-if="!matrixStore.keyBackupEnabled"
              @click="setupKeyBackup"
              class="encryption-btn secondary"
            >
              启用密钥备份
            </button>
            <button 
              @click="verifyDevice"
              class="encryption-btn secondary"
            >
              验证设备
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- v39 高级功能面板 -->
    <div v-if="showPerformanceMonitor" class="v39-features-panel">
      <div class="panel-header">
        <h4>� 性Matrix v39 高级功能</h4>
        <button @click="showPerformanceMonitor = false" class="close-btn">×</button>
      </div>
      
      <!-- 功能标签页 -->
      <div class="feature-tabs">
        <button 
          class="tab-btn"
          :class="{ active: activeFeatureTab === 'performance' }"
          @click="activeFeatureTab = 'performance'"
        >
          📊 性能
        </button>
        <button 
          class="tab-btn"
          :class="{ active: activeFeatureTab === 'encryption' }"
          @click="activeFeatureTab = 'encryption'"
        >
          🔐 加密
        </button>
        <button 
          class="tab-btn"
          :class="{ active: activeFeatureTab === 'features' }"
          @click="activeFeatureTab = 'features'"
        >
          ✨ 功能
        </button>
      </div>

      <!-- 性能监控 -->
      <div v-if="activeFeatureTab === 'performance'" class="tab-content">
        <div class="performance-metrics">
          <div class="metric-item">
            <span class="metric-label">内存使用:</span>
            <span class="metric-value">{{ formatMemoryUsage() }}</span>
          </div>
          <div class="metric-item">
            <span class="metric-label">网络延迟:</span>
            <span class="metric-value">{{ getNetworkLatency() }}ms</span>
          </div>
          <div class="metric-item">
            <span class="metric-label">同步状态:</span>
            <span class="metric-value">{{ getSyncStatus() }}</span>
          </div>
          <div class="metric-item">
            <span class="metric-label">消息缓存:</span>
            <span class="metric-value">{{ getMessageCacheSize() }}</span>
          </div>
        </div>
        <div class="performance-actions">
          <button @click="handlePerformanceReport" class="perf-btn">生成报告</button>
          <button @click="clearCache" class="perf-btn">清理缓存</button>
        </div>
      </div>

      <!-- 加密管理 -->
      <div v-if="activeFeatureTab === 'encryption'" class="tab-content">
        <div class="encryption-status-grid">
          <div class="status-item">
            <span class="status-label">加密引擎:</span>
            <span :class="['status-value', matrixStore.encryptionReady ? 'ready' : 'not-ready']">
              {{ matrixStore.encryptionReady ? '✅ 已启用' : '❌ 未启用' }}
            </span>
          </div>
          <div class="status-item">
            <span class="status-label">交叉签名:</span>
            <span :class="['status-value', matrixStore.crossSigningReady ? 'ready' : 'not-ready']">
              {{ matrixStore.crossSigningReady ? '✅ 已设置' : '⚠️ 未设置' }}
            </span>
          </div>
          <div class="status-item">
            <span class="status-label">密钥备份:</span>
            <span :class="['status-value', matrixStore.keyBackupEnabled ? 'ready' : 'not-ready']">
              {{ matrixStore.keyBackupEnabled ? '✅ 已启用' : '❌ 未启用' }}
            </span>
          </div>
        </div>
        <div class="encryption-actions">
          <button 
            v-if="!matrixStore.crossSigningReady"
            @click="setupCrossSigning"
            class="perf-btn primary"
          >
            设置交叉签名
          </button>
          <button 
            v-if="!matrixStore.keyBackupEnabled"
            @click="setupKeyBackup"
            class="perf-btn"
          >
            启用密钥备份
          </button>
          <button @click="verifyDevice" class="perf-btn">验证设备</button>
        </div>
      </div>

      <!-- 新功能展示 -->
      <div v-if="activeFeatureTab === 'features'" class="tab-content">
        <div class="features-list">
          <div class="feature-item">
            <div class="feature-icon">🧵</div>
            <div class="feature-info">
              <h5>线程支持</h5>
              <p>支持消息线程回复</p>
            </div>
            <div class="feature-status">{{ matrixStore.supportsThreads ? '✅' : '❌' }}</div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">👍</div>
            <div class="feature-info">
              <h5>消息反应</h5>
              <p>Emoji 反应系统</p>
            </div>
            <div class="feature-status">✅</div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">✏️</div>
            <div class="feature-info">
              <h5>消息编辑</h5>
              <p>编辑和删除消息</p>
            </div>
            <div class="feature-status">✅</div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">🌌</div>
            <div class="feature-info">
              <h5>空间管理</h5>
              <p>Matrix 空间支持</p>
            </div>
            <div class="feature-status">{{ matrixStore.supportsSpaces ? '✅' : '❌' }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 公共房间探索器 -->
    <div v-if="showPublicRoomsExplorer" class="modal-overlay" @click="showPublicRoomsExplorer = false">
      <div class="public-rooms-modal" @click.stop>
        <div class="modal-header">
          <h3>🌍 探索公共房间</h3>
          <button @click="showPublicRoomsExplorer = false" class="close-btn">×</button>
        </div>
        <div class="modal-body">
          <PublicRoomsExplorer @room-joined="handleRoomJoined" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useMatrixV39Store } from '@/stores/matrix-v39-clean'
import { invitationAPI, roomAPI } from '@/services/api'

// 组件导入
import MatrixRealLogin from '@/components/MatrixRealLogin.vue'
import MatrixNavigation from '@/components/MatrixNavigation.vue'
import MatrixRoomListOptimized from '@/components/MatrixRoomListOptimized.vue'
import MatrixMessageAreaV39 from '@/components/MatrixMessageAreaV39.vue'
import MatrixMessageInputV39 from '@/components/MatrixMessageInputV39.vue'
import MatrixUserID from '@/components/MatrixUserID.vue'
import MatrixChatDemo from '@/components/MatrixChatDemo.vue'
import MatrixRoomBrowser from '@/components/MatrixRoomBrowser.vue'
import PublicRoomsExplorer from '@/components/PublicRoomsExplorer.vue'

// Store - 使用新的 v39 版本
const matrixStore = useMatrixV39Store()

// 界面状态
const selectedServer = ref(localStorage.getItem('matrix-selected-server') || 'matrix.org')
const selectedSpace = ref('')
const selectedRoom = ref('')
const userStatus = ref<'online' | 'offline' | 'away' | 'busy'>('online')

// 模态框状态
const showCreateRoom = ref(false)
const showCreateSpace = ref(false)
const showRoomBrowser = ref(false)
const showPublicRoomsExplorer = ref(false)
const showInvitations = ref(false)
const showSettings = ref(false)
const showUserProfile = ref(false)

// 表单数据
const newRoom = ref({
  name: '',
  isPublic: false,
  encrypted: true
})

// 邀请计数
const pendingInvitations = ref(0)

// v39 新功能状态
const replyingToMessage = ref<any>(null)
const threadRootMessage = ref<any>(null)
const editingMessage = ref<any>(null)
const showEncryptionSetup = ref(false)
const showPerformanceMonitor = ref(false)
const activeFeatureTab = ref('performance')

// 加密状态计算属性
const encryptionStatusClass = computed(() => {
  if (!matrixStore.encryptionReady) return 'encryption-not-ready'
  if (!matrixStore.crossSigningReady) return 'encryption-warning'
  return 'encryption-ready'
})

const encryptionStatusText = computed(() => {
  if (!matrixStore.encryptionReady) return '加密未就绪'
  if (!matrixStore.crossSigningReady) return '需要设置交叉签名'
  return '加密已就绪'
})

// JWT认证状态
const hasJwtToken = computed(() => {
  return !!localStorage.getItem('token')
})

// 事件处理

// 真正的Matrix登录成功处理
const handleRealLoginSuccess = async (loginInfo: { userId: string; homeserver: string }) => {
  console.log('Matrix login successful:', loginInfo)

  // 更新选择的服务器
  selectedServer.value = loginInfo.homeserver
  localStorage.setItem('matrix-selected-server', loginInfo.homeserver)

  try {
    // Matrix客户端已经在MatrixRealLogin组件中启动
    // 这里只需要等待同步完成并获取房间列表
    await matrixStore.startSync()

    // 获取邀请数量
    await loadPendingInvitations()

    // 默认选择世界频道或第一个可用房间
    const rooms = matrixStore.rooms
    if (rooms.length > 0) {
      const worldChannel = rooms.find(room => room.name?.includes('world') || room.name?.includes('世界'))
      selectedRoom.value = worldChannel?.id || rooms[0].id
    }
  } catch (error) {
    console.error('Failed to initialize Matrix client:', error)
  }
}

const handleRoomSelected = (roomId: string) => {
  selectedRoom.value = roomId
  // 标记房间为已读
  matrixStore.markRoomAsRead(roomId)
}

const handleRoomJoined = (roomId: string) => {
  // 关闭公共房间探索器
  showPublicRoomsExplorer.value = false
  // 自动选择刚加入的房间
  selectedRoom.value = roomId
  // 标记房间为已读
  matrixStore.markRoomAsRead(roomId)
  console.log(`🎉 已自动切换到新加入的房间: ${roomId}`)
}

const handleUserClicked = (userId: string) => {
  console.log('User clicked:', userId)
}

const handleLogout = () => {
  // 确认登出
  if (confirm('确定要退出登录吗？')) {
    matrixStore.logout()
    // 清除本地状态
    selectedRoom.value = ''
    selectedSpace.value = ''
    pendingInvitations.value = 0
    console.log('User logged out')
  }
}

const getUserInitial = () => {
  const user = matrixStore.currentUser
  if (user?.displayName) {
    return user.displayName.charAt(0).toUpperCase()
  }
  if (user?.userId) {
    return user.userId.charAt(1).toUpperCase() // 跳过@符号
  }
  return 'U'
}

const createRoom = async () => {
  if (!newRoom.value.name.trim()) return
  
  try {
    // 使用新的 v39 创建房间功能
    await matrixStore.createRoom({
      name: newRoom.value.name.trim(),
      topic: '',
      isPublic: newRoom.value.isPublic,
      encrypted: newRoom.value.encrypted
    })
    
    showCreateRoom.value = false
    newRoom.value = { name: '', isPublic: false, encrypted: true }
    
    // 刷新房间列表
    await matrixStore.fetchMatrixRooms()
  } catch (error) {
    console.error('Failed to create room:', error)
  }
}

// v39 新功能事件处理
const handleMessageReply = (message: any) => {
  replyingToMessage.value = message
  console.log('回复消息:', message)
}

const handleMessageEdit = (message: any) => {
  editingMessage.value = message
  console.log('编辑消息:', message)
}

const handleThreadStart = (message: any) => {
  threadRootMessage.value = message
  console.log('开始线程:', message)
}

const handleMessageSent = async (content: string) => {
  console.log('消息已发送:', content)
  // 清除回复/编辑状态
  replyingToMessage.value = null
  threadRootMessage.value = null
  editingMessage.value = null
  
  // 刷新消息列表
  if (selectedRoom.value) {
    try {
      await matrixStore.fetchMatrixMessages(selectedRoom.value)
    } catch (error) {
      console.error('刷新消息失败:', error)
    }
  }
}

const handleEditSave = async (messageId: string, newContent: string) => {
  try {
    await matrixStore.editMessage(selectedRoom.value, messageId, newContent)
    console.log('消息编辑保存:', messageId, newContent)
    editingMessage.value = null
  } catch (error) {
    console.error('编辑消息失败:', error)
  }
}

// v39 高级功能处理函数
const handleReactionAdd = async (eventId: string, reaction: string) => {
  try {
    await matrixStore.addReaction(selectedRoom.value, eventId, reaction)
  } catch (error) {
    console.error('添加反应失败:', error)
  }
}

const handleReactionRemove = async (eventId: string, reaction: string) => {
  try {
    await matrixStore.removeReaction(selectedRoom.value, eventId, reaction)
  } catch (error) {
    console.error('移除反应失败:', error)
  }
}

const handleMessageDelete = async (eventId: string) => {
  if (confirm('确定要删除这条消息吗？')) {
    try {
      await matrixStore.redactMessage(selectedRoom.value, eventId)
    } catch (error) {
      console.error('删除消息失败:', error)
    }
  }
}

const handleEncryptionSetup = async () => {
  try {
    showEncryptionSetup.value = true
    // 这里可以打开加密设置页面或模态框
  } catch (error) {
    console.error('打开加密设置失败:', error)
  }
}

const handlePerformanceReport = () => {
  const metrics = matrixStore.getPerformanceMetrics()
  console.log('性能指标:', metrics)
  matrixStore.logPerformanceReport()
}

// 加密设置相关函数
const setupCrossSigning = async () => {
  try {
    const password = prompt('请输入您的Matrix密码以设置交叉签名:')
    if (password) {
      await matrixStore.setupCrossSigning(password)
      console.log('交叉签名设置成功')
    }
  } catch (error) {
    console.error('设置交叉签名失败:', error)
    alert('设置交叉签名失败: ' + error.message)
  }
}

const setupKeyBackup = async () => {
  try {
    await matrixStore.setupKeyBackup()
    console.log('密钥备份设置成功')
  } catch (error) {
    console.error('设置密钥备份失败:', error)
    alert('设置密钥备份失败: ' + error.message)
  }
}

const verifyDevice = async () => {
  try {
    // 这里可以打开设备验证流程
    console.log('开始设备验证流程')
    alert('设备验证功能正在开发中')
  } catch (error) {
    console.error('设备验证失败:', error)
  }
}

// 性能监控相关函数
const formatMemoryUsage = () => {
  const metrics = matrixStore.getPerformanceMetrics()
  return metrics?.memoryUsage ? `${(metrics.memoryUsage / 1024 / 1024).toFixed(1)}MB` : 'N/A'
}

const getNetworkLatency = () => {
  const metrics = matrixStore.getPerformanceMetrics()
  return metrics?.networkLatency || 0
}

const getSyncStatus = () => {
  return matrixStore.syncState || 'STOPPED'
}

const getMessageCacheSize = () => {
  const metrics = matrixStore.getPerformanceMetrics()
  return metrics?.messageCacheSize || 0
}

const clearCache = async () => {
  try {
    await matrixStore.clearCache()
    console.log('缓存已清理')
  } catch (error) {
    console.error('清理缓存失败:', error)
  }
}

const openV39Demo = () => {
  // 切换显示高级功能面板
  showPerformanceMonitor.value = !showPerformanceMonitor.value
}

const loadPendingInvitations = async () => {
  // 检查是否有JWT token，如果没有则跳过邀请加载
  const token = localStorage.getItem('token')
  if (!token) {
    console.log('No JWT token found, skipping invitation loading')
    pendingInvitations.value = 0
    return
  }

  try {
    const response = await invitationAPI.getReceivedInvitations()
    // 后端返回的数据结构是 { invitations: [...] }
    const invitations = response.data.invitations || []
    pendingInvitations.value = invitations.filter((inv: any) => inv.status === 'PENDING').length
  } catch (error) {
    console.error('Failed to load invitations:', error)
    // 如果请求失败，设置为0避免无限重试
    pendingInvitations.value = 0
  }
}

// 监听Matrix房间变化，自动选择世界频道
watch(() => matrixStore.rooms, (rooms) => {
  if (rooms.length > 0 && !selectedRoom.value) {
    const worldChannel = rooms.find(room => room.type === 'world')
    if (worldChannel) {
      selectedRoom.value = worldChannel.id
    }
  }
}, { immediate: true })

// 初始化
onMounted(async () => {
  try {
    // 检查是否已经初始化，避免重复初始化
    if (matrixStore.matrixClient && matrixStore.isConnected) {
      console.log('Matrix已经初始化，跳过重复初始化')
    } else {
      // 尝试从localStorage恢复登录状态
      const restored = await matrixStore.initializeMatrix()

      if (restored) {
        console.log('Matrix login restored from localStorage')
      }
    }

    // 恢复服务器选择
    const savedServer = localStorage.getItem('matrix-selected-server')
    if (savedServer) {
      selectedServer.value = savedServer
    }

    // 加载邀请和房间信息
    await loadPendingInvitations()

    // 选择默认房间
    const rooms = matrixStore.rooms
    if (rooms.length > 0) {
      const worldChannel = rooms.find(room => room.name?.includes('world') || room.name?.includes('世界'))
      selectedRoom.value = worldChannel?.id || rooms[0].id
    }
  } catch (error) {
    console.error('Failed to restore Matrix login:', error)
  }

  // 如果已经登录（可能是刚刚恢复的），直接初始化
  if (matrixStore.isLoggedIn) {
    loadPendingInvitations()
  }
})
</script>

<style scoped>
.matrix-client {
  height: 100vh;
  background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%);
  color: #e0e6ed;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.matrix-main-interface {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.matrix-header {
  height: 60px;
  background: rgba(0, 0, 0, 0.3);
  border-bottom: 1px solid #3a4a5c;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  backdrop-filter: blur(10px);
}

.server-info {
  display: flex;
  align-items: center;
  gap: 20px;
}

.server-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
}

.server-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #4caf50;
}

.server-name {
  font-weight: 600;
  color: #64b5f6;
}

.federation-badge {
  background: rgba(129, 199, 132, 0.2);
  color: #81c784;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  border: 1px solid rgba(129, 199, 132, 0.3);
}

.header-actions {
  display: flex;
  gap: 8px;
}

.header-button {
  width: 40px;
  height: 40px;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  position: relative;
}

.header-button:hover {
  background: rgba(255, 255, 255, 0.2);
}

.header-button.logout-button {
  background: rgba(255, 107, 107, 0.1);
  border: 1px solid rgba(255, 107, 107, 0.3);
}

.header-button.logout-button:hover {
  background: rgba(255, 107, 107, 0.2);
  border-color: rgba(255, 107, 107, 0.5);
}

.header-button.logout-button svg {
  fill: #ff6b6b;
}

.header-button svg {
  width: 20px;
  height: 20px;
  fill: #e0e6ed;
}

.notification-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background: #f44336;
  color: white;
  border-radius: 10px;
  padding: 2px 6px;
  font-size: 0.7rem;
  min-width: 16px;
  text-align: center;
}

.matrix-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.matrix-sidebar {
  width: 280px;
  background: rgba(0, 0, 0, 0.2);
  border-right: 1px solid #3a4a5c;
}

.matrix-room-panel {
  width: 320px;
  background: rgba(0, 0, 0, 0.1);
  border-right: 1px solid #3a4a5c;
}

.matrix-message-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.no-room-selected {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.welcome-container {
  max-width: 800px;
  width: 100%;
  text-align: center;
}

/* 用户欢迎区域 */
.user-welcome-section {
  margin-bottom: 48px;
}

.user-avatar-large {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  margin: 0 auto 24px;
  overflow: hidden;
  border: 3px solid #00ff88;
  box-shadow: 0 0 20px rgba(0, 255, 136, 0.3);
}

.user-avatar-large img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder-large {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #00ff88 0%, #64b5f6 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: bold;
  color: #0f0f23;
}

.welcome-title {
  font-size: 2.5rem;
  color: #00ff88;
  margin-bottom: 8px;
  font-weight: 700;
  text-shadow: 0 0 10px rgba(0, 255, 136, 0.5);
}

.welcome-subtitle {
  font-size: 1.2rem;
  color: #64b5f6;
  margin-bottom: 0;
}

/* 快速操作卡片网格 */
.quick-actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 48px;
}

.action-card {
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(0, 255, 136, 0.2);
  border-radius: 16px;
  padding: 32px 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.action-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(0, 255, 136, 0.05) 0%, rgba(100, 181, 246, 0.05) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.action-card:hover {
  border-color: #00ff88;
  transform: translateY(-4px);
  box-shadow: 0 8px 32px rgba(0, 255, 136, 0.2);
}

.action-card:hover::before {
  opacity: 1;
}

.card-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  position: relative;
  z-index: 1;
}

.card-icon.create-room {
  background: linear-gradient(135deg, #00ff88 0%, #00cc6a 100%);
}

.card-icon.browse-rooms {
  background: linear-gradient(135deg, #64b5f6 0%, #42a5f5 100%);
}

.card-icon.create-space {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);
}

.card-icon svg {
  width: 28px;
  height: 28px;
  fill: #ffffff;
}

.card-content {
  position: relative;
  z-index: 1;
}

.card-content h3 {
  font-size: 1.3rem;
  color: #e0e6ed;
  margin-bottom: 8px;
  font-weight: 600;
}

.card-content p {
  color: #b0bec5;
  font-size: 0.95rem;
  line-height: 1.5;
  margin: 0;
}

/* Matrix协议信息区域 */
.matrix-info-section {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(100, 181, 246, 0.2);
  border-radius: 16px;
  padding: 32px;
  backdrop-filter: blur(10px);
}

.protocol-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 24px;
  font-size: 1.2rem;
  font-weight: 600;
  color: #64b5f6;
}

.protocol-icon {
  width: 24px;
  height: 24px;
  fill: currentColor;
}

.protocol-features {
  display: flex;
  justify-content: center;
  gap: 32px;
  flex-wrap: wrap;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #00ff88;
  font-size: 0.95rem;
  font-weight: 500;
}

.feature-icon {
  width: 18px;
  height: 18px;
  fill: currentColor;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .welcome-container {
    padding: 20px;
  }

  .welcome-title {
    font-size: 2rem;
  }

  .quick-actions-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .protocol-features {
    flex-direction: column;
    gap: 16px;
  }
}

/* 模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border: 1px solid #3a4a5c;
  border-radius: 12px;
  padding: 24px;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.modal-header h3 {
  color: #64b5f6;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  color: #b0bec5;
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.create-room-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  color: #b0bec5;
  font-size: 0.9rem;
  font-weight: 500;
}

/* 快速登录样式 */
.quick-login-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.quick-login-modal {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border: 1px solid #3a4a5c;
  border-radius: 16px;
  padding: 32px;
  max-width: 500px;
  width: 90%;
  color: #e0e6ed;
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.login-header h3 {
  color: #64b5f6;
  font-size: 1.8rem;
  margin-bottom: 8px;
}

.login-header p {
  color: #b0bec5;
  font-size: 1rem;
}

.demo-credentials {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
}

.credential-option {
  display: flex;
  align-items: center;
  padding: 20px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.credential-option:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: #64b5f6;
  transform: translateY(-2px);
}

.option-icon {
  font-size: 2rem;
  margin-right: 16px;
}

.option-content {
  flex: 1;
}

.option-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #e0e6ed;
  margin-bottom: 4px;
}

.option-desc {
  font-size: 0.9rem;
  color: #b0bec5;
}

.custom-login-form {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.matrix-id-input {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  overflow: hidden;
}

.id-prefix,
.id-suffix {
  padding: 12px;
  background: rgba(255, 255, 255, 0.1);
  color: #b0bec5;
  font-size: 0.9rem;
}

.form-input {
  flex: 1;
  padding: 12px;
  background: transparent;
  border: none;
  color: #e0e6ed;
  font-size: 1rem;
}

.form-input:focus {
  outline: none;
}

.form-input::placeholder {
  color: #666;
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.btn-secondary,
.btn-primary {
  flex: 1;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: #e0e6ed;
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.2);
}

.btn-primary {
  background: #64b5f6;
  color: #1a1a2e;
}

.btn-primary:hover {
  background: #42a5f5;
}

.btn-primary:disabled {
  background: #555;
  color: #999;
  cursor: not-allowed;
}

.form-group input,
.form-group select {
  padding: 10px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid #3a4a5c;
  border-radius: 6px;
  color: #e0e6ed;
  font-size: 0.9rem;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #64b5f6;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 8px;
}

.form-actions button {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.form-actions button[type="button"] {
  background: rgba(255, 255, 255, 0.1);
  color: #e0e6ed;
}

.form-actions button[type="submit"] {
  background: #4caf50;
  color: white;
}

.form-actions button:disabled {
  background: #555;
  color: #999;
  cursor: not-allowed;
}

.form-actions button:not(:disabled):hover {
  transform: translateY(-1px);
}

/* 公共房间探索器样式 */
.public-rooms-modal {
  background: #0f0f23;
  border: 2px solid #00ff88;
  border-radius: 12px;
  width: 90vw;
  max-width: 1200px;
  height: 80vh;
  max-height: 800px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.public-rooms-modal .modal-header {
  background: rgba(0, 255, 136, 0.1);
  border-bottom: 1px solid #00ff88;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.public-rooms-modal .modal-header h3 {
  margin: 0;
  color: #00ff88;
  font-size: 1.5rem;
  text-shadow: 0 0 10px rgba(0, 255, 136, 0.5);
}

.public-rooms-modal .modal-body {
  flex: 1;
  overflow: hidden;
}

.quick-action-btn.primary {
  background: linear-gradient(45deg, #ff6b6b, #ee5a52);
  color: white;
  border: 2px solid #ff6b6b;
  animation: pulse 2s infinite;
}

.quick-action-btn.primary:hover {
  background: linear-gradient(45deg, #ff5252, #d32f2f);
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(255, 107, 107, 0.4);
}

@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(255, 107, 107, 0.7); }
  70% { box-shadow: 0 0 0 10px rgba(255, 107, 107, 0); }
  100% { box-shadow: 0 0 0 0 rgba(255, 107, 107, 0); }
}

/* 加密按钮状态样式 */
.encryption-button {
  position: relative;
}

.encryption-button.encryption-ready {
  background: rgba(76, 175, 80, 0.2);
  border: 1px solid rgba(76, 175, 80, 0.5);
}

.encryption-button.encryption-warning {
  background: rgba(255, 193, 7, 0.2);
  border: 1px solid rgba(255, 193, 7, 0.5);
}

.encryption-button.encryption-not-ready {
  background: rgba(244, 67, 54, 0.2);
  border: 1px solid rgba(244, 67, 54, 0.5);
}

.warning-dot {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 8px;
  height: 8px;
  background: #ff9800;
  border-radius: 50%;
  animation: blink 1s infinite;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0.3; }
}

/* 性能监控按钮样式 */
.performance-button {
  background: rgba(33, 150, 243, 0.2);
  border: 1px solid rgba(33, 150, 243, 0.5);
}

.performance-button:hover {
  background: rgba(33, 150, 243, 0.3);
}

/* v39 演示按钮样式 */
.v39-demo-button {
  background: linear-

/* 加密设置模态框样式 */
.encryption-modal {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border: 2px solid #4caf50;
  border-radius: 16px;
  padding: 32px;
  max-width: 600px;
  width: 90%;
  color: #e0e6ed;
}

.encryption-content {
  margin-top: 24px;
}

.encryption-status {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.status-item:last-child {
  border-bottom: none;
}

.status-label {
  font-weight: 500;
  color: #b0bec5;
}

.status-value {
  font-weight: 600;
}

.status-value.ready {
  color: #4caf50;
}

.status-value.not-ready {
  color: #ff6b6b;
}

.encryption-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.encryption-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.encryption-btn.primary {
  background: #4caf50;
  color: white;
}

.encryption-btn.secondary {
  background: rgba(255, 255, 255, 0.1);
  color: #e0e6ed;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.encryption-btn:hover {
  transform: translateY(-2px);
}

/* v39 高级功能按钮样式 */
.v39-features-button {
  background: rgba(0, 255, 136, 0.2);
  border: 1px solid rgba(0, 255, 136, 0.5);
}

.v39-features-button:hover {
  background: rgba(0, 255, 136, 0.3);
}

.v39-features-button.active {
  background: rgba(0, 255, 136, 0.4);
  border-color: #00ff88;
}

/* v39 高级功能面板样式 */
.v39-features-panel {
  position: fixed;
  top: 80px;
  right: 20px;
  width: 380px;
  max-height: 600px;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border: 2px solid #00ff88;
  border-radius: 12px;
  padding: 20px;
  z-index: 999;
  color: #e0e6ed;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  overflow-y: auto;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.panel-header h4 {
  margin: 0;
  color: #2196f3;
  font-size: 1.1rem;
}

.performance-metrics {
  margin-bottom: 16px;
}

.metric-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.metric-item:last-child {
  border-bottom: none;
}

.metric-label {
  font-size: 0.9rem;
  color: #b0bec5;
}

.metric-value {
  font-weight: 600;
  color: #2196f3;
}

.performance-actions {
  display: flex;
  gap: 8px;
}

.perf-btn {
  flex: 1;
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  background: rgba(33, 150, 243, 0.2);
  color: #2196f3;
  border: 1px solid rgba(33, 150, 243, 0.3);
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.3s ease;
}

.perf-btn:hover {
  background: rgba(33, 150, 243, 0.3);
  transform: translateY(-1px);
}

/* 功能标签页样式 */
.feature-tabs {
  display: flex;
  gap: 4px;
  margin-bottom: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 8px;
}

.tab-btn {
  flex: 1;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: #e0e6ed;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.3s ease;
}

.tab-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.tab-btn.active {
  background: rgba(0, 255, 136, 0.2);
  border-color: #00ff88;
  color: #00ff88;
}

.tab-content {
  min-height: 200px;
}

/* 加密状态网格 */
.encryption-status-grid {
  margin-bottom: 16px;
}

.encryption-status-grid .status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.encryption-status-grid .status-item:last-child {
  border-bottom: none;
}

.encryption-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.perf-btn.primary {
  background: rgba(0, 255, 136, 0.2);
  border-color: #00ff88;
  color: #00ff88;
}

/* 功能列表样式 */
.features-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.feature-icon {
  font-size: 1.5rem;
  width: 32px;
  text-align: center;
}

.feature-info {
  flex: 1;
}

.feature-info h5 {
  margin: 0 0 4px 0;
  font-size: 0.9rem;
  color: #e0e6ed;
}

.feature-info p {
  margin: 0;
  font-size: 0.8rem;
  color: #b0bec5;
}

.feature-status {
  font-size: 1.2rem;
}
</style>
