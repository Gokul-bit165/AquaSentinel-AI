import { MapContainer, TileLayer, CircleMarker, Popup, ZoomControl } from 'react-leaflet';
import { useEffect, useState } from 'react';

// Focus on Coimbatore as per frontend team's update
const COIMBATORE_CENTER = [11.0168, 76.9558];
const DEFAULT_ZOOM = 11;

function generateLocations(predictions, simulation) {
    const baseLat = 11.0168;
    const baseLng = 76.9558;

    const historical = predictions.map((p, i) => ({
        ...p,
        lat: baseLat + (Math.random() - 0.5) * 0.1,
        lng: baseLng + (Math.random() - 0.5) * 0.1,
        cityName: p.location !== 'Unknown' ? p.location : 'Coimbatore Ward',
    }));

    if (simulation) {
        historical.unshift({
            ...simulation,
            lat: baseLat + 0.05, // Mock localized simulation point
            lng: baseLng + 0.05,
            cityName: simulation.location,
            isSimulation: true
        });
    }

    return historical;
}

const riskColors = {
    high: '#ef4444',
    medium: '#f59e0b',
    low: '#22c55e',
};

export default function MapView({ predictions = [], simulation = null, mini = false }) {
    const [locations, setLocations] = useState([]);

    useEffect(() => {
        setLocations(generateLocations(predictions, simulation));
    }, [predictions, simulation]);

    return (
        <div className={`${mini ? '' : 'glass-card p-6 border-white/5 relative overflow-hidden'}`}>
            {!mini && (
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <span className="text-xl">🗺️</span> Spatio-Temporal Heatmap
                    </h3>
                    {simulation && (
                        <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-[10px] font-bold rounded animate-pulse border border-purple-500/30">
                            SIMULATION ACTIVE
                        </span>
                    )}
                </div>
            )}

            <div
                className={`rounded-xl overflow-hidden border ${mini ? 'border-slate-200 bg-slate-50' : 'border-white/10'}`}
                style={{ height: mini ? '100%' : '400px' }}
            >
                <MapContainer
                    center={COIMBATORE_CENTER}
                    zoom={mini ? 10 : DEFAULT_ZOOM}
                    style={{ height: '100%', width: '100%', filter: mini ? '' : 'hue-rotate(-10deg) saturate(1.2)' }}
                    scrollWheelZoom={!mini}
                    zoomControl={false}
                    dragging={!mini}
                >
                    <TileLayer
                        attribution='&copy; CARTO'
                        url={mini ? "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" : "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"}
                    />

                    {!mini && <ZoomControl position="bottomright" />}

                    {locations.map((loc, i) => (
                        <CircleMarker
                            key={`${i}-${loc.isSimulation}`}
                            center={[loc.lat, loc.lng]}
                            radius={mini ? 6 : (loc.risk_level === 'high' ? 18 : loc.risk_level === 'medium' ? 12 : 8)}
                            pathOptions={{
                                color: loc.isSimulation ? '#a855f7' : riskColors[loc.risk_level] || riskColors.low,
                                fillColor: loc.isSimulation ? '#a855f7' : riskColors[loc.risk_level] || riskColors.low,
                                fillOpacity: loc.isSimulation ? 0.8 : 0.5,
                                weight: loc.isSimulation ? 4 : 2,
                                dashArray: loc.isSimulation ? '5, 5' : null,
                                className: !mini && loc.risk_level === 'high' ? 'animate-pulse-glow' : ''
                            }}
                        >
                            <Popup>
                                <div className="text-slate-800 min-w-[200px] p-1 font-sans">
                                    <div className="flex items-center justify-between mb-2">
                                        <strong className="text-sm">📍 {loc.cityName}</strong>
                                        {loc.isSimulation && <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 rounded-full font-bold">DIGITAL TWIN</span>}
                                    </div>
                                    <div className="space-y-1 text-xs">
                                        <div className="flex justify-between">
                                            <span>Risk Level:</span>
                                            <span className="font-bold flex items-center gap-1" style={{ color: riskColors[loc.risk_level] }}>
                                                {loc.risk_level?.toUpperCase()}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-slate-500">
                                            <span>Rainfall:</span>
                                            <span className="font-mono">{loc.rainfall?.toFixed(1)}mm</span>
                                        </div>
                                        {loc.contamination && (
                                            <div className="flex justify-between text-slate-500">
                                                <span>Contamination:</span>
                                                <span className="font-mono">{loc.contamination?.toFixed(2)}</span>
                                            </div>
                                        )}
                                        <div className="mt-2 pt-1 border-t border-slate-200 text-[10px] text-slate-500 italic">
                                            {loc.isSimulation ? "Projected scenario based on current simulation parameters." : "Historical monitored data."}
                                        </div>
                                    </div>
                                </div>
                            </Popup>
                        </CircleMarker>
                    ))}
                </MapContainer>
            </div>

            {!mini && (
                <div className="flex items-center gap-6 mt-4 justify-center">
                    {Object.entries(riskColors).map(([level, color]) => (
                        <div key={level} className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}` }} />
                            {level}
                        </div>
                    ))}
                    <div className="flex items-center gap-2 text-[10px] font-bold text-purple-400 uppercase tracking-tighter">
                        <div className="w-2.5 h-2.5 rounded-full bg-purple-500 border-2 border-white/50" />
                        Simulation
                    </div>
                </div>
            )}
        </div>
    );
}
