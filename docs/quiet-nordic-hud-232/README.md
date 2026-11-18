# Quiet Nordic HUD (Job 232)

Presentation-only portrait stacking pass on V429 → **V430**. Reuses V426 ornate mobile presentation; does not rewrite the HUD.

## Problem
On iPhone 390×844, toast / speech / quest / minimap could share the same vertical band and crowd the hero during long guidance or raven notes.

## Bounded fix
1. **CSS lanes** (`v127-ornate-ui.css`): left toast rail under the day chip; minimap top-right; quest under the minimap with capped width/height.
2. **Speech dodge** (`updateHaigenSpeech` in `haigen.html`): treat live toast, quest panel, and minimap as obstacles; shift the character-anchored bubble to free candidates. `haigen-toast-live` raises the top safe band while a toast is showing.
3. Modal/menu suppression and control hit targets unchanged.

## Evidence (isolated QA; never touches real saves)
| Shot | File |
|---|---|
| Before iPhone (toast+speech+minimap) | `before/iphone-overlap.png` |
| Before iPad portrait | `before/ipad-portrait-overlap.png` |
| After iPhone | `after/iphone-overlap.png` |
| After iPhone + quest | `after/iphone-overlap-with-quest.png` |
| After iPhone long text | `after/iphone-long-text.png` |
| After iPad portrait | `after/ipad-portrait-overlap.png` |

## Preserve
Gameplay, AI, art atlases, camera/world coordinates, collision, boats, audio, controls, `wandererV127PreviewSave`, mobile performance.
