/**
 * 日志上报控制模块
 * 用于控制第三方日志上报行为，支持环境变量控制
 */

// 默认配置
const DEFAULT_CONFIG = {
  enableThirdPartyLogging: false,
  blockedDomains: [
    'nlog.daxuesoutijiang.com',
    'apm-volcano.zuoyebang.com',
    'monitor_web',
    'apmInject',
    'aegisInject'
  ],
  logLevel: 'warn' as 'error' | 'warn' | 'info' | 'debug'
}

interface LogControlConfig {
  enableThirdPartyLogging: boolean
  blockedDomains: string[]
  logLevel: 'error' | 'warn' | 'info' | 'debug'
}

// 全局配置
let config: LogControl.log = DEFAULT_CONFIG

// 从环境变量加载配置
export const initializeLogControl = (): void => {
  // 从环境变量读取配置
  const env = import.meta.env
  
  const envConfig: Partial<LogControlConfig> = {
    enableThirdPartyLogging: env.VITE_ENABLE_THIRD_PARTY_LOGGING === 'true'
  }
  
  // 合并配置
  config = { ...DEFAULT_CONFIG, ...envConfig }
  
  console.log('🔍 日志控制初始化完成:', {
    enableThirdParty: config.enableThirdPartyLogging
  })
}

// 检查是否应该阻止请求
export const shouldBlockRequest = (url: string): boolean => {
  if (config.enableThirdPartyLogging) {
    return false
  }
  
  // 检查URL是否包含被阻止的域名
  return config.blockedDomains.some(domain => {
    return url.includes(domain)
  })
}

// 检查是否应该阻止错误报告
export const shouldBlockErrorReporting = (error: Error | string): boolean => {
  const errorStr = error instanceof Error ? error.message : String(error)
  
  // 检查错误信息是否与被阻止的域名相关
  return config.blockedDomains.some(domain => {
    return errorStr.includes(domain)
  })
}

// 获取当前配置
export const getLogConfig = (): LogControl.Config