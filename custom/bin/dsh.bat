@echo off
rem dsh-kit 启动器（Windows cmd）—— 调用 PowerShell 包装器
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0dsh.ps1" %*
exit /b %errorlevel%
