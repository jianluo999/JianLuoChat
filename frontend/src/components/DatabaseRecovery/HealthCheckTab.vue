<template>
  <div class="health-check-tab">
    <div class="status-overview">
      <div class="status-card">
        <h3>数据库状态</h3>
        <div class="status-indicator">
          <i :class="getStatusIcon()" :style="{ color: getStatusColor() }"></i>
          <span :class="getStatusClass()">{{ getStatusText() }}</span>
        </div>
        <p v-if="healthStatus">{{ healthStatus.timestamp }}</p>
      </div>
      
      <div class="metrics-grid">
        <div class="metric-card">
          <h4>可用备份</h4>
          <p class="metric-value">{{ backupCount }}</p>
        </div>
        <div class="metric-card">
          <h4>坏块数量</h4>
          <p class="metric-value">{{ badBlockCount }}</p>
        </div>
        <div class="metric-card">
          <h4>最后检查</h4>
          <p class="metric-value">{{ lastCheckTime }}</p>
        </div>
      </div>
    </div>

    <div class="actions-section">
      <button 
        @click="checkDatabaseHealth"
        :disabled="healthLoading"
        class="primary-btn"
      >
        <i class="fas fa-heartbeat"></i>
        {{ healthLoading ? '检查中...' : '检查健康状态' }}
      </button>
      
      <button 
        @click="repairBadBlocks"
        :disabled="healthLoading || repairLoading"
        class="warning-btn"
      >
        <i class="fas fa-tools"></i>
        {{ repairLoading ? '修复中...' : '修复坏块' }}
      </button>
    </div>

    <div v-if="healthStatus" class="detailed-status">
      <h3>详细状态信息</h3>
      <div class="status-details">
        <div class="status-item">
          <span class="label">连接状态:</span>
          <span :class="['value', getConnectionStatusClass()]">{{ getConnectionStatusText() }}</span>
        </div>
        
        <div v-if="healthStatus.issues && healthStatus.issues.length > 0" class="status-item">
          <span class="label">问题:</span>
          <div class="issues-list">
            <div v-for="(issue, index) in healthStatus.issues" :key="index" class="issue-item">
              <i class="fas fa-exclamation-triangle"></i>
              <span>{{ issue }}</span>
            </div>
          </div>
        </div>
        
        <div v-if="healthStatus.badBlocks && healthStatus.badBlocks.length > 0" class="status-item">
          <span class="label">坏块列表:</span>
          <div class="bad-blocks-list">
            <div v-for="(block, index) in healthStatus.badBlocks" :key="index" class="bad-block-item">
              <i class="fas fa-bolt"></i>
              <span>{{ block }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HealthCheckTab',
  props: {
    healthStatus: {
      type: Object,
      default: null
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      healthLoading: false,
      repairLoading: false
    };
  },
  computed: {
    backupCount() {
      return this.healthStatus ? this.healthStatus.backupCount || 0 : 0;
    },
    badBlockCount() {
      return this.healthStatus ? this.healthStatus.badBlocksFound || 0 : 0;
    },
    lastCheckTime() {
      return this.healthStatus ? this.healthStatus.timestamp : '未检查';
    }
  },
  methods: {
    getStatusText() {
      if (!this.healthStatus) return '未检查';
      return this.healthStatus.status || '未知';
    },
    
    getStatusClass() {
      if (!this.healthStatus) return 'unknown';
      return this.healthStatus.status;
    },
    
    getStatusIcon() {
      if (!this.healthStatus) return 'fas fa-question-circle';
      switch (this.healthStatus.status) {
        case 'healthy':
          return 'fas fa-check-circle';
        case 'degraded':
          return 'fas fa-exclamation-circle';
        case 'unhealthy':
          return 'fas fa-times-circle';
        default:
          return 'fas fa-question-circle';
      }
    },
    
    getStatusColor() {
      if (!this.healthStatus) return '#95a5a6';
      switch (this.healthStatus.status) {
        case 'healthy':
          return '#27ae60';
        case 'degraded':
          return '#f39c12';
        case 'unhealthy':
          return '#e74c3c';
        default:
          return '#95a5a6';
      }
    },
    
    getConnectionStatusText() {
      if (!this.healthStatus) return '未知';
      if (this.healthStatus.status === 'unhealthy') {
        return '连接失败';
      }
      return '连接正常';
    },
    
    getConnectionStatusClass() {
      if (!this.healthStatus) return 'unknown';
      if (this.healthStatus.status === 'unhealthy') {
        return 'error';
      }
      return 'success';
    },
    
    async checkDatabaseHealth() {
      this.healthLoading = true;
      this.$emit('check-health');
    },
    
    async repairBadBlocks() {
      this.repairLoading = true;
      this.$emit('repair-bad-blocks');
    }
  }
};
</script>

<style scoped>
.health-check-tab {
  padding: 20px;
}

.status-overview {
  display: grid;
  grid-template-columns: 1fr 3fr;
  gap: 20px;
  margin-bottom: 30px;
}

.status-card {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
}

.status-card h3 {
  color: #495057;
  margin-bottom: 15px;
  font-size: 1.1em;
}

.status-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 10px;
}

.status-indicator i {
  font-size: 1.5em;
}

.status-indicator span {
  font-weight: bold;
  text-transform: capitalize;
}

.status-indicator.success {
  color: #27ae60;
}

.status-indicator.degraded {
  color: #f39c12;
}

.status-indicator.unhealthy {
  color: #e74c3c;
}

.status-indicator.unknown {
  color: #95a5a6;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.metric-card {
  background: white;
  padding: 15px;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.metric-card h4 {
  color: #6c757d;
  margin-bottom: 10px;
  font-size: 0.9em;
}

.metric-value {
  font-size: 1.5em;
  font-weight: bold;
  color: #2c3e50;
}

.actions-section {
  display: flex;
  gap: 15px;
  margin-bottom: 30px;
  flex-wrap: wrap;
}

.primary-btn, .warning-btn {
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

.warning-btn {
  background: #f39c12;
  color: white;
}

.warning-btn:hover:not(:disabled) {
  background: #e67e22;
}

.primary-btn:disabled, .warning-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.detailed-status {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
}

.detailed-status h3 {
  color: #495057;
  margin-bottom: 20px;
  font-size: 1.2em;
}

.status-details {
  display: grid;
  gap: 15px;
}

.status-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.status-item .label {
  font-weight: bold;
  color: #495057;
  min-width: 100px;
}

.status-item .value {
  flex: 1;
}

.status-item .value.success {
  color: #27ae60;
}

.status-item .value.error {
  color: #e74c3c;
}

.status-item .value.warning {
  color: #f39c12;
}

.issues-list, .bad-blocks-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.issue-item, .bad-block-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background: white;
  border-radius: 4px;
  border-left: 4px solid #e74c3c;
}

.issue-item {
  border-left-color: #e74c3c;
}

.bad-block-item {
  border-left-color: #f39c12;
}

.issue-item i, .bad-block-item i {
  color: inherit;
  font-size: 0.9em;
}
</style>