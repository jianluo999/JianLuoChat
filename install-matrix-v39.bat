@echo off
echo 🚀 Matrix JS SDK v39.0.0 快速安装脚本
echo.

echo 📦 安装依赖...
npm install

echo.
echo ✅ Matrix JS SDK v39.0.0 安装完成！
echo.
echo 📖 使用方法:
echo 1. 导入 Store: import { useMatrixV39Store } from '@/stores/matrix-v39-clean'
echo 2. 初始化: await matrixStore.initializeMatrix()
echo 3. 登录: await matrixStore.matrixLogin('username', 'password')
echo 4. 发送消息: await matrixStore.sendMatrixMessage(roomId, 'Hello!')
echo.
echo 📋 查看演示组件: frontend/src/components/MatrixV39Demo.vue
echo 📚 查看完整文档: MATRIX_V39_INTEGRATION_GUIDE.md
echo.
pause