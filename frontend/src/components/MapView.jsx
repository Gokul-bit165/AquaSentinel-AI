import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import { useEffect, useState } from 'react';

// Default center (India)
const DEFAULT_CENTER = [20.5937, 78.9629];
const DEFAULT_ZOOM = 5;

function generateLocations(predictions, simulation) {
    const baseLocations = [
        { name: 'Mumbai', lat: 19.076, lng: 72.877 },
        { name: 'Delhi', lat: 28.613, lng: 77.209 },
        { name: 'Chennai', lat: 13.082, lng: 80.270 },
        { name: 'Kolkata', lat: 22.572, lng: 88.363 },
        { name: 'Bangalore', lat: 12.971, lng: 77.594 },
        { name: 'Hyderabad', lat: 17.385, lng: 78.486 },
    ];

    const historical = predictions.map((p, i) => ({
        ...p,
        lat: baseLocations[i % baseLocations.length].lat + (Math.random() - 0.5) * 1,
        lng: baseLocations[i % baseLocations.length].lng + (Math.random() - 0.5) * 1,
        cityName: p.location !== 'Unknown' ? p.location : baseLocations[i % baseLocations.length].name,
    }));

    if (simulation) {
        historical.unshift({
            ...simulation,
            lat: baseLocations[2].lat + 0.5, // Mock localized simulation point
            lng: baseLocations[2].lng + 0.5,
            cityName: simulation.location
        });
    }

    return historical;
}

const riskColors = {
    high: '#ef4444',
    medium: '#f59e0b',
    low: '#22c55e',
};

export default function MapView({ predictions = [], simulation = null }) {
    const [locations, setLocations] = useState([]);

    useEffect(() => {
        setLocations(generateLocations(predictions, simulation));
    }, [predictions, simulation]);

    return (
        <div className="glass-card p-6 border-white/5 relative overflow-hidden">
            {/* Pulsing Heatmap Title */}
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

            <div className="rounded-xl overflow-hidden border border-white/10" style={{ height: '400px' }}>
                <MapContainer
                    center={DEFAULT_CENTER}
                    zoom={DEFAULT_ZOOM}
                    style={{ height: '100%', width: '100%', filter: 'hue-rotate(-10deg) saturate(1.2)' }}
                    scrollWheelZoom={true}
                >
                    <TileLayer
                        attribution='&copy; CARTO'
                        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    />

                    {locations.map((loc, i) => (
                        <CircleMarker
                            key={`${i}-${loc.isSimulation}`}
                            center={[loc.lat, loc.lng]}
                            radius={loc.risk_level === 'high' ? 18 : loc.risk_level === 'medium' ? 12 : 8}
                            pathOptions={{
                                color: loc.isSimulation ? '#a855f7' : riskColors[loc.risk_level] || riskColors.low,
                                fillColor: loc.isSimulation ? '#a855f7' : riskColors[loc.risk_level] || riskColors.low,
                                fillOpacity: loc.isSimulation ? 0.8 : 0.5,
                                weight: loc.isSimulation ? 4 : 2,
                                dashArray: loc.isSimulation ? '5, 5' : null,
                                className: loc.risk_level === 'high' ? 'animate-pulse-glow' : ''
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
                                            <span className="font-bold" style={{ color: riskColors[loc.risk_level] }}>{loc.risk_level?.toUpperCase()}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Rainfall:</span>
                                            <span className="font-mono">{loc.rainfall?.toFixed(1)}mm</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Contamination:</span>
                                            <span className="font-mono">{loc.contamination?.toFixed(2)}</span>
                                        </div>
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

            {/* Legend */}
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
        </div>
    );
}
