# Mobile presentation V426 — before/after evidence

Visual baseline: live V425 iPhone presentation issues described in `docs/mobile-presentation-v425-plan.md` (centre speech, always-on coordinates, busy overlays).

Screenshots use an isolated temporary QA view at fixed camera locations. They never overwrite a real save.

| View | Before (V425) | After (V426) |
|------|---------------|--------------|
| Homestead | `before/homestead-iphone.png` | `after/homestead-iphone.png` |
| Great Lake shore | `before/great-lake-shore-iphone.png` | `after/great-lake-shore-iphone.png` |
| Lake island | `before/lake-island-iphone.png` | `after/lake-island-iphone.png` |

Capture helper: `node tests/live/capture-mobile-presentation.cjs [before|after]`

Regression suite: `node tests/live/mobile-presentation-v426.cjs`
