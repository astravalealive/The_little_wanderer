extends Node
func _ready() -> void:
	call_deferred("_run")
func _run() -> void:
	var yard := (load("res://scenes/world/woodlands_yard.tscn") as PackedScene).instantiate()
	get_tree().root.add_child(yard)
	for i in 20:
		await get_tree().process_frame
	var player := get_tree().get_first_node_in_group("player")
	var house := yard.find_child("House", true, false)
	var door := yard.find_child("DoorToInterior", true, false)
	var path := yard.find_child("PathToGrove", true, false)
	var raven_count := 0
	for n in get_tree().get_nodes_in_group(""):
		pass
	# count wildlife by class name
	var wildlife := 0
	for n in yard.find_children("*", "CharacterBody2D", true, false):
		if str(n.get_script()).find("wildlife") >= 0 or (n.has_method("get") and false):
			wildlife += 1
		if n.is_in_group("player"):
			pass
	# wildlife script sets kind raven - find by name Wildlife
	for n in yard.find_children("Wildlife*", true, false):
		wildlife += 1
	print("PHASE1_CHECK player=", player != null, " house=", house != null, " door=", door != null, " path=", path != null, " wildlife=", wildlife)
	var ok := player != null and house != null and door != null and path != null
	get_tree().quit(0 if ok else 1)
