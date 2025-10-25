<template>
  <div class="security-audit-page">
    <div class="page-header">
      <h1>🔐 E2EE 安全审计</h1>
      <p class="subtitle">检查端到端加密实现的安全性</p>
    </div>

    <div class="audit-controls">
      <el-button 
        type="primary" 
        @click="runSecurityAudit"
        :loading="auditRunning"
        size="large"
      >
        <el-icon><Search /></el-icon>
        {{ auditRunning ? '检查中...' : '开始安全检查' }}
      </el-button>
      
      <el-button 
        v-if="lastReport"
        @click="exportReport"
        size="large"
      >
        <el-icon><Download /></el-icon>
        导出报告
      </el-button>
    </div>

    <!-- 总体状态 -->
    <div v-if="lastReport" class="overall-status">
      <el-card>
        <template #header>
          <div class="card-header">
            <span>总体安全状态</span>
            <el-tag 
              :type="getStatusTagType(lastReport.overallStatus)"
              size="large"
            >
              {{ getStatusIcon(lastReport.overallStatus) }} {{ lastReport.overallStatus.toUpperCase() }}
            </el-tag>
          </div>
        </template>
        
        <div class="status-stats">
          <div class="stat-item critical">
            <div class="stat-number">{{ lastReport.criticalIssues }}</div>
            <div class="stat-label">严重问题</div>
          </div>
          <div class="stat-item high">
            <div class="stat-number">{{ lastReport.highIssues }}</div>
            <div class="stat-label">高风险</div>
          </div>
          <div class="stat-item medium">
            <div class="stat-number">{{ lastReport.mediumIssues }}</div>
            <div class="stat-label">中风险</div>
          </div>
          <div class="stat-item low">
            <div class="stat-number">{{ lastReport.lowIssues }}</div>
            <div class="stat-label">低风险</div>
          </div>
        </div>

        <div v-if="lastReport.criticalIssues > 0" class="critical-warning">
          <el-alert
            title="发现严重安全问题！"
            type="error"
            description="建议立即停止使用E2EE功能，直到修复这些问题。"
            show-icon
            :closable="false"
          />
        </div>
      </el-card>
    </div>

    <!-- 检查结果详情 -->
    <div v-if="lastReport" class="audit-results">
      <el-card>
        <template #header>
          <div class="card-header">
            <span>检查结果详情</span>
            <span class="timestamp">
              检查时间: {{ formatTimestamp(lastReport.timestamp) }}
            </span>
          </div>
        </template>

        <!-- 按类别分组显示结果 -->
        <div class="results-by-category">
          <div 
            v-for="category in categories" 
            :key="category"
            class="category-section"
          >
            <h3 class="category-title">{{ category }}</h3>
            <div class="category-results">
              <div 
                v-for="result in getResultsByCategory(category)"
                :key="result.check"
                class="result-item"
                :class="[result.status, result.severity]"
              >
                <div class="result-header">
                  <div class="result-info">
                    <span class="result-icon">{{ getResultIcon(result.status) }}</span>
                    <span class="result-check">{{ result.check }}</span>
                    <el-tag 
                      :type="getSeverityTagType(result.severity)"
                      size="small"
                    >
                      {{ result.severity }}
                    </el-tag>
                  </div>
                </div>
                
                <div class="result-message">{{ result.message }}</div>
                
                <div v-if="result.recommendation" class="result-recommendation">
                  <el-icon><InfoFilled /></el-icon>
                  <span>建议: {{ result.recommendation }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 修复建议 -->
    <div v-if="lastReport && hasIssues" class="fix-recommendations">
      <el-card>
        <template #header>
          <div class="card-header">
            <span>🔧 修复建议</span>
          </div>
        </template>

        <div class="recommendations-content">
          <div v-if="lastReport.criticalIssues > 0" class="critical-fixes">
            <h4>🚨 紧急修复（严重问题）</h4>
            <ul>
              <li v-for="result in getCriticalIssues()" :key="result.check">
                <strong>{{ result.check }}</strong>: {{ result.recommendation || '需要立即修复' }}
              </li>
            </ul>
          </div>

          <div v-if="lastReport.highIssues > 0" class="high-fixes">
            <h4>⚠️ 高优先级修复</h4>
            <ul>
              <li v-for="result in getHighIssues()" :key="result.check">
                <strong>{{ result.check }}</strong>: {{ result.recommendation || '建议尽快修复' }}
              </li>
            </ul>
          </div>

          <div class="general-recommendations">
            <h4>📋 通用建议</h4>
            <ul>
              <li>定期运行安全检查以监控E2EE状态</li>
              <li>确保所有设备都经过验证</li>
              <li>启用密钥备份以防设备丢失</li>
              <li>使用HTTPS连接以确保传输安全</li>
              <li>保持Matrix SDK和依赖库的最新版本</li>
            </ul>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 空状态 -->
    <div v-if="!lastReport && !auditRunning" class="empty-state">
      <el-empty description="点击上方按钮开始安全检查" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Download, InfoFilled } from '@element-plus/icons-vue'
