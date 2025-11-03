@echo off
echo 🚀 立即修复卡顿和界面问题...

echo.
echo 1. 清理浏览器缓存和存储...
echo 请在浏览器中按 F12 打开开发者工具，然后：
echo - 右键点击刷新按钮，选择"清空缓存并硬性重新加载"
echo - 或者在 Application/Storage 标签中清理 Local Storage 和 IndexedDB

echo.
echo 2. 运行快速修复脚本...
echo 在浏览器控制台中运行以下代码：

echo.
echo // 快速清理性能阻塞数据
echo localStorage.clear();
echo.
echo // 清理 IndexedDB
echo const dbNames = ['matrix-js-sdk::matrix-sdk-crypto', 'matrix-js-sdk::crypto', 'jianluochat-matrix-v39-store'];
echo dbNames.forEach(name => indexedDB.deleteDatabase(name));
echo.
echo // 重新加载页面
echo setTimeout(() => window.location.reload(), 1000);

echo.
echo 3. 如果问题仍然存在，请：
echo - 重启浏览器
echo - 清理浏览器所有数据
echo - 重新登录

echo.
echo 4. 访问微信风格界面：
echo 登录后访问：http://localhost:5173/wechat-layout

pause