import React, { useState, Fragment } from 'react';

const ReviewTextBox = () => {
    return (
        <Fragment>
            <textarea name="" id="reviewText" placeholder="Share your experience..." className="w-full h-60 p-2 rounded resize-none border-2 mt-5 focus:outline-none rounded-2 "></textarea>
        </Fragment>
    )
}

export default ReviewTextBox;