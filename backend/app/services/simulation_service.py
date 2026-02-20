from app.services.agent_orchestrator import orchestrator

class SimulationService:
    """
    🔮 Digital Twin Simulation Engine
    Allows "What-If" scenarios by modifying environment variables.
    Uses the Multi-Agent system to project future impacts.
    """
    
    async def run_scenario(self, baseline_data: dict, updates: dict) -> dict:
        """
        Run a simulation by applying 'updates' to 'baseline_data'.
        
        Example: updates = {"rainfall_multiplier": 1.2} # +20% rain
        """
        
        simulated_data = baseline_data.copy()
        
        # Apply multipliers or direct overrides
        if "rainfall_multiplier" in updates:
            simulated_data["rainfall"] *= updates["rainfall_multiplier"]
        if "contamination_multiplier" in updates:
            simulated_data["contamination"] *= updates["contamination_multiplier"]
        
        # Directly override if provided
        for key in ["rainfall", "ph_level", "contamination", "cases_count"]:
            if key in updates:
                simulated_data[key] = updates[key]

        # Run through the agent orchestrator
        result = await orchestrator.run_workflow(
            simulated_data["rainfall"],
            simulated_data["ph_level"],
            simulated_data["contamination"],
            simulated_data["cases_count"]
        )
        
        return {
            "scenario": updates,
            "modified_inputs": simulated_data,
            "impact": result,
            "simulation_id": "sim_at_runtime"
        }

simulation_service = SimulationService()
