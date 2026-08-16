#!/usr/bin/env bash
# 拉取上游 deepseek-harness 更新并合并进本 fork。
# 用法：custom/bin/update.sh [--push]
set -euo pipefail
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/lib.sh"

require_cmd git "请先安装 git"
cd "$KIT_REPO_ROOT"

# 确保 upstream remote 存在
if ! git remote get-url upstream >/dev/null 2>&1; then
  msg "添加 upstream remote…"
  git remote add upstream https://github.com/deepseek-ai/deepseek-harness.git
fi

# 必须在 master 且工作区干净
cur="$(git branch --show-current)"
if [ "$cur" != "master" ]; then
  [ -z "$(git status --porcelain)" ] || die "当前在分支 $cur 且有未提交改动，请先 custom/bin/save.sh 提交"
  msg "切换到 master 分支…"
  git checkout master
fi
[ -z "$(git status --porcelain)" ] || die "有未提交的改动，请先运行 custom/bin/save.sh 记录后再更新"

msg "拉取上游 master…"
git fetch upstream master

msg "合并 upstream/master…"
if git merge --no-edit upstream/master; then
  ok "合并成功"
else
  warn "合并产生冲突！请手动解决后执行：git add -A && git commit"
  exit 1
fi

if [ "${1:-}" = "--push" ]; then
  msg "推送到你的 GitHub fork…"
  git push origin master
  ok "已推送"
fi

msg "提示：dsh 处于 0.1.0-rc 预发布期，上游可能有破坏性变更。"
msg "合并后建议重跑 custom/bin/install.sh（重装插件依赖），并用 custom/bin/dsh.sh 验证。"
