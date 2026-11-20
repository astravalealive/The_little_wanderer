extends Node2D
## Homestead interior. South door returns to the yard.

@onready var ysort: Node2D = $YSort
@onready var props: Node2D = $Props

func _ready() -> void:
	_build_room()

func _build_room() -> void:
	var floor := Polygon2D.new()
	floor.polygon = PackedVector2Array([
		Vector2(40, 40), Vector2(360, 40), Vector2(360, 280), Vector2(40, 280)
	])
	floor.color = Color("6b5340")
	floor.z_index = -10
	add_child(floor)
	var rug := Polygon2D.new()
	rug.polygon = PackedVector2Array([
		Vector2(120, 120), Vector2(280, 120), Vector2(280, 220), Vector2(120, 220)
	])
	rug.color = Color("3f5a45")
	rug.z_index = -9
	add_child(rug)
	_block(Vector2(200, 50), Vector2(300, 20))
	_block(Vector2(55, 160), Vector2(20, 200))
	_block(Vector2(345, 160), Vector2(20, 200))
	_block(Vector2(110, 140), Vector2(70, 50))
	_block(Vector2(280, 100), Vector2(50, 40))
	_block(Vector2(250, 180), Vector2(55, 35))

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
