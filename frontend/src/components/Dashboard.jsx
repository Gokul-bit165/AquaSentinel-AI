import { useState, useEffect, useCallback } from 'react';
import {
    Droplets, Cloud, Thermometer, MapPin, Users, ArrowRight,
    RefreshCw, Info, ChevronRight, FileText
} from 'lucide-react';
import StatsCards from './StatsCards';
import MapView from './MapView';
import AlertPanel from './AlertPanel';
import PredictionChart from './PredictionChart';
import { getPredictions, getAlerts, getStats, submitPrediction } from '../services/api';

const Dashboard = () => {
    const [predictions, setPredictions] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [stats, setStats] = useState({ total: 0, highRisk: 0, activeAlerts: 0, avgConfidence: 0 });
    const [isLoading, setIsLoading] = useState(true);

    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        rainfall: 100, temperature: 30, humidity: 65, water_quality_index: 5,
        population_density: 350, historical_incidents: 2, location: 'Coimbatore'
    });
    const [predictionResult, setPredictionResult] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

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
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 60000);
        return () => clearInterval(interval);
    }, [fetchData]);

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const res = await submitPrediction(formData);
            setPredictionResult(res.data);
            fetchData();
        } catch (err) {
            console.error('Prediction failed:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const riskColor = (level) => {
        switch (level) {
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
                    <p className="text-sm text-slate-500 mt-1">Operational intelligence & risk monitoring</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-xs font-semibold text-green-600 bg-green-50 px-4 py-2 rounded-lg border border-green-100">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-status" />
                        System Active
                    </div>
                    <button onClick={fetchData} className="p-2.5 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-blue-600 hover:border-blue-200 transition-all">
                        <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            {/* Stats */}
            <StatsCards stats={stats} />

            {/* Main Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Risk Wizard */}
                <div className="glass-card p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-base font-semibold text-slate-800">Risk Input Wizard</h3>
                        <div className="flex items-center gap-2">
                            {[1, 2, 3].map(s => (
                                <div key={s} className={`w-2.5 h-2.5 rounded-full transition-all ${step >= s ? 'bg-blue-600' : 'bg-slate-200'}`} />
                            ))}
                        </div>
                    </div>

                    {step === 1 && (
                        <div className="space-y-6">
                            <SliderInput label="Rainfall" icon={Cloud} unit="mm" value={formData.rainfall} min={0} max={500} onChange={v => setFormData({ ...formData, rainfall: v })} />
                            <SliderInput label="Temperature" icon={Thermometer} unit="°C" value={formData.temperature} min={0} max={50} onChange={v => setFormData({ ...formData, temperature: v })} />
                            <SliderInput label="Humidity" icon={Droplets} unit="%" value={formData.humidity} min={0} max={100} onChange={v => setFormData({ ...formData, humidity: v })} />
                            <button onClick={() => setStep(2)} className="w-full py-3 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
                                Continue <ArrowRight size={16} />
                            </button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6">
                            <SliderInput label="Water Quality" icon={Droplets} unit="idx" value={formData.water_quality_index} min={0} max={10} step={0.1} onChange={v => setFormData({ ...formData, water_quality_index: v })} />
                            <SliderInput label="Population" icon={Users} unit="/km²" value={formData.population_density} min={0} max={1000} onChange={v => setFormData({ ...formData, population_density: v })} />
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Location</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <input type="text" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })}
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-400 focus:bg-white" />
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => setStep(1)} className="flex-1 py-3 border border-slate-200 text-slate-500 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-all">Back</button>
                                <button onClick={() => { handleSubmit(); setStep(3); }} disabled={isSubmitting}
                                    className="flex-1 py-3 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-all disabled:opacity-60">
                                    {isSubmitting ? 'Analyzing...' : 'Analyze Risk'}
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-6 animate-fade-in">
                            {predictionResult ? (
                                <>
                                    <div className={`p-6 rounded-xl border text-center ${riskColor(predictionResult.risk_level)}`}>
                                        <p className="text-xs font-bold uppercase tracking-wider mb-2">Risk Assessment</p>
                                        <p className="text-4xl font-bold uppercase">{predictionResult.risk_level}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-slate-50 rounded-xl p-4 text-center border border-slate-100">
                                            <p className="text-xs font-semibold text-slate-400 uppercase mb-1">Confidence</p>
                                            <p className="text-2xl font-bold text-slate-800">{Math.round((predictionResult.confidence || 0) * 100)}%</p>
                                        </div>
                                        <div className="bg-slate-50 rounded-xl p-4 text-center border border-slate-100">
                                            <p className="text-xs font-semibold text-slate-400 uppercase mb-1">Location</p>
                                            <p className="text-base font-bold text-slate-800 truncate">{predictionResult.location}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => { setStep(1); setPredictionResult(null); }}
                                        className="w-full py-3 border border-slate-200 text-sm font-semibold text-slate-500 rounded-xl hover:bg-slate-50 transition-all">
                                        New Analysis
                                    </button>
                                </>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                                    <div className="w-10 h-10 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4" />
                                    <p className="text-sm font-medium">Processing analysis...</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Map */}
                <div className="xl:col-span-2 glass-card p-0 overflow-hidden min-h-[480px] flex flex-col">
                    <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                        <h3 className="text-base font-semibold text-slate-800">🗺️ Regional Risk Heatmap</h3>
                        <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-3 py-1.5 rounded-lg">{predictions.length} Zones</span>
                    </div>
                    <div className="flex-1">
                        <MapView predictions={predictions} mini={true} />
                    </div>
                </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="xl:col-span-2">
                    <PredictionChart predictions={predictions} />
                </div>
                <div className="min-h-[380px]">
                    <AlertPanel alerts={alerts} />
                </div>
            </div>

            {/* Recent Reports */}
            <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-5">
                    <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2">
                        <FileText size={18} className="text-blue-500" />
                        Recent Analysis Reports
                    </h3>
                    <button className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1">
                        View All <ChevronRight size={16} />
                    </button>
                </div>
                <div className="divide-y divide-slate-100">
                    {predictions.slice(0, 4).map((p, i) => (
                        <div key={i} className="flex items-center justify-between py-4">
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold ${riskColor(p.risk_level)}`}>
                                    {p.risk_level === 'high' ? '!' : p.risk_level === 'medium' ? '~' : '✓'}
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-800">{p.location || `Zone ${i + 1}`}</p>
                                    <p className="text-xs text-slate-400">Rainfall: {p.rainfall}mm · Confidence: {Math.round((p.confidence || 0.9) * 100)}%</p>
                                </div>
                            </div>
                            <span className={`text-xs font-bold uppercase px-3 py-1.5 rounded-full border ${riskColor(p.risk_level)}`}>{p.risk_level}</span>
                        </div>
                    ))}
                    {predictions.length === 0 && (
                        <div className="py-10 text-center text-slate-400 text-sm">
                            <Info size={28} className="mx-auto mb-3 opacity-30" />
                            No reports available yet.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const SliderInput = ({ label, icon, unit, value, min, max, step = 1, onChange }) => {
    const Icon = icon;
    return (
        <div className="space-y-2.5">
            <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                    <Icon size={14} /> {label}
                </label>
                <span className="text-sm font-bold text-slate-800 bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">
                    {typeof value === 'number' ? Math.round(value * 10) / 10 : value}{unit}
                </span>
            </div>
            <input type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(parseFloat(e.target.value))} className="w-full" />
        </div>
    );
};

export default Dashboard;
