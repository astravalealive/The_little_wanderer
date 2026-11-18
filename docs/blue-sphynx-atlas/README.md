# Blue Sphynx atlas (V435)

Production companion atlas for **Blue**, the locked hairless Sphynx from the approved reference package.

## Visual lock

- Horn-shaped outward-curving ears (not generic upright cat ears)
- Completely hairless / whiskerless body
- Mauve–lavender skin, dark muzzle, peach chest/inner ear, chartreuse eyes
- No redesign, fur, clothing, or new silhouette

## Atlas

| Property | Value |
|----------|-------|
| Asset | `assets/blue-sphynx-atlas-v435.webp` |
| Size | 384×320 (4×4 cells of 96×80) |
| Rows | down, up, right, left |
| Cols | idle + 3 walk frames |
| LEFT | baked `mirror(RIGHT)` |
| Draw | 58×48, foot pad +5, `imageSmoothingEnabled=false` |

Rebuild:

```bash
python3 .github/scripts/build_blue_sphynx_atlas.py
```

## Integration

- Companion `kind: 'sphynx'` as `companions[2]` — Dylan/Skölli indices and behaviours unchanged
- Skölli ruins-guard AI gated on `kind==='fox'` only (Blue does not inherit it)
- Blue gently follows Haigen; berry gifts map to `friends.blue`
- Save key remains `wandererV127PreviewSave`; old saves get `friends.blue` default `0`

## Evidence

- `atlas-preview-4x.png` — magnified atlas
- `after/` — in-game iPhone / iPad screenshots
- Live test: `tests/live/blue-sphynx-atlas-435.cjs`
