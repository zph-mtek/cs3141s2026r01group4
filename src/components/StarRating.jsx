import React, { useState, Fragment } from 'react'
import { FaStar } from "react-icons/fa";

const StarRating = () => {

    const [rating, setRating] = useState(null);
    const [rateColor, setColor] = useState(null);

    return (
        <Fragment>
            <div className='w-full pt-10'>
                <div className='flex flex-col md:flex-row md:items-center'>
                    
                    {/* 1. HIDDEN INPUT FOR GLOBAL ACCESS */}
                    <input type="hidden" id="reviewStars" value={rating ?? 0} readOnly />

                    <div className='flex gap-1 justify-center md:justify-start'>
                        {[...Array(5)].map((star, index) => {
                            const currentRate = index + 1;
                            return (
                                <label key={index} className='cursor-pointer'>
                                    <input
                                        type="radio"
                                        name='rate'
                                        // Removed duplicate ID from here
                                        value={currentRate}
                                        onClick={() => setRating(currentRate)}
                                        className='hidden'
                                    />
                                    <FaStar
                                        size={30}
                                        color={currentRate <= (rateColor || rating) ? "#ffc107" : "#e4e5e9"}
                                        onMouseEnter={() => setColor(currentRate)}
                                        onMouseLeave={() => setColor(null)}
                                        className='transition-colors duration-200'
                                    />
                                </label>
                            )
                        })}
                    </div>
                    {/* Optional: Visual display to confirm it works */}
                    <p className="ml-4 text-gray-500">{rating} Husky Stars</p>
                </div>
            </div>
        </Fragment>
    )
}

export default StarRating