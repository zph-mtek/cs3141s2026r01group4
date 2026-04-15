import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getPropertyById } from '../API/getPropertyById';

/* ── resolve rental image URL ── */
const resolveImg = (source) => {
  if (!source) return '';
  if (typeof source === 'string') return `https://huskyrentlens.cs.mtu.edu/backend/${source}`;
  const path = source.image_url || source.imageUrl || '';
  return path ? `https://huskyrentlens.cs.mtu.edu/backend/${path}` : '';
};

const RentalInfo = () => {
  const { propertyId, rentalId } = useParams();

  const [propertyName, setPropertyName] = useState('');
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  /* ── fetch ── */
  useEffect(() => {
    (async () => {
      try {
        const res = await getPropertyById(propertyId);
        if (res.status === 'success' && res.data) {
          setPropertyName(res.data.property?.name || '');
          setRentals(res.data.rentals || []);
        }
      } catch (err) {
        console.error('Failed to fetch rental details', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [propertyId]);

  /* ── selected rental ── */
  const rental = useMemo(
    () => rentals.find((r) => String(r.rentalId) === String(rentalId)),
    [rentals, rentalId],
  );

  /* ── rental-only gallery (huskyrentlens_rental_image) ── */
  const gallery = useMemo(
    () => (rental?.images || []).map(resolveImg).filter(Boolean),
    [rental],
  );

  useEffect(() => setActiveImg(0), [rentalId]);

  useEffect(() => {
    document.title = rental?.roomName
      ? `${rental.roomName} | HuskyRentLens`
      : 'Rental Unit | HuskyRentLens';
  }, [rental]);

  /* ── keyboard nav in lightbox ── */
  const handleKey = useCallback(
    (e) => {
      if (!lightbox) return;
      if (e.key === 'Escape') setLightbox(false);
      if (e.key === 'ArrowRight') setActiveImg((i) => (i + 1) % gallery.length);
      if (e.key === 'ArrowLeft') setActiveImg((i) => (i - 1 + gallery.length) % gallery.length);
    },
    [lightbox, gallery.length],
  );
  useEffect(() => {
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleKey]);

  /* ── states ── */
  if (loading)
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-yellow-400 border-t-transparent" />
      </div>
    );

  if (!rental)
    return (
      <div className="flex min-h-[80vh] items-center justify-center px-4">
        <div className="max-w-md rounded-3xl border border-gray-200 bg-white p-10 text-center shadow-xl">
          <p className="text-5xl">🏠</p>
          <h1 className="mt-4 text-2xl font-black text-gray-900">Unit Not Found</h1>
          <p className="mt-2 text-gray-500">This rental unit could not be loaded.</p>
          <Link
            to={`/properties/${propertyId}`}
            className="mt-6 inline-flex rounded-xl bg-gray-900 px-6 py-3 font-bold text-white hover:bg-black transition-colors"
          >
            ← Back to Property
          </Link>
        </div>
      </div>
    );

  const cur = gallery[activeImg] || '';
  const hasPhotos = gallery.length > 0;

  return (
    <>
      {/* ─── Lightbox ─── */}
      {lightbox && cur && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
          onClick={() => setLightbox(false)}
        >
          <button
            className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-xl text-white backdrop-blur hover:bg-white/20 transition-colors"
            onClick={() => setLightbox(false)}
          >
            ✕
          </button>
          {gallery.length > 1 && (
            <>
              <button
                className="absolute left-3 top-1/2 z-10 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-2xl text-white backdrop-blur hover:bg-white/20 transition-colors"
                onClick={(e) => { e.stopPropagation(); setActiveImg((i) => (i - 1 + gallery.length) % gallery.length); }}
              >‹</button>
              <button
                className="absolute right-3 top-1/2 z-10 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-2xl text-white backdrop-blur hover:bg-white/20 transition-colors"
                onClick={(e) => { e.stopPropagation(); setActiveImg((i) => (i + 1) % gallery.length); }}
              >›</button>
            </>
          )}
          <img
            src={cur}
            alt="Full view"
            className="max-h-[90vh] max-w-[90vw] rounded-2xl object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-4 py-1.5 text-xs font-semibold text-white backdrop-blur">
            {activeImg + 1} / {gallery.length}
          </div>
        </div>
      )}

      {/* ─── Page ─── */}
      <div className="min-h-screen bg-white">

        {/* ── Hero ── */}
        <div className="relative w-full bg-gray-100">
          {hasPhotos ? (
            <img
              src={cur}
              alt={rental.roomName || 'Rental unit'}
              className="h-[30vh] w-full object-cover sm:h-[42vh] lg:h-[52vh] cursor-pointer"
              onClick={() => setLightbox(true)}
            />
          ) : (
            <div className="flex h-[22vh] w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-gray-100 to-gray-200 sm:h-[30vh]">
              <span className="text-3xl">🛏️</span>
              <p className="text-sm font-medium text-gray-400">No room photos uploaded yet</p>
            </div>
          )}

          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-white to-transparent" />

          <Link
            to={`/properties/${propertyId}`}
            className="absolute left-4 top-4 z-10 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-sm font-semibold text-gray-800 shadow-md backdrop-blur-sm hover:bg-white transition-colors"
          >
            ← Property
          </Link>

          {gallery.length > 1 && (
            <button
              onClick={() => setLightbox(true)}
              className="absolute bottom-5 right-4 z-10 flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm hover:bg-black/80 transition-colors cursor-pointer"
            >
              📷 {gallery.length} photos
            </button>
          )}
        </div>

        {/* ── Thumbnail strip ── */}
        {gallery.length > 1 && (
          <div className="mx-auto flex max-w-5xl gap-2 overflow-x-auto px-4 py-2.5">
            {gallery.map((photo, i) => (
              <button
                key={i}
                onClick={() => setActiveImg(i)}
                className={`flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all duration-200 ${
                  activeImg === i
                    ? 'border-yellow-400 shadow-[0_0_0_2px_rgba(255,204,0,0.25)]'
                    : 'border-transparent opacity-60 hover:opacity-90'
                }`}
              >
                <img src={photo} alt="" className="h-12 w-16 object-cover sm:h-14 sm:w-20" />
              </button>
            ))}
          </div>
        )}

        {/* ── Content ── */}
        <div className="mx-auto max-w-5xl px-4 pb-12 sm:px-6 sm:pb-20">

          {/* ── Title + price card ── */}
          <div className="-mt-3 relative z-10 rounded-2xl border border-gray-100 bg-white p-4 shadow-[0_6px_32px_-10px_rgba(0,0,0,0.13)] sm:-mt-5 sm:rounded-3xl sm:p-7">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                {propertyName && (
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400 sm:text-[11px]">
                    {propertyName}
                  </p>
                )}
                <h1 className="mt-0.5 text-xl font-black leading-tight text-gray-900 sm:text-3xl lg:text-4xl">
                  {rental.roomName || 'Rental Unit'}
                </h1>
              </div>

              <div className="flex-shrink-0 rounded-xl bg-gray-900 px-4 py-2.5 text-right sm:rounded-2xl sm:px-5 sm:py-3.5">
                <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Rent</p>
                <p className="text-2xl font-black text-white leading-none sm:text-3xl">
                  ${rental.cost || '—'}
                </p>
                <p className="text-[9px] text-gray-500 mt-0.5">/month</p>
              </div>
            </div>

            {/* Bed / Bath chips */}
            <div className="mt-4 flex gap-2 sm:mt-5 sm:gap-3">
              <div className="flex items-center gap-1.5 rounded-full border border-gray-100 bg-gray-50 px-3 py-1.5">
                <span className="text-base leading-none">🛏️</span>
                <span className="text-xs font-bold text-gray-900">{rental.bedroomCt ?? '—'}</span>
                <span className="text-xs text-gray-500">Bedroom{rental.bedroomCt !== 1 ? 's' : ''}</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-full border border-gray-100 bg-gray-50 px-3 py-1.5">
                <span className="text-base leading-none">🚿</span>
                <span className="text-xs font-bold text-gray-900">{rental.bathroomCt ?? '—'}</span>
                <span className="text-xs text-gray-500">Bathroom{rental.bathroomCt !== 1 ? 's' : ''}</span>
              </div>
            </div>
          </div>

          {/* ── Body ── */}
          <div className="mt-5 grid gap-5 sm:mt-8 sm:gap-8 lg:grid-cols-[1.5fr_1fr]">

            {/* LEFT: rental description */}
            <div>
              {rental.description ? (
                <section>
                  <h2 className="text-base font-bold text-gray-900 sm:text-lg">About This Unit</h2>
                  <p className="mt-3 leading-relaxed text-gray-600 text-sm sm:text-base">{rental.description}</p>
                </section>
              ) : (
                <div className="rounded-2xl border border-dashed border-gray-200 p-6 text-center text-sm text-gray-400">
                  No description provided for this unit.
                </div>
              )}
            </div>

            {/* RIGHT: details + CTA */}
            <div className="lg:sticky lg:top-20 self-start space-y-3 sm:space-y-4">
              {/* Rental details */}
              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 sm:p-5">
                <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-3">Rental Details</p>
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Monthly rent</span>
                    <span className="text-sm font-bold text-gray-900">${rental.cost || '—'}</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-gray-100 pt-2.5">
                    <span className="text-sm text-gray-500">Bedrooms</span>
                    <span className="text-sm font-bold text-gray-900">{rental.bedroomCt ?? '—'}</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-gray-100 pt-2.5">
                    <span className="text-sm text-gray-500">Bathrooms</span>
                    <span className="text-sm font-bold text-gray-900">{rental.bathroomCt ?? '—'}</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-gray-100 pt-2.5">
                    <span className="text-sm text-gray-500">Photos</span>
                    <span className="text-sm font-bold text-gray-900">{gallery.length > 0 ? `${gallery.length} uploaded` : 'None yet'}</span>
                  </div>
                </div>
              </div>

              <Link
                to={`/addreview/${propertyId}`}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-yellow-400 px-5 py-3 text-center text-sm font-extrabold text-gray-900 transition-colors hover:bg-yellow-300 active:scale-[0.98] sm:py-3.5"
              >
                ✍️ Share Your Experience
              </Link>

              <Link
                to={`/properties/${propertyId}`}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-gray-200 px-5 py-2.5 text-center text-sm font-semibold text-gray-600 transition-colors hover:border-gray-400 hover:text-gray-900 active:scale-[0.98]"
              >
                ← Back to Property
              </Link>
            </div>
          </div>

          {/* ── Other units (horizontal scroll mobile, grid desktop) ── */}
          {rentals.length > 1 && (
            <section className="mt-8 sm:mt-12">
              <div className="flex items-baseline justify-between mb-3 sm:mb-4">
                <h2 className="text-base font-black text-gray-900 sm:text-lg">Other Units</h2>
                <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                  {rentals.length} total
                </span>
              </div>

              <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-3">
                {rentals.map((room) => {
                  const active = String(room.rentalId) === String(rentalId);
                  const thumb = (room.images || []).map(resolveImg).filter(Boolean)[0];
                  return (
                    <Link
                      key={room.rentalId}
                      to={`/properties/${propertyId}/rentals/${room.rentalId}`}
                      className={`group flex-shrink-0 w-48 overflow-hidden rounded-xl border transition-all duration-200 sm:w-auto sm:rounded-2xl ${
                        active
                          ? 'border-yellow-400 bg-yellow-50 ring-1 ring-yellow-400/30 shadow-sm'
                          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                      }`}
                    >
                      {thumb ? (
                        <div className="h-20 w-full overflow-hidden sm:h-24">
                          <img
                            src={thumb}
                            alt=""
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>
                      ) : (
                        <div className="flex h-14 items-center justify-center bg-gray-100 text-xl sm:h-20">🛏️</div>
                      )}
                      <div className="p-3">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="text-sm font-black text-gray-900 leading-tight">{room.roomName || 'Unit'}</p>
                          {active && (
                            <span className="rounded-full bg-yellow-400 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-gray-900">
                              Viewing
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 text-xs text-gray-500">{room.bedroomCt ?? '—'} bd · {room.bathroomCt ?? '—'} ba</p>
                        <p className="mt-1 text-sm font-extrabold text-gray-900">
                          ${room.cost || '—'}<span className="text-xs font-normal text-gray-400">/mo</span>
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      </div>
    </>
  );
};

export default RentalInfo;
