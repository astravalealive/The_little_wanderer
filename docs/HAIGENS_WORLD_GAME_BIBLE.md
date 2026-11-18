# HAIGEN'S WORLD: CREATIVE DIRECTION & GAME BIBLE
Status: proposed master vision for Captain approval. Do not change production game, merge, or deploy from this document alone.

## North star
Build a cohesive, readable, emotionally rich top-down Nordic adventure for Haigen, a curious Viking child. The player should immediately understand where they are, what can be interacted with, what is dangerous, and why exploring is rewarding. Aim for the disciplined visual consistency, clear tile/world grammar, silhouettes and navigation legibility of SNES-era The Legend of Zelda: A Link to the Past, with original artwork, world, characters, music and designs. **Do not copy Nintendo assets, maps, characters or compositions.** The game is not an asset collage. Every element must belong to one original art direction.

## Leadership
Captain/user: final creative authority, approves style baseline, major mechanics, merges and deployment.
Mimir/ChatGPT: product/design lead, translates intent into acceptance criteria, reviews GitHub code and visual evidence.
Cursor: implementation and art-direction assistant, may inspect, propose, prototype and create PRs; no unapproved merge/deploy or wholesale asset replacement.
GitHub: canonical source, PR review, CI and rollback. Canonical game is `haigen.html`; root `index.html` is a different older prototype.
Do not refer to Huginn/Muninn as development agents.

## Pillars (ordered)
1. **One visual grammar.** Original 16-bit-inspired top-down pixel art with consistent pixel density, outline/shading rules, perspective, colour palette, sprite scale, terrain transitions, shadows, lighting and animation timing. No mixed high-resolution painterly assets, incompatible pixel filters or mismatched rendering styles. Art should be handcrafted and legible at actual iPhone/iPad display sizes.
2. **World readability.** A clear world grid and collision language: roads and paths readable, doors obvious, walkable vs blocked edges unambiguous, water depth and hazards distinguishable, foreground occlusion controlled. Repeatable tile and sprite metrics, canonical camera zoom, consistent anchor points, collision footprints and occlusion layers. Avoid clutter.
3. **A living Viking childhood adventure.** Haigen explores independently and through player guidance; companions Skölli (protective fox), Dylan (rabbit gatherer), Niko (hooded mage), Blue (Sphynx cat), animals and villagers have understandable routines. Autonomous behaviour must never override explicit player commands.
4. **Discover, gather, build, sail, return.** Homestead and woodlands are the heart. Gather and craft to upgrade home and boatbuilding. Lake raft is a teaching vessel; coastal skiff unlocks nearer islands; ocean longship enables farther lands and rare materials. Different regions supply distinct resources, opening meaningful progression.
5. **Nordic atmosphere and rewards.** Scandi/Viking-influenced architecture, folklore, rune stones, ravens and myths. Distinct bosses in each region drop practical outfits, abilities or items; Leshy deer spirit in Ashen Lands yields a concealment outfit. Bosses should be readable, fair and visually memorable.
6. **Accessible, responsive mobile play.** iPhone and iPad Safari, touch and controller support. Minimal but usable HUD, unobtrusive dialogue, stable camera, legible toolbelt and menus, responsive interactions, smooth performance. Keep dev coordinates opt-in.
7. **Respect players' worlds.** Preserve saved progress, inventory, companions, maps, buildings and controls across changes. No silent save resets.

## Art direction system to design and approve BEFORE replacement
- **Reference board:** 8-12 images illustrating original target style, not direct Zelda copying. Show woodland, homestead, characters, boats, desert, tundra, swamp, coast and one boss.
- **Pixel metric specification:** choose a base world tile size, character sprite dimensions, consistent object ratios and camera zoom(s). Document actual code constraints and existing art sizes before proposing numbers.
- **Palette:** bounded family of hues with region-specific accents; consistent outlines, highlights, cast shadows, ground contact and contrast. Preserve distinct materials.
- **Perspective:** one top-down/three-quarter projection with consistent roof, wall, ground, tree and water treatment. No conflicting viewpoints.
- **Sprites:** original character/animal sprite sheets with coherent up/down/left/right directions, animation cadence, silhouettes, scale and readable actions.
- **Environments:** terrain autotiling/transitions; unified trees, grass, paths, rocks, water, structures, reeds, crops and props. Clear navigation and interactions.
- **Lighting/FX:** restrained, performant day/night, water wakes, torches, particles, weather. Never obscure gameplay.
- **UI:** ornate but quiet Nordic framing; reserve safe zones for HUD, joystick, toolbelt, minimap and speech. No central blocking overlays. Test in portrait iPhone, portrait/landscape iPad.
- **Asset audit:** inventory every asset and renderer, tag as KEEP / RESTYLE / REPLACE / REMOVE WITH APPROVAL. Do not delete legacy art or change save references until migration is tested.

## World and progression
Central Ancient Woodland/homestead; Great Lake and training raft; Saltwick coast and skiff; Northern Tundra and fortress; Forgotten Swamps; Western Rainforest; eastern islands; southern downs/beach settlement; desert; Ashen Lands; distant islands accessible by longship. These are existing vision elements, not claims of current implementation. Establish which are actually playable.
- A clear quest loop: discover obstacle -> gather specific materials -> craft tool/boat/outfit -> unlock region -> face boss -> gain practical reward -> return and upgrade.
- Boss rewards must have tangible utility, not just cosmetics.
- Mycology and discovery journal/rune stone should be meaningful, optional and suitable for Haigen.
- The game should feel alive without overwhelming the player with prompts.

