/**
 * 被动事件管理器
 * 解决非被动事件监听器导致的性能问题
 * 优化版本：减少内存占用，提高执行效率
 */

import { errorHandler } from './errorHandler'

interface EventListenerInfo {
  element: Element | Window | Document
  event: string
  handler: EventListener
  options: AddEventListenerOptions
  isPassive: boolean
  originalHandler: EventListener // 保存原始处理器用于清理
}

class PassiveEventManager {
  private listeners: Map<string, EventListenerInfo> = new Map()
  private throttledHandlers: Map<string, EventListener> = new Map()
  private hasShownOptimizationWarning = false
  private lastReportedFPS?: number
  private debouncedHandlers: Map<string, EventListener> = new Map()
  private isMonitoring: boolean = false

  /**
   * 添加被动事件监听器（优化版本）
   */
  addPassiveListener(
    element: Element | Window | Document,
    event: string,
    handler: EventListener,
    options: AddEventListenerOptions = {}
  ): void {
    const listenerId = this.generateListenerId(element, event, handler)
    
    // 检查是否已存在相同的监听器
    if (this.listeners.has(listenerId)) {
      return // 避免重复添加
    }
    
    // 强制设置为被动模式
    const passiveOptions: AddEventListenerOptions = {
      ...options,
      passive: true
    }

    // 如果是滚动相关事件，添加性能优化
    const optimizedHandler = this.optimizeScrollHandler(event, handler)

    try {
      element.addEventListener(event, optimizedHandler, passiveOptions)
      
      this.listeners.set(listenerId, {
        element,
        event,
        handler: optimizedHandler,
        options: passiveOptions,
        isPassive: true,
        originalHandler: handler // 保存原始处理器
      })

      if (import.meta.env.DEV) {
        console.debug(`✅ Added passive listener for ${event}`)
      }
    } catch (error) {
      console.error('Failed to add passive listener:', error)
      errorHandler.handlePerformanceError({
        message: `Failed to add passive listener for ${event}`,
        metric: 'scroll_jank',
        value: 0,
        threshold: 0,
        context: { event, error }
      })
    }
  }

  /**
   * 移除被动事件监听器（优化版本）
   */
  removePassiveListener(
    element: Element | Window | Document,
    event: string,
    handler: EventListener
  ): void {
    const listenerId = this.generateListenerId(element, event, handler)
    const listenerInfo = this.listeners.get(listenerId)

    if (listenerInfo) {
      try {
        // 使用原始处理器进行移除，确保正确清理
        element.removeEventListener(event, listenerInfo.originalHandler, listenerInfo.options)
        this.listeners.delete(listenerId)
        
        // 清理优化的处理器
        this.throttledHandlers.delete(listenerId)
        this.debouncedHandlers.delete(listenerId)

        if (import.meta.env.DEV) {
          console.debug(`✅ Removed passive listener for ${event}`)
        }
      } catch (error) {
        console.error('Failed to remove passive listener:', error)
      }
    }
  }

  /**
   * 优化滚动事件处理器（性能优化版本）
   */
  private optimizeScrollHandler(event: string, handler: EventListener): EventListener {
    const scrollEvents = ['scroll', 'wheel', 'touchmove', 'mousemove']
    
    if (!scrollEvents.includes(event)) {
      return handler
    }

    // 使用更高效的节流优化滚动事件
    return this.throttle(handler, 16) // 约60fps
  }

  /**
   * 高性能节流函数（优化版本）
   */
  private throttle(func: EventListener, delay: number): EventListener {
    let lastCall = 0
    let timeoutId: number | null = null
    let isQueued = false

    return function(this: any, event: Event) {
      const now = Date.now()
      
      if (now - lastCall >= delay) {
        lastCall = now
        func.call(this, event)
        isQueued = false
      } else if (!isQueued) {
        isQueued = true
        timeoutId = window.setTimeout(() => {
          lastCall = Date.now()
          func.call(this, event)
          timeoutId = null
          isQueued = false
        }, delay - (now - lastCall))
      }
    }
  }

