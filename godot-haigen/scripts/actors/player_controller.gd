extends CharacterBody2D
## Haigen — approved walk atlas, HTML facing rows and draw scale.

@onready var sprite: Sprite2D = $Sprite2D

var _facing := "down"
var _walk_accum := 0.0
var _frame := 0
var _sheet: Texture2D
const CELL_W := 48
const CELL_H := 72
const FRAMES := 4

func _ready() -> void:
	_sheet = preload("res://assets/approved/haigen_walk.png")
	sprite.centered = true
	# HTML foot baseline: top = y - h + 7 with h = 72 * 1.67
	sprite.scale = Vector2(GameConfig.HAIGEN_DRAW_SCALE, GameConfig.HAIGEN_DRAW_SCALE)
	sprite.offset = Vector2(0, -CELL_H * 0.5 + 7.0 / GameConfig.HAIGEN_DRAW_SCALE)
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
	# HTML drawApprovedHaigen: down=0, up=1, right=2, left=3
	match _facing:
		"down":
			return 0
		"up":
			return 1
		"right":
			return 2
		_:
			return 3

func _apply_frame() -> void:
	var atlas := AtlasTexture.new()
	atlas.atlas = _sheet
	atlas.region = Rect2(_frame * CELL_W, _row_for_facing() * CELL_H, CELL_W, CELL_H)
	sprite.texture = atlas
