import { useEffect } from 'react';
import {
    BarChart3,
    TrendingUp,
    PieChart as PieIcon,
    Calendar,
    Globe,
    Filter,
    Download,
    Share2,
    ChevronDown,
    Info,
    CheckCircle2,
    AlertTriangle,
    Users,
    Target,
    ArrowRight,
    Clock
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';
import { getPredictions } from '../services/api';

const COLORS = ['#2563EB', '#0D9488', '#F59E0B', '#DC2626'];

const Analytics = () => {

    useEffect(() => {
        const fetchData = async () => {
            try {
                await getPredictions();
            } catch (err) {
                console.error(err);
            }
        };
        fetchData();
    }, []);

    const riskBreakdown = [
        { name: 'Safe Zones', value: 72, color: '#2563EB' },
        { name: 'Low Monitoring', value: 20, color: '#0D9488' },
        { name: 'Critical Threshold', value: 8, color: '#F59E0B' },
    ];

    const trendData = [
        { name: 'Week 1', predicted: 400, historical: 240 },
        { name: 'Week 2', predicted: 300, historical: 139 },
        { name: 'Week 3', predicted: 200, historical: 980 },
        { name: 'Week 4', predicted: 278, historical: 390 },
        { name: 'Week 5', predicted: 189, historical: 480 },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header with Filters */}
            <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-green-600 uppercase tracking-widest">
                        <span className="w-1.5 h-1.5 bg-green-600 rounded-full animate-status" />
                        System Live
                    </div>
                    <h2 className="text-4xl font-extrabold tracking-tight text-[var(--text-primary)] font-outfit">Analytics & Trends</h2>
                    <p className="text-[var(--text-secondary)] font-medium">Real-time AI-driven waterborne disease prediction insights and model performance metrics.</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-[var(--text-secondary)] shadow-sm hover:bg-slate-50 transition-all">
                        <Download size={14} /> Export CSV
                    </button>
                    <button className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all">
                        <Share2 size={14} /> Share Report
                    </button>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-wrap items-center gap-3 bg-[var(--bg-card)] p-3 rounded-2xl border border-[var(--border-subtle)] shadow-sm">
                <FilterDropdown icon={Calendar} label="Last 30 Days" />
                <FilterDropdown icon={Globe} label="Global View" />
                <FilterDropdown icon={AlertTriangle} label="All Severities" />
                <FilterDropdown icon={Target} label="Model v2.4 (Active)" />
                <button className="ml-auto text-[11px] font-black text-blue-600 uppercase tracking-widest hover:text-blue-700 transition-colors px-4">Reset Filters</button>
            </div>

            {/* Summary Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <AnalyticsMetric
                    label="Confidence Score"
                    value="94.2%"
                    trend="+1.2%"
                    icon={CheckCircle2}
                    color="blue"
                    progress={94}
                />
                <AnalyticsMetric
                    label="Active Alerts"
                    value="18"
                    trend="-5%"
                    trendDown={true}
                    icon={AlertTriangle}
                    color="amber"
                    chart={true}
                />
                <AnalyticsMetric
                    label="Model Accuracy"
                    value="98.1%"
                    trend="+2.4%"
                    icon={Target}
                    color="teal"
                    progress={98}
                />
                <AnalyticsMetric
                    label="Communities Monitored"
                    value="1,402"
                    trend="Stable"
                    icon={Users}
                    color="indigo"
                    footer="Updated: 2 mins ago"
                />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Trend Chart */}
                <div className="glass-card p-8 space-y-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-[var(--text-primary)]">
                            <TrendingUp size={20} className="text-blue-600" />
                            <h3 className="font-bold text-lg font-outfit">Prediction Trends (30 Days)</h3>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-blue-600 uppercase">
                                <span className="w-2 h-2 rounded-full bg-blue-600" /> Predicted
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase">
                                <span className="w-2 h-2 rounded-full bg-slate-200" /> Historical
                            </div>
                        </div>
                    </div>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trendData}>
                                <defs>
                                    <linearGradient id="colorPred" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#2563EB" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                    itemStyle={{ fontSize: '11px', fontWeight: 'bold' }}
                                />
                                <Area type="monotone" dataKey="predicted" stroke="#2563EB" strokeWidth={3} fillOpacity={1} fill="url(#colorPred)" />
                                <Area type="monotone" dataKey="historical" stroke="#CBD5E1" strokeWidth={2} fillOpacity={0} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                    <p className="text-[10px] italic text-[var(--text-tertiary)] text-center">AI identifies 14% deviation in coastal data compared to previous cycle.</p>
                </div>

                {/* Confusion Matrix Placeholder Style */}
                <div className="glass-card p-8 space-y-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-[var(--text-primary)]">
                            <PieIcon size={20} className="text-teal-600" />
                            <h3 className="font-bold text-lg font-outfit">Confusion Matrix & Precision</h3>
                        </div>
                        <button className="text-[10px] font-bold text-blue-600 uppercase tracking-widest hover:underline">Detailed Analytics</button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid grid-cols-2 gap-2">
                            <MatrixBox label="TP" value="982" color="blue" />
                            <MatrixBox label="FP" value="12" color="slate" />
                            <MatrixBox label="FN" value="8" color="slate" />
                            <MatrixBox label="TN" value="1,024" color="teal" />
                        </div>
                        <div className="space-y-5 px-4">
                            <PrecisionBar label="Precision" value={98.8} color="blue" />
                            <PrecisionBar label="Recall" value={99.2} color="teal" />
                            <PrecisionBar label="F1 Score" value={0.99} color="amber" isScore />
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-8 border-t border-slate-100 text-[10px] font-bold uppercase tracking-widest text-[var(--text-tertiary)]">
                        <div className="flex items-center gap-2"><Info size={12} /> Validation Dataset: 2,026 Samples</div>
                        <div className="flex items-center gap-2"><Clock size={12} /> Last Training: Aug 24, 2023</div>
                    </div>
                </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Global Risk Breakdown */}
                <div className="glass-card p-8 space-y-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-[var(--text-primary)]">
                            <Globe size={20} className="text-blue-600" />
                            <h3 className="font-bold text-lg font-outfit">Global Risk Breakdown</h3>
                        </div>
                        <span className="text-[9px] font-bold bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full uppercase tracking-widest">Real-time</span>
                    </div>

                    <div className="flex items-center gap-12 py-4">
                        <div className="relative w-48 h-48 flex items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={riskBreakdown} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                        {riskBreakdown.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute flex flex-col items-center">
                                <span className="text-3xl font-extrabold text-[var(--text-primary)]">1,402</span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Total Nodes</span>
                            </div>
                        </div>
                        <div className="flex-1 space-y-4">
                            {riskBreakdown.map((item) => (
                                <div key={item.name} className="flex items-center justify-between text-xs py-2 border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors px-2 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <span className="w-3 h-3 rounded-md" style={{ background: item.color }} />
                                        <span className="font-bold text-[var(--text-secondary)]">{item.name}</span>
                                    </div>
                                    <span className="font-bold text-[var(--text-primary)]">{(item.value / 100 * 100).toFixed(0)}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Regional Risk Ranking Table Placeholder */}
                <div className="glass-card p-8 space-y-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-[var(--text-primary)]">
                            <BarChart3 size={20} className="text-indigo-600" />
                            <h3 className="font-bold text-lg font-outfit">Regional Risk Ranking</h3>
                        </div>
                        <button className="p-2 hover:bg-slate-50 rounded-lg transition-colors"><Filter size={18} className="text-slate-400" /></button>
                    </div>

                    <table className="w-full">
                        <thead>
                            <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-left">
                                <th className="pb-4 font-bold">Region</th>
                                <th className="pb-4 font-bold">Risk Level</th>
                                <th className="pb-4 font-bold">Predicted Cases</th>
                                <th className="pb-4 font-bold">Trend</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            <RegionRow id="NO" name="North Delta" level="CRITICAL" cases="452 (est.)" trend="up" />
                            <RegionRow id="SO" name="Southern Basin" level="HIGH" cases="128 (est.)" trend="down" />
                            <RegionRow id="EA" name="Eastern Coast" level="STABLE" cases="12 (est.)" trend="neutral" />
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="text-center py-6">
                <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.3em]">Waterborne AI Command Center • Internal Access Only • © 2026</p>
            </div>
        </div>
    );
};

