<template>
  <div class="room-manager-overlay">
    <div class="room-manager-modal">
      <div class="manager-header">
        <h3>房间管理</h3>
        <button @click="$emit('close')" class="close-button">×</button>
      </div>
      
      <div class="manager-content">
        <!-- 房间信息 -->
        <div class="room-info-section">
          <div class="section-header">
            <h4>房间信息</h4>
            <button @click="editMode = !editMode" class="edit-button">
              {{ editMode ? '保存' : '编辑' }}
            </button>
          </div>
          
          <div class="room-details">
            <div class="detail-row">
              <label>房间名称:</label>
              <input
                v-if="editMode"
                v-model="roomInfo.name"
                type="text"
                class="edit-input"
              />
              <span v-else class="detail-value">{{ roomInfo.name }}</span>
            </div>
            
            <div class="detail-row">
              <label>房间ID:</label>
              <span class="detail-value room-id">{{ roomInfo.id }}</span>
              <button @click="copyToClipboard(roomInfo.id)" class="copy-button">复制</button>
            </div>
            
            <div class="detail-row">
              <label>房间别名:</label>
              <input
                v-if="editMode"
                v-model="roomInfo.alias"
                type="text"
                class="edit-input"
                placeholder="#room-alias:matrix.org"
              />
              <span v-else class="detail-value">{{ roomInfo.alias || '无' }}</span>
            </div>
            
            <div class="detail-row">
              <label>房间主题:</label>
              <textarea
                v-if="editMode"
                v-model="roomInfo.topic"
                class="edit-textarea"
                placeholder="房间主题描述..."
              ></textarea>
              <span v-else class="detail-value">{{ roomInfo.topic || '无' }}</span>
            </div>
            
            <div class="detail-row">
              <label>房间类型:</label>
              <select v-if="editMode" v-model="roomInfo.isPublic" class="edit-select">
                <option :value="true">公开房间</option>
                <option :value="false">私密房间</option>
              </select>
              <span v-else class="detail-value">
                {{ roomInfo.isPublic ? '公开房间' : '私密房间' }}
              </span>
            </div>
            
            <div class="detail-row">
              <label>端到端加密:</label>
              <label v-if="editMode" class="checkbox-label">
                <input type="checkbox" v-model="roomInfo.encrypted" />
                <span class="checkmark"></span>
              </label>
              <span v-else class="detail-value encryption-status" :class="{ enabled: roomInfo.encrypted }">
                {{ roomInfo.encrypted ? '🔐 已启用' : '🔓 未启用' }}
              </span>
            </div>
          </div>
        </div>

        <!-- 成员管理 -->
        <div class="members-section">
          <div class="section-header">
            <h4>成员管理 ({{ members.length }})</h4>
            <button @click="showInviteDialog = true" class="invite-button">
              邀请用户
            </button>
          </div>
          
          <div class="members-list">
            <div
              v-for="member in members"
              :key="member.id"
              class="member-item"
            >
              <div class="member-avatar">
                <img v-if="member.avatarUrl" :src="member.avatarUrl" :alt="member.name" />
                <div v-else class="default-avatar">{{ member.name.charAt(0).toUpperCase() }}</div>
              </div>
              
              <div class="member-info">
                <div class="member-name">{{ member.name }}</div>
                <div class="member-id">{{ member.id }}</div>
                <div class="member-role" :class="member.role">{{ getRoleText(member.role) }}</div>
              </div>
              
              <div class="member-actions">
                <select
                  v-if="canManageMembers && member.role !== 'admin'"
                  v-model="member.role"
                  @change="updateMemberRole(member)"
                  class="role-select"
                >
                  <option value="member">成员</option>
                  <option value="moderator">管理员</option>
                  <option value="admin">房主</option>
                </select>
                
                <button
                  v-if="canKickMembers && member.role !== 'admin'"
                  @click="kickMember(member)"
                  class="kick-button"
                  title="踢出房间"
                >
                  🚪
                </button>
                
                <button
                  v-if="canBanMembers && member.role !== 'admin'"
                  @click="banMember(member)"
                  class="ban-button"
                  title="封禁用户"
                >
                  🚫
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 房间设置 -->
        <div class="settings-section">
          <div class="section-header">
            <h4>房间设置</h4>
          </div>
          
          <div class="settings-grid">
            <div class="setting-item">
              <label class="setting-label">
                <input type="checkbox" v-model="settings.allowGuests" />
                <span class="checkmark"></span>
                允许访客加入
              </label>
            </div>
            
            <div class="setting-item">
              <label class="setting-label">
                <input type="checkbox" v-model="settings.enableHistory" />
                <span class="checkmark"></span>
                新成员可查看历史消息
              </label>
            </div>
            
            <div class="setting-item">
              <label class="setting-label">
                <input type="checkbox" v-model="settings.requireInvite" />
                <span class="checkmark"></span>
                需要邀请才能加入
              </label>
            </div>
            
            <div class="setting-item">
              <label class="setting-label">
                <input type="checkbox" v-model="settings.enableNotifications" />
                <span class="checkmark"></span>
                启用推送通知
              </label>
            </div>
          </div>
        </div>

        <!-- 危险操作 -->
        <div class="danger-section">
          <div class="section-header">
            <h4>危险操作</h4>
          </div>
          
          <div class="danger-actions">
            <button @click="leaveRoom" class="danger-button leave">
              离开房间
            </button>
            
            <button
              v-if="isRoomAdmin"
              @click="deleteRoom"
              class="danger-button delete"
            >
              删除房间
            </button>
          </div>
        </div>
      </div>
      
      <div class="manager-footer">
        <button @click="saveChanges" class="save-button" :disabled="!hasChanges">
          保存更改
        </button>
        <button @click="$emit('close')" class="cancel-button">
          关闭
        </button>
      </div>
    </div>

    <!-- 邀请用户对话框 -->
    <div v-if="showInviteDialog" class="invite-overlay" @click="showInviteDialog = false">
      <div class="invite-dialog" @click.stop>
        <div class="invite-header">
          <h4>邀请用户</h4>
          <button @click="showInviteDialog = false" class="close-button">×</button>
        </div>
        
        <div class="invite-content">
          <div class="invite-input-group">
            <label>用户ID或邮箱:</label>
            <input
              v-model="inviteUserId"
              type="text"
              placeholder="@username:matrix.org 或 user@example.com"
              class="invite-input"
            />
          </div>
          
          <div class="invite-message-group">
            <label>邀请消息 (可选):</label>
            <textarea
              v-model="inviteMessage"
              placeholder="欢迎加入我们的房间..."
              class="invite-textarea"
            ></textarea>
          </div>
        </div>
        
        <div class="invite-footer">
          <button @click="sendInvite" class="invite-send-button" :disabled="!inviteUserId.trim()">
            发送邀请
          </button>
          <button @click="showInviteDialog = false" class="invite-cancel-button">
            取消
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useMatrixStore } from '@/stores/matrix'

