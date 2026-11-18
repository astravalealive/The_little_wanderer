# Haigen's World: mobile presentation overhaul (V425 baseline)

Status: PROPOSAL ONLY. No game code changes. Awaiting Captain's approval and Cursor implementation.

## Ground truth
The live iPhone screenshot shows V425, an intact Day 21 save, ornate art, a centre-screen speech bubble, raven note toast, top-right coordinate overlay, minimap, virtual joystick, action buttons, and nine-item tool bar. The canonical game is `haigen.html`. The UI uses `.haigen-speech` fixed at `top:45%`, a dynamically inserted `#coordinateReadout` with z-index 100, and `baseCameraScale()` plus `cameraZoom` for world framing. The live source contains `.hud`, `.hotbar`, `.bottom`, and `notify()` toast. Do not confuse the old root `index.html` raven prototype with the game.

## One cohesive PR: Mobile presentation pass
1. **Quiet HUD**: preserve health, region, day, minimap, tool access and controls; reorganize mobile overlays to reduce occlusion. Do not remove functionality or touch targets. Keep legible text and safe-area insets.
2. **Contextual dialogue**: anchor speech near Haigen when safely possible; otherwise place in a non-obstructive safe zone. Never block gameplay, tool buttons, or menus. Preserve existing speech content, triggers, durations, accessibility and suppression when modal/menu is open.
3. **Camera framing**: tune portrait framing in one bounded, reversible presentation-only adjustment; preserve camera zoom controls, panning, world coordinates, movement, cutscenes, collision and interiors. Avoid changing saved zoom unless compatibility is explicitly tested.
4. **Debug readout**: hide the always-on coordinate panel during normal play, but retain opt-in diagnostics/dev mode. Preserve existing coordinate calculations.
5. **Unified layout**: keep ornate Viking palette, art assets and button functions; standardize spacing and overlay stacking on portrait iPhone, portrait iPad and landscape iPad.

## Acceptance criteria
- Compare BEFORE/AFTER screenshots at the same camera location and same in-game state, including homestead, Great Lake shore and island; use a clean temporary test save, never overwrite the user's real save.
- Show Haigen, the cabin entrance, garden and Dylan without centre-screen dialogue covering the player.
- Joystick, inventory, tool bar, map, action buttons and settings all remain reachable by touch and gamepad.
- Speech and notification queue do not obscure one another or menus; long strings wrap and respect safe areas.
- World movement speed, physics, collision, save/load, resource counts, quest logic, NPC AI, art and audio are unchanged.
- No persistent developer coordinate overlay in normal play; available in developer diagnostics.
- Measure average frame time and input responsiveness before/after on emulated iPhone and iPad; verify manually on real Safari. No material mobile regression.
- Add Playwright visual snapshots and functional touch/menu/zoom/speech tests to existing live regression suite. Validate no missing assets or console errors.
- Increment game build and `haigen-version.json` together when the *implementation* is ready to publish; never change version in this proposal PR.

## Rollout
Cursor can implement on a separate branch against the latest main. Review screenshots and tests before approval. Keep PR draft and DO NOT merge or deploy until the Captain explicitly approves. Do not merge unrelated Pages repair PR #222 as part of this work.

## Cursor handoff
Read this document, the current `haigen.html`, `tests/live/run.cjs`, and the screenshot in the conversation (not automatically available to Cursor). Implement one coherent mobile presentation PR. Ask for the screenshot as a file if Cursor needs direct visual comparison. No broad refactors or asset replacements. Preserve all gameplay, controls and saves.
