#!/usr/bin/env python3
"""Job 234 — controlled Nordic Haigen walk-atlas pipeline.

Provenance:
  concept: AI turnaround (direction only; not game-ready)
  source:  assets/haigen-reference-walk-atlas.webp (approved V122 movement sheet)
  output:  assets/haigen-nordic-walk-atlas-v433.webp

Preserves original soft shading; adds warm Nordic outline, hair-bible dangly
locks, clearer front eyes/mouth, and LEFT = mirror(RIGHT) for runtime QA.
"""
from __future__ import annotations

import json
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "assets" / "haigen-reference-walk-atlas.webp"
OUT = ROOT / "assets" / "haigen-nordic-walk-atlas-v433.webp"
PROV = ROOT / "docs" / "nordic-haigen-sprite-234" / "PROVENANCE.md"
PREVIEW = ROOT / "docs" / "nordic-haigen-sprite-234" / "atlas-preview-4x.png"

OUTLINE = (29, 36, 32, 255)       # #1d2420
OUTLINE_SOFT = (42, 47, 44, 255)  # #2a2f2c
HAIR_SHADOW = (168, 128, 56, 255)
HAIR_BASE = (214, 176, 86, 255)
HAIR_MID = (232, 198, 110, 255)
HAIR_HI = (246, 228, 160, 255)
EYE = (32, 34, 36, 255)
MOUTH = (168, 110, 110, 255)


def opaque(px):
    return px[3] >= 18


def is_hair(r, g, b, a):
    if a < 18:
        return False
    if r < 145 or g < 100:
        return False
    if r > 230 and g > 220 and b > 200:
        return False
    return r >= g - 8 and g >= b - 10 and (r - b) > 28


def neighbours4(px, x, y, w, h):
    for dx, dy in ((-1, 0), (1, 0), (0, -1), (0, 1)):
        nx, ny = x + dx, y + dy
        if 0 <= nx < w and 0 <= ny < h:
            yield px[ny][nx]


def warm_hair_pixel(r, g, b, a):
    """Nudge muddy blondes toward honey Nordic hair without flattening."""
    lum = 0.3 * r + 0.59 * g + 0.11 * b
    if lum < 145:
        target = HAIR_SHADOW
    elif lum < 185:
        target = HAIR_BASE
    elif lum < 215:
        target = HAIR_MID
    else:
        target = HAIR_HI
    # Blend 55% original / 45% target to keep soft AA
    nr = int(r * 0.55 + target[0] * 0.45)
    ng = int(g * 0.55 + target[1] * 0.45)
    nb = int(b * 0.55 + target[2] * 0.45)
    return (nr, ng, nb, a)


def enhance_cell(cell: Image.Image, row: int, frame: int) -> Image.Image:
    src = cell.convert("RGBA")
    w, h = src.size
    px = [[src.getpixel((x, y)) for x in range(w)] for y in range(h)]
    out = [row[:] for row in px]

    # 1) Warm hair remap (preserve alpha / soft edges)
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[y][x]
            if is_hair(r, g, b, a):
                out[y][x] = warm_hair_pixel(r, g, b, a)

    # 2) Front face readability — only paint into existing face/skin area
    if row == 0:
        for ex in (18, 28):
            ey = 22
            if opaque(px[ey][ex]) or opaque(px[ey][ex - 1]):
                out[ey][ex] = (*EYE[:3], 255)
                out[ey][ex - 1] = (*EYE[:3], 255)
        for mx in (22, 23, 24):
            if opaque(px[28][mx]) or opaque(px[27][mx]):
                out[28][mx] = (*MOUTH[:3], 255)

    # 3) Dangly noodle locks (hair bible) — only overwrite hair / empty near crown
    tip_dy = [0, 1, 0, 1][frame % 4]
    if row == 0:
        strands = [(14, 13, 13, 20), (17, 12, 16, 19), (20, 11, 19, 17),
                   (27, 11, 28, 17), (30, 12, 31, 19), (33, 13, 34, 20)]
    elif row == 1:
        strands = [(16, 16, 15, 22), (19, 15, 18, 21), (22, 14, 22, 20),
                   (25, 14, 25, 20), (28, 15, 29, 21), (31, 16, 32, 22)]
    else:  # side (right); left mirrored later
        strands = [(26, 12, 28, 19), (28, 11, 30, 18), (30, 12, 32, 20),
                   (24, 13, 25, 18), (22, 14, 22, 17)]

    for x0, y0, x1, y1 in strands:
        for t in range(6):
            x = x0 + round((x1 - x0) * t / 5)
            y = y0 + round((y1 - y0) * t / 5) + (tip_dy if t > 3 else 0)
            if not (0 <= x < w and 0 <= y < h):
                continue
            r, g, b, a = px[y][x]
            # Paint on hair or just outside crown into transparent fringe
            if is_hair(r, g, b, a) or (a < 18 and y < 24 and 10 <= x <= 37):
                col = HAIR_MID if t < 3 else HAIR_BASE
                if t >= 4:
                    col = HAIR_SHADOW
                out[y][x] = col
                if x + 1 < w and (is_hair(*px[y][x + 1]) or px[y][x + 1][3] < 18):
                    if out[y][x + 1][3] < 18 or is_hair(*out[y][x + 1]):
                        out[y][x + 1] = HAIR_SHADOW

    # 4) Warm Nordic outline on silhouette edge (do not erase interior shading)
    outlined = [row[:] for row in out]
    for y in range(h):
        for x in range(w):
            if not opaque(out[y][x]):
                continue
            edge = x in (0, w - 1) or y in (0, h - 1)
            if not edge:
                for n in neighbours4(out, x, y, w, h):
                    if not opaque(n):
                        edge = True
                        break
            if not edge:
                continue
            r, g, b, a = out[y][x]
            if is_hair(r, g, b, a):
                # Darken hair edge softly instead of hard black helmet
                outlined[y][x] = (
                    max(0, r - 55),
                    max(0, g - 55),
                    max(0, b - 40),
                    255,
                )
            else:
                # Mix outline into existing edge pixel for less posterization
                outlined[y][x] = (
                    int(r * 0.35 + OUTLINE[0] * 0.65),
                    int(g * 0.35 + OUTLINE[1] * 0.65),
                    int(b * 0.35 + OUTLINE[2] * 0.65),
                    255,
                )

    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    for y in range(h):
        for x in range(w):
            img.putpixel((x, y), outlined[y][x])
    return img


