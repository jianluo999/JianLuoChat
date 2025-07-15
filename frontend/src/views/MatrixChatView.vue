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
            @click="showInvitations = true"
            class="header-button"
            :title="$t('matrix.invitations')"
          >
            <svg viewBox="0 0 24 24">
              <path d="M15,14C12.33,14 7,15.33 7,18V20H23V18C23,15.33 17.67,14 15,14M6,10V7H4V10H1V12H4V15H6V12H9V10M15,12A4,4 0 0,0 19,8A4,4 0 0,0 15,4A4,4 0 0,0 11,8A4,4 0 0,0 15,12Z"/>
            </svg>
            <span v-if="pendingInvitations > 0" class="notification-badge">{{ pendingInvitations }}</span>
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

        <!-- 中间：房间列表 -->
        <div class="matrix-room-panel">
          <MatrixRoomList 
            :selected-space="selectedSpace"
            :selected-room="selectedRoom"
            @room-selected="handleRoomSelected"
            @create-room="showCreateRoom = true"
          />
        </div>

        <!-- 右侧：消息区域 -->
        <div class="matrix-message-panel">
          <MatrixMessageArea 
            v-if="selectedRoom"
            :room-id="selectedRoom"
            @user-clicked="handleUserClicked"
          />
          <div v-else class="no-room-selected">
            <div class="welcome-message">
              <h2>{{ $t('matrix.welcome') }}</h2>
              <p>{{ $t('matrix.selectRoomToStart') }}</p>

              <!-- Matrix聊天演示 -->
              <div class="matrix-demo-container">
                <MatrixChatDemo />
              </div>

              <div class="quick-actions">
                <button @click="showCreateRoom = true" class="quick-action-btn">
                  {{ $t('matrix.createRoom') }}
                </button>
                <button @click="showRoomBrowser = true" class="quick-action-btn">
                  {{ $t('matrix.browseRooms') }}
                </button>
                <button @click="showPublicRoomsExplorer = true" class="quick-action-btn primary">
                  🌍 探索公共房间
                </button>
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
import { useMatrixStore } from '@/stores/matrix'
import { invitationAPI, roomAPI } from '@/services/api'

// 组件导入
import MatrixRealLogin from '@/components/MatrixRealLogin.vue'
import MatrixNavigation from '@/components/MatrixNavigation.vue'
import MatrixRoomList from '@/components/MatrixRoomList.vue'
import MatrixMessageArea from '@/components/MatrixMessageArea.vue'
import MatrixUserID from '@/components/MatrixUserID.vue'
import MatrixChatDemo from '@/components/MatrixChatDemo.vue'
import MatrixRoomBrowser from '@/components/MatrixRoomBrowser.vue'
import PublicRoomsExplorer from '@/components/PublicRoomsExplorer.vue'

// Store
const matrixStore = useMatrixStore()

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

const createRoom = async () => {
  if (!newRoom.value.name.trim()) return
  
  try {
    await roomAPI.createRoom({
      name: newRoom.value.name.trim(),
      type: newRoom.value.isPublic ? 'public' : 'private'
    })
    
    showCreateRoom.value = false
    newRoom.value = { name: '', isPublic: false, encrypted: true }
    
    // 刷新房间列表
    await matrixStore.fetchRooms()
  } catch (error) {
    console.error('Failed to create room:', error)
  }
}

const loadPendingInvitations = async () => {
  try {
    const response = await invitationAPI.getReceivedInvitations()
    pendingInvitations.value = response.data.filter((inv: any) => inv.status === 'pending').length
  } catch (error) {
    console.error('Failed to load invitations:', error)
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
    // 尝试从localStorage恢复登录状态
    const restored = await matrixStore.initializeMatrix()

    if (restored) {
      console.log('Matrix login restored from localStorage')
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
}

.welcome-message {
  text-align: center;
  max-width: 400px;
}

.welcome-message h2 {
  color: #64b5f6;
  margin-bottom: 16px;
}

.welcome-message p {
  color: #b0bec5;
  margin-bottom: 24px;
}

.matrix-demo-container {
  margin: 30px 0;
  text-align: left;
  max-width: 900px;
}

.quick-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.quick-action-btn {
  padding: 12px 24px;
  background: #64b5f6;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.3s ease;
}

.quick-action-btn:hover {
  background: #42a5f5;
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
</style>
