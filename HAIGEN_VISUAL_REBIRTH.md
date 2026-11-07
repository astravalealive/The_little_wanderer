# Haigen's World: The Rebirth Art Bible

**Status:** Active visual reboot, V115 original SNES-style pixel density and first wildlife conversion. This document describes the target look and the minimum shippable asset set. Existing gameplay and saves must remain compatible.

## North star
An original top-down woodland fantasy with 16-bit-era readability, restrained colour and atmospheric nature. Use the user's WinLu exterior tileset reference for composition and quality targets, **not** as an unlicensed source of tiles or pixels. Build original art unless a commercial licence is explicitly verified.

## Source style rules
- Original pixel artwork. Native terrain atlas tiles: **16×16 pixels**, composed from **8×8 subtiles**; world coordinates, collision footprints and camera movement remain independent of atlas size. Props and characters assembled on aligned tile footprints. No AI-upscaled raster smearing.
- Render sprite sheets with **nearest-neighbour** scaling. Palette grouped into moss/spruce greens, blue-green water, ochre paths, slate stone, weathered timber and candlelight. Reserve bright colours for usable objects and danger.
- Foreground obstruction and elevation are explicit; characters cannot be hidden by arbitrary oversized canopies. Keep roads and exits legible.
- Ground and rock transitions use deliberate shapes and alpha-free edged tiles. Sparse flower clusters and grass. Avoid pasted-on round circles and excess particle confetti.
- Animation is quiet and functional: readable poses, planted feet, soft anticipation, brief impact and recovery. No constant bobble/bounce.
- UI: compact woodland-kit materials, good mobile text contrast, finger-safe controls, no obstructing bubbles during panels.
- Keep independent Haigen AI; visual art is **view-only**, no changes to collision, character logic, quests or save coordinates.

## Production asset checklist

| Atlas / system | Required work | Minimum coverage |
|---|---|---|
| **Ground** | Woodland floor, 3+ grass variants, dirt trail, compacted trail, moss, leaf litter, wet edge, shadows | 16×16 seamless tiles and terrain transitions |
| **Water** | Pond floor, shoreline edge and corners, shallows, current, waterfall foam, docks and bridges | 16×16 and 2–4 frame ambient animation |
| **Elevation** | Cliffs, ledges, stairs, stone retaining walls, river banks | Walkable edges and occlusion layers |
| **Vegetation** | Oak/ash/birch and spruce, berry bushes, grasses, reeds, flowers, root stumps | Three tree silhouettes and size variation |
| **Architecture** | Camp clearing, hut, roof states, coop, wood shed, garden beds, fenced plots, lanterns, workstation | 3 build stages before completed structure |
| **Haigen** | Four facings: idle, walking, gathering; tool swing, hit, rest, building and thought poses | 4 facings × 3 walk frames plus actions |
| **Companions** | Dillon and Skölli with 4 facings, stand/walk/rest, context-specific idle | 4 facings × 3 movement frames |
| **Wildlife** | Wolf, boar, chickens, frogs, ducks first; all region wildlife after | 4 facings where movement warrants; alert/flee/attack/hit |
| **Effects** | Wood splinters, stone fragments, digging earth, rain/wet footsteps, firelight, hurt flash | 2–5 frames per action |
| **UI** | Notebook, inventory/backpack, project tracker, map labels, crafting menu, progress indicators | Consistent neutral forest materials |

## Implementation sequence

### V115: SNES pixel-density foundation (implemented)
- Original SNES reference: 256×224 screen, 16×16 overworld tiles constructed from 8×8 graphic tiles. These are **historical constraints for our original artwork**, not copied assets.
- Rebirth mode uses a virtual 256×224 native canvas framing, expanded along the longer display axis for iPad and iPhone aspect ratios while preserving square pixels. CSS nearest-neighbour enlarges the image.
- Mobile world zoom increased 18% for legibility. All camera pan and pointer-to-world calculations use the same zoom helper.
- Ground atlas divided into **16×16** cells and detailed with **8×8** subtiles. Pixel flora and mushroom clusters replace painterly versions in the home woodland.
- First directional animal conversion: Greyfang/wolf, boar, hens, frogs and ducks, with original sprites and cached frames.
- Classic mode remains separate and uses the full device-pixel-ratio canvas. Appearance toggle never mutates `wandererTestSave`.
- **Important remaining work:** re-author shorelines, paths, bridges, cliffs, coop/garden/workshop art, remaining animals and biome tiles at the same native resolution. A virtual framebuffer alone is not equivalent to a complete set of original pixel atlases.

### V114: First woodland vertical slice
- Original directional pixel sprites for Haigen, Dillon and Skölli. No sideways-only walking.
- Crisp tool strike poses in the player's facing direction.
- Original pixel woodland ground, trees, rocks, berry bushes and tier-2/3 cottage art.
- Restrained forest UI.
- A reversible **Rebirth / Classic** appearance toggle under More. Separate key **haigenVisualStyle**, leaving the game-save key **wandererTestSave** intact.
- Scope: woodland home and Silent Pond. Other regions retain the existing art until their own pass.
- **Quality gate:** syntax and mock render checks, GitHub Pages publish, hands-on Safari test for direction, draw layering, FPS, swinging and zoom.

### V115: Full home-and-pond cohesion
- Redraw water banks, cliffs, jetty, paths, bridges, fire/lanterns, coop, garden and wood store using one tile grid.
- Add depth-separated front/ground layers and smooth water/torch ambience without overwhelming pixels.
- Test all three autonomous build projects visually.

### V116: Wildlife and action
- Replace first seven species' illustration logic with original atlas-based animation; add directional alert, lunge, flee, hurt and death.
- Refine axe/pickaxe/shovel impact timing, sound synchronisation and debris.

### V117: Biomes and interface
- Carry the same art language into downs, desert, coast, snow, fen and wasteland, each with its own terrain palette and wildlife atlas.
- Retheme notebook/backpack and story presentation; test controller, touch and keyboard layouts.

## Runtime contract / regression gates
- **Never edit** original `index.html` or Ember.
- Preserve localStorage save `wandererTestSave`, story/quests, animal lives, AI building, controller movement and the active world positions.
- Avoid unauthorised WinLu assets. Any purchased third-party asset must have a recorded licence and attribution as required.
- Prefer cached atlases/patterns over per-frame offscreen rendering. iPad Safari must stay responsive with the main map and wildlife visible.
- Retain an instant Classic fallback until the new renderer passes iPad playtesting.
