# Job 204: opt-in woodland ground cache prototype

**Status: experimental draft PR. Do not merge yet.**

The default woodland rendering path remains unchanged. With `?woodlandCache204=1`, a bounded LRU cache stores exact deterministic per-cell fade values in `Float64Array` tiles. It still draws the original 6-unit rectangles with the same alpha, rather than drawing scaled offscreen textures. Maximum typed-array payload is **2 MiB**, plus JavaScript object overhead.

## Latest CI evidence (headless Chrome, mobile viewport emulation)

| Emulated device | Camera | Differing pixel channels | Original ms | Cold-cache ms | Warm-cache ms | Typed-array memory |
|---|---|---:|---:|---:|---:|---:|
| iPhone 390×844 | Woodland centre | 0 | 89.5 | 105.5 | 69.5 | 480 KiB |
| iPhone 390×844 | Woodland edge | 0 | 87.7 | 98.2 | 68.2 | 480 KiB |
| iPad 1024×768 | Woodland centre | 0 | 25.1 | 35.0 | 13.7 | 512 KiB |
| iPad 1024×768 | Woodland edge | 0 | 23.9 | 36.8 | 8.3 | 384 KiB |
| Both | Outside woodland | 0 | ~0 | ~0 | ~0 | 0 |

**Interpretation:** Cached woodland ground passes matched the original pixel-for-pixel in all six isolated camera tests. Warm cache calls were faster in this short test, but cold calls were slower. These single-draw timings are noisy and are **not measured on real iOS Safari**. Memory figures exclude map/JS overhead.

## Safety gates

- The woodland cache prototype workflow passed pixel-equivalence and memory-cap assertions.
- Forest visual evidence and live mobile regression passed on the latest prototype commit.
- This does **not** establish pixel equivalence for every camera zoom, edge, night-time condition, weather state or device GPU.
- Real iPad Safari performance and sustained camera movement need checking before merge.
- Repeated warm-frame benchmarks and cache churn tests should be added before enabling by default.

## Recommendation

Keep PR #204 unmerged and opt-in. Validate sustained movement, zoom, nighttime and memory pressure on real iPad hardware first. If the gains survive, merge separately with the feature disabled by default.

## Extended validation (2026-11-17)

Additional read-only browser tests on both emulated mobile viewports passed:

- **20 scenarios** total (10 per viewport), each comparing uncached, cold-cache and warm-cache pixels. **Zero differing pixel channels** in all comparisons.
- Scenarios include woodland centre, four edges, zoom in/out, daytime, nighttime and off-woodland views.
- **90-step camera traversal per viewport** with zoom changes and alternating night strength, followed by a revisit pixel comparison. No differences detected.
- Maximum typed-array cache payload observed was **2,097,152 bytes (2 MiB)**, equal to the configured cap. This excludes JavaScript object and Map overhead.
- All four CI workflows passed: cache prototype, forest visual evidence, mobile regression and render profile.

### Repeated-render benchmark (12 alternating baseline/warm samples per view)

| Emulated device | View | Original median ms | Warm-cache median ms |
|---|---|---:|---:|
| iPhone | Woodland centre, day | 62.8 | 47.6 |
| iPhone | East edge, day | 19.9 | 7.35 |
| iPhone | Woodland centre, night | 67.3 | 47.45 |
| iPad | Woodland centre, day | 16.1 | 5.6 |
| iPad | East edge, day | 12.0 | 4.4 |
| iPad | Woodland centre, night | 16.0 | 5.65 |

These are **headless Chrome measurements with emulated mobile viewports**, not real iPhone/iPad Safari timings. Cold cache rendering remains slower than uncached rendering in the earlier single-draw tests. The movement test exercises cache churn and the memory cap, but does not establish sustained physical-device frame rates or total JS heap consumption.

**Remaining risks before merging:** real Safari timing, memory pressure including JS overhead, zoom-dependent compositing on physical GPUs, sustained long-session cache churn, and full-scene screenshots. Keep the draft PR unmerged and the cache disabled by default.
