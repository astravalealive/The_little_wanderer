# Phases 2–4 — Living world, adventure, package

Plan only until Phase 1 gates (A1, C1, F1, G1) pass Captain visual glance. Do not start production Veiled Isle landmass before a reviewed vertical slice.

## Phase 2 — Living world

| ID | Deliverable | Acceptance |
|----|-------------|------------|
| P2-1 | Purposeful roads between cottage, pond, lake, Saltwick approach | Path reads at phone scale without grid soup |
| P2-2 | Villager / companion routines (never override player command) | Schedule visible; Call friends still wins |
| P2-3 | Building interiors readable (cottage, atelier adjacency) | Door silhouette obvious; collision preserved |
| P2-4 | Biome wildlife atlas family match | Same outline weight as Haigen family |
| P2-5 | Northern fortress / castle massing pass | Landmark readable from approach cam |

## Phase 3 — Adventure vertical slice

Follow `docs/priority-repairs-proposal.md` (Captain checklist still required for names):

| ID | Deliverable | Acceptance |
|----|-------------|------------|
| P3-1 | Chapter II flags `state.story.chapter2` save-safe | Round-trip with/without field; Ch.I honesty intact |
| P3-2 | Raven + waystone discovery beats | No Silent Pond stage revival |
| P3-3 | Veiled Isle cove + fog falloff (gated) | Not early teleport; one landing |
| P3-4 | Enemy archetypes with telegraphs | Mist-moth, driftwood wight, fog hound — fair |
| P3-5 | Boss module (Mirrorkeel name pending) | 3 phases; Wayfinder Rune practical unlock |
| P3-6 | Boat progression gate to isle | Longship or approved interim skiff upgrade |

## Phase 4 — Polish & packaged product

| ID | Deliverable |
|----|-------------|
| P4-1 | iPhone/iPad perf budget documented + woodland-perf green |
| P4-2 | Audio stingers for story/boss without drowning SFX |
| P4-3 | Accessibility: contrast, speech clearance, touch targets |
| P4-4 | Save migration notes + isolated QA fixtures in CI |
| P4-5 | Ship checklist signed by Captain; Pages deploy only then |
| P4-6 | Optional: Godot Track B cutover package if engine accepted |

## Godot Track B (parallel, isolated)

- Keep `godot-haigen/` off production `haigen.html` / Pages root.  
- Homestead pocket must reuse approved atlases and Nordic grammar.  
- Issue #253 / PR #254: durable HTTPS preview requires Captain approval for host path.  
- Cutover only after Phase 1 grammar exists on both tracks and Captain chooses engine.
