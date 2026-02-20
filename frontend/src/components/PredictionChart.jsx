import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload?.length) {
        return (
            <div className="bg-white border border-slate-200 shadow-lg rounded-xl p-4 min-w-[160px]">
                <p className="text-xs font-semibold text-slate-500 mb-1.5">{label}</p>
                <p className="text-sm font-bold text-slate-900">
                    Risk Score: <span className="text-blue-600">{payload[0].value?.toFixed(2)}</span>
                </p>
            </div>
        );
    }
    return null;
};

export default function PredictionChart({ predictions = [] }) {
    const chartData = predictions.slice(-20).map((p, i) => ({
        name: p.ward_name || `Zone ${i + 1}`,
        score: p.confidence || 0,
    }));

    if (chartData.length === 0) {
        return (
            <div className="glass-card p-6">
                <h3 className="text-base font-semibold text-slate-800 mb-5">📈 Prediction Trend</h3>
                <div className="h-[240px] flex items-center justify-center text-slate-400 text-sm">
                    No prediction data available
                </div>
            </div>
        );
    }

    return (
        <div className="glass-card p-6">
            <h3 className="text-base font-semibold text-slate-800 mb-5">📈 Prediction Trend</h3>
            <div style={{ width: '100%', height: 260 }}>
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                    <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                        <defs>
                            <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.15} />
                                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                        <XAxis dataKey="name" tick={{ fill: '#94A3B8', fontSize: 12, fontWeight: 500 }} tickLine={false} axisLine={{ stroke: '#E2E8F0' }} />
                        <YAxis tick={{ fill: '#94A3B8', fontSize: 12, fontWeight: 500 }} tickLine={false} axisLine={false} domain={[0, 1]} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area type="monotone" dataKey="score" stroke="#3B82F6" strokeWidth={2.5} fill="url(#blueGradient)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
