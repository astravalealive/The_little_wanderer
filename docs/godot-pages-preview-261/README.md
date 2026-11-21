# Durable Godot Pages preview — verification (PR #261)

**URL:** https://astravalealive.github.io/The_little_wanderer/godot-haigen/web-preview/index.html

Merged to `main` via squash #261 (Captain-approved Issue #253). No `haigen.html` changes; Pages settings unchanged; PR #252 not merged.

## Asset checks (HTTPS)
| Asset | Status | Content-Type |
|-------|--------|----------------|
| index.html | 200 | text/html |
| index.js | 200 | application/javascript |
| index.wasm | 200 | application/wasm |
| index.pck | 200 | application/octet-stream |
| Live haigen.html | 200 | still served |

## Device verification (this environment)
| Viewport | Result |
|----------|--------|
| iPad landscape 1024×768 | Loaded homestead; Haigen + Skölli + cottage + touch stick; input moved Haigen (`ipad-landscape-*.png`) |
| iPhone portrait 390×844 | Loaded; touch stick visible (`iphone-*.png`) |
| Physical iPhone/iPad Safari | **Not tested** here (Chrome headless emulation only) |

Note: Godot wasm breaks `page.evaluate` in Playwright (instanceof); verification used screenshots + asset HTTP checks.
