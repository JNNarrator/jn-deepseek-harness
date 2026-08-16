# dsh-kit —— 我的 DeepSeek Harness 定制套件

这个目录是你的 DeepSeek Harness（dsh）**定制套件的全部内容**。核心思想一句话：

> **`custom/dsh-home/` 就是你的运行时 `$DSH_HOME`。** 启动脚本把 `DSH_HOME` 指到这里，
> 你在 dsh 里做的任何配置改动（插件、skill、MCP、agent 预设、设置）都即时落在这个目录里，
> 它就是"最新状态"的唯一记录——覆盖式、不保留历史版本。换新电脑 clone 仓库即还原。

## 目录结构

```
custom/
├── README.md                 ← 本文件
├── bin/
│   ├── dsh.sh / dsh.ps1 / dsh.bat        启动（默认 Web UI，可透传参数）
│   ├── install.sh / .ps1 / .bat          新机器首次安装 / 全量重装
│   ├── uninstall.sh / .ps1 / .bat        完全卸载（恢复旧 ~/.dsh + 删除仓库）
│   ├── update.sh / .ps1 / .bat           拉取上游 deepseek-harness 更新并合并
│   ├── save.sh / .ps1 / .bat             记录当前定制状态到 git（可选推送）
│   └── lib.sh                            公共库（路径/平台/DSH_HOME 计算）
├── dsh-home/                  ← 运行时 $DSH_HOME（配置提交，临时数据 gitignore）
│   ├── settings.yaml          ← 用户设置
│   ├── cordis.patch.yml       ← 对所有 profile 生效的 patch（MCP 写这里或 profile 级）
│   ├── AGENTS.md              ← 用户全局指令
│   ├── profiles/<名字>/       ← 各 profile（package.json / cordis.patch.yml 提交）
│   ├── skills/<名字>/SKILL.md ← 你的 skill
│   └── .agent-presets/<id>/   ← 你的 agent 预设（agent.cordis.yml）
├── env.example                ← 密钥模板（复制为 dsh-home/.env 使用）
└── .kit-state.json            ← 本机安装状态（gitignored，卸载依据）
```

## 快速开始（三平台）

前置依赖：Node.js ≥ 22.19、pnpm（`npm i -g pnpm` 或 `corepack enable`）、git。

```bash
# 1. 换新电脑时，clone 你的 fork（本仓库）：
git clone https://github.com/JNNarrator/jn-deepseek-harness.git
cd jn-deepseek-harness

# 2. 安装（依赖 + 构建 + 还原插件，只需一次）：
custom/bin/install.sh          # Windows: custom/bin/install.bat 或 install.ps1
                               # macOS / Ubuntu: 同上（都是 bash）

# 3. 填密钥：复制 custom/env.example → custom/dsh-home/.env，填入 DEEPSEEK_API_KEY
#    （或在 Web UI「设置 → 模型」页填写，更推荐）

# 4. 启动：
custom/bin/dsh.sh              # → dsh web，浏览器打开 http://127.0.0.1:3080
custom/bin/dsh.sh headless "帮我做xxx"   # 跑一次任务
```

## 日常使用

- **配置即记录**：在 Web UI 里装插件、改设置、加 skill/预设/MCP，改动直接写在 `custom/dsh-home/`，无需手动同步。
- **记录到 git**：`custom/bin/save.sh`（提交 custom/），`custom/bin/save.sh --push`（提交并推送到你的 GitHub fork）。这样"最新状态"就在云端了。
- **新增插件**：`custom/bin/dsh.sh plugin --profile web add <包名>`（等价于 `dsh plugin --profile web add ...`），装完记得 save。
- **还原插件**：install.sh 会遍历 `custom/dsh-home/profiles/`，对每个 profile 执行 `dsh plugin --profile <名字> install`，从已提交的 package.json 重装全部依赖。

## 换新电脑还原流程

1. 装 Node.js ≥ 22.19、pnpm、git；
2. `git clone` 你的 fork；
3. `custom/bin/install.sh`（自动还原插件、初始化骨架）；
4. 填一次密钥（.env 或 Web UI）；
5. `custom/bin/dsh.sh` 开工。

## 完全卸载

```bash
custom/bin/uninstall.sh        # 先确认；KIT_YES=1 或加 --yes 跳过确认
```

它会：恢复安装时自动备份的旧 `~/.dsh`（若有）→ 把仓库内的 `.zcode`（ZCode 会话数据）移到 `~/.zcode.kit-backup-*` 保留 → 删除整个仓库目录。机器回到使用本套件之前的状态。

## 跟上上游更新

```bash
custom/bin/update.sh           # fetch upstream + merge（你的改动全在 custom/，零冲突）
custom/bin/update.sh --push    # 合并后推送回你的 fork
```

- 定制内容全部在 `custom/` 目录内，上游没有这个目录，合并通常零冲突。
- 不要改动上游文件（`apps/`、`packages/` 等）来定制，否则会与上游冲突；需要改官方预设时，复制一份到 `custom/dsh-home/.agent-presets/` 再改。
- dsh 处于 0.1.0-rc 预发布期，上游可能有破坏性变更，合并后建议重跑 `install.sh`。

## 配置存放速查（dsh 机制）

| 内容 | 位置 |
|---|---|
| 用户设置 | `custom/dsh-home/settings.yaml` |
| 全 profile patch（MCP 等） | `custom/dsh-home/cordis.patch.yml` |
| 单 profile 插件与 patch | `custom/dsh-home/profiles/<名字>/` |
| 用户 skill | `custom/dsh-home/skills/<名字>/SKILL.md` |
| 用户 agent 预设 | `custom/dsh-home/.agent-presets/<id>/agent.cordis.yml` |
| 密钥 | `custom/dsh-home/.credentials.yaml`、`.env`（gitignored） |
| 会话/附件/缓存 | `custom/dsh-home/sessions/`、`attachments/`、`storages/`（gitignored） |

## 密钥与安全

- `.credentials.yaml`、`.env` 含 API key，**已加入 gitignore，绝不会提交**。
- 换新电脑后需手动填一次密钥（这是刻意的安全取舍）。
- 如需多机共享密钥，可用 age/gpg 加密后另行保管，但不要放进本仓库。

## 故障排查

- **`pnpm dsh` 报 node 版本**：需要 ≥ 22.19。
- **Windows 上 shell 工具不可用**：dsh 在 Windows 依赖 PowerShell 7（pwsh）作为 shell provider，`winget install Microsoft.PowerShell` 安装。
- **`git clone` 在部分网络环境失败**：如果你用代理工具（Clash 之类）且它开了 fake-ip 模式，`github.com` 可能被解析到不可路由的 IP（如 198.18.x.x）。解决办法：把 `github.com` 的真实 IP 写进系统 hosts，或在该工具里给 github.com 配置直连/代理规则。
- **Windows 符号链接**：仓库里一些文件（如 `CLAUDE.md`、`scripts/*.sh`）在 Windows 上以链接目标文本形式存在（`core.symlinks=false`），这是 Git for Windows 的正常行为，不影响使用。
