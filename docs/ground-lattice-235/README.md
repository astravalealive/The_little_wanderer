# Job 235 — Ground lattice soften (V433)

Phase 1C: reduce obvious ground lattice / chunk blockiness.

## Changes
- `islandResolution` 128 → **256** (same 512u chunks; sharper terrain colour)
- Woodland `rbDrawGround` cell 6 → **8** (fewer alpha seams)
- No collision, packing, atlas, HUD, or save changes

## Evidence
`before/` + `after/` — homestead iPhone / iPad landscape / forest edge

Rebased onto post-#222 `main` as **V433**.
