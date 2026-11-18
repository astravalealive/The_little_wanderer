# Nordic 16-bit visual bible (Job 230)

Concise production lock for Haigen’s World after PRs #227–229. Inspired by classic top-down adventures; **no copied assets**.

## Grammar
| Rule | Spec |
|---|---|
| Perspective | Three-quarter top-down; one camera plane |
| Hero cell | Haigen 48×72 → ~80×120 @ 1.67; foot baseline `y-h+7` |
| Companions | Dylan 78×66; Skölli 148×78 — keep footprints |
| Outlines | 1–2 px `#1d2420`–`#2a2f2c`; nearest-neighbour on sprites only |
| Palette | Moss `#3f5a45`, leaf `#6f925c`, bark `#5a4330`, wood `#b8894a`, path `#a89068`, parchment `#f3ead2`, water `#3f7389`/`#4f87a0` |
| Lighting | Soft ground contact shadows; no purple fog wash |
| Animation | ~150 ms walk frames; readable at iPhone 390×844 |
| HUD | Ornate chrome may stay, but must not cover hero silhouette or speech |

## Must preserve
Gameplay, AI, collision, world geography, controls, `wandererV127PreviewSave`, approved atlases listed in `docs/style-guide-and-asset-inventory.md`.

## Ranked next batches (iPhone impact)
1. **Done here** — Remove duplicate painting stool (`paintHaigen` vs `artDrawables`).
2. Extend `nordicContactShadow` to homestead props (hens, houses, wildlife fallbacks).
3. Quiet toast / quest / minimap stacking vs speech on portrait phones.
4. Restyle painterly cart/easel toward pixel density (KEEP file, RESTYLE draw).
5. Companion/fauna outline density match to Haigen family.
6. Raft/skiff silhouette + drop system-font world labels.
7. Replace purple night mixes (`#514d87`) with cool navy/teal.
8. Full scenery atlas remaster (later Gate).

## Evidence
- `before/iphone-painting.png` — double stool (pose stool + easel seat)
- `after/iphone-painting.png` — single easel seat + upright painter (V429)
- `after/iphone-painting-close.png` — close crop of painter silhouette
- `before/iphone-homestead.png` / `after/iphone-homestead.png` — homestead reference frames
