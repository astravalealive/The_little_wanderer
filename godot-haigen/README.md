# Haigen Homestead V1 (Godot 4.4) — real cottage pocket

Parallel slice for Haigen’s World. **Isolated** from the live HTML game (`haigen.html`).

- **Engine:** Godot 4.4.1
- **Data:** `data/homestead_pocket.json` exported from live HTML seeding (cottage `1500,1500`)
- **Art:** approved Haigen walk atlas, Skölli adult atlas, woodland scenery, house tier-1 + L1 interior
- **Play:** move with WASD / stick; walk **up** into the cottage door; walk **down** to exit

## Regenerate pocket JSON (does not edit HTML)

```bash
python3 godot-haigen/tools/export_homestead_pocket.py
python3 godot-haigen/tests/test_map_integrity.py
```

## Play (desktop)

1. Install Godot 4.4.1 (standard).
2. Open `godot-haigen/` → F5.

## Automated checks

```bash
python3 godot-haigen/tests/test_map_integrity.py
Godot_v4.4.1-stable_linux.x86_64 --headless --import --path godot-haigen
xvfb-run -a -s '-screen 0 1024x768x24' \
  Godot_v4.4.1-stable_linux.x86_64 --path godot-haigen --resolution 1024x768 \
  --audio-driver Dummy res://tools/ipad_landscape_validate.tscn
```

Evidence lands in `docs/evidence/`. See `docs/VISUAL_MISMATCHES.md` and `docs/COMPONENTS.md`.

## Temporary web preview (iPhone / iPad Safari)

Single-threaded export in `godot-haigen/web-preview/` (no SharedArrayBuffer). **Not** GitHub Pages.

```bash
cd godot-haigen/web-preview && python3 -m http.server 8766 --bind 127.0.0.1
# open http://127.0.0.1:8766/
```

A temporary Cloudflare quick tunnel may be posted on the PR for device playtests; it dies when the agent VM stops.

## Isolation

Do **not** modify HTML game files, approved atlases used by Pages, or save schemas from this prototype.
