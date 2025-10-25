import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  
  resolve: {
    alias: {
      '@': resolve(__dirname, 'frontend/src')
    }
  },
  
  server: {
    port: 5173,
    host: true,
    
    // 代理配置 - 解决开发环境跨域问题
    proxy: {
      // 代理日志上报请求
      '/log': {
        target: 'https://nlog.daxuesoutijiang.com',
        changeOrigin: true,
        secure: true,
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('🔇 日志代理错误 (已静默):', err.message)
          })
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('📊 代理日志请求:', req.url)
          })
        }
      },
      
      // 代理APM监控请求
      '/apm': {
        target: 'https://apm-volcano.zuoyebang.com',
        changeOrigin: true,
        secure: true,
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('🔇 APM代理错误 (已静默):', err.message)
          })
        }
      }
    }
  },
  
  build: {
    outDir: 'dist',
    sourcemap: true,
    
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router', 'pinia'],
          analytics: ['./frontend/src/utils/analytics.ts', './frontend/src/utils/logReportHandler.ts']
        }
      }
    }
  },
  
  define: {
    // 环境变量
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
    __LOG_REPORT_ENABLED__: JSON.stringify(process.env.NODE_ENV === 'production')
  }
})