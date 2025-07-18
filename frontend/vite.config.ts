import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    // 配置MIME类型以支持WebAssembly
    headers: {
      'Cross-Origin-Embedder-Policy': 'credentialless',
      'Cross-Origin-Opener-Policy': 'same-origin',
    },
    // 配置静态文件服务
    fs: {
      allow: ['..']
    },
    // 配置中间件来处理WASM文件
    middlewareMode: false,
  },
  // 优化配置
  optimizeDeps: {
    exclude: ['@matrix-org/matrix-sdk-crypto-wasm'],
    include: ['matrix-js-sdk']
  },
  // 构建配置
  build: {
    target: 'esnext',
    rollupOptions: {
      output: {
        // 确保WASM文件被正确处理
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith('.wasm')) {
            return 'assets/[name]-[hash][extname]'
          }
          return 'assets/[name]-[hash][extname]'
        }
      }
    }
  },
  // 定义全局变量
  define: {
    global: 'globalThis',
  },
  // Worker配置
  worker: {
    format: 'es'
  }
})
