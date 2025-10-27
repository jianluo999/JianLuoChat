<template>
  <div class="room-members-list">
    <div class="members-header">
      <h3>👥 房间成员 ({{ members.length }})</h3>
      <div class="header-actions">
        <button @click="refreshMembers" class="refresh-btn" title="刷新成员列表">
          🔄
        </button>
        <button @click="inviteUsers" class="invite-btn" title="邀请用户">
          ➕
        </button>
      </div>
    </div>

    <div class="members-search" v-if="members.length > 10">
      <input
        v-model="searchQuery"
        placeholder="搜索成员..."
        class="search-input"
      />
    </div>

    <div class="members-container">
      <!-- 在线成员 -->
      <div v-if="onlineMembers.length > 0" class="member-group">
        <div class="group-header">
          <span class="status-indicator online"></span>
          <span class="group-title">在线 ({{ onlineMembers.length }})</span>
        </div>
        <div
          v-for="member in onlineMembers"
          :key="member.userId"
          class="member-item"
          @click="showMemberProfile(member)"
          @contextmenu.prevent="showMemberContextMenu(member, $event)"
        >
          <div class="member-avatar">
            <img v-if="member.avatarUrl" :src="member.avatarUrl" :alt="member.displayName" />
            <div v-else class="avatar-placeholder">
              {{ getUserInitials(member.displayName || member.userId) }}
            </div>
            <div class="presence-indicator" :class="member.presence"></div>
          </div>
          <div class="member-info">
            <div class="member-name">{{ member.displayName || member.userId }}</div>
            <div class="member-id">{{ member.userId }}</div>
            <div class="member-status" v-if="member.statusMessage">
              {{ member.statusMessage }}
            </div>
          </div>
          <div class="member-role" v-if="member.powerLevel > 0">
            <span class="role-badge" :class="getRoleClass(member.powerLevel)">
              {{ getRoleText(member.powerLevel) }}
            </span>
          </div>
        </div>
      </div>

      <!-- 离线成员 -->
      <div v-if="offlineMembers.length > 0" class="member-group">
        <div class="group-header">
          <span class="status-indicator offline"></span>
          <span class="group-title">离线 ({{ offlineMembers.length }})</span>
        </div>
        <div
          v-for="member in offlineMembers"
          :key="member.userId"
          class="member-item offline"
          @click="showMemberProfile(member)"
          @contextmenu.prevent="showMemberContextMenu(member, $event)"
        >
          <div class="member-avatar">
            <img v-if="member.avatarUrl" :src="member.avatarUrl" :alt="member.displayName" />
            <div v-else class="avatar-placeholder">
              {{ getUserInitials(member.displayName || member.userId) }}
            </div>
            <div class="presence-indicator offline"></div>
          </div>
          <div class="member-info">
            <div class="member-name">{{ member.displayName || member.userId }}</div>
            <div class="member-id">{{ member.userId }}</div>
            <div class="last-seen" v-if="member.lastSeen">
              最后在线: {{ formatLastSeen(member.lastSeen) }}
            </div>
          </div>
          <div class="member-role" v-if="member.powerLevel > 0">
            <span class="role-badge" :class="getRoleClass(member.powerLevel)">
              {{ getRoleText(member.powerLevel) }}
            </span>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="filteredMembers.length === 0" class="empty-state">
        <div class="empty-icon">👥</div>
        <div class="empty-text">没有找到成员</div>
      </div>
    </div>

    <!-- 成员上下文菜单 -->
    <div
      v-if="contextMenu.show"
      class="member-context-menu"
      :style="{ left: contextMenu.x + 'px', top: contextMenu.y + 'px' }"
      @click.stop
    >
      <div class="context-menu-item" @click="startDirectMessage(contextMenu.member)">
        💬 发起私聊
      </div>
      <div class="context-menu-item" @click="viewProfile(contextMenu.member)">
        👤 查看资料
      </div>
      <div class="context-menu-divider"></div>
      <div v-if="canModerate" class="context-menu-item" @click="kickMember(contextMenu.member)">
        🚪 踢出房间
      </div>
      <div v-if="canModerate" class="context-menu-item" @click="banMember(contextMenu.member)">
        🚫 封禁用户
      </div>
      <div v-if="canModerate" class="context-menu-item" @click="changePowerLevel(contextMenu.member)">
        ⚡ 修改权限
      </div>
    </div>

    <!-- 点击遮罩关闭菜单 -->
    <div
      v-if="contextMenu.show"
      class="context-menu-overlay"
      @click="hideContextMenu"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useMatrixStore } from '@/stores/matrix'

