/**
 * AlertPanel — Scrollable list of active alerts with severity badges.
 * Displays auto-generated alerts from high-risk predictions.
 */

const severityConfig = {
    HIGH: {
        bg: 'bg-red-500/10',
        border: 'border-red-500/30',
        badge: 'bg-red-500/20 text-red-400',
        dot: 'bg-red-500',
        icon: '🚨',
    },
    MEDIUM: {
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/30',
        badge: 'bg-amber-500/20 text-amber-400',
        dot: 'bg-amber-500',
        icon: '⚠️',
    },
    LOW: {
        bg: 'bg-green-500/10',
        border: 'border-green-500/30',
        badge: 'bg-green-500/20 text-green-400',
        dot: 'bg-green-500',
        icon: '✅',
    },
};

export default function AlertPanel({ alerts = [] }) {
    if (alerts.length === 0) {
        return (
            <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <span className="text-xl">🔔</span> Alert Center
                </h3>
                <div className="flex flex-col items-center justify-center py-10 text-slate-500">
                    <span className="text-4xl mb-3">✅</span>
                    <p className="text-sm">No active alerts</p>
                    <p className="text-xs text-slate-600 mt-1">All systems operational</p>
                </div>
            </div>
        );
    }

    return (
        <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <span className="text-xl">🔔</span> Alert Center
                </h3>
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-red-500/20 text-red-400 animate-pulse">
                    {alerts.length} Active
                </span>
            </div>

            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                {alerts.map((alert) => {
                    const config = severityConfig[alert.severity] || severityConfig.HIGH;
                    return (
                        <div
                            key={alert.id}
                            className={`p-4 rounded-xl border ${config.bg} ${config.border} 
                         transition-all duration-300 hover:scale-[1.01]`}
                        >
                            <div className="flex items-start gap-3">
                                <span className="text-lg mt-0.5">{config.icon}</span>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${config.badge}`}>
                                            {alert.severity}
                                        </span>
                                        <span className="text-xs text-slate-500">
                                            {new Date(alert.created_at).toLocaleString()}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-300 leading-relaxed">
                                        {alert.message}
                                    </p>
                                </div>
                                <div className={`w-2 h-2 rounded-full ${config.dot} animate-pulse mt-2`} />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
