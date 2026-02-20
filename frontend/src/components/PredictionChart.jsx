/**
 * PredictionChart — Bar/Pie chart showing risk level distribution.
 * Uses Recharts for beautiful, responsive data visualization.
 */
import {
    PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
    CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

const COLORS = {
    low: '#22c55e',
    medium: '#f59e0b',
    high: '#ef4444',
};

const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-slate-800/95 backdrop-blur-sm border border-slate-700 rounded-lg px-4 py-2 shadow-xl">
            <p className="text-white font-medium text-sm capitalize">{payload[0].name}</p>
            <p className="text-slate-300 text-xs">{payload[0].value} predictions</p>
        </div>
    );
};

export default function PredictionChart({ predictions = [] }) {
    // Count by risk level
    const riskCounts = predictions.reduce(
        (acc, p) => {
            const level = p.risk_level?.toLowerCase() || 'low';
            acc[level] = (acc[level] || 0) + 1;
            return acc;
        },
        { low: 0, medium: 0, high: 0 }
    );

    const pieData = [
        { name: 'Low Risk', value: riskCounts.low },
        { name: 'Medium Risk', value: riskCounts.medium },
        { name: 'High Risk', value: riskCounts.high },
    ];

    const barData = [
        { name: 'Low', count: riskCounts.low, fill: COLORS.low },
        { name: 'Medium', count: riskCounts.medium, fill: COLORS.medium },
        { name: 'High', count: riskCounts.high, fill: COLORS.high },
    ];

    if (predictions.length === 0) {
        return (
            <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <span className="text-xl">📈</span> Risk Distribution
                </h3>
                <div className="flex items-center justify-center py-16 text-slate-500">
                    <p className="text-sm">No predictions yet — submit data to see charts</p>
                </div>
            </div>
        );
    }

    return (
        <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                <span className="text-xl">📈</span> Risk Distribution
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pie Chart */}
                <div>
                    <p className="text-xs text-slate-400 mb-3 text-center uppercase tracking-wider">
                        Breakdown
                    </p>
                    <ResponsiveContainer width="100%" height={240}>
                        <PieChart>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                innerRadius={55}
                                outerRadius={90}
                                paddingAngle={4}
                                dataKey="value"
                                stroke="none"
                            >
                                {pieData.map((entry, index) => (
                                    <Cell
                                        key={index}
                                        fill={Object.values(COLORS)[index]}
                                        style={{ filter: 'drop-shadow(0 0 6px rgba(0,0,0,0.3))' }}
                                    />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend
                                wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Bar Chart */}
                <div>
                    <p className="text-xs text-slate-400 mb-3 text-center uppercase tracking-wider">
                        Count by Level
                    </p>
                    <ResponsiveContainer width="100%" height={240}>
                        <BarChart data={barData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
                            <XAxis
                                dataKey="name"
                                tick={{ fill: '#94a3b8', fontSize: 12 }}
                                axisLine={{ stroke: 'rgba(148,163,184,0.2)' }}
                            />
                            <YAxis
                                tick={{ fill: '#94a3b8', fontSize: 12 }}
                                axisLine={{ stroke: 'rgba(148,163,184,0.2)' }}
                                allowDecimals={false}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                                {barData.map((entry, index) => (
                                    <Cell key={index} fill={entry.fill} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
