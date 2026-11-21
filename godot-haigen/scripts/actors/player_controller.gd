extends CharacterBody2D
## Haigen using the approved HTML walk atlas (48×72 cells in 192×288).

@onready var sprite: Sprite2D = $Sprite2D

var _facing := "down"
var _walk_accum := 0.0
var _frame := 0
var _sheet: Texture2D
const FRAMES := 4

func _ready() -> void:
	_sheet = load("res://assets/source/haigen-reference-walk-atlas.webp")
	if _sheet == null:
		_sheet = load("res://assets/source/haigen-v119-movement-atlas.png")
	sprite.centered = true
	sprite.offset = Vector2(0, -GameConfig.HAIGEN_CELL.y * 0.5 + 8)
	sprite.texture_filter = CanvasItem.TEXTURE_FILTER_NEAREST
	_apply_frame()
	add_to_group("player")
	collision_layer = 2
	collision_mask = 1

func _physics_process(delta: float) -> void:
	var dir := InputRouter.get_move_vector()
	if dir.length() > 0.1:
		dir = dir.normalized()
		_update_facing(dir)
		_walk_accum += delta * 1000.0
		if _walk_accum >= GameConfig.WALK_FRAME_MS:
			_walk_accum = 0.0
			_frame = (_frame + 1) % FRAMES
		velocity = dir * GameConfig.HAIGEN_SPEED
	else:
		velocity = Vector2.ZERO
		_frame = 0
		_walk_accum = 0.0
	move_and_slide()
	_apply_frame()
	if GameConfig.PIXEL_SNAP:
		global_position = global_position.round()

func _update_facing(dir: Vector2) -> void:
	if absf(dir.x) > absf(dir.y):
		_facing = "right" if dir.x > 0.0 else "left"
	else:
		_facing = "down" if dir.y > 0.0 else "up"

func _row_for_facing() -> int:
	match _facing:
		"down": return 0
		"left": return 1
		"right": return 2
		_: return 3

func _apply_frame() -> void:
	var atlas := AtlasTexture.new()
	atlas.atlas = _sheet
	var cw := GameConfig.HAIGEN_CELL.x
	var ch := GameConfig.HAIGEN_CELL.y
	atlas.region = Rect2(_frame * cw, _row_for_facing() * ch, cw, ch)
	sprite.texture = atlas
