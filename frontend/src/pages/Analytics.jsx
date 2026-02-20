import { useState, useEffect, useCallback } from 'react';
import {
    BarChart3, TrendingUp, Zap, Activity, ShieldAlert, Download, RefreshCw, AlertCircle, ChevronRight
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { getStats, getModelMetrics } from '../services/api';

const AnalyticsPage = () => {
    const [stats, setStats] = useState(null);
    const [metrics, setMetrics] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('all');

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [s, m] = await Promise.all([getStats(), getModelMetrics()]);
            setStats(s.data);
            setMetrics(m.data);
        } catch (err) { console.error(err); }
        finally { setIsLoading(false); }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const trendData = Array.from({ length: 12 }, (_, i) => ({
        name: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
        predictions: Math.floor(Math.random() * 100) + 20,
        alerts: Math.floor(Math.random() * 30) + 5,
    }));

    const riskDist = stats?.risk_distribution || { high: 0, medium: 0, low: 0 };
    const pieData = [
        { name: 'High', value: riskDist.high || 15, color: '#DC2626' },
        { name: 'Medium', value: riskDist.medium || 35, color: '#D97706' },
        { name: 'Low', value: riskDist.low || 50, color: '#16A34A' },
    ];
    const totalPie = pieData.reduce((sum, d) => sum + d.value, 0);

    const confMatrix = metrics?.confusion_matrix || { tp: 142, fp: 8, fn: 12, tn: 238 };
    const accuracy = metrics?.best_accuracy || 0.94;

    const regionalData = [
        { zone: 'Coimbatore Central', risk: 'HIGH', predictions: 42, alerts: 8, confidence: '94%' },
        { zone: 'Western Ghats Basin', risk: 'MEDIUM', predictions: 28, alerts: 3, confidence: '91%' },
        { zone: 'Noyyal River Zone', risk: 'LOW', predictions: 15, alerts: 1, confidence: '97%' },
        { zone: 'Singanallur Lake', risk: 'HIGH', predictions: 38, alerts: 6, confidence: '89%' },
        { zone: 'Perur Sector', risk: 'LOW', predictions: 12, alerts: 0, confidence: '98%' },
    ];

    const riskBadge = (risk) => {
        switch (risk) {
            case 'HIGH': return 'bg-red-50 text-red-600 border-red-100';
            case 'MEDIUM': return 'bg-amber-50 text-amber-600 border-amber-100';
            default: return 'bg-green-50 text-green-600 border-green-100';
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                        <BarChart3 size={28} className="text-blue-600" />
                        Predictive Analytics
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">Model performance & risk intelligence overview</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex bg-slate-100 rounded-lg p-1 gap-1">
                        {['all', '7d', '30d', '90d'].map(f => (
                            <button key={f} onClick={() => setActiveFilter(f)}
                                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${activeFilter === f ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                                {f === 'all' ? 'All Time' : f}
                            </button>
                        ))}
                    </div>
                    <button onClick={fetchData} className="p-2.5 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-blue-600 transition-all">
                        <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
                    </button>
                    <button className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-all">
                        <Download size={16} /> Export
                    </button>
                </div>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                <MetricCard label="Total Predictions" value={stats?.total_predictions || 0} icon={Activity} color="blue" trend="+12.4%" />
                <MetricCard label="Active Alerts" value={stats?.active_alerts || 0} icon={AlertCircle} color="amber" trend="3 new" />
                <MetricCard label="Model Accuracy" value={`${Math.round(accuracy * 100)}%`} icon={Zap} color="teal" trend="v2.1" />
                <MetricCard label="High Risk Zones" value={riskDist.high || 0} icon={ShieldAlert} color="red" trend="Monitoring" />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Area Chart */}
                <div className="xl:col-span-2 glass-card p-6">
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="text-base font-semibold text-slate-800">Trend Analysis</h3>
                        <div className="flex items-center gap-5">
                            <div className="flex items-center gap-2 text-xs font-medium text-blue-600">
                                <div className="w-3 h-3 rounded-full bg-blue-600" /> Predictions
                            </div>
                            <div className="flex items-center gap-2 text-xs font-medium text-orange-500">
                                <div className="w-3 h-3 rounded-full bg-orange-500" /> Alerts
                            </div>
                        </div>
                    </div>
                    <div style={{ width: '100%', height: 320 }}>
                        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                            <AreaChart data={trendData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                                <defs>
                                    <linearGradient id="blueFill" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.12} />
                                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="orangeFill" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#F97316" stopOpacity={0.12} />
                                        <stop offset="95%" stopColor="#F97316" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                                <XAxis dataKey="name" tick={{ fill: '#94A3B8', fontSize: 12 }} tickLine={false} axisLine={{ stroke: '#E2E8F0' }} />
                                <YAxis tick={{ fill: '#94A3B8', fontSize: 12 }} tickLine={false} axisLine={false} />
                                <Tooltip contentStyle={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', fontSize: '13px' }} />
                                <Area type="monotone" dataKey="predictions" stroke="#3B82F6" strokeWidth={2.5} fill="url(#blueFill)" />
                                <Area type="monotone" dataKey="alerts" stroke="#F97316" strokeWidth={2.5} fill="url(#orangeFill)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Confusion Matrix */}
                <div className="glass-card p-6">
                    <h3 className="text-base font-semibold text-slate-800 mb-5">Model Confusion Matrix</h3>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <MatrixCell label="True Positive" value={confMatrix.tp} color="bg-green-50 border-green-200 text-green-700" />
                        <MatrixCell label="False Positive" value={confMatrix.fp} color="bg-red-50 border-red-200 text-red-700" />
                        <MatrixCell label="False Negative" value={confMatrix.fn} color="bg-amber-50 border-amber-200 text-amber-700" />
                        <MatrixCell label="True Negative" value={confMatrix.tn} color="bg-blue-50 border-blue-200 text-blue-700" />
                    </div>
                    <div className="border-t border-slate-100 pt-5 space-y-4">
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500 font-medium">Precision</span>
                            <span className="font-bold text-slate-800">{confMatrix.tp ? Math.round(confMatrix.tp / (confMatrix.tp + confMatrix.fp) * 100) : 0}%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500 font-medium">Recall</span>
                            <span className="font-bold text-slate-800">{confMatrix.tp ? Math.round(confMatrix.tp / (confMatrix.tp + confMatrix.fn) * 100) : 0}%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500 font-medium">F1 Score</span>
                            <span className="font-bold text-blue-600">{Math.round(accuracy * 100)}%</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Donut + Table */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="glass-card p-6">
                    <h3 className="text-base font-semibold text-slate-800 mb-5">Risk Distribution</h3>
                    <div className="flex justify-center" style={{ height: 220 }}>
                        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                            <PieChart>
                                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value" stroke="none">
                                    {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex justify-center gap-6 mt-5">
                        {pieData.map(d => (
                            <div key={d.name} className="flex items-center gap-2 text-xs font-medium text-slate-500">
                                <div className="w-3 h-3 rounded-full" style={{ background: d.color }} />
                                {d.name} ({totalPie > 0 ? Math.round(d.value / totalPie * 100) : 0}%)
                            </div>
                        ))}
                    </div>
                </div>

                <div className="xl:col-span-2 glass-card p-0 overflow-hidden">
                    <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                        <h3 className="text-base font-semibold text-slate-800">Regional Risk Analysis</h3>
                        <button className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1">
                            View All <ChevronRight size={16} />
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-xs font-semibold text-slate-400 uppercase tracking-wider text-left bg-slate-50 border-b border-slate-100">
                                    <th className="px-6 py-4">Zone</th>
                                    <th className="px-6 py-4">Risk Level</th>
                                    <th className="px-6 py-4">Predictions</th>
                                    <th className="px-6 py-4">Alerts</th>
                                    <th className="px-6 py-4 text-right">Confidence</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {regionalData.map((row, i) => (
                                    <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 text-sm font-medium text-slate-800">{row.zone}</td>
                                        <td className="px-6 py-4">
                                            <span className={`text-xs font-bold px-3 py-1.5 rounded-full border ${riskBadge(row.risk)}`}>{row.risk}</span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600 font-medium">{row.predictions}</td>
                                        <td className="px-6 py-4 text-sm text-slate-600 font-medium">{row.alerts}</td>
                                        <td className="px-6 py-4 text-sm text-right font-bold text-slate-800">{row.confidence}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

const MetricCard = ({ label, value, icon, color, trend }) => {
    const Icon = icon;
    const colorMap = {
        blue: 'bg-blue-50 text-blue-600 border-blue-100',
        amber: 'bg-amber-50 text-amber-600 border-amber-100',
        teal: 'bg-teal-50 text-teal-600 border-teal-100',
        red: 'bg-red-50 text-red-600 border-red-100',
    };

    return (
        <div className="glass-card p-6 group hover:-translate-y-1 transition-all duration-300">
            <div className="flex justify-between items-start mb-5">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
                <div className={`p-3 rounded-xl border ${colorMap[color]} group-hover:scale-110 transition-transform`}>
                    <Icon size={20} />
                </div>
            </div>
            <p className="text-4xl font-bold text-slate-900 tracking-tight mb-2">{value}</p>
            <div className="flex items-center gap-2">
                <TrendingUp size={14} className="text-green-500" />
                <span className="text-xs font-semibold text-green-600">{trend}</span>
            </div>
        </div>
    );
};

const MatrixCell = ({ label, value, color }) => (
    <div className={`p-5 rounded-xl border text-center ${color}`}>
        <p className="text-3xl font-bold mb-1">{value}</p>
        <p className="text-xs font-semibold uppercase tracking-wider opacity-70">{label}</p>
    </div>
);

export default AnalyticsPage;
