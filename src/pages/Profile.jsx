import React, { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { jwtDecode } from 'jwt-decode'
import { Link, useNavigate } from 'react-router-dom'
import { getPropertyiesByLandlordId } from '../API/getPropertyiesByLandlordId'

const API_BASE_URL = 'https://huskyrentlens.cs.mtu.edu'

const normalizeRoleLabel = (role) => {
    if (role === 'MTU_student') return 'MTU Student'
    if (role === 'Landlord') return 'Landlord'
    return role || 'User'
}

const buildDisplayName = (user) => {
    const nameFromParts = [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim()
    return user?.name || user?.fullName || nameFromParts || user?.email || 'User'
}

const buildInitials = (value) => {
    if (!value) return 'HR'
    const words = value.split(' ').filter(Boolean)
    return words.slice(0, 2).map((word) => word[0]?.toUpperCase()).join('') || 'HR'
}

const formatJoinedDate = (user) => {
    const joinedRaw = user?.joinedAt || user?.createdAt || user?.created_at || user?.registeredAt || user?.iat
    if (!joinedRaw) return 'Not available'

    const joinedDate = new Date(typeof joinedRaw === 'number' && joinedRaw.toString().length <= 10 ? joinedRaw * 1000 : joinedRaw)
    return Number.isNaN(joinedDate.getTime()) ? 'Not available' : joinedDate.toLocaleDateString()
}

const normalizeReview = (review) => {
    const rating = Number(review.rating ?? review.stars ?? review.starRating ?? 0) || 0

    return {
        id: review.feedbackId ?? review.reviewId ?? review.id ?? `${review.propertyId}-${review.rentalId ?? ''}-${review.startDate ?? ''}`,
        propertyId: review.propertyId ?? review.property_id ?? null,
        propertyName: review.propertyName ?? review.property ?? review.name ?? 'Property',
        rating,
        text: review.review ?? review.commentDesc ?? review.comment ?? '',
        startDate: review.startDate ?? review.start_date ?? '',
        endDate: review.endDate ?? review.end_date ?? '',
        utilityCost: review.rentalUtilityCost ?? review.utilityCost ?? review.utility_cost ?? null,
    }
}

const extractReviews = (payload) => {
    if (!payload) return []
    if (Array.isArray(payload)) return payload
    if (Array.isArray(payload.reviews)) return payload.reviews
    if (Array.isArray(payload.data)) return payload.data
    if (payload.data && Array.isArray(payload.data.reviews)) return payload.data.reviews
    if (payload.data && Array.isArray(payload.data.data)) return payload.data.data
    return []
}

const getPropertyImage = (property) => {
    if (!property?.images?.length) return null
    return `${API_BASE_URL}/backend/${property.images[0].imageUrl}`
}

const getReviewDateText = (review) => {
    if (review.startDate && review.endDate) return `${review.startDate} – ${review.endDate}`
    if (review.startDate) return review.startDate
    if (review.endDate) return review.endDate
    return null
}

const StatCard = ({ label, value, tone = 'default' }) => {
    const toneClass = tone === 'yellow' ? 'border-yellow-200 bg-yellow-50' : 'border-gray-100 bg-gray-50'

    return (
        <div className={`rounded-2xl border px-4 py-4 ${toneClass}`}>
            <p className='text-2xl font-extrabold text-gray-900'>{value}</p>
            <p className='mt-1 text-sm text-gray-500'>{label}</p>
        </div>
    )
}

const SectionCard = ({ title, subtitle, children }) => (
    <section className='rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6'>
        <div className='mb-5'>
            <h2 className='text-xl font-bold text-gray-900 sm:text-2xl'>{title}</h2>
            {subtitle ? <p className='mt-1 text-sm text-gray-500 sm:text-base'>{subtitle}</p> : null}
        </div>
        {children}
    </section>
)

const EmptyState = ({ title, subtitle, actionTo, actionLabel }) => (
    <div className='rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center'>
        <p className='text-base font-semibold text-gray-800'>{title}</p>
        <p className='mt-2 text-sm text-gray-500'>{subtitle}</p>
        {actionTo && actionLabel ? (
            <Link to={actionTo} className='mt-4 inline-flex items-center justify-center rounded-xl bg-yellow-400 px-5 py-2.5 font-semibold text-gray-900 transition-colors hover:bg-yellow-500'>
                {actionLabel}
            </Link>
        ) : null}
    </div>
)

const Profile = () => {
    document.title = 'My Profile | HuskyRentLens'

    const navigate = useNavigate()

    const [user, setUser] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [reviews, setReviews] = useState([])
    const [reviewLoading, setReviewLoading] = useState(false)
    const [reviewError, setReviewError] = useState('')
    const [properties, setProperties] = useState([])
    const [propertyLoading, setPropertyLoading] = useState(false)
    const [propertyError, setPropertyError] = useState('')

    useEffect(() => {
        const token = localStorage.getItem('token')

        if (!token) {
            navigate('/login')
            return
        }

        try {
            const decoded = jwtDecode(token)
            setUser(decoded.data)
        } catch (error) {
            console.error('Invalid token', error)
            localStorage.removeItem('token')
            navigate('/login')
            return
        }

        setIsLoading(false)
    }, [navigate])

    useEffect(() => {
        const userId = user?.userId

        if (!userId) {
            setReviews([])
            setReviewError('')
            return
        }

        const fetchReviews = async () => {
            setReviewLoading(true)
            setReviewError('')

            const attempts = [
                () => axios.get(`${API_BASE_URL}/backend/fetchUserReviews.php?userId=${userId}`),
                () => axios.get(`${API_BASE_URL}/backend/fetchReviewsByUser.php?userId=${userId}`),
                () => axios.post(`${API_BASE_URL}/feedback.php`, { userId, getReviews: 'yes' }, { headers: { 'Content-Type': 'application/json' } }),
                () => axios.post(`${API_BASE_URL}/connect.php`, { userId, myReviews: 'yes' }, { headers: { 'Content-Type': 'application/json' } }),
            ]

            let loaded = false

            for (const attempt of attempts) {
                try {
                    const response = await attempt()
                    setReviews(extractReviews(response?.data).map(normalizeReview))
                    loaded = true
                    break
                } catch {
                    // try next endpoint
                }
            }

            if (!loaded) {
                setReviews([])
                setReviewError('Could not load your reviews right now.')
            }

            setReviewLoading(false)
        }

        fetchReviews()
    }, [user])

    useEffect(() => {
        if (!user || user.role !== 'Landlord') {
            setProperties([])
            setPropertyError('')
            return
        }

        const fetchProperties = async () => {
            setPropertyLoading(true)
            setPropertyError('')

            try {
                const response = await getPropertyiesByLandlordId()
                setProperties(response.data || [])
            } catch (error) {
                console.error('Error loading properties', error)
                setProperties([])
                setPropertyError('Could not load your properties right now.')
            }

            setPropertyLoading(false)
        }

        fetchProperties()
    }, [user])

    const displayName = useMemo(() => buildDisplayName(user), [user])
    const initials = useMemo(() => buildInitials(displayName), [displayName])
    const roleLabel = useMemo(() => normalizeRoleLabel(user?.role), [user])
    const joinedText = useMemo(() => formatJoinedDate(user), [user])
    const visibleReviews = useMemo(() => reviews.slice(0, 6), [reviews])
    const visibleProperties = useMemo(() => properties.slice(0, 4), [properties])

    if (isLoading) {
        return (
            <div className='px-6 pt-10 text-center md:pt-16'>
                <p className='text-lg text-gray-600'>Loading profile...</p>
            </div>
        )
    }

    if (!user) {
        return (
            <div className='px-6 pt-10 md:pt-16'>
                <div className='mx-auto max-w-xl rounded-2xl bg-white p-8 text-center shadow-md'>
                    <h1 className='mb-3 text-3xl font-bold'>Profile</h1>
                    <p className='mb-6 text-gray-600'>Please sign in to view your profile.</p>
                    <Link to='/login' className='inline-flex items-center justify-center rounded-full bg-yellow-400 px-6 py-2 font-semibold transition hover:bg-yellow-500'>
                        Go to Login
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className='min-h-screen bg-gray-50 px-4 pb-16 pt-8 sm:px-6 lg:px-8 md:pt-12'>
            <div className='mx-auto grid max-w-7xl grid-cols-1 items-start gap-6 md:gap-8 xl:grid-cols-[360px_minmax(0,1fr)]'>
                <aside className='space-y-6 xl:sticky xl:top-24'>
                    <div className='overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm'>
                        <div className='h-28 bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500' />
                        <div className='-mt-14 px-6 pb-6'>
                            <div className='flex h-28 w-28 items-center justify-center rounded-full border-4 border-white bg-gray-900 text-3xl font-black text-white shadow-lg'>
                                {initials}
                            </div>

                            <div className='mt-4'>
                                <div className='flex flex-wrap items-center gap-2'>
                                    <h1 className='text-2xl font-extrabold text-gray-900'>{displayName}</h1>
                                    <span className='inline-flex items-center rounded-full bg-yellow-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-yellow-800'>
                                        {roleLabel}
                                    </span>
                                </div>
                                <p className='mt-2 text-gray-500'>{user.email || 'No email available'}</p>
                                <p className='mt-1 text-sm text-gray-400'>Joined {joinedText}</p>
                            </div>

                            <div className='mt-6 grid grid-cols-2 gap-3'>
                                <StatCard label='Reviews' value={reviews.length} tone='yellow' />
                                <StatCard label='Properties' value={properties.length} />
                            </div>

                            <div className='mt-6 grid grid-cols-1 gap-3'>
                                <Link to='/properties' className='inline-flex items-center justify-center rounded-2xl bg-yellow-400 px-4 py-3 font-bold text-gray-900 transition-colors hover:bg-yellow-500'>
                                    Browse Properties
                                </Link>
                                {user.role === 'Landlord' ? (
                                    <>
                                        <Link to='/manage' className='inline-flex items-center justify-center rounded-2xl border border-gray-200 bg-white px-4 py-3 font-semibold text-gray-800 transition-colors hover:bg-gray-50'>
                                            Manage Properties
                                        </Link>
                                        <Link to='/manage/add' className='inline-flex items-center justify-center rounded-2xl border border-gray-200 bg-white px-4 py-3 font-semibold text-gray-800 transition-colors hover:bg-gray-50'>
                                            Add New Property
                                        </Link>
                                    </>
                                ) : (
                                    <>
                                        <Link to='/map' className='inline-flex items-center justify-center rounded-2xl border border-gray-200 bg-white px-4 py-3 font-semibold text-gray-800 transition-colors hover:bg-gray-50'>
                                            Open Map View
                                        </Link>
                                        <Link to='/properties' className='inline-flex items-center justify-center rounded-2xl border border-gray-200 bg-white px-4 py-3 font-semibold text-gray-800 transition-colors hover:bg-gray-50'>
                                            Explore More Listings
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    <SectionCard title='Account snapshot' subtitle='A quick overview of the information currently attached to your account.'>
                        <div className='space-y-4 text-sm'>
                            <div className='flex items-start justify-between gap-4'>
                                <span className='text-gray-500'>Full name</span>
                                <span className='text-right font-semibold text-gray-900'>{displayName}</span>
                            </div>
                            <div className='flex items-start justify-between gap-4'>
                                <span className='text-gray-500'>Email</span>
                                <span className='text-right font-semibold text-gray-900'>{user.email || 'Not available'}</span>
                            </div>
                            <div className='flex items-start justify-between gap-4'>
                                <span className='text-gray-500'>Role</span>
                                <span className='text-right font-semibold text-gray-900'>{roleLabel}</span>
                            </div>
                            <div className='flex items-start justify-between gap-4'>
                                <span className='text-gray-500'>User ID</span>
                                <span className='text-right font-semibold text-gray-900'>{user.userId ?? 'Not available'}</span>
                            </div>
                            {user.phone ? (
                                <div className='flex items-start justify-between gap-4'>
                                    <span className='text-gray-500'>Phone</span>
                                    <span className='text-right font-semibold text-gray-900'>{user.phone}</span>
                                </div>
                            ) : null}
                        </div>
                    </SectionCard>
                </aside>

                <main className='space-y-6'>
                    <SectionCard title='Your reviews' subtitle='Everything you have posted so far, collected in one place.'>
                        {reviewLoading ? (
                            <p className='text-gray-600'>Loading your reviews...</p>
                        ) : reviewError ? (
                            <p className='rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700'>{reviewError}</p>
                        ) : reviews.length === 0 ? (
                            <EmptyState
                                title='No reviews yet.'
                                subtitle='Once you leave feedback on a property, it will show up here.'
                                actionTo='/properties'
                                actionLabel='Browse properties'
                            />
                        ) : (
                            <div className='space-y-4'>
                                {visibleReviews.map((review) => {
                                    const stayText = getReviewDateText(review)

                                    return (
                                        <article key={review.id} className='rounded-2xl border border-gray-100 bg-gray-50 p-4 sm:p-5'>
                                            <div className='flex items-start gap-4'>
                                                <div className='flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gray-900 font-bold text-white'>
                                                    {initials}
                                                </div>

                                                <div className='min-w-0 flex-1'>
                                                    <div className='flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
                                                        <div>
                                                            <p className='text-lg font-bold text-gray-900'>{review.propertyName}</p>
                                                            {stayText ? <p className='mt-1 text-sm text-gray-500'>{stayText}</p> : null}
                                                        </div>

                                                        <div className='rounded-full bg-white px-3 py-1 text-sm font-semibold text-gray-900'>
                                                            {'⭐'.repeat(Math.max(1, Math.min(5, review.rating || 0)))}
                                                            <span className='ml-1'>{review.rating || 0}</span>
                                                        </div>
                                                    </div>

                                                    <p className='mt-3 leading-relaxed text-gray-700'>
                                                        {review.text || 'No written review text was included.'}
                                                    </p>

                                                    <div className='mt-4 flex flex-wrap gap-3 text-sm'>
                                                        {review.utilityCost !== null && review.utilityCost !== undefined ? (
                                                            <span className='rounded-full bg-yellow-100 px-3 py-1 font-medium text-yellow-800'>
                                                                Utilities: ${review.utilityCost}
                                                            </span>
                                                        ) : null}
                                                        {review.propertyId ? (
                                                            <Link to={`/properties/${review.propertyId}`} className='font-semibold text-yellow-700 hover:text-yellow-600'>
                                                                View property
                                                            </Link>
                                                        ) : null}
                                                    </div>
                                                </div>
                                            </div>
                                        </article>
                                    )
                                })}

                                {reviews.length > visibleReviews.length ? (
                                    <p className='text-sm text-gray-500'>Showing your latest {visibleReviews.length} reviews.</p>
                                ) : null}
                            </div>
                        )}
                    </SectionCard>

                    {user.role === 'Landlord' ? (
                        <SectionCard title='Your properties' subtitle='A quick look at the listings attached to your landlord account.'>
                            {propertyLoading ? (
                                <p className='text-gray-600'>Loading your properties...</p>
                            ) : propertyError ? (
                                <p className='rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700'>{propertyError}</p>
                            ) : properties.length === 0 ? (
                                <EmptyState
                                    title='No properties added yet.'
                                    subtitle='Create your first listing to start showing up in search results.'
                                    actionTo='/manage/add'
                                    actionLabel='Add property'
                                />
                            ) : (
                                <div className='space-y-4'>
                                    {visibleProperties.map((property) => {
                                        const propertyImage = getPropertyImage(property)

                                        return (
                                            <div key={property.propertyId} className='rounded-2xl border border-gray-100 bg-gray-50 p-4'>
                                                <div className='flex flex-col gap-4 md:flex-row md:items-start'>
                                                    <div className='flex h-24 w-full shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gray-200 text-gray-400 md:w-40'>
                                                        {propertyImage ? (
                                                            <img src={propertyImage} className='h-full w-full object-cover' alt={property.name} />
                                                        ) : (
                                                            <span className='text-sm font-medium'>No Image</span>
                                                        )}
                                                    </div>

                                                    <div className='min-w-0 flex-1'>
                                                        <h3 className='text-lg font-bold text-gray-900'>{property.name}</h3>
                                                        <p className='mt-1 text-sm text-gray-500'>📍 {property.address}</p>

                                                        <div className='mt-4 flex flex-wrap gap-2'>
                                                            <Link to={`/properties/${property.propertyId}`} className='inline-flex rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-800 transition-colors hover:bg-gray-100'>
                                                                View
                                                            </Link>
                                                            <Link to={`/manage/edit/${property.propertyId}`} className='inline-flex rounded-lg bg-yellow-400 px-3 py-2 text-sm font-semibold text-gray-900 transition-colors hover:bg-yellow-500'>
                                                                Edit
                                                            </Link>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}

                                    {properties.length > visibleProperties.length ? (
                                        <div>
                                            <Link to='/manage' className='font-semibold text-yellow-700 hover:text-yellow-600'>
                                                View all properties
                                            </Link>
                                        </div>
                                    ) : null}
                                </div>
                            )}
                        </SectionCard>
                    ) : (
                        <SectionCard title='Next steps' subtitle='A few quick ways to keep exploring the platform.'>
                            <div className='grid gap-4 md:grid-cols-3'>
                                <Link to='/properties' className='rounded-2xl border border-gray-100 bg-gray-50 p-4 transition-colors hover:bg-yellow-50'>
                                    <p className='font-semibold text-gray-900'>Browse listings</p>
                                    <p className='mt-1 text-sm text-gray-500'>Find more places around campus and downtown.</p>
                                </Link>
                                <Link to='/map' className='rounded-2xl border border-gray-100 bg-gray-50 p-4 transition-colors hover:bg-yellow-50'>
                                    <p className='font-semibold text-gray-900'>Open the map</p>
                                    <p className='mt-1 text-sm text-gray-500'>Compare options visually before visiting a listing.</p>
                                </Link>
                                <Link to='/properties' className='rounded-2xl border border-gray-100 bg-gray-50 p-4 transition-colors hover:bg-yellow-50'>
                                    <p className='font-semibold text-gray-900'>Leave more reviews</p>
                                    <p className='mt-1 text-sm text-gray-500'>Help other students with your rental experience.</p>
                                </Link>
                            </div>
                        </SectionCard>
                    )}
                </main>
            </div>
        </div>
    )
}

export default Profile
