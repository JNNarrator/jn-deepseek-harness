@echo off
rem dsh-kit 安装器（Windows cmd）—— 调用 PowerShell 包装器
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0install.ps1" %*
exit /b %errorlevel%
