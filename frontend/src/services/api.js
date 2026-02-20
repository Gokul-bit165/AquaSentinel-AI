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

/** Submit multiple predictions at once. */
export const submitBatchPredictions = (data) => api.post('/predict/batch', data);

/** Fetch all past predictions. */
export const getPredictions = () => api.get('/predictions');

/** Fetch all active alerts. */
export const getAlerts = () => api.get('/alerts');

/** Resolve an alert. */
export const resolveAlert = (id) => api.patch(`/alerts/${id}/resolve`);

/** Fetch summary stats for the dashboard. */
export const getStats = () => api.get('/stats');

/** Fetch ML model metrics. */
export const getModelMetrics = () => api.get('/model/metrics');

// Agentic AI & Simulation (Ollama + SHAP)
export const getAgentAnalysis = (data) => api.post('/api/v1/agent/analyze', data);
export const runSimulation = (baseline, updates) => api.post('/api/v1/agent/simulate', { baseline, updates });

// Government Data & Real-Time APIs
export const getRealtimeWeather = () => api.get('/api/v1/realtime/weather');
export const getTerritoryPulse = () => api.get('/api/v1/realtime/pulse');

export default api;
