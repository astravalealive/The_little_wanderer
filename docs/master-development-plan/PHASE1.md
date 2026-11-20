# Phase 1 — Visual foundation (active)

Goal: cohesive Nordic pixel readability on iPhone / iPad before living-world density.

## Milestones

| ID | Job | Owner | Depends on | Conflict risk | Status |
|----|-----|-------|------------|---------------|--------|
| **P1-A1** | Haigen Nordic walk atlas PoC | Huginn | — | `haigen.html` atlas src | **PR #241 READY TO MERGE** |
| **P1-A2** | Haigen tool poses: axe/shovel/rod/bow integrated, no float | Huginn | P1-A1 merged | `haigen.html` tool draw | Queued (stack on #241) |
| **P1-A3** | Haigen paint pose + outfit sheet Nordic pass | Huginn | P1-A1 | atlases + `paintHaigen` | Queued |
| **P1-B1** | Skölli / Dylan outline + silhouette match to Haigen family | Huginn | P1-A1 preferred | companion draw + atlases | Next after #241 |
| **P1-B2** | Nico mothkeeper outline density + contact shadow | Huginn | P1-B1 | Nico draw | Parallel after B1 hooks land |
| **P1-C1** | Woodland ground: remove play-mode lattice / tile soup | Worldbuilder | Heartland #239 | `rbGrass` / terrain draw | **Start now** (main-based) |
| **P1-C2** | Tree / rock / bush silhouette family unification | Worldbuilder | P1-C1 | scenery draw | After C1 |
| **P1-C3** | Path & water edge grammar polish | Worldbuilder | Heartland | path glaze / shores | After C1 |
| **P1-D1** | Homestead composition / camera framing | Worldbuilder | C1 | packing/draw | After C1 |
| **P1-E1** | Art pipeline kit (concept→cleanup→atlas scripts + provenance) | Huginn | — | `devkit/` docs only | Parallel anytime |

## Concurrent-safe now

1. **Merge gate:** Captain approve **#241** (Haigen PoC).  
2. **Worldbuilder:** **P1-C1** ground lattice / grass readability on branch from `main` (touches terrain colours, not Haigen atlas).  
3. **Docs/tools:** **P1-E1** pipeline kit (already partly in #241 `devkit/build-nordic-haigen-atlas-234.py`).  
4. **Do not** parallel-edit `haigen.html` GAME_BUILD / HUD CSS while #234 rebase and #241 merge are open — stack or wait.

## Explicitly serial
- P1-A2/A3 after #241  
- Quiet Nordic HUD **#234** rebase → merge (presentation-only; independent of art atlases)  
- Close/supersede #235, #237, absorb #238 into this plan  

## Acceptance every Phase 1 PR
- Playable before/after iPhone 390×844 + iPad landscape  
- Startup, controls, atlas load, animation, save key, woodland-perf  
- Independent review once per head SHA  
- No merge/deploy without Captain  

## Preserve forever
Regions, bosses, NPCs, boats, quests, unreplaced artwork, collisions, `wandererV127PreviewSave`.
