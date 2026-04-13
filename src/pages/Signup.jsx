import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

const Signup = () => {
  document.title = 'Sign Up | HuskyRentLens';

  return (
    <div className='flex flex-col justify-center w-full text-center'>
      <p className='text-3xl pb-20 font-bold'>Please chose one option</p>
      
      <div className='space-x-10'>

        <Link to={"/signup/studnet"} className='inline-block'>
          <button className='bg-white shadow-md w-100 h-fit px-5 py-10 font-semibold rounded-2xl border-2 text-xl cursor-pointer hover:bg-yellow-400 transition duration-500'>
            I am a MTU student
          </button>
        </Link>

        <Link to={"/signup/landlord"} className='inline-block'>
          <button className='bg-white shadow-md w-100 h-fit px-5 py-10 font-semibold rounded-2xl border-2 text-xl cursor-pointer hover:bg-yellow-400 transition duration-500'>
            I am a landlord
          </button>
        </Link>

      </div>
    </div>
  )
}

export default Signup