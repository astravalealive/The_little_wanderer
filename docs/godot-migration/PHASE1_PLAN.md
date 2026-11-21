# Godot migration — Phase 1 plan

## Goal

A playable **real Ancient Woodlands** slice in Godot 4.4 that reuses approved HTML artwork and homestead contracts: Haigen, Skölli, original terrain props, house interior, door transitions, and a connected grove path. Parallel to `haigen.html`. No production cut-over.

## Reuse-first rules

1. Prefer existing KEEP atlases over new placeholder pixels.
2. Preserve cottage / door / companion / save key names when porting behaviour.
3. Never write `wandererV127PreviewSave` from Godot in Phase 1.
4. One job per PR; bump Godot prototype version only (not HTML `GAME_BUILD` unless HTML changes — it should not).

## Phase 1 deliverable (this PR)

| Map | Content |
|---|---|
| `woodlands_yard` | Trails crop, house-tier-1, env trees, garden, coop, raven, door → interior, path → grove |
| `house_interior` | Room collision matching HTML furniture boxes; door → yard |
| `grove_path` | East woodland path toward Whispering Grove; path → yard |

Controls: WASD / arrows / on-screen stick. Pixel-snap camera at 2×. iPad landscape viewport 1024×768.

## Later phases (not this PR)

2. Dylan, campfire cook loop, inventory/hotbar  
3. Great Lake / raft teaching vessel  
4. Saltwick + skiff  
5. Save importer (read-only preview of HTML JSON → Godot)  
6. Boss modules  

## Relationship to PR #249

PR #249 was a **placeholder Nordic spike**. Phase 1 **supersedes** that art path with real atlases. Do not polish the placeholder demo further.
