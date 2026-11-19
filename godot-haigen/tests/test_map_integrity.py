#!/usr/bin/env python3
"""Validate exported homestead pocket JSON against HTML contracts."""
from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
POCKET = ROOT / "data" / "homestead_pocket.json"
APPROVED = ROOT / "assets" / "approved"


def main() -> int:
    if not POCKET.exists():
        print(f"FAIL: missing {POCKET}", file=sys.stderr)
        return 1
    data = json.loads(POCKET.read_text(encoding="utf-8"))
    cottage = data.get("cottage") or {}
    if cottage.get("x") != 1500 or cottage.get("y") != 1500:
        print(f"FAIL: cottage {cottage} != (1500,1500)", file=sys.stderr)
        return 1
    house = data.get("house") or {}
    for key in ("exterior_door_x", "front", "back", "door_half", "anchor_x"):
        if key not in house:
            print(f"FAIL: house missing {key}", file=sys.stderr)
            return 1
    roads = data.get("road_routes") or []
    if len(roads) < 1:
        print("FAIL: missing road_routes from HTML roadRoutes", file=sys.stderr)
        return 1
    widths = data.get("road_widths") or []
    if len(widths) != len(roads):
        print(
            f"FAIL: road_widths ({len(widths)}) must match road_routes ({len(roads)})",
            file=sys.stderr,
        )
        return 1
    pond = data.get("pond") or {}
    if pond.get("x") != 850 or pond.get("y") != 1700:
        print(f"FAIL: pond centre {pond} != (850,1700)", file=sys.stderr)
        return 1
    solids = data.get("solids") or []
    if len(solids) < 8:
        print(f"FAIL: too few solids ({len(solids)})", file=sys.stderr)
        return 1
    for s in solids:
        if "solid_radius" not in s or "art" not in s:
            print(f"FAIL: solid incomplete {s.get('id')}", file=sys.stderr)
            return 1
    required = [
        "haigen_walk.png",
        "skolli_adult.png",
        "house_tier1_exterior.png",
        "house_tier1_interior.png",
        "haigen_trails.webp",
        "tree.png",
        "rock_a.png",
    ]
    for name in required:
        path = APPROVED / name
        if not path.exists() or path.stat().st_size < 500:
            print(f"FAIL: approved asset missing/small {path}", file=sys.stderr)
            return 1
    # Trails must match HTML 2600² contract (drawn to 7800 world).
    try:
        import struct

        # Minimal RIFF/WEBP size probe via file size; full decode in Godot.
        trails = APPROVED / "haigen_trails.webp"
        if trails.stat().st_size < 50_000:
            print("FAIL: haigen_trails.webp unexpectedly small", file=sys.stderr)
            return 1
        _ = struct
    except OSError as exc:
        print(f"FAIL: trails check {exc}", file=sys.stderr)
        return 1
    # Placeholder programmer art must not be the runtime character sheets.
    old_haigen = ROOT / "assets" / "characters" / "haigen_walk.png"
    if old_haigen.exists() and old_haigen.stat().st_size < 5000:
        # Still present as leftover from V0 — ensure approved sheet is larger.
        if (APPROVED / "haigen_walk.png").stat().st_size <= old_haigen.stat().st_size:
            print("FAIL: approved Haigen sheet not larger than placeholder", file=sys.stderr)
            return 1
    # Competing PR #250 world scenes must not ship beside this consolidation.
    competing = [
        ROOT / "scenes" / "world" / "woodlands_yard.tscn",
        ROOT / "scenes" / "world" / "grove_path.tscn",
    ]
    for path in competing:
        if path.exists():
            print(f"FAIL: competing Godot map present {path}", file=sys.stderr)
            return 1
    print(
        f"OK: pocket solids={len(solids)} roads={len(roads)} "
        f"door_x={house['exterior_door_x']} front={house['front']} "
        f"trails+approved assets present"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
