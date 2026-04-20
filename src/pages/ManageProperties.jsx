import React, { useState, useEffect } from 'react';
import { HiOutlineChatBubbleLeftRight, HiOutlineTrash } from "react-icons/hi2";
import { Link } from 'react-router-dom';
import { getAdminProperties, deleteProperty } from '../API/adminActions'; 

const ManageProperties = () => {
  const [properties, setProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchProperties = async () => {
    setIsLoading(true);
    try {
      const result = await getAdminProperties();
      if (result.status === 'success') {
        setProperties(result.data || []);
      }
    } catch (error) {
      console.error("Fetch properties error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const handleDeleteProperty = async (propertyId, propertyName) => {
    if (!window.confirm(`「${propertyName}」delete this property?`)) {
      return;
    }

    try {
      const res = await deleteProperty(propertyId);
      if (res.status === 'success') {
        alert("delete");
        fetchProperties(); 
      } else {
        alert("failed to delete: " + res.message);
      }
    } catch (error) {
      alert("connection error");
      console.error(error);
    }
  };

  const displayedProperties = properties.filter((property) => {
    if (!searchTerm) return true;
    return (property.name || '').toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className='max-w-6xl mx-auto p-6 md:p-10 flex flex-col gap-10'>

      {/* ───── Search Bar Section ───── */}
      <div className='flex justify-center items-center w-full pt-10 gap-3 md:gap-5'>
        <Link to="/admin" className="flex items-center justify-center w-12 h-12 bg-white border-2 border-gray-200 rounded-full text-gray-500 hover:text-yellow-600 hover:border-yellow-400 hover:bg-yellow-50 transition-all shadow-sm shrink-0" title="Back to Admin Dashboard">
          <svg className="w-6 h-6 pr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"></path></svg>
        </Link>
        <div className='w-full md:w-[500px] relative'>
          <input 
            type="text" 
            placeholder='Search properties by name...' 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='w-full h-13 border-2 border-yellow-400 pl-5 pr-10 rounded-3xl focus:outline-none focus:ring-4 focus:ring-yellow-400/20 transition-all text-gray-700 font-medium shadow-sm'
          />
          <svg className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
        </div>
      </div>

      {/* ───── Card Section ───── */}
      <div className='flex flex-col gap-4'>
        <div className='flex items-center justify-between border-b-2 border-gray-100 pb-3'>
          <h2 className='text-xl font-bold text-gray-800'>Manage Properties</h2>
          <span className='bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold'>
            {displayedProperties.length} Total Listings
          </span>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-yellow-200 border-t-yellow-500 rounded-full animate-spin"></div></div>
        ) : displayedProperties.length > 0 ? (
          displayedProperties.map(property => (
            <div key={property.id} className='flex flex-col lg:flex-row items-start lg:items-center justify-between p-4 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow gap-6'>

              {/* Pic and Date */}
              <div className='flex items-center gap-5 lg:w-1/2 w-full'>
                <div className='h-24 w-32 shrink-0 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center'>
                  {property.imageUrl ? (
                    <img src={'https://huskyrentlens.cs.mtu.edu//' + property.imageUrl} />
                  ) : (
                    <span className='text-gray-400 text-xs font-bold'>No Image</span>
                  )}
                </div>
                <div className='flex flex-col'>
                  <p className='font-extrabold text-gray-900 text-xl leading-tight'>{property.name}</p>
                  <div className='flex items-center gap-2 mt-2'>
                    <span className='text-xs font-bold text-gray-500 uppercase tracking-wide'>Listed on</span>
                    <span className='text-sm text-gray-700 font-medium'>{property.listedAt ? property.listedAt.split(' ')[0] : 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className='flex flex-col sm:flex-row items-center gap-3 lg:w-1/2 w-full justify-between lg:justify-end mt-2 lg:mt-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-gray-100'>

                {/* View Comments Button */}
                <Link
                  to={`/admin/managecomments?propertyId=${property.id}`}
                  className='w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold py-2.5 px-5 rounded-xl transition-colors duration-200 text-sm relative group'
                >
                  <HiOutlineChatBubbleLeftRight className="text-lg" />
                  <span>View Comments</span>
                  {property.commentCount > 0 && (
                    <span className='absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm group-hover:scale-110 transition-transform'>
                      {property.commentCount}
                    </span>
                  )}
                </Link>

                {/* 🚨 Delete Button */}
                <button 
                  onClick={() => handleDeleteProperty(property.id, property.name)}
                  className='cursor-pointer w-full sm:w-auto flex items-center justify-center gap-2 bg-white border-2 border-red-100 text-red-500 hover:bg-red-500 hover:text-white hover:border-red-500 font-bold py-2 px-5 rounded-xl transition-all duration-200 text-sm'
                >
                  <HiOutlineTrash className="cursor-pointer text-lg" />
                  <span>Delete</span>
                </button>

              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 py-10 font-bold">No properties found.</p>
        )}
      </div>

    </div>
  )
}

export default ManageProperties;