<template>
  <el-dialog
    v-model="dialogVisible"
    title="创建聊天室"
    width="500px"
    :before-close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="80px"
    >
      <el-form-item label="房间名称" prop="name">
        <el-input
          v-model="form.name"
          placeholder="请输入房间名称"
          maxlength="50"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="房间类型" prop="type">
        <el-radio-group v-model="form.type">
          <el-radio value="group">群聊</el-radio>
          <el-radio value="direct">私聊</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="房间描述" prop="description">
        <el-input
          v-model="form.description"
          type="textarea"
          :rows="3"
          placeholder="请输入房间描述（可选）"
          maxlength="200"
          show-word-limit
        />
      </el-form-item>

      <el-form-item v-if="form.type === 'group'" label="邀请成员">
        <el-select
          v-model="form.members"
          multiple
          filterable
          remote
          reserve-keyword
          placeholder="搜索并选择用户"
          :remote-method="searchUsers"
          :loading="searchLoading"
          style="width: 100%"
        >
          <el-option
            v-for="user in userOptions"
            :key="user.id"
            :label="user.displayName || user.username"
            :value="user.username"
          >
            <div class="user-option">
              <el-avatar :size="24" :src="user.avatarUrl">
                {{ (user.displayName || user.username)[0] }}
              </el-avatar>
              <div class="user-info">
                <div class="user-name">{{ user.displayName || user.username }}</div>
                <div class="user-email">{{ user.email }}</div>
              </div>
            </div>
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="房间设置">
        <el-checkbox v-model="form.isPublic">公开房间</el-checkbox>
        <div class="setting-description">
          公开房间可以被其他用户搜索和加入
        </div>
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button
          type="primary"
          :loading="loading"
          @click="handleCreate"
        >
          创建
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { useChatStore } from '@/stores/chat'
import { userAPI } from '@/services/api'

interface Props {
  modelValue: boolean
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'created', room: any): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const chatStore = useChatStore()

const dialogVisible = ref(false)
const formRef = ref<FormInstance>()
const loading = ref(false)
const searchLoading = ref(false)
const userOptions = ref<any[]>([])

const form = reactive({
  name: '',
  type: 'group' as 'group' | 'direct',
  description: '',
  members: [] as string[],
  isPublic: false
})

const rules: FormRules = {
  name: [
    { required: true, message: '请输入房间名称', trigger: 'blur' },
    { min: 2, max: 50, message: '房间名称长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择房间类型', trigger: 'change' }
  ]
}

watch(() => props.modelValue, (val) => {
  dialogVisible.value = val
})

watch(dialogVisible, (val) => {
  emit('update:modelValue', val)
  if (!val) {
    resetForm()
  }
})

const searchUsers = async (query: string) => {
  if (!query) {
    userOptions.value = []
    return
  }

  searchLoading.value = true
  try {
    const response = await userAPI.searchUsers(query)
    userOptions.value = response.data
  } catch (error) {
    ElMessage.error('搜索用户失败')
  } finally {
    searchLoading.value = false
  }
}

const handleCreate = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        const result = await chatStore.createRoom(
          form.name,
          form.type,
          form.members
        )

        if (result.success) {
          ElMessage.success('房间创建成功')
          emit('created', result.room)
          handleClose()
        } else {
          ElMessage.error(result.error || '创建房间失败')
        }
      } catch (error) {
        ElMessage.error('创建房间失败')
      } finally {
        loading.value = false
      }
    }
  })
}

const handleClose = () => {
  dialogVisible.value = false
}

const resetForm = () => {
  form.name = ''
  form.type = 'group'
  form.description = ''
  form.members = []
  form.isPublic = false
  userOptions.value = []
  
  if (formRef.value) {
    formRef.value.resetFields()
  }
}
</script>

<style scoped>
.user-option {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-info {
  flex: 1;
}

.user-name {
  font-weight: 500;
  color: #303133;
}

.user-email {
  font-size: 12px;
  color: #909399;
}

.setting-description {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