## Existing work to preserve
Existing buildings, garden, cabin interiors, companions, wildlife, boat systems, build mode, audio, interactions, terrain, combat, saves, mobile touch/controller and performance work. Do not assume all requested features are present: verify main and game runtime. No wholesale rewrite of 800k+ character `haigen.html` in one PR.

## Implementation order
**Gate 0: Truthful baseline.** Confirm live V425 and GitHub source; record screenshots at fixed coordinates, save data in isolated test contexts, input/camera states, and device performance. Current iPhone screenshot shows busy HUD and mixed-scale art. PR #222 Pages repair is separate and unmerged; avoid changing deployment while building the style baseline.
**Gate 1: Style bible and visual prototype.** Produce a sprite/tileset/style guide and one mockup of the homestead plus one character. Show before/after at identical camera view. Captain approves style BEFORE production restyling.
**Gate 2: Vertical slice.** Rebuild the woodland homestead -> lake -> first island experience in the approved visual system, using small reviewable PRs and migration-safe asset layers. Include gameplay, camera, UI and a coherent first exploration reward.
**Gate 3: Scale world.** Apply style consistently to other biomes and structures; implement boat progression, boss rewards, islands and living-world interactions in priority order.
**Gate 4: Polish.** Optimise iOS performance, accessibility, audio, visual effects, save migration and deployment reliability.

## Quality bar / definition of done
A change is not done just because tests are green. Every visual PR must provide same-scene before/after captures, reference to approved art rules, mobile touch/gamepad regression evidence, save round-trip, no broken assets, and measured performance. Compare visually on real iPhone/iPad before merge. No new asset may violate perspective, palette, pixel density, scale or readability. No PR that only adds a shadow, moss tint or similarly imperceptible detail unless fixing a demonstrated issue.

## First Cursor assignment
1. Read this document and current `haigen.html`, asset directories and live test suite.
2. Audit current renderer and artwork, document why visuals clash, and propose the actual tile/sprite/camera metrics based on source.
3. Deliver **style guide + asset inventory + two visual mockups** (woodland homestead and character/trees), including original artwork directions, not a production code rewrite.
4. Provide a phased PR plan with exact file boundaries, acceptance tests and rollback.
5. Open a draft proposal PR and request Captain approval for style lock. **Do not merge, deploy, or replace production assets yet.**


## Priority gameplay quality repairs (Captain's explicit direction)
These are substantial player-visible fixes, not micro-polish. Audit actual implementations before changing anything:
1. **Painting at the easel:** current character pose reads as unintentionally suggestive. Replace with a clearly readable, child-appropriate, side-on or three-quarter painting pose. Haigen visibly holds a brush; brush touches a canvas mounted on an easel; arm animation and paint marks line up. Keep painting rewards, sale economy, interactions and saves. Require a before/after video or frame sequence at phone scale.
2. **Fish and aquatic ecology:** replace placeholder-looking fish with consistent, identifiable fish sprites and directional swim cycles. Schools move as coordinated groups, turn smoothly, avoid banks and obstacles, react to player/boat and depth, and show appropriate spawn/behaviour for each water region. Keep fishing controls, resource balance, ecology and performance. Test fish and boat interactions on phone.
3. **Story with organic twists:** add a paced exploration story framework with environmental clues, raven notes, NPC discoveries, hidden paths, evolving consequences and surprising but coherent turns. Do not fabricate arbitrary events every frame or overwrite established player choices. Record quest flags in backward-compatible saves; provide story beats and branching logic for approval.
4. **The island beyond the fog:** create a distant, unlockable island accessed by progressed seafaring, not an early-game teleport. Give it a distinctive Nordic folklore identity, readable shoreline/landing, unique biome and ecology, several enemy archetypes with fair telegraphs, layered exploration, secrets, ruins, NPC or environmental story, and a memorable multi-phase boss with a practical reward. Fog should reveal naturally as the player explores; avoid expensive fullscreen effects. Keep map navigation, save compatibility and mobile performance. Design the island and its boss as a reviewed vertical slice before implementing the full landmass.
5. **Everything follows the style bible:** painting, fish, enemies, boss, island props and effects must share the same approved pixel density, perspective, silhouettes, palette, animation cadence, tile metrics and lighting as the rest of Haigen's World.

## Proposed island narrative seed (not canon until approved)
**The Veiled Isle** lies beyond the northern sea fog. Lost waystones hint that an ancient boatwright sealed something beneath its ruined beacon. A seemingly helpful guide offers the route but hides part of the truth. As Haigen restores beacon fires, the fog recedes and reveals a second inland region; the apparent guardian is not the true source of the island's corruption. The final boss drops a **Wayfinder Rune** enabling navigation through a specific new fog-bound sea passage. Establish enemy silhouettes, telegraphs and the story's suitability for a child before approval.

## Updated work order
After visual style approval, prioritise **painting pose and fish** as visible animation repairs; then create a playable story-driven **fog island** prototype with enemy/boss art and progression gates. Do not begin production replacement before style sign-off, and do not merge or deploy without approval.
