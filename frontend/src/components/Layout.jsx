import { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard, BarChart3, Settings, LogOut, Search, User, MapPin,
    Menu, X, Activity, ShieldAlert, History, FileText, Droplets,
    Globe, Bell, MessageSquare
} from 'lucide-react';

const Layout = ({ children, role = 'user' }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const location = useLocation();
    const navigate = useNavigate();
    const storedUser = localStorage.getItem('aquasentinel_user') || '';
    const displayName = storedUser ? storedUser.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : (role === 'admin' ? 'Admin Commander' : 'Operator');

    const userNavigation = [
        { name: 'Safety Hub', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Risk Analysis', path: '/analysis', icon: Activity },
        { name: 'Historical Data', path: '/history', icon: History },
        { name: 'Reports', path: '/reports', icon: FileText },
        { name: 'Risk Map', path: '/map', icon: MapPin },
    ];

    const adminNavigation = [
        { name: 'Command Center', path: '/admin', icon: ShieldAlert },
        { name: 'Predictive Analytics', path: '/admin/analytics', icon: BarChart3 },
        { name: 'Network Health', path: '/admin/network', icon: Globe },
        { name: 'Enterprise Reports', path: '/admin/reports', icon: FileText },
        { name: 'Risk Map', path: '/admin/map', icon: MapPin },
    ];

    const navigation = role === 'admin' ? adminNavigation : userNavigation;

    return (
        <div className="min-h-screen bg-[var(--bg-secondary)] flex">
            {/* Sidebar */}
            <aside
                className={`${isSidebarOpen ? 'w-[270px]' : 'w-[80px]'
                    } bg-[var(--bg-sidebar)] transition-all duration-300 flex flex-col fixed h-full z-50`}
            >
                {/* Brand */}
                <div className="px-6 py-6 flex items-center gap-3.5 border-b border-white/5">
                    <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-blue-600/20">
                        <Droplets size={22} fill="currentColor" fillOpacity={0.2} />
                    </div>
                    {isSidebarOpen && (
                        <div>
                            <h1 className="font-bold text-[17px] text-white font-outfit leading-none tracking-tight">AquaSentinel</h1>
                            <p className="text-[10px] text-blue-400/70 uppercase font-semibold tracking-[0.15em] mt-1">AI Operational Command</p>
                        </div>
                    )}
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 py-5 space-y-1.5 overflow-y-auto scrollbar-none">
                    {navigation.map((item) => {
                        const isActive = location.pathname === item.path;
                        const Icon = item.icon;
                        return (
                            <NavLink
                                key={item.name}
                                to={item.path}
                                className={`flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <Icon size={20} strokeWidth={isActive ? 2 : 1.5} />
                                {isSidebarOpen && <span className="text-[14px] font-medium">{item.name}</span>}
                            </NavLink>
                        );
                    })}
                </nav>

                {/* Settings & Logout */}
                <div className="px-4 pb-5 space-y-1.5 border-t border-white/5 pt-5">
                    <NavLink
                        to={role === 'admin' ? "/admin/settings" : "/settings"}
                        className={({ isActive }) => `flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-200 ${isActive ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                    >
                        <Settings size={20} />
                        {isSidebarOpen && <span className="text-[14px] font-medium">Settings</span>}
                    </NavLink>
                    <button
                        onClick={() => navigate('/login')}
                        className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-400/5 transition-all"
                    >
                        <LogOut size={20} />
                        {isSidebarOpen && <span className="text-[14px] font-medium">Sign Out</span>}
                    </button>
                </div>
            </aside>

            {/* Content */}
            <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'ml-[270px]' : 'ml-[80px]'}`}>
                {/* Top Bar */}
                <header className="h-[68px] bg-white border-b border-[var(--border-subtle)] sticky top-0 z-40 px-8 flex items-center justify-between">
                    <div className="flex items-center gap-5">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-100 transition-colors text-slate-500"
                        >
                            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>

                        <div className="relative hidden lg:block">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type="text"
                                placeholder="Search zone metrics..."
                                className="w-80 pl-11 pr-5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm transition-all outline-none focus:border-blue-400 focus:bg-white placeholder:text-slate-400"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-100 transition-colors text-slate-400 relative">
                            <Bell size={20} />
                            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
                        </button>
                        <button className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-100 transition-colors text-slate-400">
                            <MessageSquare size={20} />
                        </button>

                        <div className="h-7 w-px bg-slate-200 mx-1" />

                        <div className="flex items-center gap-3.5">
                            <div className="text-right hidden xl:block">
                                <p className="text-sm font-semibold text-slate-800 leading-none">
                                    {displayName}
                                </p>
                                <p className="text-xs text-slate-400 mt-1">
                                    {role === 'admin' ? 'Operational Lead' : 'Health Officer'}
                                </p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center border-2 border-white shadow-sm">
                                <User size={18} className="text-slate-400" />
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-8 w-full">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;

