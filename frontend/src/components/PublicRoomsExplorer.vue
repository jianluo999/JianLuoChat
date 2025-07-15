<template>
  <div class="public-rooms-explorer">
    <div class="explorer-header">
      <h2>🌍 探索公共房间</h2>
      <div class="search-controls">
        <div class="search-input-group">
          <input 
            v-model="searchQuery" 
            @keyup.enter="searchRooms"
            placeholder="搜索房间名称或主题..."
            class="search-input"
          />
          <button @click="searchRooms" :disabled="isLoading" class="search-btn">
            🔍 搜索
          </button>
        </div>
        <div class="server-selector">
          <label>服务器:</label>
          <select v-model="selectedServer" @change="loadPublicRooms" class="server-select">
            <option value="matrix.org">matrix.org</option>
            <option value="mozilla.org">mozilla.org</option>
            <option value="kde.org">kde.org</option>
            <option value="gnome.org">gnome.org</option>
            <option value="fedora.im">fedora.im</option>
          </select>
        </div>
      </div>
    </div>

    <div class="loading-indicator" v-if="isLoading">
      <div class="spinner"></div>
      <p>正在加载公共房间...</p>
    </div>

    <div class="rooms-container" v-else-if="filteredRooms.length > 0">
      <div class="rooms-grid">
        <div
          v-for="room in paginatedRooms"
          :key="room.room_id"
          class="room-card"
          @click="showRoomDetails(room)"
        >
        <div class="room-avatar">
          <img 
            v-if="room.avatar_url" 
            :src="getAvatarUrl(room.avatar_url)"
            :alt="room.name || room.canonical_alias"
            @error="handleImageError"
          />
          <div v-else class="default-avatar">
            {{ getRoomInitial(room.name || room.canonical_alias) }}
          </div>
        </div>
        
        <div class="room-info">
          <h3 class="room-name">{{ room.name || room.canonical_alias || room.room_id }}</h3>
          <p class="room-topic" v-if="room.topic">{{ truncateText(room.topic, 100) }}</p>
          <div class="room-stats">
            <span class="member-count">👥 {{ room.num_joined_members || 0 }} 成员</span>
            <span class="room-alias" v-if="room.canonical_alias">{{ room.canonical_alias }}</span>
          </div>
        </div>
        
        <div class="room-actions">
          <button 
            @click.stop="joinRoom(room)"
            :disabled="isJoining[room.room_id]"
            class="join-btn"
          >
            {{ isJoining[room.room_id] ? '加入中...' : '加入房间' }}
          </button>
        </div>
      </div>
      </div>
    </div>

    <div class="empty-state" v-else-if="!isLoading">
      <div class="empty-icon">🏠</div>
      <h3>没有找到公共房间</h3>
      <p>尝试搜索其他关键词或选择不同的服务器</p>
    </div>

    <!-- 分页控制 -->
    <div class="pagination-controls">
      <!-- 本地分页 -->
      <div class="local-pagination" v-if="totalPages > 1">
        <button
          @click="currentPage--"
          :disabled="currentPage === 1"
          class="page-btn"
        >
          ← 上一页
        </button>
        <span class="page-info">第 {{ currentPage }} 页，共 {{ totalPages }} 页</span>
        <button
          @click="currentPage++"
          :disabled="currentPage === totalPages"
          class="page-btn"
        >
          下一页 →
        </button>
      </div>

      <!-- 加载更多按钮 -->
      <div class="load-more-section" v-if="hasMoreRooms && !isLoading">
        <button
          @click="loadPublicRooms(true)"
          class="load-more-btn"
        >
          📥 加载更多房间
        </button>
        <p class="load-more-hint">已显示 {{ publicRooms.length }} 个房间</p>
      </div>

      <!-- 没有更多房间提示 -->
      <div class="no-more-rooms" v-if="!hasMoreRooms && publicRooms.length > 0">
        <p>✅ 已显示所有 {{ publicRooms.length }} 个房间</p>
      </div>
    </div>

    <!-- 房间详情模态框 -->
    <div v-if="selectedRoom" class="modal-overlay" @click="closeRoomDetails">
      <div class="room-details-modal" @click.stop>
        <div class="modal-header">
          <h3>{{ selectedRoom.name || selectedRoom.canonical_alias }}</h3>
          <button @click="closeRoomDetails" class="close-btn">×</button>
        </div>
        <div class="modal-content">
          <div class="room-avatar-large">
            <img 
              v-if="selectedRoom.avatar_url" 
              :src="getAvatarUrl(selectedRoom.avatar_url)"
              :alt="selectedRoom.name"
            />
            <div v-else class="default-avatar-large">
              {{ getRoomInitial(selectedRoom.name || selectedRoom.canonical_alias) }}
            </div>
          </div>
          <div class="room-details">
            <p><strong>房间ID:</strong> {{ selectedRoom.room_id }}</p>
            <p v-if="selectedRoom.canonical_alias"><strong>别名:</strong> {{ selectedRoom.canonical_alias }}</p>
            <p><strong>成员数:</strong> {{ selectedRoom.num_joined_members || 0 }}</p>
            <p v-if="selectedRoom.topic"><strong>主题:</strong> {{ selectedRoom.topic }}</p>
            <p><strong>是否公开:</strong> {{ selectedRoom.world_readable ? '是' : '否' }}</p>
            <p><strong>允许访客:</strong> {{ selectedRoom.guest_can_join ? '是' : '否' }}</p>
          </div>
          <div class="modal-actions">
            <button 
              @click="joinRoom(selectedRoom)"
              :disabled="isJoining[selectedRoom.room_id]"
              class="join-btn primary"
            >
              {{ isJoining[selectedRoom.room_id] ? '加入中...' : '加入房间' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useMatrixStore } from '@/stores/matrix'

// 定义 emit 事件
const emit = defineEmits(['room-joined'])

const matrixStore = useMatrixStore()

// 响应式数据
const publicRooms = ref([])
const searchQuery = ref('')
const selectedServer = ref('matrix.org')
const isLoading = ref(false)
const isJoining = ref({})
const selectedRoom = ref(null)
const currentPage = ref(1)
const roomsPerPage = 6  // 减少每页显示数量，让分页更容易触发
const nextBatch = ref(null)  // Matrix API 分页令牌
const hasMoreRooms = ref(true)  // 是否还有更多房间

// 计算属性
const filteredRooms = computed(() => {
  if (!searchQuery.value) return publicRooms.value
  
  const query = searchQuery.value.toLowerCase()
  return publicRooms.value.filter(room => 
    (room.name && room.name.toLowerCase().includes(query)) ||
    (room.topic && room.topic.toLowerCase().includes(query)) ||
    (room.canonical_alias && room.canonical_alias.toLowerCase().includes(query))
  )
})

const totalPages = computed(() => Math.ceil(filteredRooms.value.length / roomsPerPage))

const paginatedRooms = computed(() => {
  const start = (currentPage.value - 1) * roomsPerPage
  const end = start + roomsPerPage
  return filteredRooms.value.slice(start, end)
})

// 监听搜索查询变化，重置分页
watch(searchQuery, () => {
  currentPage.value = 1
})

// 方法
const loadPublicRooms = async (loadMore = false) => {
  if (!matrixStore.matrixClient) {
    console.error('请先登录 Matrix 账户')
    return
  }

  isLoading.value = true
  try {
    const requestOptions = {
      server: selectedServer.value,
      limit: 50,  // 增加每次请求的数量
      since: loadMore ? nextBatch.value : undefined
    }

    const response = await matrixStore.matrixClient.publicRooms(requestOptions)

    if (loadMore) {
      // 追加到现有房间列表
      publicRooms.value = [...publicRooms.value, ...(response.chunk || [])]
    } else {
      // 重新加载房间列表
      publicRooms.value = response.chunk || []
      currentPage.value = 1
    }

    // 更新分页信息
    nextBatch.value = response.next_batch
    hasMoreRooms.value = !!response.next_batch

    console.log(`从 ${selectedServer.value} 加载了 ${response.chunk?.length || 0} 个公共房间，总计 ${publicRooms.value.length} 个`)
  } catch (error) {
    console.error('加载公共房间失败:', error)
  } finally {
    isLoading.value = false
  }
}

const searchRooms = async () => {
  if (!searchQuery.value.trim()) {
    await loadPublicRooms()
    return
  }

  if (!matrixStore.matrixClient) {
    console.error('请先登录 Matrix 账户')
    return
  }

  isLoading.value = true
  try {
    const response = await matrixStore.matrixClient.publicRooms({
      server: selectedServer.value,
      filter: {
        generic_search_term: searchQuery.value
      },
      limit: 50
    })

    publicRooms.value = response.chunk || []
    currentPage.value = 1

    // 重置分页状态
    nextBatch.value = response.next_batch
    hasMoreRooms.value = !!response.next_batch

    console.log(`搜索到 ${publicRooms.value.length} 个相关房间`)
  } catch (error) {
    console.error('搜索房间失败:', error)
  } finally {
    isLoading.value = false
  }
}

const joinRoom = async (room) => {
  if (!matrixStore.matrixClient) {
    console.error('请先登录 Matrix 账户')
    return
  }

  isJoining.value[room.room_id] = true
  try {
    await matrixStore.matrixClient.joinRoom(room.room_id)
    console.log(`成功加入房间: ${room.name || room.canonical_alias}`)

    // 将加入的房间添加到本地房间列表
    const newRoom = {
      id: room.room_id,
      name: room.name || room.canonical_alias || room.room_id,
      alias: room.canonical_alias,
      topic: room.topic,
      type: 'room',
      isPublic: room.world_readable || true,
      memberCount: room.num_joined_members || 0,
      members: [],
      unreadCount: 0,
      encrypted: false,
      joinRule: 'public',
      historyVisibility: 'shared',
      avatarUrl: room.avatar_url ? matrixStore.matrixClient.mxcUrlToHttp(room.avatar_url) : null
    }

    // 添加到 Matrix store 的房间列表
    matrixStore.addRoom(newRoom)

    // 显示成功消息
    console.log(`✅ 房间 "${newRoom.name}" 已添加到房间列表`)

    // 关闭详情模态框
    if (selectedRoom.value && selectedRoom.value.room_id === room.room_id) {
      closeRoomDetails()
    }

    // 触发房间加入事件，让父组件知道用户加入了新房间
    emit('room-joined', newRoom.id)

  } catch (error) {
    console.error('加入房间失败:', error)
    // 显示错误消息给用户
    alert(`加入房间失败: ${error.message || '未知错误'}`)
  } finally {
    isJoining.value[room.room_id] = false
  }
}

const showRoomDetails = (room) => {
  selectedRoom.value = room
}

const closeRoomDetails = () => {
  selectedRoom.value = null
}

const getAvatarUrl = (mxcUrl) => {
  if (!matrixStore.matrixClient || !mxcUrl) return ''
  return matrixStore.matrixClient.mxcUrlToHttp(mxcUrl, 64, 64, 'crop')
}

const getRoomInitial = (name) => {
  if (!name) return '?'
  return name.charAt(0).toUpperCase()
}

const truncateText = (text, maxLength) => {
  if (!text || text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

const handleImageError = (event) => {
  event.target.style.display = 'none'
}

// 生命周期
onMounted(() => {
  if (matrixStore.matrixClient) {
    loadPublicRooms()
  }
})

// 暴露方法给父组件
defineExpose({
  loadPublicRooms,
  searchRooms
})
</script>

<style scoped>
.public-rooms-explorer {
  padding: 20px;
  background: #0f0f23;
  color: #00ff88;
  min-height: 100vh;
  font-family: 'Courier New', monospace;
}

.explorer-header {
  margin-bottom: 30px;
}

.explorer-header h2 {
  text-align: center;
  margin-bottom: 20px;
  color: #00ff88;
  text-shadow: 0 0 10px rgba(0, 255, 136, 0.5);
}

.search-controls {
  display: flex;
  gap: 20px;
  align-items: center;
  flex-wrap: wrap;
  justify-content: center;
}

.search-input-group {
  display: flex;
  gap: 10px;
}

.search-input {
  background: rgba(0, 255, 136, 0.1);
  border: 1px solid #00ff88;
  color: #00ff88;
  padding: 10px 15px;
  border-radius: 6px;
  font-family: inherit;
  width: 300px;
}

.search-input::placeholder {
  color: rgba(0, 255, 136, 0.6);
}

.search-btn, .join-btn {
  background: linear-gradient(45deg, #00ff88, #00cc6a);
  border: none;
  color: #000;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  font-family: inherit;
  transition: all 0.3s ease;
}

.search-btn:hover:not(:disabled), .join-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 255, 136, 0.4);
}

.search-btn:disabled, .join-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.server-selector {
  display: flex;
  align-items: center;
  gap: 10px;
}

.server-select {
  background: rgba(0, 255, 136, 0.1);
  border: 1px solid #00ff88;
  color: #00ff88;
  padding: 8px 12px;
  border-radius: 6px;
  font-family: inherit;
}

.loading-indicator {
  text-align: center;
  padding: 50px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(0, 255, 136, 0.3);
  border-top: 4px solid #00ff88;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.rooms-container {
  max-height: 600px;
  overflow-y: auto;
  padding-right: 10px;
  margin-bottom: 20px;
}

.rooms-container::-webkit-scrollbar {
  width: 8px;
}

.rooms-container::-webkit-scrollbar-track {
  background: rgba(0, 255, 136, 0.1);
  border-radius: 4px;
}

.rooms-container::-webkit-scrollbar-thumb {
  background: rgba(0, 255, 136, 0.3);
  border-radius: 4px;
}

.rooms-container::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 255, 136, 0.5);
}

