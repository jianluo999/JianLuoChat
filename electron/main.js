const { app, BrowserWindow, ipcMain, Menu } = require('electron')
const path = require('path')
const url = require('url')
const fs = require('fs')
const os = require('os')
const { spawn } = require('child_process')

let mainWindow
let isQuitting = false
let springBootProcess = null

function startSpringBoot() {
  return new Promise((resolve, reject) => {
    console.log('🚀 启动SpringBoot后端...')
    
    // 查找jar文件路径
    const jarPath = path.join(__dirname, '../backend/target/jianluochat-backend-1.0.0.jar')
    console.log('JAR路径:', jarPath)
    
    if (!fs.existsSync(jarPath)) {
      console.error('❌ 找不到SpringBoot JAR文件:', jarPath)
      reject(new Error('SpringBoot JAR文件不存在'))
      return
    }
    
    // 使用打包的JRE启动SpringBoot
    const javaExe = path.join(__dirname, 'jre-runtime/bin/java.exe')
    const javaCommand = fs.existsSync(javaExe) ? javaExe : 'java'
    
    console.log('使用Java:', javaCommand)
    
    springBootProcess = spawn(javaCommand, ['-jar', jarPath], {
      stdio: ['pipe', 'pipe', 'pipe'],
      cwd: path.dirname(jarPath)
    })
    
    springBootProcess.stdout.on('data', (data) => {
      console.log('SpringBoot输出:', data.toString())
      // 检查是否启动完成
      if (data.toString().includes('Started JianluochatBackendApplication')) {
        console.log('✅ SpringBoot启动完成')
        resolve()
      }
    })
    
    springBootProcess.stderr.on('data', (data) => {
      console.error('SpringBoot错误:', data.toString())
    })
    
    springBootProcess.on('close', (code) => {
      console.log('SpringBoot进程退出，代码:', code)
    })
    
    // 设置超时
    setTimeout(() => {
      console.log('✅ SpringBoot启动超时，继续启动前端')
      resolve()
    }, 10000)
  })
}

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
      webSecurity: false,
      // 启用WebAssembly支持
      webgl: true,
      webaudio: true,
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
    // 在打包后，文件会在同一目录下
    const indexPath = path.join(__dirname, 'frontend/dist/index.html')
    console.log('尝试加载文件:', indexPath)
    console.log('文件是否存在:', fs.existsSync(indexPath))
    
    if (fs.existsSync(indexPath)) {
      mainWindow.loadFile(indexPath)
    } else {
      // 尝试其他可能的路径
      const altPath = path.join(__dirname, '../frontend/dist/index.html')
      console.log('尝试备用路径:', altPath)
      console.log('备用路径是否存在:', fs.existsSync(altPath))
      
      if (fs.existsSync(altPath)) {
        mainWindow.loadFile(altPath)
      } else {
        // 如果找不到前端构建文件，加载本地HTML
        console.log('加载默认HTML文件')
        mainWindow.loadFile(path.join(__dirname, 'index.html'))
      }
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
app.whenReady().then(async () => {
  try {
    // 先启动SpringBoot后端
    await startSpringBoot()
    // 等待2秒确保后端完全启动
    await new Promise(resolve => setTimeout(resolve, 2000))
    // 再启动前端窗口
    createWindow()
  } catch (error) {
    console.error('启动SpringBoot失败:', error)
    // 即使后端启动失败，也启动前端
    createWindow()
  }

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
  // 关闭SpringBoot进程
  if (springBootProcess) {
    console.log('🛑 关闭SpringBoot进程...')
    springBootProcess.kill()
    springBootProcess = null
  }
})

app.on('window-all-closed', () => {
  // 关闭SpringBoot进程
  if (springBootProcess) {
    console.log('🛑 关闭SpringBoot进程...')
    springBootProcess.kill()
    springBootProcess = null
  }
  
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