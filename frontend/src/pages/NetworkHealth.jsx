import {
    Wifi, Signal, Server, Activity, AlertCircle, CheckCircle2,
    RefreshCw, Cpu
} from 'lucide-react';
import { useState } from 'react';

const NetworkHealthPage = () => {
    const [isLoading, setIsLoading] = useState(false);

    const nodes = [
        { id: 'NODE-01', name: 'Primary Hub - Coimbatore', status: 'online', latency: '12ms', load: '23%', uptime: '99.98%' },
        { id: 'NODE-02', name: 'Sensor Grid Alpha', status: 'online', latency: '28ms', load: '67%', uptime: '99.91%' },
        { id: 'NODE-03', name: 'Edge Compute - Western', status: 'warning', latency: '145ms', load: '89%', uptime: '97.2%' },
        { id: 'NODE-04', name: 'Data Pipeline Core', status: 'online', latency: '8ms', load: '12%', uptime: '99.99%' },
        { id: 'NODE-05', name: 'Backup Cluster B', status: 'offline', latency: '—', load: '0%', uptime: '—' },
        { id: 'NODE-06', name: 'Satellite Relay', status: 'online', latency: '52ms', load: '45%', uptime: '99.85%' },
    ];

    const statusColor = (s) => {
        switch (s) {
            case 'online': return 'bg-green-50 text-green-600 border-green-100';
            case 'warning': return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'offline': return 'bg-red-50 text-red-600 border-red-100';
            default: return 'bg-slate-50 text-slate-500 border-slate-100';
        }
    };

    const statusDot = (s) => {
        switch (s) {
            case 'online': return 'bg-green-500';
            case 'warning': return 'bg-amber-500';
            case 'offline': return 'bg-red-500';
            default: return 'bg-slate-400';
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                        <Wifi size={28} className="text-blue-600" />
                        Network Health
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">Infrastructure monitoring & node status</p>
                </div>
                <button onClick={() => setIsLoading(!isLoading)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-500 hover:text-blue-600 transition-all">
                    <RefreshCw size={16} /> Refresh Status
                </button>
            </div>

            {/* Vitals */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                <VitalCard label="Total Nodes" value="6" icon={Server} color="blue" />
                <VitalCard label="Online" value="4" icon={CheckCircle2} color="green" />
                <VitalCard label="Warnings" value="1" icon={AlertCircle} color="amber" />
                <VitalCard label="Avg Latency" value="49ms" icon={Activity} color="teal" />
            </div>

            {/* Nodes Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="xl:col-span-2 space-y-5">
                    <h3 className="text-lg font-semibold text-slate-800">Network Nodes</h3>
                    <div className="space-y-4">
                        {nodes.map(node => (
                            <div key={node.id} className="glass-card p-5 flex items-center justify-between hover:shadow-md transition-all group">
                                <div className="flex items-center gap-4">
                                    <div className={`w-3 h-3 rounded-full ${statusDot(node.status)}`} />
                                    <div>
                                        <p className="text-sm font-semibold text-slate-800">{node.name}</p>
                                        <p className="text-xs text-slate-400 font-medium">{node.id}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-8">
                                    <div className="text-right">
                                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Latency</p>
                                        <p className="text-sm font-bold text-slate-800">{node.latency}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Load</p>
                                        <p className="text-sm font-bold text-slate-800">{node.load}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Uptime</p>
                                        <p className="text-sm font-bold text-slate-800">{node.uptime}</p>
                                    </div>
                                    <span className={`text-xs font-bold px-3 py-1.5 rounded-full border uppercase ${statusColor(node.status)}`}>
                                        {node.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Signal Sidebar */}
                <div className="space-y-6">
                    <div className="glass-card p-6">
                        <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2 mb-5">
                            <Signal size={18} className="text-blue-600" />
                            Signal Analysis
                        </h3>
                        <div className="space-y-5">
                            <ProgressBar label="Throughput" value="94.2 Mbps" percent={94} color="bg-blue-500" />
                            <ProgressBar label="Packet Loss" value="0.02%" percent={2} color="bg-green-500" />
                            <ProgressBar label="CPU Usage" value="34%" percent={34} color="bg-teal-500" />
                        </div>
                    </div>

                    <div className="glass-card p-6 bg-slate-900 text-white border-none">
                        <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
                            <Cpu size={18} className="text-blue-400" />
                            System Overview
                        </h3>
                        <div className="space-y-4 text-sm">
                            <div className="flex justify-between">
                                <span className="text-slate-400">Region</span>
                                <span className="text-white font-medium">Coimbatore, TN</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">Protocol</span>
                                <span className="text-white font-medium">AquaX v4.2</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">Last Sync</span>
                                <span className="text-blue-400 font-medium">2 min ago</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const VitalCard = ({ label, value, icon, color }) => {
    const Icon = icon;
    const colors = {
        blue: 'bg-blue-50 text-blue-600 border-blue-100',
        green: 'bg-green-50 text-green-600 border-green-100',
        amber: 'bg-amber-50 text-amber-600 border-amber-100',
        teal: 'bg-teal-50 text-teal-600 border-teal-100',
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

const ProgressBar = ({ label, value, percent, color }) => (
    <div>
        <div className="flex justify-between text-xs font-medium text-slate-500 mb-2">
            <span>{label}</span><span>{value}</span>
        </div>
        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${percent}%` }} />
        </div>
    </div>
);

export default NetworkHealthPage;
