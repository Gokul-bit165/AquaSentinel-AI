import { useState, useEffect, useCallback } from 'react';
import {
    Droplets, Cloud, Thermometer, MapPin, Users, ArrowRight,
    RefreshCw, Info, ChevronRight, FileText, Zap, Brain
} from 'lucide-react';
import { submitPrediction, getPredictions, getAlerts, getStats, getAgentAnalysis, runSimulation } from '../services/api';
import StatsCards from './StatsCards';
import MapView from './MapView';
import AlertPanel from './AlertPanel';
import PredictionChart from './PredictionChart';
import AgentInsights from './AgentInsights';
import SimulationPanel from './SimulationPanel';

const Dashboard = () => {
    // Shared State
    const [predictions, setPredictions] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [stats, setStats] = useState({ total: 0, highRisk: 0, activeAlerts: 0, avgConfidence: 0 });
    const [isLoading, setIsLoading] = useState(true);

    // UI State
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [simulating, setSimulating] = useState(false);
    const [predictionResult, setPredictionResult] = useState(null);
    const [agentInsights, setAgentInsights] = useState(null);
    const [simulationData, setSimulationData] = useState(null);

    // Form data (Combined)
    const [formData, setFormData] = useState({
        rainfall: 250,
        ph_level: 6.8,
        contamination: 0.4,
        cases_count: 15,
        location: 'Coimbatore South',
    });

    // Fetch primary data
    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [p, a, s] = await Promise.all([getPredictions(), getAlerts(), getStats()]);
            setPredictions(p.data);
            setAlerts(a.data);
            const raw = s.data;
            setStats({
                total: raw.total_predictions || 0,
                highRisk: raw.risk_distribution?.high || 0,
                activeAlerts: raw.active_alerts || 0,
                avgConfidence: raw.avg_confidence || 0,
            });
        } catch (err) {
            console.error('Data fetch failed:', err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 60000);
        return () => clearInterval(interval);
    }, [fetchData]);

    // Enhanced Multi-Agent Submission
    const handleSubmit = async () => {
        setIsSubmitting(true);
        setAgentInsights(null);
        setSimulationData(null);

        try {
            const payload = {
                rainfall: parseFloat(formData.rainfall),
                ph_level: parseFloat(formData.ph_level),
                contamination: parseFloat(formData.contamination),
                cases_count: parseInt(formData.cases_count, 10),
            };

            // 1. Core Prediction & Save
            const res = await submitPrediction({ ...payload, location: formData.location });
            setPredictionResult(res.data);

            // 2. Multi-Agent Reasoning (Explainable AI)
            const analysisRes = await getAgentAnalysis(payload);
            setAgentInsights(analysisRes.data);

            await fetchData();
        } catch (err) {
            console.error('Agentic analysis failed:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Digital Twin Simulation
    const handleSimulate = async (updates) => {
        setSimulating(true);
        try {
            const res = await runSimulation(formData, updates);
            const simResult = {
                ...res.data.impact.prediction,
                ...res.data.modified_inputs,
                location: `${formData.location} (Simulated)`,
                isSimulation: true
            };
            setAgentInsights(res.data.impact);
            setSimulationData(simResult);
        } catch (err) {
            console.error('Simulation failed:', err);
        } finally {
            setSimulating(false);
        }
    };

    const riskColor = (level) => {
        switch (level?.toLowerCase()) {
            case 'high': return 'text-red-600 bg-red-50 border-red-200';
            case 'medium': return 'text-amber-600 bg-amber-50 border-amber-200';
            default: return 'text-green-600 bg-green-50 border-green-200';
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900">Safety Hub</h2>
                    <p className="text-sm text-slate-500 mt-1">Operational intelligence & Agentic risk monitoring</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-xs font-semibold text-cyan-600 bg-cyan-50 px-4 py-2 rounded-lg border border-cyan-100 uppercase tracking-tighter">
                        <span className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse" />
                        Multi-Agent Active
                    </div>
                    <button onClick={fetchData} className="p-2.5 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-blue-600 transition-all">
                        <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            <StatsCards stats={stats} />

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                {/* Control Panel (Wizard + Agent Analytics) */}
                <div className="xl:col-span-8 space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Risk Input Wizard */}
                        <div className="glass-card p-6 border-white/40">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2">
                                    <Zap size={18} className="text-blue-600" />
                                    Risk Input Wizard
                                </h3>
                                <div className="flex items-center gap-1.5">
                                    {[1, 2, 3].map(s => (
                                        <div key={s} className={`w-2 h-2 rounded-full transition-all ${step >= s ? 'bg-blue-600' : 'bg-slate-200'}`} />
                                    ))}
                                </div>
                            </div>

                            {step === 1 && (
                                <div className="space-y-6">
                                    <SliderInput label="Rainfall" icon={Cloud} unit="mm" value={formData.rainfall} min={0} max={500} onChange={v => setFormData({ ...formData, rainfall: v })} />
                                    <SliderInput label="pH Level" icon={Thermometer} unit="pH" value={formData.ph_level} min={0} max={14} step={0.1} onChange={v => setFormData({ ...formData, ph_level: v })} />
                                    <SliderInput label="Contamination" icon={Droplets} unit="%" value={formData.contamination * 100} min={0} max={100} onChange={v => setFormData({ ...formData, contamination: v / 100 })} />
                                    <button onClick={() => setStep(2)} className="w-full py-3 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
                                        Continue <ArrowRight size={16} />
                                    </button>
                                </div>
                            )}

                            {step === 2 && (
                                <div className="space-y-6">
                                    <SliderInput label="Disease Cases" icon={Users} unit="pts" value={formData.cases_count} min={0} max={200} onChange={v => setFormData({ ...formData, cases_count: v })} />
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Target Location</label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                            <input type="text" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })}
                                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-400 focus:bg-white" />
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <button onClick={() => setStep(1)} className="flex-1 py-3 border border-slate-200 text-slate-500 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-all">Back</button>
                                        <button onClick={() => { handleSubmit(); setStep(3); }} disabled={isSubmitting}
                                            className="flex-1 py-3 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                                            {isSubmitting ? <><RefreshCw className="animate-spin" size={16} /> Collaborating...</> : 'Analyze Risk'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {step === 3 && (
                                <div className="space-y-6 animate-fade-in">
                                    {predictionResult ? (
                                        <>
                                            <div className={`p-6 rounded-xl border text-center ${riskColor(predictionResult.risk_level)}`}>
                                                <p className="text-[10px] font-bold uppercase tracking-widest mb-2 opacity-60">Agentic Risk Score</p>
                                                <p className="text-4xl font-black uppercase tracking-tighter">{predictionResult.risk_level}</p>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="bg-slate-50 rounded-xl p-4 text-center border border-slate-100">
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Confidence</p>
                                                    <p className="text-xl font-bold text-slate-800">{Math.round((predictionResult.confidence || 0) * 100)}%</p>
                                                </div>
                                                <div className="bg-slate-50 rounded-xl p-4 text-center border border-slate-100">
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Ward</p>
                                                    <p className="text-sm font-bold text-slate-800 truncate">{predictionResult.location}</p>
                                                </div>
                                            </div>
                                            <button onClick={() => { setStep(1); setPredictionResult(null); }}
                                                className="w-full py-3 border border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500 rounded-xl hover:bg-slate-50 transition-all">
                                                New Analysis
                                            </button>
                                        </>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                                            <RefreshCw className="animate-spin mb-4 text-blue-500" size={32} />
                                            <p className="text-sm font-medium">Multi-Agents Analyzing Scenario...</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Digital Twin Simulation Panel */}
                        <SimulationPanel onSimulate={handleSimulate} isLoading={simulating} />
                    </div>

                    {/* Agent Insights & Results */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2">
                            <AgentInsights insights={agentInsights} isLoading={isSubmitting} />
                        </div>
                        <div className="glass-card p-6 flex flex-col justify-center">
                            <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2 uppercase tracking-wider">
                                <Brain size={18} className="text-purple-600" />
                                AI Synthesis
                            </h3>
                            <p className="text-xs text-slate-500 leading-relaxed italic">
                                "{agentInsights ? agentInsights.decision?.public_warning : 'Waiting for risk analysis to generate strategic public health warnings and administrative actions...'}"
                            </p>
                        </div>
                    </div>
                </div>

                {/* Sidebar (Map & Alerts) */}
                <div className="xl:col-span-4 space-y-8">
                    <div className="glass-card p-0 overflow-hidden min-h-[400px] flex flex-col border-white/40 border-2">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Spatio-Temporal</h3>
                            <span className="text-[10px] font-bold bg-white border border-slate-200 text-slate-500 px-3 py-1 rounded-full uppercase">{predictions.length} Active Zones</span>
                        </div>
                        <div className="flex-1">
                            <MapView predictions={predictions} simulation={simulationData} mini={true} />
                        </div>
                    </div>
                    <AlertPanel alerts={alerts} />
                </div>
            </div>

            {/* Charts & History Row */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="xl:col-span-1">
                    <PredictionChart predictions={predictions} />
                </div>
                <div className="xl:col-span-2 glass-card p-6">
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 uppercase tracking-widest">
                            <FileText size={18} className="text-blue-500" />
                            Recent Analysis Reports
                        </h3>
                        <button className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 uppercase tracking-tighter">
                            View All <ChevronRight size={16} />
                        </button>
                    </div>
                    <div className="divide-y divide-slate-100 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        {predictions.slice(0, 5).map((p, i) => (
                            <div key={i} className="flex items-center justify-between py-4 group">
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black shadow-sm ${riskColor(p.risk_level)}`}>
                                        {p.risk_level === 'high' ? '!!!' : p.risk_level === 'medium' ? '!!' : '!'}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{p.location || `Zone ${i + 1}`}</p>
                                        <p className="text-[10px] font-medium text-slate-400 uppercase">Rain: {p.rainfall}mm · Conf: {Math.round((p.confidence || 0.9) * 100)}%</p>
                                    </div>
                                </div>
                                <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-md border text-center min-w-[70px] ${riskColor(p.risk_level)}`}>
                                    {p.risk_level}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const SliderInput = ({ label, icon, unit, value, min, max, step = 1, onChange }) => {
    const Icon = icon;
    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <Icon size={14} className="text-slate-400" /> {label}
                </label>
                <span className="text-xs font-black text-blue-600 bg-blue-50/50 px-2 py-1 rounded border border-blue-100 min-w-[45px] text-center">
                    {typeof value === 'number' ? Math.round(value * 10) / 10 : value}{unit}
                </span>
            </div>
            <input
                type="range" min={min} max={max} step={step} value={value}
                onChange={e => onChange(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
        </div>
    );
};

export default Dashboard;
