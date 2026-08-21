# 插件更新准则（custom 插件清单与升级流程）

> 本文档是 custom 定制里所有插件的唯一「更新准则」记录：列出插件清单、上游来源、
> 检查/升级命令、以及历次踩过的坑。升级插件前先读这里，升级后更新「历史记录」段。

## 一、插件清单

### 1. vendor 目录（git 跟踪的本地源码，手动同步）

| 插件 | 本地版本 | 上游 | 检查方式 |
|---|---|---|---|
| `dsh-mode-boost`（模式提升插件） | 0.1.0 | `github.com/yjh051108/dsh-mode-boost` | GitHub Releases API |

> vendor 里的插件是源码快照（含 `lib/` 编译产物），不走 npm，靠手动拉上游更新。
> `dsh-refdir` 为本地自建插件（从 dsh-thinking-effort 拆分），无上游，不在此列。

### 2. npm 依赖（`custom/dsh-home/profiles/web/package.json`）

| 插件 | 依赖声明 | 上游 | 检查方式 |
|---|---|---|---|
| `@anionex/dsh-vision-toolkit` | `^0.1.38` | npm | `npm view` |
| `dsh-playwright-browser` | `^0.1.3` | npm | `npm view` |
| `dsh-skill-mcp-panel` | `.../v2.0.1/dsh-skill-mcp-panel-2.0.1.tgz` | GitHub Releases | GitHub Releases API |
| `dsh-tick-rail` | `.../v0.1.5/dsh-tick-rail-0.1.5.tgz` | GitHub Releases | GitHub Releases API |
| `dsh-skill-picker` | `github:a735624258/dsh-skill-picker` | GitHub main | GitHub API（无 release） |
| `dsh-effort-slider` | `github:2768651338/dsh-effort-slider` | GitHub main | GitHub API（无 release） |
| `dsh-ui-font` | `github:warmwine/dsh-ui-font` | GitHub main | GitHub API（无 release） |
| `@kelearns/dsh-navigation-bar` | `^0.2.1` | npm | `npm view` |

### 3. 预设 + Skill（文件拷贝，不走 npm）

| 名称 | 类型 | 本地目录 | 上游 | 检查方式 |
|---|---|---|---|---|
| `router-standard` | agent-preset | `custom/dsh-home/.agent-presets/router-standard/` | `github.com/yjh051108/dsh-router-standard` | GitHub Releases API |
| `j-space` | skill | `custom/dsh-home/skills/j-space/` | `github.com/Tiger3807861189/J-Space-Cognition-Suite-V3.6` | GitHub Releases API |

> 预设和 Skill 是纯文件拷贝，无包管理器参与。更新时直接替换目录内容即可。

## 二、检查更新命令

```bash
# vendor 插件（GitHub 上游）
curl -sS "https://api.github.com/repos/<owner>/<repo>/releases/latest" \
  | python3 -c "import sys,json;d=json.load(sys.stdin);print(d.get('tag_name'),d.get('published_at'))"

# npm 插件（本地 vs 最新）
for pkg in @anionex/dsh-vision-toolkit dsh-playwright-browser; do
  echo -n "$pkg 本地="; node -e "console.log(require('./custom/dsh-home/profiles/web/node_modules/$pkg/package.json').version)" 2>/dev/null || echo "(未装)"
  echo -n "    最新="; npm view "$pkg" version
done

# tarball 插件（GitHub Releases）
for repo in Fishquito7/dsh-skill-mcp-panel caisiyang123/dsh-tick-rail; do
  echo -n "$repo 最新="; curl -sS "https://api.github.com/repos/$repo/releases/latest" \
    | python3 -c "import sys,json;d=json.load(sys.stdin);print(d.get('tag_name'))"
done

# git 直装插件（无 release，查默认分支最新 commit）
for repo in a735624258/dsh-skill-picker 2768651338/dsh-effort-slider warmwine/dsh-ui-font; do
  echo -n "$repo 最新 commit="; curl -sS "https://api.github.com/repos/$repo/commits" \
    | python3 -c "import sys,json;d=json.load(sys.stdin);print(d[0]['sha'][:8], d[0]['commit']['committer']['date'])"
done
```

