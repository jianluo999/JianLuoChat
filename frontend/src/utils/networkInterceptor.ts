/**
 * 网络请求拦截器
 * 统一处理网络错误，特别是APM监控错误的静默处理
 */

import { errorHandler } from './errorHandler'

/**
 * 设置全局网络错误拦截
 */
export function setupNetworkInterceptor(): void {
  // 拦截fetch请求
  const originalFetch = window.fetch
  window.fetch = async function(...args: Parameters<typeof fetch>) {
    try {
      const response = await originalFetch.apply(this, args)
      
      // 检查响应状态
      if (!response.ok) {
        const url = typeof args[0] === 'string' ? args[0] : args[0].url
        
        // 如果是APM相关请求失败，静默处理
        if (isAPMUrl(url)) {
          console.debug('🔇 APM request failed (silenced):', url, response.status)
          return response // 返回响应，不抛出错误
        }
        
        // 其他网络错误正常处理
        errorHandler.handleNetworkError({
          url,
          status: response.status,
          statusText: response.statusText,
          method: (args[1]?.method || 'GET').toUpperCase(),
          message: `HTTP ${response.status}: ${response.statusText}`,
          retryCount: 0,
          isTimeout: false
        })
      }
      
      return response
    } catch (error: any) {
      const url = typeof args[0] === 'string' ? args[0] : args[0].url
      
      // 如果是APM相关请求错误，静默处理
      if (isAPMUrl(url)) {
        console.debug('🔇 APM request error (silenced):', url, error.message)
        // 返回一个模拟的失败响应，而不是抛出错误
        return new Response(null, { 
          status: 0, 
          statusText: 'APM Service Unavailable (Silenced)' 
        })
      }
      
      // 其他网络错误正常处理
      errorHandler.handleNetworkError({
        url,
        status: 0,
        statusText: error.name || 'Network Error',
        method: (args[1]?.method || 'GET').toUpperCase(),
        message: error.message || 'Network request failed',
        retryCount: 0,
        isTimeout: error.name === 'AbortError' || error.message.includes('timeout')
      })
      
      throw error
    }
  }

  // 拦截XMLHttpRequest
  const originalXHROpen = XMLHttpRequest.prototype.open
  const originalXHRSend = XMLHttpRequest.prototype.send

  XMLHttpRequest.prototype.open = function(method: string, url: string | URL, ...args: any[]) {
    this._url = url.toString()
    this._method = method.toUpperCase()
    return originalXHROpen.apply(this, [method, url, ...args])
  }

  XMLHttpRequest.prototype.send = function(body?: any) {
    const xhr = this
    const url = xhr._url || ''
    const method = xhr._method || 'GET'

    // 设置错误处理
    const originalOnError = xhr.onerror
    const originalOnTimeout = xhr.ontimeout
    const originalOnLoad = xhr.onload

    xhr.onerror = function(event) {
      // 如果是APM相关请求错误，静默处理
      if (isAPMUrl(url)) {
        console.debug('🔇 APM XHR error (silenced):', url)
        return
      }

      errorHandler.handleNetworkError({
        url,
        status: xhr.status,
        statusText: xhr.statusText,
        method,
        message: 'XMLHttpRequest failed',
        retryCount: 0,
        isTimeout: false
      })

      if (originalOnError) {
        originalOnError.call(xhr, event)
      }
    }

    xhr.ontimeout = function(event) {
      // 如果是APM相关请求超时，静默处理
      if (isAPMUrl(url)) {
        console.debug('🔇 APM XHR timeout (silenced):', url)
        return
      }

      errorHandler.handleNetworkError({
        url,
        status: xhr.status,
        statusText: 'Timeout',
        method,
        message: 'XMLHttpRequest timeout',
        retryCount: 0,
        isTimeout: true
      })

      if (originalOnTimeout) {
        originalOnTimeout.call(xhr, event)
      }
    }

    xhr.onload = function(event) {
      // 检查HTTP错误状态
      if (xhr.status >= 400) {
        // 如果是APM相关请求错误，静默处理
        if (isAPMUrl(url)) {
          console.debug('🔇 APM XHR HTTP error (silenced):', url, xhr.status)
        } else {
          errorHandler.handleNetworkError({
            url,
            status: xhr.status,
            statusText: xhr.statusText,
            method,
            message: `HTTP ${xhr.status}: ${xhr.statusText}`,
            retryCount: 0,
            isTimeout: false
          })
        }
      }

      if (originalOnLoad) {
        originalOnLoad.call(xhr, event)
      }
    }

    return originalXHRSend.apply(this, [body])
  }
}

/**
 * 判断是否为APM相关的URL
 */
function isAPMUrl(url: string): boolean {
  const apmPatterns = [
    'apm-volcano.zuoyebang.com',
    'monitor_web/collect',
    '/settings/get/webpro',
    'apmInject',
    'aegisInject'
  ]

  return apmPatterns.some(pattern => url.includes(pattern))
}

/**
 * 创建一个安全的网络请求包装器
 */
export async function safeNetworkRequest<T>(
  requestFn: () => Promise<T>,
  context?: string
): Promise<T | null> {
  try {
    return await requestFn()
  } catch (error: any) {
    // 如果是APM相关错误，静默处理并返回null
    if (error.message && (
      error.message.includes('apm-volcano') ||
      error.message.includes('monitor_web') ||
      error.message.includes('ERR_CONNECTION_CLOSED')
    )) {
      console.debug('🔇 Network request silenced:', context, error.message)
      return null
    }

    // 其他错误正常抛出
    throw error
  }
}

// 声明全局类型扩展
declare global {
  interface XMLHttpRequest {
    _url?: string
    _method?: string
  }
}