import { useMatrixStore } from '@/stores/matrix'
import { E2ESecurityChecker, type SecurityReport, type SecurityCheckResult } from '@/utils/e2eSecurityChecker'

// Store
const matrixStore = useMatrixStore()

// 响应式数据
const auditRunning = ref(false)
const lastReport = ref<SecurityReport | null>(null)

// 计算属性
const categories = computed(() => {
  if (!lastReport.value) return []
  const cats = [...new Set(lastReport.value.results.map(r => r.category))]
  return cats.sort()
})

const hasIssues = computed(() => {
  if (!lastReport.value) return false
  return lastReport.value.criticalIssues > 0 || 
         lastReport.value.highIssues > 0 || 
         lastReport.value.mediumIssues > 0
})

// 方法
const runSecurityAudit = async () => {
  auditRunning.value = true
  
  try {
    ElMessage.info('开始E2EE安全检查...')
    
    const checker = new E2ESecurityChecker(matrixStore.matrixClient)
    const report = await checker.performSecurityAudit()
    
    lastReport.value = report
    
    // 根据结果显示不同的消息
    if (report.overallStatus === 'critical') {
      ElMessage.error(`发现${report.criticalIssues}个严重安全问题！`)
    } else if (report.overallStatus === 'vulnerable') {
      ElMessage.warning(`发现${report.highIssues}个高风险问题`)
    } else {
      ElMessage.success('安全检查完成，未发现严重问题')
    }
    
  } catch (error: any) {
    console.error('安全检查失败:', error)
    ElMessage.error(`安全检查失败: ${error.message}`)
  } finally {
    auditRunning.value = false
  }
}

const getResultsByCategory = (category: string): SecurityCheckResult[] => {
  if (!lastReport.value) return []
  return lastReport.value.results.filter(r => r.category === category)
}

const getCriticalIssues = (): SecurityCheckResult[] => {
  if (!lastReport.value) return []
  return lastReport.value.results.filter(r => r.severity === 'critical' && r.status === 'fail')
}

const getHighIssues = (): SecurityCheckResult[] => {
  if (!lastReport.value) return []
  return lastReport.value.results.filter(r => r.severity === 'high' && r.status === 'fail')
}

