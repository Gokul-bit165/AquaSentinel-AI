import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ShieldAlert,
    ArrowRight,
    Mail,
    Lock,
    Chrome,
    ShieldCheck,
    TrendingUp,
    ExternalLink,
    ChevronRight,
    Activity,
    History
} from 'lucide-react';

const Login = () => {
    const [role, setRole] = useState('user');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSignIn = (e) => {
        e.preventDefault();
        setLoading(true);
        // Simulate auth
        setTimeout(() => {
            navigate(role === 'admin' ? '/admin' : '/dashboard');
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-[var(--bg-secondary)] flex flex-col font-outfit">
            {/* Top Header */}
            <header className="p-8 flex justify-between items-center max-w-7xl mx-auto w-full">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[var(--accent-primary)] flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                        <ShieldAlert size={24} />
                    </div>
                    <div>
                        <h1 className="font-bold text-xl leading-none">AquaSentinel AI</h1>
                        <p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-widest font-bold mt-1">Secure Command Portal</p>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-status"></span>
                        <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">Live System Active</span>
                    </div>
                    <button className="text-[13px] font-medium text-[var(--text-secondary)] hover:text-blue-600 transition-colors">Documentation</button>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex items-center justify-center p-8">
                <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">

                    {/* Left Side: Value Prop */}
                    <div className="space-y-12">
                        <div className="space-y-6">
                            <h2 className="text-7xl font-extrabold tracking-tight leading-[1.1] text-[var(--text-primary)]">
                                Predicting Safety, <br />
                                <span className="text-[var(--accent-primary)]">Protecting <br />Communities.</span>
                            </h2>
                            <p className="text-lg text-[var(--text-secondary)] leading-relaxed max-w-md font-medium opacity-80">
                                The enterprise-standard for waterborne disease forecasting and operational response command.
                            </p>
                        </div>

                        {/* AI Insights Card - High Fidelity Matching Image 1 */}
                        <div className="bg-white rounded-[32px] p-10 border border-[var(--border-subtle)] shadow-2xl shadow-blue-500/5 relative overflow-hidden group border-l-[6px] border-l-blue-600">
                            <div className="absolute top-8 right-8">
                                <span className="text-[10px] font-black bg-blue-50 text-blue-600 px-3 py-1 rounded-full uppercase tracking-tighter outline outline-1 outline-blue-100">
                                    VERIFIED V2.1
                                </span>
                            </div>

                            <div className="flex items-center gap-2.5 text-[var(--text-tertiary)] mb-8">
                                <Activity size={18} className="text-blue-500" />
                                <span className="text-[11px] uppercase font-black tracking-[0.2em]">AI Insights Panel</span>
                            </div>

                            <div className="flex items-baseline gap-4 mb-12">
                                <span className="text-8xl font-black tracking-tighter text-[var(--text-primary)] leading-none">94.2%</span>
                                <div>
                                    <p className="font-black text-[var(--text-primary)] text-base">Current Accuracy</p>
                                    <p className="text-[var(--text-tertiary)] text-[11px] font-bold">Real-time Model Validation</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-12 border-t border-slate-100 pt-10">
                                <div>
                                    <p className="text-[var(--text-tertiary)] text-[10px] uppercase font-black tracking-[0.2em] mb-2">Last Retrained</p>
                                    <p className="font-black text-sm text-[var(--text-secondary)]">Oct 24, 2023</p>
                                </div>
                                <div>
                                    <p className="text-[var(--text-tertiary)] text-[10px] uppercase font-black tracking-[0.2em] mb-2">Transparency</p>
                                    <button className="flex items-center gap-2 font-black text-sm text-blue-600 hover:text-blue-700 transition-colors">
                                        Audit Logs <ExternalLink size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Micro Icons */}
                        <div className="flex items-center gap-6 opacity-30">
                            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 group-hover:scale-110 transition-transform"><ShieldCheck size={20} /></div>
                            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 group-hover:scale-110 transition-transform"><Activity size={20} /></div>
                            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 group-hover:scale-110 transition-transform"><History size={20} /></div>
                        </div>
                    </div>

                    {/* Right Side: Login Form */}
                    <div className="flex justify-center lg:justify-end">
                        <div className="bg-white p-10 rounded-[40px] border border-[var(--border-subtle)] shadow-2xl w-full max-w-md relative">
                            <div className="space-y-2 mb-10">
                                <h3 className="text-3xl font-bold text-[var(--text-primary)]">Secure Login</h3>
                                <p className="text-sm text-[var(--text-secondary)]">Enter your credentials to access the command portal.</p>
                            </div>

                            {/* Role Toggle */}
                            <div className="p-1.5 bg-[var(--bg-tertiary)] rounded-2xl flex gap-1 mb-8">
                                <button
                                    onClick={() => setRole('user')}
                                    className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all ${role === 'user'
                                        ? 'bg-white shadow-lg text-blue-600'
                                        : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
                                        }`}
                                >
                                    Platform User
                                </button>
                                <button
                                    onClick={() => setRole('admin')}
                                    className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all ${role === 'admin'
                                        ? 'bg-white shadow-lg text-blue-600'
                                        : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
                                        }`}
                                >
                                    System Administrator
                                </button>
                            </div>

                            <form onSubmit={handleSignIn} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest pl-1">Email Address</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] group-focus-within:text-blue-500 transition-colors" size={18} />
                                        <input
                                            type="email"
                                            placeholder="name@organization.com"
                                            className="w-full bg-[var(--bg-tertiary)] border-2 border-transparent focus:border-blue-500/20 focus:bg-white rounded-2xl py-4 pl-12 pr-4 text-sm font-medium transition-all outline-none"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between items-center px-1">
                                        <label className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest">Password</label>
                                        <button type="button" className="text-[10px] font-bold text-blue-600 hover:underline">Forgot Password?</button>
                                    </div>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] group-focus-within:text-blue-500 transition-colors" size={18} />
                                        <input
                                            type="password"
                                            placeholder="••••••••"
                                            className="w-full bg-[var(--bg-tertiary)] border-2 border-transparent focus:border-blue-500/20 focus:bg-white rounded-2xl py-4 pl-12 pr-4 text-sm font-medium transition-all outline-none"
                                            required
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-xl shadow-blue-600/20 transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed group"
                                >
                                    {loading ? (
                                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        <>
                                            Sign In to Portal
                                            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </button>
                            </form>

                            <div className="relative my-10">
                                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-100"></span></div>
                                <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest text-[var(--text-tertiary)]">
                                    <span className="bg-white px-4">Or continue with</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <button className="flex items-center justify-center gap-3 border-2 border-slate-100 hover:border-slate-200 py-3 rounded-2xl transition-all">
                                    <Chrome size={18} />
                                    <span className="text-xs font-bold text-[var(--text-secondary)]">Google</span>
                                </button>
                                <button className="flex items-center justify-center gap-3 border-2 border-slate-100 hover:border-slate-200 py-3 rounded-2xl transition-all">
                                    <ShieldCheck size={18} />
                                    <span className="text-xs font-bold text-[var(--text-secondary)]">Azure</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="p-8 mt-auto border-t border-slate-100">
                <div className="max-w-7xl mx-auto w-full flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2 text-[var(--text-tertiary)] text-[11px] font-medium">
                        <ShieldCheck size={14} className="text-green-500" />
                        Enterprise-Grade Security Enabled & AES-256 Encryption
                    </div>

                    <div className="flex items-center gap-8">
                        <button className="text-[11px] font-bold text-[var(--text-tertiary)] hover:text-blue-600 transition-colors uppercase tracking-widest">Privacy Policy</button>
                        <button className="text-[11px] font-bold text-[var(--text-tertiary)] hover:text-blue-600 transition-colors uppercase tracking-widest">Terms of Service</button>
                        <button className="text-[11px] font-bold text-[var(--text-tertiary)] hover:text-blue-600 transition-colors uppercase tracking-widest">Contact Support</button>
                    </div>

                    <div className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest">
                        © 2026 AquaSentinel AI. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Login;
