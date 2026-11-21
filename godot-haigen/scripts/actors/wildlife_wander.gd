extends CharacterBody2D
## Simple woodland wildlife wander loop (hare or songbird).

@export var kind: String = "hare"
@export var wander_radius := 48.0

@onready var sprite: Sprite2D = $Sprite2D

var _home := Vector2.ZERO
var _goal := Vector2.ZERO
var _timer := 0.0
var _frame := 0
var _accum := 0.0
var _sheet: Texture2D
var _cell := Vector2i(32, 24)
var _speed := 28.0

func _ready() -> void:
	_home = global_position
	_goal = _home
	collision_layer = 8
	collision_mask = 1
	sprite.texture_filter = CanvasItem.TEXTURE_FILTER_NEAREST
	sprite.centered = true
	if kind == "songbird":
		_sheet = preload("res://assets/wildlife/songbird.png")
		_cell = Vector2i(24, 20)
		_speed = 36.0
		sprite.offset = Vector2(0, -10)
	else:
		_sheet = preload("res://assets/wildlife/hare.png")
		_cell = Vector2i(32, 24)
		_speed = 26.0
		sprite.offset = Vector2(0, -12)
	_pick_goal()
	_apply_frame()

func _physics_process(delta: float) -> void:
	_timer -= delta
	_accum += delta * 1000.0
	if _accum >= 220.0:
		_accum = 0.0
		_frame = (_frame + 1) % 2
		_apply_frame()
	var to_goal := _goal - global_position
	if to_goal.length() < 4.0 or _timer <= 0.0:
		_pick_goal()
		to_goal = _goal - global_position
	if to_goal.length() > 1.0:
		velocity = to_goal.normalized() * _speed
	else:
		velocity = Vector2.ZERO
	move_and_slide()
	if GameConfig.PIXEL_SNAP:
		global_position = global_position.round()

func _pick_goal() -> void:
	var angle := randf() * TAU
	var dist := randf() * wander_radius
	_goal = _home + Vector2(cos(angle), sin(angle)) * dist
	_timer = randf_range(1.2, 2.8)

func _apply_frame() -> void:
	var atlas := AtlasTexture.new()
	atlas.atlas = _sheet
	atlas.region = Rect2(_frame * _cell.x, 0, _cell.x, _cell.y)
	sprite.texture = atlas
