# Haigen's World — cohesive-world overhaul execution baseline

This is the implementation contract for the next game-art changes, not permission to merge or deploy. Canonical playable source: `haigen.html`. Protect all saves, controls, mechanics, quests, approved sprites and `index.html`.

## Visual system (existing approved art bible remains authoritative)
- Original 16×16 native pixel terrain using 8×8 subtiles; nearest-neighbour sprite sampling, full device-resolution world composite. Never reinstate the rejected low-resolution whole-screen framebuffer.
- One restrained woodland/Nordic palette: spruce and moss greens, ochre tracks, slate, weathered timber, blue-green water; strong accents only for interactables and danger.
- One consistent character foot anchor, 4-direction movement, matching scale and directional tool actions. No floating tools, detached limbs or unintended prop placement.
- Ground and path continuity before decoration. Organic connected roads, legible riverbanks, believable tree clusters, clear entrances, no circular scatter clutter.
- Use the existing approved art baseline. Do not substitute generic placeholders or unlicensed Zelda tiles.

## Work packages (separate reviewable changes, ordered)
1. **Home woodland vertical slice:** terrain, connected trails, canopy-foot depth, rocks, buildings and homestead spacing. Capture matched before/after iPhone portrait and iPad landscape.
2. **Character/action integration:** Haigen, Skolli, Dylan and Niko scale, facing, anchored equipment, painting at easel, fishing and construction contact points.
3. **Water and wildlife:** fish schools, shoreline and reeds, boat launch/landing, biome-specific animal direction and animation.
4. **Settlements and regional world:** populated town routines, natural biome transitions, tundra patrols, swamp and desert encounters, meaningful routes.
5. **Boss and adventure polish:** readable anticipation/impact/recovery, boss arenas, connected island discovery and progression, UI/dialogue clarity.

## Hard acceptance gates for every package
- Change the real canonical game; no documentation-only claim of gameplay completion.
- Visual review must show *actual pixels* from an executable build, not only screenshot filenames, counts or CI success.
- iPhone/iPad controls, startup, asset loads, world depth, save fixture and existing live regression remain green.
- Explicit user approval before merge or deployment. Keep experimental agents/builders confined to a sandbox.
- Do not couple this overhaul to the draft depth-test PR #273; use current main as base.

## Immediate engineering task
Begin with the woodland terrain and path renderer: inspect current source and approved assets, select a small bounded art-only transformation, capture visual evidence, and confirm no collision, pathfinding, quest, or save mutation. Avoid broad search-and-replace changes in the monolithic game file.
