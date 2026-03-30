import React, { useState, Fragment } from 'react';

const ReviewTextBox = () => {
    return (
        <Fragment>
            <textarea name="" id="" placeholder="Share your experience..." className="w-full h-60 p-2 rounded resize-none border-2 mt-5 focus:outline-none rounded-2 "></textarea>
            <button className='w-full text-lg font-bold bg-yellow-400 mt-3 h-12 rounded-2xl cursor-pointer hover:bg-yellow-400/70 transition-colors mb-20'>
                Post review
            </button>
        </Fragment>
    )
}

export default ReviewTextBox;