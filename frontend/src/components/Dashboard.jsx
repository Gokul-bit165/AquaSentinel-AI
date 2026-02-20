import { useState, useEffect, useCallback } from 'react';
import {
    MapPin,
    Search,
    Bell,
    MessageSquare,
    Activity,
    Droplets,
    TrendingUp,
    ChevronRight,
    AlertCircle,
    Clock,
    ShieldCheck,
    Zap,
    ArrowRight,
    Monitor
} from 'lucide-react';
import { submitPrediction, getPredictions, getAlerts, getStats } from '../services/api';
import StatsCards from './StatsCards';
import MapView from './MapView';
import AlertPanel from './AlertPanel';

export default function Dashboard() {
    const [predictions, setPredictions] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [submitStatus, setSubmitStatus] = useState(null);
    const [stats, setStats] = useState({
        total: 0,
        highRisk: 0,
        activeAlerts: 0,
        avgConfidence: 0
    });

    const [form, setForm] = useState({
        rainfall: 45,
        ph_level: 7.2,
        contamination: 0.15,
        cases_count: '',
        location: 'Zone A-12',
    });

    const fetchData = useCallback(async () => {
        try {
            const [predRes, alertRes, statsRes] = await Promise.all([
                getPredictions(),
                getAlerts(),
                getStats(),
            ]);
            setPredictions(predRes.data);
            setAlerts(alertRes.data);
            setStats(statsRes.data);
        } catch (err) {
            console.error('Failed to fetch data:', err);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSubmitStatus(null);

        try {
            const payload = {
                rainfall: parseFloat(form.rainfall),
                ph_level: parseFloat(form.ph_level),
                contamination: parseFloat(form.contamination),
                cases_count: parseInt(form.cases_count, 10) || 0,
                location: form.location,
            };

            const res = await submitPrediction(payload);
            setSubmitStatus({
                type: 'success',
                risk: res.data.risk_level,
                confidence: res.data.confidence,
                message: `Predicted: ${res.data.risk_level.toUpperCase()}`,
                rationale: `Based on recent rainfall (+${form.rainfall}mm) and a slight drop in pH, the AI model predicts a ${res.data.risk_level} risk of increased bacterial growth.`,
            });

            await fetchData();
            setCurrentStep(3); // Go to result step
        } catch (err) {
            setSubmitStatus({
                type: 'error',
                message: err.response?.data?.detail || 'Prediction failed. Check backend.',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Context Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-white border border-[var(--border-subtle)] rounded-2xl shadow-sm text-blue-600">
                        <MapPin size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black tracking-tight text-[var(--text-primary)] font-outfit">Regional Safety Command: Zone A-12</h2>
                        <div className="flex items-center gap-3 mt-1.5">
                            <span className="flex items-center gap-1.5 text-[10px] font-black text-green-600 uppercase tracking-widest bg-green-50 px-2.5 py-1 rounded-full border border-green-100">
                                <span className="w-1.5 h-1.5 bg-green-600 rounded-full animate-status"></span>
                                Active Monitoring
                            </span>
                            <span className="text-[10px] text-[var(--text-tertiary)] uppercase font-black tracking-widest opacity-60">
                                SYNC: 2M AGO
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Top Stats Cards (Using refined StatsCards component) */}
            <StatsCards stats={stats} />

            {/* Main Interactive Row */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
                {/* Risk Input Wizard */}
                <div className="xl:col-span-2 glass-card p-0 overflow-hidden min-h-[500px] flex flex-col border-[var(--border-subtle)] shadow-2xl shadow-blue-500/5">
                    <div className="p-6 px-8 border-b border-slate-100 flex items-center justify-between bg-white">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                                <Zap size={20} />
                            </div>
                            <h3 className="text-lg font-black text-[var(--text-primary)] font-outfit uppercase tracking-tight">Risk Input Wizard</h3>
                        </div>
                        <div className="flex items-center gap-1.5">
                            {[1, 2, 3].map(step => (
                                <div
                                    key={step}
                                    className={`h-1.5 rounded-full transition-all duration-500 ${currentStep >= step ? 'w-10 bg-blue-600' : 'w-10 bg-slate-100'
                                        }`}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="p-10 flex-1">
                        {currentStep === 1 && (
                            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-widest">Rainfall Intensity (mm/h)</label>
                                        <input
                                            type="range"
                                            name="rainfall"
                                            min="0" max="500"
                                            value={form.rainfall}
                                            onChange={handleChange}
                                            className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                        />
                                        <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                            <span>None</span>
                                            <span>Moderate</span>
                                            <span>Extreme</span>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-widest">Recorded Disease Cases (24h)</label>
                                        <input
                                            type="number"
                                            name="cases_count"
                                            placeholder="Enter case count"
                                            value={form.cases_count}
                                            onChange={handleChange}
                                            className="w-full bg-[var(--bg-tertiary)] border border-slate-200 focus:border-blue-500/30 focus:bg-white rounded-xl py-4 px-5 text-sm font-medium transition-all outline-none"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-widest">Turbidity (NTU)</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                name="contamination"
                                                value={form.contamination}
                                                onChange={handleChange}
                                                className="w-full bg-[var(--bg-tertiary)] border border-slate-200 focus:border-blue-500/30 focus:bg-white rounded-xl py-4 px-5 text-sm font-medium transition-all outline-none"
                                            />
                                            <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">NTU</span>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-widest">Chlorine Residual (mg/L)</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                placeholder="0.8"
                                                className="w-full bg-[var(--bg-tertiary)] border border-slate-200 focus:border-blue-500/30 focus:bg-white rounded-xl py-4 px-5 text-sm font-medium transition-all outline-none"
                                            />
                                            <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">mg/L</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="pt-8 flex items-center justify-between border-t border-slate-100">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Step 1 of 3: Environmental and Water Quality</p>
                                    <button
                                        onClick={() => setCurrentStep(2)}
                                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-8 rounded-2xl shadow-lg shadow-blue-600/20 transition-all flex items-center gap-3 group"
                                    >
                                        Next Step
                                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {currentStep === 2 && (
                            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                                <div className="p-8 bg-blue-50 rounded-3xl border border-blue-100 flex items-start gap-4">
                                    <AlertCircle className="text-blue-500 mt-1" size={24} />
                                    <div className="space-y-2">
                                        <p className="font-bold text-blue-900">Final Verification</p>
                                        <p className="text-sm text-blue-700 leading-relaxed">
                                            Please confirm that all data submitted is accurate to your local sensor readings.
                                            This will trigger a system-wide safety prediction.
                                        </p>
                                    </div>
                                </div>
                                <div className="pt-8 flex items-center justify-between border-t border-slate-100">
                                    <button
                                        onClick={() => setCurrentStep(1)}
                                        className="text-xs font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest"
                                    >
                                        Back to Data Entry
                                    </button>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={loading}
                                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-10 rounded-2xl shadow-lg shadow-blue-600/20 transition-all flex items-center gap-3 disabled:opacity-70"
                                    >
                                        {loading ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : 'Run AI Analysis'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {currentStep === 3 && submitStatus && (
                            <div className="animate-in zoom-in-95 duration-500 space-y-8">
                                <div className="flex flex-col md:flex-row items-center gap-12">
                                    {/* Confidence Gauge */}
                                    <div className="relative w-48 h-48 flex items-center justify-center shrink-0">
                                        <svg className="w-full h-full -rotate-90">
                                            <circle cx="96" cy="96" r="88" className="fill-none stroke-slate-100 stroke-[16]" />
                                            <circle cx="96" cy="96" r="88"
                                                className={`fill-none stroke-[16] transition-all duration-1000 ${submitStatus.risk === 'high' ? 'stroke-red-500' :
                                                    submitStatus.risk === 'medium' ? 'stroke-amber-500' : 'stroke-green-500'
                                                    }`}
                                                strokeDasharray={552}
                                                strokeDashoffset={552 - (552 * (submitStatus.confidence || 0.7))}
                                                strokeLinecap="round"
                                            />
                                        </svg>
                                        <div className="absolute flex flex-col items-center">
                                            <span className="text-4xl font-extrabold text-[var(--text-primary)] tracking-tighter">
                                                {Math.round((submitStatus.confidence || 0.7) * 100)}%
                                            </span>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Confidence</span>
                                        </div>
                                    </div>

                                    {/* Result Details */}
                                    <div className="flex-1 space-y-6">
                                        <div className="flex flex-wrap items-center gap-4">
                                            <span className={`text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest border ${submitStatus.risk === 'high' ? 'bg-red-50 border-red-100 text-red-600' :
                                                submitStatus.risk === 'medium' ? 'bg-amber-50 border-amber-100 text-amber-600' : 'bg-green-50 border-green-100 text-green-600'
                                                }`}>
                                                Prediction: {submitStatus.risk.toUpperCase()} RISK
                                            </span>
                                            <span className="text-[10px] text-[var(--text-tertiary)] uppercase font-bold tracking-widest">• Analysis ID: #AS-99821</span>
                                        </div>

                                        <h4 className="text-3xl font-bold text-[var(--text-primary)] leading-tight">Predicted Waterborne Outbreak Potential</h4>
                                        <p className="text-[var(--text-secondary)] leading-relaxed">
                                            {submitStatus.rationale}
                                        </p>

                                        {/* Recommendations */}
                                        <div className="bg-slate-50/50 rounded-3xl p-8 border border-slate-100 space-y-6">
                                            <div className="flex items-center gap-2.5 text-[11px] font-black text-[var(--text-primary)] uppercase tracking-[0.2em] mb-2">
                                                <Info size={16} className="text-amber-500" />
                                                Actionable Recommendations
                                            </div>
                                            <ul className="space-y-4">
                                                <li className="flex items-center justify-between group">
                                                    <div className="flex items-center gap-3">
                                                        <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                                                        <span className="text-[13px] font-bold text-[var(--text-secondary)]">Issue community <span className="text-[var(--text-primary)]">"Boil Water"</span> advisory</span>
                                                    </div>
                                                    <span className="text-[11px] font-black text-amber-600 uppercase tracking-widest bg-amber-50 px-3 py-1 rounded-lg">sub-zones 4 and 5</span>
                                                </li>
                                                <li className="flex items-center justify-between border-t border-slate-100 pt-4 group">
                                                    <div className="flex items-center gap-3">
                                                        <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                                                        <span className="text-[13px] font-bold text-[var(--text-secondary)]">Increase chlorination levels at Central Processing</span>
                                                    </div>
                                                    <span className="text-[11px] font-black text-[var(--text-primary)] uppercase tracking-widest bg-white shadow-sm border border-slate-100 px-3 py-1 rounded-lg">0.15 mg/L</span>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                                <div className="pt-8 flex justify-center border-t border-slate-100">
                                    <button
                                        onClick={() => {
                                            setCurrentStep(1);
                                            setSubmitStatus(null);
                                        }}
                                        className="text-xs font-bold text-blue-600 hover:text-blue-800 uppercase tracking-widest flex items-center gap-2"
                                    >
                                        Start New Analysis <Zap size={14} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar Column: Map Preview + Recent Reports */}
                <div className="space-y-8">
                    {/* Tiny Map Card */}
                    <div className="glass-card overflow-hidden">
                        <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest">Local Hotspot</p>
                                <p className="font-bold text-xs text-[var(--text-primary)]">Zone A-12 Sector 4</p>
                            </div>
                            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shadow-sm border border-blue-100">
                                <Activity size={16} />
                            </div>
                        </div>
                        <div className="h-48 relative overflow-hidden saturate-[0.8] brightness-[0.95]">
                            <MapView predictions={predictions} mini={true} />
                            <div className="absolute bottom-4 right-4 z-[40]">
                                <button className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
                                    <Monitor size={12} /> Full Map View
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Alerts Panel */}
                    <AlertPanel alerts={alerts} />
                </div>
            </div>
        </div>
    );
}

