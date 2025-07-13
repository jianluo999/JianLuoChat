<template>
  <el-dialog
    v-model="dialogVisible"
    title="房间信息"
    width="600px"
    :before-close="handleClose"
  >
    <div v-if="room" class="room-info">
      <div class="room-header">
        <el-avatar :size="60" :src="room.avatarUrl">
          {{ room.name[0] }}
        </el-avatar>
        <div class="room-details">
          <h3>{{ room.name }}</h3>
          <p class="room-type">
            <el-tag :type="room.type === 'group' ? 'primary' : 'success'">
              {{ room.type === 'group' ? '群聊' : '私聊' }}
            </el-tag>
          </p>
        </div>
      </div>

      <el-divider />

      <div class="room-stats">
        <div class="stat-item">
          <div class="stat-label">成员数量</div>
          <div class="stat-value">{{ room.members.length }}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">未读消息</div>
          <div class="stat-value">{{ room.unreadCount }}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">房间类型</div>
          <div class="stat-value">{{ room.type === 'group' ? '群聊' : '私聊' }}</div>
        </div>
      </div>

      <el-divider />

      <div class="room-members">
        <h4>房间成员</h4>
        <div class="member-list">
          <div
            v-for="member in room.members"
            :key="member"
            class="member-item"
          >
            <el-avatar :size="32">
              {{ member[0] }}
            </el-avatar>
            <div class="member-info">
              <div class="member-name">{{ member }}</div>
              <div class="member-status">
                <el-tag
                  :type="isUserOnline(member) ? 'success' : 'info'"
                  size="small"
                >
                  {{ isUserOnline(member) ? '在线' : '离线' }}
                </el-tag>
              </div>
            </div>
          </div>
        </div>
      </div>

      <el-divider />

      <div class="room-actions">
        <el-button
          v-if="room.type === 'group'"
          type="primary"
          @click="showInviteDialog = true"
        >
          <el-icon><User /></el-icon>
          邀请成员
        </el-button>
        
        <el-button @click="handleMuteRoom">
          <el-icon><BellFilled /></el-icon>
          {{ room.isMuted ? '取消静音' : '静音房间' }}
        </el-button>
        
        <el-button type="danger" @click="handleLeaveRoom">
          <el-icon><Right /></el-icon>
          离开房间
        </el-button>
      </div>
    </div>

    <!-- 邀请成员对话框 -->
    <el-dialog
      v-model="showInviteDialog"
      title="邀请成员"
      width="400px"
      append-to-body
    >
      <el-select
        v-model="inviteUsers"
        multiple
        filterable
        remote
        reserve-keyword
        placeholder="搜索并选择用户"
        :remote-method="searchUsers"
        :loading="searchLoading"
        style="width: 100%"
      >
        <el-option
          v-for="user in userOptions"
          :key="user.id"
          :label="user.displayName || user.username"
          :value="user.username"
          :disabled="room?.members.includes(user.username)"
        >
          <div class="user-option">
            <el-avatar :size="24" :src="user.avatarUrl">
              {{ (user.displayName || user.username)[0] }}
            </el-avatar>
            <div class="user-info">
              <div class="user-name">{{ user.displayName || user.username }}</div>
              <div class="user-email">{{ user.email }}</div>
            </div>
          </div>
        </el-option>
      </el-select>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showInviteDialog = false">取消</el-button>
          <el-button
            type="primary"
            :loading="inviteLoading"
            :disabled="inviteUsers.length === 0"
            @click="handleInviteUsers"
          >
            邀请
          </el-button>
        </div>
      </template>
    </el-dialog>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { User, BellFilled, Right } from '@element-plus/icons-vue'
import { useChatStore } from '@/stores/chat'
import { userAPI } from '@/services/api'
import type { Room } from '@/stores/chat'

interface Props {
  modelValue: boolean
  room?: Room | null
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const chatStore = useChatStore()

const dialogVisible = ref(false)
const showInviteDialog = ref(false)
const inviteLoading = ref(false)
const searchLoading = ref(false)
const inviteUsers = ref<string[]>([])
const userOptions = ref<any[]>([])

watch(() => props.modelValue, (val) => {
  dialogVisible.value = val
})

watch(dialogVisible, (val) => {
  emit('update:modelValue', val)
  if (!val) {
    showInviteDialog.value = false
    inviteUsers.value = []
    userOptions.value = []
  }
})

const isUserOnline = (username: string) => {
  return chatStore.onlineUsers.has(username)
}

const searchUsers = async (query: string) => {
  if (!query) {
    userOptions.value = []
    return
  }

  searchLoading.value = true
  try {
    const response = await userAPI.searchUsers(query)
    userOptions.value = response.data
  } catch (error) {
    ElMessage.error('搜索用户失败')
  } finally {
    searchLoading.value = false
  }
}

const handleInviteUsers = async () => {
  if (!props.room || inviteUsers.value.length === 0) return

  inviteLoading.value = true
  try {
    // 这里应该调用邀请用户的API
    // await roomAPI.inviteUsers(props.room.id, inviteUsers.value)
    
    ElMessage.success('邀请发送成功')
    showInviteDialog.value = false
    inviteUsers.value = []
  } catch (error) {
    ElMessage.error('邀请用户失败')
  } finally {
    inviteLoading.value = false
  }
}

const handleMuteRoom = async () => {
  if (!props.room) return

  try {
    // 这里应该调用静音房间的API
    // await roomAPI.muteRoom(props.room.id, !props.room.isMuted)
    
    ElMessage.success(props.room.isMuted ? '已取消静音' : '已静音房间')
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const handleLeaveRoom = async () => {
  if (!props.room) return

  try {
    await ElMessageBox.confirm(
      '确定要离开这个房间吗？离开后将无法接收到房间消息。',
      '确认离开',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await chatStore.leaveRoom(props.room.id)
    ElMessage.success('已离开房间')
    handleClose()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('离开房间失败')
    }
  }
}

const handleClose = () => {
  dialogVisible.value = false
}
</script>

<style scoped>
.room-info {
  padding: 16px 0;
}

.room-header {
  display: flex;
  align-items: center;
  gap: 16px;
}

.room-details h3 {
  margin: 0 0 8px 0;
  color: #303133;
  font-size: 20px;
}

.room-type {
  margin: 0;
}

.room-stats {
  display: flex;
  gap: 32px;
}

.stat-item {
  text-align: center;
}

.stat-label {
  font-size: 12px;
  color: #909399;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.room-members h4 {
  margin: 0 0 16px 0;
  color: #303133;
}

.member-list {
  max-height: 200px;
  overflow-y: auto;
}

.member-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
}

.member-info {
  flex: 1;
}

.member-name {
  font-weight: 500;
  color: #303133;
}

.member-status {
  margin-top: 4px;
}

.room-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.user-option {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-info {
  flex: 1;
}

.user-name {
  font-weight: 500;
  color: #303133;
}

.user-email {
  font-size: 12px;
  color: #909399;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
