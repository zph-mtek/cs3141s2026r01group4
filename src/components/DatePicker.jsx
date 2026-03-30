import React, { Fragment, useState } from 'react';
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
 
const DatePicker = () => {
 
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
 
    const handleStartDateChange = (date) => {
        setStartDate(date);
        if (date > endDate) {
            setEndDate(date);
        }
    };
 
    return (
        <Fragment>
            <div className="md:ml-5 mt-4 md:mt-0 flex flex-col sm:flex-row gap-2 items-center justify-center md:justify-start">
                <div className="flex items-center gap-2">
                    <label>Start:</label>
                    <ReactDatePicker
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
                    <ReactDatePicker
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
        </Fragment>
    )
}
 
export default DatePicker
 