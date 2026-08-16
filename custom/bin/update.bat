@echo off
rem dsh-kit 上游更新（Windows cmd）—— 调用 PowerShell 包装器
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0update.ps1" %*
exit /b %errorlevel%
