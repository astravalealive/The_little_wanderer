#!/usr/bin/env python3
"""Pack Viking Haigen generated sheets into engine-ready atlases.

Engine contract (haigen.html drawApprovedHaigen):
  - Walk / outfit kit: 192×288, 4×4 grid of 48×72 cells
  - Rows: 0=down, 1=up, 2=right, 3=left
  - Cols: 4 walk frames (col0 idle)
  - Region stack: 192 × (7×288) order snow,beach,desert,swim,downs,fen,wasteland
  - Tool sprites (optional): 40×60

Does not overwrite approved live atlases; writes under assets/viking-haigen/packed/.
"""
from __future__ import annotations

import argparse
import json
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
RAW = ROOT / "assets/viking-haigen/raw"
PACKED = ROOT / "assets/viking-haigen/packed"
REFS = ROOT / "assets/viking-haigen/refs"

CELL_W, CELL_H = 48, 72
SHEET_W, SHEET_H = 192, 288
TARGET_OPAQUE_W = 42
FOOT_PAD = 2
TRAVEL_KITS = ["snow", "beach", "desert", "swim", "downs", "fen", "wasteland"]
EXPR_NAMES = [
    "determined",
    "happy",
    "surprised",
    "serious",
    "stern",
    "sad",
    "excited",
    "focused",
    "shy",
]
ITEM_NAMES = [
    "sword",
    "axe",
    "pickaxe",
    "shovel",
    "spear",
    "warhammer",
    "seax",
    "bow",
    "slingshot",
    "rod",
    "net",
    "torch",
    "lantern",
    "rune_staff",
    "round_shield",
    "kite_shield",
    "drinking_horn",
    "flute",
]
ACTION_NAMES = ["sword", "axe", "pickaxe", "shovel", "net", "rod"]


def whitish(r: int, g: int, b: int, thresh: int = 238) -> bool:
    return r >= thresh and g >= thresh and b >= thresh and abs(r - g) < 18 and abs(g - b) < 18


def make_transparent(im: Image.Image, thresh: int = 238) -> Image.Image:
    im = im.convert("RGBA")
    px = im.load()
    w, h = im.size
    # Corner flood fill for sheet backgrounds
    visited = [[False] * w for _ in range(h)]
    stack = [(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1)]
    for x, y in stack:
        if 0 <= x < w and 0 <= y < h:
            visited[y][x] = False
    while stack:
        x, y = stack.pop()
        if x < 0 or y < 0 or x >= w or y >= h or visited[y][x]:
            continue
        r, g, b, a = px[x, y]
        if a < 8 or not whitish(r, g, b, thresh):
            continue
        visited[y][x] = True
        px[x, y] = (0, 0, 0, 0)
        stack.extend([(x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)])
    # Also clear residual near-white speckles that are not enclosed silhouette
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a > 0 and whitish(r, g, b, 250):
                # only clear if mostly surrounded by transparent/white
                neigh = 0
                clear = 0
                for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    nx, ny = x + dx, y + dy
                    if 0 <= nx < w and 0 <= ny < h:
                        neigh += 1
                        nr, ng, nb, na = px[nx, ny]
                        if na < 8 or whitish(nr, ng, nb, 245):
                            clear += 1
                if neigh and clear >= neigh:
                    px[x, y] = (0, 0, 0, 0)
    return im


def content_bbox(im: Image.Image, alpha: int = 20):
    px = im.load()
    w, h = im.size
    minx, miny, maxx, maxy = w, h, -1, -1
    for y in range(h):
        for x in range(w):
            if px[x, y][3] > alpha:
                minx = min(minx, x)
                miny = min(miny, y)
                maxx = max(maxx, x)
                maxy = max(maxy, y)
    if maxx < 0:
        return None
    return (minx, miny, maxx + 1, maxy + 1)


def fit_to_cell(
    src: Image.Image,
    cell_w: int = CELL_W,
    cell_h: int = CELL_H,
    target_w: int = TARGET_OPAQUE_W,
    foot_pad: int = FOOT_PAD,
) -> Image.Image:
    src = make_transparent(src)
    bb = content_bbox(src)
    cell = Image.new("RGBA", (cell_w, cell_h), (0, 0, 0, 0))
    if not bb:
        return cell
    cropped = src.crop(bb)
    cw, ch = cropped.size
    max_h = cell_h - foot_pad - 1
    scale = min(target_w / cw, max_h / ch)
    nw = max(1, int(round(cw * scale)))
    nh = max(1, int(round(ch * scale)))
    resized = cropped.resize((nw, nh), Image.Resampling.LANCZOS)
    x = (cell_w - nw) // 2
    y = cell_h - foot_pad - nh
    cell.paste(resized, (x, y), resized)
    return cell


