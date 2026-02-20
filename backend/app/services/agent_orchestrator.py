from app.agents.prediction_agent import PredictionAgent
from app.agents.analysis_agent import AnalysisAgent
from app.agents.decision_agent import DecisionAgent

class AgentOrchestrator:
    """
    Coordination layer for the Multi-Agent system.
    Predicts -> Analyzes -> Decides.
    """
    def __init__(self):
        self.predict_agent = PredictionAgent()
        # Initialize analysis agent with prediction agent's model to share memory
        self.analyze_agent = AnalysisAgent(model=self.predict_agent.model)
        self.decide_agent = DecisionAgent()

    async def run_workflow(self, rainfall: float, ph_level: float, 
                           contamination: float, cases_count: int) -> dict:
        """Execute the full agentic loop."""
        
        # 1. Prediction
        prediction = self.predict_agent.predict(rainfall, ph_level, contamination, cases_count)
        
        # 2. Analysis
        analysis = self.analyze_agent.analyze(prediction["raw_features"])
        
        # 3. Decision (GenAI)
        decision = await self.decide_agent.decide(
            risk_level=prediction["risk_level"],
            confidence=prediction["confidence"],
            top_factors=analysis["top_factors"],
            input_data=prediction["input_data"]
        )
        
        return {
            "prediction": {
                "risk_level": prediction["risk_level"],
                "confidence": prediction["confidence"]
            },
            "analysis": analysis,
            "decision": decision,
            "status": "Success",
            "agents_involved": ["PredictionAgent", "AnalysisAgent", "DecisionAgent"]
        }

# Global orchestrator instance
orchestrator = AgentOrchestrator()
