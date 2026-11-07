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

### V119: Single-character animation rig, props and region wardrobe (implemented)

- A **new original 192×288 movement atlas** under `assets/haigen-v119-movement-atlas.png` uses 4 rows (down, up, right, left), each with four distinct walk frames in fixed 48×72 cells. Trainers are actual art, not stretched missing shoes. Brief side-to-front turns retain the approved three-quarter poses.
- The original V117 approved sheet remains in place for Haigen's blanket/sleeping pose and safe fallback; the V118 expanding-poses workaround is no longer used when the new atlas is loaded.
- **Independent animation layers**: base character, region outfit, equipped item, transient action, special swimming mask, damage shock. Never change the player collision or animation cell dimensions because an item is held.
- Region variants: orange hooded winter coat, desert travel outfit, beach shorts and lighter top, fen/downs/wasteland palettes; swimming adds snorkel goggles and tube. These are first-pass recolours and pixel accessories, not finished illustrated outfit atlases.
- Carry/ready poses currently support axe, pickaxe, shovel, torch, rod and net in all four directions. Tool-action progress includes timed key poses, while the old oversized detached swing is suppressed when the new character is loaded.
- Event-driven sequences now include chopping, digging, mining, torch raising, fishing cast and fish landing, eating, salve/antidote, food and medicine cooking. The animation layer stays ephemeral and never changes the saved economy.
- Predator damage: brief shock stepping pose, current injury flashing, collision-aware finite knockback directed away from the attacker, temporarily pauses player/AI movement. Preserves health/poison/rescue systems.
- New craftable net and hotbar tool; catching butterflies and catching/carrying/releasing a frog into safe habitat are playable foundations for a future dedicated minigame.
- **Future dedicated animation atlases:** precise action sheets and transitions for each tool and facing, fishing line/bobber synchronisation, frog-and-butterfly minigame timing, enhanced snorkelling/swimming cycle, outfit-specific rest/attack variants, finer impact particles, and iPad frame-rate polish.



### V118: Haigen's approved silhouette locked
- The family's approved sprite sheet is the identity reference: shaggy sweeping blonde fringe, oversized black/charcoal hoodie, dark shorts and trainers.
- Normalize front, back and side sprite frames to a consistent **42px opaque width inside 48×72 cells**. Preserve a fixed foot baseline and maintain native pixel sharpness.
- Cache normalization on loading the existing original atlas; do not apply per-frame resizing at draw time. The resting and pointing artwork remain unchanged.
- This resolves the visual change between narrow front/back sprites and fuller side walking frames in the iPad recording.
- Validate against the next hands-on iPad Safari walk cycle before extending the art reboot to animals, buildings and biomes.



### V116: Stable hybrid rendering (implemented)
- **Full native device-resolution canvas** in Rebirth as well as Classic. The entire frame is never resampled/pixelated. This removes the crawling/jittering pixel-grid effect when the camera scrolls.
- Keep pixel artwork at original tile/sprite resolution and draw it with nearest-neighbour per asset. Normal scenery/vector effects and HUD retain full sharpness.
- Haigen's thought bubble now uses **HTML in fixed screen space**. Font size remains 14px regardless of camera zoom, long sentences wrap, and the bubble follows the projected world position without compressing dialogue into one line.
- Menus and modals hide the dialogue automatically. The existing game state, AI, life-building and saves are unchanged.
- **Field test:** iPad Safari scroll/zoom and speech readability, especially dense forest and two-makers thoughts; verify no excessive movement jitter.

### V115: SNES pixel-density foundation (historical experiment)
- Original SNES reference: 256×224 screen, 16×16 overworld tiles constructed from 8×8 graphic tiles. These are **historical constraints for our original artwork**, not copied assets.
- V115 experimented with a virtual 256×224 framebuffer. **Retired in V116** after video testing showed camera-motion shimmer and unreadable canvas text. Native asset tiles stay 16×16/8×8; render the composited world at full device resolution.
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
