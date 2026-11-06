# Haigen Hair Style Bible v1
**Design name:** Dangly Blonde Noodles
**Status:** Approved visual direction. Use for every future Haigen sprite/hair change.
**Scope:** Haigen's boy sprite in `haigen-test.html`. Do not change `index.html`, Ember, or the protected frogs.

## One-line art direction
A cheerful child with soft, dangling, sandy-to-golden-blonde wavy curls that bounce when he moves, framing a clearly readable face.

## Non-negotiable silhouette
- Build a compact, continuous, soft cap of hair following the skull, NOT a solid helmet or a stack of circles.
- Hang approximately 6–10 thin, uneven, curved locks from the crown, fringe and temples: loose S-curves / noodles.
- Keep strands narrow, varied in length and asymmetric. Taper or curl their tips. Avoid perfectly repeated loops.
- Fringe sits above the eyes. Side strands hang OUTSIDE cheeks and eyes, ending near ear-to-cheek height.
- Expose two readable eyes, eyebrows, nose and mouth in front view at normal iPad zoom.
- No floating circular buns, bright outlined spirals, macaroni loops, wig rolls or giant mushroom-cap silhouette.
- Proportions: hair stays close to the ~40-unit-wide head; no massive mushroom crown; no curls wider than the head by more than a little side volume.

## Colour and rendering
- Sandy honey-blonde base, warm golden midtones and a few pale straw highlights; shadows understated.
- Texture is thin flowing strokes, not concentric circles around every curl.
- Use crisp flat shapes for the storybook game style; subtle overlapping strands give depth.
- Ensure contrast over night-blue and daylight backgrounds without luminous yellow outlines.

## Animation
- Use a shared bounce driven by movement, with small phase offsets so individual locks lag and spring naturally.
- Idle: near-still, slight sway. Walking: small vertical bounce and soft side-to-side tip swing.
- Avoid large synchronized shaking, jitter or excessive deformation.
- Preserve the core face position as hair moves.

## View rules
- Front: both eyes and mouth visible; fringe never crosses pupils.
- Side: show a nose/eye and dangling strands behind or beside the face, not over it.
- Back: flowing blond nape curls, not a brown bald/bowl patch.
- Short: cropped loose waves, no long side noodles.
- Waves (default): 6–8 loose elongated waves.
- Curls: 8–10 more defined dangling S-shaped ringlets, still narrow and face-safe.
- Wild: slightly uneven, tousled locks and stronger motion; never giant puffballs.

## Acceptance checklist before declaring success
- [ ] Actual in-game screenshot or canvas render inspected at normal iPad scale, not code-only review.
- [ ] Front face visibly has TWO eyes, nose and mouth.
- [ ] Side and rear views read as blonde hair, not a helmet or pastry.
- [ ] At least 6 distinct dangling locks with natural varied lengths; no large circles or spiral donuts.
- [ ] Hair bounces gently in motion without covering eyes.
- [ ] Day and night palettes readable.
- [ ] Existing save and movement work; `index.html` unchanged.
- [ ] Frog renderer, frog updates and frog habitat code unchanged.

**Change control:** If a render fails this checklist, revise the hairstyle before claiming the visual fix is finished. Do not modify the frogs unless explicitly instructed by the user.
