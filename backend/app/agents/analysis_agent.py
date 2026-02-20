import numpy as np
import shap
import joblib
from app.core.config import settings

class AnalysisAgent:
    """
    🔍 Analysis Agent
    Finds why an outbreak may happen using SHAP values.
    Provides feature importance for individual predictions.
    """
    def __init__(self, model=None):
        self.model = model or joblib.load(settings.abs_model_path)
        # Use a small background dataset for KernelExplainer if TreeExplainer isn't supported, 
        # but XGBoost/RandomForest normally support TreeExplainer.
        self.explainer = shap.Explainer(self.model)
        self.feature_names = [
            "Rainfall", "pH Level", "Contamination", "Recent Cases",
            "pH Deviation", "Rain-Contam Interaction", "Cases/Contam", "Severity Score"
        ]

    def analyze(self, features: list) -> dict:
        """Analyze the root cause of the prediction."""
        X = np.array([features])
        shap_values = self.explainer(X)
        
        # Get absolute SHAP values for importance
        abs_shap = np.abs(shap_values.values[0])
        # Sort by importance
        sorted_indices = np.argsort(abs_shap)[::-1]
        
        importance = []
        for i in sorted_indices:
            importance.append({
                "feature": self.feature_names[i],
                "impact": round(float(shap_values.values[0][i]), 4),
                "absolute_impact": round(float(abs_shap[i]), 4)
            })

        top_factors = [imp["feature"] for imp in importance if imp["impact"] > 0][:2]
        
        return {
            "top_factors": top_factors,
            "full_analysis": importance,
            "summary": f"Primary risk drivers: {', '.join(top_factors)}"
        }
