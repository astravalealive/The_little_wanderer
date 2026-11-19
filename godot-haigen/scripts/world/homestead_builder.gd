extends Node2D
## Builds a handcrafted Nordic woodland homestead from a character map.

@onready var ground: Node2D = $Ground
@onready var props: Node2D = $Props
@onready var ysort: Node2D = $YSort

const TILE_TEX := preload("res://assets/tiles/woodland_tiles.png")
const TREE_TEX := preload("res://assets/tiles/tree.png")
const STUMP_TEX := preload("res://assets/tiles/stump.png")
const ROCK_TEX := preload("res://assets/tiles/rock.png")
const CABIN_TEX := preload("res://assets/tiles/cabin.png")

## Legend: . grass  m moss  p path  e path-edge  w water  f flower  d dark
##         T tree  S stump  R rock  C cabin footprint  @ spawn
const MAP := [
	"mmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm",
	"m.............mmmmm...........mmmmm............m",
	"m...TT....TT..mmmmm...........mmmmm.TT.........m",
	"m...T.....R...mmmmm...........mmmmm.T..........m",
	"m.............mmpmm.....p.....mmpmm............m",
	"m.............mmpmm.....p.....mmpmS............m",
	"m.............mmpmm...CCCCC...mmpmm.....TT.....m",
	"m.....TT......mmpmm...CCCCC...mmpmm.....T......m",
	"m.....T.......mmpmm...CCCCC...mmpmm............m",
	"m...............p.......p.......p..............m",
	"m...pppppppppppppppppppppppppppppppppppppppp...m",
	"m...............p.......p.......p..............m",
	"m.......S.......p.....@@@@......p.....R........m",
	"m...............p.....@@@@......p..............m",
	"m...pppppppppppppppppppppppppppppppppppppppp...m",
	"m...............p.......p.......p..............m",
	"m.......TT......p...wwwwww......p.....TT.......m",
	"m.......T.......p...wwwwww......p.....T........m",
	"m.............mmpmm.wwwwww....mmpmm............m",
	"m.............mmpmppppppppppp.mmpmm............m",
	"m.....R.......mmpmm.....p.....mmpmm.S..........m",
	"m...........TTmmmmm...........mmmmTT...........m",
	"m.......ff..T.mmmmm...........mmmmT...ff.......m",
	"m.............mmmmm...........mmmmm............m",
	"m.............mmmmm...........mmmmm............m",
	"mddddddddddddddddddddddddddddddddddddddddddddddm",
	"mddddddddddddddddddddddddddddddddddddddddddddddm",
	"mddddddddddddddddddddddddddddddddddddddddddddddm",
	"m..............................................m",
	"m..............................................m",
	"m...TT....................................TT...m",
	"m...T.....................................T....m",
	"m..............................................m",
	"m..............................................m",
	"m..............................................m",
	"mmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm",
]
var spawn_world := Vector2(24 * 16, 13 * 16)

func _ready() -> void:
	_build()

func _build() -> void:
	var ts := GameConfig.TILE_SIZE
	for y in range(MAP.size()):
		var row: String = MAP[y]
		for x in range(mini(row.length(), GameConfig.MAP_W)):
			var ch := row[x]
			var pos := Vector2(x * ts + ts * 0.5, y * ts + ts * 0.5)
			match ch:
				"m":
					_add_tile(pos, 1)
				"p":
					_add_tile(pos, 2)
				"e":
					_add_tile(pos, 3)
				"w":
					_add_tile(pos, 4)
					_add_blocking(pos, Vector2(ts, ts) * 0.9)
				"d":
					_add_tile(pos, 7)
				"f":
					_add_tile(pos, 6)
				"T":
					_add_tile(pos, 0)
					_add_tree(pos)
				"S":
					_add_tile(pos, 0)
					_add_sprite_prop(pos, STUMP_TEX, Vector2(10, 8))
				"R":
					_add_tile(pos, 0)
					_add_sprite_prop(pos, ROCK_TEX, Vector2(9, 6))
				"C":
					_add_tile(pos, 2)
				"@":
					_add_tile(pos, 2)
					spawn_world = pos
				".":
					_add_tile(pos, 0)
				_:
					_add_tile(pos, 0)
	_place_cabin()
	_add_world_bounds()
	_bake_ground()

