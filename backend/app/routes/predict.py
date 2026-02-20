"""
API routes for AquaSentinel AI predictions and alerts.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.utils.database import get_db
from app.schemas.prediction import PredictionInput, PredictionOutput, AlertOutput
from app.services.prediction_service import (
    create_prediction,
    get_all_predictions,
    get_all_alerts,
)

router = APIRouter()


@router.post("/predict", response_model=PredictionOutput, tags=["Predictions"])
def predict(data: PredictionInput, db: Session = Depends(get_db)):
    """
    Submit environmental data and receive a waterborne disease risk prediction.
    Automatically generates an alert if risk is HIGH.
    """
    try:
        prediction = create_prediction(
            db=db,
            rainfall=data.rainfall,
            ph_level=data.ph_level,
            contamination=data.contamination,
            cases_count=data.cases_count,
            location=data.location or "Unknown",
        )
        return prediction
    except FileNotFoundError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")


@router.get("/predictions", response_model=List[PredictionOutput], tags=["Predictions"])
def list_predictions(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Retrieve all past predictions, ordered newest first."""
    return get_all_predictions(db, skip=skip, limit=limit)


@router.get("/alerts", response_model=List[AlertOutput], tags=["Alerts"])
def list_alerts(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Retrieve all alerts, ordered newest first."""
    return get_all_alerts(db, skip=skip, limit=limit)
