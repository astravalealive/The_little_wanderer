# BLUE: APPROVED VISUAL REFERENCE (LOCKED)

The PNG is a visual concept/reference, NOT a ready-to-import atlas. Do not simply crop the full presentation sheet into animation frames: it contains borders, labels, backgrounds and inconsistent poses.

## Visual lock
Blue is a completely hairless, whiskerless Sphynx cat with a charcoal dark face, expressive large green eyes, prominent forehead/neck wrinkles, slender grey-to-pale body, thin tail, and very tall OUTWARD-CURVING horn/elf ears. Preserve his distinctive silhouette, skin colours and expression from the attached approved reference. No fur, no whiskers, no clothing, no generic upright cat ears, no redesign.

## Production task
1. Inspect canonical haigen.html, existing Blue code/assets, game pixel scale and animation conventions, current open PRs and branch conflicts before changing anything.
2. Produce a clean ORIGINAL transparent RGBA pixel-art atlas aligned to existing game scale, with consistent bounding boxes, anchor/pivot, and four directional idle/walk cycles (up/down/left/right). Mirror only where anatomy stays correct. Additional sleep, stretch, stalk, pounce animations can be follow-up work.
3. Use approved reference strictly as art direction. Redraw/correct poses and remove all background, gold frames, text, and decorative elements. Do not upscale cropped concept art and call it game-ready.
4. Integrate Blue into game without changing his existing behaviours or any gameplay/saves. Keep asset source, frame metadata and reproducible build notes.
5. Capture actual in-game iPhone/iPad screenshots and a magnified atlas preview; verify frame alignment, directional movement, alpha edges, appearance, load, controls, performance and saves.
6. Create a separate reviewable PR. Do not merge or deploy without explicit user approval. Do not spend credits.

IMPORTANT: If image cannot be recreated faithfully as a production atlas, report this honestly and provide a proposed pipeline rather than shipping compromised artwork.