def main():
    src = Image.open(SRC).convert("RGBA")
    assert src.size == (192, 288), src.size
    atlas = Image.new("RGBA", (192, 288), (0, 0, 0, 0))

    for row in range(3):
        for frame in range(4):
            cell = src.crop((frame * 48, row * 72, frame * 48 + 48, row * 72 + 72))
            atlas.paste(enhance_cell(cell, row, frame), (frame * 48, row * 72))

    # Source DOWN cell 2 (x=96) faced BACK; replace with a true forward walk frame
    # derived from DOWN cell 3 so the 4-frame cycle no longer needs a runtime paste.
    atlas.paste(atlas.crop((144, 0, 192, 72)), (96, 0))

    for frame in range(4):
        right = atlas.crop((frame * 48, 144, frame * 48 + 48, 216))
        atlas.paste(right.transpose(Image.FLIP_LEFT_RIGHT), (frame * 48, 216))

    atlas.save(OUT, "WEBP", lossless=True, exact=True)
    PREVIEW.parent.mkdir(parents=True, exist_ok=True)
    atlas.resize((192 * 4, 288 * 4), Image.NEAREST).save(PREVIEW)

    feet = {}
    for row, name in enumerate(["down", "up", "right", "left"]):
        feet[name] = []
        for frame in range(4):
            c = atlas.crop((frame * 48, row * 72, frame * 48 + 48, row * 72 + 72))
            bottom = -1
            for y in range(71, -1, -1):
                if max(c.getpixel((x, y))[3] for x in range(48)) > 20:
                    bottom = y
                    break
            feet[name].append(bottom)

    mismatches = 0
    for f in range(4):
        left = atlas.crop((f * 48, 216, f * 48 + 48, 288))
        right = atlas.crop((f * 48, 144, f * 48 + 48, 216)).transpose(Image.FLIP_LEFT_RIGHT)
        for y in range(72):
            for x in range(48):
                if left.getpixel((x, y)) != right.getpixel((x, y)):
                    mismatches += 1

    unique = len({p for p in atlas.getdata()})
    meta = {
        "output": str(OUT.relative_to(ROOT)),
        "bytes": OUT.stat().st_size,
        "unique_colors": unique,
        "foot_baseline": feet,
        "left_mirror_mismatches": mismatches,
    }
    print(json.dumps(meta, indent=2))
    assert mismatches == 0, mismatches
    assert all(all(v == 68 for v in vals) for vals in feet.values()), feet
    assert unique > 500, unique

    PROV.write_text(
        f"""# Job 234 — Nordic Haigen atlas provenance

## Pipeline
1. **Concept (AI, not game-ready):** turnaround reference for Nordic hoodie + dangly blonde hair direction.
2. **Source sheet (approved playable):** `{SRC.relative_to(ROOT)}` — V122 192×288 / 48×72.
3. **Controlled pixel cleanup:** `{Path(__file__).name}`
   - Preserve original soft shading (no hard posterize)
   - Warm honey-blonde hair remap + dangly noodle locks (hair bible)
   - Front-view eye/mouth readability
   - Warm Nordic silhouette outline mix `#1d2420`
   - LEFT row = mirror(RIGHT) for `__haigenAtlasQA`
4. **Output:** `{OUT.relative_to(ROOT)}` lossless WebP, transparent.

## Contract preserved
Cell 48×72, sheet 192×288, foot baseline y=68, scale 1.67, wrist-parented tools unchanged.

## Rebuild
```bash
python3 devkit/build-nordic-haigen-atlas-234.py
```
""",
        encoding="utf-8",
    )


if __name__ == "__main__":
    main()
