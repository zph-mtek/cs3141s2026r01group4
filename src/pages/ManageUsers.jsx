import React, { useState } from 'react';
import { Link } from 'react-router-dom';


// test date for now
const mockUsers = [
  { id: 1, firstName: "John", lastName: "Doe", email: "john.doe@mtu.edu", createdAt: "2023-10-01", role: "MTU_student", isVerified: true },
  { id: 2, firstName: "Jane", lastName: "Smith", email: "jane.smith@example.com", createdAt: "2023-09-15", role: "landlord", isVerified: false },
  { id: 3, firstName: "Admin", lastName: "User", email: "admin@huskyrentlens.com", createdAt: "2023-01-10", role: "admin", isVerified: true },
];

const ManageUsers = () => {
  // set data from API
  const [users, setUsers] = useState(mockUsers);

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
            placeholder='Search users by name...'
            className='w-full h-13 border-2 border-yellow-400 pl-5 pr-10 rounded-3xl focus:outline-none focus:ring-4 focus:ring-yellow-400/20 transition-all text-gray-700 font-medium shadow-sm'
          />
          <svg className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </div>

      </div>

      

      {/* user card section */}
      <div className='flex flex-col gap-4'>
        <h2 className='text-xl font-bold text-gray-800 border-b-2 border-gray-100 pb-3'>Manage Users</h2>
        
        {users.map(user => (
          <div key={user.id} className='flex flex-col lg:flex-row items-start lg:items-center justify-between p-5 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow gap-4 lg:gap-0'>

            {/* icon and name */}
            <div className='flex items-center gap-4 lg:w-1/4'>
              {/* user icon */}
              <div className='h-12 w-12 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center font-extrabold text-lg shrink-0'>
                {user.firstName[0]}{user.lastName[0]}
              </div>
              <div>
                <p className='font-bold text-gray-900 text-lg'>{user.firstName} {user.lastName}</p>
              </div>
            </div>

            {/* date joined */}
            <div className='flex flex-col lg:w-1/4'>
              <p className='text-sm font-semibold text-gray-700'>{user.email}</p>
              <p className='text-xs text-gray-400 mt-1'>Joined: {user.createdAt}</p>
            </div>

            {/* Role*/}
            <div className='lg:w-1/6'>
              <span className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase ${
                user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                user.role === 'landlord' ? 'bg-blue-100 text-blue-700' :
                'bg-green-100 text-green-700'
              }`}>
                {user.role === 'MTU_student' ? 'Student' : user.role}
              </span>
            </div>

            {/* Ban button */}
            <div className='flex items-center gap-4 lg:w-auto w-full justify-between lg:justify-end mt-2 lg:mt-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-gray-100'>
              
              {/* drop down for vertification */}
              <div className='flex items-center gap-2'>
                <select 
                  defaultValue={user.isVerified ? "verified" : "unverified"}
                  className={`border text-sm rounded-xl focus:ring-yellow-400 focus:border-yellow-400 block p-2.5 cursor-pointer outline-none font-medium transition-colors ${
                    user.isVerified ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-gray-50 border-gray-200 text-gray-600'
                  }`}
                >
                  <option value="verified">✅ Verified</option>
                  <option value="unverified">⏳ Unverified</option>
                </select>
              </div>

              {/* Ban button */}
              <button className='bg-red-50 cursor-pointer text-red-600 hover:bg-red-500 hover:text-white font-bold py-2.5 px-6 rounded-xl transition-colors duration-200 text-sm'>
                Ban User
              </button>

            </div>
          </div>
        ))}
      </div>
      
    </div>
  )
}

export default ManageUsers;