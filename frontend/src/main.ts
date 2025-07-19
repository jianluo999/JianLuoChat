import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import i18n from './i18n'

import App from './App.vue'
import router from './router'

// 导入错误处理系统
import { initializeErrorHandling, setupVueErrorHandling } from './utils/errorSetup'

// 初始化错误处理系统
initializeErrorHandling()

const app = createApp(App)

// 设置Vue应用的错误处理
setupVueErrorHandling(app)

// Register Element Plus icons
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(createPinia())
app.use(router)
app.use(ElementPlus)
app.use(i18n)

app.mount('#app')
