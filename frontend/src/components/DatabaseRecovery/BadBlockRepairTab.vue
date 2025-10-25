<template>
  <div class="bad-block-repair-tab">
    <div class="repair-overview">
      <div class="repair-stats">
        <div class="stat-card">
          <h4>检测到的坏块</h4>
          <p class="stat-value">{{ repairResult?.badBlocksFound || 0 }}</p>
        </div>
        <div class="stat-card">
          <h4>已修复的坏块</h4>
          <p class="stat-value">{{ repairResult?.repairedBlocks || 0 }}</p>
        </div>
        <div class="stat-card">
          <h4>修复成功率</h4>
          <p class="stat-value">{{ getRepairSuccessRate() }}%</p>
        </div>
      </div>
    </div>

    <div class="repair-actions">
      <button 
        @click="repairBadBlocks"
        :disabled="repairLoading"
        class="primary-btn"
      >
        <i class="fas fa-tools"></i>
        {{ repairLoading ? '修复中...' : '检测并修复坏块' }}
      </button>
      
      <button 
        @click="viewRepairLog"
        class="secondary-btn"
      >
        <i class="fas fa-list"></i> 修复日志
      </button>
    </div>

    <div v-if="repairResult" class="repair-results">
      <h3>修复结果</h3>
      <div class="repair-summary">
        <div class="result-item">
          <span class="label">状态:</span>
          <span :class="['value', getResultClass()]">{{ repairResult.status }}</span>
        </div>
        <div class="result-item">
          <span class="label">消息:</span>
          <span class="value">{{ repairResult.message }}</span>
        </div>
        <div class="result-item">
          <span class="label">执行时间:</span>
          <span class="value">{{ repairResult.timestamp }}</span>
        </div>
      </div>

      <div v-if="repairResult.badBlocks && repairResult.badBlocks.length > 0" class="bad-blocks-list">
        <h4>检测到的坏块</h4>
        <div class="blocks-container">
          <div 
            v-for="(block, index) in repairResult.badBlocks" 
            :key="index"
            class="block-item"
          >
            <i class="fas fa-bolt"></i>
            <span>{{ block }}</span>
          </div>
        </div>
      </div>

      <div v-if="repairResult.repairedBlockList && repairResult.repairedBlockList.length > 0" class="repaired-blocks-list">
        <h4>已修复的坏块</h4>
        <div class="blocks-container">
          <div 
            v-for="(block, index) in repairResult.repairedBlockList" 
            :key="index"
            class="block-item success"
          >
            <i class="fas fa-check"></i>
            <span>{{ block }}</span>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="no-repair-data">
      <i class="fas fa-tools"></i>
      <h3>暂无修复记录</h3>
      <p>点击"检测并修复坏块"按钮来开始坏块检测和修复</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BadBlockRepairTab',
  props: {
    repairResult: {
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
      repairLoading: false
    };
  },
  methods: {
    getRepairSuccessRate() {
      if (!this.repairResult) return 0;
      const total = this.repairResult.badBlocksFound || 0;
      const repaired = this.repairResult.repairedBlocks || 0;
      return total > 0 ? Math.round((repaired / total) * 100) : 0;
    },
    
    getResultClass() {
      if (!this.repairResult) return 'unknown';
      return this.repairResult.status === 'completed' ? 'success' : 'error';
    },
    
    async repairBadBlocks() {
      this.repairLoading = true;
      this.$emit('repair-bad-blocks');
    },
    
    viewRepairLog() {
      // 这里可以添加查看详细修复日志的功能
      alert('修复日志功能即将实现');
    }
  }
};
</script>

<style scoped>
.bad-block-repair-tab {
  padding: 20px;
}

.repair-overview {
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.repair-stats {
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

.repair-actions {
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
  background: #f39c12;
  color: white;
}

.primary-btn:hover:not(:disabled) {
  background: #e67e22;
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

.repair-results {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.repair-results h3 {
  color: #495057;
  margin-bottom: 25px;
  font-size: 1.2em;
}

.repair-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
  margin-bottom: 30px;
}

.result-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.result-item .label {
  font-weight: bold;
  color: #495057;
  min-width: 120px;
}

.result-item .value {
  flex: 1;
}

.result-item .value.success {
  color: #27ae60;
}

.result-item .value.error {
  color: #e74c3c;
}

.blocks-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.block-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 4px;
  border-left: 4px solid #f39c12;
}

.block-item.success {
  border-left-color: #27ae60;
}

.block-item i {
  color: inherit;
  font-size: 0.9em;
}

.no-repair-data {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 8px;
  border: 2px dashed #f39c12;
}

.no-repair-data i {
  font-size: 3em;
  color: #f39c12;
  margin-bottom: 20px;
}

.no-repair-data h3 {
  color: #f39c12;
  margin-bottom: 10px;
}

.no-repair-data p {
  color: #6c757d;
  font-size: 1.1em;
}
</style>