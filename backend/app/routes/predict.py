"""
API routes for AquaSentinel AI predictions, alerts, stats, and model metrics.
"""
import os
import json
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List

from app.utils.database import get_db
from app.schemas.prediction import (
    PredictionInput, PredictionOutput, AlertOutput,
    BatchPredictionInput, BatchPredictionOutput,
    StatsOutput, ModelMetricsOutput,
)
from app.services.prediction_service import (
    create_prediction,
    get_prediction_by_id,
    get_all_predictions,
    get_all_alerts,
    resolve_alert,
    get_stats,
)

router = APIRouter()

# ---- Paths ----
ML_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "ml")
METRICS_PATH = os.path.join(ML_DIR, "metrics.json")
PLOTS_DIR = os.path.join(ML_DIR, "plots")


# ======================== PREDICTIONS ========================

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


@router.post("/predict/batch", response_model=BatchPredictionOutput, tags=["Predictions"])
def predict_batch(data: BatchPredictionInput, db: Session = Depends(get_db)):
    """
    Submit multiple predictions at once (max 50).
    Returns results for each entry along with success/failure counts.
    """
    results = []
    errors = []

    for idx, entry in enumerate(data.predictions):
        try:
            prediction = create_prediction(
                db=db,
                rainfall=entry.rainfall,
                ph_level=entry.ph_level,
                contamination=entry.contamination,
                cases_count=entry.cases_count,
                location=entry.location or "Unknown",
            )
            results.append(prediction)
        except Exception as e:
            errors.append({"index": idx, "error": str(e), "input": entry.model_dump()})

    return BatchPredictionOutput(
        total=len(data.predictions),
        successful=len(results),
        failed=len(errors),
        predictions=results,
        errors=errors,
    )


@router.get("/predictions", response_model=List[PredictionOutput], tags=["Predictions"])
def list_predictions(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Retrieve all past predictions, ordered newest first."""
    return get_all_predictions(db, skip=skip, limit=limit)


@router.get("/predictions/{prediction_id}", response_model=PredictionOutput, tags=["Predictions"])
def get_prediction(prediction_id: int, db: Session = Depends(get_db)):
    """Retrieve a single prediction by its ID."""
    prediction = get_prediction_by_id(db, prediction_id)
    if not prediction:
        raise HTTPException(status_code=404, detail=f"Prediction #{prediction_id} not found")
    return prediction


# ======================== ALERTS ========================

@router.get("/alerts", response_model=List[AlertOutput], tags=["Alerts"])
def list_alerts(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Retrieve all alerts, ordered newest first."""
    return get_all_alerts(db, skip=skip, limit=limit)


@router.patch("/alerts/{alert_id}/resolve", response_model=AlertOutput, tags=["Alerts"])
def resolve_alert_endpoint(alert_id: int, db: Session = Depends(get_db)):
    """Mark an alert as resolved."""
    alert = resolve_alert(db, alert_id)
    if not alert:
        raise HTTPException(status_code=404, detail=f"Alert #{alert_id} not found")
    return alert


# ======================== STATS ========================

@router.get("/stats", response_model=StatsOutput, tags=["Dashboard"])
def dashboard_stats(db: Session = Depends(get_db)):
    """
    Get summary statistics for the dashboard:
    total predictions, alerts, risk distribution, avg confidence, etc.
    """
    return get_stats(db)


# ======================== MODEL METRICS ========================

@router.get("/model/metrics", response_model=ModelMetricsOutput, tags=["Model"])
def model_metrics():
    """
    Serve the ML model evaluation metrics (accuracy, F1, confusion matrix,
    feature importance) from the latest training run.
    """
    if not os.path.exists(METRICS_PATH):
        raise HTTPException(status_code=404, detail="Metrics not found. Run training first.")

    with open(METRICS_PATH, "r") as f:
        metrics = json.load(f)

    # Map 'plots_generated' → 'plots_available' for the schema
    metrics["plots_available"] = metrics.pop("plots_generated", [])
    return metrics


@router.get("/model/plots/{plot_name}", tags=["Model"])
def model_plot(plot_name: str):
    """
    Serve a specific ML training plot image by filename.
    Example: /model/plots/confusion_matrix_rf.png
    """
    allowed_plots = [
        "confusion_matrix_rf.png", "confusion_matrix_gb.png",
        "feature_importance_comparison.png", "model_accuracy_comparison.png",
        "risk_distribution.png", "feature_correlation.png", "roc_curves.png",
        "pr_curves.png", "learning_curves.png",
    ]
    if plot_name not in allowed_plots:
        raise HTTPException(status_code=404, detail=f"Plot '{plot_name}' not found")

    plot_path = os.path.join(PLOTS_DIR, plot_name)
    if not os.path.exists(plot_path):
        raise HTTPException(status_code=404, detail=f"Plot file '{plot_name}' not generated yet")

    return FileResponse(plot_path, media_type="image/png")