.rooms-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
  padding-bottom: 20px;
}

.room-card {
  background: rgba(0, 255, 136, 0.1);
  border: 1px solid #00ff88;
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.room-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 255, 136, 0.3);
  border-color: #00cc6a;
}

.room-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  overflow: hidden;
  margin: 0 auto;
}

.room-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.default-avatar {
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, #00ff88, #00cc6a);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: bold;
  color: #000;
}

.room-info {
  text-align: center;
  flex: 1;
}

.room-name {
  margin: 0 0 10px 0;
  color: #00ff88;
  font-size: 18px;
}

.room-topic {
  margin: 0 0 15px 0;
  color: rgba(0, 255, 136, 0.8);
  font-size: 14px;
  line-height: 1.4;
}

.room-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: rgba(0, 255, 136, 0.7);
}

.room-actions {
  text-align: center;
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
  color: rgba(0, 255, 136, 0.7);
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 20px;
}

.pagination-controls {
  margin-top: 30px;
}

.local-pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
}

.load-more-section {
  text-align: center;
  margin: 20px 0;
}

.load-more-btn {
  background: linear-gradient(45deg, #00ff88, #00cc6a);
  border: none;
  color: #000;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-family: inherit;
  font-weight: bold;
  font-size: 16px;
  transition: all 0.3s ease;
  margin-bottom: 10px;
}

.load-more-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 255, 136, 0.4);
}

