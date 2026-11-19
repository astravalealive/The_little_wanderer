# Issue #253 — playable HTTPS homestead preview

Goal: stable iPad Safari play link for the existing PR #252 `godot-haigen/web-preview/` export. No new gameplay features; production HTML / Pages game untouched; PR #252 not merged.

## Playable HTTPS (this agent session)

Single-threaded Godot web export (no SharedArrayBuffer). Served with correct MIME for `.wasm` / `.pck` / `.js`.

**https://think-antenna-five-silicon.trycloudflare.com/index.html**

Open in Safari on iPad (landscape preferred). Cloudflare quick tunnels **die when this agent VM stops**.

Local MIME serve (agent): `python3 godot-haigen/tools/serve_web_preview.py 8766` → `http://127.0.0.1:8766/`

## What works (verified this session)

| Check | Result |
| --- | --- |
| `index.html` / `.js` / `.wasm` / `.pck` over HTTPS | 200; MIME `text/html`, `application/javascript`, `application/wasm`, `application/octet-stream` |
| Load outdoor homestead @ 1024×768 | OK — approved Haigen + Skölli + cottage + trails + pond + touch stick |
| Keyboard move (WASD) | OK |
| Cottage enter/exit | OK (after-move capture landed interior) |
| `python3 godot-haigen/tests/test_map_integrity.py` | OK (36 solids, 8 roads, trails present) |
| Touch stick visible | OK |
| Physical iPad Safari | **Not tested** in this environment |

Evidence: `godot-haigen/docs/evidence/issue-253-replay/` (this session) and prior `godot-haigen/docs/evidence/issue-253/` / `after/`.

## What does not / limitations

- Tunnel URL is **session-only** (not durable after agent stop)
- Physical iPhone/iPad Safari not run here (Chrome headless + framebuffer only)
- Visual quality **not** Captain-approved — see `VISUAL_MISMATCHES.md`
- V1 pocket only: walk + follow + door/interior; not full HTML game systems
- Cursor `publish-app` blocked (wasm false-positive PEM scan); CDN rejects ~42 MB wasm

## Durable hosting (needs your explicit approval)

No paid services. Free option that survives this agent:

| Option | Status |
| --- | --- |
| Cloudflare quick tunnel | Works **now**; dies with VM |
| Cursor publish-app | Blocked by wasm scanner |
| jsDelivr / raw CDN | 403 on 42 MB wasm |
| **GitHub Pages isolated path** | Available on existing free Pages — **needs Captain yes** |

If you approve, a minimal PR can place **only** `godot-haigen/web-preview/` (or a copy under `previews/godot-homestead-v1/`) onto existing Pages from `main`, without changing Pages settings, without editing `haigen.html`, and without merging full Godot project #252. Target URL:

`https://astravalealive.github.io/The_little_wanderer/godot-haigen/web-preview/index.html`

**Stopped on durable deploy until you explicitly approve that path.**

## Preserve

Live HTML V432, `haigen.html`, `wandererV127PreviewSave`, production Pages root game, and original `assets/*` remain untouched by this preview serve.
