import { useState, useEffect, useCallback } from 'react';
import { submitPrediction, getPredictions, getAlerts, getAgentAnalysis, runSimulation } from '../services/api';
import StatsCards from './StatsCards';
import MapView from './MapView';
import AlertPanel from './AlertPanel';
import PredictionChart from './PredictionChart';
import AgentInsights from './AgentInsights';
import SimulationPanel from './SimulationPanel';

export default function Dashboard() {
    const [predictions, setPredictions] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [simulating, setSimulating] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(null);
    const [agentInsights, setAgentInsights] = useState(null);
    const [simulationData, setSimulationData] = useState(null);

    // Form state
    const [form, setForm] = useState({
        rainfall: '250',
        ph_level: '6.8',
        contamination: '0.4',
        cases_count: '15',
        location: 'Coimbatore South',
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

    // Handle prediction submission (Enhanced with Agentic AI)
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSubmitStatus(null);
        setAgentInsights(null);
        setSimulationData(null); // Clear simulation when new baseline is submitted

        try {
            const payload = {
                rainfall: parseFloat(form.rainfall),
                ph_level: parseFloat(form.ph_level),
                contamination: parseFloat(form.contamination),
                cases_count: parseInt(form.cases_count, 10),
            };

            // 1. Submit to database
            const res = await submitPrediction({ ...payload, location: form.location });

            // 2. Run Multi-Agent Analysis
            const analysisRes = await getAgentAnalysis(payload);
            setAgentInsights(analysisRes.data);

            setSubmitStatus({
                type: 'success',
                risk: res.data.risk_level,
                message: `Analysis Complete: ${res.data.risk_level.toUpperCase()} risk detected.`,
            });

            await fetchData();
        } catch (err) {
            setSubmitStatus({
                type: 'error',
                message: err.response?.data?.detail || 'Agentic analysis failed. Ensure Llama3 is running.',
            });
        } finally {
            setLoading(false);
        }
    };

    // Handle Digital Twin Simulation
    const handleSimulate = async (updates) => {
        setSimulating(true);
        try {
            const res = await runSimulation(form, updates);

            // Map the impact back to a "prediction" format for the map
            const simResult = {
                ...res.data.impact.prediction,
                ...res.data.modified_inputs,
                location: `${form.location} (Simulated)`,
                isSimulation: true
            };

            setAgentInsights(res.data.impact);
            setSimulationData(simResult);

            setSubmitStatus({
                type: 'success',
                risk: res.data.impact.prediction.risk_level,
                message: `Simulation Result: ${res.data.impact.prediction.risk_level.toUpperCase()}`,
            });
        } catch (err) {
            console.error('Simulation failed:', err);
        } finally {
            setSimulating(false);
        }
    };

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const inputFields = [
        { name: 'rainfall', label: 'Rainfall (mm)', placeholder: '250', type: 'number', icon: '🌧️' },
        { name: 'ph_level', label: 'pH Level', placeholder: '6.8', type: 'number', icon: '⚗️' },
        { name: 'contamination', label: 'Contamination', placeholder: '0.4', type: 'number', icon: '☣️' },
        { name: 'cases_count', label: 'Disease Cases', placeholder: '15', type: 'number', icon: '🏥' },
        { name: 'location', label: 'Location/Ward', placeholder: 'Coimbatore South', type: 'text', icon: '📍' },
    ];

    return (
        <div className="space-y-6">
            <StatsCards predictions={predictions} alerts={alerts} />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Main Control Panel (Form + Feedback) */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="glass-card p-6">
                        <div className="flex justify-between items-center mb-5">
                            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                <span className="text-xl">🛠️</span> System Controls
                            </h3>
                            <div className="flex gap-2">
                                <span className="px-2 py-1 bg-green-500/10 text-green-400 text-[10px] font-bold rounded border border-green-500/20">AGENTIC AI ACTIVE</span>
                                <span className="px-2 py-1 bg-purple-500/10 text-purple-400 text-[10px] font-bold rounded border border-purple-500/20">DIGITAL TWIN READY</span>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
                                {inputFields.map((field) => (
                                    <div key={field.name}>
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                                            {field.label}
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm">{field.icon}</span>
                                            <input
                                                type={field.type}
                                                name={field.name}
                                                value={form[field.name]}
                                                onChange={handleChange}
                                                className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl
                                                 text-white text-sm focus:border-cyan-500/50 transition-all outline-none"
                                                required
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600
                                   text-white font-bold rounded-xl shadow-lg shadow-cyan-500/20
                                   hover:shadow-cyan-500/40 hover:scale-[1.01] transition-all disabled:opacity-50"
                            >
                                {loading ? '🤖 Agents Collaborating...' : '🚀 Execute Multi-Agent Analysis'}
                            </button>

                            {submitStatus && (
                                <div className={`mt-4 p-3 rounded-xl border text-xs font-medium flex items-center gap-2 ${submitStatus.type === 'success' ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-300' : 'bg-red-500/10 border-red-500/20 text-red-300'
                                    }`}>
                                    {submitStatus.type === 'success' ? '⚡' : '⚠️'} {submitStatus.message}
                                </div>
                            )}
                        </form>
                    </div>

                    {/* Simulation Engine Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <SimulationPanel onSimulate={handleSimulate} isLoading={simulating} />
                        <AgentInsights insights={agentInsights} isLoading={loading} />
                    </div>
                </div>

                {/* Sidebar (Alerts) */}
                <div className="lg:col-span-4">
                    <AlertPanel alerts={alerts} />
                </div>
            </div>

            {/* Map and Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <MapView predictions={predictions} simulation={simulationData} />
                </div>
                <div className="lg:col-span-1">
                    <PredictionChart predictions={predictions} />
                </div>
            </div>
        </div>
    );
}
