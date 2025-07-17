import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import i18n from './i18n'

import App from './App.vue'
import router from './router'

// 全局错误处理 - 忽略第三方脚本错误
window.addEventListener('error', (event) => {
  // 忽略来自第三方域名的错误
  if (event.filename && (
    event.filename.includes('apm-volcano.zuoyebang.com') ||
    event.filename.includes('apmInject') ||
    event.message?.includes('Could not establish connection')
  )) {
    event.preventDefault()
    return false
  }
})

// 处理未捕获的Promise错误
window.addEventListener('unhandledrejection', (event) => {
  // 忽略第三方监控相关的错误
  if (event.reason?.message?.includes('Could not establish connection') ||
      event.reason?.message?.includes('apm-volcano') ||
      event.reason?.message?.includes('message channel closed')) {
    event.preventDefault()
    return false
  }
})

const app = createApp(App)

// Register Element Plus icons
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(createPinia())
app.use(router)
app.use(ElementPlus)
app.use(i18n)

app.mount('#app')
