@echo off
chcp 65001 >nul
echo 正在移动剩余文件...

echo 移动开发文档...
move /Y BUILD_STATUS_REPORT.md "开发文档\" >nul 2>&1
move /Y debug-localstorage.html "开发文档\" >nul 2>&1

echo 移动部署指南...
move /Y docker-compose.yml "部署指南\" >nul 2>&1
move /Y drag-install-instructions.txt "部署指南\" >nul 2>&1

echo 移动修复指南...
move /Y DB_RECOVERY_GUIDE.md "修复指南\" >nul 2>&1
move /Y DEVICE_ID_ENCRYPTION_FIX_GUIDE.md "修复指南\" >nul 2>&1
move /Y E2EE_FIX_IMPLEMENTATION_PLAN.md "修复指南\" >nul 2>&1
move /Y E2EE_SECURITY_AUDIT.md "修复指南\" >nul 2>&1
move /Y EMERGENCY_COORDINATOR_FIX.md "修复指南\" >nul 2>&1
move /Y emulator-install-guide.md "修复指南\" >nul 2>&1
move /Y ENCRYPTION_DEVICE_ID_FIX.md "修复指南\" >nul 2>&1
move /Y ENCRYPTION_FIX_GUIDE.md "修复指南\" >nul 2>&1
move /Y ENCRYPTION_README.md "修复指南\" >nul 2>&1
move /Y gemd.md "修复指南\" >nul 2>&1
move /Y Git-LFS-配置指南.md "修复指南\" >nul 2>&1
move /Y IMPLEMENTATION_SUMMARY.md "修复指南\" >nul 2>&1
move /Y LOG_REPORT_ERROR_HANDLING.md "修复指南\" >nul 2>&1
move /Y MOBILE_REDESIGN_SUMMARY.md "修复指南\" >nul 2>&1
move /Y SYNTAX_FIXES_SUMMARY.md "修复指南\" >nul 2>&1

echo 移动测试脚本...
move /Y create-new-emulator.bat "测试脚本\" >nul 2>&1

echo 文件移动完成！
echo.
echo 最终目录结构：
echo.
dir /b /ad
echo.
echo 各目录文件数量：
echo.
echo 开发文档: & dir "开发文档" /b /a-d | find /c /v ""
echo 部署指南: & dir "部署指南" /b /a-d | find /c /v ""
echo 构建脚本: & dir "构建脚本" /b /a-d | find /c /v ""
echo 修复指南: & dir "修复指南" /b /a-d | find /c /v ""
echo Matrix相关: & dir "Matrix相关" /b /a-d | find /c /v ""
echo 测试脚本: & dir "测试脚本" /b /a-d | find /c /v ""
echo 优化文档: & dir "优化文档" /b /a-d | find /c /v ""
echo.
pause