<template>
  <div class="direct-message-dialog" v-if="visible">
    <div class="dialog-overlay" @click="closeDialog"></div>
    <div class="dialog-content">
      <div class="dialog-header">
        <h3>💬 创建私聊</h3>
        <button @click="closeDialog" class="close-btn">✕</button>
      </div>
      
      <div class="dialog-body">
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
            @click="selectUser(user)"
            :class="{ selected: selectedUser?.userId === user.userId }"
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
          </div>
        </div>

        <div class="recent-contacts" v-if="recentContacts.length > 0">
          <div class="section-header">最近联系人</div>
          <div
            v-for="contact in recentContacts"
            :key="contact.userId"
            class="user-item"
            @click="selectUser(contact)"
            :class="{ selected: selectedUser?.userId === contact.userId }"
          >
            <div class="user-avatar">
              <img v-if="contact.avatarUrl" :src="contact.avatarUrl" :alt="contact.displayName" />
              <div v-else class="avatar-placeholder">
                {{ getUserInitials(contact.displayName || contact.userId) }}
              </div>
            </div>
            <div class="user-info">
              <div class="user-name">{{ contact.displayName || contact.userId }}</div>
              <div class="user-id">{{ contact.userId }}</div>
              <div class="last-message" v-if="contact.lastMessage">
                {{ contact.lastMessage }}
              </div>
            </div>
          </div>
        </div>

        <div class="selected-user" v-if="selectedUser">
          <div class="selection-header">已选择用户</div>
          <div class="user-item selected">
            <div class="user-avatar">
              <img v-if="selectedUser.avatarUrl" :src="selectedUser.avatarUrl" :alt="selectedUser.displayName" />
              <div v-else class="avatar-placeholder">
                {{ getUserInitials(selectedUser.displayName || selectedUser.userId) }}
              </div>
            </div>
            <div class="user-info">
              <div class="user-name">{{ selectedUser.displayName || selectedUser.userId }}</div>
              <div class="user-id">{{ selectedUser.userId }}</div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="dialog-footer">
        <button @click="closeDialog" class="cancel-btn">取消</button>
        <button 
          @click="createDirectMessage" 
          :disabled="!selectedUser || isCreating"
          class="create-btn"
        >
          {{ isCreating ? '创建中...' : '开始聊天' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useMatrixStore } from '@/stores/matrix'

interface User {
  userId: string
  displayName?: string
  avatarUrl?: string
  presence?: 'online' | 'offline' | 'unavailable'
  lastMessage?: string
}

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  close: []
  created: [roomId: string]
}>()

const matrixStore = useMatrixStore()

const searchQuery = ref('')
const searchResults = ref<User[]>([])
const recentContacts = ref<User[]>([])
const selectedUser = ref<User | null>(null)
const isCreating = ref(false)

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

const selectUser = (user: User) => {
  selectedUser.value = user
}

const createDirectMessage = async () => {
  if (!selectedUser.value) return

  try {
    isCreating.value = true

    if (!matrixStore.matrixClient) {
      throw new Error('Matrix客户端未初始化')
    }

    // 创建私聊房间
    const roomOptions = {
      visibility: 'private',
      invite: [selectedUser.value.userId],
      is_direct: true,
      preset: 'trusted_private_chat'
    }

    const response = await matrixStore.matrixClient.createRoom(roomOptions)
    
    if (response.room_id) {
      // 保存到最近联系人
      saveToRecentContacts(selectedUser.value)
      
      // 等待房间同步
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // 刷新房间列表
      await matrixStore.fetchMatrixRooms()
      
      emit('created', response.room_id)
      closeDialog()
    }
  } catch (error) {
    console.error('创建私聊失败:', error)
    alert('创建私聊失败: ' + error.message)
  } finally {
    isCreating.value = false
  }
}

const saveToRecentContacts = (user: User) => {
  const contacts = JSON.parse(localStorage.getItem('recent-contacts') || '[]')
  const existingIndex = contacts.findIndex((c: User) => c.userId === user.userId)
  
  if (existingIndex >= 0) {
    contacts.splice(existingIndex, 1)
  }
  
  contacts.unshift(user)
  
  // 只保留最近10个联系人
  if (contacts.length > 10) {
    contacts.splice(10)
  }
  
  localStorage.setItem('recent-contacts', JSON.stringify(contacts))
  recentContacts.value = contacts
}

const loadRecentContacts = () => {
  const contacts = JSON.parse(localStorage.getItem('recent-contacts') || '[]')
  recentContacts.value = contacts
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
  selectedUser.value = null
  emit('close')
}

onMounted(() => {
  loadRecentContacts()
})
</script>

<style scoped>
.direct-message-dialog {
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
  max-width: 500px;
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
  max-height: 400px;
  overflow-y: auto;
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

.user-results, .recent-contacts {
  margin-bottom: 20px;
}

.results-header, .section-header, .selection-header {
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
  cursor: pointer;
  transition: all 0.3s ease;
}

.user-item:hover {
  border-color: #00ff00;
  background: rgba(0, 255, 0, 0.05);
}

.user-item.selected {
  border-color: #00ff00;
  background: rgba(0, 255, 0, 0.1);
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

.last-message {
  color: #666;
  font-size: 11px;
  margin-top: 2px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 20px;
  border-top: 1px solid #333;
}

.cancel-btn, .create-btn {
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

.create-btn {
  background: #00ff00;
  border: 1px solid #00ff00;
  color: #000;
  font-weight: bold;
}

.create-btn:hover:not(:disabled) {
  background: #00cc00;
}

.create-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>