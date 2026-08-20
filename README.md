# DeepSeek Harness

English | [中文](README.zh.md)

DeepSeek Harness (`dsh`) is an open-source agent harness developed by [DeepSeek AI](https://deepseek.com).

It uses an architecture where **everything is a plugin**, and is powered by [Cordis](https://github.com/cordiverse/cordis), whose design is described in [_A Programming Paradigm for Spatiotemporal Composability_](https://github.com/cordiverse/paper).

## Customization layer (dsh-kit)

This repository is a personal fork of DeepSeek Harness with an added customization layer under `custom/` ("dsh-kit"): a self-contained `DSH_HOME`, a curated `web` profile, vendored plugins, and helper scripts for install / update / save / uninstall.

### Quick start

Requirements: Node.js `^22.19.0 || >=24.0.0` (nvm: `nvm use 24.19.0`), pnpm via corepack.

```sh
custom/bin/install.sh   # first-time install / full reinstall
custom/bin/dsh.sh       # start the Web UI at http://127.0.0.1:3080
```

### Helper scripts

| Script | Purpose |
| --- | --- |
| `custom/bin/install.sh` | Check deps → pnpm install → build → init DSH_HOME skeleton → restore plugins |
| `custom/bin/dsh.sh` | Start dsh (Web UI by default; extra args are passed through) |
| `custom/bin/update.sh [--push]` | Fetch upstream `master` and merge into this fork |
| `custom/bin/save.sh` | Commit local changes |
| `custom/bin/uninstall.sh` | Remove the kit |

### Directory layout

| Path | Purpose |
| --- | --- |
| `custom/bin/` | dsh-kit scripts (`lib.sh` shared library; `.sh` / `.ps1` / `.bat` variants) |
| `custom/dsh-home/` | `DSH_HOME` — settings, sessions, storages, skills, profiles |
| `custom/dsh-home/profiles/web/` | The `web` profile (bundles + patch layers) |
| `custom/dsh-home/.agent-presets/` | Agent presets (e.g. `router-standard`) |
| `custom/dsh-home/skills/` | Local skills (e.g. `j-space`) |
| `custom/vendor/` | Vendored local plugins, linked into the profile |

### Installed plugins (`web` profile)

| Plugin | Version | Purpose |
| --- | --- | --- |
| `@anionex/dsh-vision-toolkit` | 0.1.32 | Vision provider integration |
| `@dsh-external/dsh-mode-boost` | link | Task-aware reasoning-mode routing boost |
| `@dsh-external/dsh-super-injector` | link | Runtime plugin injection (BepInEx-style) |
| `@zebbkira/dsh-skills-mcp-manager` | 0.1.3 | Skills ↔ MCP bridge |
| `dsh-better-sidebar` | 0.13.0 | Service-oriented sidebar: files, terminal, Git, sub-agents |
| `dsh-playwright-browser` | 0.1.3 | Browser automation |
| `dsh-smooth-stream` | 0.3.2 | Smooth streaming rendering for the Web UI |
| `dsh-thinking-effort` | 0.5.2 | Reasoning-effort levels for third-party models + refdir tools |
| `open-sea-skin` | 1.2.1 | WebGPU ocean skin |

### Presets and providers

- Default agent preset: `router-standard` (task-aware reasoning-mode routing).
- LLM providers (`custom/dsh-home/settings.yaml`): `jiyuan` and `one-model`, both OpenAI-compatible; default model `deepseek-v4-flash-0731` (provider `jiyuan`).
- Vision provider: `mimo-v2.5` via the vision-toolkit.
- macOS: `dsh.sh` applies a platform patch (`cordis.patch.macos.yml`) for the vision-toolkit Python path.

## Developer preview

DeepSeek Harness is currently in _developer preview_ and is iterating rapidly. **THERE WILL BE COMPATIBILITY-BREAKING CHANGES.**

## Run

### Run from `npm`

Install `Node.js`, then run:

```sh
npx @deepseek-ai/dsh web
```

The command starts the Web UI, served at `http://127.0.0.1:3080` by default. See [Web UI guide](docs/user/guide/index.md).

### Run from source

To run from a repository checkout:

```sh
git clone https://github.com/deepseek-ai/deepseek-harness.git
cd deepseek-harness
pnpm install
pnpm run build
pnpm dsh web
```

## Community and support

- Feel free to submit feedback or bug reports through [GitHub Discussions](https://github.com/deepseek-ai/deepseek-harness/discussions).
- Add the [`dsh-plugin`](https://github.com/topics/dsh-plugin) topic to your plugin repository for discoverability.
- Join <a href="https://discord.gg/Ycq5dCaS4">DeepSeek Harness Discord community</a>.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## Development

Start with the [development guide](docs/development.md) and [architecture documentation](docs/architecture.md).

For agents, follow [AGENTS.md](AGENTS.md).

## License

[MIT](LICENSE)

Third-party dependencies and their licenses are disclosed in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
