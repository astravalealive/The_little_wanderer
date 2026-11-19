# V1 acceptance — real homestead pocket

## In scope
Cottage-area pocket from live HTML export, approved Haigen/Skölli/house/woodland/interior art, movement, collisions, touch stick, one door enter/exit.

## Out of scope
Dylan, boats, inventory, crafting, bosses, HTML edits, Pages deploy, full world migration, merging without Captain approval.

## Automated (1024×768 framebuffer)
Checked by `tools/ipad_landscape_validate.tscn`:

- [x] Pocket JSON loads; cottage `(1500,1500)`
- [x] Approved Haigen 48×72 @ scale 1.67
- [x] Touch stick moves Haigen
- [x] Collision stops short of a solid
- [x] Door enter → interior → exit
- [x] No edits to `haigen.html` or save schema

## Still required before calling V1 accepted
- [ ] Captain visual review of evidence screenshots
- [ ] Physical iPhone 390×844 + iPad landscape playtest (no devices in this environment)
