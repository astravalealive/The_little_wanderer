extends Node2D
## Tier-1 cottage interior from approved house crop. Exit at south doorway.
## Essential furniture collisions (table / hearth / bed / cupboard) so Haigen
## cannot walk through the painted fixtures.

const INTERIOR_TEX := preload("res://assets/approved/house_tier1_interior.png")

var _room_origin := Vector2(360, 180)
var _room_size := Vector2(640, 520)
var _door_x := 512.0
var _door_half := 40.0
var _exit_y := 680.0

func _ready() -> void:
	name = "CottageInterior"
	_build_room()

func spawn_position() -> Vector2:
	return Vector2(_door_x, _exit_y - 48.0)

func wants_exit(player: Node2D, prev: Vector2) -> bool:
	if player == null:
		return false
	var within := absf(player.global_position.x - _door_x) <= _door_half
	# HTML: walk down past exit threshold.
	return within and prev.y < _exit_y - 8.0 and player.global_position.y >= _exit_y - 8.0

func _build_room() -> void:
	var bg := ColorRect.new()
	bg.color = Color("2a221c")
	bg.size = Vector2(2000, 1600)
	bg.position = Vector2(-200, -200)
	bg.z_index = -30
	add_child(bg)

	var spr := Sprite2D.new()
	spr.texture = INTERIOR_TEX
	spr.centered = false
	spr.texture_filter = CanvasItem.TEXTURE_FILTER_NEAREST
	var tex_w := float(INTERIOR_TEX.get_width())
	var tex_h := float(INTERIOR_TEX.get_height())
	# Crop dark presentation margins like HTML (~7.5%).
	var margin_x := tex_w * 0.075
	var margin_y := tex_h * 0.075
	var atlas := AtlasTexture.new()
	atlas.atlas = INTERIOR_TEX
	atlas.region = Rect2(margin_x, margin_y, tex_w - margin_x * 2.0, tex_h - margin_y * 2.0)
	spr.texture = atlas
	var draw_w := _room_size.x
	var draw_h := _room_size.y
	spr.scale = Vector2(draw_w / atlas.get_width(), draw_h / atlas.get_height())
	spr.position = _room_origin
	spr.z_index = -10
	add_child(spr)

	# Room walls (leave south door gap).
	_block(Vector2(_room_origin.x + draw_w * 0.5, _room_origin.y + 24), Vector2(draw_w, 48))
	_block(Vector2(_room_origin.x + 20, _room_origin.y + draw_h * 0.5), Vector2(40, draw_h))
	_block(Vector2(_room_origin.x + draw_w - 20, _room_origin.y + draw_h * 0.5), Vector2(40, draw_h))
	var wing := (draw_w * 0.5 - _door_half) * 0.9
	_block(Vector2(_door_x - _door_half - wing * 0.55, _exit_y), Vector2(wing, 40))
	_block(Vector2(_door_x + _door_half + wing * 0.55, _exit_y), Vector2(wing, 40))

	# Essential furniture footprints (room-relative; idea reused from PR #250
	# interior blocks, scaled to the approved L1 reference room).
	var ox := _room_origin.x
	var oy := _room_origin.y
	_block(Vector2(ox + draw_w * 0.28, oy + draw_h * 0.42), Vector2(110, 70)) # table
	_block(Vector2(ox + draw_w * 0.72, oy + draw_h * 0.28), Vector2(70, 55)) # cupboard / shelves
	_block(Vector2(ox + draw_w * 0.68, oy + draw_h * 0.58), Vector2(90, 50)) # bed / settle
	_block(Vector2(ox + draw_w * 0.38, oy + draw_h * 0.22), Vector2(80, 45)) # hearth / stove

	var label := Label.new()
	label.text = "Cottage interior (approved L1 reference)"
	label.position = Vector2(_room_origin.x + 16, _room_origin.y + 8)
	label.add_theme_color_override("font_color", Color("f3ead2"))
	add_child(label)

func _block(pos: Vector2, size: Vector2) -> void:
	var body := StaticBody2D.new()
	body.position = pos
	body.collision_layer = 1
	body.collision_mask = 0
	var shape := CollisionShape2D.new()
	var rect := RectangleShape2D.new()
	rect.size = size
	shape.shape = rect
	body.add_child(shape)
	add_child(body)
