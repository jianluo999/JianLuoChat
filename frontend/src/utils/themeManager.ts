// 主题管理器
export class ThemeManager {
  private static instance: ThemeManager
  private currentTheme: string = 'retro-green'
  private observers: Array<(theme: string) => void> = []

  static getInstance(): ThemeManager {
    if (!ThemeManager.instance) {
      ThemeManager.instance = new ThemeManager()
    }
    return ThemeManager.instance
  }

  // 应用主题
  applyTheme(themeId: string): void {
    console.log('🎨 [ThemeManager] 应用主题:', themeId)
    
    // 更新body类名
    document.body.className = `theme-${themeId}`
    
    // 强制重新渲染所有组件
    this.forceRerender()
    
    // 保存到localStorage
    localStorage.setItem('selected-theme', themeId)
    
    // 更新当前主题
    this.currentTheme = themeId
    
    // 通知所有观察者
    this.notifyObservers(themeId)
    
    console.log('🎨 [ThemeManager] 主题应用完成')
  }

  // 获取当前主题
  getCurrentTheme(): string {
    return this.currentTheme
  }

  // 从localStorage加载主题
  loadThemeFromStorage(): void {
    const savedTheme = localStorage.getItem('selected-theme')
    if (savedTheme) {
      this.applyTheme(savedTheme)
    }
  }

  // 订阅主题变化
  subscribe(callback: (theme: string) => void): void {
    this.observers.push(callback)
  }

  // 取消订阅
  unsubscribe(callback: (theme: string) => void): void {
    const index = this.observers.indexOf(callback)
    if (index > -1) {
      this.observers.splice(index, 1)
    }
  }

  // 通知观察者
  private notifyObservers(theme: string): void {
    this.observers.forEach(callback => callback(theme))
  }

  // 强制重新渲染
  private forceRerender(): void {
    // 方法1: 立即触发样式重新计算
    const root = document.documentElement
    root.style.display = 'none'
    root.offsetHeight // 强制重排
    root.style.display = ''

    // 方法2: 触发窗口resize事件
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'))
    }, 50)

    // 方法3: 强制所有组件重新渲染
    setTimeout(() => {
      const allElements = document.querySelectorAll('*')
      allElements.forEach(el => {
        if (el instanceof HTMLElement) {
          // 强制重新计算样式
          el.style.transform = 'translateZ(0)'
          setTimeout(() => {
            el.style.transform = ''
          }, 10)
        }
      })
    }, 100)

    // 方法4: 触发自定义事件
    setTimeout(() => {
      document.dispatchEvent(new CustomEvent('themeChanged', {
        detail: { theme: this.currentTheme }
      }))
    }, 150)

    console.log('🎨 [ThemeManager] 强制重新渲染完成')
  }

  // 获取主题配置
  getThemeConfig(themeId: string) {
    const themes = {
      'retro-green': {
        name: '复古绿色',
        primaryBg: '#000000',
        secondaryBg: '#001100',
        primaryText: '#00ff00',
        accentColor: '#00ff00'
      },
      'wechat-classic': {
        name: '微信经典',
        primaryBg: '#f7f7f7',
        secondaryBg: '#ffffff',
        primaryText: '#000000',
        accentColor: '#07c160'
      },
      'dark-blue': {
        name: '深蓝夜间',
        primaryBg: '#1a1a2e',
        secondaryBg: '#16213e',
        primaryText: '#ffffff',
        accentColor: '#4fc3f7'
      },
      'purple-dream': {
        name: '紫色梦幻',
        primaryBg: '#2d1b69',
        secondaryBg: '#11998e',
        primaryText: '#ffffff',
        accentColor: '#667eea'
      }
    }
    
    return themes[themeId as keyof typeof themes] || themes['retro-green']
  }
}

// 导出单例实例
export const themeManager = ThemeManager.getInstance()

// Vue组合式函数
export function useTheme() {
  const applyTheme = (themeId: string) => {
    themeManager.applyTheme(themeId)
  }

  const getCurrentTheme = () => {
    return themeManager.getCurrentTheme()
  }

  const loadTheme = () => {
    themeManager.loadThemeFromStorage()
  }

  return {
    applyTheme,
    getCurrentTheme,
    loadTheme
  }
}