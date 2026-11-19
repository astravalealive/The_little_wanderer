extends CharacterBody2D
## Skölli from skolli-adult-approved.webp (336×176 cells).

@onready var sprite: Sprite2D = $Sprite2D

var _target: Node2D
var _facing := "down"
var _walk_accum := 0.0
var _frame := 0
var _sheet: Texture2D
const FRAMES := 4
## Draw scale so the large approved cell reads near HTML on-screen footprint (~148×78).
const DRAW_SCALE := 0.35

func _ready() -> void:
	_sheet = load("res://assets/source/skolli_walk_sheet.png")
	sprite.centered = true
	sprite.scale = Vector2(DRAW_SCALE, DRAW_SCALE)
	sprite.offset = Vector2(0, -GameConfig.SKOLLI_CELL.y * 0.5 + 20)
	sprite.texture_filter = CanvasItem.TEXTURE_FILTER_NEAREST
	_apply_frame()
	collision_layer = 4
	collision_mask = 1
	_target = get_tree().get_first_node_in_group("player") as Node2D

func _physics_process(delta: float) -> void:
	if _target == null:
		_target = get_tree().get_first_node_in_group("player") as Node2D
		if _target == null:
			return
	var to_player := _target.global_position - global_position
	var dist := to_player.length()
	if dist > GameConfig.SKOLLI_FOLLOW:
		var dir := to_player.normalized()
		_update_facing(dir)
		_walk_accum += delta * 1000.0
		if _walk_accum >= GameConfig.WALK_FRAME_MS:
			_walk_accum = 0.0
			_frame = (_frame + 1) % FRAMES
		velocity = dir * GameConfig.SKOLLI_SPEED
	elif dist < GameConfig.SKOLLI_STOP:
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
	match _facing:
		"down": return 0
		"left": return 1
		"right": return 2
		_: return 3

func _apply_frame() -> void:
	var atlas := AtlasTexture.new()
	atlas.atlas = _sheet
	var cw := GameConfig.SKOLLI_CELL.x
	var ch := GameConfig.SKOLLI_CELL.y
	atlas.region = Rect2(_frame * cw, _row_for_facing() * ch, cw, ch)
	sprite.texture = atlas
