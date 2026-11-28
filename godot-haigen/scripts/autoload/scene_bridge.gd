extends Node
## Lightweight scene-routing bridge (idea from PR #250 MapRouter).
## Keeps a single homestead project: interior is still spawned by main.gd,
## not a competing world scene. Spawn labels document door enter/exit only.
## Does not write wandererV127PreviewSave.

signal transitioned(place: String)

const PLACE_YARD := "yard"
const PLACE_INTERIOR := "interior"

var place := PLACE_YARD
var pending_spawn := ""
var last_exterior_exit := Vector2.ZERO

func mark_enter_interior(spawn_id: String = "from_yard") -> void:
	place = PLACE_INTERIOR
	pending_spawn = spawn_id
	transitioned.emit(place)

func mark_exit_to_yard(spawn_id: String = "from_interior", exit_pos: Vector2 = Vector2.ZERO) -> void:
	place = PLACE_YARD
	pending_spawn = spawn_id
	if exit_pos != Vector2.ZERO:
		last_exterior_exit = exit_pos
	transitioned.emit(place)

func take_spawn() -> String:
	var s := pending_spawn
	pending_spawn = ""
	return s

func is_inside() -> bool:
	return place == PLACE_INTERIOR
