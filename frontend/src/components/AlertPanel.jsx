import { AlertCircle, ShieldAlert, Info, CheckCircle2, ChevronRight } from 'lucide-react';

const severityConfig = {
    CRITICAL: { bg: 'bg-red-50', border: 'border-l-red-500', text: 'text-red-700', badge: 'bg-red-100 text-red-600', icon: ShieldAlert },
    HIGH: { bg: 'bg-red-50', border: 'border-l-red-500', text: 'text-red-700', badge: 'bg-red-100 text-red-600', icon: ShieldAlert },
    WARNING: { bg: 'bg-amber-50', border: 'border-l-amber-500', text: 'text-amber-700', badge: 'bg-amber-100 text-amber-600', icon: AlertCircle },
    MEDIUM: { bg: 'bg-amber-50', border: 'border-l-amber-500', text: 'text-amber-700', badge: 'bg-amber-100 text-amber-600', icon: AlertCircle },
    INFO: { bg: 'bg-blue-50', border: 'border-l-blue-500', text: 'text-blue-700', badge: 'bg-blue-100 text-blue-600', icon: Info },
    LOW: { bg: 'bg-blue-50', border: 'border-l-blue-500', text: 'text-blue-700', badge: 'bg-blue-100 text-blue-600', icon: Info },
};

export default function AlertPanel({ alerts = [] }) {
    return (
        <div className="glass-card flex flex-col h-full overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <ShieldAlert size={18} className="text-red-500" />
                    <span className="text-base font-semibold text-slate-800">System Alerts</span>
                </div>
                <span className="text-xs font-semibold bg-slate-100 text-slate-500 px-3 py-1.5 rounded-full">
                    {alerts.length} Active
                </span>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-3 scrollbar-none">
                {alerts.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-10 space-y-3">
                        <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center text-green-500">
                            <CheckCircle2 size={28} />
                        </div>
                        <p className="text-sm font-semibold text-slate-400">System Optimal</p>
                        <p className="text-xs text-slate-400">No active threats or anomalies detected.</p>
                    </div>
                ) : (
                    alerts.map((alert, i) => <AlertItem key={i} alert={alert} />)
                )}
            </div>

            <button className="px-6 py-4 border-t border-slate-100 text-xs font-semibold text-slate-400 hover:text-blue-600 transition-colors flex items-center justify-center gap-2 group">
                View Full Log
                <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
        </div>
    );
}

function AlertItem({ alert }) {
    const config = severityConfig[alert.severity] || severityConfig.LOW;
    const Icon = config.icon;

    return (
        <div className={`p-5 rounded-xl border border-slate-100 ${config.bg} border-l-4 ${config.border} hover:shadow-sm transition-all`}>
            <div className="flex justify-between items-start mb-2.5">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${config.badge}`}>
                    {alert.severity}
                </span>
                <span className="text-xs font-medium text-slate-400">
                    {alert.timestamp || 'Just now'}
                </span>
            </div>
            <div className="flex gap-3">
                <div className={`mt-0.5 ${config.text}`}>
                    <Icon size={16} />
                </div>
                <div>
                    <h5 className={`font-semibold text-sm leading-tight mb-1 ${config.text}`}>{alert.message}</h5>
                    <p className="text-xs text-slate-500 line-clamp-2">{alert.location || 'Coimbatore Region'}</p>
                </div>
            </div>
        </div>
    );
}
