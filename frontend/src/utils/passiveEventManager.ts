/**
 * 被动事件管理器
 * 解决非被动事件监听器导致的性能问题
 */

import { errorHandler } from './errorHandler'

interface EventListenerInfo {
  element: Element | Window | Document
  event: string
  handler: EventListener
  options: AddEventListenerOptions
  isPassive: boolean
}

class PassiveEventManager {
  private listeners: Map<string, EventListenerInfo> = new Map()
  private throttledHandlers: Map<string, EventListener> = new Map()
  private debouncedHandlers: Map<string, EventListener> = new Map()

  /**
   * 添加被动事件监听器
   */
  addPassiveListener(
    element: Element | Window | Document,
    event: string,
    handler: EventListener,
    options: AddEventListenerOptions = {}
  ): void {
    const listenerId = this.generateListenerId(element, event, handler)
    
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
        isPassive: true
      })

      console.debug(`✅ Added passive listener for ${event}`)
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
   * 移除被动事件监听器
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
        element.removeEventListener(event, listenerInfo.handler, listenerInfo.options)
        this.listeners.delete(listenerId)
        
        // 清理优化的处理器
        this.throttledHandlers.delete(listenerId)
        this.debouncedHandlers.delete(listenerId)

        console.debug(`✅ Removed passive listener for ${event}`)
      } catch (error) {
        console.error('Failed to remove passive listener:', error)
      }
    }
  }

  /**
   * 优化滚动事件处理器
   */
  private optimizeScrollHandler(event: string, handler: EventListener): EventListener {
    const scrollEvents = ['scroll', 'wheel', 'touchmove', 'mousemove']
    
    if (!scrollEvents.includes(event)) {
      return handler
    }

    // 使用节流优化滚动事件
    return this.throttle(handler, 16) // 约60fps
  }

  /**
   * 节流函数
   */
  private throttle(func: EventListener, delay: number): EventListener {
    let lastCall = 0
    let timeoutId: number | null = null

    return function(this: any, event: Event) {
      const now = Date.now()
      
      if (now - lastCall >= delay) {
        lastCall = now
        func.call(this, event)
      } else if (!timeoutId) {
        timeoutId = window.setTimeout(() => {
          lastCall = Date.now()
          func.call(this, event)
          timeoutId = null
        }, delay - (now - lastCall))
      }
    }
  }

  /**
   * 防抖函数
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
   * 添加节流事件监听器
   */
  addThrottledListener(
    element: Element | Window | Document,
    event: string,
    handler: EventListener,
    delay: number = 16,
    options: AddEventListenerOptions = {}
  ): void {
    const listenerId = this.generateListenerId(element, event, handler)
    const throttledHandler = this.throttle(handler, delay)
    
    this.throttledHandlers.set(listenerId, throttledHandler)
    this.addPassiveListener(element, event, throttledHandler, options)
  }

  /**
   * 添加防抖事件监听器
   */
  addDebouncedListener(
    element: Element | Window | Document,
    event: string,
    handler: EventListener,
    delay: number = 300,
    options: AddEventListenerOptions = {}
  ): void {
    const listenerId = this.generateListenerId(element, event, handler)
    const debouncedHandler = this.debounce(handler, delay)
    
    this.debouncedHandlers.set(listenerId, debouncedHandler)
    this.addPassiveListener(element, event, debouncedHandler, options)
  }

  /**
   * 自动检测并转换现有的非被动监听器
   */
  optimizeExistingListeners(): void {
    console.log('🔍 检测非被动事件监听器...')
    
    // 针对Element Plus等第三方组件库的wheel事件监听器
    // 我们需要主动干预来添加被动模式
    this.patchElementPlusWheelListeners()
    
    const problematicEvents = ['wheel', 'touchstart', 'touchmove', 'scroll']
    
    problematicEvents.forEach(eventType => {
      console.warn(`⚠️ 建议检查 ${eventType} 事件监听器是否使用了被动模式`)
    })
  }

  /**
   * 修补Element Plus的wheel事件监听器
   * Element Plus的ElTable和ElScrollbar组件使用了非被动的wheel监听器
   */
  private patchElementPlusWheelListeners(): void {
    // 使用MutationObserver监控DOM变化，当Element Plus组件被添加时进行修补
    if (typeof MutationObserver !== 'undefined') {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element
              this.patchElementWheelListeners(element)
              
              // 递归检查子元素
              const children = element.querySelectorAll('*')
              children.forEach(child => this.patchElementWheelListeners(child))
            }
          })
        })
      })

      observer.observe(document.body, {
        childList: true,
        subtree: true
      })

      // 立即检查现有的元素
      this.patchElementWheelListeners(document.body)
      const allElements = document.querySelectorAll('*')
      allElements.forEach(element => this.patchElementWheelListeners(element))
    }
  }

  /**
   * 为单个元素修补wheel事件监听器
   */
  private patchElementWheelListeners(element: Element): void {
    // 检查是否是Element Plus的滚动相关组件
    const isElementPlusScrollComponent = element.classList.contains('el-table') ||
                                       element.classList.contains('el-scrollbar') ||
                                       element.classList.contains('el-dialog') ||
                                       element.getAttribute('data-v-')?.includes('el-')
    
    if (isElementPlusScrollComponent && element.addEventListener) {
      // 重写addEventListener方法来强制使用被动模式
      const originalAddEventListener = element.addEventListener.bind(element)
      
      element.addEventListener = (type: string, listener: EventListenerOrEventListenerObject, options?: AddEventListenerOptions) => {
        if (type === 'wheel' && typeof options === 'object' && options.passive === false) {
          console.debug(`🔧 修补Element Plus wheel监听器: ${element.className}`)
          // 强制使用被动模式
          return originalAddEventListener(type, listener, { ...options, passive: true })
        }
        return originalAddEventListener(type, listener, options)
      }
    }
  }

  /**
   * 监控滚动性能
   */
  monitorScrollPerformance(): void {
    let frameCount = 0
    let lastTime = performance.now()
    let jankCount = 0

    const measureFPS = () => {
      const currentTime = performance.now()
      const deltaTime = currentTime - lastTime
      
      frameCount++
      
      // 每秒计算一次FPS
      if (deltaTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / deltaTime)
        frameCount = 0
        lastTime = currentTime
        
        // 如果FPS低于45，认为是性能问题
        if (fps < 45) {
          jankCount++
          
          errorHandler.handlePerformanceError({
            message: `Low FPS detected: ${fps}`,
            metric: 'scroll_jank',
            value: fps,
            threshold: 45,
            context: {
              jankCount,
              timestamp: currentTime
            }
          })
        }
        
        console.debug(`📊 FPS: ${fps}, Jank Count: ${jankCount}`)
      }
      
      requestAnimationFrame(measureFPS)
    }

    requestAnimationFrame(measureFPS)
  }

  /**
   * 创建性能友好的滚动监听器
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
   * 生成监听器ID
   */
  private generateListenerId(
    element: Element | Window | Document,
    event: string,
    handler: EventListener
  ): string {
    const elementId = element === window ? 'window' : 
                     element === document ? 'document' : 
                     (element as Element).tagName || 'unknown'
    
    return `${elementId}_${event}_${handler.toString().slice(0, 50)}`
  }

  /**
   * 获取所有监听器信息
   */
  getListenersInfo(): EventListenerInfo[] {
    return Array.from(this.listeners.values())
  }

  /**
   * 清理所有监听器
   */
  cleanup(): void {
    this.listeners.forEach((info, id) => {
      try {
        info.element.removeEventListener(info.event, info.handler, info.options)
      } catch (error) {
        console.error('Failed to cleanup listener:', error)
      }
    })

    this.listeners.clear()
    this.throttledHandlers.clear()
    this.debouncedHandlers.clear()
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

// 启动性能监控
if (typeof window !== 'undefined') {
  passiveEventManager.monitorScrollPerformance()
}

export default PassiveEventManager