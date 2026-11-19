# V0 acceptance (homestead movement prototype)

## In scope
Haigen movement, Skölli follow, terrain/paths/trees, two wildlife (hare + songbird), pixel camera, collisions, basic touch stick.

## Out of scope
Dylan, boats, inventory, crafting, bosses, HTML migration, Pages deploy of this prototype.

## Desktop + emulated iPad landscape (1024×768)
Checked by `tools/ipad_landscape_validate.tscn` on an Xvfb framebuffer at the same size the HTML evidence suite uses. This is **not** a physical iPad.

- [x] Project opens in Godot 4.4.1
- [x] Touch stick drag moves Haigen (screen-touch events)
- [x] Camera integer zoom 2 and pixel-snapped position
- [x] Collision stops the body short of a solid
- [x] Ground is one nearest-neighbour bake (paths/water visible)
- [x] Hare + songbird + Skölli present
- [x] Map integrity test
- [x] No edits to `haigen.html`, HTML assets, or save schema

## Still required before calling V0 accepted
- [ ] Physical iPad landscape playtest (no iPad in this environment)
- [ ] Measured ≥55 fps on that device (software-GL frame gaps are not a substitute)
