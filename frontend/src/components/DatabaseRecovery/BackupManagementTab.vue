<template>
  <div class="backup-management-tab">
    <div class="backup-actions">
      <button 
        @click="createDatabaseBackup"
        :disabled="backupLoading"
        class="primary-btn"
      >
        <i class="fas fa-plus"></i>
        {{ backupLoading ? '创建中...' : '创建备份' }}
      </button>
      
      <button 
        @click="refreshBackups"
        :disabled="backupLoading"
        class="secondary-btn"
      >
        <i class="fas fa-sync-alt"></i>
        {{ backupLoading ? '刷新中...' : '刷新列表' }}
      </button>
    </div>

    <div v-if="backups.length === 0 && !backupLoading" class="empty-state">
      <i class="fas fa-archive"></i>
      <h3>暂无备份文件</h3>
      <p>点击"创建备份"按钮来创建第一个数据库备份</p>
    </div>

    <div v-else class="backup-list">
      <div class="backup-header">
        <h3>备份文件列表</h3>
        <p>{{ backups.length }} 个备份文件</p>
      </div>
      
      <div class="backup-items">
        <div 
          v-for="(backup, index) in backups" 
          :key="index"
          class="backup-item"
        >
          <div class="backup-info">
            <div class="backup-name">{{ backup }}</div>
            <div class="backup-meta">
              <span class="file-size">文件大小: 计算中...</span>
              <span class="created-at">创建时间: {{ parseBackupTime(backup) }}</span>
            </div>
          </div>
          
          <div class="backup-actions">
            <button 
              @click="restoreFromBackup(backup)"
              class="restore-btn"
            >
              <i class="fas fa-undo"></i> 恢复
            </button>
            <button 
              @click="deleteBackup(backup)"
              :disabled="backupLoading"
              class="delete-btn"
            >
              <i class="fas fa-trash"></i> 删除
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BackupManagementTab',
  props: {
    backups: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      backupLoading: false
    };
  },
  methods: {
    parseBackupTime(backupFileName) {
      // 从备份文件名中解析时间，格式: jianluochat_backup_YYYYMMDD_HHMMSS.backup
      const match = backupFileName.match(/jianluochat_backup_(\d{8})_(\d{6})\.backup/);
      if (match) {
        const dateStr = match[1];
        const timeStr = match[2];
        const year = dateStr.substring(0, 4);
        const month = dateStr.substring(4, 6);
        const day = dateStr.substring(6, 8);
        const hour = timeStr.substring(0, 2);
        const minute = timeStr.substring(2, 4);
        const second = timeStr.substring(4, 6);
        
        return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
      }
      return '未知时间';
    },
    
    async createDatabaseBackup() {
      this.backupLoading = true;
      this.$emit('create-backup');
    },
    
    async deleteBackup(backupFileName) {
      if (confirm(`确定要删除备份文件 "${backupFileName}" 吗？此操作不可恢复。`)) {
        this.backupLoading = true;
        this.$emit('delete-backup', backupFileName);
      }
    },
    
    async refreshBackups() {
      this.backupLoading = true;
      this.$emit('refresh-backups');
    },
    
    async restoreFromBackup(backupFileName) {
      if (confirm(`确定要从备份文件 "${backupFileName}" 恢复数据吗？这将覆盖当前数据库中的所有数据。`)) {
        this.backupLoading = true;
        this.$emit('restore-from-backup', backupFileName);
      }
    }
  }
};
</script>

<style scoped>
.backup-management-tab {
  padding: 20px;
}

.backup-actions {
  display: flex;
  gap: 15px;
  margin-bottom: 30px;
  flex-wrap: wrap;
}

.primary-btn, .secondary-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.primary-btn {
  background: #3498db;
  color: white;
}

.primary-btn:hover:not(:disabled) {
  background: #2980b9;
}

.secondary-btn {
  background: #95a5a6;
  color: white;
}

.secondary-btn:hover:not(:disabled) {
  background: #7f8c8d;
}

.primary-btn:disabled, .secondary-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 8px;
  border: 2px dashed #bdc3c7;
}

.empty-state i {
  font-size: 3em;
  color: #bdc3c7;
  margin-bottom: 20px;
}

.empty-state h3 {
  color: #7f8c8d;
  margin-bottom: 10px;
}

.empty-state p {
  color: #95a5a6;
  font-size: 1.1em;
}

.backup-list {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.backup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e9ecef;
}

.backup-header h3 {
  color: #495057;
  margin: 0;
}

.backup-header p {
  color: #6c757d;
  margin: 0;
  font-weight: bold;
}

.backup-items {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.backup-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 6px;
  border-left: 4px solid #3498db;
}

.backup-info {
  flex: 1;
}

.backup-name {
  font-weight: bold;
  color: #495057;
  margin-bottom: 8px;
  font-size: 0.95em;
}

.backup-meta {
  display: flex;
  gap: 15px;
  font-size: 0.85em;
  color: #6c757d;
}

.backup-meta span {
  display: flex;
  align-items: center;
  gap: 5px;
}

.backup-actions {
  display: flex;
  gap: 10px;
}

.restore-btn, .delete-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}

.restore-btn {
  background: #27ae60;
  color: white;
}

.restore-btn:hover:not(:disabled) {
  background: #229954;
}

.delete-btn {
  background: #e74c3c;
  color: white;
}

.delete-btn:hover:not(:disabled) {
  background: #c0392b;
}

.delete-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>