const props = defineProps<{
  roomId: string
}>()

const emit = defineEmits(['close', 'room-updated'])

const matrixStore = useMatrixStore()

// 状态
const editMode = ref(false)
const showInviteDialog = ref(false)
const inviteUserId = ref('')
const inviteMessage = ref('')

// 房间信息
const roomInfo = ref({
  id: props.roomId,
  name: 'Matrix Room',
  alias: '#example:matrix.org',
  topic: 'A Matrix protocol room',
  isPublic: true,
  encrypted: false,
  memberCount: 0
})

// 成员列表
const members = ref([
  {
    id: '@alice:matrix.org',
    name: 'Alice',
    avatarUrl: '',
    role: 'admin',
    powerLevel: 100
  },
  {
    id: '@bob:matrix.org',
    name: 'Bob',
    avatarUrl: '',
    role: 'moderator',
    powerLevel: 50
  },
  {
    id: '@charlie:matrix.org',
    name: 'Charlie',
    avatarUrl: '',
    role: 'member',
    powerLevel: 0
  }
])

// 房间设置
const settings = ref({
  allowGuests: false,
  enableHistory: true,
  requireInvite: false,
  enableNotifications: true
})

// 计算属性
const canManageMembers = computed(() => {
  // 检查当前用户是否有管理成员的权限
  return true // 简化实现
})

const canKickMembers = computed(() => {
  return true // 简化实现
})

const canBanMembers = computed(() => {
  return true // 简化实现
})

const isRoomAdmin = computed(() => {
  return true // 简化实现
})

const hasChanges = computed(() => {
  // 检查是否有未保存的更改
  return true // 简化实现
})

