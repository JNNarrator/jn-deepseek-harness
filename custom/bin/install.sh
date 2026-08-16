#!/usr/bin/env bash
# 新机器首次安装 / 全量重装：
#   依赖检查 → pnpm install → 构建 → 初始化 $DSH_HOME 骨架 → 还原插件
#   → tar 备份旧 ~/.dsh → 记录本机状态
# 环境变量：KIT_SKIP_BUILD=1 跳过构建
# 注意：本套件是"干净起步"——不导入机器上已有的旧 ~/.dsh 配置；
#       旧 ~/.dsh 会被原样保留（只会被 tar 备份），不会被改动或删除。
set -euo pipefail
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/lib.sh"

KIT_BACKUP_PREFIX="${HOME:-$USERPROFILE}/.dsh.kit-backup"

msg "开始安装 dsh-kit（仓库：$KIT_REPO_ROOT）"

# ---------- 1. 依赖 ----------
node_version_ok
require_cmd pnpm "请先安装 pnpm（npm i -g pnpm 或 corepack enable）"

# ---------- 2. 仓库依赖 + 构建 ----------
cd "$KIT_REPO_ROOT"
if [ ! -d node_modules ]; then
  msg "安装仓库依赖（pnpm install）…"
  pnpm install || die "pnpm install 失败，请检查网络后重试。"
else
  msg "仓库依赖已存在，跳过 pnpm install"
fi

if [ "${KIT_SKIP_BUILD:-0}" != "1" ]; then
  msg "构建 dsh（pnpm build，耗时较长；可用 KIT_SKIP_BUILD=1 跳过）…"
  pnpm build || warn "构建失败（可稍后手动运行 pnpm build）"
else
  msg "已跳过构建（KIT_SKIP_BUILD=1）"
fi

# ---------- 3. 初始化 $DSH_HOME 骨架 ----------
export DSH_HOME="$(kit_dsh_home)"
mkdir -p "$KIT_DSH_HOME_DIR"/{profiles,skills,.agent-presets}

[ -f "$KIT_DSH_HOME_DIR/settings.yaml" ] || cat > "$KIT_DSH_HOME_DIR/settings.yaml" <<'EOF'
# dsh 用户设置（Web UI 设置页也会写到这里）
# 例：agent-presets:
#       default: standard
EOF
[ -f "$KIT_DSH_HOME_DIR/cordis.patch.yml" ] || cat > "$KIT_DSH_HOME_DIR/cordis.patch.yml" <<'EOF'
# 对所有 profile 生效的用户 patch 层
# 优先级：bundle 层 < profile 的 cordis.patch.yml < 本文件 < --patch 参数
# MCP server 配置示例：
# - id: mcp-github
#   name: '@deepseek-ai/dsh-mcp-client'
#   config:
#     serverName: github
#     transport: stdio
#     command: npx
#     args: ['-y', '@modelcontextprotocol/server-github']
[]
EOF
[ -f "$KIT_DSH_HOME_DIR/AGENTS.md" ] || cat > "$KIT_DSH_HOME_DIR/AGENTS.md" <<'EOF'
# 用户全局指令（对所有会话生效）
# 在这里写下你希望 dsh 始终遵守的规则。
EOF
[ -f "$KIT_DSH_HOME_DIR/.gitignore" ] || cp "$KIT_CUSTOM_DIR/dsh-home/.gitignore" "$KIT_DSH_HOME_DIR/.gitignore"
[ -f "$KIT_DSH_HOME_DIR/skills/.gitkeep" ] || touch "$KIT_DSH_HOME_DIR/skills/.gitkeep"
[ -f "$KIT_DSH_HOME_DIR/.agent-presets/.gitkeep" ] || touch "$KIT_DSH_HOME_DIR/.agent-presets/.gitkeep"

# ---------- 4. 还原插件（从已提交/导入的 profile package.json 重装） ----------
cd "$KIT_REPO_ROOT"
restore_profiles() {
  local profiles=() name d
  for d in "$KIT_DSH_HOME_DIR"/profiles/*/; do
    [ -d "$d" ] || continue
    name="$(basename "$d")"
    [ "$name" = "node_modules" ] && continue
    profiles+=("$name")
  done
  if [ "${#profiles[@]}" -eq 0 ]; then
    msg "没有已记录的 profile，创建默认 web profile…"
    profiles=("web")
  fi
  for name in "${profiles[@]}"; do
    msg "还原 profile「$name」插件依赖（dsh plugin --profile $name install）…"
    local attempt okflag=0
    for attempt in 1 2 3; do
      if pnpm dsh plugin --profile "$name" install; then okflag=1; break; fi
      warn "第 $attempt 次失败，重试…"
      sleep 3
    done
    if [ "$okflag" = 1 ]; then
      ok "profile「$name」插件就绪"
    else
      warn "profile「$name」插件安装失败。若 package.json 里有 link:/file: 本地路径依赖，"
      warn "请确认这些插件源码目录存在（link: 目标在别的机器上不会自动出现），"
      warn "或执行 dsh plugin --profile $name remove <包名> 移除后重试。"
    fi
  done
}
restore_profiles

# ---------- 5. tar 备份机器上已有的旧 ~/.dsh（若有，且不在仓库内） ----------
backup_path=""
local_home="$(kit_default_dsh_home)"
if [ -d "$local_home" ] && [ "$local_home" != "$KIT_DSH_HOME_DIR" ]; then
  ts="$(date +%Y%m%d-%H%M%S)"
  backup_path="${KIT_BACKUP_PREFIX}-${ts}.tgz"
  msg "备份已有的 $local_home → $backup_path（排除 sessions/storages/node_modules 等可重建数据）"
  tar -czf "$backup_path" -C "$(dirname "$local_home")" \
    --exclude='.dsh/sessions' --exclude='.dsh/storages' --exclude='.dsh/attachments' \
    --exclude='.dsh/cache' --exclude='.dsh/logs' --exclude='.dsh/change-ledger' \
    --exclude='.dsh/profiles/node_modules' --exclude='.dsh/profiles/*/node_modules' \
    --exclude='.dsh/profiles/*/pnpm-lock.yaml' \
    .dsh 2>/dev/null && ok "备份完成" || warn "备份失败（可手动备份 $local_home）"
  [ -f "$backup_path" ] || backup_path=""
fi

# ---------- 6. 记录本机安装状态 ----------
kit_state_write \
  installedAt "$(date '+%Y-%m-%dT%H:%M:%S')" \
  os "$KIT_OS" \
  dshHome "$DSH_HOME" \
  backupPath "$backup_path"

ok "安装完成！"
msg "下一步："
msg "  1) 启动：custom/bin/dsh.sh（Windows 也可用 dsh.ps1 / dsh.bat）"
msg "  2) 密钥：把 custom/env.example 复制为 custom/dsh-home/.env 并填入 DEEPSEEK_API_KEY，"
msg "     或在 Web UI「设置 → 模型」页填写（密钥存 .credentials.yaml，均不会提交 git）"
msg "  3) 记录到 git：custom/bin/save.sh（加 --push 推送到你的 GitHub fork）"
