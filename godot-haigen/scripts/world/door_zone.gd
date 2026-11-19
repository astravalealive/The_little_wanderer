extends Area2D
## Door / path transition. ALTTP-style: walk into the zone to change map.

@export var target_map: String = "interior"
@export var target_spawn: String = "from_yard"
@export var require_interact: bool = false
@export var one_shot_cooldown := 0.6

var _cool := 0.0

func _ready() -> void:
	collision_layer = 16
	collision_mask = 2
	monitoring = true
	body_entered.connect(_on_body_entered)

func _physics_process(delta: float) -> void:
	_cool = maxf(0.0, _cool - delta)

func _on_body_entered(body: Node2D) -> void:
	if _cool > 0.0:
		return
	if not body.is_in_group("player"):
		return
	if require_interact and not InputRouter.wants_interact():
		return
	_cool = one_shot_cooldown
	MapRouter.go(target_map, target_spawn)
