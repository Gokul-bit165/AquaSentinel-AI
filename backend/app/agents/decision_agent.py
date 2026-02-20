import httpx
import json
from app.core.config import settings

class DecisionAgent:
    """
    🚨 Decision Agent
    Suggests specific actions based on risk and analysis.
    Uses Local Llama3 (Ollama).
    """
    def __init__(self):
        self.base_url = f"{settings.OLLAMA_BASE_URL}/api/generate"
        self.model = settings.LLM_MODEL

    async def decide(self, risk_level: str, confidence: float, top_factors: list, input_data: dict) -> dict:
        """Consult Llama3 for actionable advice."""
        
        prompt = f"""
        System: You are 'AquaSentinel Advisor', an expert in waterborne disease prevention and public health.
        
        Context:
        - Risk Level: {risk_level} (Confidence: {confidence*100:.1f}%)
        - Primary Drivers: {', '.join(top_factors)}
        - Environmental Data: {json.dumps(input_data)}
        
        Task:
        Provide 3-4 professional, actionable recommendations for local government and health officials.
        Format your response as a JSON object with four keys: 
        1. 'recommendations' (a list of strings)
        2. 'public_warning' (a concise string for a public alert)
        3. 'brief_description' (a 2-3 sentence overview of why this level of action is being taken)
        4. 'final_decision' (a single powerful sentence stating the ultimate command for the region)
        
        Keep it professional and high-impact.
        """

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(self.base_url, json={
                    "model": self.model,
                    "prompt": prompt,
                    "stream": False,
                    "format": "json"
                })
                
                if response.status_code == 200:
                    result = response.json()
                    # Some versions of Ollama return the response string which needs second parsing
                    advice_data = json.loads(result.get("response", "{}"))
                    return advice_data
                else:
                    return self._fallback_advice(risk_level)
        except Exception as e:
            print(f"DecisionAgent Error: {e}")
            return self._fallback_advice(risk_level)

    def _fallback_advice(self, risk_level: str) -> dict:
        """Static fallback if Llama3 is unavailable."""
        if risk_level.upper() == "HIGH":
            return {
                "recommendations": [
                    "Increase chlorination in community water tanks immediately.",
                    "Deploy rapid response medical teams to the affected ward.",
                    "Halt all non-crucial water distribution from suspect sources."
                ],
                "public_warning": "🚨 HIGH ALERT: Boil all drinking water. Contamination risk in progress.",
                "brief_description": "Critical environmental indicators and surging case counts necessitate an immediate intervention to prevent a widespread outbreak.",
                "final_decision": "IMMEDIATE DEPLOYMENT: Activate emergency containment protocol for the entire ward."
            }
        return {
            "recommendations": ["Routine monitoring recommended.", "Ensure water storage is covered."],
            "public_warning": "Water quality is currently within safe limits.",
            "brief_description": "Current data suggests a low-risk environment with no immediate threat to public health.",
            "final_decision": "MAINTAIN POSTURE: Continue routine surveillance and sensor calibration."
        }