func _add_tile(pos: Vector2, index: int) -> void:
	var s := Sprite2D.new()
	var atlas := AtlasTexture.new()
	atlas.atlas = TILE_TEX
	atlas.region = Rect2(index * 16, 0, 16, 16)
	s.texture = atlas
	s.centered = true
	s.position = pos
	s.texture_filter = CanvasItem.TEXTURE_FILTER_NEAREST
	s.z_index = -10
	ground.add_child(s)

func _add_tree(pos: Vector2) -> void:
	var root := Node2D.new()
	root.position = pos + Vector2(0, 8)
	var s := Sprite2D.new()
	s.texture = TREE_TEX
	s.centered = true
	s.position = Vector2(0, -26)
	s.texture_filter = CanvasItem.TEXTURE_FILTER_NEAREST
	root.add_child(s)
	ysort.add_child(root)
	_add_blocking(pos + Vector2(0, 6), Vector2(12, 10))

func _add_sprite_prop(pos: Vector2, tex: Texture2D, block: Vector2) -> void:
	var root := Node2D.new()
	root.position = pos
	var s := Sprite2D.new()
	s.texture = tex
	s.centered = true
	s.texture_filter = CanvasItem.TEXTURE_FILTER_NEAREST
	root.add_child(s)
	ysort.add_child(root)
	_add_blocking(pos, block)

func _place_cabin() -> void:
	var pos := Vector2(24 * 16 + 8, 7 * 16)
	var root := Node2D.new()
	root.position = pos + Vector2(0, 10)
	var s := Sprite2D.new()
	s.texture = CABIN_TEX
	s.centered = true
	s.position = Vector2(0, -10)
	s.texture_filter = CanvasItem.TEXTURE_FILTER_NEAREST
	root.add_child(s)
	ysort.add_child(root)
	_add_blocking(pos + Vector2(0, 8), Vector2(40, 24))

func _bake_ground() -> void:
	## One nearest-neighbour texture instead of one Sprite2D per tile.
	var ts := GameConfig.TILE_SIZE
	var img := Image.create(GameConfig.MAP_W * ts, MAP.size() * ts, false, Image.FORMAT_RGBA8)
	var tile_img := TILE_TEX.get_image()
	var sprites: Array[Sprite2D] = []
	for child in ground.get_children():
		if child is Sprite2D:
			sprites.append(child)
	var blits := 0
	for s in sprites:
		var atlas := s.texture as AtlasTexture
		if atlas == null:
			push_warning("bake skip non-atlas %s" % s.texture)
			continue
		var region := atlas.region
		var src := tile_img.get_region(Rect2i(int(region.position.x), int(region.position.y), ts, ts))
		if src.get_format() != Image.FORMAT_RGBA8:
			src.convert(Image.FORMAT_RGBA8)
		var dest := Vector2i(int(round(s.position.x - float(ts) * 0.5)), int(round(s.position.y - float(ts) * 0.5)))
		img.blit_rect(src, Rect2i(0, 0, src.get_width(), src.get_height()), dest)
		blits += 1
		s.queue_free()
	if blits < 1:
		push_error("ground bake produced no tiles")
	var baked := Sprite2D.new()
	baked.name = "BakedGround"
	baked.texture = ImageTexture.create_from_image(img)
	baked.centered = false
	baked.texture_filter = CanvasItem.TEXTURE_FILTER_NEAREST
	baked.z_index = -10
	ground.add_child(baked)

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

func _add_world_bounds() -> void:
	var w := GameConfig.MAP_W * GameConfig.TILE_SIZE
	var h := MAP.size() * GameConfig.TILE_SIZE
	var thickness := 16.0
	var centres := [
		Vector2(w * 0.5, -thickness * 0.5),
		Vector2(w * 0.5, h + thickness * 0.5),
		Vector2(-thickness * 0.5, h * 0.5),
		Vector2(w + thickness * 0.5, h * 0.5),
	]
	var sizes := [
		Vector2(w + thickness * 2.0, thickness),
		Vector2(w + thickness * 2.0, thickness),
		Vector2(thickness, h + thickness * 2.0),
		Vector2(thickness, h + thickness * 2.0),
	]
	for i in range(4):
		_add_blocking(centres[i], sizes[i])
