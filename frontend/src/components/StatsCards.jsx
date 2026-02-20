import { useEffect, useState, useRef } from 'react';
import { Activity, ShieldAlert, Zap, Target } from 'lucide-react';

// Animated counter hook
function useAnimatedCount(target, duration = 1200) {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    useEffect(() => {
        const step = (ts) => {
            if (!ref.current) ref.current = ts;
            const progress = Math.min((ts - ref.current) / duration, 1);
            setCount(Math.floor(progress * target));
            if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    }, [target, duration]);
    return count;
}

export default function StatsCards({ stats }) {
    if (!stats) return null;

    const cards = [
        {
            label: 'Total Predictions',
            value: stats.total,
            icon: Activity,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
            border: 'border-l-blue-500'
        },
        {
            label: 'High-Risk Alerts',
            value: stats.highRisk,
            icon: ShieldAlert,
            color: 'text-red-600',
            bg: 'bg-red-50',
            border: 'border-l-red-500'
        },
        {
            label: 'Active Commands',
            value: stats.activeAlerts,
            icon: Zap,
            color: 'text-amber-600',
            bg: 'bg-amber-50',
            border: 'border-l-amber-500'
        },
        {
            label: 'Avg Accuracy',
            value: Math.round(stats.avgConfidence * 100),
            unit: '%',
            icon: Target,
            color: 'text-teal-600',
            bg: 'bg-teal-50',
            border: 'border-l-teal-500'
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {cards.map((card, i) => (
                <StatCard key={i} {...card} />
            ))}
        </div>
    );
}

const StatCard = ({ label, value, unit = '', icon, color, bg, border }) => {
    const animatedValue = useAnimatedCount(value);
    const Icon = icon;

    return (
        <div className={`glass-card p-6 border-l-4 ${border} group relative overflow-hidden transition-all hover:translate-y-[-2px]`}>
            <div className="flex justify-between items-start mb-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-outfit">{label}</p>
                <div className={`p-2 rounded-xl transition-all ${bg} ${color}`}>
                    <Icon size={18} className="group-hover:scale-110 transition-transform" />
                </div>
            </div>
            <div className="flex items-baseline gap-1">
                <h4 className="text-3xl font-bold tracking-tight text-[var(--text-primary)] font-outfit">
                    {animatedValue.toLocaleString()}{unit}
                </h4>
            </div>
            <div className="mt-4 flex items-center gap-2">
                <div className="h-1 flex-1 bg-slate-100 rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full ${color.replace('text', 'bg')}`}
                        style={{ width: '60%', opacity: 0.3 }}
                    />
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Healthy</span>
            </div>
        </div>
    );
}
