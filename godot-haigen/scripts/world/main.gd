extends Node2D
## Boots the real homestead pocket, door enter/exit, and camera.

@onready var homestead: Node2D = $Homestead
@onready var camera: Camera2D = $FollowCamera
@onready var hint: Label = $HUD/Hint

const HAIGEN_SCENE := preload("res://scenes/actors/haigen.tscn")
const SKOLLI_SCENE := preload("res://scenes/actors/skolli.tscn")
const INTERIOR_SCENE := preload("res://scenes/interior/cottage_interior.tscn")

var _spawned := false
var _haigen: CharacterBody2D
var _skolli: CharacterBody2D
var _prev_player := Vector2.ZERO
var _home_inside := false
var _interior: Node2D
var _cooldown_ms := 0.0

func _ready() -> void:
	add_to_group("homestead_bus")
	_spawn_cast(homestead.spawn_world)
	hint.text = "Homestead V1 — WASD / stick. Walk up into the cottage door. iPad 1024×768."

func _spawn_cast(spawn: Vector2) -> void:
	if _spawned:
		return
	_spawned = true
	var sort_root: Node2D = homestead.get_node("YSort")
	_haigen = HAIGEN_SCENE.instantiate() as CharacterBody2D
	_haigen.position = spawn
	sort_root.add_child(_haigen)

	var skolli_spawn := spawn + Vector2(-28, 18)
	var pocket: Dictionary = homestead.pocket
	if pocket.has("skolli_spawn"):
		var ss: Dictionary = pocket["skolli_spawn"]
		skolli_spawn = Vector2(float(ss.get("x", skolli_spawn.x)), float(ss.get("y", skolli_spawn.y)))

	_skolli = SKOLLI_SCENE.instantiate() as CharacterBody2D
	_skolli.position = skolli_spawn
	sort_root.add_child(_skolli)

	if camera.has_method("set_follow_target"):
		camera.call("set_follow_target", _haigen)
	_prev_player = _haigen.global_position

func _physics_process(delta: float) -> void:
	if _haigen == null:
		return
	_cooldown_ms = maxf(0.0, _cooldown_ms - delta * 1000.0)
	if _home_inside:
		_poll_exit()
	else:
		_poll_enter()
	_prev_player = _haigen.global_position

func _poll_enter() -> void:
	if _cooldown_ms > 0.0:
		return
	var g: Dictionary = homestead.door_geometry()
	if g.is_empty():
		return
	var door_x := float(g.get("exterior_door_x", 1505.3))
	var front := float(g.get("front", 1503.0))
	var door_half := float(g.get("door_half", 26.0))
	var within := absf(_haigen.global_position.x - door_x) <= door_half
	var crossed := (
		within
		and _haigen.global_position.y < _prev_player.y
		and _prev_player.y >= front - 12.0
		and _haigen.global_position.y <= front + 24.0
	)
	if crossed:
		enter_home()

func _poll_exit() -> void:
	if _interior == null or _cooldown_ms > 0.0:
		return
	if _interior.has_method("wants_exit") and _interior.call("wants_exit", _haigen, _prev_player):
		exit_home()

func enter_home() -> void:
	if _home_inside:
		return
	_home_inside = true
	_cooldown_ms = 500.0
	homestead.visible = false
	if _skolli:
		_skolli.visible = false
		_skolli.set_physics_process(false)
	_interior = INTERIOR_SCENE.instantiate() as Node2D
	add_child(_interior)
	_haigen.get_parent().remove_child(_haigen)
	_interior.add_child(_haigen)
	_haigen.global_position = _interior.call("spawn_position") as Vector2
	_prev_player = _haigen.global_position
	if camera.has_method("set_follow_target"):
		camera.call("set_follow_target", _haigen)
	hint.text = "Inside the cottage — walk down through the doorway to leave."

func exit_home() -> void:
	if not _home_inside:
		return
	_home_inside = false
	_cooldown_ms = 500.0
	var exit_pos: Vector2 = homestead.get_door_exit_position()
	if _interior:
		_interior.remove_child(_haigen)
		_interior.queue_free()
		_interior = null
	homestead.visible = true
	homestead.get_node("YSort").add_child(_haigen)
	_haigen.global_position = exit_pos
	_prev_player = exit_pos
	if _skolli:
		_skolli.visible = true
		_skolli.set_physics_process(true)
	if camera.has_method("set_follow_target"):
		camera.call("set_follow_target", _haigen)
	hint.text = "Homestead V1 — WASD / stick. Walk up into the cottage door. iPad 1024×768."
