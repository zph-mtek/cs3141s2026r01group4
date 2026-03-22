import React, { Fragment, useState, useEffect } from 'react'
import addressIcon from "../assets/maps-and-flags.png";
import { Link } from 'react-router-dom';
import { Database } from '../Architect/Architect.jsx'

//-- Will make it more easily repeatable
const PropertyCard = (data) => {
  console.log(data);
  const propertyInfo = data.propInfo;

  return (
    <Link to={"/property/"}> {/* Put the id of the propery here to make link dynamic */}
            
          <div className='flex flex-col rounded-2xl h-110 2xl:h-100 bg-white overflow-hidden cursor-pointer hover:bg-amber-200 transform transition duration-300 group'>
            <div className='p-5'>
              <img className='h-55 w-full object-cover rounded-2xl ' src="https://res.cloudinary.com/dxhogizsr/image/upload/v1773440479/jarmoluk-apartment-2094661_1920_ql47qw.jpg" alt="" />
            </div>

            <div className='px-5 flex'>
              <div className='w-full'>

                <div className='flex justify-between'>
                  <p className='font-extrabold text-2xl'>{propertyInfo.name}</p>
                  <p className=''><span className='text-yellow-400 text-3xl font-semibold group-hover:text-black transform transition duration-300'>{data.propInfo.price}</span>/month</p>
                </div>

                <p>⭐⭐⭐⭐⭐ 5</p>


                <div className='flex items-center'>
                  <img className='h-5' src={addressIcon} alt="" />
                  <p className='text-gray-600 pb-2 pt-2'>1801 Townsend Dr, Houghton, MI 49931, United States</p>
                </div>

                <div className='bg-yellow-300 inline-block rounded-xl px-2 py-1'>
                  <p className='text-sm'>5 minutes from campus</p>
                </div>
              </div>
            </div>
            
          </div>
    </Link>
  )
}

const Properties = () => {
  const [ availableProperties, updateProperties ] = useState({});
  
  useEffect(()=>{
    const fetchAllProperties = async () => {
      console.log("Database connection is is running...");
      const getData = await Database(null);
      if (getData != null) {
        updateProperties(getData.data.data);
      }
    }
    
    fetchAllProperties();

  },[]); // This should run?

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
        { availableProperties ? 
          // @SOLEIL ECTOR
          Object.keys(availableProperties).map((propInfoId,dummyKey) => {
            const thisPropertyInfo = availableProperties[propInfoId];
            console.log(thisPropertyInfo)
            return (
              <Fragment>
                <PropertyCard propInfo={thisPropertyInfo} propId={propInfoId} />
              </Fragment>
            )
          })
        
        : (<p>Loading!</p>) // Displays if there are no properties returned by the API
         }
      </div>
    </div>
  );
};


export default Properties