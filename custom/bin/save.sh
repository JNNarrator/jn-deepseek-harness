#!/usr/bin/env bash
# 把当前定制状态记录进 git（custom/ 目录即"最新状态"的唯一记录，覆盖式）。
# 用法：custom/bin/save.sh [--all] [--push]
#   --all   同时提交仓库其他文件的改动（默认只提交 custom/）
#   --push  提交后推送到你的 GitHub fork
set -euo pipefail
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/lib.sh"

require_cmd git "请先安装 git"
cd "$KIT_REPO_ROOT"

do_all=false
do_push=false
for a in "$@"; do
  case "$a" in
    --all)  do_all=true ;;
    --push) do_push=true ;;
    *) warn "忽略未知参数：$a" ;;
  esac
done

if [ "$do_all" = true ]; then
  git add -A
  msg "已暂存全部改动"
else
  git add custom/
  msg "已暂存 custom/ 下的改动"
fi

if git diff --cached --quiet; then
  msg "没有新的变更需要记录。"
else
  git commit -m "chore(custom): 记录 dsh 定制状态 $(date '+%Y-%m-%d %H:%M')"
  ok "已提交"
fi

if [ "$do_push" = true ]; then
  git push origin master
  ok "已推送到 GitHub"
fi
