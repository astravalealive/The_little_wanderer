extends Node2D
## Builds the real cottage-area pocket from exported HTML world data.

@onready var ground: Node2D = $Ground
@onready var props: Node2D = $Props
@onready var ysort: Node2D = $YSort

var spawn_world := Vector2(1530, 1655)
var pocket: Dictionary = {}
var house: Dictionary = {}
var _door_body: Area2D

const ART := {
	"tree": preload("res://assets/approved/tree.png"),
	"rock_a": preload("res://assets/approved/rock_a.png"),
	"rock_b": preload("res://assets/approved/rock_b.png"),
	"fir": preload("res://assets/approved/fir.png"),
	"bare_a": preload("res://assets/approved/bare_a.png"),
	"bare_b": preload("res://assets/approved/bare_b.png"),
	"house": preload("res://assets/approved/house_tier1_exterior.png"),
	"coop": preload("res://assets/approved/coop.png"),
	"garden": preload("res://assets/approved/garden.png"),
}

func _ready() -> void:
	_load_pocket()
	_build()

func _load_pocket() -> void:
	var f := FileAccess.open(GameConfig.POCKET_JSON, FileAccess.READ)
	if f == null:
		push_error("Missing homestead pocket JSON")
		return
	var parsed: Variant = JSON.parse_string(f.get_as_text())
	f.close()
	if typeof(parsed) != TYPE_DICTIONARY:
		push_error("Invalid homestead pocket JSON")
		return
	pocket = parsed
	house = pocket.get("house", {})
	var spawn: Dictionary = pocket.get("spawn", {})
	spawn_world = Vector2(float(spawn.get("x", 1530.0)), float(spawn.get("y", 1655.0)))

func _build() -> void:
	_add_ground()
	_add_pond()
	_place_plots()
	_place_house()
	_place_solids()
	_add_world_bounds()
	_add_door_sensor()

func _add_ground() -> void:
	var p: Dictionary = pocket.get("pocket", {})
	var min_x := float(p.get("min_x", 780.0))
	var max_x := float(p.get("max_x", 2220.0))
	var min_y := float(p.get("min_y", 780.0))
	var max_y := float(p.get("max_y", 2220.0))
	var w := int(ceil(max_x - min_x))
	var h := int(ceil(max_y - min_y))
	var img := Image.create(w, h, false, Image.FORMAT_RGBA8)
	var moss := GameConfig.COL_MOSS
	var leaf := GameConfig.COL_CLEARING
	for y in range(h):
		for x in range(w):
			var wx := min_x + x
			var wy := min_y + y
			var to_cottage := Vector2(wx - 1500.0, wy - 1500.0).length()
			var c := leaf if to_cottage < 280.0 else moss
			# Soft path toward lake / cottage front (Heartland readability feel).
			var path_dx := absf(wx - 1505.0)
			var path_dy := wy - 1503.0
			if path_dx < 28.0 and path_dy > 0.0 and path_dy < 220.0:
				c = GameConfig.COL_PATH
			if (x * 17 + y * 31) % 47 == 0:
				c = c.lightened(0.04)
			img.set_pixel(x, y, c)
	var baked := Sprite2D.new()
	baked.name = "BakedGround"
	baked.texture = ImageTexture.create_from_image(img)
	baked.centered = false
	baked.position = Vector2(min_x, min_y)
	baked.texture_filter = CanvasItem.TEXTURE_FILTER_NEAREST
	baked.z_index = -20
	ground.add_child(baked)

func _add_pond() -> void:
	var pond: Dictionary = pocket.get("pond", {})
	if pond.is_empty():
		return
	var s := Polygon2D.new()
	var rx := float(pond.get("rx", 330.0))
	var ry := float(pond.get("ry", 240.0))
	var pts: PackedVector2Array = []
	for i in range(24):
		var a := TAU * float(i) / 24.0
		pts.append(Vector2(cos(a) * rx, sin(a) * ry))
	s.polygon = pts
	s.color = GameConfig.COL_WATER
	s.position = Vector2(float(pond.get("x", 850.0)), float(pond.get("y", 1700.0)))
	s.z_index = -15
	ground.add_child(s)
	# Soft water block (ellipse approx as rect for V1).
	_add_blocking(s.position, Vector2(rx * 1.4, ry * 1.4))

func _place_plots() -> void:
	for plot in pocket.get("plots", []):
		var asset_path := str(plot.get("asset", ""))
		if asset_path.is_empty():
			continue
		var tex: Texture2D = null
		match str(plot.get("kind", "")):
			"coop":
				tex = ART["coop"]
			"garden":
				tex = ART["garden"]
			_:
				continue
		var pos := Vector2(float(plot.get("x", 0.0)), float(plot.get("y", 0.0)))
		var draw_w := float(plot.get("draw_w", 180.0))
		var scale := draw_w / float(tex.get_width())
		var root := Node2D.new()
		root.position = pos
		var spr := Sprite2D.new()
		spr.texture = tex
		spr.centered = true
		spr.scale = Vector2(scale, scale)
		spr.position = Vector2(0, -tex.get_height() * scale * 0.35)
		spr.texture_filter = CanvasItem.TEXTURE_FILTER_NEAREST
		root.add_child(spr)
		ysort.add_child(root)
		# Light footprints so Haigen cannot walk through built plots.
		_add_blocking(pos + Vector2(0, 8), Vector2(draw_w * 0.45, 36))