## 三、升级 npm 插件（以 vision-toolkit 为例）

```bash
cd /Users/jiangnan/Documents/deepseek/jn-deepseek-harness/custom/dsh-home/profiles/web

# 1. 改 package.json 里的版本声明（^0.1.23 → ^0.1.32）

# 2. 【关键】同步 pnpm 版本豁免：pnpm-workspace.yaml 里的
#    minimumReleaseAgeExclude 必须把写死的版本号改成新版本：
#      - '@anionex/dsh-vision-toolkit@0.1.23'  →  '@anionex/dsh-vision-toolkit@0.1.32'
#    （pnpm 默认拒绝安装发布太新的包，忘了改会装不上新版本）

# 3. 更新 lockfile + node_modules（非交互 shell 要先 source nvm 切 Node 24）
export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh" && nvm use 24.19.0
pnpm install

# 4. 记录到 git
cd /Users/jiangnan/Documents/deepseek/jn-deepseek-harness
bash custom/bin/save.sh
```

## 四、注意事项（历次踩坑）

1. **版本豁免同步**：`minimumReleaseAgeExclude` 写死了具体版本号，升级时必须同步改，
   否则 pnpm 拒绝安装新版本（这是 pnpm 的供应链保护特性）。
2. **macOS 专属 python 路径**：`custom/dsh-home/profiles/web/cordis.patch.macos.yml`
   里写死 `runtime.python: /opt/homebrew/bin/python3.12`（系统自带 3.9 不满足
   插件 ≥3.11 要求）。升级 vision-toolkit 后此配置仍需保留；0.1.29+ 虽支持
   「零 Python 自动下载」，但显式覆盖仍优先，不受影响。
3. **Skill 改名**：vision-toolkit 0.1.31 起，内置 Skill 从 `vision-tools` 改名为
   `vision-skills`。旧会话仍能从 `vision-tools` 历史恢复激活，新会话用 `/vision-skills`。
4. **非交互 shell 无 pnpm**：脚本里跑 `pnpm` 前必须先 `source $NVM_DIR/nvm.sh`
   切 Node 24，否则 `pnpm: command not found`（lefthook 的 typecheck 也会因此失败，
   提交时用 `--no-verify` 跳过环境受限的钩子）。
5. **settings.yaml 的 provider 配置**：升级插件不会动 `custom/dsh-home/settings.yaml`
   里的 `vision-toolkit.provider` 等用户配置，升级后无需重配，但要留意新版本
   是否有 schema 变更（查上游 CHANGELOG）。
6. **dsh-skill-picker 本地补丁**（node_modules 补丁，`pnpm install` 后需重新打）：
   - **slot 位置**：`lib/client.js` + `src/client.jsx` 中 `conversation.input.right` →
     `conversation.input.left`，order 100 → 60（挪到左侧工具栏，紧跟 refdir 文件夹图标之后）。
   - **图标风格**：`custom/vendor/dsh-refdir/client.js` 的 CSS 覆盖（git 跟踪），
     将闪电图标的渐变填充改为 Lucide 线条风格（`fill:none; stroke:currentColor; stroke-width:2`）。
   - 重装后重新打补丁：`sed -i '' 's/conversation\.input\.right/conversation.input.left/g; s/order: 100/order: 60/g' node_modules/dsh-skill-picker/lib/client.js`

## 五、历史记录

