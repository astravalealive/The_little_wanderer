# Haigen's World — Visual Transition Plan

**Status:** PROPOSAL ONLY for Captain approval.  
**Benchmark:** Zelda: A Link to the Past readability + Haigen’s own Nordic / Scandinavian fantasy identity.  
**Do not** merge, deploy, delete content, or begin sweeping rewrites from this document alone.

Companion sources already in-repo: `docs/HAIGENS_WORLD_GAME_BIBLE.md`, `docs/style-guide-and-asset-inventory.md`, `docs/nordic-visual-bible-230/README.md`, `docs/priority-repairs-proposal.md`.

Baseline frames (main / V429): `baseline/homestead-iphone.png`, `baseline/forest-edge-iphone.png`, `baseline/lake-shore-iphone.png`.

---

## 1. Truthful audit (current main)

### What is already strong
- Hero walk atlas density (~48×72 → ~80×120) is a workable canonical scale.
- Ornate HUD chrome + Quiet Nordic lanes (PR #234 / V431, awaiting merge) protect speech/toast/quest readability.
- Great Lake fish species/schooling hooks (Job 228) and painting silhouette stool fix (Job 230) moved toward the bible.
- Expanded biomes exist as playable coloured regions with seeded scenery and regional wildlife.

### Visual inconsistencies (highest pain first)
| # | Problem | Evidence / source |
|---|---------|-------------------|
| 1 | Mixed pixel densities (Haigen vs Skölli vs scenery 192×192 vs fauna 96×76) | Style guide §1 |
| 2 | Homestead / woodland clutter: dense seeded trees+rocks+bushes obscure paths and silhouettes | `baseline/forest-edge-iphone.png`, object seed loops ~4400–8500+ |
| 3 | Painterly / photo props beside SNES-inspired sprites (`painters-cart.webp`, `Stump.png`, Nico webp) | Asset inventory RESTYLE list |
| 4 | Repetitive terrain colour noise + high saturation green field reads “texture soup” | Homestead/lake baselines |
| 5 | Weak landform grammar: hills/cliffs/rivers/shorelines exist as colour blends more than readable relief | Terrain functions in `haigen.html` |
| 6 | Paths do not always read as routes to destinations | Trails atlas + world labels |
| 7 | Living-world aspiration ahead of art: villages/NPCs/routines are sparse vs bible | Region tables vs actual NPC systems |
| 8 | Boss / enemy combat presentation uneven across atlases + procedural FX | Gloamjaw / Thrummaw / Krakkle / swamp |

### World map (live regions)
| Id | Name | Role today |
|----|------|------------|
| *(core)* | Ancient Woodland / homestead `(1500,1500)` | Heart of play |
| `downs` | The Open Downs | Southern grassy expanse |
| `coast` | Saltwick Haven Coast | Skiff / shore |
| `snow` | The Frostbound Highlands | Northern ice / fortress aspiration |
| `fen` | The Forgotten Swamps | Boss / hydrology |
| `rainforest` | Western Rainforest | Dense west biome |
| `wasteland` | The Ashen Expanse | Dry ash lands |
| `desert` / `eastDunes` | Dry Lands / Eastern Dunes | Hot arid east |

Preserve: collision footprints, `wandererV127PreviewSave`, boat/skiff states, boss rewards, mobile touch/controller, performance budgets.

---

## 2. Unified art-direction specification

### North-star grammar (lock before mass replace)
1. **Perspective:** one three-quarter top-down plane (LTTP discipline, original Nordic art).
2. **Pixel metric:** author new ground/prop art at **16×16** (8×8 subtiles); hero remains 48×72 family; companions restyle **inside** current footprints.
3. **Palette family:** moss `#3f5a45`, leaf `#6f925c`, bark `#5a4330`, path `#a89068`, parchment `#f3ead2`, water `#3f7389`/`#4f87a0`, gold UI `#b8894a`. Region accents only; **desaturate** field greens ~10–20% vs today’s loudest fills.
4. **Outlines / lighting:** 1–2 px warm dark outlines; soft contact shadows; no purple fog wash; night = cool navy/teal only.
5. **Animation:** ~150 ms walk; tools/weapons parented to limbs (no floating noodle arms); bosses need readable wind-up frames.
6. **Environment grammar:** readable walkable vs blocked edges; tree clusters with clearings; rock formations as landmarks not noise; rivers/shores with depth bands; paths connect named places.
7. **UI:** Quiet Nordic HUD lanes (PR #234) remain the mobile chrome contract.

### Asset policy
Tag every file KEEP / RESTYLE / REPLACE / REMOVE-WITH-APPROVAL (see existing inventory).  
**Additive atlases first;** delete nothing until a migration PR proves loads + saves.

---

## 3. Regional world-design plan

### Phase A — Heartland readability (Ancient Woodland + homestead)
- Rebuild first-clearing forest packing: fewer overlapping trunks, clear rings around cottage/garden/paths.
- Believable micro-relief: gentle rises, stump circles, stream cut toward lake.
- Path network: cottage → lake jetty → woodland trailhead → Saltwick approach, all legible at iPhone 390×844.

### Phase B — Living Nordic settlement layer
- One starter village near downs/coast transition: homes, workshop, market stall, farm strips, 4–6 villagers with day routines (wander, converse, craft loops).
- Landmarks: rune bridge, mine mouth, watchtower, ruin ring — each teaches a verb (cross, dig, climb view, lore).

### Phase C — Frostbound fortress
- Northern ice castle courtyard, patrolling knights/guards, training yards; palette colder but same outline/shadow rules.
- Approach path with gates and readable cliffs.

### Phase D — Threat ecology by biome
- Robbers on downs trails; swamp/fen monsters; highland wolves; lake shallows wildlife; boss arenas get unique floor language without breaking collision.

### Phase E — Secrets & storytelling
- Environmental clues (broken cart, raven posts, half-buried runes) before new chapter systems.
- Preserve existing boss reward progression; new content is additive flags only.

---

## 4. Huginn challenge (visual / UX)

**Huginn’s objections (must answer before each implementation PR):**
1. *Scale first or world first?* Mass living-world NPCs before terrain grammar locks will look like busy dolls on soup — **reject** NPC density PRs until Phase A land readability lands.
2. *Phone truth:* every visual claim needs same-camera before/after at **390×844** and one iPad landscape; desktop-only mockups are insufficient.
3. *Saturation addiction:* “more vivid Nordic” often means louder greens — demand a desaturated field strip next to hero silhouette contrast tests.
4. *Do not copy Zelda tiles:* LTTP is a readability benchmark only; compositions, characters and motifs must stay original Haigen.
5. *HUD regression:* any world remaster that re-covers speech/toast/quest fails Quiet Nordic acceptance.

**Verdict:** Huginn allows **Phase A scenery readability** as first PR; blocks village/NPC/castle until heartland reads.

---

## 5. Muninn challenge (systems / risk)

**Muninn’s objections:**
1. *Save & collision sacred:* scenery remasters must not move solid radii, camp radius, boat berths, or `wandererV127PreviewSave` schema.
2. *Seeded object IDs:* changing seed loops can teleport harvestables — prefer **draw/atlas swaps** and local packing filters over renumbering world IDs.
3. *Performance:* fewer overdraws + atlas reuse; woodland-perf microbench must stay non-regressing; measure iPhone Safari scroll/drag.
4. *Boss rewards:* combat art PRs may not alter drop tables without a separate approved design note.
5. *Rollback:* keep old atlas files on disk until two green CI cycles after cutover.

**Verdict:** Muninn allows first PR if it is **draw-path / atlas / packing-filter only**, with isolated save tests and no ID churn.

---

## 6. Recommended first implementation PR

### Title
**Job 233 — Heartland Readability: Ancient Woodland scenery densify/declutter (V432)**

### Why this first
Highest continuous player screen time is homestead + near woodland. Fixing clutter, saturation, and path readability yields the largest LTTP-like quality jump without touching combat, villages, or saves.

### In scope
1. Restyle / re-pack **near-homestead** tree/rock/bush draw presentation (target radius ~cottage ±450) for readable clearings and path corridors.
2. Mild woodland ground desaturation + clearer path contrast using existing trail/palette hooks.
3. Extend contact-shadow consistency on remaining homestead props if cheap.
4. Before/after evidence at fixed cams: `(1530,1655)`, forest edge, lake approach; iPhone + iPad landscape.
5. Live contract test + mobile presentation + save-corruption + woodland-perf.

### Out of scope (later PRs)
Villager routines, ice castle, boss remasters, cart pixel replace, full scenery atlas rewrite, Veiled Isle, story chapter II.

### Acceptance
| Gate | Criteria |
|------|----------|
| Visual | Same-scene before/after; hero silhouette clear; paths readable; no toast/quest/minimap regression |
| Touch | Joystick, hotbar, pack, settings still pass Quiet Nordic touch suite |
| Save | `wandererV127PreviewSave` round-trip; Job 214 green |
| Perf | woodland-perf non-regression |
| Process | Captain explicit merge approval; no deploy from agent |

### File boundary (expected)
`haigen.html` (packing/draw only), optional additive atlas under `assets/`, `docs/visual-transition-plan/job233-*`, `tests/live/*`, `haigen-version.json` bump. **No** deletion of legacy art.

---

## 7. Staged roadmap (reviewable PRs)

| Stage | PR theme | Depends on |
|-------|----------|------------|
| 0 | Merge Quiet Nordic HUD #234 (V431) | Captain approval |
| 1 | **Heartland readability (this first PR)** | Style metrics above |
| 2 | Cart/easel + companion outline density match | Stage 1 |
| 3 | Path & shore grammar (lake → Saltwick) | Stage 1 |
| 4 | Starter village + 4 NPC routines | Stages 1–3 |
| 5 | Frostbound castle approach + guards | Stage 4 |
| 6 | Enemy telegraphs + boss arena polish (one boss at a time) | Stage 1 |
| 7 | Secrets / Chapter II story flags | Captain story lock |

---

## 8. Mobile testing criteria (every visual PR)

1. iPhone 390×844 portrait: homestead, forest edge, one biome edge.
2. iPad 768×1024 portrait + 1024×768 landscape.
3. Safe-area insets (notch / home indicator) if chrome moves.
4. Touch: joy drag moves Haigen; hotbar; backpack; settings.
5. Isolated storage only in QA hooks — never write the player’s real save during capture.
6. CI: game-build-identity, mobile-presentation, save-corruption, woodland-perf, job-specific live suite.

---

## Preserve forever
Gameplay systems, AI goals, controls, audio, boat progression, boss rewards, approved atlases until migrated, and player saves.
