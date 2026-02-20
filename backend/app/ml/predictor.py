"""
ML model predictor for AquaSentinel AI.
Loads the trained model at import time and exposes prediction functions.
"""
import os
import numpy as np
import joblib

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(SCRIPT_DIR, "model.pkl")
ENCODER_PATH = os.path.join(SCRIPT_DIR, "label_encoder.pkl")

# Load model and encoder at module level (singleton pattern)
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


def predict(rainfall: float, ph_level: float,
            contamination: float, cases_count: int) -> dict:
    """
    Predict waterborne disease risk level.

    Returns:
        dict with 'risk_level' (str) and 'confidence' (float)
    """
    _load_model()

    features = np.array([[rainfall, ph_level, contamination, cases_count]])
    prediction = _model.predict(features)[0]
    probabilities = _model.predict_proba(features)[0]

    risk_level = _encoder.inverse_transform([prediction])[0]
    confidence = float(max(probabilities))

    return {
        "risk_level": risk_level,
        "confidence": round(confidence, 4),
    }
