#!/usr/bin/env bash
# 完全卸载：恢复安装前备份的 ~/.dsh，并删除整个仓库目录。
# 默认需确认；KIT_YES=1 或传 --yes 跳过确认。
set -euo pipefail
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/lib.sh"

confirm() {
  [ "${KIT_YES:-0}" = "1" ] || [ "${1:-}" = "--yes" ] && return 0
  read -r -p "$2 [y/N] " ans
  case "$ans" in y|Y|yes|YES) return 0 ;; *) return 1 ;; esac
}

# 安全校验：这确实是一个 dsh-kit 仓库
[ -d "$KIT_REPO_ROOT/.git" ] || die "未找到仓库 $KIT_REPO_ROOT（可能已删除或路径不对）"
[ -d "$KIT_DSH_HOME_DIR" ] || warn "未找到 $KIT_DSH_HOME_DIR，跳过配置清理"

confirm "$@" "确认完全卸载？将恢复旧 ~/.dsh（如有）并删除仓库目录 $KIT_REPO_ROOT" || die "已取消"

# ---------- 1. 恢复安装前备份的 ~/.dsh ----------
backup_path="$(kit_state_read backupPath "")"
# Windows：state 里存的是 D:/... 形式路径，MSYS 的 tar 会把 "D:" 误当远程主机，先转回 /d/ 形式
if [ "$KIT_OS" = windows ] && command -v cygpath >/dev/null 2>&1 && [ -n "$backup_path" ]; then
  backup_path="$(cygpath -u "$backup_path")"
fi
local_home="$(kit_default_dsh_home)"
if [ -n "$backup_path" ] && [ -e "$backup_path" ]; then
  msg "恢复 ~/.dsh 备份：$backup_path"
  rm -rf "$local_home"
  case "$backup_path" in
    *.tgz|*.tar.gz)
      mkdir -p "$local_home"
      if tar -xzf "$backup_path" -C "$(dirname "$local_home")"; then
        ok "已从备份恢复 ~/.dsh"
        rm -f "$backup_path"
      else
        warn "从备份恢复失败：$backup_path"
      fi
      ;;
    *)
      mv "$backup_path" "$local_home" || warn "恢复备份失败"
      ok "已恢复 ~/.dsh"
      ;;
  esac
elif [ -n "$backup_path" ]; then
  warn "备份 $backup_path 不存在，跳过恢复"
fi

# ---------- 2. 保护 .zcode（ZCode 会话数据，不属于本套件） ----------
zcode_backup=""
if [ -d "$KIT_REPO_ROOT/.zcode" ]; then
  zcode_backup="${HOME:-$USERPROFILE}/.zcode.kit-backup-$(date +%Y%m%d-%H%M%S)"
  msg "仓库内有 .zcode（ZCode 会话数据），移到 $zcode_backup 保留"
  mv "$KIT_REPO_ROOT/.zcode" "$zcode_backup" || warn "移动 .zcode 失败，将随仓库一并删除"
fi

# ---------- 3. 删除仓库目录 ----------
cd "${HOME:-$USERPROFILE}" || cd /tmp
if rm -rf "$KIT_REPO_ROOT" 2>/dev/null; then
  ok "已删除仓库目录：$KIT_REPO_ROOT"
else
  warn "删除目录失败（可能被进程占用）。请手动删除：$KIT_REPO_ROOT"
fi

ok "卸载完成，机器已回到使用 dsh-kit 之前的状态"
