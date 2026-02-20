import { useState, useEffect, useCallback } from 'react';
import {
    MapPin, Layers, Filter, Maximize2, RotateCcw, Download,
    AlertCircle, CheckCircle2, Clock
} from 'lucide-react';
import MapView from '../components/MapView';
import { getPredictions } from '../services/api';

const MapPage = () => {
    const [predictions, setPredictions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('all');

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await getPredictions();
            setPredictions(res.data);
        } catch (err) { console.error(err); }
        finally { setIsLoading(false); }
    }, []);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 60000);
        return () => clearInterval(interval);
    }, [fetchData]);

    const riskCounts = predictions.reduce((acc, p) => {
        const level = p.risk_level || 'low';
        acc[level] = (acc[level] || 0) + 1;
        return acc;
    }, { high: 0, medium: 0, low: 0 });

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
                        <MapPin size={28} />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900 font-outfit">Risk Heatmap</h2>
                        <p className="text-sm text-slate-500 mt-1">Real-time geo-spatial risk monitoring across all zones</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex bg-slate-100 rounded-xl p-1.5 gap-1">
                        {['all', 'high', 'medium', 'low'].map(f => (
                            <button key={f} onClick={() => setActiveFilter(f)}
                                className={`px-4 py-2 rounded-lg text-xs font-semibold capitalize transition-all ${activeFilter === f
                                    ? 'bg-white text-blue-600 shadow-sm'
                                    : 'text-slate-400 hover:text-slate-600'
                                    }`}>
                                {f === 'all' ? 'All Zones' : f}
                            </button>
                        ))}
                    </div>
                    <button onClick={fetchData} className="p-2.5 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-blue-600 transition-all">
                        <RotateCcw size={18} className={isLoading ? 'animate-spin' : ''} />
                    </button>
                    <button className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-black transition-all">
                        <Download size={16} /> Export
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                <SummaryCard label="Total Zones" value={predictions.length || 0} icon={MapPin} color="blue" />
                <SummaryCard label="High Risk" value={riskCounts.high} icon={AlertCircle} color="red" />
                <SummaryCard label="Medium Risk" value={riskCounts.medium} icon={Clock} color="amber" />
                <SummaryCard label="Safe Zones" value={riskCounts.low} icon={CheckCircle2} color="green" />
            </div>

            {/* Map */}
            <div className="glass-card p-0 overflow-hidden flex flex-col" style={{ minHeight: 'calc(100vh - 380px)' }}>
                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <h3 className="text-base font-semibold text-slate-800">🗺️ Coimbatore Region — Live Feed</h3>
                        <div className="h-5 w-px bg-slate-200" />
                        <button className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-blue-600 transition-all">
                            <Filter size={14} /> Filters
                        </button>
                        <button className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-blue-600 transition-all">
                            <Layers size={14} /> Overlays
                        </button>
                    </div>
                    <button className="w-9 h-9 flex items-center justify-center bg-slate-50 text-slate-400 rounded-lg hover:bg-blue-600 hover:text-white transition-all">
                        <Maximize2 size={16} />
                    </button>
                </div>
                <div className="flex-1 relative">
                    <MapView predictions={activeFilter === 'all' ? predictions : predictions.filter(p => p.risk_level === activeFilter)} mini={false} />

                    {/* Legend */}
                    <div className="absolute bottom-6 left-6 z-[40] bg-white/95 backdrop-blur-sm p-5 rounded-xl border border-slate-200 shadow-lg">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Risk Levels</p>
                        <div className="space-y-2.5">
                            <div className="flex items-center gap-3 text-sm text-slate-600">
                                <div className="w-4 h-4 rounded-full bg-red-500 shadow-sm shadow-red-500/30" /> High Risk Zone
                            </div>
                            <div className="flex items-center gap-3 text-sm text-slate-600">
                                <div className="w-4 h-4 rounded-full bg-amber-500 shadow-sm shadow-amber-500/30" /> Potential Risk
                            </div>
                            <div className="flex items-center gap-3 text-sm text-slate-600">
                                <div className="w-4 h-4 rounded-full bg-green-500 shadow-sm shadow-green-500/30" /> Nominal / Safe
                            </div>
                        </div>
                    </div>

                    {/* Stats Overlay */}
                    <div className="absolute top-6 right-6 z-[40] bg-white/95 backdrop-blur-sm p-5 rounded-xl border border-slate-200 shadow-lg min-w-[180px]">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Live Stats</p>
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Active Sensors</span>
                                <span className="font-bold text-slate-800">{predictions.length * 3 || 42}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Coverage</span>
                                <span className="font-bold text-slate-800">94.2%</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Last Update</span>
                                <span className="font-bold text-blue-600">Just now</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const SummaryCard = ({ label, value, icon, color }) => {
    const Icon = icon;
    const colors = {
        blue: 'bg-blue-50 text-blue-600 border-blue-100',
        red: 'bg-red-50 text-red-600 border-red-100',
        amber: 'bg-amber-50 text-amber-600 border-amber-100',
        green: 'bg-green-50 text-green-600 border-green-100',
    };

    return (
        <div className="glass-card p-6 group hover:-translate-y-1 transition-all">
            <div className="flex items-center gap-3 mb-4">
                <div className={`p-3 rounded-xl border ${colors[color]} group-hover:scale-110 transition-transform`}>
                    <Icon size={20} />
                </div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
            </div>
            <h4 className="text-4xl font-bold text-slate-900 tracking-tight">{value}</h4>
        </div>
    );
};

export default MapPage;
