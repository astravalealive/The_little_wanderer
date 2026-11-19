extends Node
## iPad landscape validation at the repo's 1024×768 evidence size.
## Desktop framebuffer at that viewport — not a physical iPad.

const OUT_DIR := "/tmp/haigen-ipad-validate"

func _ready() -> void:
	# Defer until the tree is idle — add_child during setup fails.
	call_deferred("_run")

func _run() -> void:
	DirAccess.make_dir_recursive_absolute(OUT_DIR)
	var failures: PackedStringArray = []
	var report := {
		"viewport": "1024x768",
		"device": "emulated-ipad-landscape-framebuffer",
		"physical_ipad": false,
	}

	var window := get_window()
	window.size = GameConfig.IPAD_LANDSCAPE_SIZE

	var main := (load("res://scenes/main.tscn") as PackedScene).instantiate()
	get_tree().root.add_child(main)

	for _i in 30:
		await get_tree().process_frame
		await get_tree().physics_frame

	var player := get_tree().get_first_node_in_group("player") as CharacterBody2D
	if player == null:
		failures.append("player missing")
		_finish(failures, report)
		return

	var camera := main.get_node("FollowCamera") as Camera2D
	var sprite := player.get_node("Sprite2D") as Sprite2D
	if sprite.texture == null:
		failures.append("haigen sprite has no texture")
	if sprite.texture_filter != CanvasItem.TEXTURE_FILTER_NEAREST:
		failures.append("haigen sprite is not nearest-neighbour")

	var baked := main.get_node_or_null("Homestead/Ground/BakedGround") as Sprite2D
	if baked == null or baked.texture == null:
		failures.append("baked ground missing")
	else:
		report["ground_texture_size"] = str(baked.texture.get_size())
		if baked.texture_filter != CanvasItem.TEXTURE_FILTER_NEAREST:
			failures.append("ground is not nearest-neighbour")

	var ground_sprites := 0
	for child in main.get_node("Homestead/Ground").get_children():
		if child is Sprite2D:
			ground_sprites += 1
	report["ground_sprite_count"] = ground_sprites
	if ground_sprites != 1:
		failures.append("expected 1 baked ground sprite, got %d" % ground_sprites)

	if not _is_pixel(camera.global_position):
		failures.append("camera not pixel-snapped at idle: %s" % camera.global_position)
	if camera.zoom != GameConfig.CAMERA_ZOOM:
		failures.append("camera zoom %s != %s" % [camera.zoom, GameConfig.CAMERA_ZOOM])

	await _shot(OUT_DIR + "/ipad-landscape-idle.png")

	var start := player.global_position
	var joy := main.get_node("HUD/TouchControls/Joystick") as Control
	var centre: Vector2 = joy.get_global_rect().get_center()
	report["joystick_rect"] = str(joy.get_global_rect())
	_touch(0, true, centre)
	await get_tree().physics_frame
	_drag(0, centre + Vector2(80, 0))
	for _i in 45:
		_drag(0, centre + Vector2(80, 0))
		await get_tree().physics_frame
	var moved := player.global_position - start
	report["joystick_delta"] = str(moved)
	report["touch_vector_while_held"] = str(InputRouter.touch_vector)
	if moved.x < 20.0:
		failures.append("joystick drag did not move Haigen right (dx=%s)" % moved.x)
	if absf(InputRouter.touch_vector.x) < 0.4:
		failures.append("touch vector too small while stick held: %s" % InputRouter.touch_vector)
	_touch(0, false, centre + Vector2(80, 0))
	await get_tree().physics_frame
	if InputRouter.touch_vector.length() > 0.01:
		failures.append("touch vector did not release")

	await _shot(OUT_DIR + "/ipad-landscape-after-stick.png")

	if not _is_pixel(camera.global_position):
		failures.append("camera not pixel-snapped after move: %s" % camera.global_position)

	var solid := _nearest_solid(player.global_position)
	if solid == null:
		failures.append("no collision body found")
	else:
		player.global_position = solid.global_position + Vector2(0, -36)
		player.velocity = Vector2.ZERO
		InputRouter.touch_vector = Vector2(0, 1)
		for _i in 60:
			await get_tree().physics_frame
		var gap := player.global_position.distance_to(solid.global_position)
		report["collision_gap"] = gap
		report["collision_target"] = str(solid.global_position)
		report["collision_player"] = str(player.global_position)
		if gap < 8.0:
			failures.append("player overlapped solid (gap %s)" % gap)
		if player.global_position.y > solid.global_position.y - 4.0:
			failures.append("player passed the solid while pushing into it")
		InputRouter.touch_vector = Vector2.ZERO

	await _shot(OUT_DIR + "/ipad-landscape-collision.png")

	InputRouter.touch_vector = Vector2(1, 0)
	var samples: Array[float] = []
	for _i in 120:
		var t0 := Time.get_ticks_usec()
		await get_tree().process_frame
		samples.append(float(Time.get_ticks_usec() - t0) / 1000.0)
	InputRouter.touch_vector = Vector2.ZERO
	samples.sort()
	var sum := 0.0
	for s in samples:
		sum += s
	report["frame_ms_avg"] = sum / float(samples.size())
	report["frame_ms_p95"] = samples[int(samples.size() * 0.95)]
	report["frame_sample_note"] = "llvmpipe/Xvfb frame gaps, not a physical iPad GPU"
	report["node_count"] = _count_nodes(get_tree().root)

	_finish(failures, report)

func _nearest_solid(from: Vector2) -> StaticBody2D:
	var best: StaticBody2D = null
	var best_d := INF
	for node in get_tree().root.find_children("*", "StaticBody2D", true, false):
		var body := node as StaticBody2D
		if body == null:
			continue
		if body.global_position.x < 32.0 or body.global_position.y < 32.0:
			continue
		if body.global_position.x > 740.0 or body.global_position.y > 560.0:
			continue
		var d := from.distance_to(body.global_position)
		if d < best_d and d > 8.0:
			best_d = d
			best = body
	return best

func _touch(index: int, pressed: bool, pos: Vector2) -> void:
	var ev := InputEventScreenTouch.new()
	ev.index = index
	ev.pressed = pressed
	ev.position = pos
	Input.parse_input_event(ev)

func _drag(index: int, pos: Vector2) -> void:
	var ev := InputEventScreenDrag.new()
	ev.index = index
	ev.position = pos
	ev.relative = Vector2(80, 0)
	ev.velocity = Vector2(400, 0)
	Input.parse_input_event(ev)

func _shot(path: String) -> void:
	await get_tree().process_frame
	await RenderingServer.frame_post_draw
	var img := get_viewport().get_texture().get_image()
	if img == null or img.get_width() < 32:
		return
	img.save_png(path)

func _is_pixel(v: Vector2) -> bool:
	return is_equal_approx(v.x, roundf(v.x)) and is_equal_approx(v.y, roundf(v.y))

func _count_nodes(n: Node) -> int:
	var c := 1
	for child in n.get_children():
		c += _count_nodes(child)
	return c

func _finish(failures: PackedStringArray, report: Dictionary) -> void:
	report["ok"] = failures.is_empty()
	report["failures"] = failures
	var file := FileAccess.open(OUT_DIR + "/report.json", FileAccess.WRITE)
	file.store_string(JSON.stringify(report, "  "))
	file.close()
	print("IPAD_VALIDATE ", JSON.stringify(report))
	get_tree().quit(0 if failures.is_empty() else 1)
