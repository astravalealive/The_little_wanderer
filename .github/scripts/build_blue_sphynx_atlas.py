#!/usr/bin/env python3
"""Build Blue's production walk/idle atlas from the locked approved reference.

Provenance:
  concept: docs/blue-sphynx-atlas/reference/BLUE_APPROVED_REFERENCE.png (LOCKED look)
  spec:    docs/blue-sphynx-atlas/SPRITE_SPEC.md
  output:  assets/blue-sphynx-atlas-v435.webp

The presentation sheet is not imported whole. Individual locked walk/idle
poses are extracted, backgrounds/labels removed, foot-baselined into a
4×4 atlas (down/up/right/left × 4 frames). LEFT is a horizontal mirror of
RIGHT (anatomy-safe for this cat). DOWN walk is pose-completed from the
locked front idle using the same silhouette/palette — not a redesign.
"""
from __future__ import annotations

import hashlib
import json
from pathlib import Path

from PIL import Image, ImageEnhance, ImageFilter

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / "docs" / "blue-sphynx-atlas" / "reference" / "BLUE_APPROVED_REFERENCE.png"
OUT = ROOT / "assets" / "blue-sphynx-atlas-v435.webp"
PREVIEW = ROOT / "docs" / "blue-sphynx-atlas" / "atlas-preview-4x.png"
META = ROOT / "docs" / "blue-sphynx-atlas" / "atlas-meta.json"

CELL_W, CELL_H = 96, 80
COLS, ROWS = 4, 4  # frames × dirs (down, up, right, left)
FOOT_PAD = 3

# Locked walk crops from the approved Walk (4 Direction) panel (non-overlapping).
UP_BOXES = [
    (558, 150, 603, 261),
    (675, 151, 721, 256),
    (789, 150, 834, 261),
    (907, 150, 953, 260),
]
RIGHT_BOXES = [
    (514, 264, 648, 357),
    (650, 264, 764, 357),
    (766, 266, 877, 356),
    (879, 265, 997, 357),
]
# Locked front idle (Views / Idle) — head+chest; crop stops above panel chrome.
FRONT_IDLE_BOX = (52, 148, 134, 252)
# Side sitting idle for DOWN body proportions assist.
SIDE_IDLE_BOX = (268, 155, 350, 278)


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def remove_presentation_bg(tile: Image.Image) -> Image.Image:
    """Drop near-black sheet background and warm gold UI chrome; keep Blue."""
    tile = tile.convert("RGBA")
    px = tile.load()
    w, h = tile.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            lum = (r + g + b) / 3
            # Presentation black / dark brown plate
            if lum < 28:
                px[x, y] = (0, 0, 0, 0)
                continue
            # Gold/tan UI chrome only — never chartreuse eyes (g≈r or g>r).
            goldish = (
                r > 150
                and g > 105
                and b < 150
                and (r - b) > 45
                and (r - g) > 12  # parchment is distinctly redder than green
                and g > b
            )
            pale_chrome = (
                r > 200
                and g > 170
                and 90 < b < 165
                and (r - b) > 50
                and (r - g) > 8
            )
            if goldish or pale_chrome:
                px[x, y] = (0, 0, 0, 0)
                continue
            # Soften residual near-black fringe
            if lum < 38 and r < 50 and g < 45 and b < 45:
                px[x, y] = (0, 0, 0, 0)
    return tile


def trim_alpha(im: Image.Image, pad: int = 1) -> Image.Image:
    bbox = im.getchannel("A").getbbox()
    if not bbox:
        return im
    x0, y0, x1, y1 = bbox
    x0 = max(0, x0 - pad)
    y0 = max(0, y0 - pad)
    x1 = min(im.width, x1 + pad)
    y1 = min(im.height, y1 + pad)
    return im.crop((x0, y0, x1, y1))


def fit_to_cell(sprite: Image.Image, cell_w: int = CELL_W, cell_h: int = CELL_H) -> Image.Image:
    """Scale sprite into cell, centered on X, foot-baselined on Y."""
    sprite = trim_alpha(sprite)
    max_w, max_h = cell_w - 6, cell_h - FOOT_PAD - 2
    factor = min(max_w / sprite.width, max_h / sprite.height)
    nw = max(1, round(sprite.width * factor))
    nh = max(1, round(sprite.height * factor))
    # Slight sharpen after Lanczos to keep horn-ear silhouette crisp at game scale.
    scaled = sprite.resize((nw, nh), Image.Resampling.LANCZOS)
    scaled = ImageEnhance.Sharpness(scaled).enhance(1.15)
    cell = Image.new("RGBA", (cell_w, cell_h), (0, 0, 0, 0))
    x = (cell_w - nw) // 2
    y = cell_h - FOOT_PAD - nh
    cell.alpha_composite(scaled, (x, y))
    return cell


def extract(src: Image.Image, box: tuple[int, int, int, int]) -> Image.Image:
    return remove_presentation_bg(src.crop(box))


