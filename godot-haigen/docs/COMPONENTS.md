# Reusable Godot components (V1)

Designed so future regions/characters can plug in without rebuilding core systems.

| Component | Path | Role |
|-----------|------|------|
| Pocket data | `data/homestead_pocket.json` | Exported HTML layout (cottage, roads, widths, solids, door, plots) |
| Exporter | `tools/export_homestead_pocket.py` | Regenerates pocket JSON from `haigen.html` contracts |
| GameConfig | `scripts/autoload/game_config.gd` | Speeds, zoom, cell sizes, palette |
| InputRouter | `scripts/autoload/input_router.gd` | Keyboard + virtual stick → move vector |
| SceneBridge | `scripts/autoload/scene_bridge.gd` | Yard/interior spawn labels (PR #250 MapRouter idea; no competing maps) |
| AtlasFrames | `scripts/components/atlas_frames.gd` | Shared sheet region + facing-row maps |
| PlayerController | `scripts/actors/player_controller.gd` | Haigen movement + walk anim |
| CompanionFollow | `scripts/actors/companion_follow.gd` | Skölli follow + walk anim |
| FollowCamera | `scripts/camera/follow_camera.gd` | Pixel-snapped follow |
| VirtualJoystick | `scripts/ui/virtual_joystick.gd` | Touch stick |
| HomesteadBuilder | `scripts/world/homestead_builder.gd` | Trails crop + glaze + pond + props from JSON |
| CottageInterior | `scripts/interior/cottage_interior.gd` | Door interior + furniture collisions + exit poll |
| Main bus | `scripts/world/main.gd` | Spawn cast, door enter/exit orchestration |

**Next regions:** export a new `*_pocket.json`, point a builder at it, reuse actors/camera/input unchanged. Do not add a second Godot project for the same pocket.
