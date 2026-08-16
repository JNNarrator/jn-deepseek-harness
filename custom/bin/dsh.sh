#!/usr/bin/env bash
# 启动 dsh —— 默认打开 Web UI，可透传参数：
#   custom/bin/dsh.sh                 → dsh web
#   custom/bin/dsh.sh headless "任务"  → 跑一次任务并退出
#   custom/bin/dsh.sh --profile xxx   → 启动指定 profile
set -euo pipefail
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/lib.sh"

require_cmd node "请先安装 Node.js ≥ 22.19（https://nodejs.org）"
require_cmd pnpm "请先安装 pnpm（npm i -g pnpm 或 corepack enable）"

[ -d "$KIT_REPO_ROOT/node_modules" ] || die "仓库依赖未安装，请先运行 custom/bin/install.sh"

export DSH_HOME="$(kit_dsh_home)"
msg "DSH_HOME = $DSH_HOME"
cd "$KIT_REPO_ROOT"

if [ "$#" -eq 0 ]; then
  msg "启动 Web UI：http://127.0.0.1:3080 （Ctrl+C 退出）"
  exec pnpm dsh web
fi
exec pnpm dsh "$@"
