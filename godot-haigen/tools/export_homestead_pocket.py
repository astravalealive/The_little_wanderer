#!/usr/bin/env python3
"""Export the live HTML cottage-area pocket into Godot JSON.

Replicates haigen.html seeded object generation, homestead clears, V385 tree
thinning (road clearance + spacing), and roadRoutes for the pocket.

Does NOT modify haigen.html or save data.
"""
from __future__ import annotations

import json
import math
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUT = Path(__file__).resolve().parents[1] / "data" / "homestead_pocket.json"

COTTAGE = {"x": 1500.0, "y": 1500.0}
POCKET_RADIUS = 720.0
SAFE_RADIUS = 355.0
POND = {"x": 850.0, "y": 1700.0, "rx": 330.0, "ry": 240.0}

# From haigen.html roadWidths (index-aligned with full ROAD_ROUTES below).
ROAD_WIDTHS = [62, 42, 47, 36, 44, 39, 34, 30, 34, 41, 33, 36, 32, 35, 30]

# From haigen.html roadRoutes (Job 233 heartland routes included).
ROAD_ROUTES = [
    [
        {"x": 70, "y": 980},
        {"x": 440, "y": 1040},
        {"x": 760, "y": 1140},
        {"x": 1050, "y": 1100},
        {"x": 1350, "y": 980},
        {"x": 1650, "y": 1030},
        {"x": 1880, "y": 850},
        {"x": 2170, "y": 820},
        {"x": 2570, "y": 730},
        {"x": 2910, "y": 650},
        {"x": 3230, "y": 730},
        {"x": 3510, "y": 970},
        {"x": 3810, "y": 1160},
        {"x": 4130, "y": 1300},
    ],
    [{"x": 1650, "y": 1030}, {"x": 1570, "y": 790}, {"x": 1540, "y": 480}],
    [
        {"x": 1930, "y": 1200},
        {"x": 2200, "y": 1300},
        {"x": 2470, "y": 1280},
        {"x": 2730, "y": 1490},
        {"x": 2890, "y": 1780},
        {"x": 3200, "y": 2020},
        {"x": 3500, "y": 2220},
        {"x": 3780, "y": 2510},
        {"x": 4130, "y": 2740},
    ],
    [{"x": 1880, "y": 850}, {"x": 1930, "y": 1200}],
    [
        {"x": 2200, "y": 1300},
        {"x": 2140, "y": 1630},
        {"x": 2030, "y": 1950},
        {"x": 2100, "y": 2420},
        {"x": 2320, "y": 2760},
        {"x": 2560, "y": 3060},
        {"x": 2930, "y": 3280},
        {"x": 3300, "y": 3500},
        {"x": 3670, "y": 3790},
        {"x": 4130, "y": 4030},
    ],
    [{"x": 1050, "y": 1100}, {"x": 750, "y": 820}, {"x": 450, "y": 500}, {"x": 160, "y": 180}],
    [
        {"x": 1350, "y": 980},
        {"x": 1190, "y": 1220},
        {"x": 1120, "y": 1370},
        {"x": 1050, "y": 1450},
        {"x": 920, "y": 1580},
        {"x": 850, "y": 1700},
    ],
    [{"x": 1350, "y": 980}, {"x": 1390, "y": 1180}, {"x": 1470, "y": 1360}, {"x": 1500, "y": 1500}],
    # Job 233: cottage → Silent Pond / Great Lake shore
    [
        {"x": 1500, "y": 1500},
        {"x": 1320, "y": 1580},
        {"x": 1100, "y": 1650},
        {"x": 900, "y": 1720},
        {"x": 850, "y": 1700},
    ],
    [
        {"x": 2100, "y": 2420},
        {"x": 1760, "y": 2860},
        {"x": 1420, "y": 3270},
        {"x": 1050, "y": 3630},
        {"x": 680, "y": 4130},
    ],
    [{"x": 3500, "y": 2220}, {"x": 3520, "y": 2710}, {"x": 3300, "y": 3500}],
]


def seeded(n: float) -> float:
    x = math.sin(n * 127.1 + 78.233) * 43758.5453
    return x - math.floor(x)


def road_distance(x: float, y: float) -> float:
    best = float("inf")
    for route in ROAD_ROUTES:
        for i in range(1, len(route)):
            a, b = route[i - 1], route[i]
            dx, dy = b["x"] - a["x"], b["y"] - a["y"]
            denom = dx * dx + dy * dy
            t = 0.0 if denom == 0 else max(0.0, min(1.0, ((x - a["x"]) * dx + (y - a["y"]) * dy) / denom))
            best = min(best, math.hypot(x - a["x"] - t * dx, y - a["y"] - t * dy))
    return best


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


