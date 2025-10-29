from typing import Dict

class RiskCalculator:
    def __init__(self):
        self.disease_profiles = {
            "sheath_blight": {
                "optimal_temp_range": (77, 90),
                "optimal_humidity_min": 85,
                "favorable_conditions": ["rainy", "cloudy", "stormy"]
            },
            "rice_blast": {
                "optimal_temp_range": (72, 82),
                "optimal_humidity_min": 90,
                "favorable_conditions": ["rainy", "cloudy", "stormy"]
            },
            "fall_armyworm": {
                "optimal_temp_range": (70, 90),
                "optimal_humidity_min": 60,
                "favorable_conditions": ["partly_cloudy", "cloudy", "rainy"]
            }
        }

        self.crop_disease_map = {
            "rice": ["sheath_blight", "rice_blast"],
            "soy": ["fall_armyworm"],
            "cotton": ["fall_armyworm"]
        }

    def calculate_risk(
        self,
        crop: str,
        temperature: float,
        humidity: float,
        conditions: str
    ) -> float:
        if crop not in self.crop_disease_map:
            return 0.3

        relevant_diseases = self.crop_disease_map[crop]
        risk_scores = []

        for disease in relevant_diseases:
            if disease not in self.disease_profiles:
                continue

            profile = self.disease_profiles[disease]
            disease_risk = 0.0

            temp_min, temp_max = profile["optimal_temp_range"]
            if temp_min <= temperature <= temp_max:
                disease_risk += 0.4
            elif temp_min - 10 <= temperature <= temp_max + 10:
                distance = min(abs(temperature - temp_min), abs(temperature - temp_max))
                disease_risk += 0.4 * (1 - distance / 10)

            if humidity >= profile["optimal_humidity_min"]:
                disease_risk += 0.4
            elif humidity >= profile["optimal_humidity_min"] - 20:
                disease_risk += 0.4 * (humidity - (profile["optimal_humidity_min"] - 20)) / 20

            if conditions in profile["favorable_conditions"]:
                disease_risk += 0.2

            risk_scores.append(min(disease_risk, 1.0))

        if not risk_scores:
            return 0.3

        return max(risk_scores)

    def get_risk_message(self, crop: str, risk_score: float) -> str:
        if risk_score >= 0.7:
            level = "HIGH"
            action = "Immediate inspection recommended. Consider preventive treatments."
        elif risk_score >= 0.5:
            level = "MODERATE"
            action = "Monitor fields closely. Prepare for potential treatment."
        elif risk_score >= 0.3:
            level = "LOW-MODERATE"
            action = "Continue regular monitoring. Conditions slightly favorable for disease."
        else:
            level = "LOW"
            action = "Standard monitoring recommended. Conditions not conducive to disease."

        disease_names = {
            "rice": "sheath blight and rice blast",
            "soy": "fall armyworm",
            "cotton": "fall armyworm"
        }

        disease_text = disease_names.get(crop, "common pests and diseases")

        return f"{level} RISK: {disease_text}. {action}"
