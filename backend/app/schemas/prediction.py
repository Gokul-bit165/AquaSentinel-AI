"""
Pydantic schemas for request/response validation.
"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


# --- Prediction Schemas ---

class PredictionInput(BaseModel):
    """Input features for risk prediction."""
    rainfall: float = Field(..., ge=0, description="Rainfall in mm")
    ph_level: float = Field(..., ge=0, le=14, description="Water pH level")
    contamination: float = Field(..., ge=0, le=1, description="Contamination index (0-1)")
    cases_count: int = Field(..., ge=0, description="Reported disease cases")
    location: Optional[str] = Field(default="Unknown", description="Location name")

    class Config:
        json_schema_extra = {
            "example": {
                "rainfall": 250.0,
                "ph_level": 5.5,
                "contamination": 0.8,
                "cases_count": 45,
                "location": "Zone A"
            }
        }


class PredictionOutput(BaseModel):
    """Response after a prediction is made."""
    id: int
    rainfall: float
    ph_level: float
    contamination: float
    cases_count: int
    risk_level: str
    confidence: Optional[float]
    recommendation: Optional[str]
    location: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


# --- Alert Schemas ---

class AlertOutput(BaseModel):
    """Response for an alert record."""
    id: int
    prediction_id: int
    severity: str
    message: str
    is_resolved: bool
    created_at: datetime

    class Config:
        from_attributes = True
