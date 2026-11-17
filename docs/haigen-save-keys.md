# Haigen's World — live save keys

Canonical game: `haigen.html`.

## Live write targets (dual-write)

| Key | Role |
|---|---|
| `haigenWorldSave` | **Canonical live save key** (preferred read, always written) |
| `wandererV127PreviewSave` | Legacy live key kept in sync by dual-write so older tooling and existing installs keep working |

Autosave (`save()` every 5s + `pagehide`) writes the same JSON payload to **both** keys. Reset / “New preview” clears **only** these two live targets.

## Read order (dual-read)

1. `haigenWorldSave`
2. `wandererV127PreviewSave` (legacy live)
3. Fallbacks, first hit wins: `wandererV126PreviewSave` → `wandererV125PreviewSave` → `wandererV121PreviewSave` → `wandererTestSave`

`?restore=1` skips the two live keys and imports from the fallback chain only (historic “Use my V120 save” path).

## Schema stamp

Saves include additive `saveVersion` (currently `1`). Missing/older values are normalised on load; gameplay fields stay additive and backward-compatible.

## Safety

- Never wipe arbitrary `wanderer*` keys.
- Older fallback keys are read-only migration sources unless a player explicitly imports them.
- Runtime probe for tests/support: `window.__haigenSaveKeys` and `window.__haigenSaveQA()`.
