# Haigen Homestead Prototype (Godot 4.4)

Parallel **V0 movement slice** for Haigen’s World. Isolated from the live HTML game under `haigen.html`.

- **Engine:** Godot 4.4.1 (pin 4.4.x)
- **Language:** GDScript
- **Scope:** Haigen, Skölli, terrain/paths/trees, hare + songbird, pixel camera, collisions, touch stick
- **Not in V0:** Dylan, boats, inventory, crafting, bosses, Pages deploy of this folder

## Play (desktop)

1. Install [Godot 4.4.1](https://godotengine.org/download/archive/4.4.1-stable/) (standard, not .NET).
2. Open `godot-haigen/` as the project folder (or import `project.godot`).
3. Press **F5** / Play.
4. Move with **WASD** or **arrow keys**, or drag the **on-screen stick** (bottom-left).

### Headless smoke (CI / agents)

```bash
godot --headless --path godot-haigen --quit-after 2
# or
./tools/smoke_boot.sh /path/to/Godot_v4.4.1-stable_linux.x86_64
```

### Linux one-liner (if Godot binary is available)

```bash
Godot_v4.4.1-stable_linux.x86_64 --path godot-haigen
```

## iPad landscape

Required **before V0 acceptance** (see `docs/ACCEPTANCE.md`). Desktop validation is the gate for this PR only.

## Style

See `docs/STYLE_LOCK.md`. Art is temporary Nordic placeholder pixel work; ALTTP is a readability benchmark only.

## Isolation

Do **not** modify HTML game files, approved atlases used by Pages, or save schemas from this prototype. GitHub Pages continues to serve `haigen.html` only as the live game.
