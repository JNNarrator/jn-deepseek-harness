window.__ModuleLoader__.load({
	id: "@dsh-external/dsh-super-injector",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		//#region src/client/index.ts
		let react = require("react");
		const inject = ["slots"];
		const API = "/super-injector/api";
		const styles = `
.spi-page{font-family:ui-monospace,monospace;font-size:12px;line-height:1.6;padding:14px 16px;max-width:720px}
.spi-page h3{margin:0 0 8px;font-size:13px}
.spi-add{border:1.5px dashed var(--theme-border,#555);border-radius:8px;padding:12px;margin-bottom:14px;text-align:center;color:var(--theme-text-secondary,#999)}
.spi-add.drag{border-color:var(--theme-accent,#4a9eff);background:rgba(74,158,255,.08)}
.spi-row{display:flex;gap:6px;margin-top:10px}
.spi-input{flex:1;background:var(--theme-input-bg,#111);color:var(--theme-text,#ddd);border:1px solid var(--theme-border,#333);border-radius:6px;padding:6px 8px;font-size:12px}
.spi-btn{background:var(--theme-accent,#4a9eff);color:#fff;border:none;border-radius:6px;padding:6px 12px;cursor:pointer;font-size:12px;white-space:nowrap}
.spi-btn.ghost{background:transparent;border:1px solid var(--theme-border,#444);color:var(--theme-text,#ccc)}
.spi-btn.danger{background:transparent;border:1px solid #d33;color:#d33}
.spi-btn:disabled{opacity:.45;cursor:not-allowed}
.spi-list{list-style:none;margin:0;padding:0}
.spi-item{display:flex;align-items:center;gap:8px;padding:8px 10px;border:1px solid var(--theme-border,#333);border-radius:8px;margin-bottom:6px}
.spi-item .name{flex:1;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.spi-item .dir{color:var(--theme-text-secondary,#888);font-size:11px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:40%}
.spi-item .st{font-size:10px;padding:2px 6px;border-radius:10px}
.spi-item .st.on{background:rgba(46,204,113,.15);color:#2ecc71}
.spi-item .st.off{background:rgba(255,193,7,.12);color:#f1c40f}
.spi-msg{margin-top:10px;padding:8px 10px;border-radius:6px;background:var(--theme-input-bg,#111);border:1px solid var(--theme-border,#333);white-space:pre-wrap;max-height:180px;overflow:auto;font-size:11px}
.spi-stats{color:var(--theme-text-secondary,#888);font-size:11px;margin:0 0 10px}
`;
		function fetchJson(path, init) {
			return fetch(API + path, {
				headers: { "content-type": "application/json" },
				...init
			}).then((r) => r.json());
		}
		function SuperInjectorSection() {
			const { useState, useEffect, useRef } = react;
			const [stats, setStats] = useState("");
			const [entries, setEntries] = useState([]);
			const [msg, setMsg] = useState(null);
			const [busy, setBusy] = useState(false);
			const [uninstalling, setUninstalling] = useState(null);
			const [drag, setDrag] = useState(false);
			const [placeholder, setPlaceholder] = useState("D:/path/to/folder");
			const inputRef = useRef(null);
			const say = (text, isErr = false) => setMsg(text ? { text, isErr } : null);
			const refresh = () => {
				fetchJson("/list").then((d) => {
					if (!d?.ok) return say(JSON.stringify(d), true);
					const { entries: ents, stats: s } = d;
					setStats(`inject ${s?.inject?.ok ?? 0}✓/${s?.inject?.fail ?? 0}✗ · reload ${s?.reload?.ok ?? 0}✓ · uninject ${s?.uninject?.ok ?? 0}✓/${s?.uninject?.fail ?? 0}✗ · 共 ${ents.length} 个注入插件`);
					setEntries(ents);
				}).catch((err) => say("加载失败: " + err, true));
			};
			useEffect(() => {
				refresh();
				const timer = window.setInterval(refresh, 6e4);
				return () => window.clearInterval(timer);
			}, []);
			const doAction = (path, label) => {
				const dir = (inputRef.current?.value ?? "").trim();
				if (!dir) return say("请先输入文件夹路径", true);
				setBusy(true);
				say("");
				fetchJson(path, {
					method: "POST",
					body: JSON.stringify({ dir, title: label })
				}).then((r) => {
					say(r?.result ?? JSON.stringify(r), !r?.ok);
					if (r?.ok) setTimeout(refresh, 1200);
				}).catch((err) => say("请求失败: " + err, true)).finally(() => setBusy(false));
			};
			const doUninstall = (name) => {
				setUninstalling(name);
				fetchJson("/uninstall", {
					method: "POST",
					body: JSON.stringify({ match: name })
				}).then((r) => {
					say(r?.result ?? JSON.stringify(r), !r?.ok);
				}).catch((err) => say("卸载请求失败: " + err, true)).finally(() => {
					setUninstalling(null);
					setTimeout(refresh, 600);
				});
			};
			return react.createElement("div", { className: "spi-page" },
				react.createElement("style", null, styles),
				react.createElement("h3", null, "超级模组管理（dsh-super-injector）"),
				react.createElement("p", { className: "spi-stats" }, stats),
				react.createElement("div", {
					className: "spi-add" + (drag ? " drag" : ""),
					onDragOver: (e) => { e.preventDefault(); setDrag(true); },
					onDragLeave: () => setDrag(false),
					onDrop: (e) => {
						e.preventDefault();
						setDrag(false);
						setPlaceholder("浏览器无法读取拖入文件夹的绝对路径——请粘贴路径或使用选择器");
					}
				},
					"拖入文件夹，或输入路径——「内化」= 新建会话让 AI 把内容变成插件；「注入」= 目录已是插件包直接注入",
					react.createElement("div", { className: "spi-row" },
						react.createElement("input", { ref: inputRef, className: "spi-input", placeholder }),
						react.createElement("button", { className: "spi-btn", disabled: busy, onClick: () => doAction("/ingest", "内化插件") }, busy ? "处理中…" : "内化（AI 造插件）"),
						react.createElement("button", { className: "spi-btn ghost", disabled: busy, onClick: () => doAction("/inject", "直接注入") }, busy ? "处理中…" : "直接注入")
					)
				),
				react.createElement("ul", { className: "spi-list" },
					!entries.length
						? react.createElement("li", { className: "spi-item" }, "（暂无注入插件——拖入文件夹或输入路径开始）")
						: entries.map((e) => react.createElement("li", { className: "spi-item", key: String(e.name) },
							react.createElement("span", { className: "name" }, String(e.name)),
							react.createElement("span", { className: "dir" }, String(e.dir)),
							react.createElement("span", { className: "st " + (e.active ? "on" : "off") }, e.active ? "运行中" : "未激活"),
							react.createElement("button", { className: "spi-btn danger", disabled: uninstalling === e.name, onClick: () => doUninstall(e.name) }, uninstalling === e.name ? "卸载中…" : "卸载")
						))
				),
				msg && react.createElement("div", {
					className: "spi-msg",
					style: { borderColor: msg.isErr ? "#d33" : "var(--theme-border,#333)" }
				}, msg.text)
			);
		}
		function apply(ctx) {
			ctx.effect(() => ctx.slots.inject("settings.section", () => ctx.slots.register({
				name: "settings.section",
				id: "super-injector-plugins",
				order: 50,
				label: () => "超级模组"
			}, SuperInjectorSection)), "super-injector: settings page");
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map
