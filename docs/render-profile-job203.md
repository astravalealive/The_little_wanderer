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

## First CI measurements (headless Chrome, 2026-11-17)

| Emulated device | Camera | Render ms/frame | Ground ms/call | Paths ms/call | Expanded terrain ms/call |
|---|---|---:|---:|---:|---:|
| iPhone 390×844 | Woodland centre | 147.27 | 80.09 | 0.23 | 2.84 |
| iPhone 390×844 | Woodland edge | 138.13 | 81.78 | 0.10 | 2.77 |
| iPhone 390×844 | Outside woodland | 50.26 | 0.004 | 0.019 | 2.74 |
| iPad 1024×768 | Woodland centre | 132.30 | 19.89 | 0.20 | 1.92 |
| iPad 1024×768 | Woodland edge | 118.86 | 19.14 | 0.067 | 2.11 |
| iPad 1024×768 | Outside woodland | 54.21 | 0 | 0.028 | 2.02 |

**Finding:** The woodland ground pass is much more expensive than the path() pass in this Chrome runner. For example, in the emulated iPhone woodland-centre view it averaged 80.09 ms per call versus 0.23 ms for paths. The total render cost is larger still, so other rendering work also matters. These numbers are a short, non-isolated CI sample, not an actual iPhone/iPad benchmark.

**Recommendation:** Do not attempt a large renderer refactor yet. First run the existing opt-in performance overlay on a real iPad and check whether ground rendering is the limiting factor. If corroborated, prototype a reversible, visually pixel-compared woodland ground rendering cache, with strict memory limits and fallback.

