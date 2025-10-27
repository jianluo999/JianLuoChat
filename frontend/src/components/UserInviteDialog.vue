<template>
  <div class="user-invite-dialog" v-if="visible">
    <div class="dialog-overlay" @click="closeDialog"></div>
    <div class="dialog-content">
      <div class="dialog-header">
        <h3>👥 邀请用户</h3>
        <button @click="closeDialog" class="close-btn">✕</button>
      </div>
      
      <div class="dialog-body">
        <div class="room-info" v-if="roomInfo">
          <div class="room-name">{{ roomInfo.name }}</div>
          <div class="room-id">{{ roomInfo.id }}</div>
          <div class="room-topic" v-if="roomInfo.topic">{{ roomInfo.topic }}</div>
        </div>

        <div class="invite-methods">
          <div class="method-tabs">
            <button 
              :class="{ active: activeTab === 'search' }"
              @click="activeTab = 'search'"
              class="tab-btn"
            >
              🔍 搜索用户
            </button>
            <button 
              :class="{ active: activeTab === 'link' }"
              @click="activeTab = 'link'"
              class="tab-btn"
            >
              🔗 邀请链接
            </button>
          </div>

          <!-- 搜索用户标签页 -->
          <div v-if="activeTab === 'search'" class="tab-content">
            <div class="user-search">
              <div class="search-input-wrapper">
                <input
                  v-model="searchQuery"
                  @input="searchUsers"
                  placeholder="输入用户ID或显示名称..."
                  class="user-search-input"
                  @keyup.enter="searchUsers"
                />
                <button @click="searchUsers" class="search-btn">🔍</button>
              </div>
              <div class="search-hint">
                例如: @alice:matrix.org 或 alice
              </div>
            </div>

            <div class="user-results" v-if="searchResults.length > 0">
              <div class="results-header">搜索结果</div>
              <div
                v-for="user in searchResults"
                :key="user.userId"
                class="user-item"
              >
                <div class="user-avatar">
                  <img v-if="user.avatarUrl" :src="user.avatarUrl" :alt="user.displayName" />
                  <div v-else class="avatar-placeholder">
                    {{ getUserInitials(user.displayName || user.userId) }}
                  </div>
                </div>
                <div class="user-info">
                  <div class="user-name">{{ user.displayName || user.userId }}</div>
                  <div class="user-id">{{ user.userId }}</div>
                  <div class="user-status" v-if="user.presence">
                    <span class="status-indicator" :class="user.presence"></span>
                    {{ getPresenceText(user.presence) }}
                  </div>
                </div>
                <button 
                  @click="inviteUser(user)"
                  :disabled="isInviting[user.userId] || invitedUsers.includes(user.userId)"
                  class="invite-btn"
                >
                  {{ invitedUsers.includes(user.userId) ? '已邀请' : 
                     isInviting[user.userId] ? '邀请中...' : '邀请' }}
                </button>
              </div>
            </div>

            <div class="invited-users" v-if="invitedUsers.length > 0">
              <div class="section-header">已邀请用户</div>
              <div class="invited-list">
                <div
                  v-for="userId in invitedUsers"
                  :key="userId"
                  class="invited-user-tag"
                >
                  {{ userId }}
                  <button @click="removeInvite(userId)" class="remove-invite">✕</button>
                </div>
              </div>
            </div>
          </div>

          <!-- 邀请链接标签页 -->
          <div v-if="activeTab === 'link'" class="tab-content">
            <div class="invite-link-section">
              <div class="section-header">房间邀请链接</div>
              <div class="link-info">
                分享此链接让其他人加入房间
              </div>
              
              <div class="link-container">
                <input
                  :value="inviteLink"
                  readonly
                  class="invite-link-input"
                  ref="linkInput"
                />
                <button @click="copyInviteLink" class="copy-btn">
                  {{ linkCopied ? '已复制' : '复制' }}
                </button>
              </div>

              <div class="qr-code-section">
                <div class="section-header">二维码</div>
                <div class="qr-code-placeholder">
                  <div class="qr-placeholder">
                    📱 二维码
                    <div class="qr-hint">扫码加入房间</div>
                  </div>
                </div>
              </div>

              <div class="link-options">
                <label class="option-item">
                  <input type="checkbox" v-model="linkOptions.allowGuests" />
                  <span>允许访客加入</span>
                </label>
                <label class="option-item">
                  <input type="checkbox" v-model="linkOptions.requireApproval" />
                  <span>需要管理员批准</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="dialog-footer">
        <button @click="closeDialog" class="cancel-btn">关闭</button>
        <button 
          v-if="activeTab === 'search'"
          @click="sendAllInvites" 
          :disabled="invitedUsers.length === 0 || isSendingAll"
          class="send-btn"
        >
          {{ isSendingAll ? '发送中...' : `发送邀请 (${invitedUsers.length})` }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useMatrixStore } from '@/stores/matrix'

