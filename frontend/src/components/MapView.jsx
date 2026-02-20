/**
 * MapView — Interactive Leaflet map with color-coded risk zones.
 * Displays prediction locations with red/yellow/green markers.
 */
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';

// Default center (India) — adjust as needed
const DEFAULT_CENTER = [20.5937, 78.9629];
const DEFAULT_ZOOM = 5;

// Generate pseudo-locations from predictions (for demo purposes)
function generateLocations(predictions) {
    const baseLocations = [
        { name: 'Mumbai', lat: 19.076, lng: 72.877 },
        { name: 'Delhi', lat: 28.613, lng: 77.209 },
        { name: 'Chennai', lat: 13.082, lng: 80.270 },
        { name: 'Kolkata', lat: 22.572, lng: 88.363 },
        { name: 'Bangalore', lat: 12.971, lng: 77.594 },
        { name: 'Hyderabad', lat: 17.385, lng: 78.486 },
        { name: 'Ahmedabad', lat: 23.022, lng: 72.571 },
        { name: 'Pune', lat: 18.520, lng: 73.856 },
        { name: 'Jaipur', lat: 26.912, lng: 75.787 },
        { name: 'Lucknow', lat: 26.846, lng: 80.946 },
    ];

    return predictions.map((p, i) => ({
        ...p,
        lat: baseLocations[i % baseLocations.length].lat + (Math.random() - 0.5) * 2,
        lng: baseLocations[i % baseLocations.length].lng + (Math.random() - 0.5) * 2,
        cityName: p.location !== 'Unknown' ? p.location : baseLocations[i % baseLocations.length].name,
    }));
}

const riskColors = {
    high: '#ef4444',
    medium: '#f59e0b',
    low: '#22c55e',
};

export default function MapView({ predictions = [] }) {
    const locations = generateLocations(predictions);

    return (
        <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <span className="text-xl">🗺️</span> Risk Heatmap
            </h3>

            <div className="rounded-xl overflow-hidden border border-white/5" style={{ height: '400px' }}>
                <MapContainer
                    center={DEFAULT_CENTER}
                    zoom={DEFAULT_ZOOM}
                    style={{ height: '100%', width: '100%' }}
                    scrollWheelZoom={true}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    />

                    {locations.map((loc, i) => (
                        <CircleMarker
                            key={i}
                            center={[loc.lat, loc.lng]}
                            radius={loc.risk_level === 'high' ? 14 : loc.risk_level === 'medium' ? 10 : 7}
                            pathOptions={{
                                color: riskColors[loc.risk_level] || riskColors.low,
                                fillColor: riskColors[loc.risk_level] || riskColors.low,
                                fillOpacity: 0.5,
                                weight: 2,
                            }}
                        >
                            <Popup>
                                <div style={{ color: '#1e293b', minWidth: 160 }}>
                                    <strong style={{ fontSize: 14 }}>📍 {loc.cityName}</strong>
                                    <hr style={{ margin: '6px 0', borderColor: '#e2e8f0' }} />
                                    <p style={{ margin: '3px 0', fontSize: 12 }}>
                                        Risk: <strong style={{ color: riskColors[loc.risk_level] }}>
                                            {loc.risk_level?.toUpperCase()}
                                        </strong>
                                    </p>
                                    <p style={{ margin: '3px 0', fontSize: 12 }}>Rainfall: {loc.rainfall}mm</p>
                                    <p style={{ margin: '3px 0', fontSize: 12 }}>pH: {loc.ph_level}</p>
                                    <p style={{ margin: '3px 0', fontSize: 12 }}>Cases: {loc.cases_count}</p>
                                </div>
                            </Popup>
                        </CircleMarker>
                    ))}
                </MapContainer>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-6 mt-4 justify-center">
                {Object.entries(riskColors).map(([level, color]) => (
                    <div key={level} className="flex items-center gap-2 text-xs text-slate-400">
                        <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}60` }}
                        />
                        <span className="capitalize">{level} Risk</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