| 日期 | 插件 | 变更 |
|---|---|---|
| 2026-08-21 | dsh-ui-font | 新增 0.9.2（git 直装）；替代 dsh-font |
| 2026-08-21 | dsh-font | 卸载（不能调字号，替换为 dsh-ui-font） |
| 2026-08-21 | dsh-plan-switch | 卸载（有 bug） |
| 2026-08-21 | dsh-tick-rail | 新增 0.1.5（GitHub Releases tarball） |
| 2026-08-21 | dsh-skill-picker | 新增 0.2.0（git 直装） |
| 2026-08-21 | dsh-effort-slider | 新增 0.2.5（git 直装）；替代 @hytime/dsh-thinking-effort |
| 2026-08-21 | @hytime/dsh-thinking-effort | 卸载（替换为 dsh-effort-slider，交互更佳） |
| 2026-08-21 | dsh-skill-mcp-panel | 新增 2.0.1（GitHub Releases tarball）；替代 @zebbkira/dsh-skills-mcp-manager |
| 2026-08-21 | @zebbkira/dsh-skills-mcp-manager | 卸载（替换为 dsh-skill-mcp-panel，功能更强） |
| 2026-08-21 | @anionex/dsh-vision-toolkit | 0.1.35 → 0.1.38（pnpm 自动记入 release-age 豁免） |
| 2026-08-21 | dsh-smooth-stream | 0.3.3 → 0.3.4（pnpm 自动记入 release-age 豁免） |
| 2026-08-21 | dsh-super-injector | 卸载（无用）；移除 vendor + bundle + 运行时目录 |
| 2026-08-21 | @hytime/dsh-thinking-effort | latest 自动升级 0.1.6 → 0.1.7 |
| 2026-08-19 | dsh-mode-boost | 新增 vendor 0.1.0 + 注册到 profile |
| 2026-08-19 | router-standard | 更新预设：0.1.x → 0.2.0（拆分为 router-spec + router-standard 双预设，新增 bootstrap v5-v8） |
| 2026-08-19 | j-space | 更新 skill：v3.6.0 → v3.6.1（SKILL.md 266 行） |
| 2026-08-20 | dsh-thinking-effort | 卸载 0.5.2（a1141171521），拆分为 @hytime/dsh-thinking-effort 0.1.6 + @dsh-external/dsh-refdir 0.1.0 |
| 2026-08-18 | 全部 | 上游 harness rc.5 → rc.7；建立本准则文档 |
| 2026-08-18 | @anionex/dsh-vision-toolkit | 0.1.23 → 0.1.32 |

## 六、项目与工具记录

### dsh-thinking-effort（a1141171521 版）— 已卸载（2026-08-20）

- 仓库：https://github.com/a1141171521/dsh-thinking-effort
- 版本 0.5.2，安装于 2026-08-19，**2026-08-20 卸载**。
- 卸载原因：拆分为 @hytime/dsh-thinking-effort（推理档位更强、免补丁）+ @dsh-external/dsh-refdir（引用目录独立插件）。
- 本地修复记录：`client.js` 第 109 行 `commands.execute(sessionId, line)` 需补第三个参数 `[]`（rc.8 新增 `images` 参数）。

### @hytime/dsh-thinking-effort（hytime 版推理档位插件）— 已卸载（2026-08-21）

- 仓库：https://github.com/hytime/dsh-thinking-effort
- 说明：为 DSH 的 pi-ai 第三方模型补充可配置的思考强度档位。每模型可配、DSH 档位→线上值映射（如 high→ultra）、子 agent 默认档位。设置页逐模型勾选档位+自由填写 gateway 值。中英日韩多语言。走标准 slots/settings API。
- 安装历史：`@hytime/dsh-thinking-effort@latest`，0.1.6 → 0.1.7（2026-08-21 latest 自动升级）。
- **2026-08-21 卸载**：替换为 dsh-effort-slider（仿 Claude Code 无极滑块交互，更炫）。两者同类功能（为第三方模型补推理档位），不能共存。

### dsh-effort-slider（仿 Claude Code 推理等级滑块）— 2026-08-21 安装

