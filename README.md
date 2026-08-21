# jn-deepseek-harness

English | [中文](README.zh.md)

> A personal fork of [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) — the "everything is a plugin" agent harness by [DeepSeek AI](https://deepseek.com) — with a self-contained customization kit (`dsh-kit`) under [`custom/`](custom/README.md).

## About this fork

Upstream [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) (`dsh`) is an open-source agent harness developed by [DeepSeek AI](https://deepseek.com), powered by [Cordis](https://github.com/cordiverse/cordis). This fork keeps the upstream codebase and adds a customization layer:

- **Self-contained `DSH_HOME`** — `custom/dsh-home/` is the runtime `$DSH_HOME`; every config change (plugins, skills, agent presets, settings, MCP) lands inside the repo, so cloning on a new machine restores everything.
- **Curated `web` profile** — a hand-picked set of plugins (vendored sources + npm packages), see [Installed plugins](#installed-plugins-web-profile).
- **Helper scripts** — install / start / update / save / uninstall for macOS, Linux and Windows (`.sh` / `.ps1` / `.bat`).
- **Conflict-free upstream tracking** — all customization stays in `custom/`; `custom/bin/update.sh` fetches upstream `master` and merges (usually zero conflicts).

> Note: upstream is still in developer preview (`0.1.0-rc`) with breaking changes possible; after an update, re-run `install.sh` to restore plugins.

## Quick start

Requirements: Node.js `^22.19.0 || >=24.0.0` (nvm: `nvm use 24.19.0`), pnpm via corepack.

```sh
git clone https://github.com/JNNarrator/jn-deepseek-harness.git
cd jn-deepseek-harness
custom/bin/install.sh
custom/bin/dsh.sh
```

`install.sh` checks deps → pnpm install → build → init `DSH_HOME` skeleton → restore plugins; `dsh.sh` starts the Web UI at http://127.0.0.1:3080.

Fill in API keys once (`custom/dsh-home/.env` or Web UI → Settings), then you're set. The full guide lives in [`custom/README.md`](custom/README.md).

### Helper scripts

| Script | Purpose |
| --- | --- |
| `custom/bin/install.sh` | Check deps → pnpm install → build → init `DSH_HOME` skeleton → restore plugins |
| `custom/bin/dsh.sh` | Start dsh (Web UI by default; extra args are passed through) |
| `custom/bin/update.sh [--push]` | Fetch upstream `master` and merge into this fork (optionally push) |
| `custom/bin/save.sh [--push]` | Commit local changes (optionally push) |
| `custom/bin/uninstall.sh` | Remove the kit and restore the previous `~/.dsh` |

### Directory layout

| Path | Purpose |
| --- | --- |
| `custom/bin/` | dsh-kit scripts (`lib.sh` shared library; `.sh` / `.ps1` / `.bat` variants) |
| `custom/dsh-home/` | `DSH_HOME` — settings, sessions, storages, skills, profiles |
| `custom/dsh-home/profiles/web/` | The `web` profile (bundles + patch layers) |
| `custom/dsh-home/.agent-presets/` | Agent presets (e.g. `router-standard`) |
| `custom/dsh-home/skills/` | Local skills (e.g. `j-space`) |
| `custom/vendor/` | Vendored local plugins, linked into the profile |

## Installed plugins (`web` profile)

| Plugin | Version | Purpose |
| --- | --- | --- |
| `@anionex/dsh-vision-toolkit` | 0.1.38 | Vision provider integration (`mimo-v2.5`) |
| `@dsh-external/dsh-mode-boost` | link | Task-aware reasoning-mode routing boost |
| `@dsh-external/dsh-refdir` | link | Reference-directory tools (whitelisted folders, Claude-Desktop style) |
| `dsh-better-sidebar` | 0.14.0 | Service-oriented sidebar: files, terminal, Git, sub-agents |
| `dsh-effort-slider` | 0.2.5 | Claude-Code-style reasoning-level slider (stepless drag + WebGL flame) |
| `dsh-font` | 1.1.0 | UI/code font switcher (99 UI + 31 code fonts, CN/EN pairing) |
| `dsh-liquid-glass` | 0.1.0 | Liquid-glass translucency theme |
| `dsh-playwright-browser` | 0.1.3 | Browser automation |
| `dsh-skill-mcp-panel` | 2.0.1 | Skills & MCP management panels (Web UI + `dsh-panel` CLI) |
| `dsh-skill-picker` | 0.2.0 | Composer skill picker (search & insert `/skill-name` gesture) |
| `dsh-smooth-stream` | 0.3.4 | Smooth streaming rendering for the Web UI |
| `dsh-tick-rail` | 0.1.5 | Tick-rail conversation navigator (peak-falloff, hover preview, click-to-jump) |

**Presets & providers:** default agent preset `router-standard` (task-aware reasoning-mode routing); LLM providers `jiyuan` and `one-model` (both OpenAI-compatible), default model `deepseek-v4-flash-0731`.

## Docs

- Full dsh-kit guide (Chinese): [`custom/README.md`](custom/README.md)
- Plugin update policy & history: [`custom/PLUGIN-UPDATE.md`](custom/PLUGIN-UPDATE.md)
- Upstream docs: [deepseek-harness](https://github.com/deepseek-ai/deepseek-harness) — [development](docs/development.md) · [architecture](docs/architecture.md)

## Acknowledgements

Special thanks to **DeepSeek AI** for creating and open-sourcing [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) (MIT), and to all the community plugin authors whose work makes the `web` profile possible.

## License

[MIT](LICENSE) · Third-party dependencies: [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)
