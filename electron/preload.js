const { contextBridge, ipcRenderer } = require('electron')
const path = require('path')

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
  
  // 文件系统操作（仅限必要功能）
  getTempPath: () => os.tmpdir(),
  
  // 监听事件
  onAppInfo: (callback) => {
    ipcRenderer.on('app-info', (event, info) => callback(info))
  },
  
  // 移除事件监听
  removeListener: (channel, callback) => {
    ipcRenderer.removeListener(channel, callback)
  }
})

// 暴露Node.js API的有限版本
contextBridge.exposeInMainWorld('nodeAPI', {
  // 路径操作
  path: {
    join: (...args) => path.join(...args),
    resolve: (...args) => path.resolve(...args),
    dirname: (p) => path.dirname(p),
    basename: (p) => path.basename(p),
    extname: (p) => path.extname(p)
  }
})

// 设置安全的全局变量
window.__static = path.join(__dirname, 'static').replace(/\\/g, '\\\\')