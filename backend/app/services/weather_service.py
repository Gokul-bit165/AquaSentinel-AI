import httpx
import logging
from app.core.config import settings

logger = logging.getLogger("aqua-sentinel")

class WeatherService:
    """
    🌍 Real-Time Weather Service
    Fetches live data for Coimbatore, Tamil Nadu.
    Provides fallback climate data if API is unavailable.
    """
    
    COIMBATORE_LAT = 11.0168
    COIMBATORE_LON = 76.9558
    
    def __init__(self):
        # OpenWeatherMap is a standard choice for government datasets
        self.api_key = getattr(settings, "WEATHER_API_KEY", None)
        self.base_url = "https://api.openweathermap.org/data/2.5/weather"

    async def get_current_weather(self) -> dict:
        """Fetch current weather for Coimbatore."""
        if not self.api_key:
            return self._get_fallback_data("OpenWeather API Key not configured. Using climate normals.")

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                params = {
                    "lat": self.COIMBATORE_LAT,
                    "lon": self.COIMBATORE_LON,
                    "appid": self.api_key,
                    "units": "metric"
                }
                response = await client.get(self.base_url, params=params)
                
                if response.status_code == 200:
                    data = response.json()
                    # Extract fields relevant to AquaSentinel
                    rainfall = data.get("rain", {}).get("1h", 0)  # rain in mm/h
                    temp = data.get("main", {}).get("temp")
                    humidity = data.get("main", {}).get("humidity")
                    
                    return {
                        "rainfall": rainfall,
                        "temperature": temp,
                        "humidity": humidity,
                        "location": "Coimbatore, Tamil Nadu",
                        "source": "OpenWeatherMap Real-Time API",
                        "timestamp": data.get("dt")
                    }
                else:
                    logger.error(f"Weather API Error: {response.status_code} - {response.text}")
                    return self._get_fallback_data(f"API Error {response.status_code}")
                    
        except Exception as e:
            logger.error(f"Weather Service Exception: {e}")
            return self._get_fallback_data(str(e))

    def _get_fallback_data(self, reason: str) -> dict:
        """Probabilistic climate normals for Coimbatore (Feb-May range)."""
        return {
            "rainfall": 0.5,  # Typical for dry season
            "temperature": 32.2,
            "humidity": 45,
            "location": "Coimbatore, Tamil Nadu",
            "source": f"Climate Normals (Fallback: {reason})",
            "is_fallback": True
        }

weather_service = WeatherService()
