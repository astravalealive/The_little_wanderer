# Quiet Nordic HUD (Job 232)

Presentation-only stacking pass on V429 → **V431** (correction on PR #234). Reuses V426 ornate mobile presentation; does not rewrite the HUD.

## Problem
On portrait iPhone, toast / speech / quest / minimap could share the same vertical band. Independent review also found the first V430 suite skipped iPad landscape and only checked control existence, not real touch reachability. Landscape toast could overlap the quest panel; toast could clip the day chip.

## Bounded fix
1. **CSS lanes** (`v127-ornate-ui.css`): left toast rail below the day chip; minimap top-right; quest under the minimap; dedicated iPad landscape lanes.
2. **Speech dodge** (`updateHaigenSpeech` in `haigen.html`): treat live toast, quest panel, and minimap as obstacles; shift the character-anchored bubble to free candidates. `haigen-toast-live` raises the top safe band while a toast is showing.
3. Modal/menu suppression unchanged. Live suite covers iPhone, iPad portrait, iPad landscape, long text, safe-area insets, and real taps for joystick / hotbar / pack / settings. Side insets shift the joystick, toast, quest, minimap, pack and settings only when the device reports them.

## Evidence (isolated QA; never touches real saves)
| Shot | File |
|---|---|
| Before iPhone (toast+speech+minimap) | `before/iphone-overlap.png` |
| Before iPad portrait | `before/ipad-portrait-overlap.png` |
| After iPhone | `after/iphone-overlap.png` |
| After iPhone + quest | `after/iphone-overlap-with-quest.png` |
| After iPhone long text | `after/iphone-long-text.png` |
| After iPad portrait | `after/ipad-portrait-overlap.png` |
| After iPad landscape | `after/ipad-landscape-overlap.png` |

## Preserve
Gameplay, AI, art atlases, camera/world coordinates, collision, boats, audio, controls, `wandererV127PreviewSave`, mobile performance.
