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

## HTML draws haigen-trails.webp stretched to 7800×7800 world units.
const TRAILS_WORLD := 7800.0
const TRAILS_TEX := preload("res://assets/approved/haigen_trails.webp")


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

func _road_distance(wx: float, wy: float) -> float:
	var best := INF
	for route in pocket.get("road_routes", []):
		if typeof(route) != TYPE_ARRAY:
			continue
		var pts: Array = route
		for i in range(1, pts.size()):
			var a: Dictionary = pts[i - 1]
			var b: Dictionary = pts[i]
			var ax := float(a.get("x", 0.0))
			var ay := float(a.get("y", 0.0))
			var bx := float(b.get("x", 0.0))
			var by := float(b.get("y", 0.0))
			var dx := bx - ax
			var dy := by - ay
			var denom := dx * dx + dy * dy
			var t := 0.0
			if denom > 0.0:
				t = clampf(((wx - ax) * dx + (wy - ay) * dy) / denom, 0.0, 1.0)
			best = minf(best, Vector2(wx - ax - t * dx, wy - ay - t * dy).length())
	return best

func _add_ground() -> void:
	var p: Dictionary = pocket.get("pocket", {})
	var min_x := float(p.get("min_x", 780.0))
	var max_x := float(p.get("max_x", 2220.0))
	var min_y := float(p.get("min_y", 780.0))
	var max_y := float(p.get("max_y", 2220.0))
	# HTML order: moss/clearing base, then paintedTrails overlay (mostly alpha),
	# then Job 233 soil glaze on live roadRoutes (incl. cottage→pond).
	_add_composite_ground(min_x, max_x, min_y, max_y)

func _add_composite_ground(min_x: float, max_x: float, min_y: float, max_y: float) -> void:
	## Moss base at 1 world-unit/pixel, with approved trails + route glaze on top.
	var w := int(ceil(max_x - min_x))
	var h := int(ceil(max_y - min_y))
	var img := Image.create(w, h, false, Image.FORMAT_RGBA8)
	var moss := GameConfig.COL_MOSS
	var leaf := GameConfig.COL_CLEARING
	for y in range(h):
		for x in range(w):
			var wx := min_x + float(x)
			var wy := min_y + float(y)
			var to_cottage := Vector2(wx - 1500.0, wy - 1500.0).length()
			var c := leaf if to_cottage < 280.0 else moss
			if (x * 17 + y * 31) % 47 == 0:
				c = c.lightened(0.04)
			img.set_pixel(x, y, c)

	var src: Image = TRAILS_TEX.get_image()
	var trails_ok := src != null and src.get_width() >= 64
	if trails_ok:
		if src.get_format() != Image.FORMAT_RGBA8:
			src.convert(Image.FORMAT_RGBA8)
		var scale := TRAILS_WORLD / float(src.get_width())
		# Sample trails (world → trails pixel = world / 3) onto the moss bake.
		for y in range(h):
			for x in range(w):
				var wx := min_x + float(x)
				var wy := min_y + float(y)
				var tx := int(floor(wx / scale))
				var ty := int(floor(wy / scale))
				if tx < 0 or ty < 0 or tx >= src.get_width() or ty >= src.get_height():
					continue
				var tcol := src.get_pixel(tx, ty)
				if tcol.a < 0.08:
					continue
				img.set_pixel(x, y, _alpha_over(img.get_pixel(x, y), tcol))

	# Bake Job 233 soil glaze into the same texture (routes newer than trails art).
	_paint_road_glaze_into(img, min_x, min_y, 1)

	var baked := Sprite2D.new()
	baked.name = "BakedGround"
	baked.texture = ImageTexture.create_from_image(img)
	baked.centered = false
	baked.position = Vector2(min_x, min_y)
	baked.texture_filter = CanvasItem.TEXTURE_FILTER_NEAREST
	baked.z_index = -20
	baked.set_meta("trails_composited", trails_ok)
	baked.set_meta("road_glaze_baked", true)
	baked.set_meta("ground_mode", "moss_plus_trails_plus_glaze" if trails_ok else "moss_plus_glaze")
	ground.add_child(baked)
	# Keep a named marker so validators can assert glaze without a second sprite.
	var marker := Node2D.new()
	marker.name = "RoadGlaze"
	marker.set_meta("baked_into_ground", true)
	ground.add_child(marker)

func _paint_road_glaze_into(img: Image, min_x: float, min_y: float, step: int) -> void:
	## HTML Job 233 soil glaze (visual only; route collision geometry unchanged).
	var widths: Array = pocket.get("road_widths", [])
	var routes: Array = pocket.get("road_routes", [])
	for ri in range(routes.size()):
		var width := 34.0
		if ri < widths.size():
			width = float(widths[ri])
		var outer := maxf(8.0, width - 10.0)
		var inner := maxf(4.0, width - 22.0)
		_stroke_road_on_image(img, routes[ri], min_x, min_y, step, outer, Color("7a654888"))
		_stroke_road_on_image(img, routes[ri], min_x, min_y, step, inner, Color("5e4d36a0"))

