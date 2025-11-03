<template>
  <div class="advanced-room-management-dialog">
    <div class="dialog-overlay" @click="$emit('close')"></div>
    <div class="dialog-content">
      <div class="dialog-header">
        <h3>高级房间管理</h3>
        <button class="close-btn" @click="$emit('close')">✕</button>
      </div>
      <div class="dialog-body">
        <div class="management-tabs">
          <button 
            :class="{ active: activeTab === 'members' }"
            @click="activeTab = 'members'"
          >成员管理</button>
          <button 
            :class="{ active: activeTab === 'settings' }"
            @click="activeTab = 'settings'"
          >房间设置</button>
          <button 
            :class="{ active: activeTab === 'moderation' }"
            @click="activeTab = 'moderation'"
          >管理操作</button>
        </div>
        <div class="tab-content">
          <div v-if="loading">加载中...</div>
          <div v-else-if="activeTab === 'members'">
            <div class="members-search">
              <input 
                v-model="searchQuery"
                placeholder="搜索成员"
                @input="debounceSearch"
              >
            </div>
            <div class="members-list">
              <div 
                v-for="member in filteredMembers"
                :key="member.userId"
                class="member-item"
                :class="{ admin: member.powerLevel >= 100 }"
              >
                <div class="member-info">
                  <div class="member-name">{{ member.displayName || member.userId }}</div>
                  <div class="member-id">{{ member.userId }}</div>
                  <div class="member-role">
                    <span :class="getRoleClass(member.powerLevel)">
                      {{ getRoleText(member.powerLevel) }}
                    </span>
                  </div>
                </div>
                <div class="member-actions">
                  <button 
                    v-if="canManageMember(member)"
                    @click="promoteMember(member)"
                  >提升权限</button>
                  <button 
                    v-if="canKick"
                    @click="kickMember(member)"
                  >踢出房间</button>
                  <button 
                    class="danger"
                    v-if="canBan"
                    @click="showBanDialog(member)"
                  >封禁用户</button>
                  <button 
                    @click="viewMemberInfo(member)"
                  >查看详情</button>
                </div>
              </div>
            </div>
          </div>
          <div v-else-if="activeTab === 'settings'">
            <div class="room-settings">
              <div class="setting-section">
                <h4>房间基础设置</h4>
                <div class="setting-row">
                  <label>房间名称</label>
                  <input v-model="roomSettings.name" placeholder="房间名称" />
                </div>
                <div class="setting-row">
                  <label>房间描述</label>
                  <textarea v-model="roomSettings.topic" placeholder="房间描述" rows="3"></textarea>
                </div>
                <div class="setting-row">
                  <label>房间类型</label>
                  <select v-model="roomSettings.type">
                    <option value="public">公开房间</option>
                    <option value="private">私有房间</option>
                  </select>
                </div>
                <div class="setting-row">
                  <label>房间权限级别</label>
                  <input type="number" v-model="roomSettings.powerLevel" placeholder="默认: 50" min="0" max="100" step="10" />
                </div>
              </div>
              <div class="setting-section">
                <h4>高级设置</h4>
                <div class="setting-checkbox">
                  <input type="checkbox" v-model="roomSettings.enableEncryption">
                  <label>启用端到端加密</label>
                </div>
                <div class="setting-checkbox">
                  <input type="checkbox" v-model="roomSettings.allowFileUpload">
                  <label>允许文件上传</label>
                </div>
                <div class="setting-row">
                  <label>最大文件大小 (MB)</label>
                  <input type="number" v-model="roomSettings.maxFileSize" placeholder="最大文件大小 (MB)" min="1" />
                </div>
                <div class="setting-row">
                  <label>成员权限设置</label>
                  <div class="permissions-grid">
                    <div class="permission-row">
                      <label>新成员权限</label>
                      <select v-model="roomSettings.defaultPowerLevel">
                        <option value="0">普通成员</option>
                        <option value="50">管理员</option>
                        <option value="100">管理员</option>
                      </select>
                    </div>
                    <div class="permission-row">
                      <label>权限级别</label>
                      <input type="number" v-model="roomSettings.roomPowerLevel" placeholder="房间权限级别" min="0" max="100" step="1" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-else-if="activeTab === 'moderation'">
            <div class="moderation-actions">
              <h4>管理操作</h4>
              <div class="moderation-grid">
                <div class="moderation-card">
                  <h5>房间历史记录</h5>
                  <button @click="loadRoomHistory">查看历史记录</button>
                  <button @click="clearRoomHistory">清空历史记录</button>
                </div>
                <div class="moderation-card">
                  <h5>权限管理</h5>
                  <button @click="managePermissions">管理权限</button>
                  <button @click="resetPermissions">重置权限</button>
                </div>
                <div class="moderation-card">
                  <h5>安全设置</h5>
                  <button @click="enableRoomLock">锁定房间</button>
                  <button @click="disableRoomLock">解锁房间</button>
                </div>
              </div>
            </div>
          </div>
          <div v-else-if="banDialogVisible">
            <div class="ban-dialog">
              <h4>封禁用户</h4>
              <div class="ban-options">
                <div class="option-row">
                  <label>
                    <input type="checkbox" v-model="banOptions.banFromRoom">
                    <span>禁止加入房间</span>
                  </label>
                </div>
                <div class="option-row">
                  <label>
                    <input type="checkbox" v-model="banOptions.banFromServer">
                    <span>禁止访问服务器</span>
                  </label>
                </div>
                <div class="ban-duration">
                  <label>封禁时长</label>
                  <select v-model="banDuration">
                    <option value="1h">1小时</option>
                    <option value="6h">6小时</option>
                    <option value="1d">1天</option>
                    <option value="7d">7天</option>
                    <option value="30d">30天</option>
                    <option value="permanent">永久</option>
                  </select>
                </div>
                <div class="ban-reason">
                  <label>封禁原因</label>
                  <textarea v-model="banReason" placeholder="请输入封禁原因" rows="3"></textarea>
                </div>
                <div class="ban-actions">
                  <button @click="banUser">确认封禁</button>
                  <button @click="closeBanDialog">取消</button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="dialog-footer">
          <button @click="$emit('close')">取消</button>
          <button :disabled="!canSaveSettings" @click="saveSettings">保存设置</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useMatrixStore } from '@/stores/matrix'
