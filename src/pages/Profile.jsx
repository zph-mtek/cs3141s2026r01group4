import React, { useEffect, useMemo, useState } from 'react'
import { jwtDecode } from "jwt-decode";
import { Link } from 'react-router-dom';
import axios from 'axios';
import pfp from "../assets/catpfp.jpg"

const Profile = () => {
    const API_BASE_URL = 'https://huskyrentlens.cs.mtu.edu';

    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [reviews, setReviews] = useState([]);
    const [reviewLoading, setReviewLoading] = useState(false);
    const [reviewError, setReviewError] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('token');

        if (token) {
            try {
                const decoded = jwtDecode(token);
                setUser(decoded.data);
            } catch (error) {
                console.error("Invalid token", error);
                localStorage.removeItem('token');
            }
        }

        setIsLoading(false);
    }, []);

    useEffect(() => {
        const userId = user?.userId;

        if (!userId) {
            setReviews([]);
            setReviewError('');
            return;
        }

        const normalizeReview = (review) => {
            const ratingRaw = review.rating ?? review.stars ?? review.starRating ?? 0;
            const rating = Number(ratingRaw) || 0;

            return {
                id: review.feedbackId ?? review.reviewId ?? review.id ?? `${review.propertyId}-${review.startDate ?? ''}-${review.endDate ?? ''}`,
                propertyId: review.propertyId ?? review.property_id ?? null,
                propertyName: review.propertyName ?? review.name ?? review.property ?? 'Property',
                startDate: review.startDate ?? review.start_date ?? '',
                endDate: review.endDate ?? review.end_date ?? '',
                rating,
                text: review.review ?? review.commentDesc ?? review.comment ?? '',
            };
        };

        const extractReviews = (payload) => {
            if (!payload) {
                return [];
            }

            if (Array.isArray(payload)) {
                return payload;
            }

            if (Array.isArray(payload.reviews)) {
                return payload.reviews;
            }

            if (Array.isArray(payload.data)) {
                return payload.data;
            }

            if (payload.data && Array.isArray(payload.data.reviews)) {
                return payload.data.reviews;
            }

            if (payload.data && Array.isArray(payload.data.data)) {
                return payload.data.data;
            }

            return [];
        };

        const fetchReviews = async () => {
            setReviewLoading(true);
            setReviewError('');

            const attempts = [
                () => axios.get(`${API_BASE_URL}/backend/fetchUserReviews.php?userId=${userId}`),
                () => axios.get(`${API_BASE_URL}/backend/fetchReviewsByUser.php?userId=${userId}`),
                () => axios.post(`${API_BASE_URL}/connect.php`, { userId, myReviews: 'yes' }, { headers: { 'Content-Type': 'application/json' } }),
                () => axios.post(`${API_BASE_URL}/feedback.php`, { userId, getReviews: 'yes' }, { headers: { 'Content-Type': 'application/json' } }),
            ];

            let loaded = false;

            for (const attempt of attempts) {
                try {
                    const response = await attempt();
                    const raw = extractReviews(response?.data);

                    if (raw.length >= 0) {
                        setReviews(raw.map(normalizeReview));
                        loaded = true;
                        break;
                    }
                } catch {
                    // Try next endpoint pattern
                }
            }

            if (!loaded) {
                setReviews([]);
                setReviewError('Could not load your reviews right now.');
            }

            setReviewLoading(false);
        };

        fetchReviews();
    }, [user]);

    const profileData = useMemo(() => {
        if (!user) {
            return null;
        }

        const nameFromParts = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
        const displayName = user.name || user.fullName || user.username || nameFromParts || user.email || `User #${user.userId ?? ''}`;

        const joinedRaw = user.joinedAt || user.createdAt || user.created_at || user.registeredAt || user.iat;
        const joinedDate = joinedRaw
            ? new Date(
                typeof joinedRaw === 'number' && joinedRaw.toString().length <= 10
                    ? joinedRaw * 1000
                    : joinedRaw
            )
            : null;

        const joinedText = joinedDate && !Number.isNaN(joinedDate.getTime())
            ? joinedDate.toLocaleDateString()
            : 'Not available';

        const reviewCount = reviews.length || user.reviewCount || user.reviewsCount || user.reviewsWritten || 0;

        return {
            displayName,
            joinedText,
            email: user.email || 'Not available',
            role: user.role || 'Not available',
            reviewCount
        };
    }, [user, reviews]);

    if (isLoading) {
        return (
            <div className='pt-30 md:pt-20 px-6 text-center'>
                <p className='text-lg text-gray-600'>Loading profile...</p>
            </div>
        );
    }

    if (!user || !profileData) {
        return (
            <div className='pt-30 md:pt-20 px-6'>
                <div className='max-w-xl mx-auto rounded-2xl shadow-md p-8 text-center'>
                    <h1 className='text-3xl font-bold mb-3'>Profile</h1>
                    <p className='text-gray-600 mb-6'>Please sign in to view your profile.</p>
                    <Link
                        to='/login'
                        className='inline-flex items-center justify-center bg-yellow-400 hover:bg-yellow-500 transition px-6 py-2 rounded-full font-semibold'
                    >
                        Go to Login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className='pt-30 md:pt-12 grid grid-cols-1 xl:grid-cols-[auto_auto] p-8 xl:p-16 gap-8 justify-center items-start'>
            <div className='md:sticky top-30 flex flex-col items-center justify-center shrink-0'>
                <img src={pfp} alt="" className='rounded-full shrink-0 object-cover h-70 border-yellow-400 border-4'/>

                
                <div className='flex flex-col justify-items-center items-center pt-5'>
                    <p className='font-bold text-2xl text-center'>{profileData.displayName}</p>
                    <p className='text-sm text-gray-500'>Joined: {profileData.joinedText}</p>
                    <p>Email: {profileData.email}</p>
                    <p>Role: {profileData.role}</p>
                    <p>Reviews written: {profileData.reviewCount}</p>
                </div>
            </div>

            <div className='flex items-center flex-col justify-center w-full'>
                <div className='w-full max-w-2xl h-auto shadow-md rounded-2xl p-6'>
                    <h2 className='text-2xl font-semibold mb-3'>My Activity</h2>
                    {reviewLoading ? (
                        <p className='text-gray-700'>Loading your reviews...</p>
                    ) : reviewError ? (
                        <p className='text-red-600'>{reviewError}</p>
                    ) : reviews.length === 0 ? (
                        <p className='text-gray-700'>You have not written any reviews yet.</p>
                    ) : (
                        <div className='space-y-4'>
                            {reviews.map((review) => (
                                <div key={review.id} className='border border-gray-200 rounded-xl p-4'>
                                    <div className='flex items-center gap-3'>
                                        <img src={pfp} alt="" className='rounded-full h-10 w-10 object-cover border-2 border-yellow-400' />
                                        <div className='flex-1'>
                                            <p className='font-semibold text-lg'>{review.propertyName}</p>
                                            {(review.startDate || review.endDate) && (
                                                <p className='text-sm text-gray-500'>{review.startDate} {review.endDate ? `~ ${review.endDate}` : ''}</p>
                                            )}
                                        </div>
                                        <p className='font-semibold'>
                                            {'⭐'.repeat(Math.max(0, Math.min(5, review.rating)))}
                                            <span className='ml-1'>{review.rating}</span>
                                        </p>
                                    </div>
                                    <p className='mt-3 text-gray-700'>{review.text || 'No review text provided.'}</p>
                                    {review.propertyId && (
                                        <div className='mt-3'>
                                            <Link to={`/properties/${review.propertyId}`} className='text-yellow-700 hover:text-yellow-500 font-medium'>
                                                View Property
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Profile