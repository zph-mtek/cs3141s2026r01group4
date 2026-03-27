import React, { useState } from 'react'
import { FaStar } from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const StarRating = () => {

    const [rating, setRating] = useState(null);
    const [rateColor, setColor] = useState(null);

    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());

    const handleStartDateChange = (date) => {
        setStartDate(date);
        if (date > endDate) {
            setEndDate(date);
        }
    };

    return (
        <div className='max-w-2xl mx-auto pt-20 px-4'>
            <div>
                <div className='flex flex-col sm:flex-row items-center text-center sm:text-left'>
                    <img src='https://res.cloudinary.com/dxhogizsr/image/upload/v1773440484/herm-iceland-4524112_1920_liwlzf.jpg'
                    className='w-40 object-cover rounded-2xl'
                    />
                    <p className='pl-0 sm:pl-5 pt-4 sm:pt-0 text-2xl font-bold'>Husky Heights</p>
                </div>
            </div>   

            <div className='w-full pt-10'>
                <div className='flex flex-col md:flex-row md:items-center'>
                    
                    <div className='flex gap-1 justify-center md:justify-start'>
                        {[...Array(5)].map((star, index) => {
                            const currentRate = index + 1;
                            return (
                                <label key={index} className='cursor-pointer'>
                                    <input
                                        type="radio"
                                        name='rate'
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

                    <div className="md:ml-5 mt-4 md:mt-0 flex flex-col sm:flex-row gap-2 items-center justify-center md:justify-start">
                        <div className="flex items-center gap-2">
                            <label>Start:</label>
                            <DatePicker
                                className='border-2 p-1 rounded w-full max-w-35'
                                selected={startDate}
                                onChange={handleStartDateChange} 
                                selectsStart 
                                startDate={startDate}
                                endDate={endDate}
                                required
                            />
                        </div>

                        <div className="flex items-center gap-2 mt-2 sm:mt-0">
                            <label>End:</label>
                            <DatePicker
                                className='border-2 p-1 rounded w-full max-w-35'
                                selected={endDate}
                                onChange={date => setEndDate(date)}
                                selectsEnd 
                                startDate={startDate}
                                endDate={endDate}
                                minDate={startDate} 
                                required
                            />
                        </div>
                    </div>
                </div>

                <textarea name="" id="" placeholder="Share your experience..." className="w-full h-60 p-2 rounded resize-none border-2 mt-5 focus:outline-none rounded-2 ">
                </textarea>
                <button className='w-full text-lg font-bold bg-yellow-400 mt-3 h-12 rounded-2xl cursor-pointer hover:bg-yellow-400/70 transition-colors mb-20'>Post review</button>
            </div>
        </div>
    )
}

export default StarRating