interface User {
  userId: string
  displayName?: string
  avatarUrl?: string
  presence?: 'online' | 'offline' | 'unavailable'
}

interface RoomInfo {
  id: string
  name: string
  topic?: string
}

const props = defineProps<{
  visible: boolean
  roomInfo: RoomInfo | null
}>()

const emit = defineEmits<{
  close: []
  invited: [userIds: string[]]
}>()

const matrixStore = useMatrixStore()

const activeTab = ref<'search' | 'link'>('search')
const searchQuery = ref('')
const searchResults = ref<User[]>([])
const invitedUsers = ref<string[]>([])
const isInviting = ref<Record<string, boolean>>({})
const isSendingAll = ref(false)
const linkCopied = ref(false)
const linkInput = ref<HTMLInputElement>()

const linkOptions = ref({
  allowGuests: false,
  requireApproval: true
})

const inviteLink = computed(() => {
  if (!props.roomInfo) return ''
  const baseUrl = window.location.origin
  return `${baseUrl}/#/room/${props.roomInfo.id}`
})

const searchUsers = async () => {
  if (!searchQuery.value.trim()) {
    searchResults.value = []
    return
  }

  try {
    // 如果输入的是完整的Matrix用户ID
    if (searchQuery.value.startsWith('@') && searchQuery.value.includes(':')) {
      const userId = searchQuery.value
      searchResults.value = [{
        userId,
        displayName: userId.split(':')[0].substring(1)
      }]
    } else {
      // 否则构造用户ID
      let userId = searchQuery.value
      if (!userId.startsWith('@')) {
        userId = '@' + userId
      }
      if (!userId.includes(':')) {
        userId += ':matrix.org' // 默认使用matrix.org
      }
      
      searchResults.value = [{
        userId,
        displayName: userId.split(':')[0].substring(1)
      }]
    }

    // 如果有Matrix客户端，尝试获取用户信息
    if (matrixStore.matrixClient) {
      try {
        for (const user of searchResults.value) {
          const profile = await matrixStore.matrixClient.getProfileInfo(user.userId)
          if (profile) {
            user.displayName = profile.displayname || user.displayName
            user.avatarUrl = profile.avatar_url ? 
              matrixStore.matrixClient.mxcUrlToHttp(profile.avatar_url) : undefined
          }
        }
      } catch (error) {
        console.warn('获取用户资料失败:', error)
      }
    }
  } catch (error) {
    console.error('搜索用户失败:', error)
  }
}

const inviteUser = async (user: User) => {
  if (!props.roomInfo || !matrixStore.matrixClient) return

  try {
    isInviting.value[user.userId] = true

    await matrixStore.matrixClient.invite(props.roomInfo.id, user.userId)
    
    if (!invitedUsers.value.includes(user.userId)) {
      invitedUsers.value.push(user.userId)
    }

    console.log(`成功邀请用户 ${user.userId}`)
  } catch (error) {
    console.error('邀请用户失败:', error)
    alert(`邀请用户失败: ${error.message}`)
  } finally {
    isInviting.value[user.userId] = false
  }
}

