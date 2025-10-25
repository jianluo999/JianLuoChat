<template>
  <div class="matrix-room-manager">
    <div class="room-manager-header">
      <h3>房间管理</h3>
      <button @click="showCreateRoom = true" class="btn-create-room">
        <i class="fas fa-plus"></i> 创建房间
      </button>
    </div>

    <div class="room-list">
      <div v-if="loading" class="loading">加载中...</div>
      
      <div v-else-if="rooms.length === 0" class="no-rooms">
        <p>暂无房间</p>
        <button @click="showCreateRoom = true" class="btn-create-room">
          创建第一个房间
        </button>
      </div>

      <div v-else class="rooms-grid">
        <div 
          v-for="room in rooms" 
          :key="room.id" 
          class="room-card"
          :class="{ 'private': room.isPrivate, 'public': room.isPublic }"
        >
          <div class="room-header">
            <i :class="getRoomIcon(room)"></i>
            <span class="room-name">{{ room.name }}</span>
            <span class="room-type" :class="room.isPrivate ? 'private' : 'public'">
              {{ room.isPrivate ? '私密' : '公开' }}
            </span>
          </div>
          
          <div class="room-info">
            <p class="room-topic">{{ room.topic || '暂无描述' }}</p>
            <p class="room-members">成员: {{ room.memberCount }}</p>
          </div>
          
          <div class="room-actions">
            <button @click="joinRoom(room)" class="btn-join">
              <i class="fas fa-sign-in-alt"></i> 加入
            </button>
            <button @click="openRoomSettings(room)" class="btn-settings">
              <i class="fas fa-cog"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 创建房间对话框 -->
    <div v-if="showCreateRoom" class="modal-overlay" @click="showCreateRoom = false">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h4>创建房间</h4>
          <button @click="showCreateRoom = false" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="modal-body">
          <div class="form-group">
            <label for="roomName">房间名称</label>
            <input 
              id="roomName" 
              v-model="newRoom.name" 
              type="text" 
              placeholder="输入房间名称"
              required
            />
          </div>
          
          <div class="form-group">
            <label for="roomType">房间类型</label>
            <select id="roomType" v-model="newRoom.type">
              <option value="public">公开房间</option>
              <option value="private">私密房间</option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="roomAlias">房间别名</label>
            <input 
              id="roomAlias" 
              v-model="newRoom.alias" 
              type="text" 
              placeholder="可选：房间别名"
            />
          </div>
          
          <div class="form-group">
            <label for="roomTopic">房间描述</label>
            <textarea 
              id="roomTopic" 
              v-model="newRoom.topic" 
              placeholder="可选：房间描述"
              rows="3"
            ></textarea>
          </div>
        </div>
        
        <div class="modal-footer">
          <button @click="showCreateRoom = false" class="btn-cancel">取消</button>
          <button @click="createRoom" class="btn-confirm">创建</button>
        </div>
      </div>
    </div>

    <!-- 房间设置对话框 -->
    <div v-if="showRoomSettings" class="modal-overlay" @click="showRoomSettings = false">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h4>{{ currentRoom.name }} 设置</h4>
          <button @click="showRoomSettings = false" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="modal-body">
          <div class="form-group">
            <label for="roomName">房间名称</label>
            <input 
              id="roomName" 
              v-model="currentRoom.name" 
              type="text" 
              required
            />
          </div>
          
          <div class="form-group">
            <label for="roomTopic">房间描述</label>
            <textarea 
              id="roomTopic" 
              v-model="currentRoom.topic" 
              rows="3"
            ></textarea>
          </div>
          
          <div class="form-group">
            <label class="switch">
              <input type="checkbox" v-model="currentRoom.isPublic" />
              <span class="slider"></span>
              公开房间
            </label>
          </div>
        </div>
        
        <div class="modal-footer">
          <button @click="showRoomSettings = false" class="btn-cancel">取消</button>
          <button @click="saveRoomSettings" class="btn-confirm">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useMatrixStore } from '@/stores/matrix';

