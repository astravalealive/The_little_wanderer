# Wizardlands RPG Design Codex — v0.1

Status: sandbox reference, not a trained model or autonomous agent. This document defines design knowledge and guardrails for future specialist tools. No production changes are authorised.

## Design benchmark
Haigen's World is an original Nordic-fantasy top-down action-adventure. Aim for the consistent visual readability of *The Legend of Zelda: A Link to the Past*, the believable daily-life systems of *Stardew Valley*, the meaningful crafting and environmental progression of *Terraria*, the atmospheric action-adventure clarity of *Secret of Mana*, and the satisfying exploration/trading loops of *Moonlighter*. Study principles, never copy protected maps, art, sprites, dialogue, or characters.

## Visual language
- One coherent 2D top-down/three-quarter pixel-art language across every biome; no mismatched pixel density, floating tools, random scaling, inconsistent lighting or excessive saturation.
- Establish a tile grid, sprite proportions, consistent camera and palette before adding content. Pixel edges remain crisp without artificial pixel filters.
- Distinct silhouettes and readable poses at actual iPhone/iPad gameplay scale. Character feet determine depth sorting; scenery anchors must reflect contact with ground.
- Terrain forms natural, connected geography: rivers flow logically, paths have destinations, trees cluster naturally, cliffs and bridges have plausible approaches.
- Keep important objects, traversable paths, interactable entrances and hazards legible. Use restrained effects and maintain UI/touch readability.

## Game design
- A location should offer a purpose: discovery, traversal, gathering, trade, challenge, storytelling or recovery.
- Make exploration rewarding through visible landmarks, shortcuts, connected routes and sensible difficulty progression.
- NPCs have homes, occupations, schedules, relationships and contextual reactions; no aimless random wandering presented as intelligent life.
- Buildings must have valid entrances, accessible routes, collision geometry, appropriate surroundings and matching interior/exterior logic.
- Crafting uses defined materials, recipes, progression, resource sources and visible construction stages.
- Quest and lore changes must remain consistent with existing Haigen's World canon; no contradictory characters or unexplained story rewrites.
- Preserve existing gameplay, artwork, saves, mobile controls and player progress unless explicitly approved.

## Twelve specialist roles
Eldrin: buildings, paths, settlement plans, collision. Vaelion: geography, cartography, exploration. Bromnar: stonework, caves, ruins. Lyra: ecosystems, wildlife, forests. Zephren: mechanisms and systems. Morven: safety, regression, save compatibility. Sera: weather, lighting, elemental effects. Thalen: quests, dialogue, narrative. Orin: northern tundra and mountain passes. Nimue: plants, mushrooms, farming, potions. Kael: lore and continuity. Fenrir: villages, daily NPC routines and social systems.

## Sandbox operating protocol
1. Observe the actual world state and source; distinguish known facts from guesses.
2. Explain the problem and propose a measurable improvement consistent with this codex.
3. Make the smallest reversible change in the isolated Wizardlands sandbox only, using available approved tools.
4. Validate sprite coherence, collisions, navigability, performance, mobile presentation, regressions and save compatibility; capture before/after evidence.
5. Record what changed, tests, risks and rollback steps. Ask for human approval before any merge, deployment, production-world mutation or expansion of permissions.
6. Never assume a language model can directly see the game or modify it without connected inspection, rendering and editing tools. Never claim tests passed without evidence.

## First trial
Choose an undeveloped section from a copy of the map, not production. Give the team one ruined crossing and a prospective settlement site. Let specialists propose a connected bridge, paths, houses, resource loop and NPC routines. Score visual consistency, playability, autonomy, originality, test coverage and unintended side effects. Compare against a no-agent baseline.

## Next engineering requirements
Implement map/asset inspection, constrained edit APIs, action budgets, role permissions, shared task queue, state snapshots/undo, automated play tests and screenshot comparison. Until those exist, these are specifications for future agents, not active autonomous workers.
