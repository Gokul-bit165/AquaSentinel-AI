from fastapi import APIRouter, HTTPException
from app.services.weather_service import weather_service
from app.services.pulse_service import pulse_service

router = APIRouter(prefix="/realtime", tags=["Government Data"])

@router.get("/weather")
async def get_coimbatore_weather():
    """Get live weather data for Coimbatore."""
    try:
        data = await weather_service.get_current_weather()
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/pulse")
async def get_territory_pulse():
    """
    Get live AI diagnostics for all Coimbatore wards.
    Automates weather, medical, and sensor data ingestion.
    """
    try:
        data = await pulse_service.get_territory_pulse()
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
