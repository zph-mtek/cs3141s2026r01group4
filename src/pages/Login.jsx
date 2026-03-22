import React, { useState } from 'react'
import axios from 'axios'
import logoImage from "../assets/husyrentlens.png";
import googleImage from "../assets/google.png";
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {

  const navigate = useNavigate();
  const API_BASE_URL = 'https://huskyrentlens.cs.mtu.edu';

  const [loginData, setloginData] = useState(
    {
      email: '',
      password: '',
    }
  )

  const onChangeHandler = (e) => {
    setloginData({ ...loginData, [e.target.name]: e.target.value })
  }

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (loginData.email) {
      try {
        const response = await axios.post(`${API_BASE_URL}/backend/login.php`, loginData,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )

      if(response.data.status === 'success'){
        console.log(response.data)
      }
      else{
        console.log(response.data)
      }

      } catch (error) {
        console.log(error)
      }

    }
  }


  return (
    <>
      <div className="md:hidden w-full h-30 bg-white flex items-center px-4">
        <Link to={"/"}>
          <img src={logoImage} className="w-30 h-auto" alt="Logo" />
        </Link>
      </div>

      <Link to={"/"}>
        <img src={logoImage} className="hidden md:block w-40 h-auto fixed top-6 left-10 rounded-4xl" alt="Logo" />
      </Link>

      <form onSubmit={onSubmitHandler} className='grid grid-cols-1 md:grid-cols-2 h-screen'>
        <div className='hidden md:flex flex-col justify-center items-center pb-30'>
          <p className='text-6xl pb-10 font-extrabold text-center'>Search. Compare. Review.</p>
          <p className='text-xl'>Find your next home near campus</p>
          <p className='text-xl'>Real reviews from students. No more surprise</p>
        </div>

        <div className='bg-yellow-400 h-full w-full flex justify-center items-center pt-20 md:pt-0'>
          <div className='bg-gray-200 w-[90%] md:w-[420px] p-10 rounded-2xl flex flex-col gap-6'>
            <div className='flex flex-col gap-2'>
              <label className='text-lg'>Email</label>
              <input type="text" name='email' onChange={onChangeHandler} value={loginData.email} className='h-12 rounded-md px-3 bg-gray-100 focus:outline-none' />
            </div>
            <div className='flex flex-col gap-2'>
              <label className='text-lg'>Password</label>
              <input type="password" name='password' onChange={onChangeHandler} value={loginData.password} className='h-12 rounded-md px-3 bg-gray-100 focus:outline-none' />
            </div>
            <button className='cursor-pointer bg-yellow-400 h-12 rounded-full font-semibold hover:bg-yellow-500 transition'>sign in</button>
            <button className='cursor-pointer bg-white h-12 rounded-full flex items-center justify-center gap-3'>
              <img src={googleImage} className='w-5 h-5' />
              continue with google
            </button>

            <Link to={"/signup"} className='flex cursor-pointer bg-gray-100 h-12 rounded-full hover:bg-white transition'>
              <button className='text-center m-auto cursor-pointer'>
                Student sign up
              </button>
            </Link>
          </div>
        </div>
      </form>
    </>
  )
}

export default Login
