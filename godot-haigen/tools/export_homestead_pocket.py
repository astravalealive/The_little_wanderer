#!/usr/bin/env python3
"""Export the live HTML cottage-area pocket into Godot JSON.

Replicates haigen.html seeded object generation for the inner woodland,
then keeps solids near the cottage after homestead-plot clears.

Does NOT modify haigen.html or save data. Run from repo root or tools/.
"""
from __future__ import annotations

import json
import math
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUT = Path(__file__).resolve().parents[1] / "data" / "homestead_pocket.json"

COTTAGE = {"x": 1500.0, "y": 1500.0}
POCKET_RADIUS = 720.0
POND = {"x": 850.0, "y": 1700.0, "rx": 330.0, "ry": 240.0}


def seeded(n: float) -> float:
    x = math.sin(n * 127.1 + 78.233) * 43758.5453
    return x - math.floor(x)


def solid_radius(obj: dict) -> float:
    v = seeded(obj["id"] * 31 + 13)
    size = obj.get("size", 1.0)
    t = obj["type"]
    if t == "rock":
        return (24 + abs(obj["id"] % 6) * 3.8) * (0.78 + abs(obj["id"] % 6) * 0.12) * size
    if t == "tree":
        return (12 + v * 5) * size
    if t in ("palm", "bareTree"):
        return 13 * size
    if t == "fir":
        return 16 * size
    return 11 * size


def in_pond(x: float, y: float, pad: float = 30.0) -> bool:
    return ((x - POND["x"]) / (POND["rx"] + pad)) ** 2 + (
        (y - POND["y"]) / (POND["ry"] + pad)
    ) ** 2 < 1.0


def build_objects() -> list[dict]:
    """Mirror haigen.html object seeding for the original woodland block."""
    objects: list[dict] = []
    # First 1050 — HTML uses Math.random for size; we use seeded stand-in for export stability.
    for i in range(1050):
        x = 80 + seeded(i * 3) * 2840
        y = 80 + seeded(i * 3 + 1) * 2840
        if math.hypot(x - 1500, y - 1500) < 235:
            continue
        r = seeded(i * 3 + 2)
        typ = "tree" if r < 0.48 else "rock" if r < 0.69 else "bush" if r < 0.88 else "flower"
        size = 0.85 + seeded(i * 7 + 99) * 0.40
        objects.append({"id": i, "x": x, "y": y, "type": typ, "size": size})
    for i in range(1050, 1230):
        x = 80 + seeded(i * 3) * 2840
        y = 80 + seeded(i * 3 + 1) * 2840
        objects.append(
            {
                "id": i,
                "x": x,
                "y": y,
                "type": "mushroom",
                "size": 0.65 + seeded(i * 3 + 2) * 0.5,
            }
        )
    for i in range(1230, 2030):
        x = 80 + seeded(i * 3) * 2840
        y = 80 + seeded(i * 3 + 1) * 2840
        v = seeded(i * 3 + 2)
        typ = (
            "flower"
            if v < 0.42
            else "bush"
            if v < 0.73
            else "mushroom"
            if v < 0.92
            else "tree"
        )
        objects.append({"id": i, "x": x, "y": y, "type": typ, "size": 0.7 + v * 0.5})

    # Pond cull (trees use larger pad in HTML)
    kept: list[dict] = []
    for o in objects:
        pad = 100.0 if o["type"] == "tree" else 30.0
        if in_pond(o["x"], o["y"], pad):
            continue
        kept.append(o)
    objects = kept

    plots = [
        {"kind": "coop", "x": 1215.0, "y": 1395.0, "clear": 125.0},
        {"kind": "woodstore", "x": 1860.0, "y": 1500.0, "clear": 125.0},
        {"kind": "jetty", "x": 1050.0, "y": 1490.0, "clear": 105.0},
        {"kind": "garden", "x": 1625.0, "y": 1170.0, "clear": 205.0},
    ]
    objects = [
        o
        for o in objects
        if not any(math.hypot(o["x"] - p["x"], o["y"] - p["y"]) < p["clear"] for p in plots)
    ]
    return objects


