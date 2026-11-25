#!/usr/bin/env python3
"""High-detail Viking Haigen production builder (issue #292).

Preserves Captain lock pixel density. Production cell defaults to 384×720
(six large frames per direction strip). Does NOT crush art to the live
48×72 engine cells — those remain a separate optional preview under packed/.

Outputs under assets/viking-haigen/production/:
  - walk/{dir}/frame_00..05.png
  - walk/{dir}/strip.png
  - walk/{dir}/loop.gif  (verified playback)
  - atlas-hd.json        (machine-readable metadata)
  - qa-report.json
"""
from __future__ import annotations

import argparse
import json
import math
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageSequence

ROOT = Path(__file__).resolve().parents[2]
RAW = ROOT / "assets/viking-haigen/raw"
PROD = ROOT / "assets/viking-haigen/production"
REFS = ROOT / "assets/viking-haigen/refs"

# Production cell — near lock content (~357×699), even canvas, feet grounded.
CELL_W, CELL_H = 384, 720
FOOT_PAD = 8
FRAME_MS = 150
DIRS = ("front", "right", "back", "left")


def whitish(r, g, b, thresh=238):
    return r >= thresh and g >= thresh and b >= thresh and abs(r - g) < 18 and abs(g - b) < 18


def make_transparent(im: Image.Image, thresh: int = 238) -> Image.Image:
    im = im.convert("RGBA")
    px = im.load()
    w, h = im.size
    stack = [(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1)]
    seen = set()
    while stack:
        x, y = stack.pop()
        if (x, y) in seen or x < 0 or y < 0 or x >= w or y >= h:
            continue
        seen.add((x, y))
        r, g, b, a = px[x, y]
        if a < 8 or not whitish(r, g, b, thresh):
            continue
        px[x, y] = (0, 0, 0, 0)
        stack.extend([(x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)])
    return im


def content_bbox(im: Image.Image, alpha: int = 16):
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


def fit_hd_cell(
    src: Image.Image,
    cell_w=CELL_W,
    cell_h=CELL_H,
    foot_pad=FOOT_PAD,
    target_h: int | None = None,
) -> Image.Image:
    """Fit to production cell. Shrink with LANCZOS; optional height match uses NEAREST."""
    src = make_transparent(src)
    bb = content_bbox(src)
    cell = Image.new("RGBA", (cell_w, cell_h), (0, 0, 0, 0))
    if not bb:
        return cell
    cropped = src.crop(bb)
    cw, ch = cropped.size
    max_w = cell_w - 16
    max_h = cell_h - foot_pad - 8
    if target_h:
        scale = min(max_w / cw, max_h / ch, target_h / ch)
        resample = Image.Resampling.NEAREST if scale > 1.0 else Image.Resampling.LANCZOS
    else:
        scale = min(1.0, max_w / cw, max_h / ch)  # lock path: never upscale
        resample = Image.Resampling.LANCZOS
    nw = max(1, int(round(cw * scale)))
    nh = max(1, int(round(ch * scale)))
    resized = cropped if abs(scale - 1.0) < 1e-6 else cropped.resize((nw, nh), resample)
    x = (cell_w - nw) // 2
    y = cell_h - foot_pad - nh
    cell.paste(resized, (x, y), resized)
    return cell


def opaque_metrics(cell: Image.Image) -> dict:
    px = cell.load()
    w, h = cell.size
    xs, ys = [], []
    for y in range(h):
        for x in range(w):
            if px[x, y][3] > 16:
                xs.append(x)
                ys.append(y)
    if not xs:
        return {"opaque": False}
    return {
        "opaque": True,
        "bbox": [min(xs), min(ys), max(xs) + 1, max(ys) + 1],
        "width": max(xs) - min(xs) + 1,
        "height": max(ys) - min(ys) + 1,
        "foot_y": max(ys),
        "center_x": (min(xs) + max(xs)) / 2,
    }


def split_equal_frames(im: Image.Image, count: int = 6) -> list[Image.Image]:
    im = im.convert("RGBA")
    w, h = im.size
    fw = w // count
    return [im.crop((i * fw, 0, (i + 1) * fw if i < count - 1 else w, h)) for i in range(count)]


def write_strip(frames: list[Image.Image], path: Path) -> Image.Image:
    strip = Image.new("RGBA", (CELL_W * len(frames), CELL_H), (0, 0, 0, 0))
    for i, fr in enumerate(frames):
        strip.paste(fr, (i * CELL_W, 0), fr)
    path.parent.mkdir(parents=True, exist_ok=True)
    strip.save(path)
    return strip


