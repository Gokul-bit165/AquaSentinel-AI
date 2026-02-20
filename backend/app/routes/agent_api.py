from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.agent_orchestrator import orchestrator
from app.services.simulation_service import simulation_service
from typing import Optional, Dict

router = APIRouter(prefix="/agent", tags=["Agentic AI"])

class PredictionRequest(BaseModel):
    rainfall: float
    ph_level: float
    contamination: float
    cases_count: int

class SimulationRequest(BaseModel):
    baseline: PredictionRequest
    updates: Dict[str, float]

@router.post("/analyze")
async def analyze_outbreak(data: PredictionRequest):
    """Run the 3-agent workflow for a specific data point."""
    try:
        result = await orchestrator.run_workflow(
            data.rainfall, data.ph_level, data.contamination, data.cases_count
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/simulate")
async def simulate_scenario(data: SimulationRequest):
    """Run a 'What-If' Digital Twin simulation."""
    try:
        result = await simulation_service.run_scenario(
            data.baseline.model_dump(), data.updates
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
