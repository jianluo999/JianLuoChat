<template>
  <div class="direct-message-dialog" v-if="visible">
    <div class="dialog-overlay" @click="closeDialog"></div>
    <div class="dialog-content">
      <div class="dialog-header">
        <h3>💬 创建私聊</h3>
        <div class="header-actions">
          <button 
            v-if="isDevelopment" 
            @click="debugRoomStatus" 
            class="debug-btn"
            title="调试房间状态"
          >
            🔍
          </button>
          <button @click="closeDialog" class="close-btn">✕</button>
        </div>
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
        <div class="footer-left">
          <button 
            v-if="createAttempts >= maxAttempts" 
            @click="forceRefreshMatrix" 
            class="refresh-btn"
            title="强制刷新Matrix状态"
          >
            🔄 刷新状态
          </button>
        </div>
        <div class="footer-right">
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
const createAttempts = ref(0)
const maxAttempts = 3

// 开发模式检查
const isDevelopment = import.meta.env.DEV

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
    createAttempts.value++

    if (!matrixStore.matrixClient) {
      throw new Error('Matrix客户端未初始化')
    }

    console.log(`🔍 [尝试 ${createAttempts.value}/${maxAttempts}] 检查是否已存在与用户的私聊房间:`, selectedUser.value.userId)

    // 首先检查是否已经存在与该用户的私聊房间
    const existingRoom = await findExistingDirectMessage(selectedUser.value.userId)
    
    if (existingRoom) {
      console.log('✅ 找到现有私聊房间:', existingRoom.roomId)
      
      // 显示友好提示
      showSuccessMessage(`已找到与 ${selectedUser.value.displayName || selectedUser.value.userId} 的现有私聊`)
      
      // 保存到最近联系人
      saveToRecentContacts(selectedUser.value)
      
      // 直接跳转到现有房间
      emit('created', existingRoom.roomId)
      closeDialog()
      return
    }

    console.log('📝 未找到现有房间，创建新的私聊房间')

    // 尝试创建新的私聊房间
    try {
      const roomOptions = {
        visibility: 'private',
        invite: [selectedUser.value.userId],
        is_direct: true,
        preset: 'trusted_private_chat',
        // 添加房间名称，便于识别
        name: `与 ${selectedUser.value.displayName || selectedUser.value.userId.split(':')[0].replace('@', '')} 的私聊`
      }

      console.log('📝 创建房间参数:', roomOptions)
      const response = await matrixStore.matrixClient.createRoom(roomOptions)
      
      if (response.room_id) {
        console.log('✅ 私聊房间创建成功:', response.room_id)
        
        // 标记为直接消息房间
        try {
          const currentDirectRooms = matrixStore.matrixClient.getAccountData('m.direct')?.getContent() || {}
          if (!currentDirectRooms[selectedUser.value.userId]) {
            currentDirectRooms[selectedUser.value.userId] = []
          }
          currentDirectRooms[selectedUser.value.userId].push(response.room_id)
          
          await matrixStore.matrixClient.setAccountData('m.direct', currentDirectRooms)
          console.log('✅ 房间已标记为直接消息')
        } catch (directError) {
          console.warn('标记直接消息失败:', directError)
        }
        
        // 显示成功提示
        showSuccessMessage(`与 ${selectedUser.value.displayName || selectedUser.value.userId} 的私聊已创建`)
        
        // 保存到最近联系人
        saveToRecentContacts(selectedUser.value)
        
        // 等待房间同步
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        // 刷新房间列表
        await matrixStore.fetchMatrixRooms()
        
        emit('created', response.room_id)
        closeDialog()
        return
      }
    } catch (createError: any) {
      console.error('创建房间失败:', createError)
      
      // 智能错误处理：根据错误类型采取不同策略
      if (createError.errcode === 'M_ROOM_IN_USE' || 
          createError.message?.includes('already exists') ||
          createError.message?.includes('already in the room')) {
        
        console.log('🔄 房间可能已存在，尝试查找现有房间')
        
        // 等待更长时间让同步完成
        await new Promise(resolve => setTimeout(resolve, 3000))
        
        const retryExistingRoom = await findExistingDirectMessage(selectedUser.value.userId)
        if (retryExistingRoom) {
          console.log('✅ 找到现有房间，直接跳转:', retryExistingRoom.roomId)
          showSuccessMessage(`已找到与 ${selectedUser.value.displayName || selectedUser.value.userId} 的现有私聊`)
          saveToRecentContacts(selectedUser.value)
          emit('created', retryExistingRoom.roomId)
          closeDialog()
          return
        }
      }
      
      // 如果是网络错误，尝试重试一次
      if (createError.name === 'NetworkError' || createError.message?.includes('network')) {
        console.log('🔄 网络错误，尝试重试创建房间')
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        try {
          const retryResponse = await matrixStore.matrixClient.createRoom(roomOptions)
          if (retryResponse.room_id) {
            console.log('✅ 重试创建成功:', retryResponse.room_id)
            showSuccessMessage(`与 ${selectedUser.value.displayName || selectedUser.value.userId} 的私聊已创建`)
            saveToRecentContacts(selectedUser.value)
            emit('created', retryResponse.room_id)
            closeDialog()
            return
          }
        } catch (retryError) {
          console.error('重试创建也失败:', retryError)
        }
      }
      
      // 如果还是找不到，抛出原始错误
      throw createError
    }
  } catch (error: any) {
    console.error('创建私聊失败:', error)
    
    // 如果是因为用户已在房间中的错误，尝试查找现有房间
    if (error.message && error.message.includes('already in the room')) {
      console.log('🔍 用户已在房间中，尝试查找现有私聊房间')
      
      try {
        const existingRoom = await findExistingDirectMessage(selectedUser.value.userId)
        if (existingRoom) {
          console.log('✅ 找到现有私聊房间，直接跳转:', existingRoom.roomId)
          saveToRecentContacts(selectedUser.value)
          emit('created', existingRoom.roomId)
          closeDialog()
          return
        }
      } catch (findError) {
        console.error('查找现有房间失败:', findError)
      }
    }
    
    // 提供更友好的错误信息
    let errorMessage = '创建私聊失败'
    let errorType: 'error' | 'warning' = 'error'
    
    if (error.message || error.errcode) {
      const errorText = error.message || error.errcode
      
      if (errorText.includes('already in the room') || errorText.includes('M_ROOM_IN_USE')) {
        errorMessage = '该用户可能已有私聊房间，但暂时无法找到。请稍后重试或联系管理员'
        errorType = 'warning'
      } else if (errorText.includes('403') || errorText.includes('M_FORBIDDEN')) {
        errorMessage = '权限不足，无法创建私聊房间。请检查账户权限'
      } else if (errorText.includes('network') || errorText.includes('NetworkError')) {
        errorMessage = '网络连接问题，请检查网络后重试'
        errorType = 'warning'
      } else if (errorText.includes('M_USER_NOT_FOUND')) {
        errorMessage = '用户不存在或无法找到该用户'
      } else if (errorText.includes('M_INVALID_USERNAME')) {
        errorMessage = '用户名格式无效，请检查用户ID格式'
      } else if (errorText.includes('timeout')) {
        errorMessage = '操作超时，请稍后重试'
        errorType = 'warning'
      } else {
        errorMessage = `创建私聊失败: ${errorText}`
      }
    }
    
    showToast(errorMessage, errorType)
    
    // 如果尝试次数达到上限，提供强制刷新选项
    if (createAttempts.value >= maxAttempts) {
      setTimeout(() => {
        showToast('多次尝试失败，建议刷新页面或重新登录', 'warning')
      }, 2000)
    }
  } finally {
    isCreating.value = false
  }
}

