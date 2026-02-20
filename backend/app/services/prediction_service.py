"""
Prediction service — core business logic for AquaSentinel AI.
Orchestrates ML prediction, DB persistence, alert generation, and recommendations.
"""
from sqlalchemy.orm import Session
from app.models.prediction import Prediction, Alert
from app.ml.predictor import predict as ml_predict
from app.services.recommendation import get_recommendation


def create_prediction(db: Session, rainfall: float, ph_level: float,
                      contamination: float, cases_count: int,
                      location: str = "Unknown") -> Prediction:
    """
    Run the ML model, save the prediction, auto-generate alerts,
    and attach recommendations.
    """
    # 1. Get ML prediction
    result = ml_predict(rainfall, ph_level, contamination, cases_count)
    risk_level = result["risk_level"]
    confidence = result["confidence"]

    # 2. Generate recommendation
    recommendation = get_recommendation(
        risk_level, rainfall, ph_level, contamination, cases_count
    )

    # 3. Save prediction to DB
    prediction = Prediction(
        rainfall=rainfall,
        ph_level=ph_level,
        contamination=contamination,
        cases_count=cases_count,
        risk_level=risk_level,
        confidence=confidence,
        recommendation=recommendation,
        location=location,
    )
    db.add(prediction)
    db.commit()
    db.refresh(prediction)

    # 4. Auto-generate alert if HIGH risk
    if risk_level.lower() == "high":
        alert = Alert(
            prediction_id=prediction.id,
            severity="HIGH",
            message=(
                f"🚨 HIGH RISK detected at {location}! "
                f"Rainfall={rainfall}mm, pH={ph_level}, "
                f"Contamination={contamination}, Cases={cases_count}. "
                f"Confidence: {confidence:.1%}"
            ),
        )
        db.add(alert)
        db.commit()

    return prediction


def get_all_predictions(db: Session, skip: int = 0, limit: int = 100):
    """Fetch all predictions, newest first."""
    return (
        db.query(Prediction)
        .order_by(Prediction.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


def get_all_alerts(db: Session, skip: int = 0, limit: int = 100):
    """Fetch all alerts, newest first."""
    return (
        db.query(Alert)
        .order_by(Alert.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
