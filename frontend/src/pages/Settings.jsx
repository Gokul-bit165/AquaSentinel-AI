import { useState, useEffect } from 'react';
import {
    Settings as SettingsIcon, User, Shield, Bell, Code, Globe, ChevronRight, Info, RotateCcw, Save
} from 'lucide-react';

const STORAGE_KEY = 'aquasentinel_settings';

const defaultSettings = {
    darkMode: false,
    compactCards: false,
    autoRefresh: true,
    refreshInterval: '30',
    displayName: 'Cmdr. Sarah Chen',
    region: 'Coimbatore, Tamil Nadu',
    twoFactor: false,
    sessionTimeout: '30',
    emailAlerts: true,
    smsAlerts: false,
    alertThreshold: 'high',
    apiLogging: true,
    rateLimit: true,
    debugMode: false,
    proxyEnabled: false,
    cacheEnabled: true,
};

const SettingsPage = () => {
    const [settings, setSettings] = useState(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
        } catch { return defaultSettings; }
    });
    const [activeTab, setActiveTab] = useState('general');
    const [saved, setSaved] = useState(false);

    // Persist on every change
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    }, [settings]);

    const updateSetting = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
        setSaved(false);
    };

    const handleSave = () => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const handleReset = () => {
        if (window.confirm('Reset all settings to defaults? This cannot be undone.')) {
            setSettings(defaultSettings);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultSettings));
        }
    };

    const tabs = [
        { key: 'general', label: 'General', icon: SettingsIcon },
        { key: 'identity', label: 'Identity', icon: User },
        { key: 'security', label: 'Security', icon: Shield },
        { key: 'alerts', label: 'Alerts', icon: Bell },
        { key: 'api', label: 'API Logic', icon: Code },
        { key: 'networking', label: 'Networking', icon: Globe },
    ];

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-lg">
                        <SettingsIcon size={28} />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900">Configuration</h2>
                        <p className="text-sm text-slate-500 mt-1">System preferences & operational parameters</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={handleSave} className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${saved ? 'bg-green-600 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
                        <Save size={16} /> {saved ? 'Saved ✓' : 'Save Changes'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                {/* Tab Sidebar */}
                <div className="glass-card p-4 h-fit">
                    <div className="space-y-1">
                        {tabs.map(t => {
                            const Icon = t.icon;
                            return (
                                <button key={t.key} onClick={() => setActiveTab(t.key)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === t.key ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}>
                                    <Icon size={18} />
                                    {t.label}
                                    <ChevronRight size={14} className="ml-auto opacity-50" />
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Content */}
                <div className="xl:col-span-3 space-y-6">
                    {activeTab === 'general' && (
                        <Section title="General Preferences">
                            <SettingsToggle label="Dark Mode" desc="Switch to dark interface theme" checked={settings.darkMode} onChange={v => updateSetting('darkMode', v)} />
                            <SettingsToggle label="Compact Cards" desc="Reduce card padding for denser views" checked={settings.compactCards} onChange={v => updateSetting('compactCards', v)} />
                            <SettingsToggle label="Auto-Refresh Data" desc="Automatically refresh dashboard data" checked={settings.autoRefresh} onChange={v => updateSetting('autoRefresh', v)} />
                            <SettingsInput label="Refresh Interval (sec)" value={settings.refreshInterval} onChange={v => updateSetting('refreshInterval', v)} />
                        </Section>
                    )}
                    {activeTab === 'identity' && (
                        <Section title="Operator Identity">
                            <SettingsInput label="Display Name" value={settings.displayName} onChange={v => updateSetting('displayName', v)} />
                            <SettingsInput label="Region / Sector" value={settings.region} onChange={v => updateSetting('region', v)} />
                            <InfoRow label="Role" value={localStorage.getItem('aquasentinel_role') || 'user'} />
                            <InfoRow label="Session ID" value={`SES-${Date.now().toString(36).toUpperCase()}`} />
                        </Section>
                    )}
                    {activeTab === 'security' && (
                        <Section title="Security Controls">
                            <SettingsToggle label="Two-Factor Auth" desc="Require 2FA on every login" checked={settings.twoFactor} onChange={v => updateSetting('twoFactor', v)} />
                            <SettingsInput label="Session Timeout (min)" value={settings.sessionTimeout} onChange={v => updateSetting('sessionTimeout', v)} />
                            <div className="mt-6 p-5 bg-red-50 border border-red-100 rounded-xl">
                                <h4 className="text-sm font-bold text-red-700 mb-2">⚠ Danger Zone</h4>
                                <p className="text-xs text-red-600 mb-4">Reset all settings and cached data. This cannot be undone.</p>
                                <button onClick={handleReset} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700 transition-all">
                                    <RotateCcw size={14} /> Factory Reset
                                </button>
                            </div>
                        </Section>
                    )}
                    {activeTab === 'alerts' && (
                        <Section title="Alert Configuration">
                            <SettingsToggle label="Email Notifications" desc="Receive risk alerts via email" checked={settings.emailAlerts} onChange={v => updateSetting('emailAlerts', v)} />
                            <SettingsToggle label="SMS Alerts" desc="Receive critical SMS notifications" checked={settings.smsAlerts} onChange={v => updateSetting('smsAlerts', v)} />
                            <div>
                                <p className="text-sm font-semibold text-slate-700 mb-2">Alert Threshold</p>
                                <div className="flex gap-2">
                                    {['low', 'medium', 'high', 'critical'].map(level => (
                                        <button key={level} onClick={() => updateSetting('alertThreshold', level)}
                                            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all ${settings.alertThreshold === level ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-400 hover:text-slate-700'}`}>
                                            {level}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </Section>
                    )}
                    {activeTab === 'api' && (
                        <Section title="API & Logic Engine">
                            <SettingsToggle label="API Request Logging" desc="Log all API requests for debugging" checked={settings.apiLogging} onChange={v => updateSetting('apiLogging', v)} />
                            <SettingsToggle label="Rate Limiting" desc="Limit API requests to prevent abuse" checked={settings.rateLimit} onChange={v => updateSetting('rateLimit', v)} />
                            <SettingsToggle label="Debug Mode" desc="Show verbose error stack traces" checked={settings.debugMode} onChange={v => updateSetting('debugMode', v)} />
                            <InfoRow label="API Endpoint" value={import.meta.env.VITE_API_URL || 'http://localhost:8000'} />
                            <InfoRow label="ML Model" value="RandomForest v2.1" />
                            <InfoRow label="LLM Engine" value="Ollama (Llama3)" />
                        </Section>
                    )}
                    {activeTab === 'networking' && (
                        <Section title="Network Configuration">
                            <SettingsToggle label="Proxy Routing" desc="Route requests through proxy server" checked={settings.proxyEnabled} onChange={v => updateSetting('proxyEnabled', v)} />
                            <SettingsToggle label="Response Caching" desc="Cache API responses for performance" checked={settings.cacheEnabled} onChange={v => updateSetting('cacheEnabled', v)} />
                            <InfoRow label="Protocol" value="HTTPS (TLS 1.3)" />
                            <InfoRow label="DNS Resolver" value="Cloudflare (1.1.1.1)" />
                        </Section>
                    )}
                </div>
            </div>
        </div>
    );
};

const Section = ({ title, children }) => (
    <div className="glass-card p-6 space-y-5">
        <h3 className="text-lg font-semibold text-slate-800 pb-4 border-b border-slate-100">{title}</h3>
        {children}
    </div>
);

const SettingsToggle = ({ label, desc, checked, onChange }) => (
    <div className="flex items-center justify-between py-2">
        <div>
            <p className="text-sm font-semibold text-slate-700">{label}</p>
            {desc && <p className="text-xs text-slate-400 mt-0.5">{desc}</p>}
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" checked={checked} onChange={(e) => onChange(e.target.checked)} />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-200 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 transition-colors" />
        </label>
    </div>
);

const SettingsInput = ({ label, value, onChange }) => (
    <div className="py-2">
        <p className="text-sm font-semibold text-slate-700 mb-2">{label}</p>
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)}
            className="w-full max-w-sm px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-400 focus:bg-white transition-all" />
    </div>
);

const InfoRow = ({ label, value }) => (
    <div className="flex items-center justify-between py-2">
        <span className="text-sm font-medium text-slate-500 flex items-center gap-2">
            <Info size={14} className="text-slate-300" /> {label}
        </span>
        <span className="text-sm font-bold text-slate-700 bg-slate-50 px-3 py-1.5 rounded-lg">{value}</span>
    </div>
);

export default SettingsPage;
