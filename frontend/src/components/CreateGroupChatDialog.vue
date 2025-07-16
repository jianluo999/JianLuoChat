<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal create-group-modal" @click.stop>
      <div class="modal-header">
        <h2>创建群聊</h2>
        <button class="close-btn" @click="$emit('close')">×</button>
      </div>

      <div class="modal-content">
        <div class="form-section">
          <label for="roomName">房间名称 *</label>
          <input
            id="roomName"
            type="text"
            v-model="roomName"
            placeholder="输入房间名称"
            class="form-input"
            @keyup.enter="createGroup"
          />
        </div>

        <div class="form-section">
          <label for="roomTopic">房间描述</label>
          <textarea
            id="roomTopic"
            v-model="roomTopic"
            placeholder="描述这个房间的用途（可选）"
            class="form-textarea"
            rows="3"
          ></textarea>
        </div>

        <div class="form-section">
          <label>房间设置</label>
          <div class="checkbox-group">
            <label class="checkbox-item">
              <input type="checkbox" v-model="isPublic" />
              <span class="checkbox-label">公开房间</span>
              <span class="checkbox-desc">任何人都可以找到并加入</span>
            </label>
            
            <label class="checkbox-item">
              <input type="checkbox" v-model="enableEncryption" />
              <span class="checkbox-label">启用端到端加密</span>
              <span class="checkbox-desc">保护消息隐私（推荐）</span>
            </label>
          </div>
        </div>

        <div class="form-section" v-if="isPublic">
          <label for="roomAlias">房间地址</label>
          <div class="alias-input-group">
            <span class="alias-prefix">#</span>
            <input
              id="roomAlias"
              type="text"
              v-model="roomAlias"
              placeholder="room-name"
              class="form-input alias-input"
            />
            <span class="alias-suffix">:{{ serverName }}</span>
          </div>
          <div class="form-hint">
            房间地址用于其他人找到和加入这个房间
          </div>
        </div>

        <div class="form-section">
          <label>邀请用户</label>
          <div class="invite-section">
            <div class="invite-input-group">
              <input
                type="text"
                v-model="inviteUserId"
                placeholder="@user:matrix.org"
                class="form-input"
                @keyup.enter="addInvite"
              />
              <button 
                class="btn-secondary" 
                @click="addInvite"
                :disabled="!inviteUserId.trim()"
              >
                添加
              </button>
            </div>
            
            <div class="invited-users" v-if="invitedUsers.length > 0">
              <div
                v-for="user in invitedUsers"
                :key="user"
                class="invited-user"
              >
                <span class="user-id">{{ user }}</span>
                <button class="remove-btn" @click="removeInvite(user)">×</button>
              </div>
            </div>
          </div>
        </div>

        <div class="creation-tips">
          <h4>创建提示</h4>
          <p>• 房间创建后，你将成为房间管理员</p>
          <p>• 你可以随时修改房间设置和邀请更多用户</p>
          <p>• 公开房间会出现在房间目录中</p>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn-secondary" @click="$emit('close')">取消</button>
        <button 
          class="btn-primary" 
          @click="createGroup"
          :disabled="!roomName.trim()"
        >
          创建房间
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useMatrixStore } from '@/stores/matrix'

const emit = defineEmits(['close', 'create-group'])

const matrixStore = useMatrixStore()

// 表单数据
const roomName = ref('')
const roomTopic = ref('')
const roomAlias = ref('')
const isPublic = ref(false)
const enableEncryption = ref(true)
const inviteUserId = ref('')
const invitedUsers = ref<string[]>([])

// 计算属性
const serverName = computed(() => {
  // 从当前用户ID获取服务器名
  const currentUser = matrixStore.currentUser
  if (currentUser && currentUser.username.includes(':')) {
    return currentUser.username.split(':')[1]
  }
  return 'matrix.org'
})

// 方法
const addInvite = () => {
  const userId = inviteUserId.value.trim()
  if (!userId) return
  
  // 验证用户ID格式
  if (!userId.startsWith('@') || !userId.includes(':')) {
    alert('请输入有效的用户ID格式：@username:server.com')
    return
  }
  
  if (!invitedUsers.value.includes(userId)) {
    invitedUsers.value.push(userId)
    inviteUserId.value = ''
  }
}

const removeInvite = (userId: string) => {
  const index = invitedUsers.value.indexOf(userId)
  if (index > -1) {
    invitedUsers.value.splice(index, 1)
  }
}

const createGroup = () => {
  if (!roomName.value.trim()) return
  
  const roomData = {
    name: roomName.value.trim(),
    topic: roomTopic.value.trim(),
    visibility: isPublic.value ? 'public' : 'private',
    room_alias_name: isPublic.value && roomAlias.value ? roomAlias.value : undefined,
    initial_state: enableEncryption.value ? [
      {
        type: 'm.room.encryption',
        content: {
          algorithm: 'm.megolm.v1.aes-sha2'
        }
      }
    ] : [],
    invite: invitedUsers.value,
    preset: isPublic.value ? 'public_chat' : 'private_chat'
  }
  
  emit('create-group', roomData)
}
</script>

