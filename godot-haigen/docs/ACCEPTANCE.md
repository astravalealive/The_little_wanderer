# V1 acceptance — consolidated real homestead pocket

## In scope
Cottage-area pocket from live HTML export, approved Haigen/Skölli/house/woodland/interior/trails art, moss+trails+glaze ground, pond shoreline bands, furniture collisions, movement, touch stick, one door enter/exit. Foundation PR #251; selective ideas from PR #250.

## Out of scope
Dylan, boats, inventory, crafting, bosses, HTML edits, Pages deploy, full world migration, competing Godot maps, merging without Captain approval.

## Automated (1024×768 framebuffer)
Checked by `tools/ipad_landscape_validate.tscn`:

- [x] Pocket JSON loads; cottage `(1500,1500)`
- [x] Approved Haigen 48×72 @ scale 1.67
- [x] Trails composited + Job 233 path glaze; road glaze marker present
- [x] Touch stick moves Haigen
- [x] Collision stops short of a solid
- [x] Door enter → interior (furniture bodies ≥7) → exit via SceneBridge
- [x] No edits to `haigen.html` or save schema

## Still required before calling V1 accepted
- [ ] Captain visual review of before/after evidence screenshots
- [ ] Physical iPhone 390×844 + iPad landscape Safari playtest (no devices in this environment; tunnel is temporary)
