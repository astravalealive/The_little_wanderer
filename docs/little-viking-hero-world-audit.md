# Little Viking Hero: world conversion inventory (working audit)
Historical baseline: Viking Age c. AD 800–1050. Norse myth and established fantasy lore are explicit exceptions.
Preserve existing save schema and player-owned resources until tested replacements are ready.

| Existing concept | Decision | Replacement / safeguard |
|---|---|---|
| Snorkel / modern flippers | REPLACE | Enchanted water-breathing charm, rune blessing, or frog-granted ability; retain swimming progression and old save flags |
| Castle final homestead upgrade | REPLACE | Norse great hall / fortified timber settlement; map old upgrade tier |
| Painting sales and easel | REPLACE | Decorated shields, carved wood, painted boards and craft stall; retain existing currency and ownership |
| Generic modern tools | AUDIT / REPLACE | Iron axe, adze, seax, shovel, pick, fishing net, bow and other period-informed tools |
| Modern-looking clothing | REPLACE | Wool/linen tunic, trousers, belt, cloak, leather footwear; seasonal equipment |
| Village architecture | REPLACE | Timber longhouses, turf roofs, forge, market and farmstead |
| Motorised/modern transport | REMOVE if present | Rowboats, clinker-built ships, carts and horses |
| Modern HUD/touch/gamepad | KEEP | Player-facing interface is outside the fiction |
| Haigen, Skolli, Dylan, Niko, Blue | KEEP | Redraw costumes/props where necessary |
| Trolls, gods, runes, magical creatures | MYTHOLOGICAL EXCEPTION | Maintain cohesive Norse-inspired fantasy presentation |
| Biomes, quests, save data, economy | KEEP / ADAPT | No deletion or reset without migration and explicit approval |

## Village design
A reachable village linked to the woodlands by a collision-safe road; blacksmith, clothier, market, longhouse, housing and routines. Shop prices must reference the existing currency field, not create duplicate balances. Forge catalogue: seax, bearded axe, round shield, spear, sword, iron tools. Clothes: tunic, cloak, shoes, belt, winter layers. Transactions must be atomic, persist through save/load and not allow negative balances.

## Acceptance
- Record exact assets and references before removing anything.
- Test old saves, world collision, NPC routines, economy, mobile controls, frame rate and camera.
- Do not conflate fictional game knowledge with real sentience.
- No merge or deployment without explicit approval.
