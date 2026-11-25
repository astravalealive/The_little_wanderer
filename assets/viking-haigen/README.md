# Viking Haigen sprite pack (issue #292 / PR #291)

**Art lock:** Captain six-frame front walk (`refs/viking-haigen-front-walk-lock.png`).  
**Do not merge, deploy, or replace approved atlases without Captain approval.**

## Two layers (intentional)

| Layer | Path | Purpose |
|---|---|---|
| **HD production** (claim) | `production/` | 384×720 cells, 6-frame strips, verified `loop.gif`, `atlas-hd.json` |
| Engine-compat preview | `packed/` | Optional 48×72 / 192×288 sketches for `?vikingHaigen=1` only |

#292 forbids treating poster catalogues or crushed mini-sprites as production-ready. HD is the standard.

## Playable proof

Open `hd-poc.html` — 4-direction HD walk with verified loops. Does **not** replace live `haigen.html`.

Optional mini preview in the live game: `haigen.html?vikingHaigen=1` (packed sheets).

## HD status

| Sheet | Source | QA |
|---|---|---|
| walk/front | **corrected candidate** (lock-derived strip blocked: same-foot stride) | pixel QA PASS · **visual foot sign-off required** |
| walk/front-from-lock-blocked | archived lock-derived front | FAIL — do not deploy |
| walk/right · back | generated strip → HD fit | PASS |
| walk/left | mirror(right) | PASS (laterality preview) |
| axe/{front,right,back} | isolated action sheets + hand grip | PASS |
| axe/left | mirror(right) | PASS — **preview-mirror-only** |
| pickaxe/{front,right} | isolated sheets + grip | PASS |
| pickaxe/left | mirror(right) | preview-mirror-only |
| idle/front | micro-idle from lock frame 0 | PASS |

**Deployment gate:** blocked until Captain visually confirms front walk foot alternation. Master lock file in `refs/` is unmodified.

Handoff constraints (Master Daily 2026-11-21 / Complete Handoff 2026-11-19): Godot shelved → HTML only; no merge/deploy without Captain approval; tools must connect to hand anchors.

## Rebuild

```bash
python3 .github/scripts/build_viking_haigen_hd.py \
  --import-right assets/viking-haigen/raw/hd-walk-right-raw.png \
  --import-back  assets/viking-haigen/raw/hd-walk-back-raw.png \
  --import-action axe assets/viking-haigen/raw/hd-action-axe-raw.png
```

Metadata: `production/atlas-hd.json` (frame rects, pivots, 150 ms, grip anchor stub).  
QA: `production/qa-report.json`.

## Live engine constants (audit)

Cell **48×72**, sheet **192×288**, scale **1.67**, foot `y-h+7`, 4 frames @ ~150 ms — see `docs/viking-haigen-sprite-pack.md`.

## Style lock

Spiky blond, blue eyes, red **X** scar, cobalt + gold + white fur, brown leather, sword hilt on base kit. One action / one direction per sheet.
