# Haigen Woodlands — Godot Phase 1

Playable **Ancient Woodlands** homestead using **original HTML atlases** (Haigen walk, Skölli adult, house-tier-1, environment props, trails crop, in-game raven).

- Engine: **Godot 4.4.x** · GDScript · Mobile renderer  
- Does **not** replace `haigen.html` or touch `wandererV127PreviewSave`  
- ALTTP is a movement/door reference only  

## Play

1. Install Godot 4.4.1 (standard).  
2. Open `godot-haigen/` → Play (`woodlands_yard`).  
3. Walk into the **house door** (interior) or the **east path** (grove). Stick or WASD.

```bash
python3 godot-haigen/tests/test_phase1_assets.py
Godot_v4.4.1-stable_linux.x86_64 --headless --import --path godot-haigen
Godot_v4.4.1-stable_linux.x86_64 --headless --path godot-haigen --quit-after 3
```

## Maps

- `scenes/world/woodlands_yard.tscn` — homestead yard  
- `scenes/world/house_interior.tscn` — interior + exit door  
- `scenes/world/grove_path.tscn` — path toward Whispering Grove  

## Docs

- `docs/godot-migration/AUDIT.md`  
- `docs/godot-migration/PHASE1_PLAN.md`  
