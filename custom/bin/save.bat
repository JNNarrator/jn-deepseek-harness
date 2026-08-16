@echo off
rem dsh-kit 状态记录（Windows cmd）—— 调用 PowerShell 包装器
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0save.ps1" %*
exit /b %errorlevel%
