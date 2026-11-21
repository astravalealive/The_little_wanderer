# Proposed first PR — Job 233 Heartland Readability

**Not implemented yet.** Awaiting Captain approval of the parent plan and of this PR brief.

## Goal
Make the Ancient Woodland homestead and near-forest read like a disciplined Nordic top-down adventure (LTTP clarity, original art): clear paths, intentional tree/rock clusters, calmer ground colour, hero silhouette always readable on iPhone.

## Non-goals
No village NPCs, castle, boss remasters, save schema changes, control changes, wholesale atlas deletion, or gameplay retunes.

## Implementation sketch
1. Add a **homestead packing filter** (or draw-time occlusion/density cap) for scenery within ~450u of cottage without renumbering object IDs.
2. Soften loudest woodland fills toward bible moss/leaf values; strengthen path value contrast.
3. Optional additive restyle cells for 2–3 overused bush/rock draws if needed — KEEP old files.
4. Evidence + live tests as listed in `README.md` §6–8.

## Huginn / Muninn pre-flight
- Huginn: approve only if before/after phone shots show clearer navigation, not just “prettier noise”.
- Muninn: approve only if save key, collision, and object IDs stay stable and CI perf suites pass.

## Merge rule
Explicit Captain approval required. No agent merge/deploy.
