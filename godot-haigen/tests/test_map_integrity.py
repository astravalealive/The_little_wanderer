#!/usr/bin/env python3
"""Validate homestead MAP rows are rectangular and contain required markers."""
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BUILDER = ROOT / "scripts" / "world" / "homestead_builder.gd"


def main() -> int:
    text = BUILDER.read_text(encoding="utf-8")
    start = text.index("const MAP := [")
    end = text.index("]", start)
    block = text[start:end]
    rows = re.findall(r'"([^"]*)"', block)
    if len(rows) < 20:
        print(f"FAIL: too few map rows ({len(rows)})", file=sys.stderr)
        return 1
    width = len(rows[0])
    if width != 48:
        print(f"FAIL: expected width 48, got {width}", file=sys.stderr)
        return 1
    for i, row in enumerate(rows):
        if len(row) != width:
            print(f"FAIL: row {i} width {len(row)} != {width}", file=sys.stderr)
            return 1
    joined = "".join(rows)
    for ch in "@TC":
        if ch not in joined:
            print(f"FAIL: missing marker {ch}", file=sys.stderr)
            return 1
    if "p" not in joined or "T" not in joined:
        print("FAIL: missing path or trees", file=sys.stderr)
        return 1
    print(f"OK: map {width}x{len(rows)} with spawn/cabin/trees/paths")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
