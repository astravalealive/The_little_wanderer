extends CharacterBody2D
## Skölli — approved adult atlas (336×176 → 148×78), HTML facing rows.

@export var follow_target_path: NodePath

@onready var sprite: Sprite2D = $Sprite2D

var _target: Node2D
var _facing := "down"
var _walk_accum := 0.0
var _frame := 0
var _sheet: Texture2D
const CELL_W := 336
const CELL_H := 176
const FRAMES := 4

func _ready() -> void:
	_sheet = preload("res://assets/approved/skolli_adult.png")
	sprite.centered = true
	var sx := GameConfig.SKOLLI_DRAW_W / float(CELL_W)
	var sy := GameConfig.SKOLLI_DRAW_H / float(CELL_H)
	sprite.scale = Vector2(sx, sy)
	# HTML draw offset (-74, -76) with foot near y.
	sprite.offset = Vector2(0, -CELL_H * 0.5 + 6.0 / sy)
	sprite.texture_filter = CanvasItem.TEXTURE_FILTER_NEAREST
	_apply_frame()
	collision_layer = 4
	collision_mask = 1
	if follow_target_path:
		_target = get_node_or_null(follow_target_path) as Node2D
	if _target == null:
		_target = get_tree().get_first_node_in_group("player") as Node2D

func _physics_process(delta: float) -> void:
	if _target == null:
		_target = get_tree().get_first_node_in_group("player") as Node2D
		if _target == null:
			return
	var to_player := _target.global_position - global_position
	var dist := to_player.length()
	if dist > GameConfig.SKOLLI_FOLLOW_DISTANCE:
		var dir := to_player.normalized()
		_update_facing(dir)
		_walk_accum += delta * 1000.0
		if _walk_accum >= GameConfig.WALK_FRAME_MS:
			_walk_accum = 0.0
			_frame = (_frame + 1) % FRAMES
		velocity = dir * GameConfig.SKOLLI_SPEED
	elif dist < GameConfig.SKOLLI_STOP_DISTANCE:
		velocity = Vector2.ZERO
		_frame = 0
	else:
		velocity = velocity.move_toward(Vector2.ZERO, GameConfig.SKOLLI_SPEED * delta)
		_frame = 0
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
	# HTML drawApprovedSkolli: right=0, left=1, down=2, up=3
	match _facing:
		"right":
			return 0
		"left":
			return 1
		"down":
			return 2
		_:
			return 3

func _apply_frame() -> void:
	var atlas := AtlasTexture.new()
	atlas.atlas = _sheet
	atlas.region = Rect2(_frame * CELL_W, _row_for_facing() * CELL_H, CELL_W, CELL_H)
	sprite.texture = atlas
