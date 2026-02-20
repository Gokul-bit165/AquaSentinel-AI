import { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Map as MapIcon,
    BarChart3,
    Settings,
    LogOut,
    Bell,
    Search,
    User,
    Menu,
    X,
    Activity,
    ShieldAlert,
    History,
    FileText,
    Droplets,
    Zap
} from 'lucide-react';

const Layout = ({ children, role = 'user' }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const location = useLocation();
    const navigate = useNavigate();

    const userNavigation = [
        { name: 'Safety Hub', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Risk Analysis', path: '/analysis', icon: Activity },
        { name: 'Historical Data', path: '/history', icon: History },
        { name: 'Reports', path: '/reports', icon: FileText },
        { name: 'Settings', path: '/settings', icon: Settings },
    ];

    const adminNavigation = [
        { name: 'Command Center', path: '/admin', icon: ShieldAlert },
        { name: 'Predictive Analytics', path: '/admin/analytics', icon: BarChart3 },
        { name: 'Network Health', path: '/admin/network', icon: Activity },
        { name: 'Reporting', path: '/admin/reports', icon: FileText },
        { name: 'Settings', path: '/admin/settings', icon: Settings },
    ];

    const navigation = role === 'admin' ? adminNavigation : userNavigation;

    const handleLogout = () => {
        // Clear auth state here
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-[var(--bg-secondary)] flex text-[var(--text-primary)] font-outfit">
            {/* Sidebar for Platform User (Image 3 style) */}
            {role === 'user' && (
                <aside
                    className={`${isSidebarOpen ? 'w-72' : 'w-24'
                        } bg-[#0F172A] transition-all duration-300 flex flex-col fixed h-full z-50 shadow-2xl text-white`}
                >
                    <div className="p-8 flex items-center gap-4 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-blue-500/20">
                            <Droplets size={24} />
                        </div>
                        {isSidebarOpen && (
                            <div className="overflow-hidden whitespace-nowrap">
                                <h1 className="font-extrabold text-lg tracking-tight text-white">AquaSentinel</h1>
                                <p className="text-[9px] text-blue-400 uppercase font-black tracking-[0.2em] leading-none mt-1">AI OPERATIONAL COMMAND</p>
                            </div>
                        )}
                    </div>

                    <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
                        {navigation.map((item) => {
                            const isActive = location.pathname === item.path;
                            const Icon = item.icon;

                            return (
                                <NavLink
                                    key={item.name}
                                    to={item.path}
                                    className={`flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-300 group relative ${isActive
                                        ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-lg'
                                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    <Icon size={22} className={isActive ? 'text-blue-500' : 'group-hover:scale-110 transition-transform'} />
                                    {isSidebarOpen && <span className="font-bold text-[13px] uppercase tracking-wide">{item.name}</span>}
                                </NavLink>
                            );
                        })}
                    </nav>

                    <div className="p-6">
                        <button
                            onClick={() => navigate('/analysis')}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black text-[11px] uppercase tracking-widest py-4 rounded-xl shadow-xl shadow-blue-600/30 transition-all flex items-center justify-center gap-3 active:scale-95"
                        >
                            <Zap size={18} /> Run AI Analysis
                        </button>
                    </div>
                </aside>
            )}

            {/* Main Content Area */}
            <div className={`flex-1 flex flex-col transition-all duration-300 ${role === 'user' ? (isSidebarOpen ? 'ml-72' : 'ml-24') : 'ml-0'}`}>
                {/* Header / Admin Top Nav (Image 4 style) */}
                <header className={`h-22 ${role === 'admin' ? 'bg-[#0F172A] border-b border-white/5 shadow-2xl relative z-50' : 'bg-white/80 backdrop-blur-md border-b border-slate-100'} sticky top-0 px-10 flex items-center justify-between`}>
                    <div className="flex items-center gap-12">
                        {role === 'admin' ? (
                            <div className="flex items-center gap-8">
                                <div className="flex items-center gap-3 py-2">
                                    <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                                        <Droplets size={22} />
                                    </div>
                                    <h1 className="font-black text-white text-base tracking-tighter uppercase whitespace-nowrap">AquaSentinel AI</h1>
                                </div>
                                <nav className="flex items-center gap-8 ml-8">
                                    {navigation.map(item => (
                                        <NavLink
                                            key={item.name}
                                            to={item.path}
                                            className={({ isActive }) =>
                                                `text-[11px] font-black uppercase tracking-widest transition-all ${isActive ? 'text-blue-500 border-b-2 border-blue-600 pb-1' : 'text-slate-400 hover:text-white'}`
                                            }
                                        >
                                            {item.name}
                                        </NavLink>
                                    ))}
                                </nav>
                            </div>
                        ) : (
                            <div className="flex items-center gap-6">
                                <button
                                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                    className="p-2.5 hover:bg-slate-100 rounded-xl transition-all"
                                >
                                    {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
                                </button>
                                <div className="relative w-[500px]">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Search zone metrics, regional reports, or historical data..."
                                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl text-[13px] focus:ring-2 focus:ring-blue-500/10 transition-all outline-none font-medium"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-5">
                        <button className={`p-3 rounded-xl relative transition-all ${role === 'admin' ? 'bg-white/5 text-slate-400 hover:text-white' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}>
                            <Bell size={20} />
                            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-600 rounded-full border-2 border-white animate-status"></span>
                        </button>
                        <div className="h-8 w-[1px] bg-slate-100 mx-2 opacity-10"></div>
                        <div className="flex items-center gap-4 group cursor-pointer p-1.5 rounded-2xl transition-all">
                            <div className={`text-right hidden xl:block ${role === 'admin' ? 'text-white' : 'text-slate-900'}`}>
                                <p className="text-[13px] font-black leading-none">{role === 'admin' ? 'Admin Commander' : 'Cmdr. Sarah Chen'}</p>
                                <p className={`text-[10px] mt-1.5 font-black uppercase tracking-widest opacity-60 ${role === 'admin' ? 'text-blue-400' : 'text-slate-500'}`}>{role === 'admin' ? 'OPERATIONAL LEAD' : 'Health Officer'}</p>
                            </div>
                            <div className={`w-11 h-11 rounded-full border-2 overflow-hidden flex items-center justify-center bg-slate-200 ${role === 'admin' ? 'border-white/10' : 'border-slate-100 shadow-sm'}`}>
                                <User size={24} className={role === 'admin' ? 'text-slate-600' : 'text-slate-400'} />
                            </div>
                        </div>
                    </div>
                </header>

                <main className="p-10">
                    {children}
                </main>
            </div>
        </div>
    );
};
