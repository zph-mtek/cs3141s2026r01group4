import React, { useState, useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Icon } from 'leaflet';
import { Link } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import { getAllProperties } from '../API/getAllProperties';
import pinIcon from '../assets/pin.png';

const MTU_CENTER = [47.1200, -88.5500];

const makeIcon = (active) =>
    new Icon({
        iconUrl: pinIcon,
        iconSize: active ? [48, 48] : [36, 36],
        iconAnchor: active ? [24, 48] : [18, 36],
        popupAnchor: [0, -40],
    });

// Flies map to a target whenever flyTarget changes
const MapController = ({ flyTarget }) => {
    const map = useMap();
    useEffect(() => {
        if (flyTarget) {
            map.flyTo([flyTarget.lat, flyTarget.lng], 16, { duration: 0.8 });
        }
    }, [flyTarget, map]);
    return null;
};

// Property card — forwarded ref so we can scroll it into view
const PropertyCard = React.forwardRef(({ prop, active, onClick }, ref) => (
    <button
        ref={ref}
        onClick={onClick}
        className={`w-full text-left px-4 py-3 border-b border-gray-100 transition-all cursor-pointer hover:bg-yellow-50 ${
            active ? 'bg-yellow-50 border-l-4 border-l-yellow-400' : 'border-l-4 border-l-transparent'
        }`}
    >
        <p className={`font-semibold text-sm ${active ? 'text-yellow-700' : 'text-gray-900'}`}>
            {prop.name}
        </p>
        <p className="text-xs text-gray-500 mt-0.5 truncate">
            {prop.address}{prop.city ? `, ${prop.city}` : ''}
        </p>
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            {prop.distanceFromMTU && (
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                    {prop.distanceFromMTU} from campus
                </span>
            )}
            {prop.lowest_price && (
                <span className="text-xs font-semibold text-yellow-600">
                    From ${prop.lowest_price}/mo
                </span>
            )}
        </div>
    </button>
));
PropertyCard.displayName = 'PropertyCard';

