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

1. **GitHub Pages path** (recommended durable free host already on this repo) after Captain approves landing the preview folder on `main` (thin preview-only merge or PR #252):  
   `https://astravalealive.github.io/The_little_wanderer/godot-haigen/web-preview/`  
   Does not change `haigen.html`, but does republish the Pages site artifact. **Do not merge/deploy without Captain approval.**
2. **Cursor App publish** of `godot-haigen/web-preview/` was attempted and **blocked**: the publish security scanner flags false-positive “private key” matches inside Godot’s binary `index.wasm` (not real credentials). Re-trying publish would need either a scanner exception or a different host.

### Approval required for a link that outlives this agent VM

Captain: approve **one** of:

- Merge/land `godot-haigen/web-preview/` onto `main` so GitHub Pages serves the isolated path above (production game files unchanged), **or**
- Authorize a named Cloudflare tunnel / other free account-bound host (account settings).

Until then, use the session tunnel URL in this doc.

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
