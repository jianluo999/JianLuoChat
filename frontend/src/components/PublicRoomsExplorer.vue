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
          <label>主要服务器:</label>
          <select v-model="selectedServer" @change="loadPublicRooms" class="server-select">
            <option
              v-for="server in availableServers"
              :key="server.name"
              :value="server.name"
              :title="server.description"
            >
              {{ server.label }}
            </option>
          </select>
        </div>
        <div class="load-more-controls">
          <button
            @click="loadFromMultipleServers"
            :disabled="isLoading"
            class="load-more-btn"
            title="从多个服务器加载更多房间"
          >
            🌐 加载更多服务器
          </button>
        </div>
      </div>
    </div>

    <!-- 房间统计信息 -->
    <div class="rooms-stats" v-if="!isLoading && publicRooms.length > 0">
      <div class="stat-item">
        <span class="stat-number">{{ publicRooms.length }}</span>
        <span class="stat-label">总房间数</span>
      </div>
      <div class="stat-item">
        <span class="stat-number">{{ filteredRooms.length }}</span>
        <span class="stat-label">筛选结果</span>
      </div>
      <div class="stat-item">
        <span class="stat-number">{{ selectedServer }}</span>
        <span class="stat-label">主要服务器</span>
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
    <div v-if="selectedRoom" class="modal-overlay" @click.self="closeRoomDetails">
      <div class="room-details-modal" @click.stop @keydown.esc="closeRoomDetails" tabindex="0" @keydown.enter="joinRoom(selectedRoom)" @focus="focusModal">
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
import { useMatrixV39Store } from '@/stores/matrix-v39-clean'

// 定义 emit 事件
const emit = defineEmits(['room-joined'])

const matrixStore = useMatrixV39Store()

// 响应式数据
const publicRooms = ref([])
const searchQuery = ref('')
const selectedServer = ref('matrix.org')
const isLoading = ref(false)
const isJoining = ref({})
const selectedRoom = ref(null)
const currentPage = ref(1)
const roomsPerPage = 12  // 增加每页显示数量
const nextBatch = ref(null)  // Matrix API 分页令牌
const hasMoreRooms = ref(true)  // 是否还有更多房间

// 扩展的服务器列表
const availableServers = ref([
  { name: 'matrix.org', label: 'Matrix.org (官方)', description: '官方Matrix服务器，房间最多' },
  { name: 'mozilla.org', label: 'Mozilla', description: 'Mozilla基金会的Matrix服务器' },
  { name: 'kde.org', label: 'KDE', description: 'KDE项目的Matrix服务器' },
  { name: 'gnome.org', label: 'GNOME', description: 'GNOME项目的Matrix服务器' },
  { name: 'libera.chat', label: 'Libera.Chat', description: 'IRC桥接服务器' },
  { name: 'tchncs.de', label: 'tchncs.de', description: '德国的社区服务器' },
  { name: 'envs.net', label: 'envs.net', description: '环境友好的社区服务器' },
  { name: 'nitro.chat', label: 'Nitro.chat', description: '高性能Matrix服务器' },
])

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
      limit: 100,  // 大幅增加每次请求的数量
      since: loadMore ? nextBatch.value : undefined
    }

    const response = await matrixStore.matrixClient.publicRooms(requestOptions)

    if (loadMore) {
      // 追加到现有房间列表，去重
      const existingRoomIds = new Set(publicRooms.value.map(room => room.room_id))
      const newRooms = (response.chunk || []).filter(room => !existingRoomIds.has(room.room_id))
      publicRooms.value = [...publicRooms.value, ...newRooms]
    } else {
      // 重新加载房间列表
      publicRooms.value = response.chunk || []
      currentPage.value = 1
    }

    // 更新分页信息
    nextBatch.value = response.next_batch
    hasMoreRooms.value = !!response.next_batch

    console.log(`从 ${selectedServer.value} 加载了 ${response.chunk?.length || 0} 个公共房间，总计 ${publicRooms.value.length} 个`)

    // 如果房间数量还是很少，尝试从其他服务器加载更多
    if (!loadMore && publicRooms.value.length < 50) {
      await loadFromMultipleServers()
    }
  } catch (error) {
    console.error('加载公共房间失败:', error)
    // 如果当前服务器失败，尝试从matrix.org加载
    if (selectedServer.value !== 'matrix.org') {
      console.log('尝试从matrix.org加载房间...')
      selectedServer.value = 'matrix.org'
      await loadPublicRooms(false)
    }
  } finally {
    isLoading.value = false
  }
}

