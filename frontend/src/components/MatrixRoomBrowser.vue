<template>
  <div class="room-browser-overlay">
    <div class="room-browser-modal">
      <div class="browser-header">
        <h3>浏览Matrix房间</h3>
        <button @click="$emit('close')" class="close-button">×</button>
      </div>
      
      <div class="browser-content">
        <!-- 搜索栏 -->
        <div class="search-section">
          <div class="search-input-group">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="搜索房间名称或别名..."
              class="search-input"
              @input="searchRooms"
            />
            <button @click="searchRooms" class="search-button">
              <svg viewBox="0 0 24 24">
                <path d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- 房间分类 -->
        <div class="room-categories">
          <button
            v-for="category in categories"
            :key="category.id"
            @click="selectedCategory = category.id"
            :class="['category-btn', { active: selectedCategory === category.id }]"
          >
            <span class="category-icon">{{ category.icon }}</span>
            <span class="category-name">{{ category.name }}</span>
          </button>
        </div>

        <!-- 房间列表 -->
        <div class="rooms-list">
          <div v-if="loading" class="loading-state">
            <div class="loading-spinner"></div>
            <p>正在加载房间...</p>
          </div>
          
          <div v-else-if="filteredRooms.length === 0" class="empty-state">
            <div class="empty-icon">🏠</div>
            <p>没有找到房间</p>
            <button @click="refreshRooms" class="refresh-button">刷新</button>
          </div>
          
          <div v-else class="room-grid">
            <div
              v-for="room in filteredRooms"
              :key="room.id"
              class="room-card"
              @click="selectRoom(room)"
            >
              <div class="room-avatar">
                <img v-if="room.avatarUrl" :src="room.avatarUrl" :alt="room.name" />
                <div v-else class="default-avatar">{{ room.name.charAt(0).toUpperCase() }}</div>
              </div>
              
              <div class="room-info">
                <div class="room-name">{{ room.name }}</div>
                <div class="room-alias" v-if="room.alias">{{ room.alias }}</div>
                <div class="room-topic" v-if="room.topic">{{ room.topic }}</div>
                
                <div class="room-stats">
                  <span class="member-count">
                    <svg viewBox="0 0 24 24">
                      <path d="M16,4C18.21,4 20,5.79 20,8C20,10.21 18.21,12 16,12C13.79,12 12,10.21 12,8C12,5.79 13.79,4 16,4M16,14C18.67,14 24,15.33 24,18V20H8V18C8,15.33 13.33,14 16,14M8.5,6A2.5,2.5 0 0,1 11,8.5A2.5,2.5 0 0,1 8.5,11A2.5,2.5 0 0,1 6,8.5A2.5,2.5 0 0,1 8.5,6M8.5,13C10.67,13 15,14.17 15,16.5V18H2V16.5C2,14.17 6.33,13 8.5,13Z"/>
                    </svg>
                    {{ room.memberCount || 0 }}
                  </span>
                  
                  <span class="room-type" :class="room.type">
                    {{ room.isPublic ? '公开' : '私密' }}
                  </span>
                  
                  <span v-if="room.encrypted" class="encryption-badge">
                    🔐 加密
                  </span>
                </div>
              </div>
              
              <div class="room-actions">
                <button
                  v-if="!room.joined"
                  @click.stop="joinRoom(room)"
                  class="join-button"
                  :disabled="joiningRooms.has(room.id)"
                >
                  {{ joiningRooms.has(room.id) ? '加入中...' : '加入' }}
                </button>
                
                <button
                  v-else
                  @click.stop="openRoom(room)"
                  class="open-button"
                >
                  打开
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="browser-footer">
        <div class="footer-info">
          <span>找到 {{ filteredRooms.length }} 个房间</span>
        </div>
        <div class="footer-actions">
          <button @click="refreshRooms" class="refresh-button">刷新</button>
          <button @click="$emit('close')" class="close-button">关闭</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useMatrixStore } from '@/stores/matrix'
import { matrixAPI } from '@/services/api'

const emit = defineEmits(['close', 'room-selected'])

const matrixStore = useMatrixStore()

// 状态
const loading = ref(false)
const searchQuery = ref('')
const selectedCategory = ref('all')
const joiningRooms = ref(new Set<string>())

