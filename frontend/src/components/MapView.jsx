import { MapContainer, TileLayer, Circle, CircleMarker, Popup, ZoomControl, useMap } from 'react-leaflet';
import { useEffect } from 'react';

const COIMBATORE_CENTER = [11.0168, 76.9558];
const DEFAULT_ZOOM = 12;

// Fixed coordinates for Coimbatore wards
const WARD_COORDS = {
    "RS Puram, Coimbatore": [11.0318, 76.9408],
    "Gandhipuram, Coimbatore": [11.0268, 76.9658],
    "Peelamedu, Coimbatore": [11.0268, 76.9958],
    "Saravanampatti, Coimbatore": [11.0768, 76.9958],
    "Singanallur, Coimbatore": [11.0068, 77.0058],
    "Vadavalli, Coimbatore": [11.0268, 76.9058],
    "Thudiyalur, Coimbatore": [11.0768, 76.9458],
    "Kurichi, Coimbatore": [10.9468, 76.9658],
    "Podanur, Coimbatore": [10.9668, 76.9858],
    "Kuniyamuthur, Coimbatore": [10.9868, 76.9358],
    "Ramanathapuram, Coimbatore": [11.0418, 76.9758],
    "Saibaba Colony, Coimbatore": [11.0168, 76.9558],
    "Race Course, Coimbatore": [11.0068, 76.9558],
    "Ganapathy, Coimbatore": [11.0518, 76.9658],
    "Koundampalayam, Coimbatore": [11.0568, 76.9358],
    "Periyanaickenpalayam, Coimbatore": [11.0868, 76.9258],
    "Sulur, Coimbatore": [11.0368, 77.0458],
    "Pollachi, Coimbatore": [10.6618, 77.0108],
    "Mettupalayam, Coimbatore": [11.2968, 76.9358],
    "Karamadai, Coimbatore": [11.0968, 76.8758],
    "Annur, Coimbatore": [11.2368, 77.1058],
    "Zone Alpha (Flood Risk)": [11.0568, 77.0158],
    "Zone Beta (Toxic Spill)": [10.9868, 76.9658],
    "Zone Gamma (Outbreak)": [11.0268, 76.9358],
};

const riskConfig = {
    high: { fill: '#DC2626', stroke: '#991B1B', outerFill: 'rgba(220, 38, 38, 0.08)', pulse: true },
    medium: { fill: '#D97706', stroke: '#92400E', outerFill: 'rgba(217, 119, 6, 0.06)', pulse: false },
    low: { fill: '#16A34A', stroke: '#166534', outerFill: 'rgba(22, 163, 74, 0.05)', pulse: false },
};

function MapUpdater({ center, zoom }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center, zoom);
    }, [center, zoom, map]);
    return null;
}

export default function MapView({ territoryPulse = [], onLocationClick, mini = false }) {
    const locations = territoryPulse.map(p => {
        const coords = WARD_COORDS[p.ward_name];
        if (!coords) return null;
        return { ...p, lat: coords[0], lng: coords[1] };
    }).filter(Boolean);

    return (
        <div className={`h-full w-full ${mini ? '' : 'glass-card p-5'}`}>
            <MapContainer
                center={COIMBATORE_CENTER}
                zoom={DEFAULT_ZOOM}
                className="h-full w-full rounded-xl"
                style={{ minHeight: mini ? '460px' : '500px', background: '#f8fafc' }}
                zoomControl={false}
                scrollWheelZoom={true}
            >
                <MapUpdater center={COIMBATORE_CENTER} zoom={DEFAULT_ZOOM} />
                <ZoomControl position="bottomright" />

                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                />

                {locations.map((loc, i) => {
                    const config = riskConfig[loc.risk_level] || riskConfig.low;
                    const zoneRadius = loc.risk_level === 'high' ? 1200 : loc.risk_level === 'medium' ? 900 : 700;

                    return (
                        <span key={i}>
                            {/* Outer hazard zone — large semi-transparent territory */}
                            <Circle
                                center={[loc.lat, loc.lng]}
                                radius={zoneRadius}
                                pathOptions={{
                                    fillColor: config.fill,
                                    fillOpacity: 0.12,
                                    color: config.fill,
                                    weight: 1,
                                    opacity: 0.3,
                                    dashArray: loc.risk_level === 'high' ? '' : '6 4',
                                }}
                            />

                            {/* Middle ring — visible border */}
                            <Circle
                                center={[loc.lat, loc.lng]}
                                radius={zoneRadius * 0.6}
                                pathOptions={{
                                    fillColor: config.fill,
                                    fillOpacity: 0.2,
                                    color: config.stroke,
                                    weight: 1.5,
                                    opacity: 0.5,
                                }}
                            />

                            {/* Core marker — solid center dot */}
                            <CircleMarker
                                center={[loc.lat, loc.lng]}
                                radius={mini ? 7 : 9}
                                pathOptions={{
                                    fillColor: config.fill,
                                    fillOpacity: 0.9,
                                    color: '#fff',
                                    weight: 2.5,
                                }}
                                eventHandlers={{
                                    click: () => onLocationClick && onLocationClick(loc),
                                }}
                            >
                                <Popup>
                                    <div style={{ minWidth: '180px', fontFamily: 'Inter, sans-serif' }}>
                                        <p style={{ fontWeight: 800, fontSize: '13px', marginBottom: '4px', color: '#1E293B' }}>
                                            {loc.ward_name?.replace(', Coimbatore', '')}
                                        </p>
                                        <p style={{
                                            fontSize: '11px', fontWeight: 700, textTransform: 'uppercase',
                                            color: config.fill, marginBottom: '8px', letterSpacing: '0.05em'
                                        }}>
                                            {loc.risk_level} RISK · {Math.round(loc.confidence * 100)}%
                                        </p>
                                        <div style={{ fontSize: '11px', color: '#64748B', lineHeight: '1.6' }}>
                                            <div>🌧 Rainfall: {loc.metrics?.rainfall}mm</div>
                                            <div>💧 Contamination: {Math.round((loc.metrics?.contamination || 0) * 100)}%</div>
                                            <div>⚗️ pH: {loc.metrics?.ph_level}</div>
                                            <div>🏥 Cases: {loc.metrics?.cases_count}</div>
                                        </div>
                                        <p style={{ fontSize: '10px', marginTop: '8px', color: '#94A3B8', fontStyle: 'italic' }}>
                                            Click for AI analysis →
                                        </p>
                                    </div>
                                </Popup>
                            </CircleMarker>
                        </span>
                    );
                })}
            </MapContainer>

            {/* Legend overlay */}
            {!mini && (
                <div className="absolute bottom-8 left-8 z-[1000] bg-white/95 backdrop-blur-sm p-4 rounded-xl border border-slate-200 shadow-lg">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Risk Zones</p>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2.5 text-xs text-slate-600">
                            <div className="w-4 h-4 rounded-full bg-red-500 shadow-sm shadow-red-500/40" /> High Risk Zone
                        </div>
                        <div className="flex items-center gap-2.5 text-xs text-slate-600">
                            <div className="w-4 h-4 rounded-full bg-amber-500 shadow-sm shadow-amber-500/40" /> Medium Risk
                        </div>
                        <div className="flex items-center gap-2.5 text-xs text-slate-600">
                            <div className="w-4 h-4 rounded-full bg-green-500 shadow-sm shadow-green-500/40" /> Safe Zone
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