- 仓库：https://github.com/2768651338/dsh-effort-slider
- 说明：拦截「推理等级」菜单行 → 弹出自定义无极拖动滑块（松手吸附 + WebGL 火焰跟随），任何第三方模型/提供商的思考强度都真实生效。自动注入通用 5 档 + pi-ai 线级补写（热生效）。
- 安装方式：`github:2768651338/dsh-effort-slider`（无 release，git 直装；lib/ 已提交无需构建）。
- 已安装版本：0.2.5（2026-08-21）。
- 兼容性：✅ dsh 0.1.0-rc.8 dump-config 装配通过（id: ui-effort-slider）。
- 注意：⚠️ 不能与其他「拦截推理等级菜单行」的插件共存（会双面板）。
- 使用：Composer 模型菜单 →「推理等级」→ 拖动滑块。

### @dsh-external/dsh-refdir（引用目录独立插件）— 2026-08-20 创建并安装

- 来源：从 a1141171521/dsh-thinking-effort 拆分 refdir 模块，独立为 vendor 插件。
- 路径：`custom/vendor/dsh-refdir/`
- 说明：为会话添加可读写的白名单文件夹，注册 refdir_list/read/write/edit/grep 五个动态工具。类似 Claude Desktop 附加文件夹——AI 可直读/写/搜白名单目录，不越界。
- 已安装到本地 dsh：`pnpm dsh plugin --profile web add custom/vendor/dsh-refdir`，版本 0.1.0（2026-08-20）。
- 兼容性：✅ dsh 0.1.0-rc.8 dump-config 装配通过，commands.execute 已修复第三参数。
- 美化：重写 CSS（玻璃面板、slide-up 动画、hover 过渡、品牌色强调、backdrop-filter 模糊、自定义滚动条）。
- 使用：输入框左侧 📁 芯片 / 会话头部按钮 / 输入框 + 按钮菜单「引用目录」。

### dsh-stylevault（StyleVault 经典主题合集）

- 仓库：https://github.com/GptsApp/dsh-stylevault
- 说明：30 套开源配色（Catppuccin/Nord/Tokyo Night/Gruvbox/Dracula 等）+ 完整 Style Settings 面板。颜色/字体/字号/圆角均可 live 调，配置可导出/导入/分享。纯 CSS token 覆盖，不碰布局，不和官方 Appearance 冲突。
- 版本 0.3.0，2026-08-20 安装，**同日卸载**（用更轻的 dsh-font + dsh-liquid-glass 替代）。
- 卸载命令：从 `custom/dsh-home/profiles/web/package.json` 移除依赖和 bundle 声明后 `pnpm install`。

### dsh-font（DSH 字体切换器）— 已卸载（2026-08-21）

- 仓库：https://github.com/tianyhjg-lab/dsh-font
- 说明：99 个界面字体 + 31 个代码字体，中文（黑体/宋体/楷仿/手写）+ 西文（衬线/无衬线/展示）全分组覆盖，中西文自动搭配，即选即生效，localStorage 持久化。改 `--dsw-font-family` 和 `--ds-font-family-code` 两个 token 全局生效，不打包字体文件不联网。
- 安装历史：`dsh plugin --profile web add github:tianyhjg-lab/dsh-font`，版本 1.1.0（2026-08-20 安装）。
- **2026-08-21 卸载**：只能换字体、不能调节字号，用户反馈后替换为 dsh-ui-font（支持全局字号缩放 + 准星逐区微调）。

### dsh-ui-font（全局字号/字体工具，老花眼插件）— 2026-08-21 安装

- 仓库：https://github.com/warmwine/dsh-ui-font
- 说明：全局字号缩放（-3~+20px 滑杆，立即生效）；普通文字/代码字体分别从系统已装字体里选（host 侧 sfnt name 表纯 fs 解析，无子进程）；🎯 准星选取：点哪调哪（同类文字全局统一、插件组件单独调、其它兜底跟全局）；每块界面单独微调（全局偏移 + 个体偏移叠加）；三个可录快捷键槽。
- 安装方式：`github:warmwine/dsh-ui-font`（无 release，git 直装；lib/ 已提交、无 install 脚本，不触发 allowBuilds）。
- 已安装版本：0.9.2（2026-08-21）。
- 兼容性：✅ dsh 0.1.0-rc.8 dump-config 装配通过（id: ui-font）。host 侧依赖 `webServer` 服务注册 `/api/dsh-ui-font/fonts` + `/api/dsh-ui-font/descriptions` 两个 loopback 路由。
- 使用：设置 → 字体（settings.section，order 95）。

