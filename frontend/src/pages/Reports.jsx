import {
    FileText, Download, ExternalLink, CheckCircle2, AlertTriangle,
    BarChart3, PieChart, Search, Filter, ChevronRight
} from 'lucide-react';

const ReportsPage = () => {
    const recentReports = [
        { id: 'REP-2023-011', name: 'Zone A-12 Monthly Summary', type: 'Clinical', status: 'Finalized', date: 'Oct 2023', author: 'AI Commander' },
        { id: 'REP-2023-010', name: 'Regional Basin Water Quality', type: 'Environmental', status: 'Processing', date: 'Sep 2023', author: 'System Bot-X' },
        { id: 'REP-2023-009', name: 'Outbreak Prevention Audit', type: 'Compliance', status: 'Needs Review', date: 'Aug 2023', author: 'Global Admin' },
        { id: 'REP-2023-008', name: 'Infrastructure Resilience Test', type: 'Operational', status: 'Finalized', date: 'Jul 2023', author: 'Eng. Services' },
    ];

    const statusBadge = (s) => {
        switch (s) {
            case 'Finalized': return 'bg-green-50 text-green-600 border-green-100';
            case 'Processing': return 'bg-blue-50 text-blue-600 border-blue-100';
            default: return 'bg-amber-50 text-amber-600 border-amber-100';
        }
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
                <button className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-all">
                    Generate New Report
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                <ReportStat label="Avg Confidence" value="94.2%" icon={CheckCircle2} color="emerald" />
                <ReportStat label="Incidents Logged" value="1,240" icon={BarChart3} color="blue" />
                <ReportStat label="Critical Alerts" value="12" icon={AlertTriangle} color="amber" />
                <ReportStat label="Total Volume" value="4.2 GB" icon={PieChart} color="indigo" />
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
                        <h3 className="text-base font-semibold mb-4 relative z-10">Scheduled Audits</h3>
                        <p className="text-xs text-slate-400 mb-6 relative z-10">Auto system-wide analysis every 24h.</p>
                        <div className="space-y-3 relative z-10">
                            <AuditItem date="Nov 24" task="Regional Compliance" status="READY" />
                            <AuditItem date="Nov 25" task="Infrastructure Stress" status="QUEUED" />
                            <AuditItem date="Nov 26" task="Model Performance" status="QUEUED" />
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

const AuditItem = ({ date, task, status }) => (
    <div className="flex items-center justify-between p-3.5 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-all">
        <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-blue-400 bg-white/5 px-2.5 py-1 rounded-lg">{date}</span>
            <span className="text-xs font-medium text-slate-200">{task}</span>
        </div>
        <span className={`text-xs font-bold px-2.5 py-1 rounded ${status === 'READY' ? 'bg-blue-500/20 text-blue-400' : 'bg-white/5 text-slate-500'}`}>
            {status}
        </span>
    </div>
);

export default ReportsPage;