interface RoomMember {
  userId: string
  displayName?: string
  avatarUrl?: string
  presence?: 'online' | 'offline' | 'unavailable'
  statusMessage?: string
  powerLevel: number
  lastSeen?: number
  membership: 'join' | 'invite' | 'leave' | 'ban'
}

const props = defineProps<{
  roomId: string
}>()

const emit = defineEmits<{
  inviteUsers: []
  memberSelected: [member: RoomMember]
  startDirectMessage: [userId: string]
}>()

const matrixStore = useMatrixStore()

// 响应式数据
const members = ref<RoomMember[]>([])
const searchQuery = ref('')
const contextMenu = ref({
  show: false,
  x: 0,
  y: 0,
  member: null as RoomMember | null
})

// 计算属性
const filteredMembers = computed(() => {
  if (!searchQuery.value) return members.value
  
  const query = searchQuery.value.toLowerCase()
  return members.value.filter(member =>
    (member.displayName || '').toLowerCase().includes(query) ||
    member.userId.toLowerCase().includes(query)
  )
})

const onlineMembers = computed(() => {
  return filteredMembers.value
    .filter(member => member.presence === 'online' || member.presence === 'unavailable')
    .sort((a, b) => {
      // 按权限级别排序，然后按名称排序
      if (a.powerLevel !== b.powerLevel) {
        return b.powerLevel - a.powerLevel
      }
      return (a.displayName || a.userId).localeCompare(b.displayName || b.userId)
    })
})

const offlineMembers = computed(() => {
  return filteredMembers.value
    .filter(member => member.presence === 'offline' || !member.presence)
    .sort((a, b) => {
      // 按权限级别排序，然后按名称排序
      if (a.powerLevel !== b.powerLevel) {
        return b.powerLevel - a.powerLevel
      }
      return (a.displayName || a.userId).localeCompare(b.displayName || b.userId)
    })
})

const canModerate = computed(() => {
  // 检查当前用户是否有管理权限
  const currentUserId = matrixStore.currentUser?.id
  if (!currentUserId) return false
  
  const currentMember = members.value.find(m => m.userId === currentUserId)
  return currentMember && currentMember.powerLevel >= 50
})

// 方法
const loadMembers = async () => {
  if (!matrixStore.matrixClient) return

  try {
    const room = matrixStore.matrixClient.getRoom(props.roomId)
    if (!room) return

    const roomMembers = room.getJoinedMembers()
    const memberList: RoomMember[] = []

    for (const member of roomMembers) {
      const userId = member.userId
      const powerLevel = room.getMember(userId)?.powerLevel || 0
      
      // 获取用户状态
      let presence: 'online' | 'offline' | 'unavailable' = 'offline'
      let statusMessage = ''
      let lastSeen: number | undefined

      try {
        const presenceEvent = matrixStore.matrixClient.getUser(userId)?.presence
        if (presenceEvent === 'online') {
          presence = 'online'
        } else if (presenceEvent === 'unavailable') {
          presence = 'unavailable'
        }
        
        // 获取状态消息
        const user = matrixStore.matrixClient.getUser(userId)
        if (user?.presenceStatusMsg) {
          statusMessage = user.presenceStatusMsg
        }
        
        // 获取最后在线时间
        if (user?.lastActiveAgo) {
          lastSeen = Date.now() - user.lastActiveAgo
        }
      } catch (error) {
        console.warn(`获取用户 ${userId} 状态失败:`, error)
      }

      memberList.push({
        userId,
        displayName: member.name,
        avatarUrl: member.getAvatarUrl(
          matrixStore.matrixClient.getHomeserverUrl(),
          48, 48, 'crop'
        ),
        presence,
        statusMessage,
        powerLevel,
        lastSeen,
        membership: 'join'
      })
    }

    members.value = memberList
    console.log(`加载了 ${memberList.length} 个房间成员`)

  } catch (error) {
    console.error('加载房间成员失败:', error)
  }
}

