import { useState } from 'react';

export default function SimulationPanel({ onSimulate, isLoading }) {
    const [updates, setUpdates] = useState({
        rainfall_multiplier: 1.0,
        contamination_multiplier: 1.0,
    });

    const handleChange = (name, value) => {
        setUpdates(prev => ({ ...prev, [name]: parseFloat(value) }));
    };

    return (
        <div className="glass-card p-6 border-purple-500/20">
            <h3 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
                <span className="text-xl">🔮</span> Digital Twin Simulation
            </h3>

            <div className="space-y-6">
                <div>
                    <div className="flex justify-between mb-2">
                        <label className="text-xs font-medium text-slate-400">Rainfall Impact</label>
                        <span className="text-xs text-cyan-400 font-mono">{(updates.rainfall_multiplier * 100).toFixed(0)}%</span>
                    </div>
                    <input
                        type="range" min="0.5" max="2.5" step="0.1"
                        value={updates.rainfall_multiplier}
                        onChange={(e) => handleChange('rainfall_multiplier', e.target.value)}
                        className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">Simulate heavy monsoon or drought conditions.</p>
                </div>

                <div>
                    <div className="flex justify-between mb-2">
                        <label className="text-xs font-medium text-slate-400">Contamination Surge</label>
                        <span className="text-xs text-purple-400 font-mono">{(updates.contamination_multiplier * 100).toFixed(0)}%</span>
                    </div>
                    <input
                        type="range" min="0.5" max="3.0" step="0.1"
                        value={updates.contamination_multiplier}
                        onChange={(e) => handleChange('contamination_multiplier', e.target.value)}
                        className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">Simulate water source pipe bursts or waste leakage.</p>
                </div>

                <button
                    onClick={() => onSimulate(updates)}
                    disabled={isLoading}
                    className="w-full py-2.5 bg-purple-500/20 border border-purple-500/30 text-purple-300 
                   rounded-xl text-xs font-semibold hover:bg-purple-500/30 transition-all
                   disabled:opacity-50"
                >
                    {isLoading ? 'Simulating Impact...' : '🔮 Run Scenario Insight'}
                </button>
            </div>
        </div>
    );
}
