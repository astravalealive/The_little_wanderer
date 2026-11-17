# Job 203: Rendering profile methodology and findings

## What is measured
The existing opt-in `window.__haigenPerfDiag` tracks frame work, update and render costs. A temporary, browser-response-only probe wraps the current `draw()`, `drawExpandedTerrain()`, `rbDrawGround()`, `drawWoodlandFloorV391()` and `path()` functions. The probe is never committed into `haigen.html`.

The benchmark samples woodland centre, woodland edge and an off-woodland camera, each at emulated iPhone (390×844) and iPad (1024×768) viewport sizes. It warms each scene for 400 ms and records ~1.4 seconds of frames.

## Limitations
- GitHub Actions headless Chrome with touch/mobile emulation is **not** physical iPhone or iPad Safari. Reported timings must not be presented as measured iOS performance.
- Rendering sections are nested in the total draw timing. They must not be added together.
- The path() measurement includes both the painted image and decorative overlays. Further isolation would be needed to distinguish them.
- The short sampling window is suitable for a first ranking, not statistically conclusive performance claims.

## Findings
The workflow publishes `render-profile-evidence/findings.md` and `measurements.json` as its generated measurement report. Use those values for any conclusions rather than assuming which stage dominates.

## Safety
No production source, assets, map, gameplay, collisions, saves or deployed settings are changed. Benchmark instrumentation is injected into an isolated local browser response and destroyed after testing.

## Next decision
Compare per-viewpoint section costs and confirm the worst contributor on a real iPad before approving any large renderer rewrite or offscreen-canvas caching.