const removeInvite = (userId: string) => {
  const index = invitedUsers.value.indexOf(userId)
  if (index >= 0) {
    invitedUsers.value.splice(index, 1)
  }
}

const sendAllInvites = async () => {
  if (!props.roomInfo || !matrixStore.matrixClient || invitedUsers.value.length === 0) return

  try {
    isSendingAll.value = true
    
    for (const userId of invitedUsers.value) {
      try {
        await matrixStore.matrixClient.invite(props.roomInfo.id, userId)
        console.log(`成功邀请用户 ${userId}`)
      } catch (error) {
        console.error(`邀请用户 ${userId} 失败:`, error)
      }
    }

    emit('invited', [...invitedUsers.value])
    alert(`成功发送 ${invitedUsers.value.length} 个邀请`)
    closeDialog()
  } catch (error) {
    console.error('批量邀请失败:', error)
    alert('批量邀请失败: ' + error.message)
  } finally {
    isSendingAll.value = false
  }
}

const copyInviteLink = async () => {
  if (!linkInput.value) return

  try {
    await navigator.clipboard.writeText(inviteLink.value)
    linkCopied.value = true
    setTimeout(() => {
      linkCopied.value = false
    }, 2000)
  } catch (error) {
    // 降级到选择文本
    linkInput.value.select()
    document.execCommand('copy')
    linkCopied.value = true
    setTimeout(() => {
      linkCopied.value = false
    }, 2000)
  }
}

const getUserInitials = (name: string): string => {
  if (!name) return '?'
  const cleanName = name.replace('@', '').split(':')[0]
  return cleanName.substring(0, 2).toUpperCase()
}

const getPresenceText = (presence: string): string => {
  switch (presence) {
    case 'online': return '在线'
    case 'offline': return '离线'
    case 'unavailable': return '忙碌'
    default: return '未知'
  }
}

const closeDialog = () => {
  searchQuery.value = ''
  searchResults.value = []
  invitedUsers.value = []
  isInviting.value = {}
  activeTab.value = 'search'
  emit('close')
}
</script>

<style scoped>
.user-invite-dialog {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dialog-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
}

.dialog-content {
  position: relative;
  background: #111;
  border: 2px solid #00ff00;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: 0 0 30px rgba(0, 255, 0, 0.3);
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #333;
}

.dialog-header h3 {
  color: #00ff00;
  margin: 0;
  font-size: 18px;
}

.close-btn {
  background: none;
  border: none;
  color: #888;
  font-size: 20px;
  cursor: pointer;
  padding: 5px;
}

.close-btn:hover {
  color: #00ff00;
}

.dialog-body {
  padding: 20px;
  max-height: 500px;
  overflow-y: auto;
}

.room-info {
  margin-bottom: 20px;
  padding: 15px;
  background: #222;
  border-radius: 8px;
  border: 1px solid #333;
}

.room-name {
  color: #00ff00;
  font-weight: bold;
  font-size: 16px;
  margin-bottom: 5px;
}

.room-id {
  color: #888;
  font-size: 12px;
  margin-bottom: 5px;
}

.room-topic {
  color: #ccc;
  font-size: 14px;
}

.method-tabs {
  display: flex;
  margin-bottom: 20px;
  border-bottom: 1px solid #333;
}

.tab-btn {
  background: none;
  border: none;
  color: #888;
  padding: 10px 20px;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.3s ease;
}

.tab-btn.active {
  color: #00ff00;
  border-bottom-color: #00ff00;
}

.tab-btn:hover {
  color: #00ff00;
}

.tab-content {
  min-height: 200px;
}

.user-search {
  margin-bottom: 20px;
}

.search-input-wrapper {
  display: flex;
  gap: 10px;
  margin-bottom: 5px;
}

