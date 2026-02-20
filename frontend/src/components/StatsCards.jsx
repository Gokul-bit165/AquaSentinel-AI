/**
 * StatsCards — Summary metric cards for the dashboard.
 * Displays total predictions, high-risk count, active alerts, and average confidence.
 */
import { useEffect, useState, useRef } from 'react';

// Animated counter hook
function useAnimatedCount(target, duration = 1200) {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    useEffect(() => {
        let start = 0;
        const step = (ts) => {
            if (!ref.current) ref.current = ts;
            const progress = Math.min((ts - ref.current) / duration, 1);
            setCount(Math.floor(progress * target));
            if (progress < 1) requestAnimationFrame(step);
        };
        ref.current = null;
        requestAnimationFrame(step);
    }, [target, duration]);
    return count;
}

const cards = [
    {
        key: 'total',
        label: 'Total Predictions',
        icon: '📊',
        gradient: 'from-blue-500/20 to-cyan-500/20',
        border: 'border-blue-500/30',
        textColor: 'text-blue-400',
    },
    {
        key: 'high',
        label: 'High Risk',
        icon: '🚨',
        gradient: 'from-red-500/20 to-orange-500/20',
        border: 'border-red-500/30',
        textColor: 'text-red-400',
    },
    {
        key: 'alerts',
        label: 'Active Alerts',
        icon: '⚠️',
        gradient: 'from-amber-500/20 to-yellow-500/20',
        border: 'border-amber-500/30',
        textColor: 'text-amber-400',
    },
    {
        key: 'confidence',
        label: 'Avg Confidence',
        icon: '🎯',
        gradient: 'from-emerald-500/20 to-teal-500/20',
        border: 'border-emerald-500/30',
        textColor: 'text-emerald-400',
        isPercent: true,
    },
];

export default function StatsCards({ predictions = [], alerts = [] }) {
    const stats = {
        total: predictions.length,
        high: predictions.filter((p) => p.risk_level === 'high').length,
        alerts: alerts.length,
        confidence: predictions.length
            ? Math.round(
                (predictions.reduce((sum, p) => sum + (p.confidence || 0), 0) /
                    predictions.length) *
                100
            )
            : 0,
    };

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map((card) => (
                <StatCard
                    key={card.key}
                    card={card}
                    value={stats[card.key]}
                />
            ))}
        </div>
    );
}

function StatCard({ card, value }) {
    const animatedValue = useAnimatedCount(value);

    return (
        <div
            className={`glass-card p-5 bg-gradient-to-br ${card.gradient} border ${card.border} group cursor-default`}
        >
            <div className="flex items-center justify-between mb-3">
                <span className="text-2xl group-hover:scale-110 transition-transform">
                    {card.icon}
                </span>
                <span
                    className={`text-xs font-medium px-2 py-1 rounded-full bg-white/5 ${card.textColor}`}
                >
                    Live
                </span>
            </div>
            <p className={`text-3xl font-bold ${card.textColor} tracking-tight`}>
                {animatedValue}{card.isPercent ? '%' : ''}
            </p>
            <p className="text-sm text-slate-400 mt-1">{card.label}</p>
        </div>
    );
}
