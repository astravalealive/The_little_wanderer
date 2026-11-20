extends Node2D
## Real Ancient Woodlands homestead pocket around HTML cottage (1500,1500).
## Uses approved house-tier-1, environment atlas props, and trail crop.

@onready var ground: Sprite2D = $Ground
@onready var ysort: Node2D = $YSort
@onready var props: Node2D = $Props

func _ready() -> void:
	_paint_ground()
	_place_house()
	_place_scenery()
	_place_bounds()

func _paint_ground() -> void:
	## Crop a homestead-centred patch from the approved trails painting.
	var trails: Texture2D = load("res://assets/source/haigen-trails.webp")
	if trails:
		var img := trails.get_image()
		## trails is 2600² world paint; crop around cottage-ish centre.
		var cx := int(img.get_width() * 0.42)
		var cy := int(img.get_height() * 0.38)
		var w := 640
		var h := 480
		var x0 := clampi(cx - w / 2, 0, img.get_width() - w)
		var y0 := clampi(cy - h / 2, 0, img.get_height() - h)
		var crop := img.get_region(Rect2i(x0, y0, w, h))
		if crop.get_format() != Image.FORMAT_RGBA8:
			crop.convert(Image.FORMAT_RGBA8)
		ground.texture = ImageTexture.create_from_image(crop)
		ground.centered = false
		ground.position = Vector2.ZERO
		ground.texture_filter = CanvasItem.TEXTURE_FILTER_NEAREST
		ground.z_index = -20
	else:
		ground.modulate = Color("3f5a45")

func _place_house() -> void:
	## HTML: house at cottage+(35,-10); door fraction 0.41 on tier-1 width 330.
	var root := Node2D.new()
	root.name = "House"
	root.position = Vector2(320, 200)
	var s := Sprite2D.new()
	s.texture = load("res://assets/source/house-tier-1-clean.png")
	s.centered = true
	s.texture_filter = CanvasItem.TEXTURE_FILTER_NEAREST
	## Match HTML draw scale roughly (drawW≈330).
	var tex_w := float(s.texture.get_width())
	var scale := GameConfig.HOUSE_TIER1_W / tex_w
	s.scale = Vector2(scale, scale)
	s.position = Vector2(0, -40)
	root.add_child(s)
	ysort.add_child(root)
	## Footprint block (walls). Door gap handled by DoorZone only.
	_block(root.position + Vector2(0, 10), Vector2(120, 36))
	## Garden + coop from approved PNGs
	_prop(Vector2(460, 160), "res://assets/source/garden-tier-1.png", 0.55, Vector2(40, 24))
	_prop(Vector2(180, 250), "res://assets/source/coop-woodland.png", 0.7, Vector2(36, 20))

func _place_scenery() -> void:
	var spots := [
		Vector2(80, 90), Vector2(140, 70), Vector2(520, 80), Vector2(580, 120),
		Vector2(60, 300), Vector2(100, 360), Vector2(560, 340), Vector2(600, 280),
		Vector2(200, 100), Vector2(480, 300),
	]
	var kinds := ["tree", "fir", "tree", "bush", "rock", "stump", "tree", "fir", "mushroom", "tree"]
	for i in range(spots.size()):
		var kind: String = kinds[i]
		_env_prop(spots[i], kind)

func _env_prop(pos: Vector2, kind: String) -> void:
	var path := "res://assets/source/env/%s.png" % kind
	var tex: Texture2D = load(path)
	if tex == null:
		return
	var root := Node2D.new()
	root.position = pos
	var s := Sprite2D.new()
	s.texture = tex
	s.centered = true
	s.position = Vector2(0, -tex.get_height() * 0.35)
	s.texture_filter = CanvasItem.TEXTURE_FILTER_NEAREST
	root.add_child(s)
	ysort.add_child(root)
	var rad := 12.0 if kind in ["tree", "fir"] else 9.0
	_block(pos + Vector2(0, 4), Vector2(rad * 2.0, rad))

func _prop(pos: Vector2, path: String, sc: float, block: Vector2) -> void:
	var root := Node2D.new()
	root.position = pos
	var s := Sprite2D.new()
	s.texture = load(path)
	s.centered = true
	s.scale = Vector2(sc, sc)
	s.texture_filter = CanvasItem.TEXTURE_FILTER_NEAREST
	root.add_child(s)
	ysort.add_child(root)
	_block(pos, block)

func _block(pos: Vector2, size: Vector2) -> void:
	var body := StaticBody2D.new()
	body.position = pos
	body.collision_layer = 1
	var shape := CollisionShape2D.new()
	var rect := RectangleShape2D.new()
	rect.size = size
	shape.shape = rect
	body.add_child(shape)
	props.add_child(body)

func _place_bounds() -> void:
	var w := 640.0
	var h := 480.0
	var t := 16.0
	for item in [
		[Vector2(w * 0.5, -t * 0.5), Vector2(w + t * 2.0, t)],
		[Vector2(w * 0.5, h + t * 0.5), Vector2(w + t * 2.0, t)],
		[Vector2(-t * 0.5, h * 0.5), Vector2(t, h + t * 2.0)],
		[Vector2(w + t * 0.5, h * 0.5), Vector2(t, h + t * 2.0)],
	]:
		_block(item[0], item[1])
