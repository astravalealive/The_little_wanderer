extends Node
## Locked metrics for Godot V1 real homestead pocket (HTML world space).

## HTML world units (cottage at 1500,1500).
const HAIGEN_SPEED := 190.0
const SKOLLI_SPEED := 170.0
const SKOLLI_FOLLOW_DISTANCE := 48.0
const SKOLLI_STOP_DISTANCE := 28.0

const WALK_FRAME_MS := 150
## ~HTML rebirth camera feel on 1024×768 (see baseCameraScale * 1.18).
const CAMERA_ZOOM := Vector2(1.15, 1.15)
const IPAD_LANDSCAPE_SIZE := Vector2i(1024, 768)
const PIXEL_SNAP := true

## Haigen: approved 48×72 cells drawn at HTML scale 1.67.
const HAIGEN_CELL := Vector2i(48, 72)
const HAIGEN_DRAW_SCALE := 1.67

## Skölli adult atlas: 336×176 cells drawn at 148×78.
const SKOLLI_CELL := Vector2i(336, 176)
const SKOLLI_DRAW_W := 148.0
const SKOLLI_DRAW_H := 78.0

const POCKET_JSON := "res://data/homestead_pocket.json"

const COL_MOSS := Color("3f5a45")
const COL_LEAF := Color("6f925c")
const COL_BARK := Color("5a4330")
const COL_PATH := Color("a89068")
const COL_WOOD := Color("b8894a")
const COL_PARCHMENT := Color("f3ead2")
const COL_WATER := Color("3f7389")
const COL_OUTLINE := Color("1d2420")
const COL_CLEARING := Color("7a9a68")
