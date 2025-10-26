<template>
  <div class="mobile-tab-bar">
    <div
      v-for="tab in tabs"
      :key="tab.name"
      class="tab-item"
      :class="{ active: activeTab === tab.name }"
      @click="switchTab(tab.name)"
    >
      <div class="tab-icon">
        <component :is="tab.icon" :class="tab.iconClass" />
      </div>
      <div class="tab-label">{{ tab.label }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ChatIcon from './icons/ChatIcon.vue'
import GroupIcon from './icons/GroupIcon.vue'
import ContactsIcon from './icons/ContactsIcon.vue'
import DiscoverIcon from './icons/DiscoverIcon.vue'

const router = useRouter()
const route = useRoute()

// 注册图标组件（直接使用组件对象，而不是字符串名）
const icons = {
  ChatIcon,
  GroupIcon,
  ContactsIcon,
  DiscoverIcon
}

// 定义标签栏配置：注意这里 icon 字段应直接引用组件，而不是字符串
const tabs = [
  {
    name: 'chat',
    label: '聊天',
    icon: ChatIcon, // 👈 直接传组件，不是字符串
    iconClass: 'tab-icon-chat'
  },
  {
    name: 'rooms',
    label: '群聊',
    icon: GroupIcon,
    iconClass: 'tab-icon-rooms'
  },
  {
    name: 'contacts',
    label: '通讯录',
    icon: ContactsIcon,
    iconClass: 'tab-icon-contacts'
  },
  {
    name: 'discovery',
    label: '发现',
    icon: DiscoverIcon,
    iconClass: 'tab-icon-discovery'
  }
]

// 当前激活的标签
const activeTab = ref('chat')

// 监听路由变化
watch(
  () => route.name,
  (newName) => {
    if (newName && tabs.some(tab => tab.name === newName)) {
      activeTab.value = newName as string
    }
  },
  { immediate: true }
)

// 切换标签
const switchTab = (tabName: string) => {
  if (activeTab.value !== tabName) {
    activeTab.value = tabName
    router.push({ name: tabName })
  }
}
</script>

<style scoped>
/* 你的样式保持不变 */
.mobile-tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: #ffffff;
  border-top: 1px solid #e8e8e8;
  display: flex;
  align-items: center;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

/* ...其余样式省略... */
</style>