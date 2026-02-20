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

export default api;
