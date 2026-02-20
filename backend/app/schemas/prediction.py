"""
Pydantic schemas for request/response validation.
"""
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
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
    severity: Optional[str] = "INFO"      # CRITICAL / HIGH / WARNING / INFO
    trend: Optional[str] = "STABLE"       # RISING / STABLE / FALLING
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


# --- Batch Prediction Schemas ---

class BatchPredictionInput(BaseModel):
    """Input for batch predictions — a list of entries."""
    predictions: List[PredictionInput] = Field(
        ..., min_length=1, max_length=50,
        description="List of prediction inputs (max 50)"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "predictions": [
                    {"rainfall": 250, "ph_level": 5.5, "contamination": 0.8,
                     "cases_count": 45, "location": "Zone A"},
                    {"rainfall": 50, "ph_level": 7.0, "contamination": 0.1,
                     "cases_count": 2, "location": "Zone B"},
                ]
            }
        }


class BatchPredictionOutput(BaseModel):
    """Response for batch predictions."""
    total: int
    successful: int
    failed: int
    predictions: List[PredictionOutput]
    errors: List[Dict[str, Any]] = []


# --- Stats Schema ---

class StatsOutput(BaseModel):
    """Dashboard summary statistics."""
    total_predictions: int
    total_alerts: int
    active_alerts: int
    resolved_alerts: int
    risk_distribution: Dict[str, int]
    trend_distribution: Dict[str, int]      # {"RISING": 2, "STABLE": 10, "FALLING": 1}
    avg_confidence: Optional[float]
    recent_locations: List[str]
    predictions_today: int


# --- Model Metrics Schema ---

class ModelMetricsOutput(BaseModel):
    """ML model evaluation metrics."""
    best_model: str
    best_accuracy: float
    dataset_size: int
    train_size: int
    test_size: int
    features: List[str]
    engineered_features: List[str]
    class_labels: List[str]
    results: Dict[str, Any]
    plots_available: List[str]
