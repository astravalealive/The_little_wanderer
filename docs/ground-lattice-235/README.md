# Job 235 — Ground lattice soften (V434)

Phase 1C Worldbuilder milestone: reduce obvious ground lattice / chunk blockiness.

## Changes
- `islandResolution` 128 → **256** (same 512u chunks; sharper terrain colour)
- Woodland `rbDrawGround` cell 6 → **8** (fewer alpha seams)
- No collision, packing, atlas, HUD, or save changes

## Evidence
`before/` + `after/` — homestead iPhone / iPad landscape / forest edge

## Note
Build **434** assumes #241 (433) may merge separately; reconcile GAME_BUILD on merge order.
