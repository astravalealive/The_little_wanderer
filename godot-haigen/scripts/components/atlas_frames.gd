extends RefCounted
class_name AtlasFrames
## Reusable atlas region helper for character sheets (Haigen, Skölli, future actors).

static func make_region(sheet: Texture2D, frame: int, row: int, cell_w: int, cell_h: int) -> AtlasTexture:
	var atlas := AtlasTexture.new()
	atlas.atlas = sheet
	atlas.region = Rect2(frame * cell_w, row * cell_h, cell_w, cell_h)
	return atlas

static func haigen_row(facing: String) -> int:
	# HTML drawApprovedHaigen: down=0, up=1, right=2, left=3
	match facing:
		"down":
			return 0
		"up":
			return 1
		"right":
			return 2
		_:
			return 3

static func skolli_row(facing: String) -> int:
	# HTML drawApprovedSkolli: right=0, left=1, down=2, up=3
	match facing:
		"right":
			return 0
		"left":
			return 1
		"down":
			return 2
		_:
			return 3
