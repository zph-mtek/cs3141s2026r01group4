import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
import { Link } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import { getAllProperties } from '../API/getAllProperties';
import pinIcon from '../assets/pin.png';

const MTU_CENTER = [47.1200, -88.5500];

const propertyIcon = new Icon({
    iconUrl: pinIcon,
    iconSize: [38, 38],
    iconAnchor: [19, 38],
    popupAnchor: [0, -42],
});

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

const MapView = () => {
    const [markers, setMarkers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [progress, setProgress] = useState({ done: 0, total: 0 });
    const [error, setError] = useState(null);

    useEffect(() => {
        const geocodeAll = async () => {
            try {
                const response = await getAllProperties();
                const properties = response.data || [];

                setProgress({ done: 0, total: properties.length });

                const results = [];

                for (let i = 0; i < properties.length; i++) {
                    const prop = properties[i];
                    try {
                        const encoded = encodeURIComponent(prop.address);
                        const res = await fetch(
                            `https://nominatim.openstreetmap.org/search?format=json&q=${encoded}&limit=1`,
                            { headers: { 'Accept-Language': 'en' } }
                        );
                        const data = await res.json();

                        if (data && data.length > 0) {
                            results.push({
                                ...prop,
                                lat: parseFloat(data[0].lat),
                                lng: parseFloat(data[0].lon),
                            });
                        }
                    } catch {
                        // Skip properties that fail to geocode
                    }

                    setProgress({ done: i + 1, total: properties.length });

                    // Respect Nominatim's 1 req/sec rate limit
                    if (i < properties.length - 1) await sleep(1100);
                }

                setMarkers(results);
            } catch (err) {
                console.error('Failed to load properties', err);
                setError('Failed to load property data. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        geocodeAll();
    }, []);

    return (
        <div className="relative h-screen w-full pt-16">
            {/* Loading overlay */}
            {loading && (
                <div className="absolute inset-0 z-[1000] flex flex-col items-center justify-center bg-white/85 backdrop-blur-sm gap-4">
                    <div className="w-10 h-10 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
                    <div className="text-center">
                        <p className="text-sm font-semibold text-gray-700">Locating properties on map…</p>
                        {progress.total > 0 && (
                            <>
                                <p className="text-xs text-gray-500 mt-1">
                                    {progress.done} of {progress.total}
                                </p>
                                <div className="mt-3 w-48 bg-gray-200 rounded-full h-1.5 mx-auto">
                                    <div
                                        className="bg-yellow-400 h-1.5 rounded-full transition-all duration-500"
                                        style={{ width: `${(progress.done / progress.total) * 100}%` }}
                                    />
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Error state */}
            {error && !loading && (
                <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-white/90">
                    <div className="text-center px-6">
                        <p className="text-red-500 font-semibold mb-3">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold px-5 py-2 rounded-lg transition-colors"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            )}

            {/* Map */}
            <MapContainer center={MTU_CENTER} zoom={13} className="h-full w-full z-0">
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />

                {markers.map((prop) => (
                    <Marker
                        key={prop.propertyId}
                        position={[prop.lat, prop.lng]}
                        icon={propertyIcon}
                    >
                        <Popup>
                            <div className="text-sm min-w-[170px]">
                                <p className="font-bold text-base text-gray-900 mb-0.5">{prop.name}</p>
                                <p className="text-gray-500 text-xs mb-1">{prop.address}</p>
                                {prop.distanceFromMTU && (
                                    <span className="inline-block bg-yellow-300 text-gray-800 text-xs font-medium px-2 py-0.5 rounded-full mb-2">
                                        {prop.distanceFromMTU} mi from campus
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

            {/* Result count badge */}
            {!loading && markers.length > 0 && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[999] bg-white shadow-lg rounded-full px-4 py-2 text-sm font-medium text-gray-700">
                    {markers.length} propert{markers.length === 1 ? 'y' : 'ies'} found near MTU
                </div>
            )}
        </div>
    );
};

export default MapView;
