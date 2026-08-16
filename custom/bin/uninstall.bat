@echo off
rem dsh-kit 卸载器（Windows cmd）—— 调用 PowerShell 包装器
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0uninstall.ps1" %*
exit /b %errorlevel%
