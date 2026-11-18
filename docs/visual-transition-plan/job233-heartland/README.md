# Job 233 — Heartland Readability (V432)

First substantial visual pass for Ancient Woodland / homestead.

## Changes
- Homestead packing filter (~450u of cottage): thins rocks/bushes/flowers/mushrooms with path-corridor priority; stable IDs
- Woodland rock spacing into small formations outside the heartland ring
- Cottage → Silent Pond / Great Lake purposeful route + stronger path contrast
- ~12% calmer woodland greens / quieter floor flecks near home
- Preserve: landmarks, NPCs, bosses, Jobs 228–232 work, gameplay, collisions, `wandererV127PreviewSave`

## Evidence
| | |
|---|---|
| Before homestead iPhone | `before/homestead-iphone.png` |
| After homestead iPhone | `after/homestead-iphone.png` |
| Before forest edge | `before/forest-edge-iphone.png` |
| After forest edge | `after/forest-edge-iphone.png` |
| Before lake approach | `before/lake-approach-iphone.png` |
| After lake approach | `after/lake-approach-iphone.png` |
| After homestead iPad landscape | `after/homestead-ipad-landscape.png` |
| After lake iPad landscape | `after/lake-approach-ipad-landscape.png` |
| Before iPad landscape | `before/homestead-ipad-landscape.png`, `before/lake-approach-ipad-landscape.png` |

## Tests
`node tests/live/heartland-readability-233.cjs` (+ woodland-perf, save-corruption-214, game-build-identity, homestead-style-229)

**Do not merge or deploy without Captain approval.**
