/**
 * dsh-refdir — 引用目录插件（独立版，从 dsh-thinking-effort 拆分）
 *
 * 为会话添加可读写的白名单文件夹，注册 refdir_list/read/write/edit/grep 五个动态工具。
 * 适配 dsh 0.1.0-rc.8，修复 commands.execute 第三参数问题。
 */
import * as refdir from './modules/refdir.js'

export const name = '@dsh-external/dsh-refdir'

export const inject = refdir.inject

export function apply(ctx, config) {
  refdir.apply(ctx, config)
}