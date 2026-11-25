# Viking Haigen sprite pack — issue #292 handoff

Status: **in progress on PR #291** (`cursor/viking-haigen-sprite-pack-384d`).  
**Do not merge / deploy / replace playable HTML without Captain approval.**

Closes nothing until HD walks + verified loops pass QA. Incorporates GitHub issue **#292**.

## Audit (verified from code, not assumed)

| Constant | Source | Value |
|---|---|---|
| Live cell | `haigen.html` `drawApprovedHaigen` | **48×72** |
| Live sheet | movement atlas load | **192×288** (4×4) |
| Draw scale | `const scale=1.67` | ~**80.16×120.24** |
| Foot baseline | `y-h+7` | fixed |
| Walk cadence | `Math.floor(anim/150)%4` | **~150 ms**, **4** frames/dir |
| Directions | row map | down=0, up=1, right=2, left=3 |
| Tools | `haigenDrawPixelTool` | **40×60**, grip pivot **(20,48)** |
| Region kits | `travelKits` + `haigen-region-outfits.png` | 7×288 stack |
| Expressions | — | **none** in live engine (faces baked in cells) |
| Build | `GAME_BUILD` / `haigen-version.json` | **435** on this branch |

Primary loaders: `haigenMovementAtlas` → `./assets/haigen-reference-walk-atlas.webp`; fallback `haigen-v119-movement-atlas.png`; sleep from `haigen-approved-atlas.png`.

### Related open work (do not conflict)
- **PR #241** Job 234 Nordic walk PoC — separate 48×72 atlas from hoodie sheet; dirty vs main. Different art lock (honey dangly locks). This Viking pack does **not** touch that branch.
- **PR #234** Quiet Nordic HUD — out of scope.
- This PR #291 — Viking HD production + optional `?vikingHaigen=1` mini preview only.

## #292 visual standard (non-negotiable)

Captain six-frame blond Viking lock is the **art-quality master**:
`assets/viking-haigen/refs/viking-haigen-front-walk-lock.png`

- Crisp detailed pixel art, blue eyes, spiky blond, fur mantle, cobalt+gold Norse cloth
- **Production cell: 384×720**, six large frames per direction strip
- One action / one direction per sheet
- No poster composites claiming to be game-ready
- Mini `packed/` 48×72 sheets are **engine-compat sketches only**, not the production claim

## Pipeline

```bash
# HD production (preserves lock density)
python3 .github/scripts/build_viking_haigen_hd.py \
  --import-right assets/viking-haigen/raw/hd-walk-right-raw.png \
  --import-back  assets/viking-haigen/raw/hd-walk-back-raw.png

# Optional legacy engine-size packer (preview only)
python3 .github/scripts/pack_viking_haigen_atlases.py
```

Outputs: `assets/viking-haigen/production/` + `atlas-hd.json` + `loop.gif` per direction.

## Playable PoC
`assets/viking-haigen/hd-poc.html` — high-detail walk playback (does not alter default `haigen.html`).

## Incorporated handoff constraints (uploaded 22 Nov 2026)

From `Haigens_World_MASTER_DAILY_REFERENCE_2026-11-21` + `COMPLETE_Cursor_Handoff_2026-11-19`:

- **Godot shelved; HTML only** for current sprite work.
- No merge / deploy / spend / live atlas swap without explicit Captain approval.
- Preserve live `haigen.html` and saves (`wandererV127PreviewSave`).
- Sprite grammar: idle + walk four directions; tool actions with **hand anchors**; no floating equipment / noodle arms.
- Judge by playable visible results — do not claim untested sheets production-ready.
- Left-facing sheets mirrored from right remain **preview-only** until a true left master exists (scar/sword laterality).

## Current verified HD extras (this continuation)

- `production/actions/axe/{front,right,back,left}/` — 6-frame, 384×720, grip anchors in `atlas-hd.json`
- `production/actions/pickaxe/{front,right,left}/` — pickaxe action sheets
- `production/idle/front/` — lock-derived micro-idle
- `production/walk/front/` — **corrected front walk candidate** after lock-derived same-foot FAIL
- `production/walk/front-from-lock-blocked/` — archived failing lock-derived front
- `hd-poc.html` modes: Walk / Axe / Pickaxe / Idle
- **Deploy blocked** until Captain visual foot-alternation sign-off on corrected front

## Captain gate
No permanent atlas swap, merge, or deploy without explicit approval.
