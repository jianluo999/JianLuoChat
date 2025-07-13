<template>
  <div class="rooms-view">
    <div class="rooms-header">
      <h2>房间管理</h2>
      <el-button type="primary" @click="showCreateDialog = true">
        <el-icon><Plus /></el-icon>
        创建房间
      </el-button>
    </div>

    <div class="rooms-content">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="我的房间" name="my-rooms">
          <div class="room-grid">
            <div
              v-for="room in chatStore.rooms"
              :key="room.id"
              class="room-card"
              @click="enterRoom(room.id)"
            >
              <div class="room-avatar">
                <el-avatar :size="48" :src="room.avatarUrl">
                  {{ room.name[0] }}
                </el-avatar>
              </div>
              <div class="room-info">
                <h3>{{ room.name }}</h3>
                <p class="room-meta">
                  {{ room.members.length }} 成员 · 
                  {{ room.type === 'group' ? '群聊' : '私聊' }}
                </p>
                <p class="last-message">
                  {{ room.lastMessage?.content || '暂无消息' }}
                </p>
              </div>
              <div class="room-actions">
                <el-badge :value="room.unreadCount" :hidden="room.unreadCount === 0" />
              </div>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="公开房间" name="public-rooms">
          <div class="search-bar">
            <el-input
              v-model="searchQuery"
              placeholder="搜索公开房间..."
              :prefix-icon="Search"
              @input="searchPublicRooms"
            />
          </div>
          
          <div class="room-grid">
            <div
              v-for="room in publicRooms"
              :key="room.id"
              class="room-card public-room"
            >
              <div class="room-avatar">
                <el-avatar :size="48" :src="room.avatarUrl">
                  {{ room.name[0] }}
                </el-avatar>
              </div>
              <div class="room-info">
                <h3>{{ room.name }}</h3>
                <p class="room-meta">
                  {{ room.memberCount }} 成员 · 公开房间
                </p>
                <p class="room-description">
                  {{ room.description || '暂无描述' }}
                </p>
              </div>
              <div class="room-actions">
                <el-button
                  type="primary"
                  size="small"
                  @click="joinPublicRoom(room.id)"
                >
                  加入
                </el-button>
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <CreateRoomDialog
      v-model="showCreateDialog"
      @created="handleRoomCreated"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Plus, Search } from '@element-plus/icons-vue'
import { useChatStore } from '@/stores/chat'
import CreateRoomDialog from '@/components/CreateRoomDialog.vue'

const router = useRouter()
const chatStore = useChatStore()

const activeTab = ref('my-rooms')
const showCreateDialog = ref(false)
const searchQuery = ref('')
const publicRooms = ref<any[]>([])
const searchLoading = ref(false)

const enterRoom = (roomId: string) => {
  chatStore.setCurrentRoom(roomId)
  router.push('/chat')
}

const handleRoomCreated = (room: any) => {
  ElMessage.success('房间创建成功')
  enterRoom(room.id)
}

const searchPublicRooms = async () => {
  if (!searchQuery.value.trim()) {
    publicRooms.value = []
    return
  }

  searchLoading.value = true
  try {
    // 这里应该调用搜索公开房间的API
    // const response = await roomAPI.searchPublicRooms(searchQuery.value)
    // publicRooms.value = response.data
    
    // 模拟数据
    publicRooms.value = [
      {
        id: 'public-1',
        name: '技术交流',
        description: '讨论各种技术话题',
        memberCount: 156,
        avatarUrl: ''
      },
      {
        id: 'public-2',
        name: '随便聊聊',
        description: '轻松愉快的聊天环境',
        memberCount: 89,
        avatarUrl: ''
      }
    ]
  } catch (error) {
    ElMessage.error('搜索房间失败')
  } finally {
    searchLoading.value = false
  }
}

const joinPublicRoom = async (roomId: string) => {
  try {
    await chatStore.joinRoom(roomId)
    ElMessage.success('加入房间成功')
    await chatStore.fetchRooms()
  } catch (error) {
    ElMessage.error('加入房间失败')
  }
}

onMounted(() => {
  chatStore.fetchRooms()
})
</script>

<style scoped>
.rooms-view {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.rooms-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.rooms-header h2 {
  margin: 0;
  color: #303133;
}

.rooms-content {
  background: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.search-bar {
  margin-bottom: 24px;
}

.room-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.room-card {
  display: flex;
  align-items: center;
  padding: 16px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.room-card:hover {
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);
}

.room-card.public-room {
  cursor: default;
}

.room-avatar {
  margin-right: 16px;
}

.room-info {
  flex: 1;
  min-width: 0;
}

.room-info h3 {
  margin: 0 0 4px 0;
  color: #303133;
  font-size: 16px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.room-meta {
  margin: 0 0 4px 0;
  color: #909399;
  font-size: 12px;
}

.last-message,
.room-description {
  margin: 0;
  color: #606266;
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.room-actions {
  margin-left: 16px;
}
</style>
