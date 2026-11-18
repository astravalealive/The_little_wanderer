# Job 234 — Nordic Haigen sprite PoC (V433)

Playable original Nordic top-down Haigen treatment. Not documentation-only.

## What changed
- Additive atlas `assets/haigen-nordic-walk-atlas-v433.webp` (192×288, 48×72 cells)
- Controlled cleanup from approved V122 sheet: warm Nordic outlines, honey-blonde dangly locks, clearer front face, corrected DOWN walk cell 2
- LEFT = mirror(RIGHT); scale 1.67; foot baseline unchanged; tools stay wrist-parented
- Legacy `haigen-reference-walk-atlas.webp` kept on disk as provenance/fallback source

## Preserve
Gameplay, HUD/CSS (PR #234 Quiet Nordic HUD untouched), NPCs, bosses, paths, boats, collisions, `wandererV127PreviewSave`, companions, scenery.

## Evidence
| | |
|---|---|
| Before iPhone | `before/homestead-iphone.png` |
| After iPhone | `after/homestead-iphone.png` |
| Before iPad landscape | `before/homestead-ipad-landscape.png` |
| After iPad landscape | `after/homestead-ipad-landscape.png` |
| After close crop | `after/haigen-close-iphone.png` |
| Atlas preview | `atlas-preview-4x.png` |

## Rebuild
`python3 devkit/build-nordic-haigen-atlas-234.py`

**Do not merge/deploy without Captain approval.**
