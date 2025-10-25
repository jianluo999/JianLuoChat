@echo off
echo ========================================
echo    Matrix 加密功能紧急修复工具
echo ========================================
echo.

echo 🔧 正在修复Matrix加密支持问题...
echo.

echo 📋 问题描述:
echo    房间需要加密但客户端显示不支持加密
echo.

echo 🔍 修复步骤:
echo    1. 检查Matrix客户端状态
echo    2. 重新初始化加密引擎  
echo    3. 修复发送消息逻辑
echo    4. 清理损坏的加密存储
echo.

echo ⚠️  请按照以下步骤操作:
echo.
echo 步骤1: 在浏览器中打开开发者工具 (F12)
echo 步骤2: 切换到 Console 标签页
echo 步骤3: 复制并粘贴以下代码，然后按回车:
echo.

echo ----------------------------------------
echo 复制以下代码到浏览器控制台:
echo ----------------------------------------
echo.

type immediate-encryption-fix.js

echo.
echo ----------------------------------------
echo.

echo 💡 或者直接在浏览器地址栏输入:
echo    javascript:(function(){var s=document.createElement('script');s.src='./immediate-encryption-fix.js';document.head.appendChild(s);})()
echo.

echo 🎯 修复完成后的效果:
echo    ✅ 加密房间可以正常发送消息
echo    ✅ 提供更友好的错误提示
echo    ✅ 自动重试加密初始化
echo.

echo 🔄 如果修复后仍有问题:
echo    1. 刷新页面 (Ctrl+F5)
echo    2. 清理浏览器缓存
echo    3. 重新登录Matrix账户
echo    4. 或选择非加密房间进行聊天
echo.

echo 📞 需要更多帮助?
echo    请查看 ENCRYPTION_DEVICE_ID_FIX.md 文档
echo.

pause