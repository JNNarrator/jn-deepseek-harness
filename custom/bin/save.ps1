<#
  dsh-kit 状态记录（Windows）—— 通过 Git for Windows 的 bash 执行同名 .sh。
  需要 Git for Windows：https://git-scm.com/download/win
#>
$ErrorActionPreference = 'Stop'
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$bashCmd = Get-Command bash -ErrorAction SilentlyContinue
if ($bashCmd) {
  $bashPath = $bashCmd.Source
} else {
  $candidates = @(
    "$env:ProgramFiles\Git\bin\bash.exe",
    "${env:ProgramFiles(x86)}\Git\bin\bash.exe",
    "$env:LOCALAPPDATA\Programs\Git\bin\bash.exe"
  )
  $bashPath = $candidates | Where-Object { Test-Path $_ } | Select-Object -First 1
  if (-not $bashPath) {
    Write-Error "未找到 Git Bash（bash.exe）。请安装 Git for Windows：https://git-scm.com/download/win"
    exit 1
  }
}
& $bashPath "$scriptDir\save.sh" @args
exit $LASTEXITCODE
