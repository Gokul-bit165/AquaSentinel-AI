"""
ML model predictor for AquaSentinel AI.
Loads the trained model at import time and exposes prediction functions.
Applies the same feature engineering used during training.
"""
import os
import numpy as np
import joblib
from app.core.config import settings

MODEL_PATH = settings.abs_model_path
ENCODER_PATH = settings.abs_encoder_path

# Lazy-loaded singletons
_model = None
_encoder = None


def _load_model():
    """Lazy-load the trained model and label encoder."""
    global _model, _encoder
    if _model is None:
        if not os.path.exists(MODEL_PATH):
            raise FileNotFoundError(
                f"Model not found at {MODEL_PATH}. "
                "Run 'python app/ml/train_model.py' first."
            )
        _model = joblib.load(MODEL_PATH)
        _encoder = joblib.load(ENCODER_PATH)


def _engineer_features(rainfall: float, ph_level: float,
                       contamination: float, cases_count: int) -> np.ndarray:
    """
    Apply the same feature engineering as training.
    Must match FEATURE_COLS order in train_model.py:
    [rainfall, ph_level, contamination, cases_count,
     ph_deviation, rain_contam_interaction, cases_per_contam, severity_score]
    """
    ph_deviation = abs(ph_level - 7.0)
    rain_contam_interaction = rainfall * contamination
    cases_per_contam = cases_count / (contamination + 0.01)
    severity_score = (
        rainfall / 400 * 0.25 +
        ph_deviation / 3.0 * 0.25 +
        contamination * 0.25 +
        cases_count / 120 * 0.25
    )

    return np.array([[
        rainfall, ph_level, contamination, cases_count,
        ph_deviation, rain_contam_interaction, cases_per_contam, severity_score,
    ]])


def predict(rainfall: float, ph_level: float,
            contamination: float, cases_count: int) -> dict:
    """
    Predict risk level using a Hybrid Approach:
    1. Expert Rule-Based Overrides (Safety Net)
    2. ML Hybrid Ensemble (Statistical Core)
    """
    
    # --- Layer 1: Rule-Based Safety Overrides ---
    # In public health, certain metrics are so high they override models
    if contamination > 0.85:
        return {"risk_level": "high", "confidence": 1.0, "reason": "Critical Contamination Threshold Exceeded"}
    
    if rainfall > 450 and contamination > 0.4:
        return {"risk_level": "high", "confidence": 0.95, "reason": "Heavy Rain + Contamination Interaction"}

    if cases_count > 80:
         return {"risk_level": "high", "confidence": 0.98, "reason": "Localized Outbreak Pattern Detected"}

    # --- Layer 2: ML Hybrid Ensemble ---
    _load_model()
    features = _engineer_features(rainfall, ph_level, contamination, cases_count)
    
    prediction = _model.predict(features)[0]
    probabilities = _model.predict_proba(features)[0]

    risk_level = _encoder.inverse_transform([prediction])[0]
    confidence = float(max(probabilities))

    return {
        "risk_level": risk_level,
        "confidence": round(confidence, 4),
        "method": "hybrid_ensemble"
    }
