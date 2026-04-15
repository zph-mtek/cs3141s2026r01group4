import React, { useState, useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import { Icon } from 'leaflet';
import { Link } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import { getAllProperties } from '../API/getAllProperties';
import pinIcon from '../assets/pin.png';

const BASE = 'https://huskyrentlens.cs.mtu.edu/backend/';
const MTU_CENTER = [47.1200, -88.5500];

const makeIcon = (active) =>
  new Icon({
    iconUrl: pinIcon,
    iconSize: active ? [46, 46] : [32, 32],
    iconAnchor: active ? [23, 46] : [16, 32],
  });

const getImg = (prop) =>
  prop.images?.[0]?.imageUrl ? `${BASE}${prop.images[0].imageUrl}` : null;

const SearchIcon = () => (
  <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
  </svg>
);

// Flies the map to a new location whenever flyTarget changes
const MapController = ({ flyTarget }) => {
  const map = useMap();
  useEffect(() => {
    if (flyTarget) map.flyTo([flyTarget.lat, flyTarget.lng], 16, { duration: 0.8 });
  }, [flyTarget, map]);
  return null;
};

// ── Desktop sidebar card
const SidebarCard = React.forwardRef(({ prop, active, onClick }, ref) => {
  const img = getImg(prop);
  return (
    <button
      ref={ref}
      onClick={onClick}
      className={`group w-full text-left flex gap-3 items-start px-4 py-3 border-b border-gray-50 transition-all duration-150 ${
        active
          ? 'bg-yellow-50 border-l-[3px] border-l-yellow-400 pl-3.5'
          : 'border-l-[3px] border-l-transparent hover:bg-gray-50'
      }`}
    >
      <div className="shrink-0 w-[60px] h-[60px] rounded-xl overflow-hidden bg-gray-100">
        {img ? (
          <img src={img} alt="" className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-xl text-gray-300">🏠</div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-1">
          <p className={`text-sm font-bold leading-tight line-clamp-1 ${active ? 'text-yellow-800' : 'text-gray-900'}`}>
            {prop.name}
          </p>
          {prop.lowest_price && (
            <p className="shrink-0 text-xs font-black text-yellow-600 ml-1">
              ${prop.lowest_price}<span className="font-normal text-gray-400 text-[10px]">/mo</span>
            </p>
          )}
        </div>
        <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">
          {prop.address}{prop.city ? `, ${prop.city}` : ''}
        </p>
        {prop.distanceFromMTU && (
          <span className="mt-1.5 inline-block text-[10px] font-semibold bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
            {prop.distanceFromMTU} mi from campus
          </span>
        )}
      </div>
    </button>
  );
});
SidebarCard.displayName = 'SidebarCard';

// ── Mobile horizontal carousel card
const CarouselCard = React.forwardRef(({ prop, active, onClick }, ref) => {
  const img = getImg(prop);
  return (
    <div
      ref={ref}
      onClick={onClick}
      className={`snap-center shrink-0 w-64 rounded-2xl overflow-hidden bg-white cursor-pointer select-none transition-all duration-200 shadow-[0_4px_24px_rgba(0,0,0,0.12)] border-2 ${
        active ? 'border-yellow-400' : 'border-transparent'
      }`}
    >
      <div className="h-28 bg-gray-100 overflow-hidden">
        {img ? (
          <img src={img} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-gray-200 text-4xl">🏠</div>
        )}
      </div>
      <div className="p-3">
        <div className="flex items-start gap-2 justify-between">
          <p className="text-sm font-black text-gray-900 leading-tight line-clamp-1 flex-1">{prop.name}</p>
          {prop.lowest_price && (
            <p className="shrink-0 text-sm font-black text-yellow-500">
              ${prop.lowest_price}<span className="text-[10px] font-normal text-gray-400">/mo</span>
            </p>
          )}
        </div>
        <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{prop.address}</p>
        <div className="mt-2.5 flex items-center justify-between gap-2">
          {prop.distanceFromMTU ? (
            <span className="text-[10px] font-semibold bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full truncate">
              {prop.distanceFromMTU} mi
            </span>
          ) : <span />}
          <Link
            to={`/properties/${prop.propertyId}`}
            onClick={(e) => e.stopPropagation()}
            className="shrink-0 text-xs font-bold text-gray-900 bg-yellow-400 hover:bg-yellow-500 px-3 py-1.5 rounded-lg transition-colors"
          >
            View →
          </Link>
        </div>
      </div>
    </div>
  );
});
CarouselCard.displayName = 'CarouselCard';

// ── Mobile list item (full-screen list mode)
const MobileListItem = ({ prop }) => {
  const img = getImg(prop);
  return (
    <Link
      to={`/properties/${prop.propertyId}`}
      className="flex gap-3 px-4 py-3.5 border-b border-gray-100 hover:bg-gray-50 transition-colors active:bg-gray-100"
    >
      <div className="shrink-0 w-20 h-20 rounded-xl overflow-hidden bg-gray-100">
        {img ? (
          <img src={img} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-2xl text-gray-300">🏠</div>
        )}
      </div>
      <div className="flex-1 min-w-0 flex flex-col justify-center gap-0.5">
        <div className="flex items-start gap-2 justify-between">
          <p className="text-sm font-bold text-gray-900 line-clamp-1 flex-1">{prop.name}</p>
          {prop.lowest_price && (
            <p className="shrink-0 text-sm font-black text-yellow-500">
              ${prop.lowest_price}<span className="text-[10px] font-normal text-gray-400">/mo</span>
            </p>
          )}
        </div>
        <p className="text-xs text-gray-400 line-clamp-1">{prop.address}</p>
        {prop.distanceFromMTU && (
          <span className="inline-block w-fit mt-1 text-[10px] font-semibold bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
            {prop.distanceFromMTU} mi from campus
          </span>
        )}
      </div>
    </Link>
  );
};

// ── Main component
const MapView = () => {
  document.title = 'Map View | HuskyRentLens';

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [flyTarget, setFlyTarget] = useState(null);
  const [search, setSearch] = useState('');
  const [mobileMode, setMobileMode] = useState('map'); // 'map' | 'list'
  const sidebarCardRefs = useRef({});
  const carouselCardRefs = useRef({});

  useEffect(() => {
    (async () => {
      try {
        const res = await getAllProperties();
        const data = res.data || [];
        setProperties(
          data.filter((p) => p.lat != null && p.lng != null && p.lat !== '' && p.lng !== '')
        );
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return properties;
    const q = search.toLowerCase();
    return properties.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) ||
        p.address?.toLowerCase().includes(q) ||
        p.city?.toLowerCase().includes(q)
    );
  }, [properties, search]);

  const selectedProperty = useMemo(
    () => properties.find((p) => p.propertyId === selected) || null,
    [properties, selected]
  );

  const flyTo = (prop) => {
    if (prop.lat && prop.lng)
      setFlyTarget({ lat: parseFloat(prop.lat), lng: parseFloat(prop.lng) });
  };

  const handleSidebarClick = (prop) => {
    setSelected(prop.propertyId);
    flyTo(prop);
  };

  const handleMarkerClick = (prop) => {
    setSelected(prop.propertyId);
    flyTo(prop);
    setTimeout(() => {
      carouselCardRefs.current[prop.propertyId]?.scrollIntoView({
        behavior: 'smooth', inline: 'center', block: 'nearest',
      });
      sidebarCardRefs.current[prop.propertyId]?.scrollIntoView({
        behavior: 'smooth', block: 'nearest',
      });
    }, 80);
  };

  const handleCarouselCardClick = (prop) => {
    setSelected(prop.propertyId);
    flyTo(prop);
    carouselCardRefs.current[prop.propertyId]?.scrollIntoView({
      behavior: 'smooth', inline: 'center', block: 'nearest',
    });
  };

  const Spinner = () => (
    <div className="flex items-center justify-center h-32">
      <div className="h-7 w-7 animate-spin rounded-full border-4 border-yellow-400 border-t-transparent" />
    </div>
  );

  const EmptyState = ({ message }) => (
    <div className="flex flex-col items-center justify-center py-12 gap-2 text-gray-400">
      <span className="text-4xl">📍</span>
      <p className="text-sm font-medium">{message}</p>
      {search && (
        <button
          onClick={() => setSearch('')}
          className="text-xs font-semibold text-yellow-600 hover:underline mt-1"
        >
          Clear search
        </button>
      )}
    </div>
  );

  return (
    <div className="flex h-[calc(100vh-3.5rem)] md:h-[calc(100vh-4rem)] overflow-hidden">

      {/* ════════════════ DESKTOP SIDEBAR ════════════════ */}
      <aside className="hidden md:flex flex-col w-[360px] lg:w-96 bg-white border-r border-gray-100 shadow-sm z-10 shrink-0">

        {/* Header + search */}
        <div className="px-5 pt-5 pb-4 border-b border-gray-100">
          <div className="flex items-baseline justify-between">
            <h1 className="text-xl font-black text-gray-900">Map View</h1>
            <span className="text-xs text-gray-400 tabular-nums">
              {loading ? '…' : `${filtered.length} shown`}
            </span>
          </div>
          <div className="relative mt-3">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <SearchIcon />
            </span>
            <input
              type="text"
              placeholder="Search properties…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-9 pr-9 text-sm text-gray-900 placeholder:text-gray-400 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-300/30 transition-colors"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm leading-none"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Property list */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <Spinner />
          ) : filtered.length === 0 ? (
            <EmptyState message={search ? 'No matching properties' : 'No pinned properties yet'} />
          ) : (
            filtered.map((prop) => (
              <SidebarCard
                key={prop.propertyId}
                prop={prop}
                active={selected === prop.propertyId}
                onClick={() => handleSidebarClick(prop)}
                ref={(el) => { sidebarCardRefs.current[prop.propertyId] = el; }}
              />
            ))
          )}
        </div>

        {/* Selected property CTA */}
        {selectedProperty && (
          <div className="border-t border-gray-100 p-4 bg-white">
            <Link
              to={`/properties/${selectedProperty.propertyId}`}
              className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-yellow-400 px-4 py-2.5 text-sm font-extrabold text-gray-900 hover:bg-yellow-500 active:scale-[0.98] transition-all"
            >
              View Listing →
            </Link>
            <button
              onClick={() => setSelected(null)}
              className="mt-2 w-full text-center text-xs text-gray-400 hover:text-gray-600 transition-colors py-1"
            >
              Deselect
            </button>
          </div>
        )}
      </aside>

      {/* ════════════════ MAP AREA ════════════════ */}
      <div className="relative flex-1 overflow-hidden">

        {/* Mobile top bar: search + map/list toggle */}
        <div className="md:hidden absolute top-0 inset-x-0 z-[1001] px-3 pt-3 flex items-center gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <SearchIcon />
            </span>
            <input
              type="text"
              placeholder="Search properties…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl bg-white/95 backdrop-blur-sm border-0 py-2.5 pl-9 pr-9 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none shadow-[0_2px_14px_rgba(0,0,0,0.15)]"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"
              >
                ✕
              </button>
            )}
          </div>
          {/* Map / List toggle */}
          <div className="flex rounded-xl overflow-hidden shadow-[0_2px_14px_rgba(0,0,0,0.15)] shrink-0">
            <button
              onClick={() => setMobileMode('map')}
              className={`px-3.5 py-2.5 text-xs font-bold transition-colors ${
                mobileMode === 'map'
                  ? 'bg-yellow-400 text-gray-900'
                  : 'bg-white/95 backdrop-blur-sm text-gray-600'
              }`}
            >
              Map
            </button>
            <button
              onClick={() => setMobileMode('list')}
              className={`px-3.5 py-2.5 text-xs font-bold transition-colors ${
                mobileMode === 'list'
                  ? 'bg-yellow-400 text-gray-900'
                  : 'bg-white/95 backdrop-blur-sm text-gray-600'
              }`}
            >
              List
            </button>
          </div>
        </div>

        {/* Mobile full-screen list overlay */}
        {mobileMode === 'list' && (
          <div className="md:hidden absolute inset-0 z-[999] bg-white overflow-y-auto">
            <div className="h-[56px] shrink-0" />
            {loading ? (
              <Spinner />
            ) : filtered.length === 0 ? (
              <EmptyState message={search ? 'No matching properties' : 'No properties on map'} />
            ) : (
              filtered.map((prop) => <MobileListItem key={prop.propertyId} prop={prop} />)
            )}
          </div>
        )}

        {/* The Map */}
        <MapContainer
          center={MTU_CENTER}
          zoom={13}
          zoomControl={false}
          className="h-full w-full z-0"
        >
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
            />
          ))}
        </MapContainer>

        {/* Mobile bottom carousel (Airbnb-style) */}
        <div className="md:hidden absolute bottom-0 inset-x-0 z-[1000] pointer-events-none">
          <div className="pointer-events-auto">
            {/* Count pill */}
            {!loading && filtered.length > 0 && (
              <div className="flex justify-center mb-1.5">
                <span className="bg-black/50 backdrop-blur-sm text-white text-[11px] font-semibold px-3 py-1 rounded-full">
                  {filtered.length} propert{filtered.length !== 1 ? 'ies' : 'y'} on map
                </span>
              </div>
            )}
            {/* Horizontal snap scroll */}
            <div
              className="flex gap-3 overflow-x-auto snap-x snap-mandatory px-4 pb-4"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {loading ? (
                <div className="snap-center shrink-0 w-64 h-44 rounded-2xl bg-white shadow-lg flex items-center justify-center">
                  <div className="h-7 w-7 animate-spin rounded-full border-4 border-yellow-400 border-t-transparent" />
                </div>
              ) : filtered.length === 0 ? (
                <div className="snap-center shrink-0 w-64 rounded-2xl bg-white shadow-lg px-6 py-8 flex flex-col items-center gap-2 text-gray-400">
                  <span className="text-3xl">📍</span>
                  <p className="text-sm font-medium text-center">
                    {search ? 'No matching properties' : 'No properties on map yet'}
                  </p>
                </div>
              ) : (
                filtered.map((prop) => (
                  <CarouselCard
                    key={prop.propertyId}
                    prop={prop}
                    active={selected === prop.propertyId}
                    onClick={() => handleCarouselCardClick(prop)}
                    ref={(el) => { carouselCardRefs.current[prop.propertyId] = el; }}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapView;
