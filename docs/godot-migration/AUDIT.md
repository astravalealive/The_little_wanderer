# Haigen HTML → Godot audit (Phase 1)

Source: live `haigen.html` (V432 on main) + `assets/` + boss modules.  
HTML game and `wandererV127PreviewSave` remain the production path until a later approved cut-over.

## Reusable original artwork (KEEP for Godot)

| Asset | Role in Phase 1 |
|---|---|
| `assets/haigen-reference-walk-atlas.webp` | Haigen walk (48×72 in 192×288) |
| `assets/skolli-adult-approved.webp` | Skölli (336×176 cells) |
| `assets/house-tier-1-clean.png` | Homestead exterior |
| `assets/haigen-environment-clean-v138.webp` | Trees, fir, rock, stump, bush… |
| `assets/haigen-trails.webp` | Painted woodland ground crop |
| `assets/regional-fauna-illustrated.png` | **In-game raven** cell `[0,2]` (96×76) |
| `assets/coop-woodland.png`, `garden-tier-1.png` | Homestead props |

Deferred to later phases: Dylan atlases, boats, bosses (Gloamjaw/Krakkle/Grumgullet), Nico, mallards, Greyfang, ornate HUD chrome.

## World contracts to preserve

- Cottage `(1500,1500)`; house offset `(+35,-10)`; tier-1 width/height `330×310`; door fraction `0.41`; door half-width `26`
- Landmarks: Stoneback `(1540,480)`, Whispering Grove `(2470,1280)`, Mossfen `(2100,2420)`
- `solidRadius` family: tree ~12, fir 16, rock ~24
- Companions: Dylan `friends.heri`, Skölli `friends.skolli` — do not renumber object IDs when porting full world

## Systems map

| System | HTML home | Godot Phase 1 |
|---|---|---|
| Movement / camera | canvas loop + joystick | `player_controller` + pixel camera |
| Door / interior | `homeInside` FSM | `MapRouter` + `door_zone` scenes |
| Skölli follow | companions[1] in `update()` | `companion_follow.gd` |
| Wildlife raven | `extraFaunaCells.raven` | `wildlife_wander` kind `raven` |
| Inventory / craft / boats / bosses | monolithic | **not in Phase 1** |
| Saves | `wandererV127PreviewSave` | **untouched**; Godot must not write this key |

## Dependencies (HTML live)

- Core: `haigen.html`, `haigen-version.json`, `index.html`
- UI: `v127-ornate-ui.js/css` (if present on Pages)
- Bosses: `gloamjaw-*.js`, `krakkle-v407.js`, `swamp-bosses-v420.js`, `thrummaw-v148.js`
- Audio: procedural Web Audio (no music files)

## Out of scope notes

- ALTTP is a **movement / door-interaction reference only** — original Nordic art and maps
- Keep **in-game ravens** as fauna; do not invent fictional development agents or review roles in the game or docs
