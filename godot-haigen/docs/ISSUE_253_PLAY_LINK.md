# Issue #253 — playable HTTPS homestead preview

Goal: stable iPad Safari play link for the existing PR #252 `godot-haigen/web-preview/` export. No new gameplay features; production HTML / Pages game untouched; PR #252 not merged.

## Playable HTTPS (agent session)

Single-threaded Godot web export (no SharedArrayBuffer). Served with correct MIME for `.wasm` / `.pck` / `.js`.

**https://exercise-choosing-avenue-strip.trycloudflare.com/index.html**

Open in Safari on iPad (landscape). Cloudflare quick tunnels die when this agent VM stops.

## Durable hosting options (no paid services)

1. **Cursor publish (preferred, isolated from GitHub Pages)** — propose publish of `godot-haigen/web-preview/` as a public Cursor app so the link survives the agent. Requires one Publish confirmation (choose **public** for iPad without Cursor sign-in).
2. **GitHub Pages subdirectory** — would put files under the existing Pages site (e.g. `/godot-haigen/web-preview/`). Needs Captain approval because it deploys onto the production Pages host even if `haigen.html` is unchanged. Do not change Pages source/settings without approval.

jsDelivr cannot host `index.wasm` (~42 MB; CDN 403).

## Verified this session

| Check | Result |
| --- | --- |
| `index.html` / `.js` / `.wasm` / `.pck` over HTTPS | 200; MIME `text/html`, `application/javascript`, `application/wasm`, `application/octet-stream` |
| Load + outdoor homestead | OK (Chrome @ 1024×768) |
| Touch stick present | OK |
| WASD move + cottage enter/exit | OK |
| `python3 godot-haigen/tests/test_map_integrity.py` | OK |
| Physical iPad Safari | **Not tested** in this environment |

Evidence: `godot-haigen/docs/evidence/issue-253/` (browser) and `godot-haigen/docs/evidence/after/` (PR #252 framebuffer).

## Local serve (MIME)

```bash
python3 godot-haigen/tools/serve_web_preview.py
# http://127.0.0.1:8766/
```
