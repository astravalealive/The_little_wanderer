# Quiet Nordic HUD (Job 232)

Presentation-only portrait stacking pass on V429 → **V430**. Reuses V426 ornate mobile presentation; does not rewrite the HUD.

## Problem
On iPhone 390×844, toast / speech / quest / minimap could share the same vertical band and crowd the hero during long guidance or raven notes.

## Bounded fix
1. **CSS lanes** (`v127-ornate-ui.css`): left toast rail under the day chip on iPhone and iPad portrait; minimap top-right; quest under or beside the minimap with capped width/height. On iPad landscape the toast sits in the open band to the right of the day chip so it does not cover the clock or companions.
2. **Speech dodge** (`updateHaigenSpeech` in `haigen.html`): treat live toast, quest, minimap, the day/portrait chrome, touch controls, and Haigen's screen box as obstacles. Place the bubble fully above or below Haigen when a side shift would not fit. `haigen-toast-live` raises the top safe band while a toast is showing.
3. Modal/menu suppression unchanged. On iPhone and iPad, journal/pack/map and settings sit above the joystick and the action buttons so each control's centre is an unobstructed touch hit.

## Evidence (isolated QA; never touches real saves)
| Shot | File |
|---|---|
| Before iPhone (toast+speech+minimap) | `before/iphone-overlap.png` |
| Before iPad portrait | `before/ipad-portrait-overlap.png` |
| After iPhone | `after/iphone-overlap.png` |
| After iPhone + quest | `after/iphone-overlap-with-quest.png` |
| After iPhone long text | `after/iphone-long-text.png` |
| After iPhone long text + quest | `after/iphone-long-text-with-quest.png` |
| After iPad portrait | `after/ipad-portrait-overlap.png` |
| After iPad landscape | `after/ipad-landscape-overlap.png` |

## Preserve
Gameplay, AI, art atlases, camera/world coordinates, collision, boats, audio, controls, `wandererV127PreviewSave`, mobile performance.
