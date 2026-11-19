# Phase 1 — Visual foundation (active)

Goal: cohesive Nordic pixel readability on iPhone / iPad before living-world density.

## Milestones

| ID | Job | Owner | Depends on | Conflict risk | Status |
|----|-----|-------|------------|---------------|--------|
| **P1-A1** | Haigen Nordic walk atlas PoC | Huginn | — | `haigen.html` atlas src | **PR #241 READY TO MERGE** |
| **P1-A2** | Haigen tool poses: axe/shovel/rod/bow, no float | Huginn | P1-A1 merged | tool draw | Queued (stack on #241) |
| **P1-A3** | Paint pose + outfit sheet Nordic pass | Huginn | P1-A1 | atlases + `paintHaigen` | Queued |
| **P1-B1** | Skölli / Dylan outline match to Haigen family | Huginn | P1-A1 preferred | companion draw | After #241 |
| **P1-B2** | Nico outline density + contact shadow | Huginn | P1-B1 | Nico draw | After B1 |
| **P1-C1** | Woodland ground: remove play-mode lattice | Worldbuilder | Heartland #239 | `rbGrass` / terrain | **PR #248 READY** |
| **P1-C2** | Tree / rock / bush silhouette family | Worldbuilder | P1-C1 | scenery draw | After C1 |
| **P1-C3** | Path & water edge grammar | Worldbuilder | Heartland | path glaze / shores | After C1 |
| **P1-D1** | Homestead composition / camera framing | Worldbuilder | C1 | packing/draw | After C1 |
| **P1-E1** | Art pipeline kit (concept→cleanup→atlas) | Huginn | — | `devkit/` | Parallel |
| **P1-F1** | Quiet Nordic HUD rebase | Presentation | Heartland | HUD CSS/JS | **PR #234 CONFLICTING — rebase** |
| **P1-G1** | World readability: contact shadows + kill system-font plot/companion spam | Worldbuilder | Heartland | homestead draw labels | **Next implementation (this wave)** |

## Concurrent-safe now

1. **Captain merge gate:** #241 then #248 (resolve dual V433 claim).  
2. **Rebase #234** Quiet HUD onto latest main after those land (or onto main now if HUD files don't collide).  
3. **P1-G1** on a fresh main-based branch (labels/shadows — avoid GAME_BUILD clash by taking next free build after open V433 PRs, typically **V434** if #241/#248 keep 433).  
4. **P1-E1** pipeline docs anytime.

## Explicitly serial
- P1-A2/A3 after #241  
- P1-C2/C3 after #248  
- Phase 2+ until Phase 1 A1+C1+F1+G1 pass Captain glance  

## Acceptance every Phase 1 PR
- Playable before/after iPhone 390×844 + iPad landscape  
- Startup, controls, atlas load, animation, save key, woodland-perf  
- Independent review once per head SHA  
- No merge/deploy without Captain  

## Preserve forever
Regions, bosses, NPCs, boats, quests, unreplaced artwork, collisions, `wandererV127PreviewSave`.
