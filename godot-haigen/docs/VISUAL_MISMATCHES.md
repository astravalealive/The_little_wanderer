# Visual mismatches — Godot V1 consolidation vs live HTML (honest)

File-verified approved assets are used. Frames were not Captain-certified one-by-one.
Foundation: PR #251. Selectively reused from PR #250: `haigen-trails.webp` ground crop idea, interior furniture block idea, MapRouter spawn-label idea (as `SceneBridge` — no competing maps).

| Area | Mismatch | Severity | Notes |
|------|----------|----------|-------|
| Ground | Moss/clearing base + `haigen-trails.webp` alpha overlay + Job 233 soil glaze; woodland edge flecks omitted | Low | Matches HTML layering (trails are path paint, not full terrain); glaze is discrete overlay not canvas stroke AA |
| House exterior | `house-tier-1-clean.png` scaled to HTML draw width 330; silhouette vs live alpha crop may differ slightly | Low | Same source file as live preferred exterior |
| Interior | ZIP `level_1_interior_reference.png` with ~7.5% margin crop; room is a dedicated scene, not in-world overlay | Medium | Enter/exit works; table/hearth/bed/cupboard are approximate AABBs on the painting |
| Trees | Woodland scenery 192 cells scaled by HTML `draw_size`; no per-tree variant bob/shadow polish | Low | Colliders use exported `solid_radius` |
| Skölli | Adult atlas walk rows only (no run/rest/pounce rows wired) | Low | Follow uses walk frames |
| Haigen | No tools/outfits/region strips; walk atlas only | Low | Matches V1 movement slice |
| Pond | Simplified `lakeRadius` ripple + east irregularity + depth bands; not full Catmull-Rom shore guide / reeds | Medium | West edge of pocket; collision still AABB |
| Plots | Coop + garden sprites placed; woodstore/jetty markers omitted (no dedicated art in export) | Low | Positions match HTML |
| First-1050 sizes | Export uses seeded size stand-in; HTML used `Math.random()` for that batch | Low | Positions/types match; radii may differ slightly |
| Camera | Fixed zoom 1.15; HTML uses `baseCameraScale * cameraZoom` with phone portrait boost | Low | Tuned for 1024×768 evidence |
| Wildlife | V0 hare/songbird placeholders removed from spawn (avoid programmer art) | Info | Out of V1 character list |
| Grove path | Not shipped — PR #250 `grove_path` intentionally omitted to avoid competing maps | Info | Pocket stays cottage-centred |

## Unverified device claims

- Physical iPhone Safari and iPad Safari playtests were **not** run in this environment.
- Evidence frameshots are **framebuffer / Xvfb** captures (llvmpipe), not device GPUs.
- Temporary Cloudflare quick tunnels die with the agent VM; `web-preview/` is the durable local bundle.

Do not treat automated tests as visual approval.
