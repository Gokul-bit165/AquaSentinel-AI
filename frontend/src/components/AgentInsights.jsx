import { useState } from 'react';

export default function AgentInsights({ insights, isLoading }) {
    if (isLoading) {
        return (
            <div className="glass-card p-6 border-cyan-500/20 animate-pulse">
                <div className="h-4 bg-white/10 rounded w-3/4 mb-4"></div>
                <div className="space-y-3">
                    <div className="h-3 bg-white/5 rounded w-full"></div>
                    <div className="h-3 bg-white/5 rounded w-5/6"></div>
                    <div className="h-3 bg-white/5 rounded w-4/6"></div>
                </div>
            </div>
        );
    }

    if (!insights) return null;

    const { prediction, analysis, decision } = insights;

    return (
        <div className="glass-card p-6 border-cyan-500/20 relative overflow-hidden">
            {/* Decorative Gradient Flare */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-cyan-500/10 blur-3xl rounded-full"></div>

            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <span className="text-xl">🤖</span> AI Advisor Insights
            </h3>

            <div className="space-y-6">
                {/* Prediction Agent Summary */}
                <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">🧠</div>
                    <div>
                        <p className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Prediction Agent</p>
                        <p className="text-sm text-slate-300">
                            Validated <span className="text-white font-medium">{prediction.risk_level.toUpperCase()}</span> risk
                            with <span className="text-white font-medium">{(prediction.confidence * 100).toFixed(1)}%</span> confidence.
                        </p>
                    </div>
                </div>

                {/* Analysis Agent (SHAP) */}
                <div className="flex items-start gap-3">
                    <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">🔍</div>
                    <div className="flex-1">
                        <p className="text-xs font-semibold text-purple-400 uppercase tracking-wider">Analysis Agent (Root Cause)</p>
                        <p className="text-sm text-slate-300 mb-2">{analysis.summary}</p>
                        <div className="space-y-1.5">
                            {analysis.full_analysis.slice(0, 3).map((feat, idx) => (
                                <div key={idx} className="flex justify-between items-center text-xs">
                                    <span className="text-slate-400">{feat.feature}</span>
                                    <div className="flex items-center gap-2">
                                        <div className="w-20 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-cyan-500/50"
                                                style={{ width: `${Math.min(feat.absolute_impact * 100, 100)}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Decision Agent (Llama3) */}
                <div className="flex items-start gap-3">
                    <div className="p-2 bg-teal-500/10 rounded-lg text-teal-400">🚨</div>
                    <div>
                        <p className="text-xs font-semibold text-teal-400 uppercase tracking-wider">Decision Agent (Llama3)</p>
                        <p className="text-sm font-medium text-cyan-300 mb-2 italic">"{decision?.public_warning}"</p>
                        <ul className="space-y-2">
                            {decision?.recommendations?.map((rec, i) => (
                                <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                                    <span className="text-cyan-500">•</span> {rec}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
