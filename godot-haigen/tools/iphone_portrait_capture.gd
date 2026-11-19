extends Node
## Capture 390×844 portrait evidence shots (framebuffer, not a physical iPhone).

const OUT_DIR := "/tmp/haigen-iphone-validate"
const PHONE := Vector2i(390, 844)

func _ready() -> void:
	call_deferred("_run")

func _run() -> void:
	DirAccess.make_dir_recursive_absolute(OUT_DIR)
	var window := get_window()
	window.size = PHONE

	var main := (load("res://scenes/main.tscn") as PackedScene).instantiate()
	get_tree().root.add_child(main)
	for _i in 40:
		await get_tree().process_frame
		await get_tree().physics_frame

	var player := get_tree().get_first_node_in_group("player") as CharacterBody2D
	var camera := main.get_node("FollowCamera") as Camera2D
	# Slightly wider framing so the cottage pocket still reads on a narrow view.
	camera.zoom = Vector2(0.85, 0.85)
	await _shot(OUT_DIR + "/iphone-390x844-idle.png")

	var homestead := main.get_node("Homestead")
	var door: Dictionary = homestead.door_geometry()
	var door_x := float(door.get("exterior_door_x", 1505.3))
	var front := float(door.get("front", 1503.0))
	player.global_position = Vector2(door_x, front + 80.0)
	for _i in 5:
		await get_tree().physics_frame
	await _shot(OUT_DIR + "/iphone-390x844-door-approach.png")

	InputRouter.touch_vector = Vector2(0, -1)
	for _i in 100:
		await get_tree().physics_frame
	InputRouter.touch_vector = Vector2.ZERO
	for _i in 20:
		await get_tree().physics_frame
	await _shot(OUT_DIR + "/iphone-390x844-interior.png")

	var evidence := ProjectSettings.globalize_path("res://docs/evidence")
	DirAccess.make_dir_recursive_absolute(evidence)
	for name in ["iphone-390x844-idle.png", "iphone-390x844-door-approach.png", "iphone-390x844-interior.png"]:
		var src: String = OUT_DIR + "/" + name
		if FileAccess.file_exists(src):
			DirAccess.copy_absolute(src, evidence.path_join(name))
	print("IPHONE_CAPTURE ok")
	get_tree().quit(0)

func _shot(path: String) -> void:
	await get_tree().process_frame
	await RenderingServer.frame_post_draw
	var img := get_viewport().get_texture().get_image()
	if img:
		img.save_png(path)
