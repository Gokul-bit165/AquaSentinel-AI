import { useEffect, useState } from 'react';
import { Activity, ShieldAlert, Zap, Target, TrendingUp, TrendingDown } from 'lucide-react';

function useAnimatedCount(target, duration = 1200) {
    const [count, setCount] = useState(0);
    const targetValue = Number(target) || 0;

    useEffect(() => {
        let startTime = null;
        let animationFrame = null;
        const animate = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            const easeProgress = 1 - Math.pow(1 - progress, 4);
            setCount(Math.floor(easeProgress * targetValue));
            if (progress < 1) animationFrame = requestAnimationFrame(animate);
        };
        animationFrame = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationFrame);
    }, [targetValue, duration]);

    return count;
}

export default function StatsCards({ stats }) {
    const data = stats || { total: 0, highRisk: 0, activeAlerts: 0, avgConfidence: 0 };

    const cards = [
        {
            label: 'Total Predictions',
            value: data.total,
            icon: Activity,
            accent: 'bg-blue-50 text-blue-600 border-blue-100',
            trend: '+12.5%',
            up: true,
        },
        {
            label: 'High-Risk Alerts',
            value: data.highRisk,
            icon: ShieldAlert,
            accent: 'bg-red-50 text-red-600 border-red-100',
            trend: 'Critical',
            up: true,
        },
        {
            label: 'Active Commands',
            value: data.activeAlerts,
            icon: Zap,
            accent: 'bg-amber-50 text-amber-600 border-amber-100',
            trend: 'Active',
            up: null,
        },
        {
            label: 'Avg Accuracy',
            value: Math.round((Number(data.avgConfidence) || 0) * 100),
            unit: '%',
            icon: Target,
            accent: 'bg-teal-50 text-teal-600 border-teal-100',
            trend: 'Stable',
            up: false,
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {cards.map((card, i) => (
                <StatCard key={i} {...card} />
            ))}
        </div>
    );
}

const StatCard = ({ label, value, unit = '', icon, accent, trend, up }) => {
    const animatedValue = useAnimatedCount(value);
    const Icon = icon;

    return (
        <div className="glass-card p-6 group hover:-translate-y-1 transition-all duration-300">
            <div className="flex justify-between items-start mb-5">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
                <div className={`p-3 rounded-xl border ${accent} transition-transform group-hover:scale-110`}>
                    <Icon size={20} />
                </div>
            </div>

            <div className="flex items-baseline gap-1.5 mb-3">
                <h4 className="text-4xl font-bold tracking-tight text-slate-900">
                    {animatedValue.toLocaleString()}{unit}
                </h4>
            </div>

            <div className="flex items-center gap-2">
                {up === true && <TrendingUp size={14} className="text-green-500" />}
                {up === false && <TrendingDown size={14} className="text-blue-500" />}
                <span className={`text-xs font-semibold ${up === true ? 'text-green-600' : up === false ? 'text-blue-600' : 'text-amber-600'}`}>
                    {trend}
                </span>
                <span className="text-xs text-slate-300">vs last cycle</span>
            </div>
        </div>
    );
};
