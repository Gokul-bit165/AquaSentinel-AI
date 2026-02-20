import pytest

def test_health_check(client):
    """Verifies that the API is up and reachable."""
    response = client.get("/")
    assert response.status_code == 200

def test_prediction_creation(client):
    """Verifies that /predict endpoint works and creates database records."""
    payload = {
        "rainfall": 50,
        "ph_level": 7.0,
        "contamination": 0.05,
        "cases_count": 0,
        "location": "TestCity"
    }
    response = client.post("/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["risk_level"] == "low"
    assert data["location"] == "TestCity"
    assert "recommendation" in data
    assert "id" in data

def test_alert_generation(client):
    """Verifies that HIGH risk predictions automatically generate alerts."""
    payload = {
        "rainfall": 400,
        "ph_level": 4.0,
        "contamination": 0.9,
        "cases_count": 100,
        "location": "FloodCity"
    }
    # Prediction should be HIGH risk
    client.post("/predict", json=payload)
    
    # Check alerts endpoint
    response = client.get("/alerts")
    assert response.status_code == 200
    alerts = response.json()
    assert len(alerts) > 0
    assert any("HIGH" in a["severity"] or "CRITICAL" in a["severity"] for a in alerts)

def test_stats_and_trends(client):
    """Verifies that /stats endpoint returns correct summary data including trends."""
    # Create a couple of predictions to have data
    client.post("/predict", json={"rainfall": 10, "ph_level": 7, "contamination": 0.01, "cases_count": 0, "location": "TrendCity"})
    client.post("/predict", json={"rainfall": 400, "ph_level": 4, "contamination": 0.9, "cases_count": 50, "location": "TrendCity"})
    
    response = client.get("/stats")
    assert response.status_code == 200
    data = response.json()
    assert data["total_predictions"] >= 2
    assert "risk_distribution" in data
    assert "trend_distribution" in data

def test_batch_prediction(client):
    """Verifies that /predict/batch endpoint works correctly."""
    payload = {
        "predictions": [
            {"rainfall": 10, "ph_level": 7.1, "contamination": 0.01, "cases_count": 0, "location": "CityA"},
            {"rainfall": 300, "ph_level": 5.2, "contamination": 0.8, "cases_count": 40, "location": "CityB"}
        ]
    }
    response = client.post("/predict/batch", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 2
    assert data["successful"] == 2
    assert len(data["predictions"]) == 2
