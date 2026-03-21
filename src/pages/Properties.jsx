import React, { useEffect } from 'react'
import addressIcon from "../assets/maps-and-flags.png";
import { Link } from 'react-router-dom';
import Database from '../Architect/Architect.jsx'

//-- Will make it more easily repeatable
const PropertyCard = ({ id }) => {
  return (
    <Link to={"/property/"+id}>
            
          <div className='flex flex-col rounded-2xl h-110 2xl:h-100 bg-white overflow-hidden cursor-pointer hover:bg-amber-200 transform transition duration-300 group'>
            <div className='p-5'>
              <img className='h-55 w-full object-cover rounded-2xl ' src="https://res.cloudinary.com/dxhogizsr/image/upload/v1773440479/jarmoluk-apartment-2094661_1920_ql47qw.jpg" alt="" />
            </div>

            <div className='px-5 flex'>
              <div className='w-full'>

                <div className='flex justify-between'>
                  <p className='font-extrabold text-2xl'>Husky heights</p>
                  <p className=''><span className='text-yellow-400 text-3xl font-semibold group-hover:text-black transform transition duration-300'>$700</span>/month</p>
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

  const properties = [1,2,3,4,5,6,7,8];

  jsonData = {
            "reqType" : "property",
            "propertyId" : 0
        }
  
  useEffect(()=>{
    const getData = Database(jsonData=jsonData);
    console.log(JSON.stringify(getData));

    /*
    // import axios from 'axios';

// const TestDBAPI = (passedData) => {

//     const controller = new AbortController();

//     const config = {
//         headers : {
//             'Content-Type' : 'application/json',
//             //'Authorization': '',
//             //'X-Custom-Header': 'Value'
//         },
//         params: {},
//         timeout: 5000
//     }

//     const data = {
//         propertyId : 0
//     }

//     // Create axios command here
//     useEffect(() => {
//         const doDataRequest = () => {
//             try {
//                 const dbResponse = await.post(URL,data,config)

//             } catch (error) {
//                 if (axios.isCancel(error)) {
//                     console.log('cancelled ask');
//                 } else {
//                     console.lerror('error: ',error);
//                 }
//             }
//         }    
//     },[]); // variable dependencies

//     return ( // this
//         <Fragment>

//         </Fragment>
//     )
// }


    */

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
        {properties.map((item) => (
          <Link to={"/property/id"}>
            
          <div className='flex flex-col rounded-2xl h-110 2xl:h-100 bg-white overflow-hidden cursor-pointer hover:bg-amber-200 transform transition duration-300 group'>
            <div className='p-5'>
              <img className='h-55 w-full object-cover rounded-2xl ' src="https://res.cloudinary.com/dxhogizsr/image/upload/v1773440479/jarmoluk-apartment-2094661_1920_ql47qw.jpg" alt="" />
            </div>

            <div className='px-5 flex'>
              <div className='w-full'>

                <div className='flex justify-between'>
                  <p className='font-extrabold text-2xl'>Husky heights</p>
                  <p className=''><span className='text-yellow-400 text-3xl font-semibold group-hover:text-black transform transition duration-300'>$700</span>/month</p>
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
        ))}

      </div>
    </div>
  );
};


export default Properties