# Viking World Overhaul — implementation track

Production HTML and Godot prototype remain separate. Do not change main or publish until tested.

## Immediate blockers
- PR #257 and #258 are 14 commits behind main and GitHub marks both non-mergeable. Rebase each against current main, preserve saves and controls, rerun CI plus mobile touch and Xbox regression before publishing.
- PR #280 is draft and non-mergeable, 2 commits behind main. Repair integration, add deterministic tests for trapped/pacing behaviour, long-running autonomous wandering, frame time and saved-game compatibility. No external AI autonomy or code-writing privileges.

## Viking gameplay implementation milestones
1. Haigen: reliable bounded navigation, obstacle escape, non-repeating goal selection, idle camera follow; manual control always overrides and does not snap back until autonomous wandering resumes.
2. Viking identity: age-appropriate Nordic adventurer with coherent clothing for forest, cold north, coast and desert; animated equipment integrated with body poses.
3. Village: readable connected paths, timber houses, market stalls, forge, docks, meaningful NPC schedules and collision footprints.
4. Blacksmith: forge animations, resource recipes, item repair and equipment upgrades; persistent inventory.
5. Trading: transparent resource/coin prices, stock, dialogue, merchant schedules and safe save/load.
6. Knowledge: grounded Viking-age culture, craft, navigation, runes and mythology, distinguishing history from fantasy. Character diary and memories remain bounded in-game data.
7. Art: unified top-down 16-bit Nordic fantasy visual language, restrained palette, readable silhouettes, no floating tools, cohesive biome terrain.
8. Regression gates: syntax, assets, existing save fixture, collision, 10-minute autonomous navigation soak, iPhone/iPad Safari, touch, Xbox controller, camera and performance budgets.

Deliver in reviewable feature slices, preserve existing live game and saves, and publish only verified compatible builds.