export default {
  name: 'MatrixRoomManager',
  setup() {
    const matrixStore = useMatrixStore();
    
    // 数据
    const rooms = ref([]);
    const loading = ref(false);
    const showCreateRoom = ref(false);
    const showRoomSettings = ref(false);
    const currentRoom = ref({});
    
    const newRoom = ref({
      name: '',
      type: 'public',
      alias: '',
      topic: ''
    });

    // 方法
    const loadRooms = async () => {
      loading.value = true;
      try {
        const response = await matrixStore.getMatrixRooms();
        if (response.success) {
          rooms.value = response.rooms || [];
        }
      } catch (error) {
        console.error('加载房间失败:', error);
      } finally {
        loading.value = false;
      }
    };

    const createRoom = async () => {
      if (!newRoom.value.name.trim()) {
        alert('请输入房间名称');
        return;
      }
      
      try {
        const roomData = {
          name: newRoom.value.name,
          type: newRoom.value.type,
          alias: newRoom.value.alias,
          topic: newRoom.value.topic
        };
        
        const response = await matrixStore.createMatrixRoom(roomData);
        if (response.success) {
          alert('房间创建成功');
          showCreateRoom.value = false;
          newRoom.value = { name: '', type: 'public', alias: '', topic: '' };
          await loadRooms();
        } else {
          alert('房间创建失败: ' + (response.error || '未知错误'));
        }
      } catch (error) {
        console.error('创建房间失败:', error);
        alert('创建房间失败');
      }
    };

    const joinRoom = async (room) => {
      try {
        const response = await matrixStore.joinMatrixRoom(room.id);
        if (response.success) {
          alert('加入房间成功');
          await loadRooms();
        } else {
          alert('加入房间失败: ' + (response.error || '未知错误'));
        }
      } catch (error) {
        console.error('加入房间失败:', error);
        alert('加入房间失败');
      }
    };

    const openRoomSettings = (room) => {
      currentRoom.value = { ...room };
      showRoomSettings.value = true;
    };

    const saveRoomSettings = async () => {
      try {
        const response = await matrixStore.updateMatrixRoom(currentRoom.value.id, {
          name: currentRoom.value.name,
          topic: currentRoom.value.topic,
          isPublic: currentRoom.value.isPublic
        });
        
        if (response.success) {
          alert('房间设置保存成功');
          showRoomSettings.value = false;
          await loadRooms();
        } else {
          alert('保存失败: ' + (response.error || '未知错误'));
        }
      } catch (error) {
        console.error('保存房间设置失败:', error);
        alert('保存失败');
      }
    };

    const getRoomIcon = (room) => {
      if (room.isPrivate) {
        return 'fas fa-lock';
      } else if (room.memberCount > 10) {
        return 'fas fa-users';
      } else {
        return 'fas fa-user-friends';
      }
    };

    // 生命周期
    onMounted(() => {
      loadRooms();
    });

    return {
      rooms,
      loading,
      showCreateRoom,
      showRoomSettings,
      currentRoom,
      newRoom,
      loadRooms,
      createRoom,
      joinRoom,
      openRoomSettings,
      saveRoomSettings,
      getRoomIcon
    };
  }
};
</script>

<style scoped>
.matrix-room-manager {
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  margin: 10px 0;
}

.room-manager-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #e9ecef;
}

.room-manager-header h3 {
  margin: 0;
  color: #333;
}

.btn-create-room {
  background: #007bff;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 14px;
}

.btn-create-room:hover {
  background: #0056b3;
}

.room-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.loading, .no-rooms {
  text-align: center;
  color: #666;
  padding: 20px;
}

.no-rooms p {
  margin-bottom: 15px;
  font-size: 16px;
}

.rooms-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 15px;
}

.room-card {
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 15px;
  transition: all 0.3s ease;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.room-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}

.room-card.private {
  border-left: 4px solid #dc3545;
}

.room-card.public {
  border-left: 4px solid #28a745;
}

.room-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.room-header i {
  font-size: 18px;
}

.room-name {
  font-weight: 600;
  color: #333;
  flex: 1;
}

.room-type {
  background: #e9ecef;
  color: #495057;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.room-type.private {
  background: #f8d7da;
  color: #721c24;
}

.room-type.public {
  background: #d4edda;
  color: #155724;
}

.room-info {
  margin-bottom: 12px;
}

.room-topic {
  color: #666;
  font-size: 14px;
  line-height: 1.4;
  margin-bottom: 8px;
}

.room-members {
  color: #888;
  font-size: 12px;
}

.room-actions {
  display: flex;
  gap: 8px;
}

.btn-join, .btn-settings {
  flex: 1;
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.btn-join {
  background: #28a745;
  color: white;
}

.btn-join:hover {
  background: #218838;
}

.btn-settings {
  background: #6c757d;
  color: white;
}

.btn-settings:hover {
  background: #5a6268;
}

/* 模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 8px;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px 16px;
  border-bottom: 1px solid #dee2e6;
}

.modal-header h4 {
  margin: 0;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #666;
}

.close-btn:hover {
  color: #333;
}

.modal-body {
  padding: 24px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  color: #333;
}

.form-group input, .form-group textarea, .form-group select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;
}

.form-group textarea {
  resize: vertical;
}

.form-group input:focus, .form-group textarea:focus, .form-group select:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.switch {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: .4s;
  border-radius: 34px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 26px;
  width: 26px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #28a745;
}

input:checked + .slider:before {
  transform: translateX(26px);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  padding: 16px 24px 20px;
  border-top: 1px solid #dee2e6;
  gap: 12px;
}

.btn-cancel, .btn-confirm {
  padding: 8px 20px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.btn-cancel {
  background: #6c757d;
  color: white;
}

.btn-cancel:hover {
  background: #5a6268;
}

.btn-confirm {
  background: #007bff;
  color: white;
}

.btn-confirm:hover {
  background: #0056b3;
}
</style>
