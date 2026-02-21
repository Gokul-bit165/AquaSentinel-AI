import random
import logging
import hashlib
from datetime import datetime
from app.services.weather_service import weather_service
from app.services.medical_service import medical_service
from app.ml.predictor import predict
from app.utils.database import SessionLocal
from app.models.prediction import Prediction, Alert

logger = logging.getLogger("aqua-sentinel")


class PulseService:
    """
    💓 Intelligence Pulse Service
    Coordinates automated data ingestion for all territories.
    Provides a "Live Pulse" state for the government dashboard.
    """

    def __init__(self):
        self.last_pulse = []

    def _get_ward_random(self, ward_name: str):
        """Returns a seeded Random instance stable for the current hour."""
        hour_key = datetime.now().strftime("%Y-%m-%d-%H")
        seed = int(hashlib.md5(f"{ward_name}:{hour_key}".encode()).hexdigest(), 16) % (2**32)
        return random.Random(seed)

    async def get_territory_pulse(self) -> list:
        """
        Runs a full diagnostic pulse for all Coimbatore wards.
        Aggregates Live Weather + Automated Medical + Simulated Sensors.
        """
        # 1. Get Live Weather (Context for all wards)
        try:
            weather = await weather_service.get_current_weather()
        except Exception as e:
            logger.error(f"Weather fetch failed, using fallback: {e}")
            weather = {"rainfall": 0.5, "temperature": 32, "humidity": 45}

        rainfall = weather.get("rainfall", 0.5)

        # 2. Iterate through all wards
        territories = medical_service.get_all_territories()
        pulse_results = []

        for ward in territories:
            try:
                rng = self._get_ward_random(ward)
                # Get automated medical records
                med_data = medical_service.get_ward_records(ward)
                cases = med_data.get("historical_cases", 0)

                # Simulate water quality (sensor data per ward — stable per hour)
                ph_level = 7.0 + rng.uniform(-0.5, 0.5)
                contamination = 0.1 + rng.uniform(0, 0.3)
                if "Singanallur" in ward or "Podanur" in ward:
                    contamination += 0.2
                if "Gandhipuram" in ward:
                    contamination += 0.15
                
                # Force High Risk for demonstration zones
                if "Zone Alpha" in ward:
                    rainfall = 500.0
                    contamination = 0.65
                elif "Zone Beta" in ward:
                    contamination = 0.95
                elif "Zone Gamma" in ward:
                    cases = 120

                # 3. Run AI Prediction
                ai_result = predict(
                    rainfall=rainfall,
                    ph_level=ph_level,
                    contamination=contamination,
                    cases_count=cases
                )

                pulse_results.append({
                    "ward_name": ward,
                    "risk_level": ai_result["risk_level"],
                    "confidence": ai_result["confidence"],
                    "reason": ai_result.get("reason", "Standard Model Analysis"),
                    "method": ai_result.get("method", "ml_ensemble"),
                    "prediction": f"Outbreak {'likely within 7 days' if ai_result['risk_level'] == 'high' else 'unlikely in near term' if ai_result['risk_level'] == 'low' else 'possible within 14 days'}",
                    "metrics": {
                        "rainfall": round(rainfall, 2),
                        "ph_level": round(ph_level, 2),
                        "contamination": round(contamination, 2),
                        "cases_count": cases
                    }
                })

                # 4. Sync HIGH risk alerts with Database (Hackathon Demo Logic)
                if ai_result["risk_level"] == "high":
                    self._sync_high_risk_to_db(ward, rainfall, ph_level, contamination, cases, ai_result)
            except Exception as e:
                logger.error(f"Pulse failed for ward {ward}: {e}")
                # Fallback entry so the ward still appears
                pulse_results.append({
                    "ward_name": ward,
                    "risk_level": "low",
                    "confidence": 0.5,
                    "reason": f"Sensor offline: {str(e)[:50]}",
                    "method": "fallback",
                    "prediction": "Data unavailable — manual check recommended",
                    "metrics": {
                        "rainfall": 0, "ph_level": 7.0,
                        "contamination": 0, "cases_count": 0
                    }
                })

        self.last_pulse = pulse_results
        return pulse_results

    def _sync_high_risk_to_db(self, location: str, rainfall: float, ph_level: float, 
                             contamination: float, cases: int, ai_result: dict):
        """Ensures a HIGH risk simulation creates a DB alert if one doesn't exist."""
        db = SessionLocal()
        try:
            # Check for existing unresolved alert for this location in the last HOUR
            existing = (
                db.query(Alert)
                .join(Prediction)
                .filter(Prediction.location == location)
                .filter(Alert.is_resolved == False)
                .first()
            )
            
            if not existing:
                logger.info(f"🚨 Pulse Sync: Automatically generating alert for {location}")
                
                # Logic copied from prediction_service.py to maintain consistency
                prediction = Prediction(
                    rainfall=rainfall,
                    ph_level=ph_level,
                    contamination=contamination,
                    cases_count=cases,
                    risk_level=ai_result["risk_level"],
                    severity="CRITICAL" if "Zone" in location else "HIGH",
                    trend="RISING",
                    confidence=ai_result["confidence"],
                    recommendation=f"Urgent response required for {location}. Resource deployment recommended.",
                    location=location,
                )
                db.add(prediction)
                db.commit()
                db.refresh(prediction)

                alert = Alert(
                    prediction_id=prediction.id,
                    severity=prediction.severity,
                    message=f"🚨 PULSE ALERT: {ai_result.get('reason', 'Critical sensor anomaly detected')} in {location}.",
                )
                db.add(alert)
                db.commit()
        except Exception as e:
            logger.error(f"Failed to sync pulse alert for {location}: {e}")
        finally:
            db.close()


pulse_service = PulseService()
