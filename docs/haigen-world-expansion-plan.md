# Haigen's World expansion integration plan (build 89 baseline)

## Source of truth
The playable story build is **haigen-test.html**, not the older **game.html**. Main currently contains build 89, including the Silent Pond quest and mobile companion crash fix. The prototype game.html changes on this branch are NOT the implementation target and must not be merged as-is.

## Safety invariants
- Preserve index.html (Ember), game.html, existing haigen-test.html quests, camera, Xbox input, frogs, ducks, Bristleback, Hollow Warden, camp structures, and localStorage key wandererTestSave.
- Preserve existing object IDs and original coordinates in the inner woodland; add new objects only with stable noncolliding IDs.
- Existing save positions and structures must not be rescaled. Keep pond, cottage, ruins, quest locations and roads within the original area.
- Extend map boundaries only after updating all world-size-dependent systems: player/companion movement, camera pan and clamp, map UI, pathfinding, animals, ground/water, spawning and collision.
- Use seeded, chunked biome generation and view culling. Avoid generating thousands of extra objects per frame.
- Make coast actual traversability-aware sea water; don't place trees or terrestrial animals in water.
- Change complete Haigen costume layers per region (not merely tunic tint), with cold/warm/rain appropriate gear.

## Seven regions
1. Expanded woodland: existing protected 4200-square gameplay core, deer/stag, boar and wolf; preserve Silent Pond.
2. Open downs: grasslands, wildflowers, scattered hedgerows, hare, fox and bison-like grazer.
3. Snowy highlands: snowfields, fir stands, frozen ponds, mountain goat, snow hare, white stag.
4. Desert dunes: sand, rocks, cacti, lizard, scorpion and snake.
5. Deep fen: reeds, peat pools, twisted trees, frogs, heron and marsh deer.
6. Ash wasteland: cracked earth, skeletal trunks, ash gusts, raven, rat and carrion bird.
7. Seafront: beach, dunes, palms in warm sheltered areas, waves, crabs, seabirds and turtles.

## Play loop
- Connected junction-based roads, signs, discoverable camps, map pins and optional fast travel between discovered camps.
- Each region gets 2-3 featured creatures with actual AI behavior and one landmark interaction.
- First crossing triggers a region discovery and outfit change, persisted in the existing save format.
- Introduce biome encounters progressively without interrupting the Silent Pond quest.

## Verification gate before publishing
- JavaScript syntax check, no unresolved references, save migration tests, 6-stage Silent Pond quest regression, duck lifecycle and frog artwork checks.
- Check controller, touch, camera recenter, companion water boundaries, map scrolling, and region crossings.
- Profile performance on mobile-size viewport and test actual iPad Safari before merge.
- Version bump and deployment only after user approval.
