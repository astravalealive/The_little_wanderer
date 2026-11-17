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
