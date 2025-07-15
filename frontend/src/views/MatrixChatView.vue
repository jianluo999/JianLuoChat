<template>
  <div class="matrix-client">
    <!-- Matrix服务器选择 -->
    <MatrixServerSelector 
      v-if="showServerSelector"
      @server-selected="handleServerSelected"
      @cancel="showServerSelector = false"
    />
    
    <!-- Matrix登录界面 -->
    <MatrixLogin 
      v-else-if="!matrixStore.isLoggedIn" 
      :selected-server="selectedServer"
      @login-success="handleLoginSuccess"
      @change-server="showServerSelector = true"
    />
    
    <!-- Matrix主界面 -->
    <div v-else class="matrix-main-interface">
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
              <div class="quick-actions">
                <button @click="showCreateRoom = true" class="quick-action-btn">
                  {{ $t('matrix.createRoom') }}
                </button>
                <button @click="showRoomBrowser = true" class="quick-action-btn">
                  {{ $t('matrix.browseRooms') }}
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useMatrixStore } from '@/stores/matrix'
import { useAuthStore } from '@/stores/auth'
import { invitationAPI, roomAPI } from '@/services/api'

// 组件导入
import MatrixServerSelector from '@/components/MatrixServerSelector.vue'
import MatrixLogin from '@/components/MatrixLogin.vue'
import MatrixNavigation from '@/components/MatrixNavigation.vue'
import MatrixRoomList from '@/components/MatrixRoomList.vue'
import MatrixMessageArea from '@/components/MatrixMessageArea.vue'
import MatrixUserID from '@/components/MatrixUserID.vue'

// Store
const matrixStore = useMatrixStore()
const authStore = useAuthStore()

// 界面状态
const showServerSelector = ref(false)
const selectedServer = ref(localStorage.getItem('matrix-selected-server') || 'matrix.org')
const selectedSpace = ref('')
const selectedRoom = ref('')
const userStatus = ref<'online' | 'offline' | 'away' | 'busy'>('online')

// 模态框状态
const showCreateRoom = ref(false)
const showCreateSpace = ref(false)
const showRoomBrowser = ref(false)
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
const handleServerSelected = (server: string) => {
  selectedServer.value = server
  showServerSelector.value = false
  localStorage.setItem('matrix-selected-server', server)
}

const handleLoginSuccess = async () => {
  console.log('Matrix login successful')
  
  try {
    // 开始Matrix同步
    await matrixStore.startSync()
    
    // 获取房间列表
    await matrixStore.fetchRooms()
    
    // 获取邀请数量
    await loadPendingInvitations()
    
    // 默认选择世界频道
    const worldChannel = matrixStore.rooms.find(room => room.type === 'world')
    if (worldChannel) {
      selectedRoom.value = worldChannel.id
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

const handleUserClicked = (userId: string) => {
  console.log('User clicked:', userId)
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

// 初始化
onMounted(() => {
  // 检查是否已经登录
  if (matrixStore.isLoggedIn) {
    handleLoginSuccess()
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
  opacity: 0.6;
  cursor: not-allowed;
}

.form-actions button:not(:disabled):hover {
  transform: translateY(-1px);
}
</style>
