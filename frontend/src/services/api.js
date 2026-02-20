/**
 * API service layer — connects frontend to the FastAPI backend.
 */
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
    baseURL: API_BASE,
    headers: { 'Content-Type': 'application/json' },
});

/**
 * Submit environmental data for risk prediction.
 * @param {{ rainfall: number, ph_level: number, contamination: number, cases_count: number, location?: string }} data
 */
export const submitPrediction = (data) => api.post('/predict', data);

/** Fetch all past predictions. */
export const getPredictions = () => api.get('/predictions');

/** Fetch all active alerts. */
export const getAlerts = () => api.get('/alerts');

// Agentic AI & Simulation (Ollama + SHAP)
export const getAgentAnalysis = (data) => api.post('/api/v1/agent/analyze', data);
export const runSimulation = (baseline, updates) => api.post('/api/v1/agent/simulate', { baseline, updates });

export default api;
