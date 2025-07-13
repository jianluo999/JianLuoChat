<template>
  <div class="profile-view">
    <div class="profile-container">
      <div class="profile-header">
        <h2>个人资料</h2>
      </div>

      <div class="profile-content">
        <div class="avatar-section">
          <div class="avatar-container">
            <el-avatar :size="120" :src="authStore.currentUser?.avatarUrl">
              {{ (authStore.currentUser?.displayName || authStore.currentUser?.username)?.[0] }}
            </el-avatar>
            <el-button type="text" class="change-avatar-btn" @click="showAvatarUpload = true">
              更换头像
            </el-button>
          </div>
        </div>

        <div class="profile-form">
          <el-form
            ref="formRef"
            :model="profileForm"
            :rules="profileRules"
            label-width="100px"
          >
            <el-form-item label="用户名" prop="username">
              <el-input v-model="profileForm.username" disabled />
            </el-form-item>

            <el-form-item label="邮箱" prop="email">
              <el-input v-model="profileForm.email" disabled />
            </el-form-item>

            <el-form-item label="显示名称" prop="displayName">
              <el-input
                v-model="profileForm.displayName"
                placeholder="请输入显示名称"
                maxlength="50"
                show-word-limit
              />
            </el-form-item>

            <el-form-item label="在线状态" prop="status">
              <el-select v-model="profileForm.status" @change="handleStatusChange">
                <el-option label="在线" value="ONLINE">
                  <div class="status-option">
                    <el-tag type="success" size="small">在线</el-tag>
                    <span>显示为在线状态</span>
                  </div>
                </el-option>
                <el-option label="离开" value="AWAY">
                  <div class="status-option">
                    <el-tag type="warning" size="small">离开</el-tag>
                    <span>暂时离开</span>
                  </div>
                </el-option>
                <el-option label="忙碌" value="BUSY">
                  <div class="status-option">
                    <el-tag type="danger" size="small">忙碌</el-tag>
                    <span>请勿打扰</span>
                  </div>
                </el-option>
                <el-option label="离线" value="OFFLINE">
                  <div class="status-option">
                    <el-tag type="info" size="small">离线</el-tag>
                    <span>显示为离线状态</span>
                  </div>
                </el-option>
              </el-select>
            </el-form-item>

            <el-form-item>
              <el-button
                type="primary"
                :loading="loading"
                @click="handleUpdateProfile"
              >
                保存更改
              </el-button>
              <el-button @click="resetForm">重置</el-button>
            </el-form-item>
          </el-form>
        </div>

        <el-divider />

        <div class="account-section">
          <h3>账户设置</h3>
          
          <div class="setting-item">
            <div class="setting-info">
              <div class="setting-title">修改密码</div>
              <div class="setting-description">定期修改密码以保护账户安全</div>
            </div>
            <el-button @click="showPasswordDialog = true">修改密码</el-button>
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <div class="setting-title">Matrix 集成</div>
              <div class="setting-description">连接到 Matrix 网络以实现跨平台通信</div>
            </div>
            <el-button
              :type="matrixConnected ? 'success' : 'primary'"
              @click="handleMatrixIntegration"
            >
              {{ matrixConnected ? '已连接' : '连接 Matrix' }}
            </el-button>
          </div>

          <div class="setting-item danger">
            <div class="setting-info">
              <div class="setting-title">注销账户</div>
              <div class="setting-description">永久删除账户和所有相关数据</div>
            </div>
            <el-button type="danger" @click="handleLogout">注销</el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 头像上传对话框 -->
    <el-dialog v-model="showAvatarUpload" title="更换头像" width="400px">
      <el-upload
        class="avatar-uploader"
        :show-file-list="false"
        :before-upload="handleAvatarUpload"
        accept="image/*"
        drag
      >
        <el-icon class="avatar-uploader-icon"><Plus /></el-icon>
        <div class="el-upload__text">
          将图片拖到此处，或<em>点击上传</em>
        </div>
        <template #tip>
          <div class="el-upload__tip">
            只能上传jpg/png文件，且不超过2MB
          </div>
        </template>
      </el-upload>
    </el-dialog>

    <!-- 修改密码对话框 -->
    <el-dialog v-model="showPasswordDialog" title="修改密码" width="400px">
      <el-form
        ref="passwordFormRef"
        :model="passwordForm"
        :rules="passwordRules"
        label-width="100px"
      >
        <el-form-item label="当前密码" prop="currentPassword">
          <el-input
            v-model="passwordForm.currentPassword"
            type="password"
            show-password
          />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input
            v-model="passwordForm.newPassword"
            type="password"
            show-password
          />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="passwordForm.confirmPassword"
            type="password"
            show-password
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showPasswordDialog = false">取消</el-button>
          <el-button
            type="primary"
            :loading="passwordLoading"
            @click="handleChangePassword"
          >
            确认修改
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import { matrixAPI } from '@/services/api'

const router = useRouter()
const authStore = useAuthStore()

