import numpy as np
import logging
import joblib
from app.core.config import settings

logger = logging.getLogger("aqua-sentinel")

class AnalysisAgent:
    """
    🔍 Analysis Agent
    Finds why an outbreak may happen using SHAP values.
    Provides feature importance for individual predictions.
    """
    def __init__(self, model=None):
        self.model = model or joblib.load(settings.abs_model_path)
        self.explainer = None
        self.feature_names = [
            "Rainfall", "pH Level", "Contamination", "Recent Cases",
            "pH Deviation", "Rain-Contam Interaction", "Cases/Contam", "Severity Score"
        ]

        # Try to create SHAP explainer — VotingClassifier may not be supported
        try:
            import shap
            # For ensemble models, try to use one of the sub-estimators
            if hasattr(self.model, 'estimators_'):
                # Use the first fitted estimator (e.g., RandomForest)
                self.explainer = shap.TreeExplainer(self.model.estimators_[0])
                logger.info("SHAP TreeExplainer initialized using first sub-estimator")
            else:
                self.explainer = shap.Explainer(self.model)
                logger.info("SHAP Explainer initialized directly")
        except Exception as e:
            logger.warning(f"SHAP explainer disabled (non-fatal): {e}")
            self.explainer = None

    def analyze(self, features: list) -> dict:
        """Analyze the root cause of the prediction."""
        X = np.array([features])

        if self.explainer is not None:
            try:
                shap_values = self.explainer(X)
                abs_shap = np.abs(shap_values.values[0])
                sorted_indices = np.argsort(abs_shap)[::-1]

                importance = []
                for i in sorted_indices:
                    if i < len(self.feature_names):
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
            except Exception as e:
                logger.warning(f"SHAP analysis failed, using rule-based: {e}")

        # Fallback: rule-based importance from raw feature values
        feature_vals = list(features)[:len(self.feature_names)]
        importance = []
        for i, name in enumerate(self.feature_names):
            val = feature_vals[i] if i < len(feature_vals) else 0
            importance.append({
                "feature": name,
                "impact": round(float(val), 4),
                "absolute_impact": round(abs(float(val)), 4)
            })
        importance.sort(key=lambda x: x["absolute_impact"], reverse=True)
        top_factors = [imp["feature"] for imp in importance[:2]]

        return {
            "top_factors": top_factors,
            "full_analysis": importance,
            "summary": f"Primary risk drivers: {', '.join(top_factors)}"
        }