import { debounce } from 'lodash-es'

interface RoomMember {
  userId: string
  displayName: string
  powerLevel: number
  avatarUrl?: string
  membership: 'join' | 'invite' | 'leave' | 'ban'
}

interface RoomSettings {
  name: string
  topic: string
  type: 'public' | 'private'
  enableEncryption: boolean
  allowFileUpload: boolean
  maxFileSize: number
  powerLevel: number
  roomPowerLevel: number
  defaultPowerLevel: number
  maxMemberCount: number
  enableHistory: boolean
}

interface BanOptions {
  banFromRoom: boolean
  banFromServer: boolean
}

const props = defineProps<{
  roomId: string
}>()

const emit = defineEmits(['close'])

const matrixStore = useMatrixStore()

// 状态管理
const activeTab = ref<'members' | 'settings' | 'moderation'>('members')
const loading = ref(false)
const searchQuery = ref('')
const banDialogVisible = ref(false)
const banReason = ref('')
const banDuration = ref('1h')

// 数据
const members = ref<RoomMember[]>([])
const roomSettings = ref<RoomSettings>({
  name: '',
  topic: '',
  type: 'public',
  enableEncryption: false,
  allowFileUpload: true,
  maxFileSize: 100,
  powerLevel: 50,
  roomPowerLevel: 50,
  defaultPowerLevel: 0,
  maxMemberCount: 100,
  enableHistory: true
})

const banOptions = ref<BanOptions>({
  banFromRoom: true,
  banFromServer: false
})

// 计算属性
const filteredMembers = computed(() => {
  if (!searchQuery.value) return members.value
  const query = searchQuery.value.toLowerCase()
  return members.value.filter(member => 
    member.displayName.toLowerCase().includes(query) ||
    member.userId.toLowerCase().includes(query)
  )
})

const canKick = computed(() => {
  return matrixStore.canKick
})

const canBan = computed(() => {
  return matrixStore.canBan
})