const FilterDropdown = ({ icon, label }) => {
    const Icon = icon;
    return (
        <button className="flex items-center gap-2.5 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-bold text-[var(--text-secondary)] hover:border-blue-500/20 transition-all group">
            <Icon size={14} className="text-slate-400 group-hover:text-blue-500 transition-colors" />
            {label}
            <ChevronDown size={14} className="text-slate-300 ml-1" />
        </button>
    );
};

const AnalyticsMetric = ({ label, value, trend, trendDown, icon, color, progress, footer, chart }) => {
    const Icon = icon;
    const colorClasses = {
        blue: 'text-blue-600 bg-blue-50',
        amber: 'text-amber-600 bg-amber-50',
        teal: 'text-teal-600 bg-teal-50',
        indigo: 'text-indigo-600 bg-indigo-50',
    };

    return (
        <div className="glass-card p-6 relative group overflow-hidden">
            <div className="flex justify-between items-start mb-6">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
                <div className={`p-2 rounded-xl border border-transparent group-hover:border-current transition-all ${colorClasses[color]}`}>
                    <Icon size={16} />
                </div>
            </div>
            <div className="flex items-baseline gap-3 mb-4">
                <h4 className="text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">{value}</h4>
                <span className={`text-[11px] font-bold ${trendDown ? 'text-red-500' : 'text-green-600'}`}>
                    {trendDown ? '↘' : '↗'} {trend}
                </span>
            </div>
            {progress ? (
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-1000 ${color === 'blue' ? 'bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.4)]' : 'bg-teal-600 shadow-[0_0_8px_rgba(13,148,136,0.4)]'
                        }`} style={{ width: `${progress}%` }} />
                </div>
            ) : chart ? (
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Trend: Downward</p>
            ) : (
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{footer}</p>
            )}
        </div>
    );
};

const MatrixBox = ({ label, value, color }) => (
    <div className={`p-4 rounded-xl border-2 ${color === 'blue' ? 'bg-blue-50 border-blue-500/20' : color === 'teal' ? 'bg-teal-50 border-teal-500/20' : 'bg-slate-50 border-slate-100'} text-center`}>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <p className={`text-xl font-extrabold ${color === 'blue' ? 'text-blue-600' : color === 'teal' ? 'text-teal-600' : 'text-slate-600'}`}>{value}</p>
    </div>
);

const PrecisionBar = ({ label, value, color, isScore }) => (
    <div className="space-y-2">
        <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest">
            <span className="text-slate-400">{label}</span>
            <span className={color === 'blue' ? 'text-blue-600' : color === 'teal' ? 'text-teal-600' : 'text-amber-600'}>{value}{isScore ? '' : '%'}</span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
                className={`h-full rounded-full transition-all duration-1000 ${color === 'blue' ? 'bg-blue-600' : color === 'teal' ? 'bg-teal-600' : 'bg-amber-600'
                    }`}
                style={{ width: isScore ? `${value * 100}%` : `${value}%` }}
            />
        </div>
    </div>
);

const RegionRow = ({ id, name, level, cases, trend }) => (
    <tr className="group hover:bg-slate-50 transition-colors">
        <td className="py-5 font-bold text-sm text-[var(--text-secondary)] px-2 rounded-l-xl">
            <div className="flex items-center gap-3">
                <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-1.5 py-0.5 rounded leading-none">{id}</span>
                {name}
            </div>
        </td>
        <td className="py-5 px-2">
            <span className={`text-[9px] font-extrabold px-3 py-1 rounded-full border ${level === 'CRITICAL' ? 'bg-red-50 border-red-100 text-red-600' :
                level === 'HIGH' ? 'bg-amber-50 border-amber-100 text-amber-600' : 'bg-green-50 border-green-100 text-green-600'
                }`}>
                {level}
            </span>
        </td>
        <td className="py-5 font-bold text-sm text-[var(--text-primary)] px-2">{cases}</td>
        <td className="py-5 px-3 rounded-r-xl">
            {trend === 'up' && <TrendingUp size={16} className="text-red-500" />}
            {trend === 'down' && <TrendingUp size={16} className="rotate-180 text-green-500" />}
            {trend === 'neutral' && <ArrowRight size={16} className="text-slate-300" />}
        </td>
    </tr>
);

export default Analytics;
