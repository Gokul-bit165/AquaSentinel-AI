"""
Prediction service — core business logic for AquaSentinel AI.
Orchestrates ML prediction, DB persistence, alert generation, and recommendations.
"""
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timezone, timedelta
from app.models.prediction import Prediction, Alert
from app.ml.predictor import predict as ml_predict
from app.services.recommendation import get_recommendation


def calculate_trend(db: Session, location: str, current_risk_value: int) -> str:
    """
    Determine the trend for a location by comparing current risk level (0-2)
    with the average of the last 3 predictions.
    
    Risk Mapping: low=0, medium=1, high=2
    """
    risk_map = {"low": 0, "medium": 1, "high": 2}
    
    # Get last 3 predictions for this location
    last_preds = (
        db.query(Prediction)
        .filter(Prediction.location == location)
        .order_by(Prediction.created_at.desc())
        .limit(3)
        .all()
    )
    
    if not last_preds:
        return "STABLE"
    
    avg_past_risk = sum(risk_map.get(p.risk_level.lower(), 0) for p in last_preds) / len(last_preds)
    
    if current_risk_value > avg_past_risk + 0.2:
        return "RISING"
    elif current_risk_value < avg_past_risk - 0.2:
        return "FALLING"
    else:
        return "STABLE"


def determine_severity_tier(risk_level: str, confidence: float, trend: str) -> str:
    """
    Categorize prediction into a severity tier: CRITICAL / HIGH / WARNING / INFO
    """
    level = risk_level.lower()
    
    if level == "high":
        if confidence > 0.85 or trend == "RISING":
            return "CRITICAL"
        return "HIGH"
    elif level == "medium":
        if trend == "RISING" or confidence > 0.9:
            return "WARNING"
        return "INFO"
    else:
        return "INFO"


def create_prediction(db: Session, rainfall: float, ph_level: float,
                      contamination: float, cases_count: int,
                      location: str = "Unknown") -> Prediction:
    """
    Run the ML model, save the prediction, auto-generate alerts,
    and attach recommendations based on trends and severity.
    """
    # 1. Get ML prediction
    result = ml_predict(rainfall, ph_level, contamination, cases_count)
    risk_level = result["risk_level"]
    confidence = result["confidence"]
    
    risk_map = {"low": 0, "medium": 1, "high": 2}
    current_risk_val = risk_map.get(risk_level.lower(), 0)

    # 2. Calculate Trend & Severity
    trend = calculate_trend(db, location, current_risk_val)
    severity = determine_severity_tier(risk_level, confidence, trend)

    # 3. Generate recommendation
    recommendation = get_recommendation(
        risk_level, rainfall, ph_level, contamination, cases_count,
        severity=severity, trend=trend
    )

    # 4. Save prediction to DB
    prediction = Prediction(
        rainfall=rainfall,
        ph_level=ph_level,
        contamination=contamination,
        cases_count=cases_count,
        risk_level=risk_level,
        severity=severity,
        trend=trend,
        confidence=confidence,
        recommendation=recommendation,
        location=location,
    )
    db.add(prediction)
    db.commit()
    db.refresh(prediction)

    # 5. Auto-generate alert if HIGH or CRITICAL
    if severity in ["HIGH", "CRITICAL"]:
        alert = Alert(
            prediction_id=prediction.id,
            severity=severity,
            message=(
                f"🚨 {severity} ALERT at {location}! "
                f"Trend: {trend}. Confidence: {confidence:.1%}. "
                f"Condition: Rainfall={rainfall}mm, Contamination={contamination}."
            ),
        )
        db.add(alert)
        db.commit()

    return prediction


def get_prediction_by_id(db: Session, prediction_id: int):
    """Fetch a single prediction by ID."""
    return db.query(Prediction).filter(Prediction.id == prediction_id).first()


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


def resolve_alert(db: Session, alert_id: int):
    """Mark an alert as resolved. Returns the alert or None."""
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if alert:
        alert.is_resolved = True
        db.commit()
        db.refresh(alert)
    return alert


def get_stats(db: Session) -> dict:
    """Compute summary statistics for the dashboard."""
    total_predictions = db.query(func.count(Prediction.id)).scalar() or 0
    total_alerts = db.query(func.count(Alert.id)).scalar() or 0
    active_alerts = db.query(func.count(Alert.id)).filter(Alert.is_resolved == False).scalar() or 0
    resolved_alerts = db.query(func.count(Alert.id)).filter(Alert.is_resolved == True).scalar() or 0

    # Risk distribution
    risk_rows = (
        db.query(Prediction.risk_level, func.count(Prediction.id))
        .group_by(Prediction.risk_level)
        .all()
    )
    risk_distribution = {row[0]: row[1] for row in risk_rows}

    # Trend distribution
    trend_rows = (
        db.query(Prediction.trend, func.count(Prediction.id))
        .group_by(Prediction.trend)
        .all()
    )
    trend_distribution = {row[0]: row[1] for row in trend_rows}

    # Average confidence
    avg_confidence = db.query(func.avg(Prediction.confidence)).scalar()
    avg_confidence = round(avg_confidence, 4) if avg_confidence else None

    # Recent unique locations (last 20 predictions)
    recent = (
        db.query(Prediction.location)
        .order_by(Prediction.created_at.desc())
        .limit(20)
        .all()
    )
    recent_locations = list({r[0] for r in recent if r[0] and r[0] != "Unknown"})

    # Predictions today
    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    predictions_today = (
        db.query(func.count(Prediction.id))
        .filter(Prediction.created_at >= today_start)
        .scalar() or 0
    )

    return {
        "total_predictions": total_predictions,
        "total_alerts": total_alerts,
        "active_alerts": active_alerts,
        "resolved_alerts": resolved_alerts,
        "risk_distribution": risk_distribution,
        "trend_distribution": trend_distribution,
        "avg_confidence": avg_confidence,
        "recent_locations": recent_locations,
        "predictions_today": predictions_today,
    }
