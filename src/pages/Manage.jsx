import React, { useEffect, useState } from 'react'
import { jwtDecode } from "jwt-decode";
import { Link } from 'react-router-dom';
import axios from 'axios';
import { getPropertyiesByLandlordId } from '../API/getPropertyiesByLandlordId';

const Manage = () => {
  document.title = 'Manage Properties | HuskyRentLens';
  const [user, setUser] = useState(null);
  const [propertyData, setPropertyData] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser(decoded.data);
      } catch (error) {
        console.error("Invalid token", error);
        localStorage.removeItem('token');
      }
    }
  }, []);

  useEffect(()=>{
    if(user){
      const fetchMyProperties = async () => {
        try{
          const response = await getPropertyiesByLandlordId();
          setPropertyData(response.data || []); 
        }catch(error){
          console.log("error fetching property", error)
        }
      }
      fetchMyProperties();
    }
  }, [user])

  return (
    <div className='max-w-4xl mx-auto pt-20 px-5 pb-20'>
      
      <div className='flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-10 border-b pb-5'>
        <div>
          <h1 className='text-3xl font-bold'>Hello, {user ? user.firstName : 'Loading...'}!</h1>
          <p className='text-gray-500 mt-2'>Manage your properties</p>
        </div>
        
        <Link to="/manage/add">
          <button className='bg-yellow-400 hover:bg-yellow-300 px-6 py-3 rounded-xl font-bold cursor-pointer transition-colors shadow-sm'>
            + Add New Property
          </button>
        </Link>
      </div>

      <div className="space-y-4">
        {propertyData && propertyData.length > 0 ? (
          propertyData.map((property) => (
            <div 
              key={property.propertyId} 
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white p-4 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow gap-4"
            >
              
              <div className="flex items-center space-x-4">

                <div className="w-24 h-18 sm:w-32 sm:h-24 bg-gray-200 rounded-xl flex-shrink-0 overflow-hidden flex justify-center items-center text-gray-400">
                  {property.images && property.images.length > 0 ? (
                    <img 
                      src={`https://huskyrentlens.cs.mtu.edu/backend/${property.images[0].imageUrl}`} 
                      className="w-full h-full object-cover" 
                      alt={property.name} 
                    />
                  ) : (
                    <span className="text-sm font-medium">No Image</span>
                  )}
                </div>

                <div>
                  <h2 className="text-xl font-bold text-gray-900">{property.name}</h2>
                  <p className="text-gray-500 text-sm mt-1">📍 {property.address}</p>
                </div>
                
              </div>

              <div className="sm:ml-4 sm:flex-shrink-0">
                <Link to={`/manage/edit/${property.propertyId}`}>
                  <button className="w-full sm:w-auto bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-2 px-6 rounded-lg transition-colors cursor-pointer border border-gray-200">
                    Manage
                  </button>
                </Link>
              </div>

            </div>
          ))
        ) : (
          <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
            <p className="text-gray-500 text-lg font-medium">No properties found.</p>
            <p className="text-gray-400 mt-1">Click the button above to add your first property!</p>
          </div>
        )}
      </div>

    </div>
  )
}

export default Manage