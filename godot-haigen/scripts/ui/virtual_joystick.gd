extends Control
## Left-side virtual stick for touch / mouse drag.

@onready var base: TextureRect = $Base
@onready var knob: TextureRect = $Knob

var _active := false
var _origin := Vector2.ZERO
var _radius := 52.0
var _pointer_id := -1

func _ready() -> void:
	mouse_filter = Control.MOUSE_FILTER_STOP
	custom_minimum_size = Vector2(176, 176)
	size = Vector2(176, 176)
	base.texture = preload("res://assets/ui/joystick_base.png")
	knob.texture = preload("res://assets/ui/joystick_knob.png")
	base.custom_minimum_size = Vector2(128, 128)
	knob.custom_minimum_size = Vector2(64, 64)
	base.size = Vector2(128, 128)
	knob.size = Vector2(64, 64)
	base.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	knob.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	base.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	knob.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	_reset_knob()

func _gui_input(event: InputEvent) -> void:
	if event is InputEventScreenTouch:
		var st := event as InputEventScreenTouch
		if st.pressed and not _active:
			_active = true
			_pointer_id = st.index
			_origin = st.position
			_update_knob(st.position)
			accept_event()
		elif not st.pressed and st.index == _pointer_id:
			_release()
			accept_event()
	elif event is InputEventScreenDrag and _active:
		var sd := event as InputEventScreenDrag
		if sd.index == _pointer_id:
			_update_knob(sd.position)
			accept_event()
	elif event is InputEventMouseButton:
		var mb := event as InputEventMouseButton
		if mb.button_index == MOUSE_BUTTON_LEFT:
			if mb.pressed:
				_active = true
				_pointer_id = -1
				_origin = mb.position
				_update_knob(mb.position)
				accept_event()
			else:
				_release()
				accept_event()
	elif event is InputEventMouseMotion and _active and _pointer_id == -1:
		var mm := event as InputEventMouseMotion
		if mm.button_mask & MOUSE_BUTTON_MASK_LEFT:
			_update_knob(mm.position)
			accept_event()

func _update_knob(local_pos: Vector2) -> void:
	var delta := local_pos - _origin
	if delta.length() > _radius:
		delta = delta.limit_length(_radius)
	knob.position = _origin + delta - knob.size * 0.5
	InputRouter.touch_vector = delta / _radius

func _release() -> void:
	_active = false
	_pointer_id = -1
	InputRouter.touch_vector = Vector2.ZERO
	_reset_knob()

func _reset_knob() -> void:
	var centre := size * 0.5
	_origin = centre
	base.position = centre - base.size * 0.5
	knob.position = centre - knob.size * 0.5
