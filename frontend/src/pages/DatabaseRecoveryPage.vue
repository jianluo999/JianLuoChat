<template>
  <div class="database-recovery-page">
    <div class="page-header">
      <h1>数据库恢复管理</h1>
      <p>监控和管理数据库健康状态，执行备份和恢复操作</p>
    </div>

    <div class="recovery-tabs">
      <button 
        :class="{ active: activeTab === 'health' }"
        @click="activeTab = 'health'"
      >
        健康检查
      </button>
      <button 
        :class="{ active: activeTab === 'backup' }"
        @click="activeTab = 'backup'"
      >
        备份管理
      </button>
      <button 
        :class="{ active: activeTab === 'repair' }"
        @click="activeTab = 'repair'"
      >
        坏块修复
      </button>
      <button 
        :class="{ active: activeTab === 'recovery' }"
        @click="activeTab = 'recovery'"
      >
        数据恢复
      </button>
    </div>

    <!-- 健康检查标签页 -->
    <div v-if="activeTab === 'health'" class="tab-content">
      <HealthCheckTab 
        :health-status="healthStatus"
        :loading="healthLoading"
        @check-health="checkDatabaseHealth"
        @repair-bad-blocks="repairBadBlocks"
      />
    </div>

    <!-- 备份管理标签页 -->
    <div v-if="activeTab === 'backup'" class="tab-content">
      <BackupManagementTab 
        :backups="backups"
        :loading="backupLoading"
        @create-backup="createDatabaseBackup"
        @delete-backup="deleteBackup"
        @refresh-backups="refreshBackups"
      />
    </div>

    <!-- 坏块修复标签页 -->
    <div v-if="activeTab === 'repair'" class="tab-content">
      <BadBlockRepairTab 
        :repair-result="repairResult"
        :loading="repairLoading"
        @repair-bad-blocks="repairBadBlocks"
      />
    </div>

    <!-- 数据恢复标签页 -->
    <div v-if="activeTab === 'recovery'" class="tab-content">
      <DataRecoveryTab 
        :backups="backups"
        :loading="recoveryLoading"
        @execute-full-recovery="executeFullRecovery"
        @restore-from-backup="restoreFromBackup"
      />
    </div>

    <!-- 操作结果提示 -->
    <div v-if="showResult" class="result-message" :class="resultType">
      <div class="result-icon">
        <i :class="resultType === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle'"></i>
      </div>
      <div class="result-content">
        <h3>{{ resultTitle }}</h3>
        <p>{{ resultMessage }}</p>
        <button @click="hideResult" class="close-btn">关闭</button>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="globalLoading" class="loading-overlay">
      <div class="loading-spinner">
        <i class="fas fa-spinner fa-spin"></i>
        <p>正在执行操作...</p>
      </div>
    </div>
  </div>
</template>

<script>
import HealthCheckTab from '@/components/DatabaseRecovery/HealthCheckTab.vue';
import BackupManagementTab from '@/components/DatabaseRecovery/BackupManagementTab.vue';
import BadBlockRepairTab from '@/components/DatabaseRecovery/BadBlockRepairTab.vue';
import DataRecoveryTab from '@/components/DatabaseRecovery/DataRecoveryTab.vue';

