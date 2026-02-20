import { useState, useEffect, useCallback } from 'react';
import {
    FileText, Download, ExternalLink, CheckCircle2, AlertTriangle,
    BarChart3, PieChart, Search, Filter, ChevronRight, RefreshCw
} from 'lucide-react';
import { getStats, getPredictions, getAlerts } from '../services/api';

const ReportsPage = () => {
    const [stats, setStats] = useState(null);
    const [predictions, setPredictions] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [s, p, a] = await Promise.all([
                getStats().catch(() => ({ data: null })),
                getPredictions().catch(() => ({ data: [] })),
                getAlerts().catch(() => ({ data: [] })),
            ]);
            setStats(s.data);
            setPredictions(p.data || []);
            setAlerts(a.data || []);
        } catch (err) { console.error(err); }
        finally { setIsLoading(false); }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const totalPredictions = stats?.total_predictions || predictions.length;
    const highRisk = stats?.risk_distribution?.high || predictions.filter(p => p.risk_level === 'high').length;
    const activeAlerts = stats?.active_alerts || alerts.length;
    const avgConfidence = stats?.avg_confidence ? `${Math.round(stats.avg_confidence * 100)}%` : `${predictions.length > 0 ? Math.round(predictions.reduce((a, p) => a + (p.confidence || 0), 0) / predictions.length * 100) : 0}%`;

    // Generate report entries dynamically from predictions
    const recentReports = predictions.slice(0, 6).map((p, i) => ({
        id: `REP-${String(p.id || (2024000 + i)).padStart(7, '0')}`,
        name: `${p.location || 'Zone'} Risk Assessment`,
        type: p.risk_level === 'high' ? 'Clinical' : p.risk_level === 'medium' ? 'Environmental' : 'Compliance',
        status: p.severity === 'CRITICAL' ? 'Needs Review' : p.risk_level === 'high' ? 'Processing' : 'Finalized',
        date: p.created_at ? new Date(p.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Recent',
        author: 'AI Commander',
    }));

    // Add fallback reports if no predictions exist
    if (recentReports.length === 0) {
        recentReports.push(
            { id: 'REP-0000001', name: 'System Initialization Report', type: 'Operational', status: 'Finalized', date: 'Current', author: 'System' },
        );
    }

    const statusBadge = (s) => {
        switch (s) {
            case 'Finalized': return 'bg-green-50 text-green-600 border-green-100';
            case 'Processing': return 'bg-blue-50 text-blue-600 border-blue-100';
            default: return 'bg-amber-50 text-amber-600 border-amber-100';
        }
    };

    const handleExport = () => {
        const headers = ['Report ID', 'Name', 'Type', 'Status', 'Date', 'Author'];
        const csvRows = [headers.join(','), ...recentReports.map(r =>
            [r.id, `"${r.name}"`, r.type, r.status, r.date, r.author].join(',')
        )];
        const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `aquasentinel_reports_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-lg">
                        <FileText size={28} />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900">Intelligence Reports</h2>
                        <p className="text-sm text-slate-500 mt-1">Analytics & compliance logs</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={fetchData} className="p-2.5 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-blue-600 transition-all">
                        <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
                    </button>
                    <button onClick={handleExport} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-all">
                        <Download size={16} /> Export Reports
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                <ReportStat label="Avg Confidence" value={avgConfidence} icon={CheckCircle2} color="emerald" />
                <ReportStat label="Total Predictions" value={totalPredictions.toLocaleString()} icon={BarChart3} color="blue" />
                <ReportStat label="Critical Alerts" value={activeAlerts} icon={AlertTriangle} color="amber" />
                <ReportStat label="High Risk Events" value={highRisk} icon={PieChart} color="indigo" />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Report List */}
                <div className="xl:col-span-2 space-y-5">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-slate-800">Recent Publications</h3>
                        <div className="flex gap-2">
                            <button className="p-2.5 bg-slate-50 rounded-lg text-slate-400 hover:text-blue-600 transition-all"><Search size={16} /></button>
                            <button className="p-2.5 bg-slate-50 rounded-lg text-slate-400 hover:text-blue-600 transition-all"><Filter size={16} /></button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {recentReports.map((report) => (
                            <div key={report.id} className="glass-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:shadow-md transition-all group">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all border border-slate-100">
                                        <FileText size={22} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <h4 className="text-sm font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">{report.name}</h4>
                                            <span className="text-xs font-bold px-2 py-0.5 bg-slate-100 text-slate-400 rounded">{report.id}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-xs text-slate-400 font-medium">
                                            <span>{report.type}</span>
                                            <span className="w-1 h-1 bg-slate-200 rounded-full" />
                                            <span>{report.date}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <span className={`text-xs font-bold px-3 py-1.5 rounded-full border ${statusBadge(report.status)}`}>{report.status}</span>
                                    <button className="p-2 text-slate-300 hover:text-blue-600 transition-all"><Download size={18} /></button>
                                    <button className="p-2 text-slate-300 hover:text-blue-600 transition-all"><ExternalLink size={18} /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <div className="glass-card p-6 bg-slate-900 text-white border-none relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-28 h-28 bg-blue-600/20 blur-3xl -mr-14 -mt-14 rounded-full" />
                        <h3 className="text-base font-semibold mb-4 relative z-10">System Summary</h3>
                        <div className="space-y-3 relative z-10">
                            <SummaryItem label="Predictions" value={totalPredictions} />
                            <SummaryItem label="High Risk" value={`${highRisk} zones`} />
                            <SummaryItem label="Active Alerts" value={activeAlerts} />
                            <SummaryItem label="Model" value="RF v2.1" />
                        </div>
                    </div>

                    <div className="bg-blue-50/50 rounded-2xl p-7 border border-blue-100 text-center space-y-4">
                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-md mx-auto">
                            <BarChart3 size={28} />
                        </div>
                        <h4 className="text-xl font-bold text-slate-900">Enterprise Tier</h4>
                        <p className="text-xs text-slate-500 leading-relaxed">Unlock advanced multi-sector tracking and predictive satellite imagery.</p>
                        <button className="w-full py-3 bg-white border border-blue-200 text-blue-600 text-xs font-semibold rounded-xl hover:bg-blue-600 hover:text-white transition-all">
                            Upgrade Access
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ReportStat = ({ label, value, icon, color }) => {
    const Icon = icon;
    const colors = {
        emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
        blue: 'bg-blue-50 text-blue-600 border-blue-100',
        amber: 'bg-amber-50 text-amber-600 border-amber-100',
        indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    };

    return (
        <div className="glass-card p-6 group hover:-translate-y-1 transition-all">
            <div className="flex items-center gap-3 mb-4">
                <div className={`p-3 rounded-xl border ${colors[color]}`}>
                    <Icon size={20} />
                </div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
            </div>
            <h4 className="text-4xl font-bold text-slate-900 tracking-tight">{value}</h4>
        </div>
    );
};

const SummaryItem = ({ label, value }) => (
    <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
        <span className="text-xs font-medium text-slate-400">{label}</span>
        <span className="text-xs font-bold text-white">{value}</span>
    </div>
);

export default ReportsPage;
