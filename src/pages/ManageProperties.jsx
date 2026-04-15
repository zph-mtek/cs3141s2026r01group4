import React, { useState } from 'react';
import { HiOutlineChatBubbleLeftRight, HiOutlineTrash } from "react-icons/hi2";
import { Link } from 'react-router-dom';


const mockProperties = [
  {
    id: 1,
    name: "Wadsworth Hall",
    listedAt: "2025-08-15",
    imageUrl: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=400&q=80",
    commentCount: 12
  },
  {
    id: 2,
    name: "Hillside Apartments",
    listedAt: "2025-09-01",
    imageUrl: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=400&q=80",
    commentCount: 3
  },
  {
    id: 3,
    name: "Daniell Heights",
    listedAt: "2025-10-10",
    imageUrl: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=400&q=80",
    commentCount: 0
  },
];

const ManageProperties = () => {
  const [properties, setProperties] = useState(mockProperties);

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
            placeholder='Search properties by name...'
            className='w-full h-13 border-2 border-yellow-400 pl-5 pr-10 rounded-3xl focus:outline-none focus:ring-4 focus:ring-yellow-400/20 transition-all text-gray-700 font-medium shadow-sm'
          />
          <svg className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </div>

      </div>

      {/* card section */}
      <div className='flex flex-col gap-4'>
        <div className='flex items-center justify-between border-b-2 border-gray-100 pb-3'>
          <h2 className='text-xl font-bold text-gray-800'>Manage Properties</h2>
          <span className='bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold'>
            {properties.length} Total Listings
          </span>
        </div>

        {properties.map(property => (
          <div key={property.id} className='flex flex-col lg:flex-row items-start lg:items-center justify-between p-4 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow gap-6'>

            {/*pic and date */}
            <div className='flex items-center gap-5 lg:w-1/2 w-full'>
              <div className='h-24 w-32 shrink-0 rounded-xl overflow-hidden bg-gray-100 border border-gray-200'>
                {property.imageUrl ? (
                  <img src={property.imageUrl} alt={property.name} className='h-full w-full object-cover' />
                ) : (
                  <div className='h-full w-full flex items-center justify-center text-gray-400 text-xs font-bold'>No Image</div>
                )}
              </div>
              <div className='flex flex-col'>
                <p className='font-extrabold text-gray-900 text-xl leading-tight'>{property.name}</p>
                <div className='flex items-center gap-2 mt-2'>
                  <span className='text-xs font-bold text-gray-500 uppercase tracking-wide'>Listed on</span>
                  <span className='text-sm text-gray-700 font-medium'>{property.listedAt}</span>
                </div>
              </div>
            </div>

            <div className='flex flex-col sm:flex-row items-center gap-3 lg:w-1/2 w-full justify-between lg:justify-end mt-2 lg:mt-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-gray-100'>

              {/* check cmments) */}
              <Link
                to={`/admin/managecomments`}
                className='w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold py-2.5 px-5 rounded-xl transition-colors duration-200 text-sm relative group'
              >
                <HiOutlineChatBubbleLeftRight className="text-lg" />
                <span>View Comments</span>
                {/* number of comments */}
                {property.commentCount > 0 && (
                  <span className='absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm group-hover:scale-110 transition-transform'>
                    {property.commentCount}
                  </span>
                )}
              </Link>

              {/* delete button */}
              <button className='cursor-pointer w-full sm:w-auto flex items-center justify-center gap-2 bg-white border-2 border-red-100 text-red-500 hover:bg-red-500 hover:text-white hover:border-red-500 font-bold py-2 px-5 rounded-xl transition-all duration-200 text-sm'>
                <HiOutlineTrash className="cursor-pointer text-lg" />
                <span>Delete</span>
              </button>

            </div>
          </div>
        ))}
      </div>

    </div>
  )
}

export default ManageProperties;