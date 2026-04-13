import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllProperties } from '../API/getAllProperties';

const Home = () => {
    document.title = 'HuskyRentLens | Student Housing Near MTU';
    const [properties, setProperties] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        getAllProperties()
            .then((res) => setProperties(res.data || []))
            .catch(() => {})
            .finally(() => setIsLoading(false));
    }, []);

    const totalReviews = properties.reduce((sum, p) => sum + (Number(p.review_count) || 0), 0);

    const featured = useMemo(() => {
        if (properties.length <= 3) return properties;
        const shuffled = [...properties].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, 3);
    }, [properties]);

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col">

            {/* ── Narrow header bar ── */}
            <div className="bg-white border-b border-gray-100">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 md:py-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-yellow-600 mb-1">Student housing near MTU</p>
                        <h1 className="text-2xl md:text-3xl font-extrabold leading-tight text-gray-900">
                            Find your next home
                        </h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <span className="text-xl font-extrabold text-gray-900">{isLoading ? '—' : properties.length}</span>
                            <span className="text-sm text-gray-400 ml-1">listings</span>
                        </div>
                        <div className="w-px h-6 bg-gray-200" />
                        <div className="text-right">
                            <span className="text-xl font-extrabold text-gray-900">{isLoading ? '—' : (totalReviews || '0')}</span>
                            <span className="text-sm text-gray-400 ml-1">reviews</span>
                        </div>
                        <Link
                            to="/properties"
                            className="ml-2 shrink-0 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold px-5 py-2.5 rounded-xl text-sm transition-colors"
                        >
                            Browse all →
                        </Link>
                    </div>
                </div>
            </div>

            {/* ── Featured properties — the main event ── */}
            <section className="max-w-6xl mx-auto w-full px-4 sm:px-6 pt-6 pb-4 flex-1">

                {isLoading ? (
                    <div className="flex justify-center items-center py-32">
                        <div className="w-10 h-10 border-4 border-yellow-200 border-t-yellow-500 rounded-full animate-spin" />
                    </div>
                ) : featured.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 text-gray-400">
                        <p className="text-lg font-semibold">No listings yet</p>
                        <p className="text-sm mt-1">Check back soon.</p>
                    </div>
                ) : (
                    <>
                        {/* Hero card — first featured property, large */}
                        <Link
                            to={`/properties/${featured[0].propertyId}`}
                            className="group block rounded-3xl overflow-hidden bg-white border border-gray-100 shadow-sm hover:shadow-xl transition-shadow mb-5 md:mb-6"
                        >
                            <div className="flex flex-col md:flex-row md:h-72 lg:h-80">
                                <div className="w-full md:w-[55%] bg-gray-200 overflow-hidden h-52 md:h-full shrink-0">
                                    {featured[0].images?.length > 0 ? (
                                        <img
                                            src={`https://huskyrentlens.cs.mtu.edu/backend/${featured[0].images[0].imageUrl}`}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            alt={featured[0].name}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">No image</div>
                                    )}
                                </div>
                                <div className="flex flex-col justify-between p-5 md:p-7 flex-1">
                                    <div>
                                        <span className="inline-block text-[11px] font-bold uppercase tracking-widest text-yellow-700 bg-yellow-100 px-2.5 py-1 rounded-full mb-3">Featured</span>
                                        <h2 className="text-xl md:text-2xl lg:text-3xl font-extrabold leading-snug text-gray-900 line-clamp-2">{featured[0].name}</h2>
                                        <p className="text-sm md:text-base text-gray-500 mt-2 line-clamp-2">📍 {featured[0].address}</p>
                                    </div>
                                    <div className="flex items-end justify-between mt-4 gap-3">
                                        <div className="flex flex-wrap gap-2">
                                            {featured[0].distanceFromMTU && (
                                                <span className="bg-gray-100 text-gray-700 text-xs font-semibold px-3 py-1.5 rounded-full">
                                                    {featured[0].distanceFromMTU} mi from campus
                                                </span>
                                            )}
                                        </div>
                                        <p className="shrink-0 text-right leading-none">
                                            <span className="text-2xl md:text-3xl font-extrabold text-yellow-500">${featured[0].lowest_price || '—'}</span>
                                            <span className="text-xs text-gray-400 block">/month</span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </Link>

                        {/* Remaining two cards side by side */}
                        {featured.length > 1 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-6">
                                {featured.slice(1).map((property) => (
                                    <Link
                                        key={property.propertyId}
                                        to={`/properties/${property.propertyId}`}
                                        className="group block rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm hover:shadow-lg transition-shadow"
                                    >
                                        <div className="h-40 sm:h-44 md:h-52 bg-gray-200 overflow-hidden">
                                            {property.images?.length > 0 ? (
                                                <img
                                                    src={`https://huskyrentlens.cs.mtu.edu/backend/${property.images[0].imageUrl}`}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                    alt={property.name}
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">No image</div>
                                            )}
                                        </div>
                                        <div className="p-4 md:p-5">
                                            <div className="flex justify-between items-start gap-3">
                                                <h3 className="font-bold text-base md:text-lg leading-snug line-clamp-2 text-gray-900">{property.name}</h3>
                                                <p className="shrink-0 text-right leading-none">
                                                    <span className="text-xl font-extrabold text-yellow-500">${property.lowest_price || '—'}</span>
                                                    <span className="text-xs text-gray-400 block">/mo</span>
                                                </p>
                                            </div>
                                            <p className="text-gray-500 text-sm mt-2 line-clamp-1">📍 {property.address}</p>
                                            {property.distanceFromMTU && (
                                                <span className="inline-block mt-3 bg-gray-100 text-gray-600 text-xs font-semibold px-2.5 py-1 rounded-full">
                                                    {property.distanceFromMTU} mi from campus
                                                </span>
                                            )}
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}

                        {/* View all — mobile only */}
                        <div className="mt-5 text-center sm:hidden">
                            <Link to="/properties" className="text-sm font-semibold text-yellow-600 hover:underline">View all properties →</Link>
                        </div>
                    </>
                )}
            </section>

            {/* ── Bottom action strip ── */}
            <div className="border-t border-gray-100 bg-white mt-4">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 md:py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
                    <p className="text-gray-500 text-center sm:text-left">
                        <span className="font-semibold text-gray-700">Lived somewhere nearby?</span>{' '}
                        Help future students by leaving a review.
                    </p>
                    <div className="flex items-center gap-3 shrink-0 flex-wrap justify-center">
                        <Link to="/map" className="text-gray-600 hover:text-yellow-600 font-semibold transition-colors">Map view</Link>
                        <span className="text-gray-300">|</span>
                        <Link to="/properties" className="text-gray-600 hover:text-yellow-600 font-semibold transition-colors">Write a review</Link>
                        <span className="text-gray-300">|</span>
                        <Link to="/about" className="text-gray-600 hover:text-yellow-600 font-semibold transition-colors">About</Link>
                    </div>
                </div>
            </div>

            {/* ── Disclaimer footer ── */}
            <footer className="bg-gray-50 text-gray-400 py-6 px-6 text-center text-xs border-t border-gray-100">
                <p className="max-w-2xl mx-auto leading-relaxed">
                    An independent student project for CS3141 — not affiliated with or endorsed by Michigan Technological University.
                </p>
                <div className="mt-3 space-x-4 font-medium">
                    <Link to="/privacy-policy" className="hover:text-yellow-500 transition-colors">Privacy Policy</Link>
                    <span className="text-gray-300">|</span>
                    <Link to="/guidelines" className="hover:text-yellow-500 transition-colors">Community Guidelines</Link>
                </div>
            </footer>
        </div>
    );
}

export default Home