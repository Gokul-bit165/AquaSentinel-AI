import { AlertCircle, ShieldAlert, Info, CheckCircle2, ChevronRight } from 'lucide-react';

const severityConfig = {
    HIGH: {
        bg: 'bg-red-50',
        border: 'border-red-100',
        text: 'text-red-700',
        badge: 'bg-red-100 text-red-600',
        icon: ShieldAlert,
    },
    MEDIUM: {
        bg: 'bg-amber-50',
        border: 'border-amber-100',
        text: 'text-amber-700',
        badge: 'bg-amber-100 text-amber-600',
        icon: AlertCircle,
    },
    LOW: {
        bg: 'bg-blue-50',
        border: 'border-blue-100',
        text: 'text-blue-700',
        badge: 'bg-blue-100 text-blue-600',
        icon: Info,
    },
};

export default function AlertPanel({ alerts = [] }) {
    return (
        <div className="glass-card flex flex-col h-full overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-2 text-[11px] font-bold text-[var(--text-primary)] uppercase tracking-widest font-outfit">
                    <ShieldAlert size={16} className="text-red-500" />
                    System Alerts
                </div>
                <span className="text-[10px] font-bold bg-white px-2 py-0.5 rounded-full border border-slate-200 text-slate-400">
                    {alerts.length} Active
                </span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-none">
                {alerts.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3">
                        <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-green-500">
                            <CheckCircle2 size={24} />
                        </div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">System Optimal</p>
                        <p className="text-[11px] text-slate-400">No active threats or anomalies detected in the current cycle.</p>
                    </div>
                ) : (
                    alerts.map((alert, i) => (
                        <AlertItem key={i} alert={alert} />
                    ))
                )}
            </div>

            <button className="p-4 border-t border-slate-100 text-[10px] font-bold text-[var(--text-secondary)] hover:text-blue-600 uppercase tracking-widest transition-colors flex items-center justify-center gap-2 group">
                View Full Alert Log
                <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
        </div>
    );
}

function AlertItem({ alert }) {
    const config = severityConfig[alert.severity] || severityConfig.LOW;
    const Icon = config.icon;

    return (
        <div className={`p-4 rounded-xl border ${config.border} ${config.bg} group cursor-pointer transition-all hover:translate-y-1`}>
            <div className="flex justify-between items-start mb-2">
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest ${config.badge}`}>
                    {alert.severity} Risk
                </span>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                    {alert.timestamp || 'Just now'}
                </span>
            </div>
            <div className="flex gap-3">
                <div className={`mt-1 ${config.text}`}>
                    <Icon size={16} />
                </div>
                <div>
                    <h5 className={`font-bold text-sm leading-tight mb-1 ${config.text}`}>{alert.message}</h5>
                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">{alert.location || 'Coimbatore Region'}</p>
                </div>
            </div>
        </div>
    );
}
