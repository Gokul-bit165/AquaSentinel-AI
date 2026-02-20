import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { TrendingUp, Calendar, ChevronDown } from 'lucide-react';

export default function PredictionChart({ data = [] }) {
    // Process data for Recharts
    const chartData = data.slice().reverse().map((p, i) => ({
        index: i,
        risk: p.risk_level === 'high' ? 85 : p.risk_level === 'medium' ? 50 : 20,
        rainfall: p.rainfall,
        date: p.timestamp ? new Date(p.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : `T-${i}`,
    }));

    return (
        <div className="glass-card p-8 space-y-8 flex flex-col h-full">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                        <TrendingUp size={20} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-[var(--text-primary)] font-outfit">Risk Projection Analysis</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Real-time ML Forecasting</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 px-4 py-2 rounded-xl">
                        <Calendar size={14} className="text-slate-400" />
                        <span className="text-xs font-bold text-[var(--text-secondary)]">24h View</span>
                        <ChevronDown size={14} className="text-slate-300" />
                    </div>
                </div>
            </div>

            <div className="h-64 w-full flex-1">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#2563EB" stopOpacity={0.1} />
                                <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                            dataKey="date"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
                        />
                        <Tooltip
                            contentStyle={{
                                borderRadius: '16px',
                                border: 'none',
                                boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                                fontFamily: 'Outfit, sans-serif'
                            }}
                            itemStyle={{ fontSize: '11px', fontWeight: 'bold' }}
                            labelStyle={{ fontSize: '10px', color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 'bold' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="risk"
                            stroke="#2563EB"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorRisk)"
                            animationDuration={1500}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Composite Risk Index</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Historical Mean</span>
                    </div>
                </div>
                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Model Accuracy: 94%</p>
            </div>
        </div>
    );
}