// 方法
const getRoleText = (role: string) => {
  const roleMap = {
    admin: '房主',
    moderator: '管理员',
    member: '成员'
  }
  return roleMap[role as keyof typeof roleMap] || '成员'
}

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    // 显示复制成功提示
  } catch (error) {
    console.error('Failed to copy to clipboard:', error)
  }
}

const updateMemberRole = async (member: any) => {
  try {
    // 调用API更新成员角色
    console.log('Updating member role:', member)
  } catch (error) {
    console.error('Failed to update member role:', error)
  }
}

const kickMember = async (member: any) => {
  if (confirm(`确定要踢出用户 ${member.name} 吗？`)) {
    try {
      // 调用API踢出成员
      console.log('Kicking member:', member)
    } catch (error) {
      console.error('Failed to kick member:', error)
    }
  }
}

const banMember = async (member: any) => {
  if (confirm(`确定要封禁用户 ${member.name} 吗？`)) {
    try {
      // 调用API封禁成员
      console.log('Banning member:', member)
    } catch (error) {
      console.error('Failed to ban member:', error)
    }
  }
}

const sendInvite = async () => {
  try {
    // 调用API发送邀请
    console.log('Sending invite to:', inviteUserId.value)
    showInviteDialog.value = false
    inviteUserId.value = ''
    inviteMessage.value = ''
  } catch (error) {
    console.error('Failed to send invite:', error)
  }
}

const saveChanges = async () => {
  try {
    // 保存房间信息和设置
    console.log('Saving room changes')
    emit('room-updated', roomInfo.value)
  } catch (error) {
    console.error('Failed to save changes:', error)
  }
}

const leaveRoom = async () => {
  if (confirm('确定要离开这个房间吗？')) {
    try {
      // 调用API离开房间
      console.log('Leaving room')
      emit('close')
    } catch (error) {
      console.error('Failed to leave room:', error)
    }
  }
}

const deleteRoom = async () => {
  if (confirm('确定要删除这个房间吗？此操作不可撤销！')) {
    try {
      // 调用API删除房间
      console.log('Deleting room')
      emit('close')
    } catch (error) {
      console.error('Failed to delete room:', error)
    }
  }
}

// 生命周期
onMounted(() => {
  // 加载房间信息
  console.log('Loading room info for:', props.roomId)
})
</script>

<style scoped>
.room-manager-overlay {
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

.room-manager-modal {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border: 1px solid #3a4a5c;
  border-radius: 16px;
  width: 90%;
  max-width: 800px;
  height: 90%;
  display: flex;
  flex-direction: column;
  color: #e0e6ed;
}

.manager-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #3a4a5c;
}

.manager-header h3 {
  color: #64b5f6;
  margin: 0;
  font-size: 1.5rem;
}

.close-button {
  background: none;
  border: none;
  color: #e0e6ed;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background 0.3s ease;
}

.close-button:hover {
  background: rgba(255, 255, 255, 0.1);
}

.manager-content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-header h4 {
  color: #64b5f6;
  margin: 0;
  font-size: 1.2rem;
}

