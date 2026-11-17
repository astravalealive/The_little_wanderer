# Job 205: Safari comparison panel (PR #204 only)

**Draft, unmerged, not deployed.** The comparison panel exists only in the PR branch. The public GitHub Pages URL still runs main, so adding the query parameter there will **not** display the tool until a separately approved deployment.

## Open in an iPad browser

Use a local branch preview (for example, the Codespaces forwarded web server serving the PR branch's `haigen.html`). Append `?cacheCompare205=1` to the preview URL. This shows a small panel with **Use cache / Use original** and **Record 8 sec**. The cache starts **OFF** unless the separate `woodlandCache204=1` query flag is supplied. Avoid that second flag for a clean baseline.

Stand in the same woodland position and keep the camera still. Record the original mode for eight seconds, toggle to cached, and record again. The panel shows FPS, average frame work, average render/update times, JS heap if exposed by the browser, and the cache's typed-array payload. The last results for each mode are compared in the panel. Repeat at woodland edges and after camera movement.

The comparison UI and cache use only in-memory state. They do not add save keys, modify the world, or persist results. Reloading removes the panel unless the query parameter is retained.

## Interpreting results

Safari often does not expose `performance.memory`, so **unavailable** is expected. Cache memory is a separate typed-array estimate and excludes JavaScript Map/object overhead. An eight-second run can be influenced by background activity, device heat and camera/AI motion. Compare multiple paired runs before deciding.

## Review gates

- Rendering and UI safety: query-only panel, original mode by default, no world/game/save changes. Existing gameplay regression and woodland screenshot checks must pass.
- Measurement safety: FPS uses existing frame-gap samples; frame work and render/update use existing diagnostics. Each sample resets those counters and restores the previous diagnostics-enabled state.
- Remaining risk: real iPad Safari, touch-overlay usability, long-term memory and full-scene pixel equivalence still need manual validation.

**Do not merge or deploy without a separate explicit approval.**