.user-search-input {
  flex: 1;
  background: #222;
  border: 1px solid #444;
  color: #00ff00;
  padding: 10px;
  border-radius: 6px;
  font-family: 'Share Tech Mono', monospace;
}

.user-search-input:focus {
  outline: none;
  border-color: #00ff00;
  box-shadow: 0 0 5px rgba(0, 255, 0, 0.3);
}

.search-btn {
  background: #333;
  border: 1px solid #00ff00;
  color: #00ff00;
  padding: 10px 15px;
  border-radius: 6px;
  cursor: pointer;
}

.search-btn:hover {
  background: rgba(0, 255, 0, 0.1);
}

.search-hint {
  color: #666;
  font-size: 12px;
}

.user-results, .invited-users {
  margin-bottom: 20px;
}

.results-header, .section-header {
  color: #00ff00;
  font-weight: bold;
  margin-bottom: 10px;
  font-size: 14px;
}

.user-item {
  display: flex;
  align-items: center;
  padding: 10px;
  border: 1px solid #333;
  border-radius: 8px;
  margin-bottom: 8px;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 12px;
  overflow: hidden;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  background: #333;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #00ff00;
  font-weight: bold;
  font-size: 14px;
}

.user-info {
  flex: 1;
}

.user-name {
  color: #00ff00;
  font-weight: bold;
  margin-bottom: 2px;
}

.user-id {
  color: #888;
  font-size: 12px;
  margin-bottom: 2px;
}

.user-status {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  color: #666;
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-indicator.online {
  background: #00ff00;
}

.status-indicator.offline {
  background: #666;
}

.status-indicator.unavailable {
  background: #ff6600;
}

.invite-btn {
  background: #00ff00;
  border: 1px solid #00ff00;
  color: #000;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  font-weight: bold;
}

.invite-btn:hover:not(:disabled) {
  background: #00cc00;
}

.invite-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.invited-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.invited-user-tag {
  background: rgba(0, 255, 0, 0.1);
  border: 1px solid #00ff00;
  color: #00ff00;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 5px;
}

.remove-invite {
  background: none;
  border: none;
  color: #00ff00;
  cursor: pointer;
  font-size: 10px;
}

.invite-link-section {
  margin-bottom: 20px;
}

.link-info {
  color: #888;
  font-size: 14px;
  margin-bottom: 15px;
}

.link-container {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.invite-link-input {
  flex: 1;
  background: #222;
  border: 1px solid #444;
  color: #00ff00;
  padding: 10px;
  border-radius: 6px;
  font-family: 'Share Tech Mono', monospace;
  font-size: 12px;
}

.copy-btn {
  background: #333;
  border: 1px solid #00ff00;
  color: #00ff00;
  padding: 10px 15px;
  border-radius: 6px;
  cursor: pointer;
}

.copy-btn:hover {
  background: rgba(0, 255, 0, 0.1);
}

.qr-code-section {
  margin-bottom: 20px;
}

.qr-code-placeholder {
  display: flex;
  justify-content: center;
  margin-bottom: 15px;
}

.qr-placeholder {
  width: 120px;
  height: 120px;
  border: 2px dashed #333;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #666;
  font-size: 24px;
}

.qr-hint {
  font-size: 10px;
  margin-top: 5px;
}

.link-options {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.option-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #ccc;
  cursor: pointer;
}

.option-item input[type="checkbox"] {
  accent-color: #00ff00;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 20px;
  border-top: 1px solid #333;
}

.cancel-btn, .send-btn {
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-family: 'Share Tech Mono', monospace;
}

.cancel-btn {
  background: #333;
  border: 1px solid #666;
  color: #ccc;
}

.cancel-btn:hover {
  background: #444;
}

.send-btn {
  background: #00ff00;
  border: 1px solid #00ff00;
  color: #000;
  font-weight: bold;
}

.send-btn:hover:not(:disabled) {
  background: #00cc00;
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>