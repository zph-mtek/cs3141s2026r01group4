import React from 'react'
import logoImage from "../assets/husyrentlens.png";
import { Link } from 'react-router-dom';


const Login = () => {
  return (
    <>
      <div className='grid grid-cols-2 h-screen   '>
        <div className='flex flex-col justify-center items-center pb-30'>
          <Link to={"/"}>
            <img src={logoImage} className="w-40 h-auto fixed top-0 left-10" alt="Logo" />
          </Link>
          <p className='text-6xl pb-10 font-extrabold'>search. compare. review.</p>
          <p className='text-xl'>Find Your Next Home Near Campus</p>
          <p className='text-xl'>Real reviews from students. No more surprise</p>
        </div>
        <div className='bg-yellow-400 h-full w-full flex justify-center items-center'>
          <div className='bg-gray-200 w-[420px] p-10 rounded-2xl flex flex-col gap-6'>
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
              <img src="https://developers.google.com/identity/images/g-logo.png" className='w-5 h-5'/>
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