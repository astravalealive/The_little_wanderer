extends Node2D
## Places Haigen / Skölli / wildlife after a map load.

@export var place_skolli: bool = true
@export var place_raven: bool = true

const HAIGEN := preload("res://scenes/actors/haigen.tscn")
const SKOLLI := preload("res://scenes/actors/skolli.tscn")
const WILDLIFE := preload("res://scenes/actors/wildlife.tscn")

@onready var ysort: Node2D = get_parent().get_node("YSort")
@onready var camera: Camera2D = get_parent().get_node("FollowCamera")

func _ready() -> void:
	call_deferred("_spawn")

func _spawn() -> void:
	var spawn_id := MapRouter.take_spawn()
	var marker := _find_spawn(spawn_id)
	var pos := marker.global_position if marker else global_position

	var haigen := HAIGEN.instantiate() as CharacterBody2D
	haigen.global_position = pos
	ysort.add_child(haigen)
	if camera and camera.has_method("set_follow_target"):
		camera.call("set_follow_target", haigen)

	if place_skolli:
		var skolli := SKOLLI.instantiate() as CharacterBody2D
		skolli.global_position = pos + Vector2(-24, 12)
		ysort.add_child(skolli)

	if place_raven:
		var raven := WILDLIFE.instantiate()
		raven.set("kind", "raven")
		var raven_mark := get_node_or_null("../Markers/Raven") as Node2D
		raven.global_position = raven_mark.global_position if raven_mark else pos + Vector2(90, -40)
		ysort.add_child(raven)

func _find_spawn(spawn_id: String) -> Node2D:
	var markers := get_node_or_null("../Markers")
	if markers == null:
		return null
	if spawn_id != "" and markers.has_node(spawn_id):
		return markers.get_node(spawn_id) as Node2D
	if markers.has_node("Default"):
		return markers.get_node("Default") as Node2D
	return null
