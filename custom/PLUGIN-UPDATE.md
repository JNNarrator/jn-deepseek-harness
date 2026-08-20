# 插件更新准则（custom 插件清单与升级流程）

> 本文档是 custom 定制里所有插件的唯一「更新准则」记录：列出插件清单、上游来源、
> 检查/升级命令、以及历次踩过的坑。升级插件前先读这里，升级后更新「历史记录」段。

## 一、插件清单

### 1. vendor 目录（git 跟踪的本地源码，手动同步）

| 插件 | 本地版本 | 上游 | 检查方式 |
|---|---|---|---|
| `dsh-super-injector`（超级模组注入器） | 0.3.3 | `github.com/yjh051108/dsh-super-injector` | GitHub Releases API |
| `dsh-mode-boost`（模式提升插件） | 0.1.0 | `github.com/yjh051108/dsh-mode-boost` | GitHub Releases API |

> vendor 里的插件是源码快照（含 `lib/` 编译产物），不走 npm，靠手动拉上游更新。
> 注意：`dsh-super-injector` 的 `lib/client.js` 做过本地修复（`slots.register` 双参数
> React 组件 + label 改为「超级模组」）。上游同步后要重新确认该修复是否仍存在。

### 2. npm 依赖（`custom/dsh-home/profiles/web/package.json`）

| 插件 | 依赖声明 | 上游 | 检查方式 |
|---|---|---|---|
| `@anionex/dsh-vision-toolkit` | `^0.1.23` | npm | `npm view` |
| `@zebbkira/dsh-skills-mcp-manager` | `^0.1.3` | npm | `npm view` |
| `dsh-playwright-browser` | `^0.1.3` | npm | `npm view` |

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
for pkg in @anionex/dsh-vision-toolkit @zebbkira/dsh-skills-mcp-manager dsh-playwright-browser; do
  echo -n "$pkg 本地="; node -e "console.log(require('./custom/dsh-home/profiles/web/node_modules/$pkg/package.json').version)" 2>/dev/null || echo "(未装)"
  echo -n "    最新="; npm view "$pkg" version
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
4. **super-injector 本地修复**：vendor 里的 `lib/client.js` 有本地修复（见上文），
   同步上游后要 diff 确认修复未被覆盖。
5. **非交互 shell 无 pnpm**：脚本里跑 `pnpm` 前必须先 `source $NVM_DIR/nvm.sh`
   切 Node 24，否则 `pnpm: command not found`（lefthook 的 typecheck 也会因此失败，
   提交时用 `--no-verify` 跳过环境受限的钩子）。
6. **settings.yaml 的 provider 配置**：升级插件不会动 `custom/dsh-home/settings.yaml`
   里的 `vision-toolkit.provider` 等用户配置，升级后无需重配，但要留意新版本
   是否有 schema 变更（查上游 CHANGELOG）。

## 五、历史记录

| 日期 | 插件 | 变更 |
|---|---|---|
| 2026-08-19 | dsh-mode-boost | 新增 vendor 0.1.0 + 注册到 profile |
| 2026-08-19 | router-standard | 更新预设：0.1.x → 0.2.0（拆分为 router-spec + router-standard 双预设，新增 bootstrap v5-v8） |
| 2026-08-19 | j-space | 更新 skill：v3.6.0 → v3.6.1（SKILL.md 266 行） |
| 2026-08-20 | dsh-thinking-effort | 卸载 0.5.2（a1141171521），拆分为 @hytime/dsh-thinking-effort 0.1.6 + @dsh-external/dsh-refdir 0.1.0 |
| 2026-08-18 | 全部 | 上游 harness rc.5 → rc.7；建立本准则文档 |

## 六、项目与工具记录

### dsh-thinking-effort（a1141171521 版）— 已卸载（2026-08-20）

- 仓库：https://github.com/a1141171521/dsh-thinking-effort
- 版本 0.5.2，安装于 2026-08-19，**2026-08-20 卸载**。
- 卸载原因：拆分为 @hytime/dsh-thinking-effort（推理档位更强、免补丁）+ @dsh-external/dsh-refdir（引用目录独立插件）。
- 本地修复记录：`client.js` 第 109 行 `commands.execute(sessionId, line)` 需补第三个参数 `[]`（rc.8 新增 `images` 参数）。

### @hytime/dsh-thinking-effort（hytime 版推理档位插件）— 2026-08-20 安装

- 仓库：https://github.com/hytime/dsh-thinking-effort
- 说明：为 DSH 的 pi-ai 第三方模型补充可配置的思考强度档位。每模型可配、DSH 档位→线上值映射（如 high→ultra）、子 agent 默认档位。设置页逐模型勾选档位+自由填写 gateway 值。中英日韩多语言。走标准 slots/settings API，无 commands.execute 兼容问题，**零补丁**。
- 已安装到本地 dsh：`@hytime/dsh-thinking-effort@latest`，版本 0.1.6（2026-08-20）。
- 兼容性：✅ dsh 0.1.0-rc.8 dump-config 装配通过。
- 使用：设置 → 思考强度档位。

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

### dsh-font（DSH 字体切换器）

- 仓库：https://github.com/tianyhjg-lab/dsh-font
- 说明：99 个界面字体 + 31 个代码字体，中文（黑体/宋体/楷仿/手写）+ 西文（衬线/无衬线/展示）全分组覆盖，中西文自动搭配，即选即生效，localStorage 持久化。改 `--dsw-font-family` 和 `--ds-font-family-code` 两个 token 全局生效，不打包字体文件不联网。
- 已安装到本地 dsh：`dsh plugin --profile web add github:tianyhjg-lab/dsh-font`，版本 1.1.0（安装于 2026-08-20）。
- 兼容性：✅ dsh 0.1.0-rc.8 dump-config 装配通过。
- 使用：设置 → 常规 → 字体，选择界面字体/代码字体。

### dsh-liquid-glass（液态玻璃主题）

- 仓库：https://github.com/Ultronen/dsh-liquid-glass
- 说明：全界面透明化——页面底层、卡片、面板、聊天气泡、代码块经 ThemeRuntime token 覆盖层变半透玻璃。一个透明度主滑块（3%–95%），可设自定义背景图。亮色用中性白、暗色用近黑。纯 CSS token 覆盖，无 WebGPU。
- 已安装到本地 dsh：`dsh plugin --profile web add dsh-liquid-glass`，版本 0.1.0（安装于 2026-08-20）。
- 兼容性：✅ dsh 0.1.0-rc.8 dump-config 装配通过。
- 使用：设置 → 通用 → 液态玻璃。偏好存 localStorage，卸载后无害残留。
- 注意：和 dsh-font 同属样式层，叠加使用无冲突。
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

| 2026-08-18 | @anionex/dsh-vision-toolkit | 0.1.23 → 0.1.32 |
| 2026-08-17 | dsh-super-injector | 本地修复 slots.register + label「超级模组」 |