  /**
   * 高性能防抖函数（优化版本）
   */
  private debounce(func: EventListener, delay: number): EventListener {
    let timeoutId: number | null = null

    return function(this: any, event: Event) {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      
      timeoutId = window.setTimeout(() => {
        func.call(this, event)
        timeoutId = null
      }, delay)
    }
  }

  /**
   * 添加节流事件监听器（优化版本）
   */
  addThrottledListener(
    element: Element | Window | Document,
    event: string,
    handler: EventListener,
    delay: number = 16,
    options: AddEventListenerOptions = {}
  ): void {
    const listenerId = this.generateListenerId(element, event, handler)
    
    // 检查是否已存在
    if (this.throttledHandlers.has(listenerId)) {
      return
    }
    
    const throttledHandler = this.throttle(handler, delay)
    
    this.throttledHandlers.set(listenerId, throttledHandler)
    this.addPassiveListener(element, event, throttledHandler, options)
  }

  /**
   * 添加防抖事件监听器（优化版本）
   */
  addDebouncedListener(
    element: Element | Window | Document,
    event: string,
    handler: EventListener,
    delay: number = 300,
    options: AddEventListenerOptions = {}
  ): void {
    const listenerId = this.generateListenerId(element, event, handler)
    
    // 检查是否已存在
    if (this.debouncedHandlers.has(listenerId)) {
      return
    }
    
    const debouncedHandler = this.debounce(handler, delay)
    
    this.debouncedHandlers.set(listenerId, debouncedHandler)
    this.addPassiveListener(element, event, debouncedHandler, options)
  }

  /**
   * 自动检测并转换现有的非被动监听器（优化版本）
   */
  optimizeExistingListeners(): void {
    if (import.meta.env.DEV) {
      console.log('🔍 检测非被动事件监听器...')
    }
    
    // 针对Element Plus等第三方组件库的wheel事件监听器
    // 我们需要主动干预来添加被动模式
    this.patchElementPlusWheelListeners()
    
    const problematicEvents = ['wheel', 'touchstart', 'touchmove', 'scroll']
    
    // 只在首次加载时显示一次警告，避免重复日志
    if (import.meta.env.DEV && !this.hasShownOptimizationWarning) {
      console.group('🔍 事件监听器优化检查')
      problematicEvents.forEach(eventType => {
        console.warn(`⚠️ 建议检查 ${eventType} 事件监听器是否使用了被动模式`)
      })
      console.groupEnd()
      this.hasShownOptimizationWarning = true
    }
  }