.load-more-hint {
  color: rgba(0, 255, 136, 0.7);
  font-size: 14px;
  margin: 0;
}

.no-more-rooms {
  text-align: center;
  color: rgba(0, 255, 136, 0.8);
  margin: 20px 0;
}

.page-btn {
  background: rgba(0, 255, 136, 0.2);
  border: 1px solid #00ff88;
  color: #00ff88;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.3s ease;
}

.page-btn:hover:not(:disabled) {
  background: rgba(0, 255, 136, 0.3);
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  color: rgba(0, 255, 136, 0.8);
}

/* 模态框样式 */
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

.room-details-modal {
  background: #0f0f23;
  border: 2px solid #00ff88;
  border-radius: 12px;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #00ff88;
}

.modal-header h3 {
  margin: 0;
  color: #00ff88;
}

.close-btn {
  background: none;
  border: none;
  color: #00ff88;
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  padding: 20px;
}

.room-avatar-large {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
  margin: 0 auto 20px;
}

.room-avatar-large img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.default-avatar-large {
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, #00ff88, #00cc6a);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
  font-weight: bold;
  color: #000;
}

.room-details p {
  margin: 10px 0;
  color: rgba(0, 255, 136, 0.9);
}

.modal-actions {
  text-align: center;
  margin-top: 20px;
}

.join-btn.primary {
  background: linear-gradient(45deg, #ff6b6b, #ee5a52);
  color: white;
  padding: 12px 30px;
  font-size: 16px;
}
</style>
