import requests
import json

url = "http://localhost:8000/api/v1/predict/batch"
data = {
    "predictions": [
        {
            "rainfall": 500.0,
            "ph_level": 6.5,
            "contamination": 0.6,
            "cases_count": 10,
            "location": "Zone Alpha (Flood Risk)"
        },
        {
            "rainfall": 10.0,
            "ph_level": 7.0,
            "contamination": 0.95,
            "cases_count": 5,
            "location": "Zone Beta (Toxic Spill)"
        },
        {
            "rainfall": 45.0,
            "ph_level": 7.2,
            "contamination": 0.2,
            "cases_count": 120,
            "location": "Zone Gamma (Outbreak)"
        }
    ]
}

try:
    response = requests.post(url, json=data)
    print(f"Status: {response.status_code}")
    print(response.json())
except Exception as e:
    print(f"Error: {e}")