### dsh-liquid-glass（液态玻璃主题）

- 仓库：https://github.com/Ultronen/dsh-liquid-glass
- 说明：全界面透明化——页面底层、卡片、面板、聊天气泡、代码块经 ThemeRuntime token 覆盖层变半透玻璃。一个透明度主滑块（3%–95%），可设自定义背景图。亮色用中性白、暗色用近黑。纯 CSS token 覆盖，无 WebGPU。
- 已安装到本地 dsh：`dsh plugin --profile web add dsh-liquid-glass`，版本 0.1.0（安装于 2026-08-20）。
- 兼容性：✅ dsh 0.1.0-rc.8 dump-config 装配通过。
- 使用：设置 → 通用 → 液态玻璃。偏好存 localStorage，卸载后无害残留。
- 注意：和 dsh-ui-font 同属样式层，叠加使用无冲突。
- 注意事项：
  - 安装后**需重启 DSH 进程**才加载（`dsh.client` 启动时扫描）。
  - 激活时自动为 `llm-pi-ai` 下模型写入 `reasoningEfforts` 声明并钉 `reasoning: high`（写 settings.yaml）；**卸载插件不会回滚**这些写入，需手动编辑 settings.yaml 移除。
  - 若厂商端点不识别 `reasoning_effort`，请求可能被厂商拒绝，此时手动删掉该模型的 `reasoningEfforts` 块与 provider 的 `reasoning` 行。

### dsh-better-sidebar（服务化侧边栏框架）

- 仓库：https://github.com/omdsh-dev/DSH-better-sidebar
- 说明：服务化侧边栏框架 + 完整工作台。内置：文件资源管理器（懒加载树 + CodeMirror 编辑器 + Markdown/PDF/Office 预览）、内嵌浏览器（多 tab 沙箱）、真实终端（xterm.js + node-pty）、Git 面板（真 diff + VSCode 式 diff tab）、后台任务（subagent 拓扑）、双工作台（右侧栏 + 底部面板拖拽拆分）。核心 ~325KB，懒加载。`ctx.betterSidebar` API 开放给第三方插件。
- 已安装到本地 dsh：`pnpm dsh plugin --profile web add dsh-better-sidebar@latest`，版本 0.14.0（2026-08-20 升级：0.13.1 → 0.14.0，peer deps 全部升至 rc.8，修复 editor chunk 加载失败）。
- 兼容性：✅ dsh 0.1.0-rc.8 已适配，dump-config 装配通过。
- 安装坑：`node-pty` 需要批准构建（`pnpm approve-builds node-pty`），否则 pnpm 安全策略拦截导致安装失败。

### dsh-tick-rail（会话刻度线导航条）— 2026-08-21 安装

- 仓库：https://github.com/caisiyang123/dsh-tick-rail
- 说明：会话旁一列刻度线当提问索引（每发一条消息一个刻度，跳过助手回复）。峰值高亮（最长刻度点亮 + 周围衰减）、悬停预览、点击跳转。纯 Web 客户端插件，挂 `shell.overlay` 插槽，跟随主题 token。
- 安装方式：GitHub Releases tarball（README 提醒勿用 git 直装，会触发 pnpm allowBuilds 拦截）。
- 已安装版本：0.1.5（2026-08-21）。
- 兼容性：✅ dsh 0.1.0-rc.8 dump-config 装配通过（id: dsh-tick-rail）。已用 CDP 无头浏览器实测：组件正常挂载 `shell.overlay`、无 JS 错误。
- **显示条件（易误判为“没生效”）**：源码 `MIN_TICKS = 3`，只有**自己发的消息 ≥ 3 条**（仅 user/steering，跳过 AI 回复）时才渲染刻度线；空会话或消息不足时 `visible=false` 不显示，属设计行为。

### dsh-plan-switch（Plan 模式一键切换）— 已卸载（2026-08-21）