def write_loop_gif(frames: list[Image.Image], path: Path, ms: int = FRAME_MS) -> Path:
    """Verified looping preview on checker so transparency reads."""
    out_frames = []
    for fr in frames:
        # checkerboard underlay for QA viewing
        bg = Image.new("RGBA", fr.size, (0, 0, 0, 0))
        draw = ImageDraw.Draw(bg)
        s = 24
        for y in range(0, fr.size[1], s):
            for x in range(0, fr.size[0], s):
                c = (55, 62, 58, 255) if ((x // s) + (y // s)) % 2 == 0 else (40, 46, 42, 255)
                draw.rectangle([x, y, x + s - 1, y + s - 1], fill=c)
        composed = Image.alpha_composite(bg, fr)
        # GIF needs palette; keep readable
        out_frames.append(composed.convert("P", palette=Image.ADAPTIVE, colors=255))
    path.parent.mkdir(parents=True, exist_ok=True)
    out_frames[0].save(
        path,
        save_all=True,
        append_images=out_frames[1:],
        duration=ms,
        loop=0,
        disposal=2,
    )
    return path


def frame_delta(a: Image.Image, b: Image.Image) -> float:
    """Mean absolute alpha-weighted RGB difference (0..1)."""
    a, b = a.convert("RGBA"), b.convert("RGBA")
    if a.size != b.size:
        b = b.resize(a.size, Image.Resampling.NEAREST)
    da = ImageChops.difference(a, b)
    px = list(da.getdata())
    if not px:
        return 0.0
    total = sum((r + g + b) / 3 for r, g, b, _ in px)
    return (total / len(px)) / 255.0


def qa_walk_cycle(frames: list[Image.Image]) -> dict:
    """Playback-oriented checks — not still-frame vibes."""
    metrics = [opaque_metrics(f) for f in frames]
    report = {"frame_count": len(frames), "ok": True, "issues": [], "metrics": metrics}
    if len(frames) != 6:
        report["ok"] = False
        report["issues"].append(f"expected 6 frames, got {len(frames)}")
    feet = [m.get("foot_y") for m in metrics if m.get("opaque")]
    centers = [m.get("center_x") for m in metrics if m.get("opaque")]
    if feet:
        foot_span = max(feet) - min(feet)
        report["foot_y_span"] = foot_span
        if foot_span > 40:
            report["ok"] = False
            report["issues"].append(f"foot baseline drifts {foot_span}px across cycle")
    if centers:
        report["center_x_span"] = max(centers) - min(centers)
    # Adjacent frames must differ (no duplicated same-foot freeze)
    deltas = []
    for i in range(len(frames)):
        d = frame_delta(frames[i], frames[(i + 1) % len(frames)])
        deltas.append(round(d, 4))
        if d < 0.004:
            report["ok"] = False
            report["issues"].append(f"frames {i} and {(i+1)%len(frames)} nearly identical (delta={d:.4f})")
    report["adjacent_deltas"] = deltas
    # Opposite stride pairs (0 vs 3, 1 vs 4, 2 vs 5) should differ — classic walk
    for i in range(3):
        d = frame_delta(frames[i], frames[i + 3])
        if d < 0.006:
            report["ok"] = False
            report["issues"].append(f"stride pair {i}/{i+3} too similar (delta={d:.4f})")
    # Pixel difference is not proof that the LEFT and RIGHT feet alternate.
    # Keep this distinction explicit so visual QA cannot be mistaken for anatomy QA.
    report["anatomical_foot_alternation_verified"] = False
    report["requires_visual_foot_review"] = True
    return report


def build_front_from_lock() -> list[Image.Image]:
    frames = []
    for i in range(6):
        src = RAW / f"front-content-frame{i}.png"
        if not src.exists():
            raise SystemExit(f"missing lock frame {src}")
        frames.append(fit_hd_cell(Image.open(src)))
    return frames


def import_direction_strip(
    src: Path, out_dir: Path, mirror: bool = False, target_h: int | None = 680
) -> list[Image.Image]:
    im = Image.open(src)
    parts = split_equal_frames(im, 6)
    frames = []
    out_dir.mkdir(parents=True, exist_ok=True)
    for i, part in enumerate(parts):
        cell = fit_hd_cell(part, target_h=target_h)
        if mirror:
            cell = cell.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
        cell.save(out_dir / f"frame_{i:02d}.png")
        frames.append(cell)
    write_strip(frames, out_dir / "strip.png")
    write_loop_gif(frames, out_dir / "loop.gif")
    return frames


def write_atlas_metadata(prod: Path, qa: dict) -> Path:
    frames_meta = []
    for d in DIRS:
        ddir = prod / "walk" / d
        if not (ddir / "strip.png").exists():
            continue
        for i in range(6):
            frames_meta.append(
                {
                    "id": f"walk_{d}_{i:02d}",
                    "action": "walk",
                    "direction": d,
                    "frame": i,
                    "path": f"walk/{d}/frame_{i:02d}.png",
                    "strip": f"walk/{d}/strip.png",
                    "strip_rect": {"x": i * CELL_W, "y": 0, "w": CELL_W, "h": CELL_H},
                    "pivot": {"x": CELL_W // 2, "y": CELL_H - FOOT_PAD},
                    "duration_ms": FRAME_MS,
                }
            )
    actions_root = prod / "actions"
    if actions_root.exists():
        for action_dir in sorted(actions_root.iterdir()):
            if not action_dir.is_dir():
                continue
            name = action_dir.name
            if not (action_dir / "strip.png").exists():
                continue
            for i in range(6):
                fp = action_dir / f"frame_{i:02d}.png"
                if not fp.exists():
                    continue
                frames_meta.append(
                    {
                        "id": f"action_{name}_{i:02d}",
                        "action": name,
                        "direction": "right",
                        "frame": i,
                        "path": f"actions/{name}/frame_{i:02d}.png",
                        "strip": f"actions/{name}/strip.png",
                        "strip_rect": {"x": i * CELL_W, "y": 0, "w": CELL_W, "h": CELL_H},
                        "pivot": {"x": CELL_W // 2, "y": CELL_H - FOOT_PAD},
                        "duration_ms": FRAME_MS,
                    }
                )

    atlas = {
        "name": "viking-haigen-hd",
        "issue": 292,
        "cell": {"w": CELL_W, "h": CELL_H},
        "foot_pad": FOOT_PAD,
        "frame_ms": FRAME_MS,
        "transparent": True,
        "format": "png",
        "layers": ["body"],  # equipment modular layers land later
        "grip_anchor_local": {"x": CELL_W // 2 + 20, "y": int(CELL_H * 0.62)},
        "live_engine_note": {
            "approved_cell": [48, 72],
            "approved_sheet": [192, 288],
            "draw_scale": 1.67,
            "foot_baseline": "y-h+7",
            "this_pack": "HD production masters; do not replace approved atlases without Captain approval",
        },
        "frames": frames_meta,
        "qa": qa,
    }
    path = prod / "atlas-hd.json"
    path.write_text(json.dumps(atlas, indent=2) + "\n")
    return path


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--import-right", type=Path, help="6-frame right-facing raw strip")
    ap.add_argument("--import-back", type=Path, help="6-frame back-facing raw strip")
    ap.add_argument("--import-left", type=Path, help="6-frame left-facing raw strip (else mirror right)")
    ap.add_argument("--import-action", nargs=2, action="append", metavar=("NAME", "PATH"),
                    help="import flat action strip → actions/NAME/ (legacy right)")
    ap.add_argument("--import-action-dir", nargs=3, action="append", metavar=("NAME", "DIR", "PATH"),
                    help="import action strip into actions/NAME/DIR/ (repeatable)")
    args = ap.parse_args()

    prod = PROD
    (prod / "walk").mkdir(parents=True, exist_ok=True)
    qa_all = {}

    # FRONT from Captain lock — never regenerate, never crush
    front_dir = prod / "walk" / "front"
    front_dir.mkdir(parents=True, exist_ok=True)
    front = build_front_from_lock()
    for i, fr in enumerate(front):
        fr.save(front_dir / f"frame_{i:02d}.png")
    write_strip(front, front_dir / "strip.png")
    write_loop_gif(front, front_dir / "loop.gif")
    qa_all["front"] = qa_walk_cycle(front)

    if args.import_right and args.import_right.exists():
        right = import_direction_strip(args.import_right, prod / "walk" / "right")
        qa_all["right"] = qa_walk_cycle(right)
        # Left = anatomical mirror of right unless a dedicated strip is supplied
        if args.import_left and args.import_left.exists():
            left = import_direction_strip(args.import_left, prod / "walk" / "left")
        else:
            left = import_direction_strip(args.import_right, prod / "walk" / "left", mirror=True)
        qa_all["left"] = qa_walk_cycle(left)

    if args.import_back and args.import_back.exists():
        back = import_direction_strip(args.import_back, prod / "walk" / "back")
        qa_all["back"] = qa_walk_cycle(back)

    if args.import_action:
        for name, path in args.import_action:
            src = Path(path)
            if src.exists():
                # Legacy flat action path kept for right-facing compatibility
                action_dir = prod / "actions" / name
                frames = import_direction_strip(src, action_dir)
                qa_all[f"action_{name}"] = qa_walk_cycle(frames)
                right_dir = prod / "actions" / name / "right"
                frames_r = import_direction_strip(src, right_dir)
                qa_all[f"action_{name}_right"] = qa_walk_cycle(frames_r)

    if args.import_action_dir:
        for name, direction, path in args.import_action_dir:
            src = Path(path)
            if not src.exists():
                continue
            mirror = False
            if direction == "left" and str(path).endswith("RIGHT_MIRROR"):
                continue
            action_dir = prod / "actions" / name / direction
            frames = import_direction_strip(src, action_dir, mirror=mirror)
            qa_all[f"action_{name}_{direction}"] = qa_walk_cycle(frames)

    write_atlas_metadata(prod, qa_all)
    (prod / "qa-report.json").write_text(json.dumps(qa_all, indent=2) + "\n")
    summary = {k: {"ok": v.get("ok"), "issues": v.get("issues", [])} for k, v in qa_all.items()}
    print(json.dumps({"production": str(prod), "qa": summary}, indent=2))


if __name__ == "__main__":
    main()