const refreshMembers = () => {
  loadMembers()
}

const inviteUsers = () => {
  emit('inviteUsers')
}

const showMemberProfile = (member: RoomMember) => {
  emit('memberSelected', member)
}

const showMemberContextMenu = (member: RoomMember, event: MouseEvent) => {
  contextMenu.value = {
    show: true,
    x: event.clientX,
    y: event.clientY,
    member
  }
}

const hideContextMenu = () => {
  contextMenu.value.show = false
}

const startDirectMessage = (member: RoomMember) => {
  emit('startDirectMessage', member.userId)
  hideContextMenu()
}

const viewProfile = (member: RoomMember) => {
  // 实现查看用户资料
  console.log('查看用户资料:', member.userId)
  hideContextMenu()
}

const kickMember = async (member: RoomMember) => {
  if (!matrixStore.matrixClient || !canModerate.value) return

  try {
    const reason = prompt('请输入踢出原因（可选）:')
    await matrixStore.matrixClient.kick(props.roomId, member.userId, reason || undefined)
    console.log(`成功踢出用户: ${member.userId}`)
    await loadMembers() // 刷新成员列表
  } catch (error) {
    console.error('踢出用户失败:', error)
    alert('踢出用户失败: ' + error.message)
  }
  
  hideContextMenu()
}

const banMember = async (member: RoomMember) => {
  if (!matrixStore.matrixClient || !canModerate.value) return

  try {
    const reason = prompt('请输入封禁原因（可选）:')
    await matrixStore.matrixClient.ban(props.roomId, member.userId, reason || undefined)
    console.log(`成功封禁用户: ${member.userId}`)
    await loadMembers() // 刷新成员列表
  } catch (error) {
    console.error('封禁用户失败:', error)
    alert('封禁用户失败: ' + error.message)
  }
  
  hideContextMenu()
}

const changePowerLevel = async (member: RoomMember) => {
  if (!matrixStore.matrixClient || !canModerate.value) return

  try {
    const newLevel = prompt(`请输入新的权限级别 (0-100)，当前: ${member.powerLevel}`)
    if (newLevel === null) return
    
    const level = parseInt(newLevel)
    if (isNaN(level) || level < 0 || level > 100) {
      alert('权限级别必须是0-100之间的数字')
      return
    }

    await matrixStore.matrixClient.setPowerLevel(props.roomId, member.userId, level)
    console.log(`成功修改用户 ${member.userId} 的权限级别为 ${level}`)
    await loadMembers() // 刷新成员列表
  } catch (error) {
    console.error('修改权限失败:', error)
    alert('修改权限失败: ' + error.message)
  }
  
  hideContextMenu()
}

const getUserInitials = (name: string): string => {
  if (!name) return '?'
  const cleanName = name.replace('@', '').split(':')[0]
  return cleanName.substring(0, 2).toUpperCase()
}

const getRoleClass = (powerLevel: number): string => {
  if (powerLevel >= 100) return 'admin'
  if (powerLevel >= 50) return 'moderator'
  if (powerLevel > 0) return 'trusted'
  return 'member'
}

