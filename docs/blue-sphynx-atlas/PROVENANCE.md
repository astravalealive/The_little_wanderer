# Blue atlas provenance

| Field | Value |
|-------|-------|
| Approved reference | `docs/blue-sphynx-atlas/reference/BLUE_APPROVED_REFERENCE.png` |
| Spec | `docs/blue-sphynx-atlas/SPRITE_SPEC.md` |
| Builder | `.github/scripts/build_blue_sphynx_atlas.py` |
| Output | `assets/blue-sphynx-atlas-v435.webp` |

## Method

1. Extract individual Walk / Idle poses from the locked presentation sheet (not the whole sheet).
2. Remove black plate + gold UI chrome without destroying chartreuse eye pixels.
3. Soft-nudge colours toward a palette sampled from the approved idle/walk frames.
4. Foot-baseline every cell (pad = 3).
5. LEFT = horizontal mirror of RIGHT (anatomy-safe).
6. DOWN walk pose-completed from locked front idle face/ears + UP leg cadence — face identity stays approved; no new character design.

See `atlas-meta.json` for SHA-256 hashes of source and output.
