#!/usr/bin/env bash
# dsh-kit 公共库 —— 被 custom/bin/ 下所有 .sh 脚本 source。
# 职责：路径解析、平台判断、DSH_HOME 计算、输出与状态文件读写。

set -euo pipefail

# ---------- 路径 ----------
KIT_BIN_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
KIT_CUSTOM_DIR="$(dirname "$KIT_BIN_DIR")"
KIT_REPO_ROOT="$(dirname "$KIT_CUSTOM_DIR")"
KIT_DSH_HOME_DIR="$KIT_CUSTOM_DIR/dsh-home"
KIT_STATE_FILE="$KIT_CUSTOM_DIR/.kit-state.json"

# ---------- 平台 ----------
case "$(uname -s)" in
  MINGW*|MSYS*|CYGWIN*) KIT_OS=windows ;;
  Darwin*)              KIT_OS=macos ;;
  Linux*)               KIT_OS=linux ;;
  *)                    KIT_OS=unknown ;;
esac

# DSH_HOME 的绝对路径；Windows 上转成 D:\... 形式（node 更稳妥）
kit_dsh_home() {
  if [ "$KIT_OS" = windows ] && command -v cygpath >/dev/null 2>&1; then
    cygpath -w "$KIT_DSH_HOME_DIR"
  else
    echo "$KIT_DSH_HOME_DIR"
  fi
}

# dsh 未设置 DSH_HOME 时的默认家目录：~/.dsh
kit_default_dsh_home() {
  echo "${HOME:-$USERPROFILE}/.dsh"
}

# ---------- 输出 ----------
msg()  { printf '\033[1;36m[dsh-kit]\033[0m %s\n' "$*"; }
ok()   { printf '\033[1;32m[dsh-kit ✓]\033[0m %s\n' "$*"; }
warn() { printf '\033[1;33m[dsh-kit !]\033[0m %s\n' "$*" >&2; }
die()  { printf '\033[1;31m[dsh-kit ✗]\033[0m %s\n' "$*" >&2; exit 1; }

# ---------- 依赖检查 ----------
require_cmd() {
  command -v "$1" >/dev/null 2>&1 || die "缺少依赖：$1。$2"
}

node_version_ok() {
  require_cmd node "请安装 Node.js ≥ 22.19（https://nodejs.org）"
  if ! node -e 'const [maj,min]=process.versions.node.split(".").map(Number); process.exit(maj>22||(maj===22&&min>=19)?0:1)'; then
    die "Node.js 版本过低：$(node --version)（需要 ≥ 22.19）"
  fi
}

# ---------- 状态文件（.kit-state.json，gitignored） ----------
kit_state_read() { # $1=key  $2=默认值
  node -e 'const fs=require("fs");try{const s=JSON.parse(fs.readFileSync(process.argv[1],"utf8"));console.log(s[process.argv[2]]??process.argv[3])}catch{console.log(process.argv[3])}' \
    "$KIT_STATE_FILE" "$1" "${2:-}"
}

kit_state_write() { # $@ = key value 键值对（值统一按字符串处理，路径安全）
  mkdir -p "$(dirname "$KIT_STATE_FILE")"
  KIT_STATE_FILE="$KIT_STATE_FILE" node -e '
    const fs = require("fs");
    const a = process.argv.slice(1);
    const o = {};
    for (let i = 0; i + 1 < a.length; i += 2) o[a[i]] = a[i + 1];
    fs.writeFileSync(process.env.KIT_STATE_FILE, JSON.stringify(o) + "\n", { mode: 0o600 });
  ' "$@"
}
