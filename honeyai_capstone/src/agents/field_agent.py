from observability.logger import get_logger

logger = get_logger("field_agent")


class FieldAgent:
    def __init__(self, memory) -> None:
        self.memory = memory

    def plan(self, hive_status: dict, sample_features: dict) -> dict:
        logger.info(
            "FieldAgent plan called",
            extra={"hive_status": hive_status, "sample": sample_features},
        )
        moisture = sample_features.get("moisture", 20)
        strength = hive_status.get("strength", "unknown")

        if moisture > 19:
            advice = "Moisture high: delay harvest and dry frames."
        elif strength == "weak":
            advice = "Consider supplemental feeding and wait 2-3 weeks."
        else:
            advice = "Safe to harvest within next 3-7 days."

        plan = {
            "advice": advice,
            "recommended_window_days": 3 if moisture <= 18 else 7,
            "safety_checklist": [
                "Wear protective gear",
                "Smoke bees gently",
                "Check for brood frames before extraction",
            ],
        }
        logger.info("FieldAgent plan ready", extra={"plan": plan})
        return plan






