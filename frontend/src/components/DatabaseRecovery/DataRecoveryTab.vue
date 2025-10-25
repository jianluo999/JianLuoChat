<template>
  <div class="data-recovery-tab">
    <div class="recovery-overview">
      <div class="recovery-stats">
        <div class="stat-card">
          <h4>可用备份</h4>
          <p class="stat-value">{{ backupCount }}</p>
        </div>
        <div class="stat-card">
          <h4>最近备份</h4>
          <p class="stat-value">{{ lastBackup || '无' }}</p>
        </div>
        <div class="stat-card">
          <h4>恢复选项</h4>
          <p class="stat-value">完整恢复</p>
        </div>
      </div>
    </div>

    <div class="recovery-actions">
      <button 
        @click="executeFullRecovery"
        :disabled="recoveryLoading || !hasBackups"
        class="primary-btn"
      >
        <i class="fas fa-undo-alt"></i>
        {{ recoveryLoading ? '恢复中...' : '执行完整恢复' }}
      </button>
      
      <button 
        @click="showRecoveryGuide"
        class="secondary-btn"
      >
        <i class="fas fa-info-circle"></i> 恢复指南
      </button>
    </div>

    <div v-if="hasBackups" class="backup-selection">
      <h3>选择备份文件</h3>
      <div class="backup-list">
        <div 
          v-for="(backup, index) in backups" 
          :key="index"
          class="backup-item"
          :class="{ selected: selectedBackup === backup }"
          @click="selectBackup(backup)"
        >
          <div class="backup-info">
            <div class="backup-name">{{ backup }}</div>
            <div class="backup-meta">
              <span class="file-size">文件大小: 计算中...</span>
              <span class="created-at">创建时间: {{ parseBackupTime(backup) }}</span>
            </div>
          </div>
          
          <div class="backup-actions">
            <i class="fas fa-check-circle" v-if="selectedBackup === backup"></i>
            <i class="fas fa-circle" v-else></i>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="no-backups">
      <i class="fas fa-exclamation-triangle"></i>
      <h3>暂无可用备份</h3>
      <p>请先创建数据库备份，然后才能执行数据恢复操作</p>
      <button @click="$emit('create-backup')" class="create-backup-btn">
        <i class="fas fa-plus"></i> 创建备份
      </button>
    </div>

    <div v-if="selectedBackup" class="recovery-warning">
      <div class="warning-box">
        <i class="fas fa-exclamation-triangle"></i>
        <div class="warning-content">
          <h4>重要警告</h4>
          <p>执行完整恢复将：</p>
          <ul>
            <li>清空当前数据库中的所有数据</li>
            <li>从选中的备份文件恢复所有数据</li>
            <li>此操作不可逆，请确保已备份当前数据</li>
          </ul>
          <p><strong>请确认您已了解这些风险后再执行恢复操作。</strong></p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DataRecoveryTab',
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
      selectedBackup: null,
      recoveryLoading: false
    };
  },
  computed: {
    hasBackups() {
      return this.backups && this.backups.length > 0;
    },
    backupCount() {
      return this.backups.length;
    },
    lastBackup() {
      return this.backups[0] || null;
    }
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
    
    selectBackup(backupFileName) {
      this.selectedBackup = backupFileName;
    },
    
    async executeFullRecovery() {
      if (!this.selectedBackup) {
        alert('请先选择一个备份文件');
        return;
      }
      
      if (!confirm(`确定要从备份文件 "${this.selectedBackup}" 执行完整恢复吗？\n\n此操作将：\n1. 清空当前数据库中的所有数据\n2. 从选中的备份文件恢复所有数据\n3. 此操作不可逆\n\n请确认您已了解这些风险后再执行恢复操作。`)) {
        return;
      }
      
      this.recoveryLoading = true;
      this.$emit('execute-full-recovery', this.selectedBackup);
    },
    
    showRecoveryGuide() {
      alert('恢复指南：\n\n1. 确保您有最新的数据库备份\n2. 在执行恢复前，请务必备份当前数据库\n3. 选择要恢复的备份文件\n4. 点击"执行完整恢复"按钮\n5. 等待恢复过程完成\n\n恢复过程中系统将暂时不可用，请耐心等待。');
    }
  }
};
</script>

<style scoped>
.data-recovery-tab {
  padding: 20px;
}

.recovery-overview {
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.recovery-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 20px;
}

.stat-card {
  text-align: center;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.stat-card h4 {
  color: #6c757d;
  margin-bottom: 10px;
  font-size: 0.9em;
}

.stat-value {
  font-size: 2em;
  font-weight: bold;
  color: #2c3e50;
}

.recovery-actions {
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
  background: #e74c3c;
  color: white;
}

.primary-btn:hover:not(:disabled) {
  background: #c0392b;
}

.secondary-btn {
  background: #95a5a6;
  color: white;
}

.secondary-btn:hover:not(:disabled) {
  background: #7f8c8d;
}

.primary-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.backup-selection {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.backup-selection h3 {
  color: #495057;
  margin-bottom: 20px;
  font-size: 1.2em;
}

.backup-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.backup-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 6px;
  border-left: 4px solid #3498db;
  cursor: pointer;
  transition: all 0.3s ease;
}

.backup-item:hover {
  background: #e9ecef;
  border-left-color: #2980b9;
}

.backup-item.selected {
  background: #e8f4fd;
  border-left-color: #3498db;
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
  align-items: center;
}

.backup-actions i {
  font-size: 1.2em;
  color: #95a5a6;
}

.backup-actions i.fas.fa-check-circle {
  color: #27ae60;
}

.no-backups {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 8px;
  border: 2px dashed #e74c3c;
  margin-bottom: 30px;
}

.no-backups i {
  font-size: 3em;
  color: #e74c3c;
  margin-bottom: 20px;
}

.no-backups h3 {
  color: #e74c3c;
  margin-bottom: 10px;
}

.no-backups p {
  color: #6c757d;
  font-size: 1.1em;
  margin-bottom: 20px;
}

.create-backup-btn {
  padding: 12px 24px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.3s ease;
}

.create-backup-btn:hover {
  background: #2980b9;
}

.recovery-warning {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.warning-box {
  display: flex;
  gap: 15px;
  padding: 20px;
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 8px;
}

.warning-box i {
  font-size: 2em;
  color: #856404;
  flex-shrink: 0;
}

.warning-content {
  flex: 1;
}

.warning-content h4 {
  color: #856404;
  margin-bottom: 10px;
  font-size: 1.1em;
}

.warning-content p {
  color: #856404;
  margin-bottom: 10px;
  line-height: 1.5;
}

.warning-content ul {
  color: #856404;
  margin-bottom: 10px;
  padding-left: 20px;
}

.warning-content li {
  margin-bottom: 5px;
}

.warning-content strong {
  color: #856404;
}
</style>