const canSaveSettings = computed(() => {
  return !loading.value && activeTab.value === 'settings'
})

// 方法
const debounceSearch = debounce((event: Event) => {
  // 搜索逻辑
}, 300)

const loadRoomInfo = async () => {
  loading.value = true
  try {
    const room = matrixStore.getRoom(props.roomId)
    if (room) {
      roomSettings.value.name = room.name || ''
      roomSettings.value.topic = room.topic || ''
      roomSettings.value.type = room.isPublic ? 'public' : 'private'
      roomSettings.value.enableEncryption = room.encryptionEnabled || false
      roomSettings.value.allowFileUpload = room.allowFileUpload || true
      roomSettings.value.maxFileSize = room.maxFileSize || 100
      roomSettings.value.powerLevel = room.powerLevel || 50
    }
    
    // 加载成员列表
    members.value = await matrixStore.getRoomMembers(props.roomId)
  } catch (error) {
    console.error('加载房间信息失败:', error)
  } finally {
    loading.value = false
  }
}

const getRoleClass = (powerLevel: number) => {
  if (powerLevel >= 100) return 'role-admin'
  if (powerLevel >= 50) return 'role-moderator'
  return 'role-member'
}

const getRoleText = (powerLevel: number) => {
  if (powerLevel >= 100) return '管理员'
  if (powerLevel >= 50) return '管理员'
  return '普通成员'
}

const canManageMember = (member: RoomMember) => {
  const currentUserPower = matrixStore.getCurrentUserPowerLevel(props.roomId)
  return currentUserPower > member.powerLevel
}

const promoteMember = async (member: RoomMember) => {
  try {
    await matrixStore.promoteMember(props.roomId, member.userId, member.powerLevel + 10)
    await loadRoomInfo()
  } catch (error) {
    console.error('提升成员权限失败:', error)
  }
}

const kickMember = async (member: RoomMember) => {
  try {
    await matrixStore.kickMember(props.roomId, member.userId)
    await loadRoomInfo()
  } catch (error) {
    console.error('踢出成员失败:', error)
  }
}

const showBanDialog = (member: RoomMember) => {
  banDialogVisible.value = true
  // 可以在这里设置当前要封禁的成员信息
}

const banUser = async () => {
  try {
    await matrixStore.banUser(props.roomId, banReason.value, banDuration.value)
    banDialogVisible.value = false
    await loadRoomInfo()
  } catch (error) {
    console.error('封禁用户失败:', error)
  }
}

const closeBanDialog = () => {
  banDialogVisible.value = false
}

const viewMemberInfo = (member: RoomMember) => {
  // 查看成员详细信息
  console.log('查看成员信息:', member)
}

const saveSettings = async () => {
  try {
    loading.value = true
    await matrixStore.updateRoomSettings(props.roomId, roomSettings.value)
    emit('settings-saved')
  } catch (error) {
    console.error('保存设置失败:', error)
  } finally {
    loading.value = false
  }
}

const loadRoomHistory = async () => {
  try {
    const history = await matrixStore.getRoomHistory(props.roomId)
    console.log('房间历史记录:', history)
  } catch (error) {
    console.error('加载房间历史失败:', error)
  }
}

const clearRoomHistory = async () => {
  if (confirm('确定要清空房间历史记录吗？此操作不可逆！')) {
    try {
      await matrixStore.clearRoomHistory(props.roomId)
      console.log('房间历史记录已清空')
    } catch (error) {
      console.error('清空房间历史失败:', error)
    }
  }
}

const managePermissions = async () => {
  // 权限管理逻辑
  console.log('管理权限')
}

const resetPermissions = async () => {
  if (confirm('确定要重置房间权限吗？此操作将恢复默认权限设置！')) {
    try {
      await matrixStore.resetRoomPermissions(props.roomId)
      await loadRoomInfo()
    } catch (error) {
      console.error('重置权限失败:', error)
    }
  }
}

const enableRoomLock = async () => {
  try {
    await matrixStore.lockRoom(props.roomId)
    console.log('房间已锁定')
  } catch (error) {
    console.error('锁定房间失败:', error)
  }
}