// 房间数据
const rooms = ref<any[]>([])

// 房间分类
const categories = ref([
  { id: 'all', name: '全部', icon: '🏠' },
  { id: 'public', name: '公开', icon: '🌐' },
  { id: 'world', name: '世界', icon: '🌍' },
  { id: 'tech', name: '技术', icon: '💻' },
  { id: 'social', name: '社交', icon: '👥' }
])

// 计算属性
const filteredRooms = computed(() => {
  let filtered = rooms.value

  // 按分类过滤
  if (selectedCategory.value !== 'all') {
    filtered = filtered.filter(room => {
      switch (selectedCategory.value) {
        case 'public':
          return room.isPublic
        case 'world':
          return room.name.toLowerCase().includes('world') || room.alias?.includes('world')
        case 'tech':
          return room.name.toLowerCase().includes('tech') || 
                 room.name.toLowerCase().includes('dev') ||
                 room.topic?.toLowerCase().includes('programming')
        case 'social':
          return room.name.toLowerCase().includes('chat') || 
                 room.name.toLowerCase().includes('social')
        default:
          return true
      }
    })
  }

  // 按搜索查询过滤
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(room =>
      room.name.toLowerCase().includes(query) ||
      room.alias?.toLowerCase().includes(query) ||
      room.topic?.toLowerCase().includes(query)
    )
  }

  return filtered
})

// 方法
const searchRooms = async () => {
  // 实现房间搜索逻辑
  await loadRooms()
}

const loadRooms = async () => {
  if (!matrixStore.matrixClient) {
    console.error('请先登录 Matrix 账户')
    return
  }

  loading.value = true

  try {
    // 从Matrix服务器获取真实的公共房间数据
    const response = await matrixStore.matrixClient.publicRooms({
      server: 'matrix.org',
      limit: 50
    })

    if (response.chunk && response.chunk.length > 0) {
      rooms.value = response.chunk.map(room => ({
        id: room.room_id,
        name: room.name || room.canonical_alias || room.room_id,
        alias: room.canonical_alias,
        topic: room.topic,
        isPublic: room.world_readable,
        memberCount: room.num_joined_members || 0,
        type: getRoomType(room),
        encrypted: false, // 公共房间通常不加密
        joined: false,
        avatarUrl: room.avatar_url ? matrixStore.matrixClient.mxcUrlToHttp(room.avatar_url, 64, 64, 'crop') : null
      }))

      console.log(`从Matrix服务器加载了 ${rooms.value.length} 个公共房间`)
    } else {
      console.warn('没有找到公共房间')
      rooms.value = []
    }
  } catch (error) {
    console.error('Failed to load rooms:', error)
    // 如果API失败，显示一些默认房间
    rooms.value = [
      {
        id: '#matrix:matrix.org',
        name: 'Matrix HQ',
        alias: '#matrix:matrix.org',
        topic: 'Matrix protocol discussion',
        isPublic: true,
        memberCount: 15420,
        type: 'tech',
        encrypted: false,
        joined: false
      }
    ]
  } finally {
    loading.value = false
  }
}

// 根据房间信息判断房间类型
const getRoomType = (room) => {
  if (room.name && room.name.toLowerCase().includes('world')) return 'world'
  if (room.name && (room.name.toLowerCase().includes('tech') || room.name.toLowerCase().includes('dev'))) return 'tech'
  if (room.name && room.name.toLowerCase().includes('social')) return 'social'
  return 'general'
}

const joinRoom = async (room: any) => {
  if (!matrixStore.matrixClient) {
    console.error('请先登录 Matrix 账户')
    return
  }

  joiningRooms.value.add(room.id)

  try {
    console.log(`尝试加入房间: ${room.name} (${room.id})`)

    // 使用Matrix客户端加入房间
    await matrixStore.matrixClient.joinRoom(room.id)
    room.joined = true

    // 创建房间对象添加到store
    const newRoom = {
      id: room.id,
      name: room.name,
      type: 'room',
      isPublic: room.isPublic,
      memberCount: room.memberCount,
      topic: room.topic,
      encrypted: room.encrypted,
      avatarUrl: room.avatarUrl,
      unreadCount: 0,
      mentionCount: 0,
      lastMessage: null,
      lastActivity: new Date().toISOString()
    }

    // 添加到Matrix store
    matrixStore.addRoom(newRoom)

    console.log(`✅ 成功加入房间: ${room.name}`)

    // 通知父组件
    emit('room-selected', room.id)
  } catch (error) {
    console.error('Failed to join room:', error)
    alert(`加入房间失败: ${error.message || '未知错误'}`)
  } finally {
    joiningRooms.value.delete(room.id)
  }
}

