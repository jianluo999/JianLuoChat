@echo off
echo 修复Android模拟器问题...
echo.

echo 1. 强制关闭模拟器进程...
taskkill /f /im "qemu-system-x86_64.exe" 2>nul
taskkill /f /im "emulator.exe" 2>nul
taskkill /f /im "adb.exe" 2>nul

echo.
echo 2. 删除锁定文件...
del "C:\Users\%USERNAME%\.android\avd\Pixel_7_API_32.avd\*.lock" /s /q 2>nul
rmdir "C:\Users\%USERNAME%\.android\avd\Pixel_7_API_32.avd\hardware-qemu.ini.lock" /s /q 2>nul

echo.
echo 3. 重启ADB服务...
adb kill-server 2>nul
adb start-server 2>nul

echo.
echo 修复完成！现在可以重新启动模拟器了。
echo.
echo 建议：
echo - 重新启动Android Studio
echo - 或者直接在真机上测试APK（更快更稳定）
echo.
pause