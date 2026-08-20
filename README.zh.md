# DeepSeek Harness

[English](README.md) | 中文

DeepSeek Harness（`dsh`）是由 [DeepSeek AI](https://deepseek.com) 开发的开源 agent harness（智能体框架）。

它采用**一切皆插件**的架构，并由 [Cordis](https://github.com/cordiverse/cordis) 驱动，其设计参见论文 [_A Programming Paradigm for Spatiotemporal Composability_](https://github.com/cordiverse/paper)。

## 定制层（dsh-kit）

本仓库是 DeepSeek Harness 的个人 fork，在 `custom/` 下增加了定制层（“dsh-kit”）：自包含的 `DSH_HOME`、精选的 `web` profile、本地 vendor 插件，以及安装 / 更新 / 保存 / 卸载辅助脚本。

### 快速开始

环境要求：Node.js `^22.19.0 || >=24.0.0`（nvm：`nvm use 24.19.0`），pnpm 由 corepack 提供。

```sh
custom/bin/install.sh   # first-time install / full reinstall
custom/bin/dsh.sh       # start the Web UI at http://127.0.0.1:3080
```

### 辅助脚本

| 脚本 | 用途 |
| --- | --- |
| `custom/bin/install.sh` | 依赖检查 → pnpm install → 构建 → 初始化 DSH_HOME 骨架 → 还原插件 |
| `custom/bin/dsh.sh` | 启动 dsh（默认 Web UI，额外参数透传） |
| `custom/bin/update.sh [--push]` | 拉取上游 `master` 并合并进本 fork |
| `custom/bin/save.sh` | 提交本地变更 |
| `custom/bin/uninstall.sh` | 卸载本套件 |

### 目录结构

| 路径 | 用途 |
| --- | --- |
| `custom/bin/` | dsh-kit 脚本（`lib.sh` 公共库；`.sh` / `.ps1` / `.bat` 变体） |
| `custom/dsh-home/` | `DSH_HOME` —— settings、sessions、storages、skills、profiles |
| `custom/dsh-home/profiles/web/` | `web` profile（bundle + patch 层） |
| `custom/dsh-home/.agent-presets/` | Agent preset（如 `router-standard`） |
| `custom/dsh-home/skills/` | 本地技能（如 `j-space`） |
| `custom/vendor/` | 本地 vendor 插件，链接进 profile |

### 已装插件（`web` profile）

| 插件 | 版本 | 用途 |
| --- | --- | --- |
| `@anionex/dsh-vision-toolkit` | 0.1.32 | 视觉模型接入 |
| `@dsh-external/dsh-mode-boost` | link | 任务感知思维模式路由提升 |
| `@dsh-external/dsh-super-injector` | link | 运行时插件注入（BepInEx 式） |
| `@zebbkira/dsh-skills-mcp-manager` | 0.1.3 | Skills ↔ MCP 桥接 |
| `dsh-better-sidebar` | 0.13.0 | 服务化侧边栏：文件、终端、Git、子代理 |
| `dsh-playwright-browser` | 0.1.3 | 浏览器自动化 |
| `dsh-smooth-stream` | 0.3.2 | Web UI 丝滑流式渲染 |
| `dsh-thinking-effort` | 0.5.2 | 第三方模型推理档位 + refdir 工具 |
| `open-sea-skin` | 1.2.1 | WebGPU 海洋皮肤 |

### Preset 与 Provider

- 默认 agent preset：`router-standard`（任务感知思维模式路由）。
- LLM provider（`custom/dsh-home/settings.yaml`）：`jiyuan` 与 `one-model`，均为 OpenAI 兼容；默认模型 `deepseek-v4-flash-0731`（provider `jiyuan`）。
- 视觉 provider：vision-toolkit 的 `mimo-v2.5`。
- macOS：`dsh.sh` 应用平台 patch（`cordis.patch.macos.yml`）修正 vision-toolkit 的 python 路径。

## 开发者预览

DeepSeek Harness 目前处于 _开发者预览_ 阶段，正在快速迭代。**未来将出现破坏兼容性的变更。**

## 运行

### 通过 `npm` 运行

安装 `Node.js`，然后运行：

```sh
npx @deepseek-ai/dsh web
```

该命令会启动 Web UI，默认地址为 `http://127.0.0.1:3080`。详见 [Web UI 指南](docs/user/guide/index.md)。

### 从源码运行

如需从仓库源码运行：

```sh
git clone https://github.com/deepseek-ai/deepseek-harness.git
cd deepseek-harness
pnpm install
pnpm run build
pnpm dsh web
```

## 社区与支持

- 欢迎通过 [GitHub Discussions](https://github.com/deepseek-ai/deepseek-harness/discussions) 提交反馈或 bug 报告。
- 为你的插件仓库添加 [`dsh-plugin`](https://github.com/topics/dsh-plugin) 话题，便于被发现。
- 欢迎加入 DeepSeek Harness 企微群：扫码添加企微小助手并填写入群问卷，完成后小助手会邀请你入群。

<table>
  <thead>
    <tr>
      <th align="center">企微小助手</th>
      <th align="center">入群问卷</th>
      <th align="center">微信公众号</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td align="center"><img src="assets/community-wecom-assistant.png" alt="DeepSeek Harness 企微小助手二维码" width="180" height="180"></td>
      <td align="center"><a href="https://trtgsjkv6r.feishu.cn/share/base/form/shrcnIt5twSVdLGD52KJBckGCgg"><img src="assets/community-wecom-survey.png" alt="DeepSeek Harness 入群问卷二维码" width="180" height="180"></a></td>
      <td align="center"><img src="assets/community-wechat-official-account.png" alt="DeepSeek Harness 团队微信公众号二维码" width="180" height="180"></td>
    </tr>
  </tbody>
</table>

## 参与贡献

参见 [CONTRIBUTING.md](CONTRIBUTING.md)。

## 开发

请先阅读[开发指南](docs/development.md)与[架构文档](docs/architecture.md)。

面向 agent：请遵循 [AGENTS.md](AGENTS.md)。

## 许可证

[MIT](LICENSE)

第三方依赖及其许可证见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。
