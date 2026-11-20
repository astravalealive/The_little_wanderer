extends Node
## Door / map transitions for connected Woodlands scenes.
## Does not write wandererV127PreviewSave (HTML saves stay untouched).

signal map_changed(map_id: String)

var pending_spawn := ""
var last_map := "yard"

const MAPS := {
	"yard": "res://scenes/world/woodlands_yard.tscn",
	"interior": "res://scenes/world/house_interior.tscn",
	"grove_path": "res://scenes/world/grove_path.tscn",
}

func go(map_id: String, spawn_id: String = "") -> void:
	if not MAPS.has(map_id):
		push_error("Unknown map %s" % map_id)
		return
	pending_spawn = spawn_id
	last_map = map_id
	get_tree().change_scene_to_file(MAPS[map_id])
	map_changed.emit(map_id)

func take_spawn() -> String:
	var s := pending_spawn
	pending_spawn = ""
	return s