def thin_trees_v385(objects: list[dict]) -> list[dict]:
    """Mirror haigen.html V385 tree survivor pass (woodland defaults)."""
    tree_types = {"tree", "fir", "palm", "bareTree"}
    selected = sorted([o for o in objects if o["type"] in tree_types], key=lambda o: o["id"])
    survivors: list[dict] = []
    spatial: dict[str, list[dict]] = {}
    cell = 220.0

    def nearby(o: dict, min_gap: float) -> bool:
        cx, cy = int(o["x"] // cell), int(o["y"] // cell)
        for dx in (-1, 0, 1):
            for dy in (-1, 0, 1):
                for p in spatial.get(f"{cx + dx},{cy + dy}", []):
                    if math.hypot(o["x"] - p["x"], o["y"] - p["y"]) < min_gap:
                        return True
        return False

    for o in selected:
        woodland = 0 <= o["x"] < 3500 and 0 <= o["y"] < 3100
        spacing = 174.0 if woodland else 165.0
        road_clearance = 115.0 if woodland else 105.0
        if road_distance(o["x"], o["y"]) < road_clearance:
            continue
        if math.hypot(o["x"] - COTTAGE["x"], o["y"] - COTTAGE["y"]) < SAFE_RADIUS + 110:
            continue
        if seeded(o["id"] * 83 + 385) < 0.34:
            continue
        if nearby(o, spacing):
            continue
        o = dict(o)
        o["size"] = (o.get("size") or 1.0) * (1.78 if woodland else 1.72)
        survivors.append(o)
        key = f"{int(o['x'] // cell)},{int(o['y'] // cell)}"
        spatial.setdefault(key, []).append(o)

    keep_ids = {o["id"] for o in survivors}
    out: list[dict] = []
    survivor_by_id = {o["id"]: o for o in survivors}
    for o in objects:
        if o["type"] in tree_types:
            if o["id"] in keep_ids:
                out.append(survivor_by_id[o["id"]])
            continue
        out.append(o)
    return out


def build_objects() -> list[dict]:
    objects: list[dict] = []
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
            {"id": i, "x": x, "y": y, "type": "mushroom", "size": 0.65 + seeded(i * 3 + 2) * 0.5}
        )
    for i in range(1230, 2030):
        x = 80 + seeded(i * 3) * 2840
        y = 80 + seeded(i * 3 + 1) * 2840
        v = seeded(i * 3 + 2)
        typ = "flower" if v < 0.42 else "bush" if v < 0.73 else "mushroom" if v < 0.92 else "tree"
        objects.append({"id": i, "x": x, "y": y, "type": typ, "size": 0.7 + v * 0.5})

    objects = [
        o
        for o in objects
        if not in_pond(o["x"], o["y"], 100.0 if o["type"] == "tree" else 30.0)
    ]
    plots = [
        {"x": 1215.0, "y": 1395.0, "clear": 125.0},
        {"x": 1860.0, "y": 1500.0, "clear": 125.0},
        {"x": 1050.0, "y": 1490.0, "clear": 105.0},
        {"x": 1625.0, "y": 1170.0, "clear": 205.0},
    ]
    objects = [
        o
        for o in objects
        if not any(math.hypot(o["x"] - p["x"], o["y"] - p["y"]) < p["clear"] for p in plots)
    ]
    return thin_trees_v385(objects)


def pocket_roads() -> tuple[list[list[dict]], list[float]]:
    """Keep route segments that intersect the cottage pocket + matching widths."""
    clipped: list[list[dict]] = []
    widths: list[float] = []
    for ri, route in enumerate(ROAD_ROUTES):
        pts = [
            p
            for p in route
            if math.hypot(p["x"] - COTTAGE["x"], p["y"] - COTTAGE["y"]) <= POCKET_RADIUS + 80
        ]
        # Also keep a point if any segment midpoint is inside.
        keep_idx = set()
        for i, p in enumerate(route):
            if math.hypot(p["x"] - COTTAGE["x"], p["y"] - COTTAGE["y"]) <= POCKET_RADIUS + 120:
                keep_idx.add(i)
            if i > 0:
                mx = (route[i - 1]["x"] + p["x"]) * 0.5
                my = (route[i - 1]["y"] + p["y"]) * 0.5
                if math.hypot(mx - COTTAGE["x"], my - COTTAGE["y"]) <= POCKET_RADIUS + 80:
                    keep_idx.add(i - 1)
                    keep_idx.add(i)
        width = float(ROAD_WIDTHS[ri]) if ri < len(ROAD_WIDTHS) else 34.0
        if len(keep_idx) >= 2:
            ordered = [route[i] for i in sorted(keep_idx)]
            clipped.append(ordered)
            widths.append(width)
        elif pts and len(pts) >= 2:
            clipped.append(pts)
            widths.append(width)
    return clipped, widths


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
    door_fraction = 0.41
    exterior_door_x = hx + (door_fraction - 0.5) * width
    half_width = width * 0.43
    front = hy + 13
    back = hy - height * 0.78
    roads, road_widths = pocket_roads()

    data = {
        "source": "haigen.html V432 seeded cottage pocket export",
        "notes": [
            "Object positions/types follow seeded(); first-1050 sizes use seeded stand-in (HTML used Math.random).",
            "Trees thinned with V385 road clearance + spacing; sizes boosted like live HTML.",
            "road_routes clipped from live roadRoutes including Job 233 cottage→lake path.",
            "road_widths paired with clipped routes from live roadWidths.",
            "campTier assumed 1 for door geometry.",
            "Coordinates are live HTML world space.",
            "Ground uses approved haigen-trails.webp crop (7800 world / 2600 tex) + soil glaze.",
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
        "road_routes": roads,
        "road_widths": road_widths,
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
    print(f"Wrote {OUT} with {len(solids)} solids and {len(roads)} road routes")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
