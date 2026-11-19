# Haigen's World — Master Ship Plan (Zelda-calibre)

**Canon live product:** `haigen.html` on `main` (currently **V432**)  
**Repo:** `astravalealive/The_little_wanderer`  
**Benchmark:** *The Legend of Zelda: A Link to the Past* — readable tiles, clear silhouettes, quiet HUD, fair telegraphs, cohesive world grammar  
**Identity:** original Nordic / Scandinavian childhood adventure — **no Nintendo assets, maps, or compositions**  
**Captain** = sole merge/deploy authority. Agents open PRs with evidence; never merge or deploy by silence.

---

## Quality bar (non-negotiable)

A change **does not ship** if any of these fail:

| Gate | Fail condition |
|------|----------------|
| **Graphics** | Mixed pixel density, painterly/atlas clash, floating system-font world labels, purple night wash, unreadable silhouette at iPhone 390×844 |
| **Gameplay** | Broken collision/`solidRadius`, boats, companions AI override of player, save corruption, unfair boss telegraphs |
| **Engine** | Unstable frame time on phone, broken touch/gamepad, missing asset loads (`__haigenAssetReport`) |
| **Story** | Orphan quest UI, Chapter I honesty regressions, fabricated every-frame events, unsafe tone for a child |

Definition of done for every visual PR: matched before/after iPhone + iPad landscape at fixed cams, save key intact (`wandererV127PreviewSave`), relevant live tests green, independent review once per head SHA.

---

## Locked visual design system

| Rule | Spec |
|------|------|
| Perspective | One three-quarter top-down plane |
| Haigen cell | 48×72 → ~80×120 @ scale 1.67; foot baseline `y-h+7` |
| Companions | Dylan ~78×66; Skölli ~148×78; keep footprints |
| Outlines | 1–2 px `#1d2420`–`#2a2f2c`; nearest-neighbour on sprites |
| Palette | Moss `#3f5a45`, leaf `#6f925c`, bark `#5a4330`, path `#a89068`, parchment `#f3ead2`, water `#3f7389`/`#4f87a0`, wood/gold UI `#b8894a` |
| Lighting | Soft contact shadows; night = cool navy/teal only |
| Animation | ~150 ms walk; tools wrist-parented; no floating tools |
| Terrain | Readable walkable vs blocked; no obvious ground grids in play |
| Pipeline | AI concept → controlled pixel cleanup → atlas; concepts never auto-production |
| Saves | `wandererV127PreviewSave` sacred |

Sources: `docs/nordic-visual-bible-230/`, `docs/style-guide-and-asset-inventory.md`, `docs/HAIGENS_WORLD_GAME_BIBLE.md`, `APPROVED-ART-BASELINE.md`.

---

## Dual track (honest engine path)

| Track | Role | Status |
|-------|------|--------|
| **A — Live HTML** | Shipable adventure players already have; visual + story polish on `haigen.html` | **Production canon** |
| **B — Godot V1** | Engine replacement candidate for homestead vertical slice (`godot-haigen/`) | **Isolated preview** — does not replace live game until Captain accepts |

Track B must match Track A art grammar. Track A keeps receiving Phase 1–4 until Captain freezes HTML or cutsover. **Do not touch production Pages / `haigen.html` from Godot PRs.**

---

## PR reconciliation (2026-11-19)

| PR | Role | Verdict |
|----|------|---------|
| **#239** | Heartland Readability V432 | **Merged** — preserve |
| **#241** | Nordic Haigen walk atlas PoC V433 | **READY TO MERGE** — first Captain merge ask |
| **#248** | Ground lattice soften V433 | **READY** — merge after or carefully sequenced vs #241 (both claim V433; rebase loser to V434) |
| **#258** | Quiet Nordic HUD V435 rebase | **READY** — supersedes conflicting #234 |
| **#257** | World Readability V434 | **READY** — P1-G1 |
| **#234** | Quiet Nordic HUD V431 | **Superseded** by #258 |
| **#235/#237** | Older HUD | **Superseded** by #234 |
| **#238** | Visual transition proposal | Absorb into this plan |
| **#242** | Earlier master plan draft | Superseded by this document revision |
| **#252/#254** | Godot homestead + HTTPS preview | Preview only; no live merge without Captain |
| Drafts #190–#205 etc. | Old prototypes | Leave draft |

---

## Documents in this folder
- `README.md` — this overview  
- `PHASE1.md` — active visual foundation milestones  
- `PHASE2-4.md` — living world / adventure / package  
- `HANDOFF_BACKLOG.md` — **every historical idea preserved** + status tags  
- `ROADMAP.md` — full-game gates S0–S10 + merge queue  

Handoff archive (19 Nov 2026) is the design memory; repo + Captain are authorities.

## Phases to packaged product

### Phase 0 — Truth & merge queue (Captain decisions)
1. **Play Godot preview** (Issue #253 / PR #259 session link) → Gate 2 visual decision.  
2. Optional: approve durable Pages path for `web-preview/` only.  
3. Approve merge **#241** (Haigen Nordic atlas) → then rebase build numbers.  
4. Approve merge **#248** (ground lattice) or its rebased successor.  
5. Approve **#257** World Readability + **#258** Quiet HUD (supersedes #234).  
6. Decide Godot vs HTML for the next vertical slice only.

### Phase 1 — Visual foundation (IMPLEMENT NOW)
See `PHASE1.md`. Goal: one Nordic pixel grammar on homestead → lake.

### Phase 2 — Living world
Purposeful roads · villager routines · building interiors · biome wildlife cohesion · northern fortress readability.

### Phase 3 — Adventure vertical slice
Chapter II story flags (save-safe) · boat progression gates · **Veiled Isle** cove → beacons → Mirrorkeel boss → Wayfinder Rune · fair enemy telegraphs.

### Phase 4 — Polish & package
iOS perf · accessibility · audio stingers · save migration notes · Quiet HUD final pass · ship checklist · optional Godot cutover package.

### Packaged product = done when
- Homestead → Silent Pond → Great Lake → first meaningful reward plays as one visual game on iPhone + iPad.  
- Quiet HUD: speech/toast/minimap never bury the hero.  
- Nordic Haigen + companions share outline family.  
- No system-font world spam; paths and doors read without text crutches.  
- Chapter II + fog-isle **vertical slice** playable (not full world).  
- Save round-trip proven; Pages deploy approved by Captain once.  
- Anything below the quality bar is cut, not “shipped ugly.”

---

## Parallelism rules
- Max ~3 agents; non-overlapping file ownership only.  
- Shared `haigen.html`: one writer at a time, or strict stack-on-parent PR.  
- Asset atlases may parallel if draw hooks wait for an integration PR.  
- Muninn reviews once per head SHA.

## Merge / deploy
Captain-only. Agents never merge, deploy, delete KEEP art, or alter live saves.
