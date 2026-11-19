#!/usr/bin/env bash
# Headless boot smoke for the Godot homestead prototype.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
GODOT_BIN="${1:-${GODOT:-godot}}"
if [[ ! -x "$GODOT_BIN" ]] && ! command -v "$GODOT_BIN" >/dev/null 2>&1; then
  echo "Godot binary not found: $GODOT_BIN" >&2
  exit 2
fi
echo "Smoke: importing/booting $ROOT with $GODOT_BIN"
"$GODOT_BIN" --headless --path "$ROOT" --quit-after 3
echo "Smoke OK"
