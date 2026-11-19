# Issue #253 — stable iPad Safari Godot preview

Goal: playable HTTPS homestead preview from PR #252 export. No new features. Production (`haigen.html` / live Pages game) untouched.

## Bundle

Single-threaded web export (no SharedArrayBuffer):

- `godot-haigen/web-preview/index.html`
- `index.js`, `index.pck`, `index.wasm` (+ icons/worklets)

Serve with `Content-Type: application/wasm` for `.wasm`.

## Play URL (agent session)

While this agent VM is up, MIME-correct local server + Cloudflare quick tunnel:

**https://door-displaying-predicted-likely.trycloudflare.com/index.html**

Open in iPad Safari (landscape). Tunnel dies when the VM stops — not a long-lived production host.

## Persistent hosting options (no paid services)

1. **Cursor App publish** of `godot-haigen/web-preview/` (proposed from this issue run). Needs Captain confirm in the Publish dialog; choose **public** for device Safari without Cursor sign-in.
2. **GitHub Pages path** after Captain approves landing the preview folder on `main` (or merging PR #252):  
   `https://astravalealive.github.io/The_little_wanderer/godot-haigen/web-preview/`  
   Does not change `haigen.html`, but does republish the Pages site artifact. **Do not merge/deploy without Captain approval.**

## Verified in this environment

- `python3 godot-haigen/tests/test_map_integrity.py` — OK
- HTTPS load of html/js/pck/wasm with correct MIME via tunnel
- Chromium play: outdoor homestead, WASD + virtual stick, cottage enter/exit
- Screenshots attached on the agent run (HTTPS outdoor, near door, interior, after exit)
- Physical iPad Safari: **not** available in this VM — Captain should open the URL on device

## Out of scope / not claimed

- Visual quality sign-off
- Merge of PR #252
- Production Pages / live V432 changes
- Paid hosting or extra credit spend
