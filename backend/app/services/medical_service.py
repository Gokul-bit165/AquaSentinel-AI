import random
import logging

logger = logging.getLogger("aqua-sentinel")

# Localized Coimbatore Wards (Wards 1-20 represent Coimbatore central)
WARD_NAMES = [
    "RS Puram, Coimbatore", "Gandhipuram, Coimbatore", "Peelamedu, Coimbatore", 
    "Saravanampatti, Coimbatore", "Singanallur, Coimbatore", "Vadavalli, Coimbatore", 
    "Thudiyalur, Coimbatore", "Kurichi, Coimbatore", "Podanur, Coimbatore", 
    "Kuniyamuthur, Coimbatore", "Ramanathapuram, Coimbatore", "Saibaba Colony, Coimbatore", 
    "Race Course, Coimbatore", "Ganapathy, Coimbatore", "Koundampalayam, Coimbatore", 
    "Periyanaickenpalayam, Coimbatore", "Sulur, Coimbatore", "Pollachi, Coimbatore", 
    "Mettupalayam, Coimbatore", "Karamadai, Coimbatore", "Annur, Coimbatore"
]

class MedicalService:
    """
    🏥 Automated Medical Records Service
    Provides historical disease records for Coimbatore wards.
    Simulates a government health database integration.
    """
    
    def __init__(self):
        # Initializing some "stable" mock data to simulate real records
        self._cache = {}

    def get_ward_records(self, ward_name: str) -> dict:
        """Fetch medical records/case counts for a specific territory."""
        if ward_name not in self._cache:
            # Seed the cache with semi-realistic data for the demo
            # Some wards are "historic hot-spots"
            base_cases = random.randint(5, 25)
            if any(hotspot in ward_name for hotspot in ["Gandhipuram", "Singanallur", "Podanur"]):
                base_cases += random.randint(20, 40)
            
            self._cache[ward_name] = {
                "historical_cases": base_cases,
                "active_outbreaks": 1 if base_cases > 40 else 0,
                "last_monitored": "2024-05-20"
            }
        
        return self._cache[ward_name]

    def get_all_territories(self) -> list:
        """Returns the list of all monitored Coimbatore wards."""
        return WARD_NAMES

medical_service = MedicalService()
