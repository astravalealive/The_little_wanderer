# Operation Little Viking Hero: tonight's execution package
Status: implementation-ready brief, not a claim that gameplay is already implemented.
Target: `haigen.html` on the HTML game track. Godot stays isolated.

## Release order and scope
**Viking A — stability and brain (P0)**: Verify merged #284–#286 on main; 10-minute autonomous wander with trapped-route counters, task timeout and cooldown; manual input always overrides; camera follows only while autonomous; preserve existing saves. Add a regression test that traps Haigen behind a solid object and asserts that he changes goal instead of pacing. Profile iPhone/iPad Safari before and after; no new per-frame expensive searches.

**Viking B — character (P1)**: Use existing Haigen character sprite and proportions as canonical, not a generic cartoon. Produce coherent 4-direction idle/walk/equipment sprites in one Nordic 16-bit fantasy palette. Forest tunic, northern wool/fur outerwear, coastal gear; existing desert and water outfits retained. Tools must attach to hands. No floating tools, abrupt visual scale changes or lost animation frames. Keep sprites on separate assets, with explicit fallback to current sprites if missing.

**Viking C — living settlement (P1)**: Place a small timber village on a verified clear, connected part of the map, preserving roads, collision and biome boundaries. Start with 3 readable buildings: blacksmith forge, trading stall, and a house. Every structure has walkable approach, doorway interaction, visible sign, no path-blocking hitbox. Two NPCs with bounded daytime routines (forge/work/home; trade/open/closed), fallback positions and no unbounded wandering.

**Viking D — forge and economy (P1)**: Forge recipes from existing resource types, using a data table and explicit costs. Start with one upgrade to an existing tool; verify ownership, inventory subtraction, save/load, and prevention of duplicate purchase. Trader sells/buys a small curated set of existing items; show price before confirmation, reject insufficient coins/resources, never silently consume items. NPCs use existing dialogue style and touch/controller interaction.

**Viking E — knowledge and memory (P2)**: Add a curated local Viking-age knowledge table (ships, ironworking, navigation, settlements, Elder vs Younger Futhark chronology), distinguishing historical facts from fantasy. Haigen remembers encountered topics and can explain them in diary text. No remote AI calls, no unapproved repo-writing agent and no arbitrary claims of consciousness.

**Viking F — art polish and release (P2)**: Unify HUD and environment only after resolving the current-main conflicts in #257/#258; selectively port compatible changes, do not force merge. Run syntax, asset, save fixture, autonomous soak, mobile layout, touch and Xbox controller regression. Preview on a non-production branch; only publish green, reviewed changes.

## Non-negotiable acceptance criteria
1. Existing HTML game opens on canonical Pages URL; no blank screen or broken asset paths.
2. Old save loads, survives 2 cycles of save/reload, retains inventory, story, companions and mind; no new save key replacing old key.
3. Autonomous Haigen can travel, recover from 3 blocked-route scenarios, choose a different job after failure, and remain stable for 10 minutes without pacing loops.
4. Player controls override AI immediately; camera returns only when autonomy resumes after idle.
5. iPhone portrait and iPad landscape touch targets and Xbox mapping remain usable.
6. No >10% sustained frame-time regression on representative hardware or unexplained new allocations in the main update loop.
7. Village and equipment art matches existing approved character direction, with no floating hands/tools.
8. Forge/trade inventory changes are atomic and tested for insufficient funds and repeated taps.
9. PRs #257/#258/#280 and old superseded branches are not merged wholesale; cherry-pick only verified compatible parts.
10. Merge and deploy only after all relevant checks pass; report actual commit, test result and verified Pages build.

## Implementation slices for parallel review
- PR Viking-A: deterministic movement/intent regression harness, fixes to verified failures only.
- PR Viking-B: character sprite atlas, outfit state and equipment animation with fallback.
- PR Viking-C: settlement placement, collisions and NPC schedules.
- PR Viking-D: forge/trade data, UI, transactions and save tests.
- PR Viking-E: lore and memory content with fact/fantasy separation.
- PR Viking-F: compatible visual refinements and release validation.

## First code inspection checklist
- Find existing autoTravel, awakeningRoute, independentChoiceTick, autoFreedomTick and mindChooseIntent; extend rather than duplicate.
- Find existing village, forge, traders, currencies, inventory and NPC implementations before adding entities.
- Find the approved sprite atlas and current renderer and verify scale before changing art.
- Find existing CI workflows and save fixtures and add tests to existing harness.
- Keep main playable while each branch is developed; do not mix Godot assets into the HTML runtime.
