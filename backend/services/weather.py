import httpx
from typing import Dict, Optional

class WeatherService:
    def __init__(self):
        self.base_url = "https://api.weather.gov"
        self.county_coordinates = {
            "Lonoke": (34.7845, -91.8999),
            "Stuttgart": (34.5001, -91.5526),
            "Poinsett": (35.5643, -90.6734),
            "Jefferson": (34.2043, -91.9318),
            "Arkansas": (34.3143, -91.2068),
            "Mississippi": (35.7843, -90.1068)
        }

    async def get_county_weather(self, county: str) -> Dict:
        if county not in self.county_coordinates:
            return self._get_default_weather()

        try:
            lat, lon = self.county_coordinates[county]

            async with httpx.AsyncClient(timeout=10.0) as client:
                point_response = await client.get(
                    f"{self.base_url}/points/{lat},{lon}",
                    headers={"User-Agent": "CropIntelAR/1.0"}
                )

                if point_response.status_code != 200:
                    return self._get_default_weather()

                point_data = point_response.json()
                forecast_url = point_data["properties"]["forecast"]

                forecast_response = await client.get(
                    forecast_url,
                    headers={"User-Agent": "CropIntelAR/1.0"}
                )

                if forecast_response.status_code != 200:
                    return self._get_default_weather()

                forecast_data = forecast_response.json()
                current_period = forecast_data["properties"]["periods"][0]

                temperature = current_period.get("temperature", 75)
                humidity = current_period.get("relativeHumidity", {}).get("value", 65)
                conditions = current_period.get("shortForecast", "Partly Cloudy").lower()

                return {
                    "temperature": temperature,
                    "humidity": humidity if humidity else 65,
                    "conditions": self._normalize_conditions(conditions),
                    "detailed_forecast": current_period.get("detailedForecast", "")
                }

        except Exception as e:
            print(f"Weather fetch error for {county}: {e}")
            return self._get_default_weather()

    def _normalize_conditions(self, conditions: str) -> str:
        conditions = conditions.lower()
        if "rain" in conditions or "shower" in conditions:
            return "rainy"
        elif "cloud" in conditions and "partly" in conditions:
            return "partly_cloudy"
        elif "cloud" in conditions:
            return "cloudy"
        elif "clear" in conditions or "sunny" in conditions:
            return "clear"
        elif "storm" in conditions or "thunder" in conditions:
            return "stormy"
        else:
            return "partly_cloudy"

    def _get_default_weather(self) -> Dict:
        return {
            "temperature": 75,
            "humidity": 65,
            "conditions": "partly_cloudy",
            "detailed_forecast": "No weather data available"
        }
