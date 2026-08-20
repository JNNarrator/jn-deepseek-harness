# jn-deepseek-harness

[English](README.md) | 中文

> 本仓库是 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)（[DeepSeek AI](https://deepseek.com) 开发的「一切皆插件」agent harness）的个人 fork，在 [`custom/`](custom/README.md) 下增加了一套自包含的定制层（dsh-kit）。

## 关于本 fork

上游 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)（`dsh`）是 [DeepSeek AI](https://deepseek.com) 开发的开源 agent harness，由 [Cordis](https://github.com/cordiverse/cordis) 驱动。本 fork 保留上游全部代码，并增加定制层：

- **自包含 `DSH_HOME`**：`custom/dsh-home/` 就是运行时 `$DSH_HOME`，所有配置改动（插件、skill、agent 预设、设置、MCP）都落在仓库内，换新电脑 clone 即还原。
- **精选 `web` profile**：手工挑选的插件组合（vendor 源码 + npm 包），见下方[已装插件](#installed-plugins-web-profile)。
- **辅助脚本**：安装 / 启动 / 更新 / 保存 / 卸载，覆盖 macOS、Linux、Windows（`.sh` / `.ps1` / `.bat`）。
- **零冲突跟进上游**：定制内容全在 `custom/`，`custom/bin/update.sh` 拉取上游 `master` 合并，通常无冲突。

> 注意：上游仍处于开发者预览期（`0.1.0-rc`），可能有破坏性变更；更新后建议重跑 `install.sh` 还原插件。

## 快速开始

环境要求：Node.js `^22.19.0 || >=24.0.0`（nvm：`nvm use 24.19.0`），pnpm 由 corepack 提供。

```sh
git clone https://github.com/JNNarrator/jn-deepseek-harness.git
cd jn-deepseek-harness
custom/bin/install.sh
custom/bin/dsh.sh
```

`install.sh` 负责依赖检查 → pnpm install → 构建 → 初始化 `DSH_HOME` 骨架 → 还原插件；`dsh.sh` 启动 Web UI，地址 <http://127.0.0.1:3080>。

填一次密钥（`custom/dsh-home/.env` 或 Web UI「设置」页），即可开工。完整指南见 [`custom/README.md`](custom/README.md)。

### 辅助脚本

| 脚本 | 用途 |
| --- | --- |
| `custom/bin/install.sh` | 依赖检查 → pnpm install → 构建 → 初始化 DSH_HOME 骨架 → 还原插件 |
| `custom/bin/dsh.sh` | 启动 dsh（默认 Web UI，额外参数透传） |
| `custom/bin/update.sh [--push]` | 拉取上游 `master` 并合并进本 fork（可选推送） |
| `custom/bin/save.sh [--push]` | 提交本地变更（可选推送） |
| `custom/bin/uninstall.sh` | 卸载套件并恢复原 `~/.dsh` |

### 目录结构

| 路径 | 用途 |
| --- | --- |
| `custom/bin/` | dsh-kit 脚本（`lib.sh` 公共库；`.sh` / `.ps1` / `.bat` 变体） |
| `custom/dsh-home/` | `DSH_HOME` —— settings、sessions、storages、skills、profiles |
| `custom/dsh-home/profiles/web/` | `web` profile（bundle + patch 层） |
| `custom/dsh-home/.agent-presets/` | Agent 预设（如 `router-standard`） |
| `custom/dsh-home/skills/` | 本地技能（如 `j-space`） |
| `custom/vendor/` | 本地 vendor 插件，链接进 profile |

<a id="installed-plugins-web-profile"></a>

## 已装插件（`web` profile）

| 插件 | 版本 | 用途 |
| --- | --- | --- |
| `@anionex/dsh-vision-toolkit` | 0.1.35 | 视觉模型接入（`mimo-v2.5`） |
| `@dsh-external/dsh-mode-boost` | link | 任务感知思维模式路由提升 |
| `@dsh-external/dsh-refdir` | link | 引用目录工具（白名单文件夹，类 Claude Desktop） |
| `@dsh-external/dsh-super-injector` | link | 运行时插件注入（BepInEx 式） |
| `@hytime/dsh-thinking-effort` | 0.1.6 | 第三方模型推理档位 |
| `@zebbkira/dsh-skills-mcp-manager` | 0.1.3 | Skills ↔ MCP 桥接 |
| `dsh-better-sidebar` | 0.14.0 | 服务化侧边栏：文件、终端、Git、子代理 |
| `dsh-font` | 1.1.0 | 界面/代码字体切换（99 + 31 款，中西文搭配） |
| `dsh-liquid-glass` | 0.1.0 | 液态玻璃半透明主题 |
| `dsh-playwright-browser` | 0.1.3 | 浏览器自动化 |
| `dsh-smooth-stream` | 0.3.3 | Web UI 丝滑流式渲染 |

**Preset 与 Provider**：默认 agent preset `router-standard`（任务感知思维模式路由）；LLM provider `jiyuan` 与 `one-model`（均 OpenAI 兼容），默认模型 `deepseek-v4-flash-0731`。

## 文档

- dsh-kit 完整指南：[`custom/README.md`](custom/README.md)
- 插件更新准则与历史：[`custom/PLUGIN-UPDATE.md`](custom/PLUGIN-UPDATE.md)
- 上游文档：[deepseek-harness](https://github.com/deepseek-ai/deepseek-harness) —— [开发指南](docs/development.md) · [架构文档](docs/architecture.md)

## 特别鸣谢

感谢 **DeepSeek AI** 开源了优秀的 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)（MIT），也感谢 `web` profile 中所有社区插件作者的辛勤工作。

## 许可证

[MIT](LICENSE) · 第三方依赖见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)
