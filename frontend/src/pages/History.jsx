import {
    History, Search, Filter, Download, Calendar, ArrowUpRight, Archive, Clock, Database
} from 'lucide-react';
import { useState } from 'react';

const HistoryPage = () => {
    const [searchTerm, setSearchTerm] = useState('');

    const historicalData = [
        { id: 'AQ-1092', zone: 'Sector A-12', date: '2023-11-24', risk: 'HIGH', confidence: '94%', cases: 12, sensors: 14 },
        { id: 'AQ-1091', zone: 'Regional Basin', date: '2023-11-23', risk: 'LOW', confidence: '98%', cases: 2, sensors: 42 },
        { id: 'AQ-1090', zone: 'Coast North', date: '2023-11-22', risk: 'MEDIUM', confidence: '91%', cases: 5, sensors: 28 },
        { id: 'AQ-1089', zone: 'Sector B-04', date: '2023-11-21', risk: 'LOW', confidence: '96%', cases: 1, sensors: 12 },
        { id: 'AQ-1088', zone: 'Old Colony', date: '2023-11-20', risk: 'HIGH', confidence: '89%', cases: 18, sensors: 9 },
        { id: 'AQ-1087', zone: 'Main Reservoir', date: '2023-11-19', risk: 'LOW', confidence: '99%', cases: 0, sensors: 56 },
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
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
                        <History size={28} />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900">Historical Archive</h2>
                        <p className="text-sm text-slate-500 mt-1">Incident & sensor data records</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input type="text" placeholder="Search records..."
                            className="w-64 pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-400 focus:bg-white"
                            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                    <button className="p-2.5 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-blue-600 transition-all">
                        <Filter size={18} />
                    </button>
                    <button className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-black transition-all">
                        <Download size={16} /> Export
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <SummaryCard label="Total Records" value="12,402" icon={Archive} color="blue" />
                <SummaryCard label="Avg Compliance" value="98.2%" icon={Database} color="teal" />
                <SummaryCard label="Data Retention" value="7 Years" icon={Clock} color="indigo" />
            </div>

            {/* Table */}
            <div className="glass-card p-0 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-xs font-semibold text-slate-400 uppercase tracking-wider text-left bg-slate-50 border-b border-slate-100">
                                <th className="px-6 py-4">Record ID</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Zone</th>
                                <th className="px-6 py-4">Risk Level</th>
                                <th className="px-6 py-4 text-right">Confidence</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {historicalData.map((record) => (
                                <tr key={record.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">{record.id}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <Calendar size={14} className="text-slate-400" />
                                            <span className="text-sm font-medium text-slate-700">{record.date}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium text-slate-800">{record.zone}</td>
                                    <td className="px-6 py-4">
                                        <span className={`text-xs font-bold px-3 py-1.5 rounded-full border ${riskBadge(record.risk)}`}>{record.risk}</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <span className="text-sm font-bold text-slate-800">{record.confidence}</span>
                                            <ArrowUpRight size={16} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
                    <p className="text-xs font-medium text-slate-400">Showing 1-6 of 12,402 records</p>
                    <div className="flex gap-2">
                        <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-400 hover:text-blue-600 transition-all">Prev</button>
                        <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-400 hover:text-blue-600 transition-all">Next</button>
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
        teal: 'bg-teal-50 text-teal-600 border-teal-100',
        indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    };

    return (
        <div className="glass-card p-6 group hover:-translate-y-1 transition-all">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl border ${colors[color]} group-hover:scale-110 transition-transform`}>
                    <Icon size={20} />
                </div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
            </div>
            <h4 className="text-4xl font-bold text-slate-900 tracking-tight">{value}</h4>
        </div>
    );
};

export default HistoryPage;
