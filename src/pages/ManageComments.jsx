import React, { useState } from 'react';
import { HiOutlineTrash } from "react-icons/hi2";
import { Link } from 'react-router-dom';


const mockComments = [
  { 
    id: 1, 
    authorName: "John Doe", 
    authorEmail: "john.d@mtu.edu", 
    propertyName: "Wadsworth Hall",
    rating: 4, 
    commentText: "great",
    postedAt: "2025-11-05"
  },
  { 
    id: 2, 
    authorName: "Alice Smith", 
    authorEmail: "asmith@example.com", 
    propertyName: "Hillside Apartments",
    rating: 1, 
    commentText: "bad",
    postedAt: "2025-11-02"
  },
  { 
    id: 3, 
    authorName: "Mike Johnson", 
    authorEmail: "mjohnson@mtu.edu", 
    propertyName: "Daniell Heights",
    rating: 5, 
    commentText: "mid",
    postedAt: "2025-10-28"
  },
];

const ManageComments = () => {
  const [comments, setComments] = useState(mockComments);

  // setting stars here
  const renderStars = (rating) => {
    return (
      <div className="flex gap-0.5 text-lg">
        {[...Array(5)].map((_, i) => (
          <span key={i} className={i < rating ? "text-yellow-400" : "text-gray-200"}>
            ★
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className='max-w-6xl mx-auto p-6 md:p-10 flex flex-col gap-10'>
      
      {/* search bar */}
      <div className='flex justify-center items-center w-full pt-10 gap-3 md:gap-5'>
        {/* buttton to go back to admin page */}
        <Link
          to="/admin"
          className="flex items-center justify-center w-12 h-12 bg-white border-2 border-gray-200 rounded-full text-gray-500 hover:text-yellow-600 hover:border-yellow-400 hover:bg-yellow-50 transition-all shadow-sm shrink-0"
          title="Back to Admin Dashboard"
        >
          <svg className="w-6 h-6 pr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"></path>
          </svg>
        </Link>

        {/* search bar */}
        <div className='w-full md:w-[500px] relative'>
          <input
            type="text"
            placeholder='Search comments...'
            className='w-full h-13 border-2 border-yellow-400 pl-5 pr-10 rounded-3xl focus:outline-none focus:ring-4 focus:ring-yellow-400/20 transition-all text-gray-700 font-medium shadow-sm'
          />
          <svg className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </div>

      </div>

      {/* comments card */}
      <div className='flex flex-col gap-4'>
        <div className='flex items-center justify-between border-b-2 border-gray-100 pb-3'>
          <h2 className='text-xl font-bold text-gray-800'>Manage Comments</h2>
          <span className='bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold'>
            {comments.length} Total Comments
          </span>
        </div>
        
        {comments.map(comment => {
          // icon
          const initials = comment.authorName.split(' ').map(n => n[0]).join('').substring(0, 2);

          return (
            <div key={comment.id} className='flex flex-col lg:flex-row items-start lg:items-center justify-between p-5 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow gap-6'>

              {/* left side stuff */}
              <div className='flex items-start gap-4 lg:w-[30%] shrink-0'>
                <div className='h-12 w-12 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center font-extrabold text-lg shrink-0 mt-1'>
                  {initials}
                </div>
                <div className='overflow-hidden'>
                  <p className='font-bold text-gray-900 text-base leading-tight truncate'>{comment.authorName}</p>
                  <p className='text-sm text-gray-500 mt-0.5 truncate'>{comment.authorEmail}</p>
                  <p className='text-xs text-gray-400 mt-1 font-medium'>Posted: {comment.postedAt}</p>
                </div>
              </div>

              {/*middle stuff */}
              <div className='flex flex-col lg:w-1/2 w-full'>
                <div className='flex items-center gap-3 mb-2'>
                  {renderStars(comment.rating)}
                  <span className="text-gray-300 text-sm">|</span>
                  <span className='text-sm font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded'>
                    {comment.propertyName}
                  </span>
                </div>
                <p className='text-sm text-gray-600 italic line-clamp-3 bg-gray-50 p-3 rounded-xl border border-gray-100'>
                  "{comment.commentText}"
                </p>
              </div>

              {/* delete button */}
              <div className='cursor-pointer flex items-center lg:w-auto w-full justify-end mt-2 lg:mt-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-gray-100'>
                <button className='cursor-pointer w-full lg:w-auto flex items-center justify-center gap-2 bg-white border-2 border-red-100 text-red-500 hover:bg-red-500 hover:text-white hover:border-red-500 font-bold py-2.5 px-6 rounded-xl transition-all duration-200 text-sm'>
                  <HiOutlineTrash className="text-lg" />
                  <span>Delete</span>
                </button>
              </div>

            </div>
          )
        })}
      </div>
      
    </div>
  )
}

export default ManageComments;