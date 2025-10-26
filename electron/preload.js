try {
  const { contextBridge, ipcRenderer } = require('electron')

  // 安全地暴露API给渲染进程
  contextBridge.exposeInMainWorld('electronAPI', {
    // 获取应用信息
    getAppInfo: () => ipcRenderer.invoke('get-app-info'),
    
    // 窗口控制
    minimizeWindow: () => ipcRenderer.send('minimize-window'),
    closeWindow: () => ipcRenderer.send('close-window'),
    hideWindow: () => ipcRenderer.send('hide-window'),
    showWindow: () => ipcRenderer.send('show-window'),
    
    // 系统信息
    getPlatform: () => process.platform,
    getArch: () => process.arch,
    
    // 监听事件
    onAppInfo: (callback) => {
      ipcRenderer.on('app-info', (event, info) => callback(info))
    },
    
    // 移除事件监听
    removeListener: (channel, callback) => {
      ipcRenderer.removeListener(channel, callback)
    }
  })
} catch (error) {
  console.error('Preload script error:', error)
}