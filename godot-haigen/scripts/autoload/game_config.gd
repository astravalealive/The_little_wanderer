extends Node
## Metrics locked to the HTML game / Nordic visual bible.
## Source of truth for Phase 1: haigen.html cottage, door, atlas cells.

const TILE := 16
const CAMERA_ZOOM := Vector2(2, 2)
const PIXEL_SNAP := true
const IPAD_LANDSCAPE_SIZE := Vector2i(1024, 768)

## HTML homestead anchors (world space). Phase 1 maps are local pockets
## that preserve ratios around cottage (1500, 1500).
const HTML_COTTAGE := Vector2(1500, 1500)
const HTML_HOUSE_OFFSET := Vector2(35, -10) ## door/facade centre relative to cottage
const HTML_SPAWN_OFFSET := Vector2(30, 155)

const HAIGEN_SPEED := 78.0
const SKOLLI_SPEED := 70.0
const SKOLLI_FOLLOW := 28.0
const SKOLLI_STOP := 18.0
const WALK_FRAME_MS := 150

## Atlas contracts from live haigen.html
const HAIGEN_CELL := Vector2i(48, 72) ## 192×288 sheet
const SKOLLI_CELL := Vector2i(336, 176)
const RAVEN_CELL := Vector2i(96, 76)

## House tier 1 footprint (HTML widths[1]=330, heights[1]=310)
const HOUSE_TIER1_W := 330.0
const HOUSE_TIER1_H := 310.0
const DOOR_HALF := 26.0
const DOOR_FRACTION_T1 := 0.41
