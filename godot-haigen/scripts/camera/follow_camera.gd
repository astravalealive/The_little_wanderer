extends Camera2D
## Pixel-perfect follow camera for the homestead slice.

@export var target_path: NodePath
@export var lerp_weight := 0.22

var _target: Node2D

func _ready() -> void:
	zoom = GameConfig.CAMERA_ZOOM
	position_smoothing_enabled = false
	ignore_rotation = true
	if target_path:
		_target = get_node_or_null(target_path) as Node2D

func set_follow_target(node: Node2D) -> void:
	_target = node

func _physics_process(_delta: float) -> void:
	if _target == null:
		return
	var desired := _target.global_position
	# Direct snap. Lerp-then-round oscillates by a pixel and shimmers tiles.
	if GameConfig.PIXEL_SNAP:
		global_position = desired.round()
	else:
		global_position = global_position.lerp(desired, lerp_weight)
