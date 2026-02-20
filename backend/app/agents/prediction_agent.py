import numpy as np
import joblib
import os
from app.core.config import settings
from app.ml.predictor import _engineer_features

class PredictionAgent:
    """
    🧠 Prediction Agent
    Predicts outbreak risk based on environmental factors.
    Supports Digital Twin simulations by allowing parameter overrides.
    """
    def __init__(self):
        self.model = None
        self.encoder = None
        self._load_resources()

    def _load_resources(self):
        if os.path.exists(settings.abs_model_path):
            self.model = joblib.load(settings.abs_model_path)
            self.encoder = joblib.load(settings.abs_encoder_path)

    def predict(self, rainfall: float, ph_level: float, 
                contamination: float, cases_count: int) -> dict:
        if not self.model:
            return {"error": "Model not loaded"}
        
        features = _engineer_features(rainfall, ph_level, contamination, cases_count)
        prediction = self.model.predict(features)[0]
        probabilities = self.model.predict_proba(features)[0]
        
        risk_level = self.encoder.inverse_transform([prediction])[0]
        confidence = float(max(probabilities))
        
        return {
            "risk_level": risk_level,
            "confidence": round(confidence, 4),
            "raw_features": features[0].tolist(),
            "input_data": {
                "rainfall": rainfall,
                "ph_level": ph_level,
                "contamination": contamination,
                "cases_count": cases_count
            }
        }
