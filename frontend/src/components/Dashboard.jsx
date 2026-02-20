/**
 * Dashboard — Main layout composing all sub-components.
 * Includes prediction form, stats cards, map, chart, and alert panel.
 */
import { useState, useEffect, useCallback } from 'react';
import { submitPrediction, getPredictions, getAlerts } from '../services/api';
import StatsCards from './StatsCards';
import MapView from './MapView';
import AlertPanel from './AlertPanel';
import PredictionChart from './PredictionChart';

export default function Dashboard() {
    const [predictions, setPredictions] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(null);

    // Form state
    const [form, setForm] = useState({
        rainfall: '',
        ph_level: '',
        contamination: '',
        cases_count: '',
        location: '',
    });

    // Fetch existing data
    const fetchData = useCallback(async () => {
        try {
            const [predRes, alertRes] = await Promise.all([
                getPredictions(),
                getAlerts(),
            ]);
            setPredictions(predRes.data);
            setAlerts(alertRes.data);
        } catch (err) {
            console.error('Failed to fetch data:', err);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Handle prediction submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSubmitStatus(null);

        try {
            const payload = {
                rainfall: parseFloat(form.rainfall),
                ph_level: parseFloat(form.ph_level),
                contamination: parseFloat(form.contamination),
                cases_count: parseInt(form.cases_count, 10),
                location: form.location || 'Unknown',
            };

            const res = await submitPrediction(payload);
            setSubmitStatus({
                type: 'success',
                risk: res.data.risk_level,
                message: `Risk: ${res.data.risk_level.toUpperCase()} (${(res.data.confidence * 100).toFixed(1)}% confidence)`,
            });

            // Refresh data
            await fetchData();

            // Reset form
            setForm({ rainfall: '', ph_level: '', contamination: '', cases_count: '', location: '' });
        } catch (err) {
            setSubmitStatus({
                type: 'error',
                message: err.response?.data?.detail || 'Prediction failed. Is the backend running?',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const inputFields = [
        { name: 'rainfall', label: 'Rainfall (mm)', placeholder: '250', type: 'number', icon: '🌧️' },
        { name: 'ph_level', label: 'pH Level', placeholder: '5.5', type: 'number', icon: '⚗️' },
        { name: 'contamination', label: 'Contamination (0-1)', placeholder: '0.8', type: 'number', icon: '☣️' },
        { name: 'cases_count', label: 'Disease Cases', placeholder: '45', type: 'number', icon: '🏥' },
        { name: 'location', label: 'Location', placeholder: 'Zone A', type: 'text', icon: '📍' },
    ];

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <StatsCards predictions={predictions} alerts={alerts} />

            {/* Prediction Form + Alert Panel Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Prediction Form */}
                <div className="lg:col-span-2 glass-card p-6">
                    <h3 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
                        <span className="text-xl">🧪</span> Submit Prediction
                    </h3>

                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
                            {inputFields.map((field) => (
                                <div key={field.name}>
                                    <label className="block text-xs font-medium text-slate-400 mb-1.5">
                                        {field.icon} {field.label}
                                    </label>
                                    <input
                                        type={field.type}
                                        name={field.name}
                                        value={form[field.name]}
                                        onChange={handleChange}
                                        placeholder={field.placeholder}
                                        step={field.type === 'number' ? 'any' : undefined}
                                        required={field.name !== 'location'}
                                        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl
                             text-white text-sm placeholder-slate-500
                             focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30
                             transition-all duration-200"
                                    />
                                </div>
                            ))}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-cyan-500 to-teal-500
                       text-white font-semibold rounded-xl shadow-lg shadow-cyan-500/20
                       hover:shadow-cyan-500/40 hover:scale-[1.02]
                       disabled:opacity-50 disabled:cursor-not-allowed
                       transition-all duration-300 text-sm"
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Analyzing...
                                </span>
                            ) : (
                                '🔬 Analyze Risk'
                            )}
                        </button>

                        {/* Status feedback */}
                        {submitStatus && (
                            <div
                                className={`mt-4 p-4 rounded-xl border text-sm ${submitStatus.type === 'success'
                                        ? submitStatus.risk === 'high'
                                            ? 'bg-red-500/10 border-red-500/30 text-red-300'
                                            : submitStatus.risk === 'medium'
                                                ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                                                : 'bg-green-500/10 border-green-500/30 text-green-300'
                                        : 'bg-red-500/10 border-red-500/30 text-red-300'
                                    }`}
                            >
                                {submitStatus.type === 'success' ? '✅' : '❌'} {submitStatus.message}
                            </div>
                        )}
                    </form>
                </div>

                {/* Alert Panel */}
                <div className="lg:col-span-1">
                    <AlertPanel alerts={alerts} />
                </div>
            </div>

            {/* Map View */}
            <MapView predictions={predictions} />

            {/* Charts */}
            <PredictionChart predictions={predictions} />
        </div>
    );
}
