# Full-game development roadmap (reconciled)

**Purpose:** Execution path from today’s V432 HTML + Godot homestead preview to a packaged Nordic adventure.  
**Companion:** `HANDOFF_BACKLOG.md` (every historical idea preserved).  
**Rule:** Vertical slices with visible play — not hundreds of micro-PRs. Captain approval before merge/deploy/spend.

---

## Now — Gate 1 (active)

1. Captain plays Godot HTTPS preview (session link from Issue #253 / PR #259).  
2. Decide: continue Godot, improve HTML, or hybrid.  
3. Optional durable host: approve Pages path for `web-preview/` only.

No full-world port and no HTML wipe until that decision.

---

## Gate 2 — Owner visual decision

Captain answers: does Godot V1 look/feel better than HTML V432 homestead?  
Record specific issues. Freeze engine choice for the next vertical slice only (can revisit later).

---

## Gate 3 — Unified visual bible (one reference scene)

Regardless of engine, one playable scene must show **same grammar** for: Haigen, Skölli, Dylan, cottage, trails, water, foliage, UI, tools.

| Milestone | Deliverable | Depends |
|-----------|-------------|---------|
| V-Bible-1 | Merge queue: #241 atlas, #248 lattice, #257 labels/shadows, #258 Quiet HUD | Captain merges |
| V-Bible-2 | Tool poses + paint atlas proof | V-Bible-1 |
| V-Bible-3 | Companion outline family (Skölli/Dylan/Nico/Blue) | V-Bible-1 |
| V-Bible-4 | Scenery family (trees/rocks/bushes/paths/water edges) | Lattice |

Acceptance: matched iPhone 390×844 + iPad landscape; Captain visual yes.

---

## Gate 4 — Vertical slices (build in order)

Each slice = playable area + art + interaction + story beat + tests + saves + device evidence.

| Slice | Content | Includes backlog themes |
|-------|---------|-------------------------|
| **S0 Homestead heart** | Clearing, cottage in/out, companions, garden/coop, quiet HUD | Living home, Blue/Dylan/Skölli basics |
| **S1 Pond → Lake → raft** | Readable paths, schooling fish, walk-on raft, first island | Water, ecology, boat tier 1 |
| **S2 Woodland depth** | Trails, runestone/mycology, Mossroot, stump trolls | Lore, learning, trolls |
| **S3 Saltwick coast** | Skiff progression, jetty, lighthouse rail polish | Boat tier 2, seaside town |
| **S4 North** | Tundra climate, ice approaches, castle massing, knight cues | Survival outfits, north boss later |
| **S5 West swamp** | Spectres at night, wetlands readability | Night ecology |
| **S6 East desert** | Separate landmass, Thrummaw reward loop | Desert fauna, poison |
| **S7 Ashen** | Leshy fight + Leshy Outfit utility | Boss reward rule |
| **S8 Far sea** | Longship gate, Veiled Isle cove→beacons→boss→Wayfinder | Chapter II, fog isle |
| **S9 Living settlements** | Riverwatch (placement verified), routines, trade | NPCs, economy |
| **S10 Polish package** | Perf, a11y, offline catch-up, App Store readiness | Packaging |

Jungle islands stay **separate** from desert (handoff). Riverwatch waits on **verified placement**.

---

## Gate 5 — Systems spine (parallel after S0–S1 art lock)

| System | Notes |
|--------|-------|
| Autonomy / diary / Talk to Haigen | Player command always wins |
| Day/night + climate | Navy night; torch; region clothing |
| Combat grammar | Real-time, telegraphs, usable boss drops |
| Save migration | HTML ↔ future Godot only with explicit plan |
| Offline simulation ≤72h | Bounded; no unfair companion death |
| Gamepad + touch | Safe areas; Quiet HUD lanes |

---

## Gate 6 — Packaging / release

Only after full regression, IP/original-art check, device QA, save migration, and **explicit publish approval**. No date promises without demonstrated readiness.

---

## Open merge queue (HTML Phase 1) — do not auto-merge

| Order | PR | Role |
|-------|-----|------|
| 1 | #241 | Nordic Haigen atlas V433 |
| 2 | #248 | Ground lattice (resolve V433 clash) |
| 3 | #257 | World Readability V434 |
| 4 | #258 | Quiet HUD V435 (closes #234) |
| — | #256 | This plan (docs) |
| — | #252/#259 | Godot preview — play first; merge only if chosen |

---

## Spend / authority (non-negotiable)

- No paid hosting, image credits, or extra usage charges without a separate yes.  
- No merge, Pages production change, or deploy without a specific yes.  
- Session Cloudflare tunnels are free and temporary.  
- Durable Godot URL via existing Pages path requires one explicit yes.
