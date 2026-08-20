/**
 * dsh-refdir client — 引用目录 UI（独立版，从 dsh-thinking-effort 拆分）
 *
 * 注册输入栏 📁 芯片、会话头部按钮、管理面板、命令菜单项。
 * 适配 dsh 0.1.0-rc.8（commands.execute 第三个参数 images）。
 * 美化：玻璃面板、过渡动画、更好层级。
 */
window.__ModuleLoader__.load({
  id: "@dsh-external/dsh-refdir",
  factory: (require) => {
    var module = { exports: {} }
    var exports = module.exports
    Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" })

    const react = require("react")
    const React = react
    const { createElement: h } = React

    const name = "@dsh-external/dsh-refdir"
    const inject = ["slots", "remote", "remote.commands", "workspaces", "commandUi"]
    exports.name = name
    exports.inject = inject

    // ── 共享状态 ──
    const state = { open: false, dirs: [], workspaceCwd: "", loading: false, error: null }
    const listeners = new Set()
    function subscribe(fn) { listeners.add(fn); return () => { listeners.delete(fn) } }
    function setState(patch) { Object.assign(state, patch); for (const fn of listeners) fn() }

    // ── 命令通道（rc.8 适配：第三个参数 images） ──
    async function cmd(ctx, sessionId, line) {
      const remote = ctx.get("remote")
      if (!remote || !remote.commands || typeof remote.commands.execute !== "function")
        throw new Error("命令通道不可用")
      const envelope = await remote.commands.execute(sessionId, line, [])
      if (!envelope || !envelope.ok) {
        const err = envelope && envelope.error
        throw new Error("命令执行失败: " + (err ? err.code + ": " + err.message : line))
      }
      const result = envelope.value && envelope.value.result
      if (!result) throw new Error("命令无返回: " + line)
      if (result.kind === "error") throw new Error(result.text)
      return JSON.parse(result.text)
    }

    async function refresh(ctx, sessionId) {
      try {
        const data = await cmd(ctx, sessionId, "/refdir-list")
        setState({ dirs: data && Array.isArray(data.dirs) ? data.dirs : [], workspaceCwd: data && typeof data.workspaceCwd === "string" ? data.workspaceCwd : "", loading: false, error: null })
      } catch (error) {
        setState({ loading: false, error: error && error.message ? error.message : String(error) })
      }
    }

    async function addDir(ctx, sessionId) {
      const workspaces = ctx.get("workspaces")
      if (!workspaces || typeof workspaces.pickDirectory !== "function") {
        setState({ error: "目录选择器不可用（需要桌面端原生目录选择器）" })
        return
      }
      setState({ loading: true, error: null })
      try {
        const path = await workspaces.pickDirectory()
        if (path === null) { setState({ loading: false }); return }
        await cmd(ctx, sessionId, "/refdir-add " + JSON.stringify(path))
        await refresh(ctx, sessionId)
      } catch (error) {
        setState({ loading: false, error: error && error.message ? error.message : String(error) })
      }
    }

    async function removeDir(ctx, sessionId, id) {
      try {
        await cmd(ctx, sessionId, "/refdir-remove " + String(id))
        await refresh(ctx, sessionId)
      } catch (error) {
        setState({ error: error && error.message ? error.message : String(error) })
      }
    }

    function toggle(ctx, sessionId) {
      if (state.open) { setState({ open: false }) }
      else { setState({ open: true }); refresh(ctx, sessionId) }
    }

    // ── UI 安装 ──
    function installRefdirUi(ctx) {
      const slots = ctx.get("slots")
      if (!slots) return

      // 注入美化样式
      const style = document.createElement("style")
      style.textContent = `
        /* 芯片按钮 */
        .refdir-chip {
          flex: none; display: inline-flex; align-items: center; justify-content: center;
          gap: 4px; height: 30px; min-width: 30px; padding: 0 8px;
          border: 1px solid var(--dsw-alias-border-l2, rgba(255,255,255,.12));
          border-radius: 10px; background: var(--dsw-alias-bg-layer-1, rgba(255,255,255,.06));
          color: var(--dsw-alias-label-secondary, #a0a0b0); cursor: pointer;
          font-size: 13px; line-height: 1; transition: all .15s ease;
          backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
        }
        .refdir-chip:hover {
          background: var(--dsw-alias-interactive-bg-hover, rgba(255,255,255,.12));
          border-color: var(--dsw-alias-brand-primary, #6366f1);
          color: var(--dsw-alias-label-primary, #e0e0f0);
          transform: translateY(-1px); box-shadow: 0 2px 8px rgba(99, 102, 241, .15);
        }
        .refdir-chip-icon { font-size: 15px; line-height: 1; }
        .refdir-chip-count {
          font-size: 10px; font-weight: 700; color: #fff;
          background: #6366f1;
          border-radius: 9px; padding: 1px 6px; min-width: 18px; text-align: center;
          line-height: 16px;
          box-shadow: 0 1px 3px rgba(0,0,0,.25);
        }

        /* 会话头部按钮 */
        .refdir-header {
          display: inline-flex; align-items: center; gap: 5px; height: 28px;
          padding: 0 12px; border: 1px solid var(--dsw-alias-border-l2, rgba(255,255,255,.1));
          border-radius: 10px; background: var(--dsw-alias-bg-layer-1, rgba(255,255,255,.04));
          color: var(--dsw-alias-label-secondary, #a0a0b0); font-size: 12px;
          cursor: pointer; transition: all .15s ease;
          backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
        }
        .refdir-header:hover {
          background: var(--dsw-alias-interactive-bg-hover, rgba(255,255,255,.1));
          border-color: var(--dsw-alias-brand-primary, #6366f1);
          color: var(--dsw-alias-label-primary, #e0e0f0);
          box-shadow: 0 2px 8px rgba(99, 102, 241, .12);
        }

        /* 面板 */
        .refdir-panel {
          position: absolute; bottom: calc(100% + 4px); left: 0; width: 380px;
          max-height: 440px; overflow-y: auto; box-sizing: border-box;
          padding: 16px; border-radius: 16px;
          background: var(--dsw-alias-bg-overlay, rgba(20, 20, 40, .92));
          border: 1px solid var(--dsw-alias-border-l2, rgba(255,255,255,.1));
          box-shadow: 0 12px 40px rgba(0, 0, 0, .35), 0 0 0 1px rgba(99, 102, 241, .08);
          font-size: 13px; color: var(--dsw-alias-label-primary, #e0e0f0);
          z-index: 300; animation: refdir-slide-up .18s ease-out;
          backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
        }
        @keyframes refdir-slide-up {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .refdir-panel::-webkit-scrollbar { width: 5px; }
        .refdir-panel::-webkit-scrollbar-thumb {
          background: var(--dsw-alias-border-l2, rgba(255,255,255,.15)); border-radius: 3px;
        }

        /* 面板标题行 */
        .refdir-panel-top {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 12px;
        }
        .refdir-panel-title {
          font-size: 15px; font-weight: 700; letter-spacing: .01em;
        }
        .refdir-panel-close {
          width: 26px; height: 26px; border: none; border-radius: 8px;
          background: transparent; color: var(--dsw-alias-label-secondary, #888);
          cursor: pointer; font-size: 14px; display: flex; align-items: center;
          justify-content: center; transition: all .15s;
        }
        .refdir-panel-close:hover {
          background: var(--dsw-alias-border-l1, rgba(255,255,255,.08));
          color: var(--dsw-alias-label-primary, #e0e0f0);
        }

        /* 工作区 */
        .refdir-panel-workspace {
          display: flex; flex-direction: column; gap: 3px; padding: 10px 12px;
          margin-bottom: 12px; border-radius: 10px;
          background: var(--dsw-alias-border-l1, rgba(255,255,255,.04));
          border: 1px solid var(--dsw-alias-border-l2, rgba(255,255,255,.06));
        }
        .refdir-panel-ws-label { font-size: 10px; font-weight: 600; text-transform: uppercase;
          letter-spacing: .06em; color: var(--dsw-alias-label-tertiary, #888); }
        .refdir-panel-ws-path { font-size: 12px; word-break: break-all;
          font-family: var(--ds-font-family-code, "JetBrains Mono", monospace);
          color: var(--dsw-alias-label-secondary, #a0a0b0); }

        /* 空状态 */
        .refdir-panel-empty {
          padding: 20px 16px; text-align: center;
          color: var(--dsw-alias-label-tertiary, #888); line-height: 1.7;
          font-size: 13px;
        }
        .refdir-panel-empty-icon { font-size: 32px; display: block; margin-bottom: 8px; opacity: .6; }

        /* 目录列表 */
        .refdir-panel-list { display: flex; flex-direction: column; gap: 6px; margin-bottom: 12px; }
        .refdir-panel-row {
          display: flex; align-items: center; gap: 10px; padding: 10px 12px;
          border-radius: 10px; background: var(--dsw-alias-border-l1, rgba(255,255,255,.04));
          border: 1px solid transparent; transition: all .15s;
        }
        .refdir-panel-row:hover {
          background: var(--dsw-alias-interactive-bg-hover, rgba(255,255,255,.08));
          border-color: var(--dsw-alias-border-l2, rgba(255,255,255,.1));
        }
        .refdir-panel-row-icon { font-size: 16px; flex: none; opacity: .8; }
        .refdir-panel-row-main { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
        .refdir-panel-row-title { font-weight: 600; font-size: 13px; }
        .refdir-panel-row-path {
          font-size: 11px; color: var(--dsw-alias-label-tertiary, #888);
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
          font-family: var(--ds-font-family-code, "JetBrains Mono", monospace);
        }
        .refdir-panel-remove {
          flex: none; width: 26px; height: 26px; border: none; border-radius: 8px;
          background: transparent; color: var(--dsw-alias-label-tertiary, #888);
          cursor: pointer; font-size: 13px; display: flex; align-items: center;
          justify-content: center; transition: all .15s;
        }
        .refdir-panel-remove:hover {
          color: #f87171; background: rgba(248, 113, 113, .12);
        }

        /* 错误提示 */
        .refdir-panel-error {
          margin-bottom: 10px; padding: 8px 12px; border-radius: 8px;
          color: #f87171; background: rgba(248, 113, 113, .08);
          border: 1px solid rgba(248, 113, 113, .15); font-size: 12px;
          display: flex; align-items: center; gap: 6px;
        }

        /* 添加按钮 */
        .refdir-panel-add {
          width: 100%; height: 36px;
          border: 1px dashed var(--dsw-alias-border-l2, rgba(255,255,255,.18));
          border-radius: 10px;
          background: var(--dsw-alias-bg-layer-1, rgba(255,255,255,.04));
          color: var(--dsw-alias-label-secondary, #a0a0b0);
          font-size: 13px; font-weight: 500; cursor: pointer;
          transition: all .15s ease; letter-spacing: .01em;
        }
        .refdir-panel-add:hover {
          background: var(--dsw-alias-interactive-bg-hover, rgba(255,255,255,.08));
          border-color: var(--dsw-alias-brand-primary, #6366f1);
          border-style: solid;
          color: var(--dsw-alias-label-primary, #e0e0f0);
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(99, 102, 241, .15);
        }
        .refdir-panel-add:disabled {
          opacity: .4; cursor: default; transform: none; box-shadow: none;
          border-color: var(--dsw-alias-border-l2, rgba(255,255,255,.08));
        }
        .refdir-panel-add:active { transform: translateY(0); }

        /* 提示文字 */
        .refdir-panel-hint {
          margin-top: 10px; font-size: 11px; color: var(--dsw-alias-label-tertiary, #888);
          line-height: 1.5; text-align: center;
        }
      `
      document.head.appendChild(style)
      ctx.effect(() => () => { style.remove() })

      // React hooks
      function useSharedState() {
        const [, setTick] = React.useState(0)
        React.useEffect(() => subscribe(() => setTick((x) => x + 1)), [])
        return state
      }

      // 芯片按钮（输入框左侧）
      const Chip = (props) => {
        const s = useSharedState()
        const sessionId = props.sessionId
        const count = s.dirs.length
        return h("button", {
          type: "button", className: "refdir-chip", "data-refdir-chip": true,
          title: count > 0 ? "引用目录（" + count + " 个）" : "引用目录：添加文件夹到会话",
          "aria-label": "引用目录", "aria-expanded": s.open,
          onClick: () => toggle(ctx, sessionId),
        },
          h("span", { className: "refdir-chip-icon", "aria-hidden": true }, "📁"),
          count > 0 ? h("span", { className: "refdir-chip-count" }, String(count)) : null,
        )
      }

      // 头部按钮
      const HeaderAction = (props) => {
        const s = useSharedState()
        const count = s.dirs.length
        return h("button", {
          type: "button", className: "refdir-header", "data-refdir-header": true,
          title: "引用目录（点击管理）",
          onClick: () => toggle(ctx, props.sessionId),
        }, "📁 引用目录" + (count > 0 ? " · " + count : ""))
      }

      // 管理面板
      const Panel = (props) => {
        const s = useSharedState()
        const sessionId = props.sessionId
        React.useEffect(() => { if (state.open) refresh(ctx, sessionId) }, [state.open, sessionId])
        React.useEffect(() => {
          if (!state.open) return
          const onDown = (e) => {
            if (e.target instanceof Node && e.target.closest &&
              e.target.closest("[data-refdir-panel], [data-refdir-chip], [data-refdir-header]")) return
            setState({ open: false })
          }
          document.addEventListener("pointerdown", onDown, true)
          return () => document.removeEventListener("pointerdown", onDown, true)
        }, [state.open])
        if (!s.open) return null

        return h("div", { className: "refdir-panel", "data-refdir-panel": true, role: "dialog", "aria-label": "引用目录" },
          // 标题行
          h("div", { className: "refdir-panel-top" },
            h("span", { className: "refdir-panel-title" }, "📁 引用目录"),
            h("button", { type: "button", className: "refdir-panel-close", "aria-label": "关闭",
              onClick: () => setState({ open: false }) }, "✕"),
          ),
          // 工作区
          h("div", { className: "refdir-panel-workspace", title: s.workspaceCwd },
            h("span", { className: "refdir-panel-ws-label" }, "主工作区"),
            h("span", { className: "refdir-panel-ws-path" }, s.workspaceCwd || "—"),
          ),
          // 目录列表或空状态
          s.dirs.length === 0 && !s.loading
            ? h("div", { className: "refdir-panel-empty" },
                h("span", { className: "refdir-panel-empty-icon" }, "📂"),
                "还没有引用目录",
                h("br"),
                "添加后，AI 可读取并操作这些文件夹中的文件")
            : h("div", { className: "refdir-panel-list" },
                s.dirs.map((d) => h("div", { key: d.id, className: "refdir-panel-row" },
                  h("span", { className: "refdir-panel-row-icon" }, "📁"),
                  h("span", { className: "refdir-panel-row-main", title: d.path },
                    h("span", { className: "refdir-panel-row-title" }, d.title),
                    h("span", { className: "refdir-panel-row-path" }, d.path),
                  ),
                  h("button", { type: "button", className: "refdir-panel-remove",
                    title: "移除引用", "aria-label": "移除 " + d.title,
                    onClick: () => removeDir(ctx, sessionId, d.id) }, "✕"),
                )),
              ),
          // 错误
          s.error ? h("div", { className: "refdir-panel-error" },
            h("span", null, "⚠"), " ", s.error
          ) : null,
          // 添加按钮
          h("button", { type: "button", className: "refdir-panel-add",
            disabled: s.loading,
            onClick: () => addDir(ctx, sessionId) },
            s.loading ? "⏳ 处理中…" : "＋ 添加引用目录"
          ),
          // 提示
          h("div", { className: "refdir-panel-hint" },
            "也可在输入框左侧 + 按钮「引用目录」命令中添加"
          ),
        )
      }

      // 注册 slots
      slots.inject("conversation.input.left", () => slots.register(
        { name: "conversation.input.left", id: "refdir-chip", order: 50, label: "引用目录" },
        (props) => h(Chip, props),
      ))
      slots.inject("conversation.session.header.actions", () => slots.register(
        { name: "conversation.session.header.actions", id: "refdir-header", order: 0, label: "引用目录" },
        (props) => h(HeaderAction, props),
      ))
      slots.inject("conversation.input.overlay", () => slots.register(
        { name: "conversation.input.overlay", id: "refdir-panel", order: 200, label: "引用目录面板" },
        (props) => h(Panel, props),
      ))

      // 命令菜单
      const commandUi = ctx.get("commandUi")
      if (commandUi && typeof commandUi.register === "function") {
        ctx.effect(() => commandUi.register({
          name: "refdir",
          description: "管理引用目录：添加/移除可供 AI 读取的文件夹",
          available: () => true,
          ui: {
            kind: "popupSelect",
            options: async (session) => {
              let dirs = []
              try {
                const data = await cmd(ctx, String(session.sessionId), "/refdir-list")
                dirs = data && Array.isArray(data.dirs) ? data.dirs : []
              } catch (e) { dirs = [] }
              return [
                { id: "add", label: "＋ 添加引用目录", detail: "从磁盘选择文件夹" },
                ...dirs.map((d) => ({ id: "dir:" + d.id, label: "📁 " + d.title, detail: d.path, active: true })),
              ]
            },
            onSelect: async (option, session) => {
              const sid = String(session.sessionId)
              if (option.id === "add") { await addDir(ctx, sid) }
              else if (typeof option.id === "string" && option.id.indexOf("dir:") === 0) {
                await removeDir(ctx, sid, option.id.slice(4))
              }
              await refresh(ctx, sid)
            },
          },
        }))
      }
    }

    function apply(ctx) {
      installRefdirUi(ctx)
    }

    exports.apply = apply
    exports.inject = inject
    exports.name = name
    return module.exports
  },
})