// 从多个服务器加载房间
const loadFromMultipleServers = async () => {
  const serversToTry = ['matrix.org', 'mozilla.org', 'kde.org']
  const currentServer = selectedServer.value

  for (const server of serversToTry) {
    if (server === currentServer) continue

    try {
      console.log(`尝试从 ${server} 加载更多房间...`)
      const response = await matrixStore.matrixClient.publicRooms({
        server: server,
        limit: 50
      })

      if (response.chunk && response.chunk.length > 0) {
        // 合并房间，去重
        const existingRoomIds = new Set(publicRooms.value.map(room => room.room_id))
        const newRooms = response.chunk.filter(room => !existingRoomIds.has(room.room_id))
        publicRooms.value = [...publicRooms.value, ...newRooms]
        console.log(`从 ${server} 添加了 ${newRooms.length} 个新房间`)
      }
    } catch (error) {
      console.warn(`从 ${server} 加载房间失败:`, error)
    }
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
    console.log(`🚀 开始加入房间: ${room.name || room.canonical_alias} (${room.room_id})`)
    
    // 使用新的加入房间函数
    const response = await matrixStore.joinRoom(room.room_id)
    
    if (response) {
      console.log(`🎉 房间加入流程完成: ${room.name || room.canonical_alias}`)
      
      // 关闭详情模态框
      if (selectedRoom.value && selectedRoom.value.room_id === room.room_id) {
        closeRoomDetails()
      }

      // 触发房间加入事件，让父组件知道用户加入了新房间
      emit('room-joined', room.room_id)
      
      // 显示成功消息
      console.log(`✅ 房间 "${room.name || room.canonical_alias}" 已成功加入并显示在房间列表中`)
    } else {
      throw new Error('房间加入失败')
    }

  } catch (error) {
    console.error('❌ 加入房间失败:', error)
    
    // 提供更友好的错误信息
    let errorMessage = '加入房间失败'
    if (error.message) {
      if (error.message.includes('already in room') || error.message.includes('已经在房间')) {
        errorMessage = '您已经在这个房间中了'
        // 即使已经在房间中，也尝试添加到本地列表
        try {
          const newRoom = {
            id: room.room_id,
            name: room.name || room.canonical_alias || room.room_id,
            alias: room.canonical_alias,
            topic: room.topic,
            type: 'private',
            isPublic: room.world_readable || true,
            memberCount: room.num_joined_members || 0,
            members: [],
            unreadCount: 0,
            encrypted: false,
            joinRule: 'public',
            historyVisibility: 'shared',
            avatarUrl: room.avatar_url ? matrixStore.matrixClient.mxcUrlToHttp(room.avatar_url) : null,
            lastActivity: Date.now()
          }
          // Room will be automatically added to the store after joining
          
          // 关闭详情模态框
          if (selectedRoom.value && selectedRoom.value.room_id === room.room_id) {
            closeRoomDetails()
          }
          
          emit('room-joined', room.room_id)
          console.log(`✅ 房间已添加到列表中`)
          return // 成功处理，不显示错误
        } catch (addError) {
          console.warn('添加已存在房间到列表失败:', addError)
        }
      } else if (error.message.includes('not allowed')) {
        errorMessage = '没有权限加入此房间'
      } else if (error.message.includes('not found')) {
        errorMessage = '房间不存在或已被删除'
      } else {
        errorMessage = `加入房间失败: ${error.message}`
      }
    }
    
    alert(errorMessage)
  } finally {
    isJoining.value[room.room_id] = false
  }
}

const showRoomDetails = (room) => {
  selectedRoom.value = room
  // 添加键盘事件监听器
  document.addEventListener('keydown', handleKeyDown)
}

const closeRoomDetails = () => {
  selectedRoom.value = null
  // 移除键盘事件监听器
  document.removeEventListener('keydown', handleKeyDown)
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

// 处理键盘事件
const handleKeyDown = (event) => {
  if (event.key === 'Escape') {
    closeRoomDetails()
  }
}

// 模态框获取焦点时自动聚焦
const focusModal = () => {
  const modal = document.querySelector('.room-details-modal')
  if (modal) modal.focus()
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
  min-width: 200px;
}

.load-more-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.load-more-btn {
  background: linear-gradient(45deg, #64b5f6, #42a5f5);
  border: none;
  color: #000;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  font-family: inherit;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.load-more-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(100, 181, 246, 0.4);
}

.load-more-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 房间统计信息 */
.rooms-stats {
  display: flex;
  justify-content: center;
  gap: 32px;
  margin: 20px 0;
  padding: 20px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 12px;
  border: 1px solid rgba(0, 255, 136, 0.2);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-number {
  font-size: 1.5rem;
  font-weight: bold;
  color: #00ff88;
  font-family: 'Courier New', monospace;
}

.stat-label {
  font-size: 0.85rem;
  color: #64b5f6;
  text-transform: uppercase;
  letter-spacing: 0.5px;
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
