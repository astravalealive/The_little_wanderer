extends Camera2D

@export var lerp_weight := 1.0
var _target: Node2D

func _ready() -> void:
	zoom = GameConfig.CAMERA_ZOOM
	position_smoothing_enabled = false
	ignore_rotation = true

func set_follow_target(node: Node2D) -> void:
	_target = node
	if node:
		global_position = node.global_position.round()

func _physics_process(_delta: float) -> void:
	if _target == null:
		return
	if GameConfig.PIXEL_SNAP:
		global_position = _target.global_position.round()
	else:
		global_position = global_position.lerp(_target.global_position, lerp_weight)
