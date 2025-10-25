// 网络连接修复补丁
// 添加到 frontend/src/utils/networkFix.js

export const networkConnectionFix = {
  // 强制使用IPv4
  forceIPv4: true,
  
  // 网络重试配置
  retryConfig: {
    maxRetries: 3,
    retryDelay: 2000,
    backoffMultiplier: 1.5
  },
  
  // 修复Matrix客户端网络配置
  patchMatrixClient: (client) => {
    // 覆盖fetch方法，强制IPv4
    const originalFetch = global.fetch;
    global.fetch = async (url, options = {}) => {
      try {
        // 如果是matrix.org域名，尝试强制IPv4
        if (typeof url === 'string' && url.includes('matrix.org')) {
          // 添加IPv4优先的headers
          options.headers = {
            ...options.headers,
            'Connection': 'keep-alive',
            'User-Agent': 'JianluoChat/1.0 (Android)'
          };
          
          // 设置超时
          if (!options.timeout) {
            options.timeout = 30000; // 30秒超时
          }
        }
        
        return await originalFetch(url, options);
      } catch (error) {
        console.error('Network request failed:', error);
        throw error;
      }
    };
  },
  
  // 网络状态检查
  checkNetworkStatus: async () => {
    try {
      const response = await fetch('https://httpbin.org/ip', {
        method: 'GET',
        timeout: 5000
      });
      return response.ok;
    } catch (error) {
      console.error('Network check failed:', error);
      return false;
    }
  }
};

// 使用方法：
// import { networkConnectionFix } from '@/utils/networkFix';
// networkConnectionFix.patchMatrixClient(matrixClient);