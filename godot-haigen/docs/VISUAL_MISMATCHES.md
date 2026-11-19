# Visual mismatches — Godot V1 vs live HTML (honest)

File-verified approved assets are used. Frames were not Captain-certified one-by-one.

| Area | Mismatch | Severity | Notes |
|------|----------|----------|-------|
| Ground | Procedural moss/path bake, not HTML `rbDrawGround` / trails webp | Medium | Readable clearing + path toward door; not pixel-identical floor |
| House exterior | `house-tier-1-clean.png` scaled to HTML draw width 330; silhouette vs live alpha crop may differ slightly | Low | Same source file as live preferred exterior |
| Interior | ZIP `level_1_interior_reference.png` with ~7.5% margin crop; room is a dedicated scene, not in-world overlay | Medium | Enter/exit works; furniture collision is simplified walls only |
| Trees | Woodland scenery 192 cells scaled by HTML `draw_size`; no per-tree variant bob/shadow polish | Low | Colliders use exported `solid_radius` |
| Skölli | Adult atlas walk rows only (no run/rest/pounce rows wired) | Low | Follow uses walk frames |
| Haigen | No tools/outfits/region strips; walk atlas only | Low | Matches V1 movement slice |
| Pond | Flat ellipse + AABB block; HTML has shoreline depth | Medium | West edge of pocket only |
| Plots | Coop + garden sprites placed; woodstore/jetty markers omitted (no dedicated art in export) | Low | Positions match HTML |
| First-1050 sizes | Export uses seeded size stand-in; HTML used `Math.random()` for that batch | Low | Positions/types match; radii may differ slightly |
| Camera | Fixed zoom 1.15; HTML uses `baseCameraScale * cameraZoom` with phone portrait boost | Low | Tuned for 1024×768 evidence |
| Wildlife | V0 hare/songbird placeholders removed from spawn (avoid programmer art) | Info | Out of V1 character list |

Do not treat automated tests as visual approval.
