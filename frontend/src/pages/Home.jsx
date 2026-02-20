/**
 * Home Page — Main landing page with header, dashboard, and footer.
 */
import Dashboard from '../components/Dashboard';

export default function Home() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0a0f1e] via-[#0f172a] to-[#0a0f1e]">
            {/* Header */}
            <header className="border-b border-white/5 bg-black/20 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-teal-500 
                            flex items-center justify-center text-white font-bold text-lg
                            shadow-lg shadow-cyan-500/30 animate-pulse-glow">
                                💧
                            </div>
                            <div>
                                <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">
                                    AquaSentinel AI
                                </h1>
                                <p className="text-xs text-slate-500 -mt-0.5">
                                    Waterborne Disease Outbreak Prediction
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <span className="hidden sm:flex items-center gap-2 text-xs text-slate-400 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                System Online
                            </span>
                            <span className="text-xs text-slate-500 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                                v1.0.0
                            </span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Dashboard />
            </main>

            {/* Footer */}
            <footer className="border-t border-white/5 py-6 mt-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <p className="text-center text-xs text-slate-600">
                        🌊 AquaSentinel AI — AI-Powered Waterborne Disease Prevention
                        <span className="mx-2">•</span>
                        Built for Hackathon 2026
                    </p>
                </div>
            </footer>
        </div>
    );
}
