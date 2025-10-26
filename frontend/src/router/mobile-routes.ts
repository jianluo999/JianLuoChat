import { createRouter, createWebHistory } from 'vue-router'
import MobileLogin from '../pages/MobileLogin.vue'
import MobileMessageList from '../components/MobileMessageList.vue'
import MobileRoomList from '../components/MobileRoomList.vue'

const mobileRoutes = [
  {
    path: '/mobile/login',
    name: 'mobile-login',
    component: MobileLogin,
    meta: { title: '微信登录' }
  },
  {
    path: '/mobile/chat',
    name: 'mobile-chat',
    component: MobileMessageList,
    meta: { title: '聊天', showTabBar: true }
  },
  {
    path: '/mobile/rooms',
    name: 'mobile-rooms',
    component: MobileRoomList,
    meta: { title: '群聊', showTabBar: true }
  },
  {
    path: '/mobile/contacts',
    name: 'mobile-contacts',
    component: () => import('../components/MobileContacts.vue'),
    meta: { title: '通讯录', showTabBar: true }
  },
  {
    path: '/mobile/discovery',
    name: 'mobile-discovery',
    component: () => import('../components/MobileDiscovery.vue'),
    meta: { title: '发现', showTabBar: true }
  }
]

const mobileRouter = createRouter({
  history: createWebHistory(),
  routes: mobileRoutes
})

export default mobileRouter