# Haigen's World — Master Development Plan

**Canon:** `haigen.html` · Repo: `astravalealive/The_little_wanderer`  
**Benchmark:** Zelda: A Link to the Past readability · **Identity:** original Nordic / Scandinavian fantasy (no Nintendo copies)  
**Captain** = creative director. Agents: Huginn (art), Worldbuilder (terrain), Muninn (review/tests).

---

## Locked visual design system

| Rule | Spec |
|------|------|
| Perspective | One three-quarter top-down plane |
| Haigen cell | 48×72 → ~80×120 @ scale 1.67; foot baseline `y-h+7` |
| Companions | Dylan ~78×66; Skölli ~148×78; keep footprints |
| Outlines | 1–2 px `#1d2420`–`#2a2f2c`; nearest-neighbour on sprites |
| Palette | Moss `#3f5a45`, leaf `#6f925c`, bark `#5a4330`, path `#a89068`, parchment `#f3ead2`, water `#3f7389`/`#4f87a0`, wood/gold UI `#b8894a` |
| Lighting | Soft contact shadows; night = cool navy/teal only (no purple fog) |
| Animation | ~150 ms walk; tools wrist-parented; no floating tools / noodle arms |
| Terrain | Readable walkable vs blocked; no obvious ground grids in play |
| Pipeline | AI concept → controlled pixel cleanup → atlas; concepts are never auto-production |
| Saves | `wandererV127PreviewSave` sacred |

Sources: `docs/nordic-visual-bible-230/`, `HAIGEN_HAIR_STYLE_BIBLE.md`, `docs/style-guide-and-asset-inventory.md`, `docs/HAIGENS_WORLD_GAME_BIBLE.md`.

---

## PR reconciliation (2026-11-18)

| PR | Role | Verdict |
|----|------|---------|
| **#239** | Heartland Readability V432 | **Merged** — preserve |
| **#241** | Nordic Haigen sprite PoC V433 (closes #240) | **READY TO MERGE** — CI 30/30, independent review clean |
| **#234** | Quiet Nordic HUD V431 | Keep — **CONFLICTING** vs main after #239; needs rebase before merge |
| **#235** | Older Job 232 HUD | **Superseded** by #234 |
| **#237** | HUD stacked on #234 branch | **Superseded / redundant** with #234 |
| **#238** | Visual transition proposal | **Superseded** as planning source (Heartland done; absorb into this master plan) |
| Drafts #190–#195, #204, #205, #222… | Old prototypes / CI scaffolds | Leave draft; do not revive without Captain ask |

**Do not merge/deploy without Captain approval.**

---

## Phases

### Phase 1 — Visual foundation (IMPLEMENT NOW)
See `PHASE1.md`.

### Phase 2 — Living world (plan only until Phase 1 gates pass)
Purposeful roads · villagers/routines · buildings/interiors · biome wildlife · northern castle.

### Phase 3 — Adventure (plan only)
Directional combat · bosses (Leshy, swamp restore) · boat progression · islands · lore/quests.

---

## Parallelism rules
- Max ~3 agents; only for **non-overlapping** file ownership.
- Shared `haigen.html`: one writer at a time, or strict stack-on-parent PR.
- Asset atlases may parallel if draw hooks are deferred to an integration PR.
- Muninn reviews once per head SHA; no duplicate reviews of unchanged commits.

## Merge / deploy
Captain-only. Agents never merge, deploy, delete content, or alter live saves.