// 强制刷新Matrix状态
const forceRefreshMatrix = async () => {
  try {
    console.log('🔄 强制刷新Matrix状态...')
    showToast('正在刷新Matrix状态...', 'warning')
    
    // 重新获取房间列表
    await matrixStore.fetchMatrixRooms()
    
    // 重置尝试次数
    createAttempts.value = 0
    
    showSuccessMessage('Matrix状态已刷新，请重试创建私聊')
  } catch (error) {
    console.error('刷新Matrix状态失败:', error)
    showErrorMessage('刷新失败，请尝试重新登录')
  }
}

// 查找与指定用户的现有私聊房间 - 增强版
const findExistingDirectMessage = async (userId: string) => {
  if (!matrixStore.matrixClient) return null

  try {
    console.log('🔍 搜索与用户的现有私聊房间:', userId)
    const currentUserId = matrixStore.matrixClient.getUserId()
    
    // 方法1: 使用Matrix客户端的直接消息查找API
    try {
      const directRooms = matrixStore.matrixClient.getAccountData('m.direct')?.getContent() || {}
      if (directRooms[userId]) {
        const roomIds = directRooms[userId]
        for (const roomId of roomIds) {
          const room = matrixStore.matrixClient.getRoom(roomId)
          if (room && room.getMyMembership() === 'join') {
            console.log('✅ [Direct Messages API] 找到现有私聊房间:', roomId)
            return {
              roomId: roomId,
              name: room.name || userId,
              members: room.getJoinedMembers().map(m => m.userId)
            }
          }
        }
      }
    } catch (error) {
      console.warn('Direct Messages API查找失败:', error)
    }
    
    // 方法2: 从Matrix客户端获取房间
    const clientRooms = matrixStore.matrixClient.getRooms()
    
    for (const room of clientRooms) {
      // 检查是否是私聊房间（只有2个成员且包含目标用户）
      if (room.getJoinedMemberCount() === 2 && room.getMyMembership() === 'join') {
        const members = room.getJoinedMembers()
        const memberIds = members.map(m => m.userId)
        
        // 检查房间成员是否包含目标用户和当前用户
        if (memberIds.includes(userId) && memberIds.includes(currentUserId)) {
          console.log('✅ [Matrix客户端] 找到现有私聊房间:', room.roomId)
          return {
            roomId: room.roomId,
            name: room.name || userId,
            members: memberIds
          }
        }
      }
    }
    
    // 方法3: 从Matrix store中查找
    console.log('🔍 从Matrix store中查找房间')
    const storeRooms = matrixStore.rooms
    
    for (const room of storeRooms) {
      // 检查是否是私聊房间（成员数为2或更少）
      if (room.memberCount <= 2 && room.members) {
        if (room.members.includes(userId) && room.members.includes(currentUserId)) {
          console.log('✅ [Matrix Store] 找到现有私聊房间:', room.id)
          return {
            roomId: room.id,
            name: room.name || userId,
            members: room.members
          }
        }
      }
    }
    
    // 方法4: 通过房间别名查找（如果用户设置了别名）
    try {
      const userDisplayName = userId.split(':')[0].replace('@', '')
      const possibleAliases = [
        `#${userDisplayName}-${currentUserId.split(':')[0].replace('@', '')}:${userId.split(':')[1]}`,
        `#dm-${userDisplayName}:${userId.split(':')[1]}`,
        `#${userDisplayName}:${userId.split(':')[1]}`
      ]
      
      for (const alias of possibleAliases) {
        try {
          const roomId = await matrixStore.matrixClient.getRoomIdForAlias(alias)
          if (roomId) {
            const room = matrixStore.matrixClient.getRoom(roomId.room_id)
            if (room && room.getMyMembership() === 'join') {
              console.log('✅ [别名查找] 找到现有私聊房间:', roomId.room_id)
              return {
                roomId: roomId.room_id,
                name: room.name || userId,
                members: room.getJoinedMembers().map(m => m.userId)
              }
            }
          }
        } catch (aliasError) {
          // 别名不存在，继续下一个
        }
      }
    } catch (error) {
      console.warn('别名查找失败:', error)
    }
    
    console.log('❌ 未找到现有私聊房间')
    return null
  } catch (error) {
    console.error('查找现有私聊房间失败:', error)
    return null
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

const showSuccessMessage = (message: string) => {
  showToast(message, 'success')
}

const showErrorMessage = (message: string) => {
  showToast(message, 'error')
}

const showToast = (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
  // 创建临时提示元素
  const toast = document.createElement('div')
  toast.textContent = message
  
  const colors = {
    success: { bg: '#00ff00', color: '#000', shadow: 'rgba(0, 255, 0, 0.3)' },
    error: { bg: '#ff4444', color: '#fff', shadow: 'rgba(255, 68, 68, 0.3)' },
    warning: { bg: '#ff9900', color: '#000', shadow: 'rgba(255, 153, 0, 0.3)' }
  }
  
  const colorScheme = colors[type]
  
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${colorScheme.bg};
    color: ${colorScheme.color};
    padding: 12px 20px;
    border-radius: 6px;
    font-weight: bold;
    z-index: 10000;
    box-shadow: 0 4px 12px ${colorScheme.shadow};
    font-family: 'Share Tech Mono', monospace;
    max-width: 300px;
    word-wrap: break-word;
    animation: slideIn 0.3s ease-out;
  `
  
  // 添加动画样式
  if (!document.getElementById('toast-animations')) {
    const style = document.createElement('style')
    style.id = 'toast-animations'
    style.textContent = `
      @keyframes slideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      @keyframes slideOut {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(100%);
          opacity: 0;
        }
      }
    `
    document.head.appendChild(style)
  }
  
  document.body.appendChild(toast)
  
  // 4秒后开始退出动画
  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease-in'
    setTimeout(() => {
      toast.remove()
    }, 300)
  }, 4000)
}

// 调试功能：显示当前房间状态
const debugRoomStatus = async () => {
  if (!matrixStore.matrixClient) {
    console.log('❌ Matrix客户端未初始化')
    return
  }
  
  console.log('🔍 当前房间状态调试信息:')
  console.log('当前用户ID:', matrixStore.matrixClient.getUserId())
  
  const clientRooms = matrixStore.matrixClient.getRooms()
  console.log('Matrix客户端房间数量:', clientRooms.length)
  
  const storeRooms = matrixStore.rooms
  console.log('Store房间数量:', storeRooms.length)
  
  // 显示所有私聊房间
  const directRooms = clientRooms.filter(room => 
    room.getJoinedMemberCount() === 2 && room.getMyMembership() === 'join'
  )
  console.log('现有私聊房间:', directRooms.map(room => ({
    id: room.roomId,
    name: room.name,
    members: room.getJoinedMembers().map(m => m.userId)
  })))
  
  // 显示直接消息账户数据
  try {
    const directData = matrixStore.matrixClient.getAccountData('m.direct')?.getContent() || {}
    console.log('直接消息账户数据:', directData)
  } catch (error) {
    console.log('获取直接消息数据失败:', error)
  }
}

const closeDialog = () => {
  searchQuery.value = ''
  searchResults.value = []
  selectedUser.value = null
  createAttempts.value = 0 // 重置尝试次数
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

.header-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.debug-btn {
  background: none;
  border: 1px solid #666;
  color: #888;
  font-size: 14px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.debug-btn:hover {
  color: #00ff00;
  border-color: #00ff00;
  background: rgba(0, 255, 0, 0.1);
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
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-top: 1px solid #333;
}

.footer-left {
  flex: 1;
}

.footer-right {
  display: flex;
  gap: 10px;
}

.refresh-btn {
  background: #333;
  border: 1px solid #ff9900;
  color: #ff9900;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-family: 'Share Tech Mono', monospace;
  font-size: 12px;
  transition: all 0.3s ease;
}

.refresh-btn:hover {
  background: rgba(255, 153, 0, 0.1);
  border-color: #ffaa00;
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