def split_grid(im: Image.Image, cols: int, rows: int) -> list[list[Image.Image]]:
    w, h = im.size
    cw, rh = w // cols, h // rows
    grid = []
    for r in range(rows):
        row = []
        for c in range(cols):
            row.append(im.crop((c * cw, r * rh, (c + 1) * cw, (r + 1) * rh)))
        grid.append(row)
    return grid


def pack_walk_grid(src_path: Path, out_path: Path) -> dict:
    im = Image.open(src_path).convert("RGBA")
    grid = split_grid(im, 4, 4)
    sheet = Image.new("RGBA", (SHEET_W, SHEET_H), (0, 0, 0, 0))
    stats = {"source": str(src_path.name), "cells": []}
    for r in range(4):
        for c in range(4):
            cell = fit_to_cell(grid[r][c])
            sheet.paste(cell, (c * CELL_W, r * CELL_H), cell)
            opaque = sum(
                1
                for x in range(CELL_W)
                if any(cell.getpixel((x, y))[3] > 16 for y in range(CELL_H))
            )
            stats["cells"].append({"r": r, "c": c, "opaque_w": opaque})
    out_path.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(out_path)
    # also webp
    sheet.save(out_path.with_suffix(".webp"), "WEBP", lossless=True)
    return stats


def pack_expressions(src_path: Path, out_dir: Path) -> Path:
    im = Image.open(src_path).convert("RGBA")
    grid = split_grid(im, 3, 3)
    cell = 96
    sheet = Image.new("RGBA", (cell * 3, cell * 3), (0, 0, 0, 0))
    out_dir.mkdir(parents=True, exist_ok=True)
    for r in range(3):
        for c in range(3):
            idx = r * 3 + c
            bust = make_transparent(grid[r][c])
            bb = content_bbox(bust)
            tile = Image.new("RGBA", (cell, cell), (0, 0, 0, 0))
            if bb:
                cropped = bust.crop(bb)
                scale = min((cell - 8) / cropped.size[0], (cell - 8) / cropped.size[1])
                nw = max(1, int(cropped.size[0] * scale))
                nh = max(1, int(cropped.size[1] * scale))
                resized = cropped.resize((nw, nh), Image.Resampling.LANCZOS)
                tile.paste(resized, ((cell - nw) // 2, (cell - nh) // 2), resized)
            name = EXPR_NAMES[idx]
            tile.save(out_dir / f"expr-{idx:02d}-{name}.png")
            sheet.paste(tile, (c * cell, r * cell), tile)
    out = out_dir.parent / "haigen-viking-expressions.png"
    sheet.save(out)
    sheet.save(out.with_suffix(".webp"), "WEBP", lossless=True)
    return out


def pack_items(src_path: Path, out_dir: Path) -> Path:
    im = Image.open(src_path).convert("RGBA")
    grid = split_grid(im, 6, 3)
    icon = 40
    sheet = Image.new("RGBA", (icon * 6, icon * 3), (0, 0, 0, 0))
    tools = Image.new("RGBA", (40 * 6, 60), (0, 0, 0, 0))  # first 6 as 40x60 tools row
    out_dir.mkdir(parents=True, exist_ok=True)
    for r in range(3):
        for c in range(6):
            idx = r * 6 + c
            name = ITEM_NAMES[idx]
            src = make_transparent(grid[r][c])
            bb = content_bbox(src)
            tile = Image.new("RGBA", (icon, icon), (0, 0, 0, 0))
            tool = Image.new("RGBA", (40, 60), (0, 0, 0, 0))
            if bb:
                cropped = src.crop(bb)
                # icon
                scale = min((icon - 4) / cropped.size[0], (icon - 4) / cropped.size[1])
                nw = max(1, int(cropped.size[0] * scale))
                nh = max(1, int(cropped.size[1] * scale))
                resized = cropped.resize((nw, nh), Image.Resampling.LANCZOS)
                tile.paste(resized, ((icon - nw) // 2, (icon - nh) // 2), resized)
                # tool cell 40x60, grip near bottom-center
                tscale = min(32 / cropped.size[0], 48 / cropped.size[1])
                tw = max(1, int(cropped.size[0] * tscale))
                th = max(1, int(cropped.size[1] * tscale))
                tresized = cropped.resize((tw, th), Image.Resampling.LANCZOS)
                tool.paste(tresized, ((40 - tw) // 2, 60 - 8 - th), tresized)
            tile.save(out_dir / f"item-{idx:02d}-{name}.png")
            tool.save(out_dir / f"tool-{idx:02d}-{name}.png")
            sheet.paste(tile, (c * icon, r * icon), tile)
            if idx < 6:
                tools.paste(tool, (idx * 40, 0), tool)
    out = out_dir.parent / "haigen-viking-items.png"
    sheet.save(out)
    tools.save(out_dir.parent / "haigen-viking-tools-row.png")
    return out


def pack_action_strips(src_path: Path, out_dir: Path) -> Path:
    im = Image.open(src_path).convert("RGBA")
    rows = 6
    cols = 4
    grid = split_grid(im, cols, rows)
    out_dir.mkdir(parents=True, exist_ok=True)
    sheet = Image.new("RGBA", (CELL_W * cols, CELL_H * rows), (0, 0, 0, 0))
    for r, name in enumerate(ACTION_NAMES):
        strip = Image.new("RGBA", (CELL_W * cols, CELL_H), (0, 0, 0, 0))
        for c in range(cols):
            cell = fit_to_cell(grid[r][c])
            strip.paste(cell, (c * CELL_W, 0), cell)
            sheet.paste(cell, (c * CELL_W, r * CELL_H), cell)
        strip.save(out_dir / f"action-{name}.png")
    out = out_dir.parent / "haigen-viking-actions.png"
    sheet.save(out)
    return out


def pack_interactions(src_path: Path, out_dir: Path) -> Path:
    im = Image.open(src_path).convert("RGBA")
    # 8 strips; column counts vary — pack as 8x4 using available frames
    rows = 8
    cols = 4
    grid = split_grid(im, cols, rows)
    names = [
        "swim_surface",
        "swim_dive",
        "row_boat",
        "climb",
        "pickup",
        "chest",
        "sit",
        "sleep",
    ]
    out_dir.mkdir(parents=True, exist_ok=True)
    sheet = Image.new("RGBA", (CELL_W * cols, CELL_H * rows), (0, 0, 0, 0))
    for r, name in enumerate(names):
        strip = Image.new("RGBA", (CELL_W * cols, CELL_H), (0, 0, 0, 0))
        for c in range(cols):
            cell = fit_to_cell(grid[r][c])
            strip.paste(cell, (c * CELL_W, 0), cell)
            sheet.paste(cell, (c * CELL_W, r * CELL_H), cell)
        strip.save(out_dir / f"interact-{name}.png")
    out = out_dir.parent / "haigen-viking-interactions.png"
    sheet.save(out)
    return out


def pack_outfit_heroes(src_path: Path, out_dir: Path) -> Path:
    im = Image.open(src_path).convert("RGBA")
    # May be 7 across — also tolerate 8 if model added one
    w, h = im.size
    # Detect columns by equal split of 7
    cols = 7
    cw = w // cols
    out_dir.mkdir(parents=True, exist_ok=True)
    sheet = Image.new("RGBA", (128 * cols, 192), (0, 0, 0, 0))
    for i, kit in enumerate(TRAVEL_KITS):
        crop = im.crop((i * cw, 0, (i + 1) * cw, h))
        cell = fit_to_cell(crop, 128, 192, target_w=110, foot_pad=4)
        cell.save(out_dir / f"outfit-hero-{kit}.png")
        sheet.paste(cell, (i * 128, 0), cell)
    out = out_dir.parent / "haigen-viking-outfit-heroes.png"
    sheet.save(out)
    return out


def pack_front_lock_hero(out_path: Path) -> Path:
    """Pack the Captain's locked 6-frame front strip into a transparent hero sheet."""
    frames = []
    for i in range(6):
        p = RAW / f"front-content-frame{i}.png"
        if not p.exists():
            continue
        frames.append(fit_to_cell(Image.open(p), 128, 192, target_w=110, foot_pad=4))
    if not frames:
        return out_path
    sheet = Image.new("RGBA", (128 * len(frames), 192), (0, 0, 0, 0))
    out_path.parent.mkdir(parents=True, exist_ok=True)
    frames_dir = out_path.parent / "front-lock-frames"
    frames_dir.mkdir(exist_ok=True)
    for i, fr in enumerate(frames):
        sheet.paste(fr, (i * 128, 0), fr)
        fr.save(frames_dir / f"front-lock-frame{i}.png")
    sheet.save(out_path)
    # Engine-scale front row using frames 0,2,4,5
    eng = Image.new("RGBA", (SHEET_W, CELL_H), (0, 0, 0, 0))
    pick = [0, 2, 4, 5]
    for c, idx in enumerate(pick):
        if idx < len(frames):
            cell = fit_to_cell(Image.open(RAW / f"front-content-frame{idx}.png"))
            eng.paste(cell, (c * CELL_W, 0), cell)
    eng.save(PACKED / "haigen-viking-front-lock-row.png")
    return out_path


def stack_region_outfits(walk_map: dict[str, Path], out_path: Path) -> Path:
    stack = Image.new("RGBA", (SHEET_W, SHEET_H * len(TRAVEL_KITS)), (0, 0, 0, 0))
    for i, kit in enumerate(TRAVEL_KITS):
        src = walk_map[kit]
        im = Image.open(src).convert("RGBA")
        if im.size != (SHEET_W, SHEET_H):
            raise SystemExit(f"{kit} packed size {im.size}, expected {(SHEET_W, SHEET_H)}")
        stack.paste(im, (0, i * SHEET_H), im)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    stack.save(out_path)
    stack.save(out_path.with_suffix(".webp"), "WEBP", lossless=True)
    return out_path


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--raw", type=Path, default=RAW)
    ap.add_argument("--out", type=Path, default=PACKED)
    args = ap.parse_args()
    raw: Path = args.raw
    out: Path = args.out
    out.mkdir(parents=True, exist_ok=True)
    (out / "expressions").mkdir(exist_ok=True)
    (out / "items").mkdir(exist_ok=True)
    (out / "actions").mkdir(exist_ok=True)
    (out / "interactions").mkdir(exist_ok=True)
    (out / "outfits").mkdir(exist_ok=True)

    manifest: dict = {"cell": [CELL_W, CELL_H], "sheet": [SHEET_W, SHEET_H], "kits": TRAVEL_KITS, "files": {}}

    # Base walk
    walk_src = raw / "viking-haigen-walk-atlas-raw.jpg"
    if not walk_src.exists():
        walk_src = raw / "walk-gen.png"
    base_out = out / "haigen-viking-walk-atlas.png"
    manifest["files"]["walk"] = pack_walk_grid(walk_src, base_out)

    # Region walks
    walk_map: dict[str, Path] = {}
    for kit in TRAVEL_KITS:
        src = raw / f"viking-haigen-walk-{kit}-raw.jpg"
        if not src.exists():
            print(f"WARN missing {src.name}; filling with base walk")
            walk_map[kit] = base_out
            continue
        dest = out / f"haigen-viking-walk-{kit}.png"
        manifest["files"][f"walk_{kit}"] = pack_walk_grid(src, dest)
        walk_map[kit] = dest

    region_out = out / "haigen-viking-region-outfits.png"
    stack_region_outfits(walk_map, region_out)
    manifest["files"]["region_stack"] = str(region_out.name)

    # Expressions / items / actions / interactions / outfit heroes
    expr_src = raw / "viking-haigen-expressions-raw.jpg"
    if expr_src.exists():
        pack_expressions(expr_src, out / "expressions")
        manifest["files"]["expressions"] = "haigen-viking-expressions.png"

    items_src = raw / "viking-haigen-items-raw.jpg"
    if not items_src.exists():
        items_src = raw / "items-gen.png"
    if items_src.exists():
        pack_items(items_src, out / "items")
        manifest["files"]["items"] = "haigen-viking-items.png"

    actions_src = raw / "viking-haigen-actions-raw.jpg"
    if actions_src.exists():
        pack_action_strips(actions_src, out / "actions")
        manifest["files"]["actions"] = "haigen-viking-actions.png"

    interact_src = raw / "viking-haigen-interactions-raw.jpg"
    if interact_src.exists():
        pack_interactions(interact_src, out / "interactions")
        manifest["files"]["interactions"] = "haigen-viking-interactions.png"

    outfits_src = raw / "viking-haigen-outfit-heroes-raw.jpg"
    if outfits_src.exists():
        pack_outfit_heroes(outfits_src, out / "outfits")
        manifest["files"]["outfit_heroes"] = "haigen-viking-outfit-heroes.png"

    pack_front_lock_hero(out / "haigen-viking-front-lock-hero.png")
    manifest["files"]["front_lock_hero"] = "haigen-viking-front-lock-hero.png"
    manifest["files"]["front_lock_row"] = "haigen-viking-front-lock-row.png"

    # Copy drop-in aliases at pack root for easy Captain swap
    # (does not touch live assets/haigen-reference-walk-atlas.webp)
    manifest_path = out / "manifest.json"
    manifest_path.write_text(json.dumps(manifest, indent=2) + "\n")
    print(json.dumps({"packed": str(out), "manifest": manifest["files"]}, indent=2))


if __name__ == "__main__":
    main()
