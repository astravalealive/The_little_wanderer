# Issue #253 — playable HTTPS homestead preview

Goal: stable iPad Safari play link for the existing PR #252 `godot-haigen/web-preview/` export. No new gameplay features; production HTML / Pages game untouched; PR #252 not merged.

## Playable HTTPS (agent session)

Single-threaded Godot web export (no SharedArrayBuffer). Served with correct MIME for `.wasm` / `.pck` / `.js`.

**https://exercise-choosing-avenue-strip.trycloudflare.com/index.html**

Open in Safari on iPad (landscape). Cloudflare quick tunnels die when this agent VM stops.

## Durable hosting after this agent (needs Captain approval)

No paid services used. Free options checked:

| Option | Result |
| --- | --- |
| Cursor `publish-app` of `web-preview/` | **Blocked** — security scanner false-positives PEM-like byte sequences inside `index.wasm` (Godot binary; not real keys in source) |
| jsDelivr / raw.githack CDN | **Blocked** — `index.wasm` ~42 MB → CDN 403 |
| Cloudflare quick tunnel | **Works now** (this session) — not persistent after the VM stops |
| GitHub Pages isolated path | **Available** on existing free Pages host — needs Captain approval (see below) |

**Approval required for persistence beyond this agent:** allow a minimal deploy of only `godot-haigen/web-preview/` (or `previews/godot-homestead-v1/`) onto the existing GitHub Pages site from `main`. No Pages settings change, no `haigen.html` / save / gameplay edits, no merge of full PR #252. Resulting URL would be:

`https://astravalealive.github.io/The_little_wanderer/godot-haigen/web-preview/index.html`

(or `/previews/godot-homestead-v1/` if copied to that path). Stopped here per issue rules until that approval is explicit.

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