const MapView = () => {
    document.title = 'Map View | HuskyRentLens';
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);
    const [flyTarget, setFlyTarget] = useState(null);
    const [sheetOpen, setSheetOpen] = useState(false);
    const cardRefs = useRef({});

    useEffect(() => {
        const load = async () => {
            try {
                const response = await getAllProperties();
                const data = response.data || [];
                // Only include properties that have been pinned
                const withCoords = data.filter(
                    (p) => p.lat != null && p.lng != null && p.lat !== '' && p.lng !== ''
                );
                setProperties(withCoords);
            } catch (err) {
                console.error('Failed to load properties', err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const filtered = properties;

    const selectedProperty = useMemo(
        () => filtered.find((prop) => prop.propertyId === selected) || properties.find((prop) => prop.propertyId === selected) || null,
        [filtered, properties, selected]
    );

    const handleSelectFromList = (prop) => {
        setSelected(prop.propertyId);
        setFlyTarget({ lat: parseFloat(prop.lat), lng: parseFloat(prop.lng) });
        setSheetOpen(false);
        setTimeout(() => {
            cardRefs.current[prop.propertyId]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
    };

    const handleMarkerClick = (prop) => {
        setSelected(prop.propertyId);
        setSheetOpen(true);
        setTimeout(() => {
            cardRefs.current[prop.propertyId]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 350);
    };

    const PropertyList = () => (
        <>
            {loading ? (
                <div className="flex items-center justify-center h-32">
                    <div className="w-7 h-7 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-gray-400 text-sm gap-2">
                    <span className="text-3xl">📍</span>
                    <p>{properties.length === 0 ? 'No pinned properties yet' : 'No results'}</p>
                </div>
            ) : (
                filtered.map((prop) => (
                    <PropertyCard
                        key={prop.propertyId}
                        prop={prop}
                        active={selected === prop.propertyId}
                        onClick={() => handleSelectFromList(prop)}
                        ref={(el) => (cardRefs.current[prop.propertyId] = el)}
                    />
                ))
            )}
        </>
    );

    return (
        <div className="flex h-[calc(100vh-3.5rem)] md:h-[calc(100vh-4rem)] overflow-hidden bg-gray-50">

            {/* ── Desktop sidebar ── */}
            <aside className="hidden md:flex flex-col w-80 lg:w-96 bg-white border-r border-gray-200 shadow-sm z-10 shrink-0">
                <div className="p-4 border-b border-gray-100">
                    <h1 className="text-lg font-bold text-gray-900 mb-3">Browse Properties</h1>
                    <p className="text-xs text-gray-400 mt-2">
                        {loading ? 'Loading…' : `${filtered.length} propert${filtered.length === 1 ? 'y' : 'ies'} on map`}
                    </p>
                </div>
                <div className="flex-1 overflow-y-auto">
                    <PropertyList />
                </div>
            </aside>

            {/* ── Map ── */}
            <div className="relative flex-1 isolate">
                <MapContainer center={MTU_CENTER} zoom={13} className="h-full w-full z-0">
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    <MapController flyTarget={flyTarget} />

                    {filtered.map((prop) => (
                        <Marker
                            key={prop.propertyId}
                            position={[parseFloat(prop.lat), parseFloat(prop.lng)]}
                            icon={makeIcon(selected === prop.propertyId)}
                            eventHandlers={{ click: () => handleMarkerClick(prop) }}
                        >
                            <Popup>
                                <div className="text-sm min-w-[180px]">
                                    <p className="font-bold text-base text-gray-900 mb-0.5">{prop.name}</p>
                                    <p className="text-gray-500 text-xs mb-2">{prop.address}</p>
                                    {prop.distanceFromMTU && (
                                        <span className="inline-block bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-0.5 rounded-full mb-2">
                                            {prop.distanceFromMTU} from campus
                                        </span>
                                    )}
                                    {prop.lowest_price && (
                                        <p className="text-yellow-600 font-semibold mb-2">
                                            From ${prop.lowest_price}/mo
                                        </p>
                                    )}
                                    <Link
                                        to={`/properties/${prop.propertyId}`}
                                        className="block text-center bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold py-1.5 px-3 rounded-lg transition-colors text-xs"
                                    >
                                        View Listing →
                                    </Link>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
                {/* ── Mobile selected property card ── */}
                {selectedProperty && (
                    <div className="md:hidden absolute left-3 right-3 bottom-18 z-[999]">
                        <div className="rounded-2xl bg-white/95 backdrop-blur shadow-xl border border-white/70 p-3">
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <p className="font-bold text-sm text-gray-900 truncate">{selectedProperty.name}</p>
                                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{selectedProperty.address}</p>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {selectedProperty.lowest_price && (
                                            <span className="text-xs font-semibold text-yellow-700 bg-yellow-100 px-2 py-1 rounded-full">
                                                From ${selectedProperty.lowest_price}/mo
                                            </span>
                                        )}
                                        {selectedProperty.distanceFromMTU && (
                                            <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                                                {selectedProperty.distanceFromMTU} from campus
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <Link
                                    to={`/properties/${selectedProperty.propertyId}`}
                                    className="shrink-0 rounded-xl bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold px-3 py-2 text-xs"
                                >
                                    View
                                </Link>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Mobile bottom sheet ── */}
                <div className="md:hidden absolute bottom-3 left-3 right-3 z-[999] pointer-events-none">
                    <div className="pointer-events-auto">
                        <div className={`bg-white/95 backdrop-blur border border-white/70 rounded-3xl shadow-[0_14px_40px_rgba(0,0,0,0.16)] overflow-hidden transition-all duration-300 ${sheetOpen ? 'max-h-[52vh]' : 'max-h-14'}`}>
                            <button
                                onClick={() => setSheetOpen((o) => !o)}
                                className="w-full px-4 py-4 flex items-center justify-between gap-3"
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-10 h-1.5 bg-gray-300 rounded-full" />
                                    <span className="text-sm text-gray-800 font-semibold truncate">
                                        {sheetOpen ? 'Property list' : loading ? 'Loading…' : `${filtered.length} propert${filtered.length === 1 ? 'y' : 'ies'} nearby`}
                                    </span>
                                </div>
                                <span className="text-xs font-semibold text-yellow-700">
                                    {sheetOpen ? 'Close' : 'Open'}
                                </span>
                            </button>
                            <div className="border-t border-gray-100 overflow-y-auto max-h-[calc(52vh-56px)]">
                                <PropertyList />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MapView;
