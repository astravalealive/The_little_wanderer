extends Node2D
## Connected woodland path toward Whispering Grove (HTML landmark 2470,1280).
## Phase 1: eastward pocket linked from the homestead yard.

@onready var ysort: Node2D = $YSort
@onready var props: Node2D = $Props
@onready var ground: Polygon2D = $Ground

func _ready() -> void:
	ground.polygon = PackedVector2Array([
		Vector2(0, 0), Vector2(560, 0), Vector2(560, 400), Vector2(0, 400)
	])
	ground.color = Color("3f5a45")
	## Path strip
	var path := Polygon2D.new()
	path.polygon = PackedVector2Array([
		Vector2(0, 170), Vector2(560, 170), Vector2(560, 230), Vector2(0, 230)
	])
	path.color = Color("a89068")
	path.z_index = -5
	add_child(path)
	for pos in [Vector2(80, 80), Vector2(160, 60), Vector2(400, 70), Vector2(480, 100), Vector2(100, 320), Vector2(450, 330)]:
		_tree(pos)
	_block(Vector2(280, -8), Vector2(580, 16))
	_block(Vector2(280, 408), Vector2(580, 16))
	_block(Vector2(-8, 200), Vector2(16, 420))
	_block(Vector2(568, 200), Vector2(16, 420))

func _tree(pos: Vector2) -> void:
	var root := Node2D.new()
	root.position = pos
	var s := Sprite2D.new()
	s.texture = load("res://assets/source/env/tree.png")
	s.centered = true
	s.position = Vector2(0, -40)
	s.texture_filter = CanvasItem.TEXTURE_FILTER_NEAREST
	root.add_child(s)
	ysort.add_child(root)
	_block(pos + Vector2(0, 4), Vector2(20, 12))

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