def main() -> int:
    objects = build_objects()
    solids = []
    for o in objects:
        if o["type"] not in ("tree", "rock", "fir", "bareTree", "palm"):
            continue
        if math.hypot(o["x"] - COTTAGE["x"], o["y"] - COTTAGE["y"]) > POCKET_RADIUS:
            continue
        rad = solid_radius(o)
        draw = 136.0 * o["size"]
        if o["type"] == "rock":
            draw = rad * 2.45
        elif o["type"] == "fir":
            draw = 145.0 * o["size"]
        elif o["type"] == "bareTree":
            draw = 114.0 * o["size"]
        art = "tree"
        if o["type"] == "rock":
            art = "rock_a" if o["id"] % 2 == 0 else "rock_b"
        elif o["type"] == "fir":
            art = "fir"
        elif o["type"] == "bareTree":
            art = "bare_a" if o["id"] % 2 == 0 else "bare_b"
        solids.append(
            {
                "id": o["id"],
                "type": o["type"],
                "x": round(o["x"], 2),
                "y": round(o["y"], 2),
                "size": round(o["size"], 4),
                "solid_radius": round(rad, 3),
                "draw_size": round(draw, 2),
                "art": art,
            }
        )

    hx = COTTAGE["x"] + 35
    hy = COTTAGE["y"] - 10
    width, height = 330.0, 310.0
    door_fraction = 0.41  # tier 1
    exterior_door_x = hx + (door_fraction - 0.5) * width
    half_width = width * 0.43
    front = hy + 13
    back = hy - height * 0.78

    data = {
        "source": "haigen.html V432 seeded cottage pocket export",
        "notes": [
            "Object positions/types follow seeded(); first-1050 sizes use seeded stand-in (HTML used Math.random).",
            "campTier assumed 1 for door geometry.",
            "Coordinates are live HTML world space.",
        ],
        "cottage": COTTAGE,
        "spawn": {"x": 1530.0, "y": 1655.0},
        "skolli_spawn": {"x": 1780.0, "y": 1660.0},
        "pocket": {
            "min_x": COTTAGE["x"] - POCKET_RADIUS,
            "max_x": COTTAGE["x"] + POCKET_RADIUS,
            "min_y": COTTAGE["y"] - POCKET_RADIUS,
            "max_y": COTTAGE["y"] + POCKET_RADIUS,
            "radius": POCKET_RADIUS,
        },
        "house": {
            "tier": 1,
            "anchor_x": hx,
            "anchor_y": hy,
            "width": width,
            "height": height,
            "half_width": half_width,
            "front": front,
            "back": back,
            "door_half": 26.0,
            "exterior_door_x": exterior_door_x,
            "interior_door_x": hx,
            "draw_w": 330.0,
            "exterior_asset": "res://assets/approved/house_tier1_exterior.png",
            "interior_asset": "res://assets/approved/house_tier1_interior.png",
        },
        "plots": [
            {
                "kind": "coop",
                "x": 1215.0,
                "y": 1395.0,
                "name": "Chicken Coop",
                "asset": "res://assets/approved/coop.png",
                "draw_w": 180.0,
            },
            {
                "kind": "garden",
                "x": 1625.0,
                "y": 1170.0,
                "name": "Kitchen Garden",
                "asset": "res://assets/approved/garden.png",
                "draw_w": 220.0,
            },
            {
                "kind": "woodstore",
                "x": 1860.0,
                "y": 1500.0,
                "name": "Wood Storage",
                "asset": "",
                "draw_w": 0.0,
            },
            {
                "kind": "jetty",
                "x": 1050.0,
                "y": 1490.0,
                "name": "Fishing Jetty",
                "asset": "",
                "draw_w": 0.0,
            },
        ],
        "pond": POND,
        "first_fire": {"x": 1615.0, "y": 1540.0},
        "solids": solids,
        "palette": {
            "moss": "#3f5a45",
            "leaf": "#6f925c",
            "path": "#a89068",
            "clearing": "#6f925c",
        },
    }

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(data, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {OUT} with {len(solids)} solids")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