const disableRoomLock = async () => {
  try {
    await matrixStore.unlockRoom(props.roomId)
    console.log('房间已解锁')
  } catch (error) {
    console.error('解锁房间失败:', error)
  }
}

// 生命周期
onMounted(() => {
  loadRoomInfo()
})

onUnmounted(() => {
  // 清理工作
})
</script>

<style scoped>
.advanced-room-management-dialog {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
}

.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
  background: rgba(0, 0, 0, 0.5);
}

.dialog-content {
  background: white;
  border-radius: 8px;
  max-width: 800px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  position: relative;
  z-index: 1001;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  padding: 15px 20px;
  border-bottom: 1px solid #ddd;
  background: #f8f8f8;
}

.dialog-header h3 {
  margin: 0;
  color: #333;
  font-size: 16px;
}

.close-btn {
  background: transparent;
  border: none;
  font-size: 24px;
  font-weight: bold;
  cursor: pointer;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.management-tabs {
  display: flex;
  background: #f8f8f8;
  border-bottom: 1px solid #ddd;
  padding: 10px;
}

.management-tabs button {
  flex: 1;
  padding: 8px 16px;
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 14px;
  color: #666;
  border-bottom: 2px solid transparent;
}

.management-tabs button.active {
  color: #007bff;
  border-bottom-color: #007bff;
}

.management-tabs button:hover {
  color: #007bff;
}

.tab-content {
  padding: 20px;
}

.members-search {
  margin-bottom: 15px;
}

.members-search input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.members-list {
  max-height: 400px;
  overflow-y: auto;
}

.member-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border-bottom: 1px solid #eee;
}

.member-item.admin {
  background: #f0f8ff;
}

.member-info {
  flex: 1;
}

.member-name {
  font-weight: bold;
  margin-bottom: 4px;
}

.member-id {
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}

.member-role span {
  padding: 2px 6px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: bold;
}

.role-admin {
  background: #d1ecf1;
  color: #0c5460;
}

.role-moderator {
  background: #fff3cd;
  color: #856404;
}

.role-member {
  background: #e2e3e5;
  color: #383d41;
}

.member-actions {
  display: flex;
  gap: 8px;
}

.member-actions button {
  padding: 4px 8px;
  font-size: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  background: white;
}

.member-actions button:hover {
  background: #f8f9fa;
}

.member-actions button.danger {
  background: #dc3545;
  color: white;
  border-color: #dc3545;
}

.member-actions button.danger:hover {
  background: #c82333;
}

.setting-section {
  margin-bottom: 20px;
}

.setting-section h4 {
  margin: 0 0 10px 0;
  color: #333;
  font-size: 14px;
}

.setting-row {
  margin-bottom: 15px;
}

.setting-row label {
  display: block;
  margin-bottom: 4px;
  font-weight: bold;
  color: #555;
}

.setting-row input,
.setting-row select,
.setting-row textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.setting-row textarea {
  resize: vertical;
}

.setting-checkbox {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.setting-checkbox input {
  margin-right: 8px;
}

.moderation-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.moderation-card {
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.moderation-card h5 {
  margin: 0 0 10px 0;
  color: #333;
  font-size: 14px;
}

.ban-dialog {
  padding: 20px;
}

.ban-dialog h4 {
  margin: 0 0 15px 0;
  color: #333;
}

.option-row {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.option-row label {
  margin-left: 8px;
  font-weight: bold;
  color: #555;
}

.ban-duration,
.ban-reason {
  margin-bottom: 15px;
}

.ban-duration label,
.ban-reason label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  color: #555;
}

.ban-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.ban-actions button {
  padding: 8px 16px;
  font-size: 14px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.ban-actions button:first-child {
  background: #dc3545;
  color: white;
}

.ban-actions button:last-child {
  background: #6c757d;
  color: white;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  padding: 15px 20px;
  border-top: 1px solid #ddd;
  background: #f8f8f8;
}

.dialog-footer button {
  padding: 8px 16px;
  margin-left: 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.dialog-footer button:first-child {
  background: #6c757d;
  color: white;
}

.dialog-footer button:last-child {
  background: #007bff;
  color: white;
}

.dialog-footer button:disabled {
  background: #6c757d;
  color: white;
  cursor: not-allowed;
}
</style>