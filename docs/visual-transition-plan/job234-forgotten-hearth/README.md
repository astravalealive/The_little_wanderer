# Job 234 — Forgotten Hearth architecture PoC (V433)

Continuous-world handcrafted district behind a **default-OFF** feature flag.

## Enable
- URL: `?hearth=1`
- Or `localStorage.forgottenHearthEnabled = '1'` then reload

## Scope
- One AABB (`forgottenHearth`) in dry woodland NW of homestead (cabin ~1180,900; gate ~1180,1125) on the west trail
- Abandoned cabin, cold hearth, narrow trails, stream, runestone, south gate threshold
- Soft fade + region rename on crossing; companions stay world-space
- Safe pocket: beasts retreat / do not force combat inside the AABB
- No `worldLayout` bump, no save migration, no object ID renumber outside authored `291000+` props

## Preserve
Gameplay, boats, quests, companions, `wandererV127PreviewSave`, approved atlases, coordinates outside AABB when flag off.

## Evidence
| | |
|---|---|
| Before gate approach iPhone | `before/gate-approach-iphone.png` |
| After gate approach iPhone | `after/gate-approach-iphone.png` |
| Before Hearth centre iPhone | `before/hearth-centre-iphone.png` |
| After Hearth centre iPhone | `after/hearth-centre-iphone.png` |
| After Hearth night iPhone | `after/hearth-night-iphone.png` |
| After Hearth centre iPad landscape | `after/hearth-centre-ipad-landscape.png` |
| After gate iPad landscape | `after/gate-approach-ipad-landscape.png` |
| Before iPad | `before/hearth-centre-ipad-landscape.png`, `before/gate-approach-ipad-landscape.png` |

## Tests
`node tests/live/forgotten-hearth-234.cjs`

**Do not merge or deploy without Captain visual approval.**
