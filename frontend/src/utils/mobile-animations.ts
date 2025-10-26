/**
 * 移动端交互动画工具
 * 提供微信风格的动画效果和交互优化
 */

export interface AnimationOptions {
  duration?: number
  timingFunction?: string
  delay?: number
  fillMode?: 'none' | 'forwards' | 'backwards' | 'both' | 'auto'
}

/**
 * 常用动画持续时间
 */
export const ANIMATION_DURATIONS = {
  FAST: 150,
  NORMAL: 250,
  SLOW: 350,
  VERY_SLOW: 500
}

/**
 * 常用缓动函数
 */
export const EASING_FUNCTIONS = {
  LINEAR: 'linear',
  EASE_IN: 'cubic-bezier(0.4, 0, 0.2, 1)',
  EASE_OUT: 'cubic-bezier(0.2, 0, 0, 1)',
  EASE_IN_OUT: 'cubic-bezier(0.4, 0, 0.2, 1)',
  BOUNCE: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
}

/**
 * 添加元素动画
 */
export function animateElement(
  element: HTMLElement,
  keyframes: Keyframe[],
  options: AnimationOptions = {}
): Animation {
  const defaultOptions: AnimationOptions = {
    duration: ANIMATION_DURATIONS.NORMAL,
    timingFunction: EASING_FUNCTIONS.EASE_OUT,
    fillMode: 'both'
  }

  const mergedOptions = { ...defaultOptions, ...options }

  return element.animate(keyframes, {
    duration: mergedOptions.duration,
    easing: mergedOptions.timingFunction,
    delay: mergedOptions.delay || 0,
    fill: mergedOptions.fillMode
  })
}

/**
 * 微信风格的按钮点击反馈
 */
export function createWeChatButtonFeedback(
  element: HTMLElement,
  options: AnimationOptions = {}
): void {
  const scaleDown = element.animate(
    [{ transform: 'scale(1)', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
     { transform: 'scale(0.95)', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }],
    {
      duration: ANIMATION_DURATIONS.FAST,
      easing: EASING_FUNCTIONS.EASE_IN_OUT,
      fill: 'both'
    }
  )

  const scaleUp = element.animate(
    [{ transform: 'scale(0.95)', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' },
     { transform: 'scale(1)', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }],
    {
      duration: ANIMATION_DURATIONS.FAST,
      easing: EASING_FUNCTIONS.EASE_OUT,
      fill: 'both'
    }
  )

  scaleDown.onfinish = () => scaleUp.play()
}

/**
 * 页面切换动画
 */
export function createPageTransition(
  fromElement: HTMLElement,
  toElement: HTMLElement,
  direction: 'left' | 'right' = 'left'
): Promise<void> {
  return new Promise((resolve) => {
    // 设置初始状态
    fromElement.style.position = 'absolute'
    toElement.style.position = 'absolute'
    toElement.style.transform = direction === 'left' ? 'translateX(100%)' : 'translateX(-100%)'
    toElement.style.opacity = '0'

    // 显示新页面
    const enterAnimation = animateElement(toElement, [
      { transform: direction === 'left' ? 'translateX(100%)' : 'translateX(-100%)', opacity: '0' },
      { transform: 'translateX(0)', opacity: '1' }
    ], {
      duration: ANIMATION_DURATIONS.NORMAL,
      timingFunction: EASING_FUNCTIONS.EASE_OUT
    })

    // 隐藏旧页面
    const exitAnimation = animateElement(fromElement, [
      { transform: 'translateX(0)', opacity: '1' },
      { transform: direction === 'left' ? 'translateX(-100%)' : 'translateX(100%)', opacity: '0' }
    ], {
      duration: ANIMATION_DURATIONS.NORMAL,
      timingFunction: EASING_FUNCTIONS.EASE_IN
    })

    // 动画完成回调
    Promise.all([enterAnimation.finished, exitAnimation.finished]).then(() => {
      // 清理样式
      fromElement.style.position = ''
      toElement.style.position = ''
      toElement.style.transform = ''
      toElement.style.opacity = ''
      resolve()
    })
  })
}

/**
 * 微信风格的弹窗动画
 */
export function createWeChatModalAnimation(
  element: HTMLElement,
  options: { scale?: number; duration?: number } = {}
): Promise<void> {
  return new Promise((resolve) => {
    // 设置初始状态
    element.style.transform = 'scale(0.8)'
    element.style.opacity = '0'
    element.style.transition = `all ${options.duration || ANIMATION_DURATIONS.NORMAL}ms ${EASING_FUNCTIONS.EASE_OUT}`

    // 触发动画
    setTimeout(() => {
      element.style.transform = 'scale(1)'
      element.style.opacity = '1'

      // 动画完成回调
      setTimeout(resolve, options.duration || ANIMATION_DURATIONS.NORMAL)
    }, 50)
  })
}

/**
 * 微信风格的列表项滑动删除动画
 */
export function createSwipeToDeleteAnimation(
  element: HTMLElement,
  direction: 'left' | 'right' = 'left'
): Promise<void> {
  return new Promise((resolve) => {
    const distance = direction === 'left' ? '-100%' : '100%'
    
    const animation = animateElement(element, [
      { transform: 'translateX(0)' },
      { transform: `translateX(${distance})` }
    ], {
      duration: ANIMATION_DURATIONS.NORMAL,
      timingFunction: EASING_FUNCTIONS.EASE_OUT
    })

    animation.onfinish = () => resolve()
  })
}

/**
 * 添加页面进入动画
 */
export function addPageEnterAnimation(element: HTMLElement): void {
  element.style.opacity = '0'
  element.style.transform = 'translateY(20px)'
  
  requestAnimationFrame(() => {
    animateElement(element, [
      { opacity: '0', transform: 'translateY(20px)' },
      { opacity: '1', transform: 'translateY(0)' }
    ], {
      duration: ANIMATION_DURATIONS.NORMAL,
      timingFunction: EASING_FUNCTIONS.EASE_OUT
    })
  })
}

/**
 * 添加元素淡入动画
 */
export function addFadeInAnimation(element: HTMLElement, delay: number = 0): void {
  element.style.opacity = '0'
  
  setTimeout(() => {
    animateElement(element, [
      { opacity: '0' },
      { opacity: '1' }
    ], {
      duration: ANIMATION_DURATIONS.NORMAL,
      delay,
      timingFunction: EASING_FUNCTIONS.EASE_IN_OUT
    })
  }, delay)
}