const exportReport = async () => {
  if (!lastReport.value) return
  
  try {
    const reportData = {
      ...lastReport.value,
      exportTime: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    }
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: 'application/json'
    })
    
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `e2ee-security-report-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    ElMessage.success('报告已导出')
  } catch (error) {
    ElMessage.error('导出报告失败')
  }
}

const formatTimestamp = (timestamp: number): string => {
  return new Date(timestamp).toLocaleString('zh-CN')
}

const getStatusIcon = (status: string): string => {
  switch (status) {
    case 'secure': return '✅'
    case 'vulnerable': return '⚠️'
    case 'critical': return '🚨'
    default: return '❓'
  }
}

const getStatusTagType = (status: string): string => {
  switch (status) {
    case 'secure': return 'success'
    case 'vulnerable': return 'warning'
    case 'critical': return 'danger'
    default: return 'info'
  }
}

const getResultIcon = (status: string): string => {
  switch (status) {
    case 'pass': return '✅'
    case 'fail': return '❌'
    case 'warning': return '⚠️'
    case 'unknown': return '❓'
    default: return '❓'
  }
}

const getSeverityTagType = (severity: string): string => {
  switch (severity) {
    case 'critical': return 'danger'
    case 'high': return 'danger'
    case 'medium': return 'warning'
    case 'low': return 'success'
    default: return 'info'
  }
}

// 生命周期
onMounted(() => {
  // 可以在页面加载时自动运行检查
  // runSecurityAudit()
})
</script>

<style scoped>
.security-audit-page {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  margin-bottom: 30px;
}

.page-header h1 {
  font-size: 2.5em;
  margin-bottom: 10px;
  color: #2c3e50;
}

.subtitle {
  font-size: 1.2em;
  color: #7f8c8d;
  margin: 0;
}

.audit-controls {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 30px;
}

.overall-status {
  margin-bottom: 30px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-stats {
  display: flex;
  justify-content: space-around;
  margin: 20px 0;
}

.stat-item {
  text-align: center;
  padding: 15px;
  border-radius: 8px;
  min-width: 80px;
}

.stat-item.critical {
  background: #fef0f0;
  border: 1px solid #fbc4c4;
}

.stat-item.high {
  background: #fdf6ec;
  border: 1px solid #f5dab1;
}

.stat-item.medium {
  background: #fefce8;
  border: 1px solid #fde047;
}

.stat-item.low {
  background: #f0f9ff;
  border: 1px solid #7dd3fc;
}

.stat-number {
  font-size: 2em;
  font-weight: bold;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 0.9em;
  color: #666;
}

.critical-warning {
  margin-top: 20px;
}

.audit-results {
  margin-bottom: 30px;
}

.timestamp {
  font-size: 0.9em;
  color: #999;
}

.category-section {
  margin-bottom: 30px;
}

.category-title {
  font-size: 1.3em;
  margin-bottom: 15px;
  color: #2c3e50;
  border-bottom: 2px solid #ecf0f1;
  padding-bottom: 5px;
}

.category-results {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.result-item {
  padding: 15px;
  border-radius: 8px;
  border-left: 4px solid #ddd;
}

.result-item.pass {
  background: #f0f9ff;
  border-left-color: #10b981;
}

.result-item.fail.critical {
  background: #fef2f2;
  border-left-color: #ef4444;
}

.result-item.fail.high {
  background: #fef2f2;
  border-left-color: #f97316;
}

.result-item.fail.medium {
  background: #fffbeb;
  border-left-color: #f59e0b;
}

.result-item.warning {
  background: #fffbeb;
  border-left-color: #f59e0b;
}

.result-header {
  margin-bottom: 8px;
}

.result-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.result-icon {
  font-size: 1.2em;
}

.result-check {
  font-weight: 500;
  flex: 1;
}

.result-message {
  color: #4b5563;
  margin-bottom: 8px;
}

.result-recommendation {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 10px;
  background: rgba(59, 130, 246, 0.1);
  border-radius: 6px;
  font-size: 0.9em;
  color: #1e40af;
}

.fix-recommendations {
  margin-bottom: 30px;
}

.recommendations-content h4 {
  margin: 20px 0 10px 0;
  color: #2c3e50;
}

.recommendations-content ul {
  margin: 0 0 20px 20px;
}

.recommendations-content li {
  margin-bottom: 8px;
  line-height: 1.5;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
}
</style>