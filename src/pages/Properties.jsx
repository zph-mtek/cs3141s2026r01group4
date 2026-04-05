import React, { Fragment, useState, useEffect } from 'react'
import addressIcon from "../assets/maps-and-flags.png";
import { Link } from 'react-router-dom';
import { getAllProperties } from '../API/getAllProperties'; 


const PropertyCard = ({ propInfo }) => {
  const mainImage = propInfo.images && propInfo.images.length > 0 
    ? `https://huskyrentlens.cs.mtu.edu/backend/${propInfo.images[0].imageUrl}` 
    : '';

  return (
    <Link to={`/properties/${propInfo.propertyId}`}> 
          
          <div className='flex flex-col rounded-2xl h-110 2xl:h-100 bg-white overflow-hidden cursor-pointer hover:bg-amber-200 transform transition duration-300 group'>
            <div className='p-5'>
              <img className='h-55 w-full object-cover rounded-2xl '
                  src={mainImage}
              alt={propInfo.name} />
            </div>

            <div className='px-5 flex'>
              <div className='w-full'>

                <div className='flex justify-between'>
                  <p className='font-extrabold text-2xl'>{propInfo.name}</p>
                  <p className=''>
                    from
                    <span className='text-yellow-400 text-3xl font-semibold group-hover:text-black transform transition duration-300'>
                      ${propInfo.lowest_price || '---'}
                    </span>
                    /month
                  </p>
                </div>

                <div className='flex items-center'>
                  <img className='h-5' src={addressIcon} alt="" />
                  <p className='text-gray-600 pb-2 pt-2'>{propInfo.address}</p>
                </div>

                <div className='bg-yellow-300 inline-block rounded-xl px-2 py-1'>
                  <p className='text-sm'>{propInfo.distanceFromMTU} miles from campus</p>
                </div>
              </div>
            </div>
            
          </div>
    </Link>
  )
}

const Properties = () => {
  const [ availableProperties, updateProperties ] = useState([]);
  const [ isLoading, setIsLoading ] = useState(true);
  
  useEffect(() => {
    const fetchAllProperties = async () => {
      try {
        const response = await getAllProperties();
        updateProperties(response.data);
      } catch (error) {
        console.error("Failed to fetch properties", error);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchAllProperties();
  }, []);

  return (
    <div className='flex flex-col'>
      {/* div for search and filter */}
      <div className='flex flex-col space-y-5 items-center justify-center pt-20 pb-[5%] md:flex-row md:space-x-10 md:space-y-0'>

        <div className='w-[300px] md:w-[570px]'>
          <input type="text" placeholder='Search appartments...' className='w-full h-13 border-2 border-yellow-400 pl-5 rounded-3xl focus:outline-none'/> 
        </div>

        <button className='bg-yellow-400 h-10 w-20 cursor-pointer hover:bg-yellow-300 rounded-xl'>Filters</button>
        
      </div>

      {/* div for properties card */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8 bg-gray-100 px-10 py-10'>
        { isLoading ? (
          <p className="text-center font-bold text-xl col-span-full">Loading...</p>
        ) : availableProperties && availableProperties.length > 0 ? (
          availableProperties.map((property) => (
            <Fragment key={property.propertyId}>
              <PropertyCard propInfo={property} />
            </Fragment>
          ))
        ) : (
          <p className="text-center font-bold text-xl col-span-full">No properties found :(</p>
        )}
      </div>
    </div>
  );
};

export default Properties;