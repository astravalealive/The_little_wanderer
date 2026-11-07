# Haigen's World · Approved Art Baseline · V130

Canonical live entrypoint: `haigen.html`. Prior preview page redirects to it. Original Ember game at `index.html` must never be overwritten.

## Approved sources, do not replace with placeholders
- `assets/skolli-fox-illustrated.png`
- `assets/woodland-fauna-illustrated.png`
- `assets/regional-fauna-illustrated.png`
- `assets/haigen-wildlife-motion.webp`
- `assets/haigen-trails.webp`
- `assets/haigen-region-outfits.png`
- `assets/gloamjaw-illustrated-v129.svg`
- `assets/dylan-rabbit-approved-v125.png` (approved Dylan)
- `assets/haigen-reference-walk-atlas.webp` (Haigen movement)

The original detailed Gloamjaw image-generated sheets have been approved as a future sprite source, but are **not** yet in the repository. Don't claim otherwise or replace their visual target with generic art. Current playable Gloamjaw uses the six-pose SVG module. Maintain forest arena at (930,2710), boss mechanics, saved game key, and all existing quests.

## Regression checks
- `window.__haigenAssetReport()` lists failed asset loads in the Safari console.
- New changes always start from the current `main` and modify that source directly.
- For major breakages, revert to prior main commit `ecc9da0162014bf47fe475d24a56fbcaa95a4cb7` or any later known-good commit.
- Keep the only live game at `haigen.html`; do not create separate live preview pages.
