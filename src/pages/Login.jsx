import React from 'react'
import logoImage from "../assets/husyrentlens.png";
import googleImage from "../assets/google.png";
import { Link } from 'react-router-dom';

const Login = () => {
  return (
    <>
          <Link to={"/"}>
            <img src={logoImage} className="w-24 md:w-40 h-auto absolute md:fixed top-6 left-6 md:left-10 rounded-4xl"alt="Logo"/>
          </Link>
      <div className='grid grid-cols-1 md:grid-cols-2 h-screen'>
        <div className='hidden md:flex flex-col justify-center items-center pb-30'>
          <p className='text-6xl pb-10 font-extrabold text-center'>search. compare. review.</p>
          <p className='text-xl'>Find Your Next Home Near Campus</p>
          <p className='text-xl'>Real reviews from students. No more surprise</p>
        </div>

        <div className='bg-yellow-400 h-full w-full flex justify-center items-center pt-20 md:pt-0'>
          <div className='bg-gray-200 w-[90%] md:w-[420px] p-10 rounded-2xl flex flex-col gap-6'>
            <div className='flex flex-col gap-2'>
              <label className='text-lg'>Email</label>
              <input type="text" className='h-12 rounded-md px-3 bg-gray-100 focus:outline-none'/>
            </div>
            <div className='flex flex-col gap-2'>
              <label className='text-lg'>Password</label>
              <input type="password" className='h-12 rounded-md px-3 bg-gray-100 focus:outline-none'/>
            </div>
            <button className='cursor-pointer bg-yellow-400 h-12 rounded-full font-semibold hover:bg-yellow-500 transition'>sign in</button>
            <button className='cursor-pointer bg-white h-12 rounded-full flex items-center justify-center gap-3'>
              <img src={googleImage} className='w-5 h-5'/>
              continue with google
            </button>
            <button className='cursor-pointer bg-gray-100 h-12 rounded-full hover:bg-white transition'>
              <Link to={"/signup"}>Sign up</Link>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default Login
