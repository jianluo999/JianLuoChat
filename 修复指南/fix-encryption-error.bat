@echo off
echo ========================================
echo Matrix 加密设备ID不匹配修复工具
echo ========================================
echo.
echo 这个工具将帮助你修复以下错误:
echo "the account in the store doesn't match the account in the constructor"
echo.
echo 修复步骤:
echo 1. 清理浏览器中的Matrix加密数据
echo 2. 重新启动应用
echo 3. 重新登录
echo.
pause

echo 正在启动浏览器修复工具...
echo.

REM 创建临时HTML文件用于修复
echo ^<!DOCTYPE html^> > temp_fix.html
echo ^<html^> >> temp_fix.html
echo ^<head^> >> temp_fix.html
echo     ^<title^>Matrix 加密修复工具^</title^> >> temp_fix.html
echo     ^<style^> >> temp_fix.html
echo         body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; } >> temp_fix.html
echo         .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); } >> temp_fix.html
echo         .btn { background: #007bff; color: white; padding: 12px 24px; border: none; border-radius: 5px; cursor: pointer; font-size: 16px; margin: 10px 5px; } >> temp_fix.html
echo         .btn:hover { background: #0056b3; } >> temp_fix.html
echo         .success { color: #28a745; } >> temp_fix.html
echo         .error { color: #dc3545; } >> temp_fix.html
echo         .log { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0; font-family: monospace; white-space: pre-wrap; max-height: 300px; overflow-y: auto; } >> temp_fix.html
echo     ^</style^> >> temp_fix.html
echo ^</head^> >> temp_fix.html
echo ^<body^> >> temp_fix.html
echo     ^<div class="container"^> >> temp_fix.html
echo         ^<h1^>🔧 Matrix 加密设备ID修复工具^</h1^> >> temp_fix.html
echo         ^<p^>检测到加密设备ID不匹配错误，点击下面的按钮进行修复：^</p^> >> temp_fix.html
echo         ^<button class="btn" onclick="startFix()"^>🚀 开始修复^</button^> >> temp_fix.html
echo         ^<button class="btn" onclick="checkStatus()"^>🔍 检查状态^</button^> >> temp_fix.html
echo         ^<div id="log" class="log"^>等待操作...^</div^> >> temp_fix.html
echo     ^</div^> >> temp_fix.html
echo. >> temp_fix.html
echo     ^<script^> >> temp_fix.html
echo         function log(message) { >> temp_fix.html
echo             const logDiv = document.getElementById('log'); >> temp_fix.html
echo             logDiv.textContent += new Date().toLocaleTimeString() + ': ' + message + '\n'; >> temp_fix.html
echo             logDiv.scrollTop = logDiv.scrollHeight; >> temp_fix.html
echo             console.log(message); >> temp_fix.html
echo         } >> temp_fix.html
echo. >> temp_fix.html
echo         async function startFix() { >> temp_fix.html
echo             log('🔧 开始修复设备ID不匹配问题...'); >> temp_fix.html
echo             try { >> temp_fix.html
echo                 // 清理 localStorage >> temp_fix.html
echo                 const keysToRemove = []; >> temp_fix.html
echo                 for (let i = 0; i ^< localStorage.length; i++) { >> temp_fix.html
echo                     const key = localStorage.key(i); >> temp_fix.html
echo                     if (key ^&^& (key.includes('crypto') ^|^| key.includes('olm') ^|^| key.includes('device-id') ^|^| key.includes('matrix-sdk-crypto') ^|^| key.startsWith('jianluochat-device-id-') ^|^| key.includes('matrix-v39-login-info'))) { >> temp_fix.html
echo                         keysToRemove.push(key); >> temp_fix.html
echo                     } >> temp_fix.html
echo                 } >> temp_fix.html
echo                 keysToRemove.forEach(key =^> { >> temp_fix.html
echo                     localStorage.removeItem(key); >> temp_fix.html
echo                     log('✅ 清理: ' + key); >> temp_fix.html
echo                 }); >> temp_fix.html
echo. >> temp_fix.html
echo                 // 清理 IndexedDB >> temp_fix.html
echo                 const cryptoDbNames = ['jianluochat-matrix-v39-crypto-@mybatis:matrix.org', 'matrix-js-sdk::matrix-sdk-crypto', 'matrix-js-sdk::crypto']; >> temp_fix.html
echo                 for (const dbName of cryptoDbNames) { >> temp_fix.html
echo                     try { >> temp_fix.html
echo                         const deleteReq = indexedDB.deleteDatabase(dbName); >> temp_fix.html
echo                         await new Promise((resolve) =^> { >> temp_fix.html
echo                             deleteReq.onsuccess = () =^> { log('✅ 删除加密数据库: ' + dbName); resolve(); }; >> temp_fix.html
echo                             deleteReq.onerror = () =^> { log('⚠️ 数据库 ' + dbName + ' 不存在或已删除'); resolve(); }; >> temp_fix.html
echo                             deleteReq.onblocked = () =^> { log('⚠️ 数据库 ' + dbName + ' 删除被阻塞'); resolve(); }; >> temp_fix.html
echo                         }); >> temp_fix.html
echo                     } catch (error) { >> temp_fix.html
echo                         log('⚠️ 清理数据库时出错: ' + error.message); >> temp_fix.html
echo                     } >> temp_fix.html
echo                 } >> temp_fix.html
echo. >> temp_fix.html
echo                 log('✅ 修复完成！请关闭此页面并重新启动应用'); >> temp_fix.html
echo                 alert('修复完成！请关闭此页面并重新启动应用，然后重新登录。'); >> temp_fix.html
echo             } catch (error) { >> temp_fix.html
echo                 log('❌ 修复失败: ' + error.message); >> temp_fix.html
echo             } >> temp_fix.html
echo         } >> temp_fix.html
echo. >> temp_fix.html
echo         function checkStatus() { >> temp_fix.html
echo             log('🔍 检查当前状态...'); >> temp_fix.html
echo             let deviceIdCount = 0; >> temp_fix.html
echo             let cryptoDataCount = 0; >> temp_fix.html
echo             for (let i = 0; i ^< localStorage.length; i++) { >> temp_fix.html
echo                 const key = localStorage.key(i); >> temp_fix.html
echo                 if (key ^&^& key.includes('device-id')) deviceIdCount++; >> temp_fix.html
echo                 if (key ^&^& (key.includes('crypto') ^|^| key.includes('olm'))) cryptoDataCount++; >> temp_fix.html
echo             } >> temp_fix.html
echo             log('📱 设备ID数据: ' + deviceIdCount + ' 项'); >> temp_fix.html
echo             log('🔐 加密数据: ' + cryptoDataCount + ' 项'); >> temp_fix.html
echo             if (deviceIdCount === 0 ^&^& cryptoDataCount === 0) { >> temp_fix.html
echo                 log('✅ 状态良好，可以重新登录'); >> temp_fix.html
echo             } else { >> temp_fix.html
echo                 log('⚠️ 仍有残留数据，建议执行修复'); >> temp_fix.html
echo             } >> temp_fix.html
echo         } >> temp_fix.html
echo     ^</script^> >> temp_fix.html
echo ^</body^> >> temp_fix.html
echo ^</html^> >> temp_fix.html

REM 在默认浏览器中打开修复工具
start temp_fix.html

echo.
echo 修复工具已在浏览器中打开
echo 请按照页面上的指示进行操作
echo.
echo 修复完成后：
echo 1. 关闭浏览器页面
echo 2. 重新启动应用 (npm run dev 或 yarn dev)
echo 3. 重新登录你的Matrix账户
echo.
pause

REM 清理临时文件
del temp_fix.html 2>nul

echo 修复工具已关闭
pause