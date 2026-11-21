extends Node
## Merges keyboard/gamepad with on-screen virtual stick.

var touch_vector := Vector2.ZERO

func get_move_vector() -> Vector2:
	var kb := Input.get_vector("move_left", "move_right", "move_up", "move_down")
	if touch_vector.length() > 0.05:
		return touch_vector.limit_length(1.0)
	return kb
