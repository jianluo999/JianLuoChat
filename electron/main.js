const { app, BrowserWindow, ipcMain, Menu } = require('electron')
const path = require('path')
const url = require('url')
const fs = require('fs')
const os = require('os')

let mainWindow
let isQuitting = false

function createWindow() {
  // 创建浏览器窗口
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    title: 'Matrix聊天客户端',
    icon: path.join(__dirname, 'assets/icon.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      webSecurity: true,
      // 启用WebAssembly支持
      webgl: true,
      webaudio: true,
      // 允许跨域资源共享
      webSecurity: false,
      // 启用实验性Web平台功能
      experimentalFeatures: true,
      // 启用WebAssembly编译缓存
      wasm: true
    }
  })

  // 加载应用
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173')
    // 开发模式下开启开发者工具
    mainWindow.webContents.openDevTools()
  } else {
    // 生产模式下加载打包后的文件
    const indexPath = path.join(__dirname, '../frontend/dist/index.html')
    if (fs.existsSync(indexPath)) {
      mainWindow.loadFile(indexPath)
    } else {
      console.error('找不到打包文件:', indexPath)
      app.quit()
    }
  }

  // 处理窗口关闭
  mainWindow.on('closed', () => {
    mainWindow = null
  })

  // 处理窗口最小化
  mainWindow.on('minimize', (event) => {
    event.preventDefault()
    mainWindow.hide()
  })

  // 创建菜单
  createMenu()
}

function createMenu() {
  const template = [
    {
      label: '应用',
      submenu: [
        {
          label: '关于Matrix聊天客户端',
          click: () => {
            mainWindow.webContents.send('show-about', {
              name: 'Matrix聊天客户端',
              version: '1.0.0',
              description: '基于Matrix协议的桌面聊天客户端'
            })
          }
        },
        { type: 'separator' },
        {
          label: '退出',
          click: () => {
            isQuitting = true
            app.quit()
          }
        }
      ]
    },
    {
      label: '编辑',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' }
      ]
    },
    {
      label: '视图',
      submenu: [
        {
          label: '刷新',
          accelerator: 'CmdOrCtrl+R',
          click: () => {
            if (!mainWindow.webContents.isDestroyed()) {
              mainWindow.webContents.reload()
            }
          }
        },
        {
          label: '切换开发者工具',
          accelerator: 'Alt+Command+I',
          click: () => {
            mainWindow.webContents.toggleDevTools()
          }
        }
      ]
    }
  ]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

// 处理应用启动
app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    } else if (mainWindow) {
      mainWindow.show()
    }
  })
})

// 处理应用退出
app.on('before-quit', () => {
  isQuitting = true
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// IPC通信处理
ipcMain.handle('get-app-info', () => {
  return {
    name: 'Matrix聊天客户端',
    version: '1.0.0',
    platform: process.platform,
    arch: os.arch()
  }
})

// 处理隐藏窗口
ipcMain.on('hide-window', () => {
  if (mainWindow) {
    mainWindow.hide()
  }
})

// 处理显示窗口
ipcMain.on('show-window', () => {
  if (mainWindow) {
    mainWindow.show()
    mainWindow.focus()
  }
})