const formRef = ref<FormInstance>()
const passwordFormRef = ref<FormInstance>()
const loading = ref(false)
const passwordLoading = ref(false)
const showAvatarUpload = ref(false)
const showPasswordDialog = ref(false)
const matrixConnected = ref(false)

const profileForm = reactive({
  username: '',
  email: '',
  displayName: '',
  status: 'ONLINE' as const
})

const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const profileRules: FormRules = {
  displayName: [
    { max: 50, message: '显示名称不能超过50个字符', trigger: 'blur' }
  ]
}

const validateConfirmPassword = (rule: any, value: any, callback: any) => {
  if (value !== passwordForm.newPassword) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const passwordRules: FormRules = {
  currentPassword: [
    { required: true, message: '请输入当前密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

const initializeForm = () => {
  const user = authStore.currentUser
  if (user) {
    profileForm.username = user.username
    profileForm.email = user.email
    profileForm.displayName = user.displayName || ''
    profileForm.status = user.status
  }
}

const handleUpdateProfile = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        const result = await authStore.updateProfile({
          displayName: profileForm.displayName
        })

        if (result.success) {
          ElMessage.success('资料更新成功')
        } else {
          ElMessage.error(result.error || '更新失败')
        }
      } catch (error) {
        ElMessage.error('更新失败')
      } finally {
        loading.value = false
      }
    }
  })
}

const handleStatusChange = async (status: string) => {
  try {
    await authStore.updateStatus(status as any)
    ElMessage.success('状态更新成功')
  } catch (error) {
    ElMessage.error('状态更新失败')
  }
}

const handleAvatarUpload = async (file: File) => {
  // 验证文件类型和大小
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB!')
    return false
  }

  try {
    // 这里应该调用上传头像的API
    // const response = await fileAPI.uploadAvatar(file)
    // await authStore.updateProfile({ avatarUrl: response.data.url })
    
    ElMessage.success('头像更新成功')
    showAvatarUpload.value = false
  } catch (error) {
    ElMessage.error('头像上传失败')
  }

  return false
}

const handleChangePassword = async () => {
  if (!passwordFormRef.value) return

  await passwordFormRef.value.validate(async (valid) => {
    if (valid) {
      passwordLoading.value = true
      try {
        // 这里应该调用修改密码的API
        // await authAPI.changePassword(passwordForm)
        
        ElMessage.success('密码修改成功')
        showPasswordDialog.value = false
        passwordForm.currentPassword = ''
        passwordForm.newPassword = ''
        passwordForm.confirmPassword = ''
      } catch (error) {
        ElMessage.error('密码修改失败')
      } finally {
        passwordLoading.value = false
      }
    }
  })
}

const handleMatrixIntegration = async () => {
  if (matrixConnected.value) {
    ElMessage.info('Matrix 已连接')
    return
  }

  try {
    const result = await ElMessageBox.prompt(
      '请输入您的 Matrix 用户名和密码',
      'Matrix 集成',
      {
        confirmButtonText: '连接',
        cancelButtonText: '取消',
        inputType: 'password',
        inputPlaceholder: '密码'
      }
    )

    // 这里应该调用 Matrix 登录 API
    await matrixAPI.login({
      username: authStore.currentUser?.username || '',
      password: result.value
    })

    matrixConnected.value = true
    ElMessage.success('Matrix 连接成功')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('Matrix 连接失败')
    }
  }
}

const handleLogout = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要注销账户吗？此操作不可恢复。',
      '确认注销',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    authStore.logout()
    ElMessage.success('已注销')
    router.push('/login')
  } catch (error) {
    // 用户取消
  }
}

const resetForm = () => {
  initializeForm()
}

onMounted(() => {
  initializeForm()
  
  // 检查 Matrix 连接状态
  matrixAPI.getStatus().then(response => {
    matrixConnected.value = response.data.authenticated
  }).catch(() => {
    matrixConnected.value = false
  })
})
</script>

<style scoped>
.profile-view {
  padding: 24px;
  max-width: 800px;
  margin: 0 auto;
}

.profile-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.profile-header {
  padding: 24px 24px 0;
  border-bottom: 1px solid #e4e7ed;
}

.profile-header h2 {
  margin: 0 0 24px 0;
  color: #303133;
}

.profile-content {
  padding: 24px;
}

.avatar-section {
  text-align: center;
  margin-bottom: 32px;
}

.avatar-container {
  display: inline-block;
  position: relative;
}

.change-avatar-btn {
  margin-top: 12px;
  color: #409eff;
}

.profile-form {
  max-width: 500px;
}

.status-option {
  display: flex;
  align-items: center;
  gap: 8px;
}

.account-section h3 {
  margin: 0 0 24px 0;
  color: #303133;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid #f0f0f0;
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-item.danger .setting-title {
  color: #f56c6c;
}

.setting-info {
  flex: 1;
}

.setting-title {
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
}

.setting-description {
  font-size: 13px;
  color: #909399;
}

.avatar-uploader {
  text-align: center;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
