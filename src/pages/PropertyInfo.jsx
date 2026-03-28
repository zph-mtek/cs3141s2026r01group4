import React, { useEffect, useState, Fragment } from 'react';
import addressIcon from "../assets/maps-and-flags.png";
import { CiCircleChevLeft, CiCircleChevRight} from "react-icons/ci";
import { GoDotFill } from "react-icons/go";
import { IoWifi } from "react-icons/io5";
import { MdOutlineSoupKitchen, MdOutlineLocalLaundryService, MdOutlineShower } from "react-icons/md";
import { FaUniversity } from "react-icons/fa";
import { LuHeater } from "react-icons/lu";
import { CgGym } from "react-icons/cg";
import pfp from "../assets/catpfp.jpg"
import { Link, useParams } from 'react-router-dom';
import StarRating from '../components/StarRating.jsx';
import { Database } from '../Architect/Architect.jsx'

import MapComponents from '../components/MapCom';

const PropertyInfo = () => {

  const { propertyId } = useParams(); // grab the id of the property from the URL
  const [ propInfo, setPropInfo ] =  useState([]); // for requesting the property info from the API
  const [ slidePhotos, setSlidePhotos ] = useState([]);
  const [ costRange, updateCostRange ] = useState({min: 0, max: 0});
  const [ rentalInfo, setRentalInfo ] = useState([]);

  const featureIcons = {
    "onCampus": <FaUniversity />,
    "gym":<CgGym />
  };
  /*
[
    { name: 'wifi', icon: <IoWifi /> },
    { name: 'kitchen', icon: <MdOutlineSoupKitchen />},
    {name: 'laundry', icon: <MdOutlineLocalLaundryService />},
    {name: 'AC', icon: <LuHeater />},
    {name: 'gym', icon: <CgGym />},
    {name: 'shower', icon: <MdOutlineShower />},
  ]
  */

  const roomTypes = [

    { type: "Studio", price: "$650", feat: "Perfect for single student" },
    { type: "Large 1 Bedroom", price: "$750", feat: "Spacious with extra storage" }

  ]

  // useState to switch image
  const [currentIndex, setCurrentIndex] = useState(0)

  let prevSlide = () => {
    const isFirstSlide = currentIndex === 0
    const newIndex = isFirstSlide ? slidePhotos.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  }; 

  const nextSlide = () => {
    const isLastSlide = currentIndex === slidePhotos.length - 1
    const newIndex = isLastSlide ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  }

  const goToSlides =(slideIndex) => {
    setCurrentIndex(slideIndex)
  }

  
  //-- Grab the information for this specific property
  useEffect(() => {
    /* simplify later by adding get rental id information */

    console.log("PropertyId:"+propertyId);

    const fetchPropertyInfo = async () => {
      const propertyData = await Database('https://huskyrentlens.cs.mtu.edu/connect.php',{
              propertyId : propertyId
            });

      //-- Slides
      if (propertyData != null) {
        console.log(propertyData);
        setPropInfo(propertyData.data.data);
      }
    }

    fetchPropertyInfo();
  },[]);

  //-- Update page when we get propertyInfo information
  useEffect(()=>{
    if (Object.keys(propInfo).length > 0) {
      console.log("TEST:"+JSON.stringify(propInfo[0]));

      // Update slides
      const propImages = propInfo[0]["images"];

      let slidePhotoArray = [];

      if (propInfo.length > 0 && propImages != null || undefined) {
        const imageUrls = propImages.split(",");
        
        imageUrls.map((imageUrl) => {
          slidePhotoArray.push({ url:imageUrl });
        });
      }

      console.log(slidePhotoArray);

      setSlidePhotos(slidePhotoArray);
      setCurrentIndex(0);

      // Update lowest,highest
       const fetchPropertyRentals = async () => {
          console.log("Database connection is is running...");
    
          //-- Ask database for details on its rentals
          const getData = await Database('https://huskyrentlens.cs.mtu.edu/connect.php',{
            propertyId: propertyId,
            allRentals: "yes"
          });

          console.log(getData);
    
          if (getData != null) {
            // sort and update rentals for this property (ascending, lowest cost to highest cost)
            setRentalInfo(getData.data.data.sort((a,b) => a.cost - b.cost));
          }
        }
        
        fetchPropertyRentals();
    }
  },[propInfo]);

  //-- Update rental data
  useEffect(()=>{
    if (rentalInfo.length > 0) {
    
      //-- Determine range of cost for rentals for the property
      let lowestPrice;
      let highestPrice;

      console.log(rentalInfo);
      Object.keys(rentalInfo).map((index,dummyKey) => {
        const thisRentalInfo = rentalInfo[index];

        // Determine the range of cost for this property's rentals
        if (lowestPrice == null) {
          lowestPrice = thisRentalInfo.cost
        } else {
          if (thisRentalInfo.cost < lowestPrice) {
            lowestPrice = thisRentalInfo.cost
          } else if (thisRentalInfo.cost > lowestPrice) {
            if (highestPrice == null || thisRentalInfo.cost > highestPrice) { // if we don't have a highest price yet or it is higher than the higest price...
              highestPrice = thisRentalInfo.cost
            }
          }
        }

        if (highestPrice == null) {
          highestPrice = thisRentalInfo.cost
        }

        // Now display them as a range
        updateCostRange({min: lowestPrice, max: highestPrice});
      });
    }
  },[rentalInfo])

  return (
    <div className='grid grid-cols-1 xl:grid-cols-[1.5fr_1fr] gap-8 p-10 xl:p-20'>


      {/* image section */}
      <div className='max-w-[1000px] h-[500px] w-full m-auto px-4 relative group'>
        {/* If the property has no images, then we place a blank image icon */}
        {
          slidePhotos.length > 0 ? (
            <Fragment>
              <div style={{backgroundImage: `url(${slidePhotos[currentIndex].url})`}} className='w-full h-full rounded-2xl bg-center bg-cover duration-300'>
                {/* left */}
                <div className='hidden group-hover:block absolute top-[50%] translate-x-0 -translate-y-[50%] left-5 bg-white/30 text-2xl rounded-full p-2 cursor-pointer'>
                  <CiCircleChevLeft onClick={prevSlide} size={50}/>
                </div>
                {/* right */}
                <div className='hidden group-hover:block absolute top-[50%] translate-x-0 -translate-y-[50%] right-5 bg-white/30 text-2xl rounded-full p-2 cursor-pointer'>
                  <CiCircleChevRight onClick={nextSlide} size={50}/>
                </div>
              </div>
              <div className='flex top-4 justify-center py-2'>
                {slidePhotos.map((slide, slideIndex) => (
                  <div key={slideIndex} onClick={(()=>goToSlides(slideIndex))} className={`text-xl ${currentIndex === slideIndex ? 'text-yellow-400' : 'text-black'} cursor-pointer`}><GoDotFill /></div>
                ))}
              </div>
            </Fragment>
          ) : (
            <p>Nothing to see here</p>
          )}
      </div>


      {/* info section */}
      <div className='min-h-[400px] xl:row-span-2 xl:sticky xl:top-8 self-start'>
        <div className='flex flex-col bg-white h-full rounded-2xl shadow-xl p-8'>
          <div className='flex flex-col md:flex-row justify-between items-center pb-5'>
            <h1 className='text-4xl pb-5 md:pb-0 font-extrabold leading-none text-gray-900'>
              {propInfo.length > 0 ? propInfo[0]["name"] : null }
            </h1>
            <p className='flex items-center text-lg leading-none'>
              ⭐⭐⭐⭐⭐ <span className='ml-1 font-bold'>5</span>
            </p>
          </div>
          <p className='pb-10'>From <span className='text-3xl font-bold'>${costRange.min}</span>/month</p>

          <div className='flex pb-1'>
            <img className='h-5' src={addressIcon} alt="" />
            <p>{propInfo.length > 0 ? propInfo[0]["address"] : null }</p>
          </div>
          <p className='pb-1 text-blue-600 font-bold'>
            {propInfo.length > 0 ? propInfo[0]["distanceFromMTU"] : "..." }'
              min away from campus (walk)
          </p>

          {/* line */}
          <div className='flex justify-center pb-7'>
            <hr className='border-1 w-full rounded-3xl border-gray-400' />
          </div>

          {/* features section */}
          <div className='grid grid-cols-3 text-center pb-8 gap-3'>
            { propInfo.length > 0
              && (propInfo[0]["tagSring"] != null || undefined) ? propInfo[0]["tagString"].split(",").map((tag, i)=>(
              <div key={i} className='flex items-center justify-center gap-2 leading-none'>
                <span className='text-xl'>{featureIcons[tag]}</span>
                <span className='text-sm'>{tag}</span>
              </div>
            )) : null}
          </div>

          {/* room types */}
          <div className='space-y-4 pb-10'>
            { rentalInfo.length > 0 ? 
              rentalInfo.map((thisRental, i) => (
                <div key={i} className='border border-gray-200 rounded-xl p-5 bg-white shadow-sm'>
                  <div className='flex justify-between items-center'>
                    <p className='font-bold text-lg'>Rental Name</p>
                    <p className='font-bold text-yellow-500'>{thisRental.cost}<span className='text-gray-500 font-normal'>/mo</span></p>
                  </div>
                  <p className='text-sm text-gray-500 mt-1'>{thisRental.description}</p>
                </div>
            )) : "Loading..."}
          </div>

          <div className='flex justify-center pb-7'>
            <hr className='border-1 w-full rounded-3xl border-gray-400' />
          </div>

            <div className='pb-7'>
              <p>
                { propInfo.length > 0 && propInfo[0]["description"] != null ?
                propInfo[0]["description"]
                : "Lorem ipsum, dolor sit amet consectetur adipisicing elit.\
                  Facere maiores magnam aliquam vel dolor non hic assumenda alias porro.\
                  Maiores sit porro at magni aliquam dolore voluptatibus inventore non perspiciatis."
              }
                
              </p>
            </div>

            <div className='pb-10'>
              <MapComponents/>
            </div>

            {/* Been a tenant? Leave a review to help fellow Huskies. */}
            {/* "Lived here before? Share your experience to help future Huskies!" */}
            {/* "Help future Huskies find their next home. Share your review!" */}
            <Link to={'/addreview/id'}>            
              <div className='flex justify-center bg-yellow-400 px-5 py-3 w-full rounded-2xl hover:bg-yellow-300'>
                <button className='cursor-pointer font-extrabold'>Lived here before? Share your experience to help future Huskies!</button>
              </div>  
            </Link>
        </div>
      </div>


      {/* review section */}
      <div className='h-full p-5 flex flex-col'>
        <div className='pb-5'>
          <p className='text-2xl font-bold'>Reviews From Huskies</p>
        </div>

        <div className='grid grid-cols-1 2xl:grid-cols-[1fr_1fr] gap-5'>
          {/*  */}

          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((index) => (
            <div key={index} className='border-2 shadow-xl p-3 rounded-2xl'>
              <div className='flex flex-col md:flex-row items-center text-center md:text-left'>

                <div>
                  <img src={pfp} className='rounded-full border-3 border-amber-400 h-10 w-10 xl:h-15 xl:w-15 shrink-0 object-cover' alt="" />
                </div>

                <div className='mt-3 md:mt-0 md:pl-5'>
                    <p>Jane doe</p>
                    <p className='tracking-tighter'>Sep 2025  ~  Jan 2026</p>
                </div>

                <div className='mt-2 text-center md:mt-0 md:pl-5 md:ml-auto'>
                  <p>⭐⭐⭐⭐⭐5</p>
                </div>
              </div>

              <p className='mt-4 text-gray-700'>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Eligendi et similique vero accusantium repudiandae sed magni aperiam maxime, consectetur placeat? Ratione adipisci earum iste alias, ea non est ipsa expedita!</p>
            </div>
          ))}
          


        </div>
      </div>
    </div>
  )
}

export default PropertyInfo