# Viking Haigen sprite pack (V434)

Production pack locked to the Captain’s front-walk reference (spiky blonde hair, red **X** cheek scar, royal blue + gold + white fur).  
**Does not replace** approved live atlases until Captain approval.

## Preview in-game

Open `haigen.html?vikingHaigen=1` — walk + region outfits swap to this pack. Default play stays on approved hoodie Haigen.

## Engine drop-ins (packed/)

| File | Size | Use |
|---|---|---|
| `haigen-viking-walk-atlas.png/.webp` | 192×288 | Base woodland walk (4×4 · 48×72) |
| `haigen-viking-region-outfits.png/.webp` | 192×2016 | Stack: snow, beach, desert, swim, downs, fen, wasteland |
| `haigen-viking-walk-{kit}.png` | 192×288 | Per-region kits (+ bonus `knight`, `ceremonial`) |
| `haigen-viking-expressions.png` | 288×288 | 3×3 dialogue busts (96×96) |
| `haigen-viking-items.png` | 240×120 | 18 item icons (40×40) |
| `haigen-viking-tools-row.png` | 240×60 | First 6 tools as 40×60 wrist props |
| `haigen-viking-actions.png` | 192×432 | Sword / axe / pick / shovel / net / rod |
| `haigen-viking-interactions.png` | 192×576 | Swim, boat, climb, pickup, chest, sit, sleep |
| `haigen-viking-outfit-heroes.png` | 896×192 | Front hero poses for the 7 travel kits |
| `haigen-viking-front-lock-hero.png` | 768×192 | Captain lock strip, 6 frames @ 128×192 |

Grid contract matches `drawApprovedHaigen`: rows down / up / right / left; cols idle + 3 walk; ~150 ms/frame; draw scale 1.67.

## Why ChatGPT-style one-shots fail

1. **No lock file** — always attach `refs/viking-haigen-front-walk-lock.png` (and the packed base walk).
2. **Wrong sheet size** — generate raw grids, then run the packer; never freehand “about 48×72”.
3. **Whole bible in one image** — one job per sheet (walk / expressions / items / one outfit).
4. **Perspective mix** — engine needs three-quarter top-down; the lock strip is upright hero art for faces/costume DNA only.

## Rebuild

```bash
python3 .github/scripts/pack_viking_haigen_atlases.py
```

Raw generators live in `raw/`. Refs in `refs/`. Manifest: `packed/manifest.json`.

## Style lock (non-negotiable)

- Spiky bright blonde hair silhouette (not hoodie-era dangly noodles for this pack)
- Blue eyes + red **X** scar on Haigen’s right cheek
- Royal blue cloth, gold embroidery/brooch, white fur collar + boot cuffs (base kit)
- Brown leather strap, belt, pouch; sword hilt over right shoulder on base kit
- Region kits keep the face/hair/scar; change cloth only

## Captain merge gate

To promote permanently (after approval only):

1. Copy `packed/haigen-viking-walk-atlas.webp` → `assets/haigen-reference-walk-atlas.webp`
2. Copy `packed/haigen-viking-region-outfits.png` → `assets/haigen-region-outfits.png`
3. Remove `?vikingHaigen=1` branch in `haigen.html` (or default it on)
4. Bump `GAME_BUILD` + `haigen-version.json` and ship evidence at iPhone 390×844 + iPad landscape
