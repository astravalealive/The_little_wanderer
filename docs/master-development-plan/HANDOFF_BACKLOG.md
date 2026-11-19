# Handoff backlog — preserved historical design archive

**Source:** Captain handoff compiled 19 Nov 2026 + repo audit same day.  
**Authority:** Ideas here are **preserved**, not auto-approved for implementation. Repo, PR evidence, and Captain decisions override.  
**Live canon:** HTML `haigen.html` on `main` = **V432**. Godot homestead = experiment (`godot-haigen/`, PRs #249–#259).

Status tags used below:
- **LIVE** — present on `main` / playable in HTML
- **PR** — open branch work, not merged
- **PROPOSED** — design only / needs Captain choice
- **SUPERSEDED** — replaced by a later decision; keep for history
- **CONFLICT** — two directions exist; see reconciliation

---

## A. Creative mandate (always)

| Idea | Status |
|------|--------|
| Original Nordic/Scandi LTTP-*calibre* adventure (no Nintendo copies) | LIVE direction |
| Gift / possible App Store ambition ~Jan 2027 | PROPOSED ambition only |
| Quality gate: reject substandard graphics/gameplay/engine/story | LIVE rule |
| Judge by playable visible result, not PR count | LIVE rule |
| No merge/deploy/spend without explicit Captain approval | LIVE rule |

---

## B. Engine / delivery

| Idea | Status |
|------|--------|
| Canonical HTML game + `wandererV127PreviewSave` | LIVE |
| Godot V1 Real Homestead Pocket preview | PR #252 (+ #254/#259 play links) |
| Godot full-world migration | PROPOSED — pending Captain after preview play |
| Stable HTTPS iPad Safari preview | PR #259 session tunnel; durable Pages path needs approval |
| Isolated QA saves; no production overwrite | LIVE rule |

---

## C. Art bible

| Idea | Status |
|------|--------|
| Nordic 16-bit three-quarter top-down grammar | LIVE bible Job 230 + style guide (proposal→lock) |
| Haigen 48×72 / scale 1.67; companion footprints | LIVE metrics |
| Palette moss/leaf/bark/parchment/water; navy night | LIVE / PROPOSED accents |
| Unified density; no collage; no purple fog | LIVE rule |
| Nordic Haigen walk atlas PoC | PR #241 READY |
| Ground lattice soften | PR #248 READY |
| Quiet Nordic HUD | PR #258 READY (supersedes #234) |
| World readability (kill system-font plot spam + shadows) | PR #257 READY |
| Tool poses wrist-parented; no float/noodle arms | PROPOSED Phase 1 A2 |
| Paint pose atlas (still quality-sensitive) | LIVE improved Jobs 227/230; further atlas PROPOSED |
| Fish Nordic sprites + schooling | LIVE Job 228; further polish PROPOSED |
| Full scenery atlas remaster | PROPOSED later Gate |
| KEEP/RESTYLE inventory | LIVE `docs/style-guide-and-asset-inventory.md` |

---

## D. Geography (preserve all; verify coords before build)

| Region / place | Status |
|----------------|--------|
| Homestead / Ancient Woodland clearing | LIVE |
| Garden, coop, storage, jetty plots | LIVE |
| Well of Mimir, runestone, painter cart/easel | LIVE |
| Silent Pond / Great Lake + raft island | LIVE |
| Troll stump home + interior + tunnel/cave | LIVE (verify polish) |
| Riverwatch riverside town (placement disputed) | CONFLICT — verify marked green area |
| Northern Tundra / ice castle / knight patrols | PARTIAL / PROPOSED expand |
| Forgotten Swamps + night spectres | PARTIAL LIVE bosses/modules |
| Desert + Thrummaw | PARTIAL LIVE module |
| South Downs → Saltwick / beach / lighthouse | PARTIAL LIVE skiff rail |
| Ashen Lands + Leshy | PROPOSED (issue/plan archive) |
| Jungle/rainforest islands (separate from desert) | PROPOSED |
| Veiled / fog island + Wayfinder Rune | PROPOSED (`priority-repairs-proposal`) |
| Compact ~3000×3000 vs expanded islands | CONFLICT — save-safe coherent map required |
| Organic rivers/coasts; readable trails | LIVE Jobs 215–233 + more PROPOSED |

---

## E. Characters / companions / NPCs

| Idea | Status |
|------|--------|
| Haigen autonomy + direct control override | LIVE |
| Regional outfits / snorkel / flippers | PARTIAL LIVE outfits art; gates PROPOSED |
| Skölli fox companion (not wolf rewrite) | LIVE — CONFLICT filenames may say wolf |
| Dylan rabbit gatherer | LIVE |
| Nico/Niko mothkeeper mage (verify display name) | LIVE assets `nico-*` |
| Blue Sphynx pest hunter | PR #244 atlas; full behaviour PROPOSED |
| Mimir well / Alfather messages / story ravens | LIVE story hooks; **no raven dev personas** SUPERSEDED |
| Mossroot woodland critter | LIVE/PARTIAL |
| Six stump trolls + hoard | LIVE |
| Villagers with daily routines | PROPOSED Phase 2 |
| Boatwright / Saltwick NPCs | PARTIAL LIVE |
| Painting buyers / economy | LIVE |

---

## F. Wildlife / ecology / enemies

| Idea | Status |
|------|--------|
| Deer, squirrels, birds, butterflies, frogs, lizards | PARTIAL LIVE |
| Ducks/ducklings; ospreys on specified island | CONFLICT reconciled: ospreys replace ducks **on that island only** |
| Chickens, eggs, cockerel; rats; Blue hunts | PARTIAL LIVE |
| Schooling fish with species | LIVE Job 228 |
| Day rhythms for wildlife | PARTIAL / PROPOSED deepen |
| Wolves, boars, snakes, scorpions, swamp spectres | PARTIAL LIVE |
| Greyfang | LIVE art/role — verify |
| Fog-isle enemy archetypes | PROPOSED |
| Fair telegraphs, knockback, real-time (no turn-based forest boss) | LIVE rule for Gloamjaw |

---

## G. Bosses (usable rewards required)

| Boss | Status |
|------|--------|
| Gloamjaw (forest) | LIVE |
| Thrummaw (desert) | LIVE module |
| Krakkle / swamp dual | LIVE modules |
| Leshy → Leshy Outfit camouflage | PROPOSED |
| Northern castle boss | PROPOSED |
| Veiled Isle Mirrorkeel (name pending) → Wayfinder Rune | PROPOSED |
| Every boss drops meaningful utility | LIVE design rule |

---

## H. Boats / water

| Idea | Status |
|------|--------|
| Raft → skiff → longship progression | PARTIAL LIVE; longship stub |
| Walk-on / walk-off boarding | PROPOSED quality fix vs prompts |
| 4-direction hull + oar + wake | PARTIAL / PROPOSED polish |
| Natural shore for raft; jetty for sea craft | LIVE plots + PROPOSED placement |
| Shallow splash; deep needs snorkel; flippers via frog quest | PARTIAL LIVE |
| Fishing coherent with schools | PARTIAL |

---

## I. Survival / AI / time / story

| Idea | Status |
|------|--------|
| Health, hunger, fatigue, fun/mood, poison, Skölli HP, mana | PARTIAL LIVE |
| Day/night historically 10+10 min; torch; fireflies | PARTIAL LIVE |
| Climate clothing (tundra/desert) | PROPOSED / PARTIAL outfits |
| Autonomy + diary + Alfather/Mimir messages | PARTIAL LIVE |
| Talk to Haigen (context dialogue) | PARTIAL LIVE |
| Offline catch-up ≤72h, no unfair deaths | PROPOSED |
| Chapter II story framework (Beacon/Veiled Isle) | PROPOSED |
| Mycology + runestone ᚲᚾᛟᚹᛚᛖᛞᚷᛖ research | PARTIAL LIVE |
| Skölli as runestone guardian | PARTIAL LIVE |

---

## J. Building / crafting / UI

| Idea | Status |
|------|--------|
| Homestead tiers hut→cabin→castle | PARTIAL LIVE tiers |
| Tools axe/pick/shovel/torch/rod/net/bow + animations | PARTIAL LIVE |
| Garden crops; movable buildings, non-deletable buildings | PARTIAL LIVE editor rules |
| Quiet Nordic HUD / safe areas / gamepad map | PR #258 + LIVE V426 |
| Camera homestead centre; stick pan; no bad map zoom | PARTIAL LIVE |

---

## K. Known quality debts (fix, don’t repeat)

Mismatched densities · paint pose · fish · raft sideways · boxy terrain · floating tools · HUD overlap · dead tunnels · tiny PR spam · disputed Riverwatch placement · camera phone/iPad drift · PR≠deploy confusion · spend before proof · unverified claims.

---

## L. Reconciliation table (conflicts)

| Conflict | Decision for roadmap |
|----------|----------------------|
| Ducks vs ospreys | Ospreys on specified island; keep ducks elsewhere unless Captain says otherwise |
| Skölli fox vs wolf filenames | Keep fox canon; don’t mass-rename lore without approval |
| Pixel art vs filter | Unified authored pixels; no global filter |
| 3000² vs huge islands | Coherent map + save migration; no silent overwrite |
| Story ravens vs raven agents | Story OK; no raven *dev team* personas |
| HTML vs Godot | Godot is **preview experiment** until Captain chooses |
| Auto-merge history vs approval | **No merge/deploy without explicit yes** |
| Full-game job vs one-day preview | Preview first; roadmap second; no unlimited spend |
| “Tests passed” vs “looks good” | Separate statuses: tested ≠ visually accepted ≠ merged ≠ deployed |
