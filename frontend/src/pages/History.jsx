import { useState, useEffect, useCallback } from 'react';
import {
    History, Search, Filter, Download, Calendar, ArrowUpRight, Archive, Clock, Database
} from 'lucide-react';
import { getPredictions } from '../services/api';

const ITEMS_PER_PAGE = 10;

const HistoryPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [predictions, setPredictions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await getPredictions();
            setPredictions(res.data || []);
        } catch (err) { console.error(err); }
        finally { setIsLoading(false); }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    // Transform real predictions into display records
    const historicalData = predictions.map((p, i) => ({
        id: `AQ-${String(p.id || (2024000 + i)).padStart(7, '0')}`,
        zone: p.location || `Zone ${i + 1}`,
        date: p.created_at ? new Date(p.created_at).toLocaleDateString() : new Date().toLocaleDateString(),
        risk: (p.risk_level || 'low').toUpperCase(),
        confidence: `${Math.round((p.confidence || 0) * 100)}%`,
        cases: p.cases_count || 0,
        severity: p.severity || 'NORMAL',
    }));

    const filtered = historicalData.filter(r =>
        r.zone.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.risk.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Pagination
    const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
    const safePage = Math.min(currentPage, totalPages);
    const paginatedData = filtered.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

    // Reset to page 1 when search changes
    useEffect(() => { setCurrentPage(1); }, [searchTerm]);

    const handleExport = () => {
        if (filtered.length === 0) return;
        const headers = ['Record ID', 'Date', 'Zone', 'Risk Level', 'Cases', 'Confidence'];
        const csvRows = [headers.join(','), ...filtered.map(r =>
            [r.id, r.date, `"${r.zone}"`, r.risk, r.cases, r.confidence].join(',')
        )];
        const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `aquasentinel_history_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

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
                        <p className="text-sm text-slate-500 mt-1">Prediction records & incident history</p>
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
                    <button onClick={handleExport} className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-black transition-all">
                        <Download size={16} /> Export
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <SummaryCard label="Total Records" value={historicalData.length.toLocaleString()} icon={Archive} color="blue" />
                <SummaryCard label="High-Risk Events" value={historicalData.filter(r => r.risk === 'HIGH').length} icon={Database} color="red" />
                <SummaryCard label="Avg Confidence" value={`${historicalData.length > 0 ? Math.round(historicalData.reduce((a, b) => a + parseInt(b.confidence), 0) / historicalData.length) : 0}%`} icon={Clock} color="teal" />
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
                                <th className="px-6 py-4">Cases</th>
                                <th className="px-6 py-4 text-right">Confidence</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {paginatedData.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-16 text-center text-sm text-slate-400">
                                        {isLoading ? 'Loading records...' : 'No records found'}
                                    </td>
                                </tr>
                            ) : (
                                paginatedData.map((record) => (
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
                                        <td className="px-6 py-4 text-sm font-medium text-slate-700">{record.cases}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <span className="text-sm font-bold text-slate-800">{record.confidence}</span>
                                                <ArrowUpRight size={16} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
                    <p className="text-xs font-medium text-slate-400">
                        Showing {((safePage - 1) * ITEMS_PER_PAGE) + 1}–{Math.min(safePage * ITEMS_PER_PAGE, filtered.length)} of {filtered.length} records
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={safePage <= 1}
                            className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-400 hover:text-blue-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                        >Prev</button>
                        <span className="px-4 py-2 text-xs font-semibold text-slate-500">{safePage} / {totalPages}</span>
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={safePage >= totalPages}
                            className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-400 hover:text-blue-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                        >Next</button>
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
        red: 'bg-red-50 text-red-600 border-red-100',
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
