# Living Companions System (V436)

Skölli protects. Dylan discovers. Blue hunts.

## Status

Builds on Blue Sphynx atlas (**V435 / PR #244**). Separate reviewable PR. **Do not merge without Captain approval.**

## Design

| Companion | Role | Travel focus | Camp focus |
|-----------|------|--------------|------------|
| Skölli | Guardian | Defend Haigen from large predators | Patrol / watch / rest near ruins & camp |
| Dylan | Forager | Soft leash + bounded daily finds | Forage / sniff / rest near cottage |
| Blue | Shadow Hunter | Small-prey stalk, flee large threats | Fire loaf, building patrol, pest pounce |

**One travelling companion** at a time (`state.travelCompanion`: `dylan` | `skolli` | `blue` | `null`).

Speak with X near a companion → **Come with me / Stay here / Share a berry / Never mind**.

## Save (additive)

- `travelCompanion`
- `companionTrust` `{skolli, heri, blue}`
- `campHome` per companion
- `companionDayGather` / `companionGatherDay` (Dylan find cap)
- Key remains `wandererV127PreviewSave`
- Existing `friends.*` berry meters unchanged

## Boat safety

While `skiffAtSea` or `raftAfloat`, companions park at camp homes (no channel stranding).

## Call button

Calls the **current traveller** only. If alone, prompts to invite someone at camp.