const openRoom = (room: any) => {
  emit('room-selected', room.id)
  emit('close')
}

const selectRoom = (room: any) => {
  if (room.joined) {
    openRoom(room)
  }
}

const refreshRooms = () => {
  loadRooms()
}

// 生命周期
onMounted(() => {
  loadRooms()
})
</script>

<style scoped>
.room-browser-overlay {
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

.room-browser-modal {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border: 1px solid #3a4a5c;
  border-radius: 16px;
  width: 90%;
  max-width: 800px;
  height: 80%;
  display: flex;
  flex-direction: column;
  color: #e0e6ed;
}

.browser-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #3a4a5c;
}

.browser-header h3 {
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

.browser-content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

.search-section {
  margin-bottom: 24px;
}

.search-input-group {
  display: flex;
  gap: 8px;
}

.search-input {
  flex: 1;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: #e0e6ed;
  font-size: 1rem;
}

.search-input:focus {
  outline: none;
  border-color: #64b5f6;
}

.search-button {
  padding: 12px;
  background: #64b5f6;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.search-button:hover {
  background: #42a5f5;
}

.search-button svg {
  width: 20px;
  height: 20px;
  fill: #1a1a2e;
}

.room-categories {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.category-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  color: #e0e6ed;
  cursor: pointer;
  transition: all 0.3s ease;
}

.category-btn:hover,
.category-btn.active {
  background: rgba(100, 181, 246, 0.2);
  border-color: #64b5f6;
}

.category-icon {
  font-size: 1rem;
}

.category-name {
  font-size: 0.9rem;
}

.rooms-list {
  min-height: 300px;
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  text-align: center;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(100, 181, 246, 0.3);
  border-top: 3px solid #64b5f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 16px;
}

.room-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.room-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.room-card:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: #64b5f6;
  transform: translateY(-2px);
}

.room-avatar {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  margin-bottom: 12px;
  overflow: hidden;
}

.room-avatar img {
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
  font-size: 1.5rem;
  font-weight: bold;
  color: #1a1a2e;
}

.room-info {
  margin-bottom: 12px;
}

.room-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: #e0e6ed;
  margin-bottom: 4px;
}

.room-alias {
  font-size: 0.9rem;
  color: #64b5f6;
  margin-bottom: 8px;
}

.room-topic {
  font-size: 0.85rem;
  color: #b0bec5;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.room-stats {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.8rem;
}

.member-count {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #b0bec5;
}

.member-count svg {
  width: 14px;
  height: 14px;
  fill: currentColor;
}

.room-type {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  background: rgba(129, 199, 132, 0.2);
  color: #81c784;
}

.encryption-badge {
  font-size: 0.75rem;
  color: #ffa726;
}

.room-actions {
  display: flex;
  gap: 8px;
}

.join-button,
.open-button {
  flex: 1;
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.join-button {
  background: #64b5f6;
  color: #1a1a2e;
}

.join-button:hover {
  background: #42a5f5;
}

.join-button:disabled {
  background: #555;
  color: #999;
  cursor: not-allowed;
}

.open-button {
  background: rgba(129, 199, 132, 0.2);
  color: #81c784;
  border: 1px solid rgba(129, 199, 132, 0.3);
}

.open-button:hover {
  background: rgba(129, 199, 132, 0.3);
}

.browser-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-top: 1px solid #3a4a5c;
}

.footer-info {
  color: #b0bec5;
  font-size: 0.9rem;
}

.footer-actions {
  display: flex;
  gap: 12px;
}

.refresh-button {
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  color: #e0e6ed;
  cursor: pointer;
  transition: all 0.3s ease;
}

.refresh-button:hover {
  background: rgba(255, 255, 255, 0.2);
}
</style>
