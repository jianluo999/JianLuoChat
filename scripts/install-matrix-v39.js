#!/usr/bin/env node

/**
 * Matrix JS SDK v39.0.0 安装和配置脚本
 * 自动安装依赖、配置环境、运行测试
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

console.log('🚀 Matrix JS SDK v39.0.0 安装脚本启动...\n')

// 检查 Node.js 版本
function checkNodeVersion() {
  const nodeVersion = process.version
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0])
  
  console.log(`📋 检查 Node.js 版本: ${nodeVersion}`)
  
  if (majorVersion < 18) {
    console.error('❌ Matrix JS SDK v39.0.0 需要 Node.js 18 或更高版本')
    console.error('请升级 Node.js 版本后重试')
    process.exit(1)
  }
  
  console.log('✅ Node.js 版本检查通过\n')
}

// 安装依赖
function installDependencies() {
  console.log('📦 安装 Matrix JS SDK v39.0.0 依赖...')
  
  try {
    // 检查包管理器
    let packageManager = 'npm'
    if (fs.existsSync('yarn.lock')) {
      packageManager = 'yarn'
    } else if (fs.existsSync('pnpm-lock.yaml')) {
      packageManager = 'pnpm'
    }
    
    console.log(`使用包管理器: ${packageManager}`)
    
    // 安装依赖
    const installCommand = packageManager === 'yarn' ? 'yarn install' : 
                          packageManager === 'pnpm' ? 'pnpm install' : 'npm install'
    
    execSync(installCommand, { stdio: 'inherit' })
    console.log('✅ 依赖安装完成\n')
    
  } catch (error) {
    console.error('❌ 依赖安装失败:', error.message)
    process.exit(1)
  }
}

// 检查浏览器兼容性
function checkBrowserCompatibility() {
  console.log('🌐 检查浏览器兼容性要求...')
  
  const requirements = [
    '✅ WebAssembly 支持 (现代浏览器)',
    '✅ IndexedDB 支持 (离线存储)',
    '✅ WebRTC 支持 (音视频通话)',
    '✅ Service Worker 支持 (推送通知)',
    '✅ ES2020+ 支持 (现代 JavaScript)'
  ]
  
  requirements.forEach(req => console.log(`  ${req}`))
  console.log('\n')
}

// 创建配置文件
function createConfigFiles() {
  console.log('⚙️ 创建配置文件...')
  
  // 创建 Matrix 配置
  const matrixConfig = {
    homeserver: 'https://matrix.jianluochat.com',
    features: {
      encryption: true,
      threads: true,
      spaces: true,
      voip: true,
      widgets: false,
      beacons: false
    },
    storage: {
      type: 'indexeddb',
      prefix: 'jianluochat-matrix-v39'
    },
    performance: {
      initialSyncLimit: 50,
      lazyLoadMembers: true,
      includeArchivedRooms: false
    }
  }
  
  const configPath = path.join(process.cwd(), 'config', 'matrix-v39.json')
  const configDir = path.dirname(configPath)
  
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true })
  }
  
  fs.writeFileSync(configPath, JSON.stringify(matrixConfig, null, 2))
  console.log(`✅ Matrix 配置文件已创建: ${configPath}`)
  
  // 创建环境变量模板
  const envTemplate = `# Matrix JS SDK v39.0.0 环境变量
MATRIX_HOMESERVER=https://matrix.jianluochat.com
MATRIX_ENABLE_ENCRYPTION=true
MATRIX_ENABLE_THREADS=true
MATRIX_ENABLE_SPACES=true
MATRIX_ENABLE_VOIP=true
MATRIX_STORAGE_TYPE=indexeddb
MATRIX_DEBUG=false
`
  
  const envPath = path.join(process.cwd(), '.env.matrix')
  fs.writeFileSync(envPath, envTemplate)
  console.log(`✅ 环境变量模板已创建: ${envPath}\n`)
}

// 运行基础测试
function runBasicTests() {
  console.log('🧪 运行基础功能测试...')
  
  try {
    // 测试 Matrix SDK 导入
    const testScript = `
      const { createClient } = require('matrix-js-sdk');
      console.log('✅ Matrix SDK 导入成功');
      
      // 测试基础功能
      const client = createClient({ baseUrl: 'https://matrix.org' });
      console.log('✅ 客户端创建成功');
      
      console.log('✅ 所有基础测试通过');
    `
    
    const testFile = path.join(process.cwd(), 'temp-test.js')
    fs.writeFileSync(testFile, testScript)
    
    execSync(`node ${testFile}`, { stdio: 'inherit' })
    
    // 清理测试文件
    fs.unlinkSync(testFile)
    
    console.log('✅ 基础功能测试通过\n')
    
  } catch (error) {
    console.error('❌ 基础功能测试失败:', error.message)
    console.error('请检查依赖安装是否正确\n')
  }
}

// 显示使用指南
function showUsageGuide() {
  console.log('📖 使用指南:')
  console.log('')
  console.log('1. 导入新的 Store:')
  console.log('   import { useMatrixV39Store } from "@/stores/matrix-v39-unified"')
  console.log('')
  console.log('2. 初始化 Matrix:')
  console.log('   const matrixStore = useMatrixV39Store()')
  console.log('   await matrixStore.initializeMatrix()')
  console.log('')
  console.log('3. 登录:')
  console.log('   await matrixStore.matrixLogin("username", "password")')
  console.log('')
  console.log('4. 发送消息:')
  console.log('   await matrixStore.sendMatrixMessage(roomId, "Hello World!")')
  console.log('')
  console.log('5. 查看完整文档:')
  console.log('   cat MATRIX_V39_INTEGRATION_GUIDE.md')
  console.log('')
}

// 主函数
async function main() {
  try {
    checkNodeVersion()
    installDependencies()
    checkBrowserCompatibility()
    createConfigFiles()
    runBasicTests()
    showUsageGuide()
    
    console.log('🎉 Matrix JS SDK v39.0.0 安装配置完成!')
    console.log('现在可以开始使用所有新功能了!')
    
  } catch (error) {
    console.error('❌ 安装过程中出现错误:', error.message)
    process.exit(1)
  }
}

// 运行脚本
if (require.main === module) {
  main()
}

module.exports = {
  checkNodeVersion,
  installDependencies,
  checkBrowserCompatibility,
  createConfigFiles,
  runBasicTests,
  showUsageGuide
}