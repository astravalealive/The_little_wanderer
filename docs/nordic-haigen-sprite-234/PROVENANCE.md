# Job 234 — Nordic Haigen atlas provenance

## Pipeline
1. **Concept (AI, not game-ready):** turnaround reference for Nordic hoodie + dangly blonde hair direction.
2. **Source sheet (approved playable):** `assets/haigen-reference-walk-atlas.webp` — V122 192×288 / 48×72.
3. **Controlled pixel cleanup:** `build-nordic-haigen-atlas-234.py`
   - Preserve original soft shading (no hard posterize)
   - Warm honey-blonde hair remap + dangly noodle locks (hair bible)
   - Front-view eye/mouth readability
   - Warm Nordic silhouette outline mix `#1d2420`
   - LEFT row = mirror(RIGHT) for `__haigenAtlasQA`
4. **Output:** `assets/haigen-nordic-walk-atlas-v433.webp` lossless WebP, transparent.

## Contract preserved
Cell 48×72, sheet 192×288, foot baseline y=68, scale 1.67, wrist-parented tools unchanged.

## Rebuild
```bash
python3 devkit/build-nordic-haigen-atlas-234.py
```