  /**
   * 修补Element Plus的wheel事件监听器（性能优化版本）
   * Element Plus的ElTable和ElScrollbar组件使用了非被动的wheel监听器
   */
  private patchElementPlusWheelListeners(): void {
    // 使用MutationObserver监控DOM变化，当Element Plus组件被添加时进行修补
    if (typeof MutationObserver !== 'undefined') {
      const observer = new MutationObserver((mutations) => {
        // 批量处理mutations以提高性能
        const elementsToPatch: Element[] = []
        
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element
              if (this.isElementPlusScrollComponent(element)) {
                elementsToPatch.push(element)
              }
              
              // 递归检查子元素
              const children = element.querySelectorAll('*')
              children.forEach(child => {
                if (this.isElementPlusScrollComponent(child)) {
                  elementsToPatch.push(child)
                }
              })
            }
          })
        })
        
        // 批量修补元素
        elementsToPatch.forEach(element => this.patchElementWheelListeners(element))
      })

      observer.observe(document.body, {
        childList: true,
        subtree: true
      })

      // 立即检查现有的元素
      this.patchExistingElementPlusComponents()
    }
  }

  /**
   * 检查是否是Element Plus滚动组件
   */
  private isElementPlusScrollComponent(element: Element): boolean {
    return element.classList.contains('el-table') ||
           element.classList.contains('el-scrollbar') ||
           element.classList.contains('el-dialog') ||
           element.getAttribute('data-v-')?.includes('el-')
  }

  /**
   * 批量修补现有Element Plus组件
   */
  private patchExistingElementPlusComponents(): void {
    const elements = document.querySelectorAll('*')
    const elementPlusElements: Element[] = []
    
    elements.forEach(element => {
      if (this.isElementPlusScrollComponent(element)) {
        elementPlusElements.push(element)
      }
    })
    
    elementPlusElements.forEach(element => this.patchElementWheelListeners(element))
  }

  /**
   * 为单个元素修补wheel事件监听器（优化版本）
   */
  private patchElementWheelListeners(element: Element): void {
    // 检查是否是Element Plus的滚动相关组件
    if (!this.isElementPlusScrollComponent(element) || !element.addEventListener) {
      return
    }
    
    // 检查是否已经被修补过
    if (element.hasAttribute('data-passive-patched')) {
      return
    }

    // 重写addEventListener方法来强制使用被动模式
    const originalAddEventListener = element.addEventListener.bind(element)
    
    element.addEventListener = (type: string, listener: EventListenerOrEventListenerObject, options?: AddEventListenerOptions) => {
      if (type === 'wheel' && typeof options === 'object' && options.passive === false) {
        if (import.meta.env.DEV) {
          console.debug(`🔧 修补Element Plus wheel监听器: ${element.className}`)
        }
        // 强制使用被动模式
        return originalAddEventListener(type, listener, { ...options, passive: true })
      }
      return originalAddEventListener(type, listener, options)
    }
    
    // 标记为已修补
    element.setAttribute('data-passive-patched', 'true')
  }

  /**
   * 监控滚动性能（优化版本）
   */
  monitorScrollPerformance(): void {
    if (this.isMonitoring) {
      return // 避免重复启动监控
    }
    
    this.isMonitoring = true
    
    let frameCount = 0
    let lastTime = performance.now()
    let jankCount = 0
    let lastFPS = 60

    const measureFPS = () => {
      const currentTime = performance.now()
      const deltaTime = currentTime - lastTime
      
      frameCount++
      
      // 每秒计算一次FPS
      if (deltaTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / deltaTime)
        frameCount = 0
        lastTime = currentTime
        lastFPS = fps
        
        // 如果FPS低于30，认为是严重性能问题（提高阈值减少噪音）
        if (fps < 30) {
          jankCount++
          
          // 限制FPS报告频率，避免过多日志
          if (jankCount <= 5 || jankCount % 10 === 0) {
            errorHandler.handlePerformanceError({
              message: `Low FPS detected: ${fps}`,
              metric: 'scroll_jank',
              value: fps,
              threshold: 30,
              context: {
                jankCount,
                timestamp: currentTime
              }
            })
          }
        }
        
        // 只在开发环境且FPS变化较大时输出日志
        if (import.meta.env.DEV && Math.abs(fps - (this.lastReportedFPS || fps)) > 10) {
          console.debug(`📊 FPS: ${fps}, Jank Count: ${jankCount}`)
          this.lastReportedFPS = fps
        }
      }
      
      // 使用requestIdleCallback进行非关键性能监控
      if (typeof requestIdleCallback !== 'undefined') {
        requestIdleCallback(() => requestAnimationFrame(measureFPS), { timeout: 16 })
      } else {
        requestAnimationFrame(measureFPS)
      }
    }

    requestAnimationFrame(measureFPS)
  }

  /**
   * 创建性能友好的滚动监听器（优化版本）
   */
  createOptimizedScrollListener(
    element: Element | Window | Document,
    callback: (scrollInfo: ScrollInfo) => void,
    options: ScrollListenerOptions = {}
  ): () => void {
    const {
      throttleDelay = 16,
      includeDirection = true,
      includeVelocity = false
    } = options

    let lastScrollTop = 0
    let lastScrollLeft = 0
    let lastTimestamp = 0
    let velocityY = 0
    let velocityX = 0

    const scrollHandler = this.throttle((event: Event) => {
      const target = event.target as Element
      const scrollTop = target.scrollTop || window.pageYOffset || 0
      const scrollLeft = target.scrollLeft || window.pageXOffset || 0
      const timestamp = performance.now()

      let direction: ScrollDirection = 'none'
      
      if (includeDirection) {
        if (scrollTop > lastScrollTop) direction = 'down'
        else if (scrollTop < lastScrollTop) direction = 'up'
        else if (scrollLeft > lastScrollLeft) direction = 'right'
        else if (scrollLeft < lastScrollLeft) direction = 'left'
      }

      if (includeVelocity && lastTimestamp > 0) {
        const deltaTime = timestamp - lastTimestamp
        velocityY = (scrollTop - lastScrollTop) / deltaTime
        velocityX = (scrollLeft - lastScrollLeft) / deltaTime
      }

      const scrollInfo: ScrollInfo = {
        scrollTop,
        scrollLeft,
        direction,
        velocityY: includeVelocity ? velocityY : undefined,
        velocityX: includeVelocity ? velocityX : undefined,
        timestamp
      }

      callback(scrollInfo)

      lastScrollTop = scrollTop
      lastScrollLeft = scrollLeft
      lastTimestamp = timestamp
    }, throttleDelay)

    this.addPassiveListener(element, 'scroll', scrollHandler)

    // 返回清理函数
    return () => {
      this.removePassiveListener(element, 'scroll', scrollHandler)
    }
  }

  /**
   * 生成监听器ID（优化版本）
   */
  private generateListenerId(
    element: Element | Window | Document,
    event: string,
    handler: EventListener
  ): string {
    const elementId = element === window ? 'window' :
                     element === document ? 'document' :
                     (element as Element).tagName || 'unknown'
    
    // 使用更短的ID生成策略以减少内存占用
    return `${elementId}_${event}_${String(handler).slice(0, 30).replace(/\s+/g, '')}`
  }

  /**
   * 获取所有监听器信息
   */
  getListenersInfo(): EventListenerInfo[] {
    return Array.from(this.listeners.values())
  }

  /**
   * 清理所有监听器（优化版本）
   */
  cleanup(): void {
    // 使用批量清理提高性能
    const cleanupPromises: Promise<void>[] = []
    
    this.listeners.forEach((info, id) => {
      cleanupPromises.push(
        new Promise((resolve) => {
          try {
            info.element.removeEventListener(info.event, info.originalHandler, info.options)
            resolve()
          } catch (error) {
            console.error('Failed to cleanup listener:', error)
            resolve() // 继续清理其他监听器
          }
        })
      )
    })

    Promise.all(cleanupPromises).then(() => {
      this.listeners.clear()
      this.throttledHandlers.clear()
      this.debouncedHandlers.clear()
      this.isMonitoring = false
      
      if (import.meta.env.DEV) {
        console.log('✅ 所有事件监听器已清理完成')
      }
    })
  }

  /**
   * 批量添加被动监听器（新功能）
   */
  addPassiveListenersBatch(listeners: {
    element: Element | Window | Document,
    event: string,
    handler: EventListener,
    options?: AddEventListenerOptions
  }[]): void {
    listeners.forEach(({ element, event, handler, options }) => {
      this.addPassiveListener(element, event, handler, options)
    })
  }

  /**
   * 检查监听器状态（新功能）
   */
  getListenerStats(): {
    total: number,
    passive: number,
    throttled: number,
    debounced: number
  } {
    return {
      total: this.listeners.size,
      passive: this.listeners.size,
      throttled: this.throttledHandlers.size,
      debounced: this.debouncedHandlers.size
    }
  }
}

// 类型定义
interface ScrollInfo {
  scrollTop: number
  scrollLeft: number
  direction: ScrollDirection
  velocityY?: number
  velocityX?: number
  timestamp: number
}

interface ScrollListenerOptions {
  throttleDelay?: number
  includeDirection?: boolean
  includeVelocity?: boolean
}

type ScrollDirection = 'up' | 'down' | 'left' | 'right' | 'none'

// 创建全局实例
export const passiveEventManager = new PassiveEventManager()

// 启动性能监控（仅在开发环境）
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  passiveEventManager.monitorScrollPerformance()
}

export default PassiveEventManager