import { useState, useEffect } from 'react';
import {
    ShieldAlert,
    Activity,
    Zap,
    ArrowUpRight,
    Search,
    Bell,
    Filter,
    Layers,
    Maximize2,
    CheckCircle2,
    AlertCircle,
    Clock,
    ExternalLink,
    ChevronRight,
    ShieldCheck,
    RotateCcw,
    Monitor
} from 'lucide-react';
import MapView from '../components/MapView';
import { getPredictions, getAlerts } from '../services/api';

const AdminDashboard = () => {
    const [predictions, setPredictions] = useState([]);
    const [alerts, setAlerts] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [p, a] = await Promise.all([getPredictions(), getAlerts()]);
                setPredictions(p.data);
                setAlerts(a.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchData();
    }, []);

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                    label="Total Predictions"
                    value="1.2M+"
                    trend="+12.4%"
                    trendType="up"
                    footer="vs last month"
                    icon={Activity}
                    color="blue"
                />
                <MetricCard
                    label="Anomalies Detected"
                    value="42"
                    trend="+5.2%"
                    trendType="up"
                    footer="Today"
                    icon={AlertCircle}
                    color="amber"
                />
                <MetricCard
                    label="High-Risk Zones"
                    value="12"
                    trend="-2 active"
                    trendType="down"
                    footer="since 08:00"
                    icon={ShieldAlert}
                    color="red"
                />
                <MetricCard
                    label="Avg Confidence"
                    value="98.4%"
                    trend="Stable"
                    trendType="neutral"
                    footer="9 sensors reporting"
                    icon={ShieldCheck}
                    color="teal"
                />
            </div>

            {/* Main Panel */}
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">

                {/* Map View Section */}
                <div className="xl:col-span-3 glass-card p-0 overflow-hidden min-h-[600px] flex flex-col relative">
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/30 z-10 sticky top-0">
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-red-500 rounded-full animate-status" />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-primary)]">Live Monitoring</span>
                            </div>
                            <div className="h-4 w-[1px] bg-slate-200" />
                            <div className="flex items-center gap-4">
                                <button className="flex items-center gap-2 text-[10px] font-bold text-[var(--text-secondary)] hover:text-blue-600 transition-colors uppercase tracking-widest">
                                    <Filter size={14} /> Filters
                                </button>
                                <button className="flex items-center gap-2 text-[10px] font-bold text-[var(--text-secondary)] hover:text-blue-600 transition-colors uppercase tracking-widest">
                                    <Layers size={14} /> Layers
                                </button>
                            </div>
                        </div>
                        <button className="p-2 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-slate-200">
                            <Maximize2 size={16} className="text-[var(--text-secondary)]" />
                        </button>
                    </div>

                    <div className="flex-1 relative bg-slate-100">
                        <MapView predictions={predictions} mini={true} />

                        {/* Map Legend (Overlay Type) */}
                        <div className="absolute bottom-6 left-6 z-[40] bg-white/95 backdrop-blur-md p-5 rounded-2xl border border-slate-200 shadow-2xl flex items-center gap-8">
                            <div className="flex items-center gap-2.5 text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">
                                <div className="w-2.5 h-2.5 rounded-full bg-red-600 shadow-[0_0_8px_rgba(220,38,38,0.4)]" /> High Risk ({'>'}85%)
                            </div>
                            <div className="flex items-center gap-2.5 text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">
                                <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]" /> Caution (40-85%)
                            </div>
                            <div className="flex items-center gap-2.5 text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">
                                <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(37,99,235,0.4)]" /> Normal ({'<'}40%)
                            </div>
                        </div>

                        <div className="absolute bottom-6 right-6 z-[40] text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 opacity-60">
                            Source: Sentinel-2 Satellite & IoT Ground Sensors
                        </div>
                    </div>
                </div>

                {/* Alert Center Sidebar */}
                <div className="xl:col-span-1 space-y-6 flex flex-col">
                    <div className="glass-card flex-1 flex flex-col overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-[11px] font-bold text-[var(--text-primary)] uppercase tracking-widest">
                                <Zap size={16} className="text-blue-600" />
                                Alert Center
                            </div>
                            <span className="text-[10px] font-bold bg-red-50 text-red-600 px-2 py-0.5 rounded-full border border-red-100">
                                3 Critical
                            </span>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-none">
                            {alerts.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-xs text-slate-400">No active alerts</p>
                                </div>
                            ) : (
                                alerts.map((alert, index) => (
                                    <AdminAlertItem
                                        key={index}
                                        severity={alert.severity?.toLowerCase() || 'info'}
                                        title={alert.message}
                                        description={alert.location || 'Coimbatore Region'}
                                        time={alert.timestamp || 'Just now'}
                                    />
                                ))
                            )}
                        </div>

                        <button className="w-full p-4 border-t border-slate-100 text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)] hover:text-blue-600 transition-colors flex items-center justify-center gap-2 group">
                            View Full Archive <ExternalLink size={14} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const MetricCard = ({ label, value, trend, trendType, footer, icon, color }) => {
    const Icon = icon;
    const colorMap = {
        blue: 'border-l-blue-500 text-blue-600 bg-blue-50/50',
        amber: 'border-l-amber-500 text-amber-600 bg-amber-50/50',
        red: 'border-l-red-500 text-red-600 bg-red-50/50',
        teal: 'border-l-teal-500 text-teal-600 bg-teal-50/50',
    };

    return (
        <div className={`glass-card p-6 border-l-4 ${colorMap[color]} group`}>
            <div className="flex justify-between items-start mb-4">
                <p className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest font-outfit">{label}</p>
                <Icon className="text-[var(--text-secondary)] group-hover:scale-110 transition-transform" size={20} />
            </div>
            <div className="flex items-baseline gap-2 mb-2">
                <span className="text-3xl font-bold text-[var(--text-primary)]">{value}</span>
            </div>
            <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold ${trendType === 'up' ? 'text-green-600' : trendType === 'down' ? 'text-red-600' : 'text-slate-500'
                    }`}>
                    {trendType === 'up' ? '↗' : trendType === 'down' ? '↘' : '•'} {trend}
                </span>
                <span className="text-[10px] font-medium text-slate-400">{footer}</span>
            </div>
        </div>
    );
};

const AdminAlertItem = ({ severity, title, description, time, actionLabel, resolver }) => {
    const styles = {
        critical: 'border-red-500 bg-red-50/10 shadow-[0_0_15px_rgba(239,68,68,0.05)]',
        warning: 'border-amber-500 bg-amber-50/10 shadow-[0_0_15px_rgba(245,158,11,0.05)]',
        resolved: 'border-slate-200 bg-slate-50/50',
        info: 'border-blue-500 bg-blue-50/10',
    };

    return (
        <div className={`p-5 rounded-2xl border-2 ${styles[severity]} relative group transition-all hover:bg-white`}>
            {severity === 'critical' && (
                <div className="absolute -left-[2px] -top-[2px] -bottom-[2px] w-1.5 bg-red-600 rounded-l-2xl" />
            )}
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2.5">
                    {severity === 'critical' && <div className="p-1 bg-red-600 rounded-md text-white"><ShieldAlert size={12} /></div>}
                    {severity === 'warning' && <div className="p-1 bg-amber-500 rounded-md text-white"><AlertCircle size={12} /></div>}
                    {severity === 'resolved' && <div className="p-1 bg-slate-400 rounded-md text-white"><CheckCircle2 size={12} /></div>}
                    {severity === 'info' && <div className="p-1 bg-blue-600 rounded-md text-white"><Monitor size={12} /></div>}
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{time}</span>
                </div>
            </div>
            <h5 className="font-bold text-sm text-[var(--text-primary)] mb-2 group-hover:text-blue-600 transition-colors">{title}</h5>
            <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed mb-4">{description}</p>

            {resolver && (
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{resolver}</p>
            )}

            {severity === 'critical' && (
                <div className="grid grid-cols-2 gap-3 mt-4">
                    <button className="bg-blue-600 text-white text-[10px] font-black uppercase tracking-[0.1em] py-3 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95">Resolve</button>
                    <button className="bg-slate-800 text-white text-[10px] font-black uppercase tracking-[0.1em] py-3 rounded-xl hover:bg-slate-900 transition-all shadow-lg active:scale-95">Reassign</button>
                </div>
            )}

            {actionLabel && severity !== 'critical' && (
                <button className="w-full bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-widest py-2.5 rounded-xl hover:bg-blue-100 transition-colors">
                    {actionLabel}
                </button>
            )}
        </div>
    );
};

export default AdminDashboard;
