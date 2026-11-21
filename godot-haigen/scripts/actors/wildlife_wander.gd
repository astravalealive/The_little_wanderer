extends CharacterBody2D
## In-game woodland wildlife. Raven uses the approved regional-fauna cell.

@export var kind: String = "raven"

@onready var sprite: Sprite2D = $Sprite2D

var _home := Vector2.ZERO
var _goal := Vector2.ZERO
var _timer := 0.0
var _speed := 32.0

func _ready() -> void:
	_home = global_position
	_goal = _home
	collision_layer = 8
	collision_mask = 1
	sprite.centered = true
	sprite.texture_filter = CanvasItem.TEXTURE_FILTER_NEAREST
	if kind == "raven":
		sprite.texture = load("res://assets/source/raven.png")
		sprite.offset = Vector2(0, -20)
		_speed = 40.0
	_pick_goal()

func _physics_process(delta: float) -> void:
	_timer -= delta
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
	_goal = _home + Vector2(cos(angle), sin(angle)) * randf_range(20.0, 70.0)
	_timer = randf_range(1.4, 3.0)
