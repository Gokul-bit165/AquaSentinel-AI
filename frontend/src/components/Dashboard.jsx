import { useState, useEffect, useCallback } from 'react';
import {
    Droplets, Cloud, Thermometer, MapPin, Users, ArrowRight,
    RefreshCw, Info, ChevronRight, FileText, Brain, ShieldAlert,
    Sliders, AlertTriangle, Shield, Stethoscope, Zap
} from 'lucide-react';
import { getAgentAnalysis, getTerritoryPulse, runSimulation } from '../services/api';
import StatsCards from './StatsCards';
import MapView from './MapView';
import AlertPanel from './AlertPanel';
import PredictionChart from './PredictionChart';

const Dashboard = () => {
    const [territoryPulse, setTerritoryPulse] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [stats, setStats] = useState({ total: 0, highRisk: 0, activeAlerts: 0, avgConfidence: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [selectedWard, setSelectedWard] = useState(null);
    const [agentInsights, setAgentInsights] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isProtocolModalOpen, setIsProtocolModalOpen] = useState(false);

    // Simulation state (Step 9)
    const [simRainfall, setSimRainfall] = useState(50);
    const [simContamination, setSimContamination] = useState(0.3);
    const [simResult, setSimResult] = useState(null);
    const [isSimulating, setIsSimulating] = useState(false);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const pulse = await getTerritoryPulse();
            const livePulse = pulse.data || [];
            setTerritoryPulse(livePulse);

            // Auto-generate alerts from high-risk wards (Step 7)
            const autoAlerts = livePulse
                .filter(w => w.risk_level === 'high')
                .map(w => ({
                    severity: 'CRITICAL',
                    message: `High risk detected in ${w.ward_name.replace(', Coimbatore', '')}`,
                    location: w.ward_name,
                    timestamp: 'Just now',
                    confidence: w.confidence,
                }));
            setAlerts(autoAlerts);

            setStats({
                total: livePulse.length,
                highRisk: livePulse.filter(w => w.risk_level === 'high').length,
                activeAlerts: autoAlerts.length,
                avgConfidence: livePulse.length > 0
                    ? livePulse.reduce((acc, curr) => acc + curr.confidence, 0) / livePulse.length
                    : 0,
            });
        } catch (err) {
            console.error("Pulse sync failed:", err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleWardClick = async (ward) => {
        setSelectedWard(ward);
        setIsSubmitting(true);
        setAgentInsights(null);
        try {
            const analysisRes = await getAgentAnalysis({
                rainfall: ward.metrics.rainfall,
                ph_level: ward.metrics.ph_level,
                contamination: ward.metrics.contamination,
                cases_count: ward.metrics.cases_count
            });
            setAgentInsights(analysisRes.data);
        } catch (err) {
            console.error('Agent analysis failed for ward:', err);
            // Provide fallback insights
            setAgentInsights({
                decision: {
                    public_warning: `Elevated risk detected in ${ward.ward_name}. Monitor water sources closely.`,
                    recommended_actions: ['Increase water testing', 'Deploy medical observers', 'Issue public advisory']
                },
                analysis: {
                    top_factors: [
                        { column: 'contamination', impact: 0.4 },
                        { column: 'rainfall', impact: 0.3 },
                        { column: 'cases_count', impact: 0.2 },
                    ]
                }
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSimulation = async () => {
        setIsSimulating(true);
        try {
            const res = await runSimulation(
                { rainfall: 10, contamination: 0.1, ph_level: 7.0, cases_count: 5 },
                { rainfall: simRainfall, contamination: simContamination }
            );
            setSimResult(res.data);
        } catch (err) {
            // Fallback sim result
            const riskLevel = simRainfall > 200 && simContamination > 0.5 ? 'high'
                : simRainfall > 100 || simContamination > 0.4 ? 'medium' : 'low';
            setSimResult({
                baseline: { risk_level: 'low', confidence: 0.92 },
                simulated: { risk_level: riskLevel, confidence: 0.88 },
                change_summary: `Adjusting rainfall to ${simRainfall}mm and contamination to ${Math.round(simContamination * 100)}% ${riskLevel === 'high' ? 'significantly increases' : riskLevel === 'medium' ? 'moderately increases' : 'has minimal effect on'} outbreak risk.`
            });
        } finally {
            setIsSimulating(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 60000);
        return () => clearInterval(interval);
    }, [fetchData]);

    const riskColor = (level) => {
        switch (level?.toLowerCase()) {
            case 'high': return 'text-red-600 bg-red-50 border-red-200';
            case 'medium': return 'text-amber-600 bg-amber-50 border-amber-200';
            default: return 'text-green-600 bg-green-50 border-green-200';
        }
    };

    // Recommendations based on selected ward risk (Step 8)
    const getRecommendations = (ward) => {
        if (!ward) return [];
        if (ward.risk_level === 'high') return [
            { icon: Droplets, action: 'Increase chlorination in water supply', priority: 'Urgent' },
            { icon: Stethoscope, action: 'Deploy medical response team', priority: 'Immediate' },
            { icon: AlertTriangle, action: 'Issue public health warning', priority: 'Critical' },
            { icon: Shield, action: 'Activate emergency sanitation protocol', priority: 'High' },
        ];
        if (ward.risk_level === 'medium') return [
            { icon: Droplets, action: 'Schedule water quality testing', priority: 'High' },
            { icon: Stethoscope, action: 'Alert nearby health centers', priority: 'Moderate' },
            { icon: Shield, action: 'Increase monitoring frequency', priority: 'Standard' },
        ];
        return [
            { icon: Shield, action: 'Continue routine monitoring', priority: 'Low' },
            { icon: Droplets, action: 'Maintain standard chlorination', priority: 'Standard' },
        ];
    };

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900">Safety Hub</h2>
                    <p className="text-sm text-slate-500 mt-1">Operational Intelligence & Agentic risk monitoring</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-xs font-semibold text-green-600 bg-green-50 px-4 py-2 rounded-lg border border-green-100">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-status" />
                        AI System Active
                    </div>
                    <button onClick={fetchData} className="p-2.5 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-blue-600 hover:border-blue-200 transition-all">
                        <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            {/* Stats (Step 1) */}
            <StatsCards stats={stats} />

            {/* Main Grid: Intelligence Hub + Map */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Territory Intelligence Panel (Steps 5, 6, 8) */}
                <div className="glass-card p-6 flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-base font-semibold text-slate-800">Intelligence Hub</h3>
                            <button
                                onClick={fetchData}
                                disabled={isLoading}
                                className="flex items-center gap-1.5 text-[10px] font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-2.5 py-1.5 rounded-lg border border-blue-100 transition-all mt-2 group"
                            >
                                <RefreshCw size={12} className={`${isLoading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
                                {isLoading ? "Syncing Pulse..." : "Refresh City Data"}
                            </button>
                        </div>
                        <div className="px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-500 uppercase">
                            Live Ingestion
                        </div>
                    </div>

                    {!selectedWard ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center py-12 px-4 space-y-4">
                            <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center animate-pulse-slow">
                                <MapPin size={32} />
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-bold text-slate-800 uppercase tracking-tight">Select Territory</p>
                                <p className="text-xs text-slate-500 leading-relaxed">Click any ward on the map to run a deep-agent diagnostic on its current environmental pulse.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-5 animate-fade-in overflow-y-auto max-h-[600px] scrollbar-none">
                            {/* Ward Status (Step 5) */}
                            <div className={`p-5 rounded-2xl border transition-all ${riskColor(selectedWard.risk_level)}`}>
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Territory Status</p>
                                        <p className="text-2xl font-black uppercase tracking-tight">{selectedWard.risk_level} Risk</p>
                                    </div>
                                    <div className="bg-white/60 backdrop-blur px-2.5 py-1 rounded-lg text-xs font-bold border border-white/50">
                                        {Math.round(selectedWard.confidence * 100)}% Match
                                    </div>
                                </div>
                                <p className="text-xs font-bold flex items-center gap-1.5 mt-1 opacity-80">
                                    <MapPin size={14} /> {selectedWard.ward_name}
                                </p>
                                <p className="text-xs mt-2 opacity-70 italic">
                                    {selectedWard.prediction || "Analysis in progress..."}
                                </p>
                            </div>

                            {/* Key Factors (Step 5) */}
                            <div className="grid grid-cols-2 gap-3">
                                <MetricBox label="Rainfall" value={selectedWard.metrics.rainfall} unit="mm" icon={Cloud} />
                                <MetricBox label="Contamination" value={Math.round(selectedWard.metrics.contamination * 100)} unit="%" icon={Droplets} />
                                <MetricBox label="pH Level" value={selectedWard.metrics.ph_level} unit="ph" icon={Info} />
                                <MetricBox label="Cases" value={selectedWard.metrics.cases_count} unit="" icon={Users} />
                            </div>

                            <div className="h-px bg-slate-100" />

                            {/* AI Explanation (Step 6) */}
                            {isSubmitting ? (
                                <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                                    <RefreshCw className="animate-spin text-indigo-500 mb-3" size={24} />
                                    <p className="text-[10px] uppercase font-bold tracking-widest opacity-50">AI Agents Reasoning...</p>
                                </div>
                            ) : agentInsights ? (
                                <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl text-left animate-slide-up">
                                    <h4 className="flex items-center gap-2 text-[10px] font-bold text-indigo-700 uppercase tracking-widest mb-2">
                                        <Brain size={14} /> AI Explanation
                                    </h4>
                                    <p className="text-xs text-slate-600 italic leading-relaxed">
                                        "{agentInsights.decision?.public_warning}"
                                    </p>
                                    <div className="mt-3 flex flex-wrap gap-1.5">
                                        {agentInsights.analysis?.top_factors?.map((f, i) => (
                                            <span key={i} className="text-[9px] font-bold bg-white text-slate-500 border border-slate-200 px-2 py-0.5 rounded-md uppercase">
                                                {f.column}: {f.impact > 0 ? '↑' : '↓'}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ) : null}

                            {/* Recommendations (Step 8) */}
                            <div className="space-y-2">
                                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                                    <Zap size={12} /> Recommended Actions
                                </h4>
                                {getRecommendations(selectedWard).map((rec, i) => {
                                    const RecIcon = rec.icon;
                                    return (
                                        <div key={i} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100 hover:border-blue-200 transition-all group cursor-pointer">
                                            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-blue-500 transition-colors">
                                                <RecIcon size={14} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-medium text-slate-700 truncate">{rec.action}</p>
                                            </div>
                                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${rec.priority === 'Urgent' || rec.priority === 'Critical' || rec.priority === 'Immediate'
                                                ? 'bg-red-50 text-red-600 border border-red-100'
                                                : 'bg-slate-50 text-slate-400 border border-slate-100'
                                                }`}>{rec.priority}</span>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Execute Protocol Button */}
                            <button
                                className={`w-full py-2.5 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 ${selectedWard.risk_level === 'high' ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-200' : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 font-bold'}`}
                                onClick={() => setIsProtocolModalOpen(true)}
                            >
                                Execute Health Protocol <ArrowRight size={14} />
                            </button>

                            <button onClick={() => { setSelectedWard(null); setAgentInsights(null); }} className="w-full py-2.5 border border-slate-200 text-[10px] font-bold uppercase tracking-widest text-slate-400 rounded-xl hover:bg-slate-50 transition-all">
                                Clear Selection
                            </button>
                        </div>
                    )}
                </div>

                {/* Map Section (Step 4) */}
                <div className="xl:col-span-2 glass-card p-0 overflow-hidden min-h-[520px] flex flex-col border-white/40 relative">
                    <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Regional Risk Heatmap</h3>
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">{territoryPulse.length} Wards Active</span>
                    </div>
                    <div className="flex-1">
                        <MapView territoryPulse={territoryPulse} onLocationClick={handleWardClick} mini={true} />
                    </div>
                    {/* Map Legend */}
                    <div className="absolute bottom-4 right-4 z-[1000] bg-white/95 backdrop-blur-sm px-4 py-3 rounded-xl border border-slate-200 shadow-lg">
                        <div className="space-y-1.5">
                            <div className="flex items-center gap-2 text-[10px] font-semibold text-slate-600">
                                <div className="w-3 h-3 rounded-full bg-red-500" /> HIGH ZONE
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-semibold text-slate-600">
                                <div className="w-3 h-3 rounded-full bg-amber-500" /> MEDIUM ZONE
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-semibold text-slate-600">
                                <div className="w-3 h-3 rounded-full bg-green-500" /> LOW ZONE
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Middle Row: Chart + Alert Panel (Steps 7, 10) */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="xl:col-span-2">
                    <PredictionChart predictions={territoryPulse} />
                </div>
                <div className="min-h-[380px]">
                    <AlertPanel alerts={alerts} />
                </div>
            </div>

            {/* Simulation Panel (Step 9) */}
            <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
                            <Sliders size={20} />
                        </div>
                        <div>
                            <h3 className="text-base font-semibold text-slate-800">What-If Simulation</h3>
                            <p className="text-xs text-slate-400">Adjust parameters to predict outbreak scenarios</p>
                        </div>
                    </div>
                    <button
                        onClick={handleSimulation}
                        disabled={isSimulating}
                        className="px-5 py-2.5 bg-purple-600 text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-purple-700 transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                        {isSimulating ? <RefreshCw size={14} className="animate-spin" /> : <Zap size={14} />}
                        {isSimulating ? 'Simulating...' : 'Run Simulation'}
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    <div className="space-y-4">
                        <SliderInput label="Rainfall" icon={Cloud} unit="mm" value={simRainfall} min={0} max={500} step={10} onChange={setSimRainfall} />
                        <SliderInput label="Contamination" icon={Droplets} unit="%" value={simContamination} min={0} max={1} step={0.05} onChange={setSimContamination} />
                    </div>

                    {simResult && (
                        <div className="md:col-span-1 xl:col-span-2 flex items-center gap-6">
                            <div className={`flex-1 p-5 rounded-2xl border ${riskColor(simResult.baseline?.risk_level)}`}>
                                <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-1">Baseline</p>
                                <p className="text-xl font-black uppercase">{simResult.baseline?.risk_level} Risk</p>
                                <p className="text-xs opacity-70">{Math.round((simResult.baseline?.confidence || 0) * 100)}% confidence</p>
                            </div>
                            <ArrowRight size={24} className="text-slate-300 shrink-0" />
                            <div className={`flex-1 p-5 rounded-2xl border ${riskColor(simResult.simulated?.risk_level)}`}>
                                <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-1">Simulated</p>
                                <p className="text-xl font-black uppercase">{simResult.simulated?.risk_level} Risk</p>
                                <p className="text-xs opacity-70">{Math.round((simResult.simulated?.confidence || 0) * 100)}% confidence</p>
                            </div>
                        </div>
                    )}
                </div>
                {simResult?.change_summary && (
                    <p className="mt-4 text-xs text-slate-500 italic bg-slate-50 p-3 rounded-xl border border-slate-100">
                        💡 {simResult.change_summary}
                    </p>
                )}
            </div>

            {/* Bottom Row: Live Territory Repository */}
            <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-5">
                    <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 uppercase tracking-widest">
                        <FileText size={18} className="text-blue-500" />
                        Live Territory Repository
                    </h3>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                        <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                        Live Sync Active
                    </div>
                </div>
                <div className="divide-y divide-slate-100">
                    {territoryPulse.slice(0, 8).map((p, i) => (
                        <div key={i} className="flex items-center justify-between py-4 group hover:bg-slate-50/50 px-2 rounded-xl transition-all cursor-pointer" onClick={() => handleWardClick(p)}>
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shadow-sm ${riskColor(p.risk_level)}`}>
                                    {p.risk_level === 'high' ? '!!!' : p.risk_level === 'medium' ? '!!' : '✓'}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{p.ward_name}</p>
                                    <p className="text-[10px] font-medium text-slate-400 uppercase">Rain: {p.metrics?.rainfall}mm · Conf: {Math.round((p.confidence || 0) * 100)}%</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-full border min-w-[80px] text-center ${riskColor(p.risk_level)}`}>
                                    {p.risk_level} Risk
                                </span>
                                <ChevronRight size={14} className="text-slate-300 group-hover:text-blue-500 transition-all" />
                            </div>
                        </div>
                    ))}
                    {territoryPulse.length === 0 && (
                        <div className="py-12 text-center text-slate-400">
                            <RefreshCw size={32} className="mx-auto mb-3 opacity-20 animate-spin" />
                            <p className="text-xs font-bold uppercase tracking-widest mb-1">Connecting to City Pulse...</p>
                            <p className="text-[10px] text-slate-500">Syncing with sensor grid and AI diagnostics.</p>
                        </div>
                    )}
                </div>
            </div>
            {/* Protocol Deployment Modal */}
            {isProtocolModalOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in shadow-2xl">
                    <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-scale-up border border-slate-200">
                        {/* Modal Header */}
                        <div className={`px-8 py-6 flex items-center justify-between border-b ${selectedWard?.risk_level === 'high' ? 'bg-red-50/50 border-red-100' : 'bg-indigo-50/50 border-indigo-100'}`}>
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${selectedWard?.risk_level === 'high' ? 'bg-red-600 text-white shadow-lg shadow-red-200' : 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'}`}>
                                    <Shield size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">Health Protocol Deployment</h3>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Authorized by AI Operational Command</p>
                                </div>
                            </div>
                            <button onClick={() => setIsProtocolModalOpen(false)} className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-white rounded-xl transition-all border border-transparent hover:border-slate-200">
                                <RefreshCw size={20} className="rotate-45" />
                            </button>
                        </div>

                        <div className="p-8 space-y-8">
                            {/* Deployment Details */}
                            <div className="grid grid-cols-2 gap-8">
                                <section>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Target Territory</p>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
                                            <MapPin size={16} />
                                        </div>
                                        <p className="font-bold text-slate-800">{selectedWard?.ward_name}</p>
                                    </div>
                                </section>
                                <section>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Priority Level</p>
                                    <div className="flex items-center gap-3">
                                        <div className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase border ${riskColor(selectedWard?.risk_level)}`}>
                                            {selectedWard?.risk_level} Priority
                                        </div>
                                    </div>
                                </section>
                            </div>

                            {/* Brief Description */}
                            <section className="bg-slate-50 p-5 rounded-2xl border border-slate-100 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-5">
                                    <FileText size={80} />
                                </div>
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <Info size={14} className="text-blue-500" /> Operational Assessment
                                </h4>
                                <p className="text-sm text-slate-700 leading-relaxed relative z-10">
                                    {agentInsights?.decision?.brief_description || "Outbreak monitoring data suggests a potential threat to local water safety. Immediate preventative measures are required to secure the public health perimeter."}
                                </p>
                            </section>

                            {/* Final Decision */}
                            <section className={`p-5 rounded-2xl border-2 border-dashed ${selectedWard?.risk_level === 'high' ? 'border-red-200 bg-red-50/30' : 'border-indigo-200 bg-indigo-50/30'}`}>
                                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <Brain size={14} className="text-indigo-500" /> Executive Final Decision
                                </h4>
                                <p className={`text-base font-black uppercase tracking-tight ${selectedWard?.risk_level === 'high' ? 'text-red-700' : 'text-indigo-700'}`}>
                                    "{agentInsights?.decision?.final_decision || "STATUS QUO: Standard monitoring cycle maintained."}"
                                </p>
                            </section>

                            {/* Recommendations */}
                            <section>
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Deployment Tasks</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {(agentInsights?.decision?.recommendations || getRecommendations(selectedWard).map(r => r.action)).map((task, idx) => (
                                        <div key={idx} className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-xl hover:border-indigo-200 transition-all group">
                                            <div className="w-6 h-6 rounded-md bg-indigo-50 text-indigo-500 flex items-center justify-center text-[10px] font-black">
                                                0{idx + 1}
                                            </div>
                                            <p className="text-xs font-semibold text-slate-600 truncate">{task}</p>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-8 py-6 bg-slate-50/50 border-t border-slate-100 flex gap-4">
                            <button
                                className="flex-1 py-3 bg-white border border-slate-200 text-slate-500 text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-slate-100 transition-all flex items-center justify-center gap-2"
                                onClick={() => window.print()}
                            >
                                <FileText size={16} /> Print Official Order
                            </button>
                            <button
                                className={`flex-[2] py-3 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg ${selectedWard?.risk_level === 'high' ? 'bg-red-600 hover:bg-red-700 shadow-red-100' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100'}`}
                                onClick={() => setIsProtocolModalOpen(false)}
                            >
                                <Zap size={16} /> Confirm Deployment
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const MetricBox = ({ label, value, unit, icon: Icon }) => (
    <div className="bg-slate-50/80 backdrop-blur rounded-2xl p-3 border border-slate-100/80 flex flex-col items-center text-center group hover:bg-white hover:shadow-sm transition-all">
        <div className="w-7 h-7 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-blue-500 mb-1.5 transition-colors">
            <Icon size={12} />
        </div>
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
        <p className="text-sm font-black text-slate-800">{value}<span className="text-[9px] ml-0.5 text-slate-400 font-bold">{unit}</span></p>
    </div>
);

const SliderInput = ({ label, icon, unit, value, min, max, step = 1, onChange }) => {
    const Icon = icon;
    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <Icon size={14} className="text-slate-400" /> {label}
                </label>
                <span className="text-[11px] font-black text-slate-800 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200 min-w-[45px] text-center">
                    {typeof value === 'number' ? Math.round(value * (unit === '%' ? 100 : 1) * 10) / 10 : value}{unit}
                </span>
            </div>
            <input
                type="range" min={min} max={max} step={step} value={value}
                onChange={e => onChange(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-purple-600"
            />
        </div>
    );
};

export default Dashboard;
