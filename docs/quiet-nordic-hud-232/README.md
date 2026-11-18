# Job 232 — Quiet Nordic HUD

Presentation-only lanes for portrait iPhone and iPad. Gameplay, art, controls and saves are unchanged.

V429 placed the speech bubble with a 78px head clearance. Haigen is drawn at 48×72 scaled by 1.67, so the bubble and its tail sat on his head. The toast and the quest panel also shared one band.

V430 keeps the ornate HUD and:

- parks the toast in the left column and the quest under the minimap
- lifts speech to the real sprite crown, then slides it if a long line still meets toast, quest or the minimap
- hides quest guidance while a modal or the adventure menu is open, the same way speech and toasts already hide

Matched captures use an isolated QA view at the homestead. They do not write a player save.

| View | Before | After |
|------|--------|-------|
| iPhone 390×844 | `before/iphone-stack.png` | `after/iphone-stack.png` |
| iPad portrait | `before/ipad-portrait-stack.png` | `after/ipad-portrait-stack.png` |
| iPad landscape | `before/ipad-landscape-stack.png` | `after/ipad-landscape-stack.png` |

Check: `node tests/live/quiet-nordic-hud-232.cjs`
