# Priority repairs proposal — painting, fish, story, Veiled Isle

Status: **PROPOSAL ONLY** for Captain approval.  
Based on: [PR #224 game bible](https://github.com/astravalealive/The_little_wanderer/pull/224) (`docs/HAIGENS_WORLD_GAME_BIBLE.md`).  
Source audited: current `main` (`haigen.html`, related boss addons, ornate UI).  
**Do not merge, deploy, delete existing content, or change production gameplay from this document alone.**

---

## 1. Audit summary (truthful baseline)

| Area | What exists today | Verdict |
|------|-------------------|---------|
| Painting | `paintHaigen()` (~10380): standing idle boy, vertically squashed `.85`, brush as two stroked lines | Awkward / not child-clear; economy intact |
| Fish | Procedural ellipses in `drawLakeFish()`; 14 lake schools; osprey predation; fishing economy separate | Readable as “fish-shaped blobs”, not Nordic sprites; schools ignore player/boat |
| Story | Silent Pond Ch.I forced complete (`stage=6`); raven post, runestone research, Nico tales, diary live | Between chapters — no new chapter content |
| Fog island | No Veiled Isle / fog curtain / longship destination. Skiff is Saltwick↔lighthouse rail. Longship is UI stub | Seed only; must be designed as vertical slice first |
| Style | Mixed atlas + procedural + ornate HUD; bible Gate 1 still required before mass restyle | Keep repairs inside approved pixel grammar |

Companions / names in live code: **Dylan** (rabbit), **Skölli** (fox), **Nico** (Mothkeeper). No “Blue” companion found. Bible’s “Niko/Blue” are aspirational unless approved.

Boss patterns safe to reuse: Gloamjaw / Thrummaw / Krakkle / swamp dual — IIFE on `__gloamPort`, phase machines, memory+save on defeat.

---

## 2. Visual concepts (cohesive, child-appropriate, Nordic)

All four priorities share one grammar (pending Gate 1 style lock):

- **Pixel density:** match Haigen walk atlas (~48×51 torso crop language) and wildlife motion cells; no painterly overlays on sprites.
- **Perspective:** three-quarter top-down; feet/ground contact consistent; no side-view-only props mixed into world unless framed as UI.
- **Palette:** woodland greens/browns + lake blues + warm parchment UI; fog island uses cooler slate, lichen grey, beacon amber — still same outline/shadow rules.
- **Silhouettes:** readable at iPhone 390×844; actions readable without text.
- **Tone:** wonder and mild peril, never gore, never suggestive poses, never cruel humour.

### 2.1 Painting pose — proposed redesign

**Problem:** squash-scale of a standing child + mid-torso brush stroke reads as a bent body, not a painter.

**Concept A (preferred): three-quarter seated painter**
- Haigen sits on the existing stool facing the easel (east of seat).
- Legs tucked under stool; torso upright; head slightly toward canvas.
- Right arm holds a short brush; tip contacts canvas; left hand steadies board edge or palette.
- 4-frame cycle: rest → reach → stroke → dab (≈180–220 ms/frame).
- Tiny paint flecks only on canvas surface (not on body).

**Concept B (fallback): standing three-quarter at easel**
- No vertical squash. Weight on one foot; free hand on hip or easel upright.
- Brush from shoulder pivot, not torso midline.

**Preserve:** `state.atelier`, guest buyers, purse gold, cart sprite crops, gallery UI, autonomy `paintAI` schedule, `painters-cart.webp`.

**Acceptance:** before/after phone-scale video or 6-frame strip; Captain confirms pose is clearly painting and child-appropriate.

Preview: `docs/previews/painting-pose-concept.html`

### 2.2 Fish redesign — species + schooling

**Problem:** lake fish are translucent procedural blobs; atlas fish cells unused; schools don’t react to Haigen/boat; fishing doesn’t touch living population.

**Proposed species (Great Lake first, then regional accents):**

| ID | Name | Look | Behaviour accent |
|----|------|------|------------------|
| `perch` | Bronze perch | Warm gold-olive, striped | Tight mid-depth shoals |
| `char` | Brook char | Cool teal belly, dark back | Deeper water, larger spacing |
| `minnow` | Reed minnow | Small silver | Shallows / nursery edges |
| `pikelet` | Pikelet (rare) | Long silhouette | Lone hunter near reeds — child-safe chase, no gore |

**Sprite sheet proposal:** 16×10 or 24×12 cells, 4 headings × 3 swim frames + 1 turn; same outline weight as ducks/osprey.

**Schooling v2 behaviours (keep lake performance):**
1. Cohesion / alignment / separation (Boids-lite, capped).
2. Smooth bank + island avoidance (keep current look-ahead).
3. Soft flee when Haigen/raft/skiff within radius (scatter then regroup).
4. Depth bands: minnows shallow, char deeper.
5. Camera cull schools off-screen before update.
6. Fishing: optional soft deplete of nearest school (recover via existing lifecycle eggs) — **economy numbers unchanged until approved**.

Preview: `docs/previews/fish-school-concept.html`

### 2.3 Story framework — organic twists

**Do not revive Silent Pond stages 0–5** (honesty tests + HUD assume retirement). Add **Chapter II** beside existing flags.

**Chapter II working title: “The Beacon That Forgot Its Name”**

Discovery loop (bible pillar): obstacle → materials → craft → unlock → boss → practical reward → return.

| Beat | How the player finds it | Twist |
|------|-------------------------|-------|
| B1 Quiet rumour | Raven note + Nico tale fragment about northern fog that “answers wrong” | Guide figure is helpful but incomplete |
| B2 Waystone clues | Three runestone rubbings on coast / highlands / lake island | Rubbings assemble a partial sea chart |
| B3 Boatwright’s debt | Homestead diary + Saltwick elder memory | Someone sealed a beacon, not a monster |
| B4 Fog margin | Skiff can reach fog edge after longship materials gate | Fog thins only near lit beacons |
| B5 False guardian | Apparent spirit “protects” the shore | It is a reflection / thrall of the real corruption |
| B6 True source | Inland ruined beacon | Multi-phase boss; Wayfinder Rune reward |

**Save design (backward compatible):**
```
state.story.chapter2 = {
  stage: 0..8,
  waystones: [],
  beaconsLit: 0,
  guideTrust: 0,
  falseGuardianSeen: false,
  veiledIsleUnlocked: false,
  bossDefeated: false
}
```
Never overwrite Chapter I retirement fields. Raven/journal write flavour only when stage advances.

### 2.4 The Veiled Isle — vertical slice design

**Access:** not early teleport. Requires longship progression (or interim “fog-worthy skiff upgrade” if Captain prefers a smaller gate). Landing only at one readable cove.

**Identity:** Nordic folklore — sealed beacon, lichen stone, quiet shore birds, cold shallows. Child-appropriate dread = wrong silence + mistaken helpers, not body horror.

**Exploration layers:**
1. Shore cove + wreck debris (safe).
2. Lichen heath with mist pockets (navigation puzzle).
3. Beacon terrace with three fire bowls.
4. Inland hollow (boss arena) revealed after beacons.

**Enemy archetypes (fair telegraphs):**

| Enemy | Silhouette | Telegraph | Player answer |
|-------|------------|-----------|---------------|
| Mist-moth swarm | Soft wing cloud | Pulse glow before dart | Torch / net / walk through gaps |
| Driftwood wight | Floating timber figure | Raises arms 0.6s | Sidestep + collect |
| Fog hound | Low canine of vapour | Paw scrape sound + dust | Skölli distract / bait |
| False guide echo | Friendly NPC outline | Voice delay / wrong advice | Ignore paths it marks |

**Boss: “Mirrorkeel of the Sealed Beacon” (name pending approval)**  
Multi-phase, readable, practical reward:

| Phase | Read | Mechanic |
|-------|------|----------|
| 1 Veil | Semi-transparent serpent around beacon | Light bowls while dodging slow arcs |
| 2 Mirror | Creates a false Haigen / false companion | Strike the one that casts no warm shadow |
| 3 Seal break | Beacon core exposed | Timed hits during open rune window |

**Reward: Wayfinder Rune** — enables one new fog-bound sea passage on the map (tangible navigation utility, not cosmetic). Outfit/accent optional secondary drop.

**Fog FX:** local density falloff around player + lit beacons; no expensive fullscreen filter.

Preview map sketch: `docs/previews/veiled-isle-concept.html`

---

## 3. Animation / preview deliverables (this PR)

| Preview | Purpose |
|---------|---------|
| `docs/previews/painting-pose-concept.html` | Current vs proposed pose frames at phone scale |
| `docs/previews/fish-school-concept.html` | Species silhouettes + school motion sketch |
| `docs/previews/veiled-isle-concept.html` | Island layout, enemy silhouettes, boss phases |
| Canvas “Priority repairs proposal” | Interactive summary for Captain review |

These are **documentation / concept only** — not wired into `haigen.html`.

---

## 4. Staged implementation plan (after style + Captain approval)

### Stage 0 — Style gate (bible Gate 1)
- Lock pixel metric + palette from bible before production sprite replacement.
- Rollback: no production assets changed yet.

### Stage 1 — Painting pose repair (small PR)
- **Files:** `haigen.html` (`paintHaigen` + optional tiny atlas crop), maybe `assets/haigen-paint-pose.webp` (new, additive).
- **Preserve:** atelier economy, cart, AI schedule.
- **Tests:** live smoke; visual before/after; no save schema break.
- **Risk:** low–medium (rebirth vs classic draw paths).

### Stage 2 — Fish sprites + schooling v2 (medium PR)
- **Files:** `haigen.html` (`drawLakeFish`, nursery), new `assets/lake-fish-atlas.webp`, optional rod soft-deplete behind flag.
- **Preserve:** fishing controls, fish counts, osprey loop, lifecycle saves.
- **Tests:** lake performance on emulated iPhone; boat proximity flee; asset report clean.
- **Risk:** medium (draw-loop cost; economy coupling).

### Stage 3 — Chapter II story flags + raven/waystone beats (medium PR)
- **Files:** `haigen.html` story/journal/raven; `v127-ornate-ui.js` quest panel; honesty tests updated for new chapter only.
- **Preserve:** `oldStreamQuestRetired`, all Ch.I fields.
- **Tests:** save round-trip with/without `chapter2`; journal honesty.
- **Risk:** medium (UI/quest panel); avoid reopening Silent Pond.

### Stage 4 — Veiled Isle vertical slice (large, still reviewable)
- **4a** Map stub + landing cove + fog falloff (no full landmass).
- **4b** Three enemy types + telegraphs.
- **4c** Multi-phase boss addon module (pattern: `gloamjaw-v128.js`).
- **4d** Wayfinder Rune reward + one sea passage unlock.
- **Preserve:** skiff rails until longship materials explicitly approved; existing islands/bosses.
- **Risk:** high — ship as gated prototype behind `state.story.chapter2.veiledIsleUnlocked`.

### Stage 5 — Polish
- Mobile performance, audio stingers, accessibility, save migration notes, real-device screenshots.

---

## 5. Explicit non-goals for this proposal PR

- No merge / deploy.
- No deletion of legacy art or Silent Pond code.
- No production gameplay changes in `haigen.html`.
- No Pages / deployment edits (PR #222 remains separate).
- No wholesale restyle of the 800k+ character game file.

---

## 6. Captain decision checklist

- [ ] Approve painting Concept A (seated) or B (standing)
- [ ] Approve fish species set + whether rod depletes schools
- [ ] Approve Chapter II beats / twist tone
- [ ] Approve Veiled Isle name, boss name, Wayfinder Rune reward
- [ ] Confirm style bible Gate 1 before sprite production
- [ ] Authorize Stage 1 implementation PR after approval
