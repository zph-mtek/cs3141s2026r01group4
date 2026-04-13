import React, { useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import pinIcon from '../assets/pin.png';

const MTU_CENTER = [47.1200, -88.5500];

const draggableIcon = new Icon({
    iconUrl: pinIcon,
    iconSize: [38, 38],
    iconAnchor: [19, 38],
});

// Inner component — listens for map clicks to place/move the pin
const ClickListener = ({ onPlace }) => {
    useMapEvents({
        click(e) {
            onPlace(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
};

const PinDropMap = ({ lat, lng, onChange }) => {
    const hasPin = lat !== null && lng !== null;

    const handlePlace = useCallback(
        (newLat, newLng) => {
            onChange(parseFloat(newLat.toFixed(6)), parseFloat(newLng.toFixed(6)));
        },
        [onChange]
    );

    const handleDrag = useCallback(
        (e) => {
            const { lat: newLat, lng: newLng } = e.target.getLatLng();
            onChange(parseFloat(newLat.toFixed(6)), parseFloat(newLng.toFixed(6)));
        },
        [onChange]
    );

    return (
        <div className="space-y-2">
            <div className="h-72 w-full rounded-xl overflow-hidden border border-gray-300 cursor-crosshair">
                <MapContainer
                    center={hasPin ? [lat, lng] : MTU_CENTER}
                    zoom={14}
                    className="h-full w-full"
                >
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    <ClickListener onPlace={handlePlace} />
                    {hasPin && (
                        <Marker
                            position={[lat, lng]}
                            icon={draggableIcon}
                            draggable={true}
                            eventHandlers={{ dragend: handleDrag }}
                        />
                    )}
                </MapContainer>
            </div>

            {/* Coordinate readout */}
            <div className="flex items-center justify-between text-sm">
                {hasPin ? (
                    <span className="text-gray-600 font-mono">
                        📍 {lat}, {lng}
                    </span>
                ) : (
                    <span className="text-gray-400 italic">Click the map to drop a pin</span>
                )}
                {hasPin && (
                    <button
                        type="button"
                        onClick={() => onChange(null, null)}
                        className="text-xs text-red-400 hover:text-red-600 underline"
                    >
                        Clear pin
                    </button>
                )}
            </div>
        </div>
    );
};

export default PinDropMap;