.edit-button,
.invite-button {
  padding: 6px 12px;
  background: rgba(100, 181, 246, 0.2);
  border: 1px solid rgba(100, 181, 246, 0.3);
  border-radius: 6px;
  color: #64b5f6;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.edit-button:hover,
.invite-button:hover {
  background: rgba(100, 181, 246, 0.3);
}

.room-info-section,
.members-section,
.settings-section,
.danger-section {
  margin-bottom: 32px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.detail-row {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  gap: 12px;
}

.detail-row label {
  min-width: 120px;
  color: #b0bec5;
  font-weight: 500;
}

.detail-value {
  flex: 1;
  color: #e0e6ed;
}

.room-id {
  font-family: monospace;
  font-size: 0.9rem;
}

.copy-button {
  padding: 4px 8px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  color: #e0e6ed;
  cursor: pointer;
  font-size: 0.8rem;
  transition: background 0.3s ease;
}

.copy-button:hover {
  background: rgba(255, 255, 255, 0.2);
}

.edit-input,
.edit-select {
  flex: 1;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  color: #e0e6ed;
  font-size: 0.9rem;
}

.edit-textarea {
  flex: 1;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  color: #e0e6ed;
  font-size: 0.9rem;
  resize: vertical;
  min-height: 60px;
}

.edit-input:focus,
.edit-select:focus,
.edit-textarea:focus {
  outline: none;
  border-color: #64b5f6;
}

.encryption-status.enabled {
  color: #81c784;
}

.checkbox-label {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  margin-right: 8px;
}

.members-list {
  max-height: 300px;
  overflow-y: auto;
}

.member-item {
  display: flex;
  align-items: center;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  margin-bottom: 8px;
  gap: 12px;
}

.member-avatar {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  overflow: hidden;
}

.member-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.default-avatar {
  width: 100%;
  height: 100%;
  background: #64b5f6;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: #1a1a2e;
}

.member-info {
  flex: 1;
}

.member-name {
  font-weight: 600;
  color: #e0e6ed;
  margin-bottom: 2px;
}

.member-id {
  font-size: 0.8rem;
  color: #b0bec5;
  font-family: monospace;
  margin-bottom: 2px;
}

.member-role {
  font-size: 0.8rem;
  padding: 2px 6px;
  border-radius: 10px;
  display: inline-block;
}

.member-role.admin {
  background: rgba(244, 67, 54, 0.2);
  color: #f44336;
}

.member-role.moderator {
  background: rgba(255, 167, 38, 0.2);
  color: #ffa726;
}

.member-role.member {
  background: rgba(129, 199, 132, 0.2);
  color: #81c784;
}

.member-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.role-select {
  padding: 4px 8px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  color: #e0e6ed;
  font-size: 0.8rem;
}

.kick-button,
.ban-button {
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.kick-button {
  background: rgba(255, 167, 38, 0.2);
}

.kick-button:hover {
  background: rgba(255, 167, 38, 0.3);
}

.ban-button {
  background: rgba(244, 67, 54, 0.2);
}

.ban-button:hover {
  background: rgba(244, 67, 54, 0.3);
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.setting-item {
  display: flex;
  align-items: center;
}

.setting-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  color: #e0e6ed;
}

.setting-label input[type="checkbox"] {
  margin-right: 8px;
}

.danger-actions {
  display: flex;
  gap: 12px;
}

.danger-button {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.danger-button.leave {
  background: rgba(255, 167, 38, 0.2);
  color: #ffa726;
  border: 1px solid rgba(255, 167, 38, 0.3);
}

.danger-button.leave:hover {
  background: rgba(255, 167, 38, 0.3);
}

.danger-button.delete {
  background: rgba(244, 67, 54, 0.2);
  color: #f44336;
  border: 1px solid rgba(244, 67, 54, 0.3);
}

.danger-button.delete:hover {
  background: rgba(244, 67, 54, 0.3);
}

.manager-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid #3a4a5c;
}

.save-button,
.cancel-button {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.save-button {
  background: #64b5f6;
  color: #1a1a2e;
}

.save-button:hover:not(:disabled) {
  background: #42a5f5;
}

.save-button:disabled {
  background: #555;
  color: #999;
  cursor: not-allowed;
}

.cancel-button {
  background: rgba(255, 255, 255, 0.1);
  color: #e0e6ed;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.cancel-button:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* 邀请对话框样式 */
.invite-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1001;
}

.invite-dialog {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border: 1px solid #3a4a5c;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  color: #e0e6ed;
}

.invite-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #3a4a5c;
}

.invite-header h4 {
  color: #64b5f6;
  margin: 0;
}

.invite-content {
  padding: 20px;
}

.invite-input-group,
.invite-message-group {
  margin-bottom: 16px;
}

.invite-input-group label,
.invite-message-group label {
  display: block;
  margin-bottom: 8px;
  color: #b0bec5;
  font-weight: 500;
}

.invite-input,
.invite-textarea {
  width: 100%;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  color: #e0e6ed;
  font-size: 0.9rem;
}

.invite-textarea {
  resize: vertical;
  min-height: 80px;
}

.invite-input:focus,
.invite-textarea:focus {
  outline: none;
  border-color: #64b5f6;
}

.invite-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid #3a4a5c;
}

.invite-send-button,
.invite-cancel-button {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.invite-send-button {
  background: #64b5f6;
  color: #1a1a2e;
}

.invite-send-button:hover:not(:disabled) {
  background: #42a5f5;
}

.invite-send-button:disabled {
  background: #555;
  color: #999;
  cursor: not-allowed;
}

.invite-cancel-button {
  background: rgba(255, 255, 255, 0.1);
  color: #e0e6ed;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.invite-cancel-button:hover {
  background: rgba(255, 255, 255, 0.2);
}
</style>