const getRoleText = (powerLevel: number): string => {
  if (powerLevel >= 100) return '管理员'
  if (powerLevel >= 50) return '版主'
  if (powerLevel > 0) return '信任用户'
  return '成员'
}

const formatLastSeen = (timestamp: number): string => {
  const now = Date.now()
  const diff = now - timestamp
  
  if (diff < 60000) { // 1分钟内
    return '刚刚'
  } else if (diff < 3600000) { // 1小时内
    const minutes = Math.floor(diff / 60000)
    return `${minutes}分钟前`
  } else if (diff < 86400000) { // 24小时内
    const hours = Math.floor(diff / 3600000)
    return `${hours}小时前`
  } else {
    const days = Math.floor(diff / 86400000)
    return `${days}天前`
  }
}

// 点击外部关闭上下文菜单
const handleClickOutside = (event: MouseEvent) => {
  if (contextMenu.value.show) {
    hideContextMenu()
  }
}

onMounted(() => {
  loadMembers()
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.room-members-list {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f8f8f8;
}

.members-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #e0e0e0;
  background: white;
}

.members-header h3 {
  margin: 0;
  color: #333;
  font-size: 16px;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.refresh-btn, .invite-btn {
  background: none;
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 6px 10px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
}

.refresh-btn:hover, .invite-btn:hover {
  background: #f0f0f0;
  border-color: #00ff00;
}

.members-search {
  padding: 15px 20px;
  background: white;
  border-bottom: 1px solid #e0e0e0;
}

.search-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 20px;
  font-size: 14px;
  outline: none;
}

.search-input:focus {
  border-color: #00ff00;
  box-shadow: 0 0 5px rgba(0, 255, 0, 0.3);
}

.members-container {
  flex: 1;
  overflow-y: auto;
  padding: 10px 0;
}

.member-group {
  margin-bottom: 20px;
}

.group-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  font-size: 12px;
  font-weight: bold;
  color: #666;
  text-transform: uppercase;
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
  background: #999;
}

.member-item {
  display: flex;
  align-items: center;
  padding: 10px 20px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.member-item:hover {
  background: #f0f0f0;
}

.member-item.offline {
  opacity: 0.7;
}

.member-avatar {
  position: relative;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 12px;
  overflow: hidden;
}

.member-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  background: #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  font-weight: bold;
  font-size: 14px;
}

.presence-indicator {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid white;
}

.presence-indicator.online {
  background: #00ff00;
}

.presence-indicator.offline {
  background: #999;
}

.member-info {
  flex: 1;
}

.member-name {
  font-weight: bold;
  color: #333;
  margin-bottom: 2px;
}

.member-id {
  font-size: 12px;
  color: #888;
  margin-bottom: 2px;
}

.member-status, .last-seen {
  font-size: 11px;
  color: #666;
  font-style: italic;
}

.member-role {
  margin-left: 10px;
}

.role-badge {
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: bold;
  text-transform: uppercase;
}

.role-badge.admin {
  background: #ff4444;
  color: white;
}

.role-badge.moderator {
  background: #ff8800;
  color: white;
}

.role-badge.trusted {
  background: #00ff00;
  color: black;
}

.role-badge.member {
  background: #ddd;
  color: #666;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #888;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 10px;
}

.empty-text {
  font-size: 14px;
}

.member-context-menu {
  position: fixed;
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  min-width: 150px;
  overflow: hidden;
}

.context-menu-item {
  padding: 10px 15px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s ease;
}

.context-menu-item:hover {
  background: #f0f0f0;
}

.context-menu-divider {
  height: 1px;
  background: #e0e0e0;
  margin: 5px 0;
}

.context-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 999;
}

/* 滚动条样式 */
.members-container::-webkit-scrollbar {
  width: 6px;
}

.members-container::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.members-container::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.members-container::-webkit-scrollbar-thumb:hover {
  background: #a1a1a1;
}
</style>