def sample_palette(im: Image.Image, n: int = 12) -> list[tuple[int, int, int]]:
    rgba = im.convert("RGBA")
    # Flatten onto dark plate so transparent pixels do not pollute the palette.
    flat = Image.new("RGB", rgba.size, (12, 10, 14))
    flat.paste(rgba, mask=rgba.split()[3])
    q = flat.quantize(colors=n, method=Image.Quantize.MEDIANCUT)
    palette = q.getpalette() or []
    colors = []
    for i in range(n):
        r, g, b = palette[i * 3 : i * 3 + 3]
        if r + g + b < 40:
            continue
        colors.append((r, g, b))
    return colors or [(120, 100, 120)]


def nearest(c: tuple[int, int, int], palette: list[tuple[int, int, int]]) -> tuple[int, int, int]:
    r, g, b = c
    best, best_d = palette[0], 1e18
    for pr, pg, pb in palette:
        d = (r - pr) ** 2 + (g - pg) ** 2 + (b - pb) ** 2
        if d < best_d:
            best, best_d = (pr, pg, pb), d
    return best


def is_locked_eye(r: int, g: int, b: int) -> bool:
    """Preserve chartreuse/yellow-green irises from the approved reference."""
    return g > 110 and r > 55 and b < 130 and g >= r - 5 and g > b + 15


def soft_posterize(im: Image.Image, palette: list[tuple[int, int, int]], mix: float = 0.42) -> Image.Image:
    """Nudge toward locked palette without flattening soft shading or eyes."""
    out = im.copy()
    px = out.load()
    w, h = out.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a < 18:
                continue
            if is_locked_eye(r, g, b):
                continue  # keep approved eye colour exactly
            pr, pg, pb = nearest((r, g, b), palette)
            px[x, y] = (
                int(r * (1 - mix) + pr * mix),
                int(g * (1 - mix) + pg * mix),
                int(b * (1 - mix) + pb * mix),
                a,
            )
    return out


def reinforce_eyes(im: Image.Image) -> Image.Image:
    """After downscale, restore any washed-out eye pixels from nearby chartreuse."""
    out = im.copy()
    px = out.load()
    w, h = out.size
    eyes = []
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a >= 18 and is_locked_eye(r, g, b):
                eyes.append((x, y, r, g, b))
    if len(eyes) >= 2:
        return out
    # If eyes vanished, punch small chartreuse pupils into upper face third.
    iris = (196, 210, 70, 255)
    pupil = (28, 30, 28, 255)
    # Estimate face center from opaque bbox
    bbox = out.getchannel("A").getbbox()
    if not bbox:
        return out
    cx = (bbox[0] + bbox[2]) // 2
    cy = bbox[1] + int((bbox[3] - bbox[1]) * 0.28)
    for dx in (-6, 6):
        for ox, oy, col in (
            (0, 0, iris),
            (1, 0, iris),
            (0, 1, iris),
            (1, 1, pupil),
        ):
            x, y = cx + dx + ox, cy + oy
            if 0 <= x < w and 0 <= y < h and px[x, y][3] > 40:
                px[x, y] = col
    return out


def build_down_walk(
    front_idle: Image.Image,
    up_frames: list[Image.Image],
    palette: list[tuple[int, int, int]],
) -> list[Image.Image]:
    """Pose-complete front walk from locked front idle + UP leg cadence.

    Preserves front face/horn-ears from the approved idle. Standing body height
    matches UP walk. Leg phase offsets follow UP without inventing a new design.
    """
    head = trim_alpha(front_idle)
    # Keep upper ~70% as locked face/ears/chest identity (sitting crop is already bust-ish).
    head_cut = max(8, int(head.height * 0.72))
    face = head.crop((0, 0, head.width, head_cut))

    frames: list[Image.Image] = []
    for i, up in enumerate(up_frames):
        up_s = trim_alpha(up)
        W, H = 128, 160
        canvas = Image.new("RGBA", (W, H), (0, 0, 0, 0))

        body_h = int(H * 0.70)
        body = up_s.resize(
            (max(1, int(up_s.width * (body_h / up_s.height) * 1.05)), body_h),
            Image.Resampling.LANCZOS,
        )
        drop = int(body.height * 0.38)
        body_lower = body.crop((0, drop, body.width, body.height))
        # Soften back-highlight spine so it reads less as "back view" under the face.
        bl = body_lower.load()
        for yy in range(body_lower.height):
            for xx in range(body_lower.width):
                r, g, b, a = bl[xx, yy]
                if a < 18:
                    continue
                # Dim pale back ridge toward mid mauve
                if r > 170 and g > 150 and b > 140:
                    bl[xx, yy] = (int(r * 0.72 + 110 * 0.28), int(g * 0.72 + 95 * 0.28), int(b * 0.72 + 105 * 0.28), a)
        bx = (W - body_lower.width) // 2
        by = H - FOOT_PAD - body_lower.height
        canvas.alpha_composite(body_lower, (bx, by))

        face_h = int(H * 0.52)
        face_s = face.resize(
            (max(1, int(face.width * (face_h / face.height))), face_h),
            Image.Resampling.LANCZOS,
        )
        face_s = reinforce_eyes(face_s)
        fx = (W - face_s.width) // 2
        bob = [0, 2, 0, 3][i % 4]
        fy = max(0, by - int(face_s.height * 0.55) - bob)
        canvas.alpha_composite(face_s, (fx, fy))

        # Light chest patch (locked peach) under chin so front reads clearly.
        chest = nearest((190, 150, 145), palette)
        px = canvas.load()
        for oy in range(4):
            for ox in range(-4, 5):
                x = W // 2 + ox
                y = fy + face_s.height - 6 + oy
                if 0 <= x < W and 0 <= y < H and px[x, y][3] > 30:
                    r, g, b, a = px[x, y]
                    px[x, y] = (
                        int(r * 0.55 + chest[0] * 0.45),
                        int(g * 0.55 + chest[1] * 0.45),
                        int(b * 0.55 + chest[2] * 0.45),
                        a,
                    )

        paw = nearest((95, 82, 96), palette)
        base_y = H - FOOT_PAD - 1
        lift_l, lift_r = i in (1, 2), i in (0, 3)
        for dx, lift in ((-8, lift_l), (7, lift_r)):
            py = base_y - (4 if lift else 0)
            for ox in range(-2, 3):
                for oy in range(-1, 2):
                    x, y = W // 2 + dx + ox, py + oy
                    if 0 <= x < W and 0 <= y < H:
                        if px[x, y][3] < 30:
                            px[x, y] = (*paw, 220)

        frames.append(reinforce_eyes(soft_posterize(trim_alpha(canvas), palette, mix=0.22)))
    return frames


