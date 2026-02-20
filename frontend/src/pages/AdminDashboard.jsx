import { useState, useEffect, useCallback } from 'react';
import {
    ShieldAlert, Zap, RotateCcw, Monitor, Globe, Cpu, Database,
    Crosshair, AlertCircle, ShieldCheck, ChevronRight, ExternalLink,
    Filter, Layers, Maximize2
} from 'lucide-react';
import MapView from '../components/MapView';
import { getPredictions, getAlerts, getStats, resolveAlert } from '../services/api';

const AdminDashboard = () => {
    const [predictions, setPredictions] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [stats, setStats] = useState({ total: 0, highRisk: 0, activeAlerts: 0, avgConfidence: 0 });
    const [isLoading, setIsLoading] = useState(true);

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
        } catch (err) { console.error(err); }
        finally { setIsLoading(false); }
    }, []);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 60000);
        return () => clearInterval(interval);
    }, [fetchData]);

    const handleResolve = async (id) => {
        try { await resolveAlert(id); fetchData(); }
        catch (err) { console.error('Failed to resolve alert:', err); }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-lg">
                        <Crosshair size={28} className="text-blue-400" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900">Command Center</h2>
                        <div className="flex items-center gap-3 mt-1">
                            <span className="flex items-center gap-2 text-xs font-semibold text-green-600">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-status" /> Live Ops Active
                            </span>
                            <span className="w-1 h-1 bg-slate-300 rounded-full" />
                            <span className="text-xs font-medium text-slate-400">Sub-Saharan Sector A</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={fetchData} className="p-2.5 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-blue-600 transition-all">
                        <RotateCcw size={18} className={isLoading ? 'animate-spin' : ''} />
                    </button>
                    <button className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-all">
                        <Monitor size={16} /> System Console
                    </button>
                </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                <AdminMetric label="Active Nodes" value={stats.total.toLocaleString()} icon={Cpu} color="blue" footer="Live Sensor Data" />
                <AdminMetric label="Anomalies" value={stats.activeAlerts} icon={AlertCircle} color="amber" footer="Resource Conflict" />
                <AdminMetric label="Critical Alerts" value={stats.highRisk} icon={ShieldAlert} color="red" footer="Escalated Status" />
                <AdminMetric label="Model Precision" value={`${Math.round(stats.avgConfidence * 100)}%`} icon={ShieldCheck} color="teal" footer="Logical Integrity" />
            </div>

            {/* Map + Alerts */}
            <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
                {/* Map */}
                <div className="xl:col-span-3 glass-card p-0 overflow-hidden min-h-[540px] flex flex-col relative">
                    <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2.5">
                                <Globe size={18} className="text-blue-600" />
                                <h3 className="text-base font-semibold text-slate-800">Geo-Spatial Feed</h3>
                            </div>
                            <div className="h-5 w-px bg-slate-200" />
                            <button className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-blue-600">
                                <Filter size={14} /> Filters
                            </button>
                            <button className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-blue-600">
                                <Layers size={14} /> Overlays
                            </button>
                        </div>
                        <button className="w-9 h-9 flex items-center justify-center bg-slate-50 text-slate-400 rounded-lg hover:bg-blue-600 hover:text-white transition-all">
                            <Maximize2 size={16} />
                        </button>
                    </div>
                    <div className="flex-1 relative bg-slate-50 p-2">
                        <div className="w-full h-full rounded-xl overflow-hidden border border-slate-200">
                            <MapView predictions={predictions} mini={true} />
                        </div>
                        <div className="absolute bottom-6 left-6 z-[40] bg-white/95 backdrop-blur p-4 rounded-xl border border-slate-200 shadow-lg flex items-center gap-6">
                            <div className="flex items-center gap-2 text-xs font-medium text-slate-600"><div className="w-3 h-3 rounded-full bg-red-500" /> High Risk</div>
                            <div className="flex items-center gap-2 text-xs font-medium text-slate-600"><div className="w-3 h-3 rounded-full bg-amber-500" /> Potential</div>
                            <div className="flex items-center gap-2 text-xs font-medium text-slate-600"><div className="w-3 h-3 rounded-full bg-blue-500" /> Nominal</div>
                        </div>
                    </div>
                </div>

                {/* Alert Sidebar */}
                <div className="xl:col-span-2 glass-card flex flex-col overflow-hidden">
                    <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <Zap size={18} className="text-blue-600" />
                            <h3 className="text-base font-semibold text-slate-800">Rapid Response</h3>
                        </div>
                        <span className="text-xs font-bold bg-red-50 text-red-600 px-3 py-1.5 rounded-full border border-red-100">{alerts.length} Pending</span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-none max-h-[440px]">
                        {alerts.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
                                <Database size={44} className="text-slate-200" />
                                <p className="text-sm font-medium text-slate-400">All Sectors Clear</p>
                            </div>
                        ) : (
                            alerts.map((alert, index) => (
                                <AdminAlertItem key={alert.id || index} id={alert.id}
                                    severity={alert.severity?.toLowerCase() || 'info'}
                                    title={alert.message}
                                    description={alert.location || 'Primary Pipeline'}
                                    time={alert.timestamp || '0:00:00'}
                                    onResolve={handleResolve} />
                            ))
                        )}
                    </div>
                    <div className="px-6 py-5 border-t border-slate-100">
                        <button className="w-full py-3 border border-slate-200 rounded-xl text-xs font-semibold text-slate-500 hover:text-blue-600 hover:border-blue-200 transition-all flex items-center justify-center gap-2">
                            Tactical Archive <ExternalLink size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const AdminMetric = ({ label, value, icon, color, footer }) => {
    const Icon = icon;
    const colorMap = {
        blue: { accent: 'bg-blue-50 text-blue-600 border-blue-100', bar: 'border-l-blue-600' },
        amber: { accent: 'bg-amber-50 text-amber-600 border-amber-100', bar: 'border-l-amber-500' },
        red: { accent: 'bg-red-50 text-red-600 border-red-100', bar: 'border-l-red-500' },
        teal: { accent: 'bg-teal-50 text-teal-600 border-teal-100', bar: 'border-l-teal-600' },
    };

    return (
        <div className={`glass-card p-6 border-l-4 ${colorMap[color].bar} group hover:-translate-y-1 transition-all duration-300`}>
            <div className="flex justify-between items-start mb-5">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
                <div className={`p-3 rounded-xl border ${colorMap[color].accent} group-hover:scale-110 transition-transform`}>
                    <Icon size={20} />
                </div>
            </div>
            <p className="text-4xl font-bold text-slate-900 tracking-tight mb-2">{value}</p>
            <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full animate-status ${color === 'red' ? 'bg-red-500' : color === 'amber' ? 'bg-amber-500' : 'bg-blue-500'}`} />
                <span className="text-xs font-medium text-slate-400">{footer}</span>
            </div>
        </div>
    );
};

const AdminAlertItem = ({ id, severity, title, description, time, onResolve }) => {
    const styles = {
        critical: { border: 'border-l-red-500', badge: 'bg-red-50 text-red-600 border-red-100' },
        warning: { border: 'border-l-amber-500', badge: 'bg-amber-50 text-amber-600 border-amber-100' },
        info: { border: 'border-l-blue-500', badge: 'bg-blue-50 text-blue-600 border-blue-100' },
    };
    const s = styles[severity] || styles.info;

    return (
        <div className={`p-5 rounded-xl border border-slate-100 border-l-4 ${s.border} bg-white hover:shadow-sm transition-all`}>
            <div className="flex justify-between items-start mb-3">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${s.badge}`}>
                    {severity === 'critical' ? 'CRITICAL' : severity === 'warning' ? 'WARNING' : 'INFO'}
                </span>
                <span className="text-xs font-medium text-slate-400">{time}</span>
            </div>
            <h5 className="font-semibold text-sm text-slate-800 mb-1">{title}</h5>
            <p className="text-xs text-slate-500 mb-4">{description}</p>
            <div className="flex items-center gap-3">
                <button onClick={() => onResolve && onResolve(id)}
                    className="flex-1 bg-slate-900 text-white text-xs font-semibold py-2.5 rounded-lg hover:bg-blue-600 transition-all">
                    Resolve Alert
                </button>
                <button className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-400 rounded-lg hover:bg-slate-100 transition-all">
                    <ChevronRight size={18} />
                </button>
            </div>
        </div>
    );
};

export default AdminDashboard;