export default {
  name: 'DatabaseRecoveryPage',
  components: {
    HealthCheckTab,
    BackupManagementTab,
    BadBlockRepairTab,
    DataRecoveryTab
  },
  data() {
    return {
      activeTab: 'health',
      healthStatus: null,
      backups: [],
      repairResult: null,
      loading: false,
      healthLoading: false,
      backupLoading: false,
      repairLoading: false,
      recoveryLoading: false,
      globalLoading: false,
      showResult: false,
      resultType: 'success',
      resultTitle: '',
      resultMessage: ''
    };
  },
  mounted() {
    this.checkDatabaseHealth();
    this.refreshBackups();
  },
  methods: {
    // 健康检查相关
    async checkDatabaseHealth() {
      this.healthLoading = true;
      this.globalLoading = true;
      
      try {
        const response = await this.$api.get('/api/database/health');
        this.healthStatus = response.data.healthStatus;
        this.showResult = true;
        this.resultType = 'success';
        this.resultTitle = '健康检查完成';
        this.resultMessage = '数据库健康状态已更新';
      } catch (error) {
        this.showResult = true;
        this.resultType = 'error';
        this.resultTitle = '健康检查失败';
        this.resultMessage = error.response?.data?.error || '检查数据库健康状态时发生错误';
      } finally {
        this.healthLoading = false;
        this.globalLoading = false;
      }
    },

    async repairBadBlocks() {
      this.repairLoading = true;
      this.globalLoading = true;
      
      try {
        const response = await this.$api.post('/api/database/repair-bad-blocks');
        this.repairResult = response.data.repairResult;
        this.showResult = true;
        this.resultType = 'success';
        this.resultTitle = '坏块修复完成';
        this.resultMessage = '坏块检测和修复操作已完成';
      } catch (error) {
        this.showResult = true;
        this.resultType = 'error';
        this.resultTitle = '坏块修复失败';
        this.resultMessage = error.response?.data?.error || '修复坏块时发生错误';
      } finally {
        this.repairLoading = false;
        this.globalLoading = false;
      }
    },

    // 备份管理相关
    async createDatabaseBackup() {
      this.backupLoading = true;
      this.globalLoading = true;
      
      try {
        const response = await this.$api.post('/api/database/backup');
        this.showResult = true;
        this.resultType = 'success';
        this.resultTitle = '备份创建成功';
        this.resultMessage = `数据库备份已创建: ${response.data.backupFileName}`;
        // 刷新备份列表
        await this.refreshBackups();
      } catch (error) {
        this.showResult = true;
        this.resultType = 'error';
        this.resultTitle = '备份创建失败';
        this.resultMessage = error.response?.data?.error || '创建数据库备份时发生错误';
      } finally {
        this.backupLoading = false;
        this.globalLoading = false;
      }
    },

    async deleteBackup(backupFileName) {
      this.backupLoading = true;
      this.globalLoading = true;
      
      try {
        const response = await this.$api.delete(`/api/database/backups/${backupFileName}`);
        this.showResult = true;
        this.resultType = 'success';
        this.resultTitle = '备份删除成功';
        this.resultMessage = response.data.message;
        // 刷新备份列表
        await this.refreshBackups();
      } catch (error) {
        this.showResult = true;
        this.resultType = 'error';
        this.resultTitle = '备份删除失败';
        this.resultMessage = error.response?.data?.error || '删除备份时发生错误';
      } finally {
        this.backupLoading = false;
        this.globalLoading = false;
      }
    },

    async refreshBackups() {
      this.backupLoading = true;
      
      try {
        const response = await this.$api.get('/api/database/backups');
        this.backups = response.data.backups;
      } catch (error) {
        this.showResult = true;
        this.resultType = 'error';
        this.resultTitle = '刷新备份列表失败';
        this.resultMessage = error.response?.data?.error || '刷新备份列表时发生错误';
      } finally {
        this.backupLoading = false;
      }
    },

    // 数据恢复相关
    async executeFullRecovery(backupFileName) {
      this.recoveryLoading = true;
      this.globalLoading = true;
      
      try {
        const response = await this.$api.post('/api/database/full-recovery', {
          backupFileName: backupFileName
        });
        this.showResult = true;
        this.resultType = 'success';
        this.resultTitle = '完整恢复完成';
        this.resultMessage = '数据库完整恢复操作已完成';
        // 刷新状态
        await this.checkDatabaseHealth();
        await this.refreshBackups();
      } catch (error) {
        this.showResult = true;
        this.resultType = 'error';
        this.resultTitle = '完整恢复失败';
        this.resultMessage = error.response?.data?.error || '执行完整恢复时发生错误';
      } finally {
        this.recoveryLoading = false;
        this.globalLoading = false;
      }
    },

    async restoreFromBackup(backupFileName) {
      this.recoveryLoading = true;
      this.globalLoading = true;
      
      try {
        const response = await this.$api.post('/api/database/restore', {
          backupFileName: backupFileName
        });
        this.showResult = true;
        this.resultType = 'success';
        this.resultTitle = '数据恢复成功';
        this.resultMessage = response.data.message;
        // 刷新状态
        await this.checkDatabaseHealth();
        await this.refreshBackups();
      } catch (error) {
        this.showResult = true;
        this.resultType = 'error';
        this.resultTitle = '数据恢复失败';
        this.resultMessage = error.response?.data?.error || '从备份恢复数据时发生错误';
      } finally {
        this.recoveryLoading = false;
        this.globalLoading = false;
      }
    },

    // 通用方法
    hideResult() {
      this.showResult = false;
    }
  }
};
</script>

<style scoped>
.database-recovery-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.page-header {
  text-align: center;
  margin-bottom: 30px;
}

.page-header h1 {
  color: #2c3e50;
  margin-bottom: 10px;
  font-size: 2.5em;
}

.page-header p {
  color: #7f8c8d;
  font-size: 1.1em;
}

.recovery-tabs {
  display: flex;
  background: #f8f9fa;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 30px;
}

.recovery-tabs button {
  flex: 1;
  padding: 15px 20px;
  background: none;
  border: none;
  color: #7f8c8d;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.recovery-tabs button:hover {
  background: #e9ecef;
  color: #2c3e50;
}

.recovery-tabs button.active {
  background: #3498db;
  color: white;
}

.tab-content {
  background: white;
  border-radius: 8px;
  padding: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.result-message {
  position: fixed;
  top: 20px;
  right: 20px;
  max-width: 400px;
  padding: 20px;
  border-radius: 8px;
  color: white;
  z-index: 1000;
  animation: slideIn 0.3s ease;
}

.result-message.success {
  background: #27ae60;
}

.result-message.error {
  background: #e74c3c;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.result-icon {
  text-align: center;
  margin-bottom: 15px;
}

.result-icon i {
  font-size: 2em;
  margin-bottom: 10px;
}

.result-content h3 {
  margin: 0 0 10px 0;
  font-size: 1.2em;
}

.result-content p {
  margin: 0 0 15px 0;
  line-height: 1.5;
}

.close-btn {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.loading-spinner {
  background: white;
  padding: 40px;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.loading-spinner i {
  font-size: 2em;
  color: #3498db;
  margin-bottom: 15px;
}

.loading-spinner p {
  margin: 0;
  color: #7f8c8d;
  font-size: 1.1em;
}
</style>