<style scoped>
.modal-overlay {
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

.create-group-modal {
  width: 600px;
  max-width: 90vw;
  max-height: 80vh;
  overflow-y: auto;
}

.modal {
  background: #001100;
  border: 2px solid #00ff41;
  border-radius: 4px;
  box-shadow: 0 0 20px rgba(0, 255, 65, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #00ff41;
}

.modal-header h2 {
  color: #00ff41;
  margin: 0;
  text-shadow: 0 0 5px #00ff41;
}

.close-btn {
  background: none;
  border: none;
  color: #00ff41;
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: rgba(0, 255, 65, 0.1);
  border-radius: 2px;
}

.modal-content {
  padding: 20px;
}

.form-section {
  margin-bottom: 20px;
}

.form-section label {
  display: block;
  color: #00ff41;
  font-size: 14px;
  margin-bottom: 8px;
  font-weight: bold;
}

.form-input, .form-textarea {
  width: 100%;
  padding: 12px;
  background: rgba(0, 51, 0, 0.3);
  border: 1px solid #00ff41;
  color: #00ff41;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  border-radius: 2px;
  outline: none;
  transition: all 0.3s;
  box-sizing: border-box;
}

.form-input:focus, .form-textarea:focus {
  border-color: #00ff41;
  box-shadow: 0 0 10px rgba(0, 255, 65, 0.3);
  background: rgba(0, 51, 0, 0.5);
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.checkbox-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  cursor: pointer;
}

.checkbox-item input[type="checkbox"] {
  margin-top: 2px;
}

.checkbox-label {
  color: #00ff41;
  font-size: 14px;
  font-weight: bold;
}

.checkbox-desc {
  color: #00cc33;
  font-size: 12px;
  margin-left: 8px;
}

.alias-input-group {
  display: flex;
  align-items: center;
  border: 1px solid #00ff41;
  border-radius: 2px;
  background: rgba(0, 51, 0, 0.3);
  transition: all 0.3s;
}

.alias-input-group:focus-within {
  border-color: #00ff41;
  box-shadow: 0 0 10px rgba(0, 255, 65, 0.3);
  background: rgba(0, 51, 0, 0.5);
}

.alias-prefix, .alias-suffix {
  color: #00cc33;
  padding: 12px 8px;
  font-family: 'Courier New', monospace;
  font-size: 14px;
}

.alias-input {
  border: none;
  background: transparent;
  flex: 1;
  padding: 12px 4px;
}

.alias-input:focus {
  box-shadow: none;
  background: transparent;
}

.form-hint {
  color: #00cc33;
  font-size: 12px;
  margin-top: 4px;
}

.invite-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.invite-input-group {
  display: flex;
  gap: 8px;
}

.invite-input-group .form-input {
  flex: 1;
}

.invited-users {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.invited-user {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
  background: rgba(0, 255, 65, 0.1);
  border: 1px solid rgba(0, 255, 65, 0.3);
  border-radius: 2px;
}

.user-id {
  color: #00ff41;
  font-size: 12px;
}

.remove-btn {
  background: none;
  border: none;
  color: #ff4444;
  cursor: pointer;
  font-size: 16px;
  padding: 0;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.remove-btn:hover {
  background: rgba(255, 68, 68, 0.1);
  border-radius: 2px;
}

.creation-tips {
  margin-top: 20px;
  padding: 15px;
  background: rgba(0, 51, 0, 0.2);
  border: 1px solid rgba(0, 255, 65, 0.3);
  border-radius: 2px;
}

.creation-tips h4 {
  color: #00ff41;
  margin: 0 0 10px 0;
  font-size: 14px;
}

.creation-tips p {
  color: #00cc33;
  font-size: 12px;
  line-height: 1.4;
  margin: 5px 0;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px;
  border-top: 1px solid rgba(0, 255, 65, 0.3);
}

.btn {
  padding: 8px 16px;
  border-radius: 2px;
  font-size: 12px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
  border: 1px solid #00ff41;
  font-family: 'Courier New', monospace;
  text-transform: uppercase;
}

.btn-secondary {
  background: #003300;
  color: #00ff41;
}

.btn-secondary:hover {
  background: #004400;
  box-shadow: 0 0 5px rgba(0, 255, 65, 0.3);
}

.btn-primary {
  background: #00ff41;
  color: #000000;
}

.btn-primary:hover {
  background: #00cc33;
  box-shadow: 0 0 10px rgba(0, 255, 65, 0.5);
}

.btn-primary:disabled {
  background: #006600;
  color: #003300;
  cursor: not-allowed;
  box-shadow: none;
}
</style>
