import {
    Settings, User, Shield, Bell, Globe, Cpu, Database,
    Lock, Key, Monitor, Terminal, Save, RotateCcw
} from 'lucide-react';
import { useState } from 'react';

const SettingsPage = () => {
    const [activeTab, setActiveTab] = useState('General');

    const tabs = [
        { id: 'General', icon: Settings },
        { id: 'Identity', icon: User },
        { id: 'Security', icon: Shield },
        { id: 'Alerts', icon: Bell },
        { id: 'API Logic', icon: Cpu },
        { id: 'Networking', icon: Globe },
    ];

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
                        <Settings size={28} />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900">Configuration</h2>
                        <p className="text-sm text-slate-500 mt-1">System core & operational parameters</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button className="p-2.5 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-slate-600 transition-all">
                        <RotateCcw size={18} />
                    </button>
                    <button className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-black transition-all">
                        <Save size={16} /> Save Changes
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                {/* Tab Navigation */}
                <div className="xl:col-span-1 space-y-2">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center justify-between p-4 rounded-xl transition-all ${activeTab === tab.id
                                    ? 'bg-slate-900 text-white shadow-md'
                                    : 'bg-white hover:bg-slate-50 text-slate-500 border border-slate-100 hover:border-slate-200'
                                    }`}>
                                <div className="flex items-center gap-3">
                                    <Icon size={18} className={activeTab === tab.id ? 'text-blue-400' : ''} />
                                    <span className="text-sm font-semibold">{tab.id}</span>
                                </div>
                                {activeTab === tab.id && <div className="w-2 h-2 rounded-full bg-blue-400 animate-status" />}
                            </button>
                        );
                    })}

                    {/* System Info */}
                    <div className="mt-8 p-6 bg-slate-50 rounded-xl border border-slate-100 space-y-4">
                        <div className="flex items-center gap-2 text-xs font-semibold text-blue-600">
                            <Terminal size={14} /> System Runtime
                        </div>
                        <div>
                            <div className="flex justify-between text-xs text-slate-500 mb-2">
                                <span>Memory</span><span>12%</span>
                            </div>
                            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 w-[12%] rounded-full" />
                            </div>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">Node: AQ-CORE-01<br />Uptime: 452:12:08</p>
                    </div>
                </div>

                {/* Config Area */}
                <div className="xl:col-span-3 glass-card p-8 space-y-10">
                    <section className="space-y-6">
                        <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
                            <Monitor size={18} className="text-blue-600" />
                            <h3 className="text-lg font-semibold text-slate-900">Interface Preferences</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <SettingsToggle label="Real-time Sync" description="Keep dashboard synced with edge sensors." defaultChecked />
                            <SettingsToggle label="Biometric Auth" description="Require face-id for sensitive operations." />
                            <SettingsToggle label="Predictive Visuals" description="Show projected risk zones on heatmap." defaultChecked />
                            <SettingsToggle label="Night Mode" description="Automatic high-contrast dark transition." />
                        </div>
                    </section>

                    <section className="space-y-6">
                        <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
                            <Key size={18} className="text-blue-600" />
                            <h3 className="text-lg font-semibold text-slate-900">API & Logic Access</h3>
                        </div>
                        <div className="space-y-3">
                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Primary Endpoint</label>
                            <div className="flex gap-3">
                                <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-5 py-3.5 font-mono text-sm text-slate-500 flex items-center justify-between">
                                    https://api.aquasentinel.ai/v4/compute
                                    <Database size={16} className="opacity-30" />
                                </div>
                                <button className="px-6 py-3.5 bg-white border border-slate-200 text-slate-700 font-semibold text-sm rounded-xl hover:border-blue-200 transition-all">
                                    Rotate Key
                                </button>
                            </div>
                        </div>
                    </section>

                    <section className="space-y-6">
                        <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
                            <Lock size={18} className="text-red-500" />
                            <h3 className="text-lg font-semibold text-red-600">Danger Zone</h3>
                        </div>
                        <div className="p-6 bg-red-50/50 border border-red-100 rounded-xl flex items-center justify-between gap-6">
                            <div>
                                <h4 className="text-sm font-semibold text-red-900 mb-1">Factory Reset</h4>
                                <p className="text-xs text-red-700/60">Revert all training weights and logs to build 0.0.1.</p>
                            </div>
                            <button className="px-6 py-3 bg-red-600 text-white font-semibold text-sm rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-red-600/20 shrink-0">
                                Reset System
                            </button>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

const SettingsToggle = ({ label, description, defaultChecked }) => (
    <div className="flex justify-between gap-4 group">
        <div>
            <h4 className="text-sm font-semibold text-slate-800 group-hover:text-blue-600 transition-colors mb-1">{label}</h4>
            <p className="text-xs text-slate-400">{description}</p>
        </div>
        <div className="relative inline-flex items-center cursor-pointer pt-1">
            <input type="checkbox" className="sr-only peer" defaultChecked={defaultChecked} />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </div>
    </div>
);

export default SettingsPage;