- 仓库：https://github.com/a903067276-rgb/dsh-plan-switch
- 说明：输入框一键进/出 Plan 模式按钮（挂 `conversation.input.left` 插槽），点击执行官方 `/plan` 命令，全流程走官方命令链。
- 安装历史：0.3.0（2026-08-21 安装）。
- **2026-08-21 卸载**：有 bug（用户反馈）。移除依赖 + bundle 声明，install 自动清理。

### dsh-skill-picker（输入框技能选择器）— 2026-08-21 安装

- 仓库：https://github.com/a735624258/dsh-skill-picker
- 说明：输入框工具行右侧 ⚡ 按钮，点开可搜索/点选已安装技能，选中后把官方 `/技能名` 手势插入发送框，随消息发出由 DSH 原生机制加载。WorkBuddy 式交互。挂 `conversation.input.right` 插槽，走官方 skills API。
- 安装方式：`github:a735624258/dsh-skill-picker`（无 release，git 直装；lib/ 已提交无需本地构建）。
- 已安装版本：0.2.0（2026-08-21）。
- 兼容性：✅ dsh 0.1.0-rc.8 dump-config 装配通过（id: dsh-skill-picker）。
- 与 dsh-skill-mcp-panel 互补：panel 管技能/MCP 管理，picker 管输入时快速选技能。

### dsh-skill-mcp-panel（技能 & MCP 管理面板）— 2026-08-21 安装

- 仓库：https://github.com/Fishquito7/dsh-skill-mcp-panel
- 说明：在 Web 设置页同时提供「技能」与「MCP」两个管理面板，并随包提供统一终端命令 `dsh-panel`（skill / mcp 子命令族）。skill 卡片列表/启用停用/删除/搜索/拖入安装/工作区分栏/批量迁移/技能分组/作用域化管理；MCP 支持 Stdio 与 HTTP 两种方式，写 profile `cordis.patch.yml` 受管块，DSH HMR 热加载。
- 安装方式：首选 GitHub Releases tarball（不走 Git，不受 pnpm v11 构建脚本限制）。
- 已安装到本地 dsh：依赖声明 `https://github.com/Fishquito7/dsh-skill-mcp-panel/releases/download/v2.0.1/dsh-skill-mcp-panel-2.0.1.tgz`，版本 2.0.1（2026-08-21）。
- 兼容性：✅ dsh 0.1.0-rc.8 dump-config 装配通过（id: skill-mcp-panel）。
- 使用：设置 → 插件下方「技能」→ 下方「MCP」；或终端 `dsh-panel skill|mcp ...`。
- 注意：MCP 连接与工具注册仍依赖官方 `@deepseek-ai/dsh-mcp-client`（base 自带）。

### @zebbkira/dsh-skills-mcp-manager（Skills↔MCP 桥接）— 已卸载（2026-08-21）

- 仓库：https://www.npmjs.com/package/@zebbkira/dsh-skills-mcp-manager
- 版本 0.1.3，npm 依赖，**2026-08-21 卸载**。
- 卸载原因：替换为 dsh-skill-mcp-panel（功能更强：Web 双面板 + dsh-panel CLI + 分组/迁移/作用域管理）。
- 卸载内容：`custom/dsh-home/profiles/web/package.json` 的依赖 + bundle 声明（install 时 pnpm 自动清理）。

### dsh-super-injector（超级模组注入器）— 已卸载（2026-08-21）

- 仓库：https://github.com/yjh051108/dsh-super-injector
- 版本 0.3.3，vendor 源码快照，**2026-08-21 卸载**。
- 卸载原因：实际无用（运行时插件注入/热重载/侧挂转正能力未用上）。
- 卸载内容：`custom/vendor/dsh-super-injector/`（git rm）、`custom/dsh-home/profiles/web/package.json` 的依赖 + bundle 声明、`custom/dsh-home/super-injector/` 运行时目录（self-heal.log）、`custom/.gitignore` 的 `!vendor/dsh-super-injector/lib/` 豁免。
