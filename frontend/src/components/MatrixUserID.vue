<template>
  <div class="matrix-user-id" :class="{ clickable: clickable }" @click="handleClick">
    <div class="user-avatar">
      <img v-if="avatarUrl" :src="avatarUrl" :alt="displayName || userId" />
      <div v-else class="avatar-placeholder">
        {{ getInitials(displayName || userId) }}
      </div>
      <div v-if="showStatus" class="status-indicator" :class="status"></div>
    </div>
    
    <div class="user-info">
      <div class="display-name" v-if="displayName">
        {{ displayName }}
      </div>
      <div class="user-id" :class="{ 'no-display-name': !displayName }">
        <span class="at-symbol">@</span>
        <span class="username">{{ username }}</span>
        <span class="colon">:</span>
        <span class="homeserver">{{ homeserver }}</span>
      </div>
      <div v-if="showFederation" class="federation-info">
        <span class="federation-badge">
          <svg class="federation-icon" viewBox="0 0 24 24">
            <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8Z"/>
          </svg>
          {{ $t('matrix.federated') }}
        </span>
      </div>
    </div>
    
    <div v-if="showActions" class="user-actions">
      <button 
        v-if="!isCurrentUser" 
        @click.stop="startDirectMessage"
        class="action-button dm-button"
        :title="$t('matrix.startDirectMessage')"
      >
        <svg viewBox="0 0 24 24">
          <path d="M20,2H4A2,2 0 0,0 2,4V22L6,18H20A2,2 0 0,0 22,16V4A2,2 0 0,0 20,2M20,16H6L4,18V4H20V16Z"/>
        </svg>
      </button>
      
      <button 
        v-if="!isCurrentUser"
        @click.stop="inviteToRoom"
        class="action-button invite-button"
        :title="$t('matrix.inviteToRoom')"
      >
        <svg viewBox="0 0 24 24">
          <path d="M15,14C12.33,14 7,15.33 7,18V20H23V18C23,15.33 17.67,14 15,14M6,10V7H4V10H1V12H4V15H6V12H9V10M15,12A4,4 0 0,0 19,8A4,4 0 0,0 15,4A4,4 0 0,0 11,8A4,4 0 0,0 15,12Z"/>
        </svg>
      </button>
      
      <button 
        @click.stop="showUserProfile"
        class="action-button profile-button"
        :title="$t('matrix.viewProfile')"
      >
        <svg viewBox="0 0 24 24">
          <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,8.39C13.57,9.4 15.42,10 17.42,10C18.2,10 18.95,9.91 19.67,9.74C19.88,10.45 20,11.21 20,12C20,16.41 16.41,20 12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C13.6,4 15.1,4.5 16.36,5.36C15.37,6.26 14.14,6.89 12.81,7.16C12.54,7.12 12.27,7.1 12,7.1C10.9,7.1 9.9,7.5 9.1,8.1C8.6,8.5 8.2,9 7.9,9.6C7.8,9.8 7.7,10 7.6,10.2C7.4,10.7 7.3,11.3 7.3,12C7.3,12.7 7.4,13.3 7.6,13.8C7.7,14 7.8,14.2 7.9,14.4C8.2,15 8.6,15.5 9.1,15.9C9.9,16.5 10.9,16.9 12,16.9C12.27,16.9 12.54,16.88 12.81,16.84C14.14,17.11 15.37,17.74 16.36,18.64C15.1,19.5 13.6,20 12,20Z"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  userId: string
  displayName?: string
  avatarUrl?: string
  status?: 'online' | 'offline' | 'away' | 'busy'
  showStatus?: boolean
  showFederation?: boolean
  showActions?: boolean
  clickable?: boolean
  isCurrentUser?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showStatus: false,
  showFederation: true,
  showActions: false,
  clickable: false,
  isCurrentUser: false
})

const emit = defineEmits(['click', 'direct-message', 'invite', 'profile'])

const username = computed(() => {
  const match = props.userId.match(/^@([^:]+):(.+)$/)
  return match ? match[1] : props.userId
})

const homeserver = computed(() => {
  const match = props.userId.match(/^@([^:]+):(.+)$/)
  return match ? match[2] : 'unknown'
})

const getInitials = (name: string): string => {
  if (!name) return '?'
  
  // 如果是Matrix ID格式，提取用户名部分
  const cleanName = name.startsWith('@') ? name.split(':')[0].substring(1) : name
  
  const words = cleanName.split(/[\s_-]+/).filter(word => word.length > 0)
  if (words.length === 0) return '?'
  
  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase()
  }
  
  return words.slice(0, 2).map(word => word[0]).join('').toUpperCase()
}

const handleClick = () => {
  if (props.clickable) {
    emit('click', props.userId)
  }
}

const startDirectMessage = () => {
  emit('direct-message', props.userId)
}

const inviteToRoom = () => {
  emit('invite', props.userId)
}

const showUserProfile = () => {
  emit('profile', props.userId)
}
</script>

<style scoped>
.matrix-user-id {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.matrix-user-id.clickable {
  cursor: pointer;
}

.matrix-user-id.clickable:hover {
  background: rgba(255, 255, 255, 0.05);
}

.user-avatar {
  position: relative;
  width: 40px;
  height: 40px;
  flex-shrink: 0;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: linear-gradient(135deg, #64b5f6, #42a5f5);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 0.9rem;
}

.status-indicator {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid #1a1a2e;
}

.status-indicator.online {
  background: #4caf50;
}

.status-indicator.away {
  background: #ff9800;
}

.status-indicator.busy {
  background: #f44336;
}

.status-indicator.offline {
  background: #757575;
}

.user-info {
  flex: 1;
  min-width: 0;
}

.display-name {
  font-weight: 600;
  color: #e0e6ed;
  font-size: 0.95rem;
  margin-bottom: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-id {
  font-family: 'Courier New', monospace;
  font-size: 0.85rem;
  color: #b0bec5;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-id.no-display-name {
  font-size: 0.9rem;
  color: #e0e6ed;
}

.at-symbol {
  color: #64b5f6;
}

.username {
  color: #81c784;
}

.colon {
  color: #b0bec5;
}

.homeserver {
  color: #ffb74d;
}

.federation-info {
  margin-top: 4px;
}

.federation-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: rgba(129, 199, 132, 0.2);
  color: #81c784;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.7rem;
  border: 1px solid rgba(129, 199, 132, 0.3);
}

.federation-icon {
  width: 10px;
  height: 10px;
  fill: currentColor;
}

.user-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.matrix-user-id:hover .user-actions {
  opacity: 1;
}

.action-button {
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.action-button svg {
  width: 14px;
  height: 14px;
  fill: currentColor;
}

.dm-button {
  background: rgba(100, 181, 246, 0.2);
  color: #64b5f6;
}

.dm-button:hover {
  background: rgba(100, 181, 246, 0.3);
}

.invite-button {
  background: rgba(129, 199, 132, 0.2);
  color: #81c784;
}

.invite-button:hover {
  background: rgba(129, 199, 132, 0.3);
}

.profile-button {
  background: rgba(255, 183, 77, 0.2);
  color: #ffb74d;
}

.profile-button:hover {
  background: rgba(255, 183, 77, 0.3);
}
</style>
