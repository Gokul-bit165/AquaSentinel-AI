/**
 * MapView — Interactive Leaflet map with color-coded risk zones.
 * Centered on Coimbatore, Tamil Nadu.
 */
import { MapContainer, TileLayer, CircleMarker, Popup, ZoomControl } from 'react-leaflet';

const COIMBATORE_CENTER = [11.0168, 76.9558];
const DEFAULT_ZOOM = 11;

// Generate pseudo-locations around Coimbatore
function generateLocations(predictions) {
    const baseLat = 11.0168;
    const baseLng = 76.9558;

    return predictions.map((p, i) => ({
        ...p,
        lat: baseLat + (Math.random() - 0.5) * 0.1,
        lng: baseLng + (Math.random() - 0.5) * 0.1,
        cityName: p.location !== 'Unknown' ? p.location : 'Coimbatore District',
    }));
}

const riskColors = {
    high: '#ef4444',
    medium: '#f59e0b',
    low: '#22c55e',
};

export default function MapView({ predictions = [], mini = false }) {
    const locations = generateLocations(predictions);

    return (
        <div className={`${mini ? '' : 'glass-card p-6'}`}>
            {!mini && (
                <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2 font-outfit">
                    <span className="text-xl">🗺️</span> Regional Risk Heatmap
                </h3>
            )}

            <div
                className={`rounded-xl overflow-hidden border border-[var(--border-subtle)] bg-slate-50 relative`}
                style={{ height: mini ? '100%' : '400px' }}
            >
                <MapContainer
                    center={COIMBATORE_CENTER}
                    zoom={mini ? 10 : DEFAULT_ZOOM}
                    style={{ height: '100%', width: '100%' }}
                    scrollWheelZoom={!mini}
                    zoomControl={false}
                    dragging={!mini}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                    />

                    {!mini && <ZoomControl position="bottomright" />}

                    {locations.map((loc, i) => (
                        <CircleMarker
                            key={i}
                            center={[loc.lat, loc.lng]}
                            radius={mini ? 6 : (loc.risk_level === 'high' ? 14 : loc.risk_level === 'medium' ? 10 : 7)}
                            pathOptions={{
                                color: riskColors[loc.risk_level] || riskColors.low,
                                fillColor: riskColors[loc.risk_level] || riskColors.low,
                                fillOpacity: 0.4,
                                weight: 2,
                            }}
                        >
                            {!mini && (
                                <Popup>
                                    <div className="p-1 font-outfit min-w-[140px]">
                                        <p className="font-bold text-sm mb-1">📍 {loc.cityName}</p>
                                        <div className="h-[1px] bg-slate-100 my-2" />
                                        <p className="text-xs mb-1">
                                            Status: <span className="font-bold uppercase" style={{ color: riskColors[loc.risk_level] }}>
                                                {loc.risk_level} Risk
                                            </span>
                                        </p>
                                        <p className="text-[10px] text-slate-500">Rainfall: {loc.rainfall}mm</p>
                                        <p className="text-[10px] text-slate-500">Accuracy: {Math.round((loc.confidence || 0.9) * 100)}%</p>
                                    </div>
                                </Popup>
                            )}
                        </CircleMarker>
                    ))}
                </MapContainer>
            </div>

            {!mini && (
                <div className="flex items-center gap-6 mt-6 justify-center">
                    {Object.entries(riskColors).map(([level, color]) => (
                        <div key={level} className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            <div
                                className="w-2.5 h-2.5 rounded-full"
                                style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}40` }}
                            />
                            <span className="capitalize">{level} Risk</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
