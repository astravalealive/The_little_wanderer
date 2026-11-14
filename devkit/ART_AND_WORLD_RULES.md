# Haigen's World Development Kit — Foundation v1

Status: **development proposal, not enabled in the live game**. Existing gameplay, artwork, controller mappings and local saves remain untouched.

## Goal
Build a repeatable workflow for making beautiful, consistent areas. First proving ground: homestead and surrounding woodlands. Preserve existing authored content and gameplay behaviour during migration.

## Art bible: first working rules
- Perspective: fixed top-down three-quarter RPG view. No mixing side-view and top-down sprites.
- Tile *logical placement* grid: 32 world units, **provisional** until measured against current character and doorway geometry. Art pixel resolution is independent of world units.
- Every asset defines: id, version, sprite sheet, frame width/height, pivot/feet anchor, world dimensions, render layer, collision footprint, directions and named animations.
- Ground: reusable grass, path, water and transition tiles. Autotile edges/corners rather than hard-coded patchwork.
- Buildings: footprint plus doorway, entrance clearance, interior destination and optional attached props. Place as one prefab.
- Trees: trunk collision only; foliage may overlap characters via render layers; avoid blocked paths.
- Animation: named states (idle, walk, act, sleep where applicable) in four directions. Validate atlas dimensions and frame rectangles before accepting.
- Lighting: separate world illumination and emissive sources (windows, campfires, runes). Avoid blanket black night filters.
- Preserve the approved six mood palettes below as reference values. Apply with gradual transitions, not instant global recolouring.

## Approved palette reference
| Mood | Hex colours |
| --- | --- |
| Daylight | #91bd79 #5e975b #d6c88c #a7d6e5 |
| Moonlit night | #171e67 #39318d #6966c4 #b8caff |
| Golden dusk | #6f493e #b87744 #e8ad65 #e6c18c |
| Thunderstorm | #202e43 #40536b #66717c #a2b6c9 |
| Sandstorm | #76503a #ac774a #d7a36b #e8c59a |
| Magic or memory | #312451 #6b478f #a17bc3 #e1c5f4 |

## Placement contract
1. Editor previews candidate position and footprint.
2. Snap to logical grid for structures; vegetation may use bounded decorative offsets.
3. Reject solid overlaps and reserved doorway/route clearance.
4. Store objects by stable id with position, rotation/variant, prefab id and schema version.
5. Collision, render order, entrances and interactions are derived from the prefab definition, not separately repositioned by hand.
6. Every placement must be reversible; never rewrite a player's existing save while editing.

## Development sequence
1. Audit existing homestead scale, terrain, collision and asset definitions.
2. Prototype terrain tile palette and placement validation in a **separate dev preview**.
3. Migrate one small woodland test patch, not the entire map.
4. Test gamepad, movement, collision, doors, AI, save compatibility and zoom performance on iPad/iPhone.
5. Show before/after for approval. Merge gameplay changes only after approval.

## Acceptance criteria for phase 1
- Repeatable tile placement with correct path/water transitions.
- One tree and one building prefab snap consistently and reject invalid placements.
- All sprites use consistent pivot, scale and render layers.
- No regression to existing saves or live game.
- No measurable worsening of zoomed-out performance.
