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


## Independent audit of PR #272's 72 actual PNGs (2026-11-21)
All 72 PNGs were opened in a contact sheet and checked across forest, iPad and iPhone. The archive contains 3 viewports × 4 actor labels × 3 obstacles × 2 positions. However, the images **do not establish a pass**:
- The test's injected hook places actors 75 world units either side of the obstacle anchor; it does not assert the actor's rendered bounds intersect the obstacle silhouette. In many frames the actor is separated from the obstacle, so a front/behind label is not a real occlusion test.
- The troll-labelled captures do not clearly demonstrate a visible troll in the paired positions. The harness moves `caveTrolls` but does not assert a troll is present in the outdoor render queue.
- The screenshot harness checks browser exceptions and screenshot existence only; it does not compare expected visible/occluded pixels.
- The forest and iPad viewports both use 1024×768, so they are not independent resolution coverage, although mobile mode differs.
- UI overlays, scene movement and animation complicate direct visual comparison.

**Disposition:** PR #272 visual proof rejected pending deterministic overlapping positions, actor-visibility assertions, image inspection, and explicit troll draw-path verification. PR #273 remains safe as test-only work but cannot claim visual QA completed.

`node tests/live/depth-evidence-audit-273.cjs <extracted-screenshot-directory>` validates archive completeness, PNG dimensions and non-identical pairs. This utility is deliberately not a visual occlusion oracle and is not run by PR CI because the archive is not committed.
