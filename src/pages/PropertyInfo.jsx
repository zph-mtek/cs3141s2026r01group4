import React, { useState } from 'react';
import addressIcon from "../assets/maps-and-flags.png";
import { CiCircleChevLeft, CiCircleChevRight} from "react-icons/ci";
import { GoDotFill } from "react-icons/go";
import { IoWifi } from "react-icons/io5";
import { MdOutlineSoupKitchen, MdOutlineLocalLaundryService, MdOutlineShower } from "react-icons/md";
import { LuHeater } from "react-icons/lu";
import { CgGym } from "react-icons/cg";
import pfp from "../assets/catpfp.jpg"
import { Link } from 'react-router-dom';

import MapComponents from '../components/MapCom';



const PropertyInfo = () => {

  const slidePhotos = [
    {
      url: 'https://res.cloudinary.com/dxhogizsr/image/upload/v1773440484/herm-iceland-4524112_1920_liwlzf.jpg'
    },
        {
      url: 'https://res.cloudinary.com/dxhogizsr/image/upload/v1773440479/jarmoluk-apartment-2094661_1920_ql47qw.jpg'
    },
        {
      url: 'https://res.cloudinary.com/dxhogizsr/image/upload/v1773440473/jarmoluk-apartment-2094645_1920_okls0r.jpg'
    },
    
  ]

  const features = [
  { name: 'wifi', icon: <IoWifi /> },
  {name: 'kitchen', icon: <MdOutlineSoupKitchen />},
  {name: 'laundry', icon: <MdOutlineLocalLaundryService />},
  {name: 'AC', icon: <LuHeater />},
  {name: 'gym', icon: <CgGym />},
  {name: 'shower', icon: <MdOutlineShower />},
  ];

  const roomTypes = [

    { type: "Studio", price: "$650", feat: "Perfect for single student" },
    { type: "Large 1 Bedroom", price: "$750", feat: "Spacious with extra storage" }

  ]

  // useState to switch image
  const [currentIndex, setCurrentIndex] = useState(0)

  const prevSlide = () => {
    const isFirstSlide = currentIndex === 0
    const newIndex = isFirstSlide ? slidePhotos.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  }

  const nextSlide = () => {
    const isLastSlide = currentIndex === slidePhotos.length - 1
    const newIndex = isLastSlide ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  }

  const goToSlides =(slideIndex) => {
    setCurrentIndex(slideIndex)
  }

  return (
    <div className='grid grid-cols-1 xl:grid-cols-[1.5fr_1fr] gap-8 p-10 xl:p-20'>


      {/* image section */}
      <div className='max-w-[1000px] h-[500px] w-full m-auto px-4 relative group'>
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
      </div>


      {/* info section */}
      <div className='min-h-[400px] xl:row-span-2 xl:sticky xl:top-8 self-start'>
        <div className='flex flex-col bg-white h-full rounded-2xl shadow-xl p-8'>
          <div className='flex flex-col md:flex-row justify-between items-center pb-5'>
            <h1 className='text-4xl pb-5 md:pb-0 font-extrabold leading-none text-gray-900'>
              Husky Heights
            </h1>
            <p className='flex items-center text-lg leading-none'>
              ⭐⭐⭐⭐⭐ <span className='ml-1 font-bold'>5</span>
            </p>
          </div>
          <p className='pb-10'><span className='text-3xl font-bold'>$700</span>/month</p>

          <div className='flex pb-1'>
            <img className='h-5' src={addressIcon} alt="" />
            <p>1801 Townsend Dr, Houghton, MI 49931, United States</p>
          </div>
          <p className='pb-1 text-blue-600 font-bold'>0.5 miles from campus</p>
          <p className='pb-7 text-blue-600 font-bold'>10 minutes walk to campus</p>

          {/* line */}
          <div className='flex justify-center pb-7'>
            <hr className='border-1 w-full rounded-3xl border-gray-400' />
          </div>

          {/* features section */}
          <div className='grid grid-cols-3 text-center pb-8 gap-3'>
            {features.map((feature, i)=>(
              <div key={i} className='flex items-center justify-center gap-2 leading-none'>
                <span className='text-xl'>{feature.icon}</span> 
                <span className='text-sm'>{feature.name}</span>
              </div>
            ))}
          </div>

          {/* room types */}
          <div className='space-y-4 pb-10'>
            {roomTypes.map((room, i) => (
              <div key={i} className='border border-gray-200 rounded-xl p-5 bg-white shadow-sm'>
                <div className='flex justify-between items-center'>
                  <p className='font-bold text-lg'>{room.type}</p>
                  <p className='font-bold text-yellow-500'>{room.price}<span className='text-gray-500 font-normal'>/mo</span></p>
                </div>
                <p className='text-sm text-gray-500 mt-1'>{room.feat}</p>
              </div>
            ))}
          </div>

          <div className='flex justify-center pb-7'>
            <hr className='border-1 w-full rounded-3xl border-gray-400' />
          </div>

            <div className='pb-7'>
              <p>
                Lorem ipsum, dolor sit amet consectetur adipisicing elit.
                Facere maiores magnam aliquam vel dolor non hic assumenda alias porro.
                Maiores sit porro at magni aliquam dolore voluptatibus inventore non perspiciatis.
              </p>
            </div>

            <div className='pb-10'>
              <MapComponents/>
            </div>

            {/* Been a tenant? Leave a review to help fellow Huskies. */}
            {/* "Lived here before? Share your experience to help future Huskies!" */}
            {/* "Help future Huskies find their next home. Share your review!" */}
          <Link to={"/addreview"}>
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