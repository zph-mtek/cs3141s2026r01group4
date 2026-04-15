import React, { useState } from 'react';
import { HiOutlineExternalLink } from "react-icons/hi";
import { FaQuoteLeft } from "react-icons/fa";
import { Link } from 'react-router-dom';


const mockReports = [
  { 
    id: 1, 
    reporterName: "Alice Walker", 
    commentAuthor: "AngryHusky99",
    propertyName: "Wadsworth Hall", 
    commentText: "Trash",
    reason: "Inappropriate language / Harassment", 
    reportedAt: "2023-11-02", 
    status: "Pending" 
  },
  { 
    id: 2, 
    reporterName: "Bob Johnson", 
    commentAuthor: "SpamBot",
    propertyName: "Hillside Apartments", 
    commentText: "Click here to get $10000000000000000000 👉 http://scam.com",
    reason: "Spam / Phishing link", 
    reportedAt: "2023-11-01", 
    status: "Pending" 
  },
];

const ManageReports = () => {
  const [reports, setReports] = useState(mockReports);

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
            placeholder='Search reports by name or keywords...'
            className='w-full h-13 border-2 border-yellow-400 pl-5 pr-10 rounded-3xl focus:outline-none focus:ring-4 focus:ring-yellow-400/20 transition-all text-gray-700 font-medium shadow-sm'
          />
          <svg className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </div>

      </div>

      {/*report cards */}
      <div className='flex flex-col gap-5'>
        <div className='flex items-center justify-between border-b-2 border-gray-100 pb-3'>
          <h2 className='text-xl font-bold text-gray-800'>Reported Comments</h2>
          <span className='bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-bold'>
            {reports.length} Pending
          </span>
        </div>
        
        {reports.map(report => {
          // icon 
          const initials = report.reporterName.split(' ').map(n => n[0]).join('').substring(0, 2);

          return (
            <div key={report.id} className='flex flex-col lg:flex-row items-start justify-between p-6 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow gap-6'>

              {/* icon and date */}
              <div className='flex items-start gap-4 lg:w-1/5'>
                <div className='h-12 w-12 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center font-extrabold text-lg shrink-0 mt-1'>
                  {initials}
                </div>
                <div>
                  <p className='text-xs text-gray-400 mb-0.5'>Reported by</p>
                  <p className='font-bold text-gray-900 text-base leading-tight'>{report.reporterName}</p>
                  <p className='text-xs text-gray-400 mt-1'>{report.reportedAt}</p>
                </div>
              </div>

              {/* reasons */}
              <div className='flex flex-col lg:w-1/2 w-full'>
                <div className='flex items-center gap-2 mb-2'>
                  <span className='font-bold text-sm text-gray-700'>Comment by:</span>
                  <span className='bg-gray-100 text-gray-800 px-2 py-0.5 rounded text-xs font-bold'>{report.commentAuthor}</span>
                  <span className='text-sm text-gray-400'>on</span>
                  <span className='font-bold text-sm text-blue-600 hover:underline cursor-pointer flex items-center gap-1'>
                    {report.propertyName}
                    <HiOutlineExternalLink />
                  </span>
                </div>

                {/* comment text */}
                <div className='bg-gray-50 border border-gray-200 rounded-xl p-4 relative mb-3'>
                  <FaQuoteLeft className="text-gray-300 absolute top-3 left-3 opacity-50" size={14} />
                  <p className='text-sm text-gray-700 italic pl-5 line-clamp-3'>
                    "{report.commentText}"
                  </p>
                </div>

                {/* rport reason */}
                <div className='flex items-start gap-2'>
                  <span className='bg-orange-100 text-orange-700 px-2 py-0.5 rounded text-xs font-bold shrink-0 mt-0.5'>Reason</span>
                  <p className='text-sm font-medium text-gray-600'>{report.reason}</p>
                </div>
              </div>

              {/* button */}
              <div className='flex flex-row lg:flex-col items-center lg:items-end gap-3 lg:w-auto w-full justify-between lg:justify-center mt-2 lg:mt-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-gray-100'>
                
                {/* delete button */}
                <button className='w-full lg:w-40 bg-red-50 text-red-600 hover:bg-red-500 hover:text-white font-bold py-2.5 px-4 rounded-xl transition-colors duration-200 text-sm'>
                  Delete Comment
                </button>

                {/* Dismiss button */}
                <button className='w-full lg:w-40 bg-white border-2 border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50 font-bold py-2 px-4 rounded-xl transition-colors duration-200 text-sm'>
                  Dismiss Report
                </button>

              </div>
            </div>
          )
        })}
      </div>
      
    </div>
  )
}

export default ManageReports;