def main() -> None:
    assert SRC.exists(), f"Missing locked reference: {SRC}"
    src = Image.open(SRC).convert("RGBA")
    assert src.size == (1536, 1024), f"Unexpected reference size {src.size}"

    up = [extract(src, b) for b in UP_BOXES]
    right = [extract(src, b) for b in RIGHT_BOXES]
    front_idle = extract(src, FRONT_IDLE_BOX)
    side_idle = extract(src, SIDE_IDLE_BOX)

    palette = sample_palette(front_idle, 14)
    palette += sample_palette(right[0], 10)
    # Dedup
    uniq = []
    for c in palette:
        if c not in uniq:
            uniq.append(c)
    palette = uniq

    down_walk = build_down_walk(front_idle, up, palette)
    # Frame 0 of DOWN prefers the locked sitting idle (true approved front expression).
    down_idle = reinforce_eyes(soft_posterize(front_idle, palette, mix=0.20))
    down_frames = [down_idle] + down_walk[1:]

    up_frames = [soft_posterize(f, palette, mix=0.18) for f in up]
    right_frames = [soft_posterize(f, palette, mix=0.18) for f in right]
    # Idle for side/back: use walk frame 0 (planted).
    # LEFT mirrored from RIGHT.
    left_frames = [f.transpose(Image.Transpose.FLIP_LEFT_RIGHT) for f in right_frames]

    rows = [down_frames, up_frames, right_frames, left_frames]
    atlas = Image.new("RGBA", (COLS * CELL_W, ROWS * CELL_H), (0, 0, 0, 0))
    for row, frames in enumerate(rows):
        assert len(frames) == 4, f"row {row} needs 4 frames"
        for col, frame in enumerate(frames):
            cell = reinforce_eyes(fit_to_cell(frame))
            # Ensure some opaque pixels
            assert cell.getchannel("A").getbbox(), f"empty cell r{row}c{col}"
            atlas.alpha_composite(cell, (col * CELL_W, row * CELL_H))

    OUT.parent.mkdir(parents=True, exist_ok=True)
    atlas.save(OUT, "WEBP", lossless=True, quality=100)
    preview = atlas.resize((atlas.width * 4, atlas.height * 4), Image.Resampling.NEAREST)
    PREVIEW.parent.mkdir(parents=True, exist_ok=True)
    preview.save(PREVIEW)

    meta = {
        "asset": str(OUT.relative_to(ROOT)),
        "cell": [CELL_W, CELL_H],
        "layout": "rows=down,up,right,left; cols=idle+walk×3",
        "drawHint": {"width": 58, "height": 48, "footPad": FOOT_PAD},
        "source": str(SRC.relative_to(ROOT)),
        "sourceSha256": sha256(SRC),
        "outputSha256": sha256(OUT),
        "size": list(atlas.size),
        "left": "mirror(right)",
        "downWalk": "pose-completed from locked front idle + UP cadence; face/ears from approved idle",
        "paletteSample": ["#%02x%02x%02x" % c for c in palette[:10]],
    }
    META.write_text(json.dumps(meta, indent=2) + "\n")
    print("Blue Sphynx atlas ready:", OUT, atlas.size, OUT.stat().st_size, "bytes")
    print("Preview:", PREVIEW)


if __name__ == "__main__":
    main()
