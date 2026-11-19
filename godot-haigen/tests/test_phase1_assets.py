#!/usr/bin/env python3
"""Phase 1: required original assets and scene files exist."""
from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

REQUIRED = [
    "assets/source/haigen-reference-walk-atlas.webp",
    "assets/source/skolli_walk_sheet.png",
    "assets/source/house-tier-1-clean.png",
    "assets/source/haigen-trails.webp",
    "assets/source/raven.png",
    "assets/source/env/tree.png",
    "scenes/world/woodlands_yard.tscn",
    "scenes/world/house_interior.tscn",
    "scenes/world/grove_path.tscn",
    "scripts/autoload/map_router.gd",
    "project.godot",
]


def main() -> int:
    missing = [p for p in REQUIRED if not (ROOT / p).is_file()]
    if missing:
        print("FAIL missing:", *missing, sep="\n  ", file=sys.stderr)
        return 1
    # Ensure main scene points at the real yard, not a placeholder.
    proj = (ROOT / "project.godot").read_text(encoding="utf-8")
    if "woodlands_yard.tscn" not in proj:
        print("FAIL: main scene is not woodlands_yard", file=sys.stderr)
        return 1
    if "wandererV127PreviewSave" in proj:
        print("FAIL: Godot project must not reference HTML save key", file=sys.stderr)
        return 1
    print("OK: Phase 1 assets and scenes present")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
