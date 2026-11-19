extends Node2D
## Boots the homestead slice and wires actors + camera.

@onready var homestead: Node2D = $Homestead
@onready var actors: Node2D = $Actors
@onready var camera: Camera2D = $FollowCamera

const HAIGEN_SCENE := preload("res://scenes/actors/haigen.tscn")
const SKOLLI_SCENE := preload("res://scenes/actors/skolli.tscn")
const WILDLIFE_SCENE := preload("res://scenes/actors/wildlife.tscn")

var _spawned := false

func _ready() -> void:
	var spawn: Vector2 = homestead.spawn_world
	_spawn_cast(spawn)

func _spawn_cast(spawn: Vector2) -> void:
	if _spawned:
		return
	_spawned = true

	var haigen := HAIGEN_SCENE.instantiate() as CharacterBody2D
	haigen.position = spawn
	actors.add_child(haigen)

	var skolli := SKOLLI_SCENE.instantiate() as CharacterBody2D
	skolli.position = spawn + Vector2(-22, 10)
	actors.add_child(skolli)

	var hare := WILDLIFE_SCENE.instantiate()
	hare.set("kind", "hare")
	hare.position = spawn + Vector2(64, 40)
	actors.add_child(hare)

	var bird := WILDLIFE_SCENE.instantiate()
	bird.set("kind", "songbird")
	bird.position = spawn + Vector2(-70, -30)
	actors.add_child(bird)

	if camera.has_method("set_follow_target"):
		camera.call("set_follow_target", haigen)