func _stroke_road_on_image(
	img: Image, route: Variant, min_x: float, min_y: float, step: int, half_w: float, col: Color
) -> void:
	if typeof(route) != TYPE_ARRAY:
		return
	var pts: Array = route
	for i in range(1, pts.size()):
		var a: Dictionary = pts[i - 1]
		var b: Dictionary = pts[i]
		var ax := float(a.get("x", 0.0))
		var ay := float(a.get("y", 0.0))
		var bx := float(b.get("x", 0.0))
		var by := float(b.get("y", 0.0))
		var dist := Vector2(bx - ax, by - ay).length()
		var samples := maxi(1, int(ceil(dist / float(step))))
		for s in range(samples + 1):
			var t := float(s) / float(samples)
			var wx := lerpf(ax, bx, t)
			var wy := lerpf(ay, by, t)
			var px := int(round((wx - min_x) / float(step)))
			var py := int(round((wy - min_y) / float(step)))
			var r := int(ceil(half_w / float(step)))
			for oy in range(-r, r + 1):
				for ox in range(-r, r + 1):
					if ox * ox + oy * oy > r * r:
						continue
					var xx := px + ox
					var yy := py + oy
					if xx < 0 or yy < 0 or xx >= img.get_width() or yy >= img.get_height():
						continue
					var prev := img.get_pixel(xx, yy)
					img.set_pixel(xx, yy, _alpha_over(prev, col))

func _lake_radius(angle: float) -> float:
	## Simplified HTML lakeRadius: base ripple + east-shore irregularity.
	var base := 1.0 + 0.12 * sin(angle * 3.0 + 0.6) + 0.10 * cos(angle * 5.0 - 1.0) + 0.055 * sin(angle * 9.0 + 2.0)
	var east := maxf(0.0, cos(angle))
	var pond: Dictionary = pocket.get("pond", {})
	var py := float(pond.get("y", 1700.0)) + sin(angle) * float(pond.get("ry", 240.0)) * base
	var t := (py - (float(pond.get("y", 1700.0)) - 1900.0)) / 2700.0
	t = clampf(t, 0.0, 1.0)
	var fade := pow(maxf(0.0, sin(PI * t)), 1.3)
	var irregular := 72.0 * sin(t * 17.1 + 0.3) + 44.0 * sin(t * 29.7 - 0.9) + 22.0 * sin(t * 47.2 + 1.7)
	return base + east * fade * irregular / float(pond.get("rx", 330.0))

func _add_pond() -> void:
	var pond: Dictionary = pocket.get("pond", {})
	if pond.is_empty():
		return
	var rx := float(pond.get("rx", 330.0))
	var ry := float(pond.get("ry", 240.0))
	var centre := Vector2(float(pond.get("x", 850.0)), float(pond.get("y", 1700.0)))
	# Depth bands: deep → mid → shallow shoreline (approved water palette).
	var bands := [
		{"level": 1.0, "color": Color("2d5a6e"), "z": -16},
		{"level": 0.82, "color": GameConfig.COL_WATER, "z": -15},
		{"level": 0.62, "color": Color("5a8fa3"), "z": -14},
	]
	for band in bands:
		var s := Polygon2D.new()
		var pts: PackedVector2Array = []
		var level: float = band["level"]
		for i in range(48):
			var a := TAU * float(i) / 48.0
			var r := _lake_radius(a) * level
			pts.append(Vector2(cos(a) * rx * r, sin(a) * ry * r))
		s.polygon = pts
		s.color = band["color"]
		s.position = centre
		s.z_index = int(band["z"])
		ground.add_child(s)
	# Pale shoreline lip just outside the outer band.
	var foam := Polygon2D.new()
	var foam_pts: PackedVector2Array = []
	for i in range(48):
		var a := TAU * float(i) / 48.0
		var r := _lake_radius(a) * 1.05
		foam_pts.append(Vector2(cos(a) * rx * r, sin(a) * ry * r))
	foam.polygon = foam_pts
	foam.color = Color(0.81, 0.89, 0.91, 0.35)
	foam.position = centre
	foam.z_index = -17
	ground.add_child(foam)
	# Block deep water (AABB covering most of the irregular pond body).
	_add_blocking(centre, Vector2(rx * 1.55, ry * 1.45))

func _alpha_over(dst: Color, src: Color) -> Color:
	var out_a := src.a + dst.a * (1.0 - src.a)
	if out_a <= 0.0001:
		return Color(0, 0, 0, 0)
	var out_r := (src.r * src.a + dst.r * dst.a * (1.0 - src.a)) / out_a
	var out_g := (src.g * src.a + dst.g * dst.a * (1.0 - src.a)) / out_a
	var out_b := (src.b * src.a + dst.b * dst.a * (1.0 - src.a)) / out_a
	return Color(out_r, out_g, out_b, out_a)

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