func _place_house() -> void:
	if house.is_empty():
		return
	var anchor := Vector2(float(house.get("anchor_x", 1535.0)), float(house.get("anchor_y", 1490.0)))
	var draw_w := float(house.get("draw_w", 330.0))
	var tex: Texture2D = ART["house"]
	var scale := draw_w / float(tex.get_width())
	var draw_h := float(tex.get_height()) * scale
	var root := Node2D.new()
	root.name = "Cottage"
	root.position = anchor
	var spr := Sprite2D.new()
	spr.texture = tex
	spr.centered = true
	spr.scale = Vector2(scale, scale)
	# HTML: drawImage at (x - drawW/2, y+15 - drawH)
	spr.position = Vector2(0, 15.0 - draw_h * 0.5)
	spr.texture_filter = CanvasItem.TEXTURE_FILTER_NEAREST
	root.add_child(spr)
	ysort.add_child(root)

	var half_w := float(house.get("half_width", 141.9))
	var front := float(house.get("front", 1503.0))
	var back := float(house.get("back", 1248.2))
	var door_x := float(house.get("exterior_door_x", 1505.3))
	var door_half := float(house.get("door_half", 26.0))
	var mid_y := (front + back) * 0.5
	var body_h := front - back
	# Left / right wall blocks with a door gap on the south face.
	_add_blocking(Vector2(anchor.x - half_w * 0.55, mid_y), Vector2(half_w * 0.7, body_h * 0.85))
	_add_blocking(Vector2(anchor.x + half_w * 0.55, mid_y), Vector2(half_w * 0.7, body_h * 0.85))
	# Roof / back strip.
	_add_blocking(Vector2(anchor.x, back + body_h * 0.18), Vector2(half_w * 1.7, body_h * 0.28))
	# Front wings beside door.
	var wing_w := (half_w - door_half) * 0.85
	_add_blocking(Vector2(door_x - door_half - wing_w * 0.55, front - 18), Vector2(wing_w, 36))
	_add_blocking(Vector2(door_x + door_half + wing_w * 0.55, front - 18), Vector2(wing_w, 36))

func _place_solids() -> void:
	for s in pocket.get("solids", []):
		var art_key := str(s.get("art", "tree"))
		if not ART.has(art_key):
			art_key = "tree"
		var tex: Texture2D = ART[art_key]
		var pos := Vector2(float(s.get("x", 0.0)), float(s.get("y", 0.0)))
		var draw_size := float(s.get("draw_size", 136.0))
		var scale := draw_size / float(tex.get_width())
		var root := Node2D.new()
		root.position = pos
		var spr := Sprite2D.new()
		spr.texture = tex
		spr.centered = true
		spr.scale = Vector2(scale, scale)
		spr.position = Vector2(0, -draw_size * 0.38)
		spr.texture_filter = CanvasItem.TEXTURE_FILTER_NEAREST
		root.add_child(spr)
		ysort.add_child(root)
		var rad := float(s.get("solid_radius", 14.0))
		_add_circle_block(pos + Vector2(0, 6), rad)

func _add_door_sensor() -> void:
	# Marker only — enter/exit is polled by main.gd like HTML crossedIn/Out.
	if house.is_empty():
		return
	var door_x := float(house.get("exterior_door_x", 1505.3))
	var front := float(house.get("front", 1503.0))
	var marker := Node2D.new()
	marker.name = "DoorMarker"
	marker.position = Vector2(door_x, front)
	props.add_child(marker)
	_door_body = null

func get_door_exit_position() -> Vector2:
	if house.is_empty():
		return spawn_world
	return Vector2(float(house.get("exterior_door_x", 1505.3)), float(house.get("front", 1503.0)) + 20.0)

func door_geometry() -> Dictionary:
	return house.duplicate()

func _add_blocking(pos: Vector2, size: Vector2) -> void:
	var body := StaticBody2D.new()
	body.position = pos
	body.collision_layer = 1
	body.collision_mask = 0
	var shape := CollisionShape2D.new()
	var rect := RectangleShape2D.new()
	rect.size = size
	shape.shape = rect
	body.add_child(shape)
	props.add_child(body)

func _add_circle_block(pos: Vector2, radius: float) -> void:
	var body := StaticBody2D.new()
	body.position = pos
	body.collision_layer = 1
	body.collision_mask = 0
	var shape := CollisionShape2D.new()
	var circle := CircleShape2D.new()
	circle.radius = maxf(8.0, radius)
	shape.shape = circle
	body.add_child(shape)
	props.add_child(body)

func _add_world_bounds() -> void:
	var p: Dictionary = pocket.get("pocket", {})
	var min_x := float(p.get("min_x", 780.0))
	var max_x := float(p.get("max_x", 2220.0))
	var min_y := float(p.get("min_y", 780.0))
	var max_y := float(p.get("max_y", 2220.0))
	var thickness := 40.0
	var cx := (min_x + max_x) * 0.5
	var cy := (min_y + max_y) * 0.5
	var w := max_x - min_x
	var h := max_y - min_y
	_add_blocking(Vector2(cx, min_y - thickness * 0.5), Vector2(w + thickness * 2.0, thickness))
	_add_blocking(Vector2(cx, max_y + thickness * 0.5), Vector2(w + thickness * 2.0, thickness))
	_add_blocking(Vector2(min_x - thickness * 0.5, cy), Vector2(thickness, h + thickness * 2.0))
	_add_blocking(Vector2(max_x + thickness * 0.5, cy), Vector2(thickness, h + thickness * 2.0))
