# Style guide & asset inventory (Gate 1)

Status: **PROPOSAL for Captain style lock.** Derived from live `haigen.html` (main / V425) and `APPROVED-ART-BASELINE.md`.  
Companion to `docs/priority-repairs-proposal.md` and [PR #224](https://github.com/astravalealive/The_little_wanderer/pull/224) game bible.  
**Do not replace production assets or merge until Captain approves this grammar.**

---

## 1. Why visuals clash today

| Clash | Evidence |
|-------|----------|
| Mixed pixel densities | Haigen **48×72** cells vs Skölli **336×176** vs Dylan **192×128** vs scenery **192×192** vs fauna **96×76** |
| Procedural vs atlas | Lake fish = ellipses; trees sometimes atlas, sometimes `rbTreeImage`; Gloamjaw atlas + SVG baseline diverge |
| Painterly props | `painters-cart.webp`, Nico webp, runestone PNG, stump photo-like art sit beside SNES-inspired walk atlas |
| Camera scale drift | Phone `baseCameraScale` floors at **0.52** (×1.18 rebirth); iPad can reach ~1.0 — same sprites read different sizes |
| UI vs world | Ornate HUD is illustration-framed; world aims for 16-bit tiles |

Goal: one original Nordic 16-bit grammar — not a Zelda asset copy, not an asset collage.

---

## 2. Proposed locked metrics (from source, then normalized)

### Camera (keep code contracts; document target feel)
| Metric | Live value | Proposal |
|--------|------------|----------|
| `baseCameraScale` | `clamp(min(W/1024,H/768), .52, 1) * (rb ? 1.18 : 1)` | Keep formula; after style lock, tune rebirth multiplier only with before/after phone shots |
| `cameraZoom` | default `1`, clamp `[.22, 2.4]` | Keep; homestead reference shots at zoom `1` |
| Homestead cam | cottage `(1500,1500)`, player ~`(1530,1655)` | Canonical screenshot coords for all visual PRs |

### Character / companion draw grammar
| Actor | Cell | On-screen draw (live) | Lock rule |
|-------|------|----------------------|-----------|
| Haigen | **48×72** in 192×288 | scale **1.67** → ~80×120, foot baseline `y-h+7` | **Canonical hero scale** |
| Dylan | 192×128 | 78×66 | Keep footprint; restyle only inside cell |
| Skölli | 336×176 | 148×78 | RESTYLE toward denser pixels without changing collision/paw baseline |
| Fauna unified | 96×76 | via `drawUnifiedCreatureArt` | New fish/enemies match this density family |

### Environment
| Element | Live | Lock rule |
|---------|------|-----------|
| Comment intent | “SNES-inspired **16px** tiles on full-res canvas” | Author new ground/prop art at **16×16** (8×8 subtiles) |
| Woodland scenery cells | 192×192 | RESTYLE to match 16px language or migrate to env atlas |
| Houses | clean tier PNGs; `rbDrawHouse` 92×94 | KEEP paths; RESTYLE art only |
| Collision footprints | existing solid radii / camp radius 365 | **Do not change** in art PRs |

### Palette (bounded family)
- Woodland: moss `#3f5a45`, leaf `#6f925c`, bark `#5a4330`, parchment `#f3ead2`, gold UI `#b8894a`
- Water: deep `#3f7389`, mid `#4f87a0`, foam `#e4eef1`
- Fog isle accent: slate `#44524c`, lichen `#7f9168`, beacon amber `#e0a35a`
- Outlines: dark warm `#1d2420`–`#2a2f2c`, 1–2 px equivalent at source
- No purple fog wash; night remains restrained blue wash (live rule)

### Perspective & animation
- Three-quarter top-down; roofs/walls/trees share one vanishing feel
- Walk cadence ~150 ms/frame (Haigen); actions readable at iPhone 390×844
- Nearest-neighbour for pixel sprites only; full-res world canvas stays (live)

---

## 3. Asset inventory (summary)

Tags: **KEEP** · **RESTYLE** · **REPLACE** · **REMOVE-WITH-APPROVAL**

### KEEP (live + approved)
`haigen-reference-walk-atlas.webp`, `haigen-v119-movement-atlas.png`, `haigen-approved-atlas.png`, `haigen-region-outfits.png`, `dylan-rabbit-approved-v125.png`, `dylan_adult_rabbit_8x8_transparent.png`, `skolli-adult-approved.webp`, `woodland-fauna-illustrated.png`, `regional-fauna-illustrated.png`, `haigen-wildlife-motion.webp`, `haigen-trails.webp`, `gloamjaw-approved-v133.png`, `haigen-environment-clean-v138.webp`, `woodland-scenery-v333.webp`, `greyfang_approved_original_atlas.png`, mallard/duckling/songbird/robin repaired sheets, house/garden/coop tiers, `cockerel.webp`, `great-lake-ospreys.webp`, `krakkle/krakkle.png`, `Grumgullet_Sprite_Sheet.png`, troll-walk/hoard, `nico-*.webp`, `painters-cart.webp` (until paint pose atlas lands).

### RESTYLE (used; clash risk)
`woodland-scenery-v333.webp`, `spectors-sheet.jpg`, `Stump.png`, `troll-hoard.webp`, `painters-cart.webp`, `nico-*.webp`, runestone PNG, `skolli-adult-approved.webp` (density), illustrated fauna sheets toward tighter outlines.

### REPLACE (superseded paths; keep files until migration tested)
`haigen-companions-v124.png`, `skolli-fox-v126.png`, `haigen-fauna-v124.png`, `haigen-extra-fauna-v124.png`.

### REMOVE-WITH-APPROVAL (unused by live HTML)
`environment-*-v138.json`, unused Greyfang SVG/transparent, pre-repair songbird/robin “clean” sheets, `troll-cast.webp`, `troll_home_six.svg`.

### New assets proposed (additive only)
| Asset | Purpose | Stage |
|-------|---------|-------|
| `assets/haigen-paint-pose.webp` | Seated painter 4-frame | Stage 1 |
| `assets/lake-fish-atlas.webp` | Perch/char/minnow/pikelet | Stage 2 |
| `assets/veiled-isle-*.webp` | Shore, enemies, boss | Stage 4 |

---

## 4. Renderer inventory

| Path | Mode | Note |
|------|------|------|
| `drawApprovedHaigen` / walk atlas | Atlas | Canonical |
| `rbDrawActor/Tree/Rock/House` | Procedural fallback | Keep for density match |
| `drawLakeFish` | Procedural | **Replace visuals** Stage 2 |
| `paintHaigen` | Squashed actor + strokes | **Replace pose** Stage 1 |
| Boss modules | Atlas and/or procedural | Reuse addon pattern for Veiled Isle |
| `v127-ornate-ui.*` | HUD chrome | Quiet Nordic; presentation PRs separate |

---

## 5. Acceptance for style lock

Captain approves when:
1. This metric table is accepted (or amended once).
2. Homestead + character/tree mockups read as one game (`docs/previews/style-homestead-mockup.html`, `docs/previews/style-character-trees-mockup.html`).
3. Priority repairs (paint, fish, isle) will author to these metrics.
4. No production file is deleted until a migration PR with save/asset tests.

Rollback: leave all live paths untouched; proposal docs only.
