extends Control
## Left-side virtual stick. Tracks the pointer after the press leaves the control,
## which is what a thumb does on iPad.

@onready var base: TextureRect = $Base
@onready var knob: TextureRect = $Knob

var _active := false
var _origin := Vector2.ZERO
var _radius := 56.0
var _pointer_id := -1

func _ready() -> void:
	mouse_filter = Control.MOUSE_FILTER_STOP
	custom_minimum_size = Vector2(176, 176)
	base.texture = preload("res://assets/ui/joystick_base.png")
	knob.texture = preload("res://assets/ui/joystick_knob.png")
	base.custom_minimum_size = Vector2(128, 128)
	knob.custom_minimum_size = Vector2(64, 64)
	base.size = Vector2(128, 128)
	knob.size = Vector2(64, 64)
	base.mouse_filter = Control.MOUSE_FILTER_IGNORE
	knob.mouse_filter = Control.MOUSE_FILTER_IGNORE
	base.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	knob.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	base.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	knob.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	set_process_input(true)
	_reset_knob()

func _notification(what: int) -> void:
	if what == NOTIFICATION_RESIZED:
		_reset_knob()

func _input(event: InputEvent) -> void:
	if event is InputEventScreenTouch:
		var st := event as InputEventScreenTouch
		if st.pressed and not _active and _inside(st.position):
			_begin(st.index, st.position)
			get_viewport().set_input_as_handled()
		elif not st.pressed and _active and st.index == _pointer_id:
			_release()
			get_viewport().set_input_as_handled()
	elif event is InputEventScreenDrag and _active:
		var sd := event as InputEventScreenDrag
		if sd.index == _pointer_id:
			_update_knob(_to_local(sd.position))
			get_viewport().set_input_as_handled()
	elif event is InputEventMouseButton:
		var mb := event as InputEventMouseButton
		if mb.button_index != MOUSE_BUTTON_LEFT:
			return
		if mb.pressed and not _active and _inside(mb.position):
			_begin(-1, mb.position)
			get_viewport().set_input_as_handled()
		elif not mb.pressed and _active and _pointer_id == -1:
			_release()
			get_viewport().set_input_as_handled()
	elif event is InputEventMouseMotion and _active and _pointer_id == -1:
		var mm := event as InputEventMouseMotion
		if mm.button_mask & MOUSE_BUTTON_MASK_LEFT:
			_update_knob(_to_local(mm.position))
			get_viewport().set_input_as_handled()

func _inside(viewport_pos: Vector2) -> bool:
	return get_global_rect().has_point(viewport_pos)

func _to_local(viewport_pos: Vector2) -> Vector2:
	return viewport_pos - global_position

func _begin(index: int, viewport_pos: Vector2) -> void:
	_active = true
	_pointer_id = index
	_origin = _to_local(viewport_pos)
	_update_knob(_origin)

func _update_knob(local_pos: Vector2) -> void:
	var delta := local_pos - _origin
	if delta.length() > _radius:
		delta = delta.limit_length(_radius)
	knob.position = _origin + delta - knob.size * 0.5
	InputRouter.touch_vector = Vector2.ZERO if _radius <= 0.0 else delta / _radius

func _release() -> void:
	_active = false
	_pointer_id = -1
	InputRouter.touch_vector = Vector2.ZERO
	_reset_knob()

func _reset_knob() -> void:
	if size.x < 8.0 or size.y < 8.0:
		return
	var centre := size * 0.5
	_origin = centre
	base.position = centre - base.size * 0.5
	knob.position = centre - knob.size * 0.5
