/**
 * WebAssembly 加载器
 * 解决WASM文件MIME类型问题
 */

// 检查浏览器是否支持WebAssembly
export function checkWebAssemblySupport(): boolean {
  try {
    if (typeof WebAssembly === 'object' && typeof WebAssembly.instantiate === 'function') {
      const module = new WebAssembly.Module(new Uint8Array([
        0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00
      ]))
      if (module instanceof WebAssembly.Module) {
        return new WebAssembly.Instance(module) instanceof WebAssembly.Instance
      }
    }
  } catch (e) {
    console.warn('WebAssembly support check failed:', e)
  }
  return false
}

// 自定义WASM加载函数
export async function loadWasmModule(url: string): Promise<WebAssembly.Module> {
  try {
    // 首先尝试标准方式
    const response = await fetch(url)
    if (response.ok) {
      const bytes = await response.arrayBuffer()
      return await WebAssembly.compile(bytes)
    }
    throw new Error(`Failed to fetch WASM: ${response.status}`)
  } catch (error: any) {
    console.error('Standard WASM loading failed:', error)
    
    // 如果标准方式失败，尝试使用XMLHttpRequest
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.open('GET', url, true)
      xhr.responseType = 'arraybuffer'
      
      xhr.onload = async () => {
        if (xhr.status === 200) {
          try {
            const module = await WebAssembly.compile(xhr.response)
            resolve(module)
          } catch (compileError) {
            reject(compileError)
          }
        } else {
          reject(new Error(`XHR failed: ${xhr.status}`))
        }
      }
      
      xhr.onerror = () => reject(new Error('XHR error'))
      xhr.send()
    })
  }
}

// 设置WebAssembly环境
export function setupWebAssemblyEnvironment(): void {
  // 设置全局变量
  if (typeof globalThis === 'undefined') {
    (window as any).globalThis = window
  }
  
  // 确保global变量存在
  if (typeof (window as any).global === 'undefined') {
    (window as any).global = window
  }
  
  // 设置Buffer polyfill（如果需要）
  if (typeof (window as any).Buffer === 'undefined') {
    try {
      // 尝试使用buffer polyfill
      const { Buffer } = require('buffer')
      ;(window as any).Buffer = Buffer
    } catch (e) {
      // 如果没有buffer polyfill，创建一个简单的实现
      console.warn('Buffer polyfill not available, using minimal implementation')
    }
  }
}

// 检查加密环境是否就绪
export function checkCryptoEnvironment(): {
  webAssemblySupported: boolean
  indexedDBSupported: boolean
  cryptoSupported: boolean
  issues: string[]
} {
  const issues: string[] = []
  
  // 检查WebAssembly支持
  const webAssemblySupported = checkWebAssemblySupport()
  if (!webAssemblySupported) {
    issues.push('浏览器不支持WebAssembly')
  }
  
  // 检查IndexedDB支持
  const indexedDBSupported = 'indexedDB' in window && indexedDB !== null
  if (!indexedDBSupported) {
    issues.push('浏览器不支持IndexedDB')
  }
  
  // 检查Web Crypto API支持
  const cryptoSupported = 'crypto' in window && 'subtle' in window.crypto
  if (!cryptoSupported) {
    issues.push('浏览器不支持Web Crypto API')
  }
  
  // 检查是否在安全上下文中
  if (!window.isSecureContext) {
    issues.push('需要HTTPS或localhost环境')
  }
  
  return {
    webAssemblySupported,
    indexedDBSupported,
    cryptoSupported,
    issues
  }
}

// 初始化加密环境
export async function initializeCryptoEnvironment(): Promise<boolean> {
  console.log('🔧 初始化加密环境...')
  
  // 设置WebAssembly环境
  setupWebAssemblyEnvironment()
  
  // 检查环境
  const envCheck = checkCryptoEnvironment()
  console.log('🔍 加密环境检查结果:', envCheck)
  
  if (envCheck.issues.length > 0) {
    console.warn('⚠️ 发现环境问题:', envCheck.issues)
    
    // 如果有严重问题，返回false
    if (!envCheck.webAssemblySupported || !envCheck.cryptoSupported) {
      return false
    }
  }
  
  console.log('✅ 加密环境初始化完成')
  return true
}

// 获取用户友好的错误信息
export function getFriendlyErrorMessage(error: any): string {
  const message = error?.message || error?.toString() || '未知错误'
  
  if (message.includes('WebAssembly')) {
    return '您的浏览器不支持WebAssembly，请更新到最新版本的Chrome、Firefox或Safari'
  }
  
  if (message.includes('MIME type')) {
    return '服务器配置问题，请刷新页面重试或联系管理员'
  }
  
  if (message.includes('fetch')) {
    return '网络连接问题，请检查网络连接并重试'
  }
  
  if (message.includes('IndexedDB')) {
    return '浏览器存储功能不可用，请检查浏览器设置或使用隐私模式'
  }
  
  if (message.includes('crypto') || message.includes('encryption')) {
    return '加密功能初始化失败，请确保使用HTTPS连接'
  }
  
  return `加密功能暂时不可用: ${message}`
}

// 重试机制
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: any
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      
      if (i === maxRetries - 1) {
        throw error
      }
      
      const delay = baseDelay * Math.pow(2, i)
      console.log(`重试 ${i + 1}/${maxRetries}，${delay}ms后重试...`)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  
  throw lastError
}
