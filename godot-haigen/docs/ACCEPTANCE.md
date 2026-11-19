# V0 acceptance (homestead movement prototype)

## In scope
Haigen movement, Skölli follow, terrain/paths/trees, two wildlife (hare + songbird), pixel camera, collisions, basic touch stick.

## Out of scope
Dylan, boats, inventory, crafting, bosses, HTML migration, Pages deploy of this prototype.

## Desktop gate (this PR)
- [ ] Project opens in Godot 4.4.x without missing deps
- [ ] Haigen moves with WASD/arrows; collisions against trees/cabin/water/bounds
- [ ] Camera follows with pixel snap (no soft blur on tiles)
- [ ] Skölli follows without blocking player intent
- [ ] Hare + songbird wander
- [ ] On-screen stick moves Haigen (mouse drag simulates touch)
- [ ] Headless smoke script exits 0
- [ ] Zero changes to `haigen.html`, HTML assets, saves, Pages workflow behaviour

## iPad landscape gate (required before calling V0 accepted)
- [ ] Real iPad landscape playtest
- [ ] Touch stick usable; hero centre not covered
- [ ] ≥55 fps average in homestead scene (target 60)
- [ ] Path vs blocked vs cabin readable at play zoom
