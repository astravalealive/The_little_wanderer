# PR #273 depth screenshot regression protocol

The existing `world-depth-order-269.cjs` checks the sorting contract, **not** visual correctness. This is an explicit manual evidence gate until automated screenshot assertions are independently verified.

## Required paired captures
Use the **same deterministic game seed and actor coordinates** for both sides of each obstacle. Capture both iPhone portrait (390×844) and iPad landscape (1024×768).

| Subject | Obstacle | Behind obstacle | In front of obstacle |
|---|---|---|---|
| Haigen | tree, rock, troll stump | body partially occluded as appropriate | body drawn visibly above obstacle |
| Dylan | tree, rock, troll stump | body partially occluded | body drawn visibly above |
| deer | tree, rock, troll stump | body partially occluded | body drawn visibly above |
| regional wildlife | rock, tree | body partially occluded | body drawn visibly above |

Record viewport, seed, coordinates, main commit, browser version and screenshots. Inspect pixel-level overlap and feet/ground anchor, not just test exit code. Check camera movement and game UI do not obscure captures.

**Existing work:** PR #272 contains controlled front/behind screenshots for deer, Haigen and Dylan, but is a stacked draft based on `fix/stump-foot-anchor-269` and explicitly lacks troll coverage. Do not merge it blindly. Rebase or port its test-only harness onto latest main only after reviewing screenshots.

## Release gate
No depth-sort approval until paired captures pass on both viewports, the actual screenshot images are inspected, and current-main CI passes. Never alter production save keys or deployment for evidence collection.
