import React, { useEffect, useState } from 'react'
import axios from 'axios'
import logoImage from "../assets/huskkyrentlens.png"
import googleImage from "../assets/google.png";
import { Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";

const Login = () => {

  //const logoImage = "";
  //const googleImage = "";

  console.log(new URL('../assets/huskyrentlens.png', import.meta.url).href);

  console.log(logoImage);

  const navigate = useNavigate();
  const API_BASE_URL = 'https://huskyrentlens.cs.mtu.edu';

  const [loginData, setLoginData] = useState({ email: '', password: '' })
  const [statusMessage, setStatusMessage] = useState('')
  const [messageType, setMessageType] = useState('') // 'error' | 'warning' | 'success'
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState('login') // 'login' | 'verify_unverified'
  const [verificationCode, setVerificationCode] = useState('')
  const [userId, setUserId] = useState(null)
  const [sendCooldown, setSendCooldown] = useState(0)

  const onChangeHandler = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value })
  }

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setStatusMessage('')

    if (!loginData.email || !loginData.password) {
      setStatusMessage('Please fill in email and password.')
      setMessageType('error')
      return
    }

    try {
      setIsLoading(true)
      const response = await axios.post(`${API_BASE_URL}/backend/login.php`, loginData, { headers: { 'Content-Type': 'application/json' } })
      const data = response.data
      setIsLoading(false)

      if (data.status === 'success') {
        const token = data.token
        localStorage.setItem('token', token)
        setStatusMessage('Login successful! Redirecting...')
        setMessageType('success')
        setTimeout(() => {
          navigate('/')
        }, 1000)
        return
      }

      if (data.message && data.message.includes('verify your email')) {
        setStatusMessage(data.message)
        setMessageType('warning')
        setStep('verify_unverified')
        setSendCooldown(0)
        return
      }

      setStatusMessage(data.message || 'Login failed')
      setMessageType('error')
    } catch (error) {
      setIsLoading(false)
      console.log(error)
      setStatusMessage('Unable to connect to server. Try again.')
      setMessageType('error')
    }
  }

  const handleResendCode = async (e) => {
    if (e?.preventDefault) {
      e.preventDefault();
    }

    if (sendCooldown > 0) {
      return
    }

    setStatusMessage('')

    if (!loginData.email) {
      setStatusMessage('Email required to resend code')
      setMessageType('error')
      return
    }

    try {
      setIsLoading(true)
      const response = await axios.post(`${API_BASE_URL}/backend/resend_otp.php`, { email: loginData.email }, { headers: { 'Content-Type': 'application/json' } })
      const data = response.data
      setIsLoading(false)

      if (data.status === 'success' && data.userId) {
        setUserId(data.userId)
        setStatusMessage('Verification code sent to your email')
        setMessageType('success')
        setSendCooldown(60)
      } else {
        setStatusMessage(data.message || 'Unable to resend code')
        setMessageType('error')
      }
    } catch (error) {
      setIsLoading(false)
      console.log(error)
      setStatusMessage('Network error - unable to send code')
      setMessageType('error')
    }
  }

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setStatusMessage('')

    if (!verificationCode || verificationCode.length !== 6) {
      setStatusMessage('Please enter a 6-digit code')
      setMessageType('error')
      return
    }

    if (!userId) {
      setStatusMessage('Please request a verification code first')
      setMessageType('error')
      return
    }

    try {
      setIsLoading(true)
      const response = await axios.post(`${API_BASE_URL}/backend/verify_register_otp.php`, { userId, otp: verificationCode }, { headers: { 'Content-Type': 'application/json' } })
      const data = response.data
      setIsLoading(false)

      if (data.status === 'success') {
        setStatusMessage('Email verified! You can now login.')
        setMessageType('success')
        setTimeout(() => {
          setStep('login')
          setVerificationCode('')
          setUserId(null)
          setStatusMessage('')
        }, 2000)
      } else {
        setStatusMessage(data.message || 'Verification failed')
        setMessageType('error')
      }
    } catch (error) {
      setIsLoading(false)
      console.log(error)
      setStatusMessage('Network error - verification failed')
      setMessageType('error')
    }
  }

  const handleBackToLogin = () => {
    setStep('login')
    setStatusMessage('')
    setVerificationCode('')
    setUserId(null)
    setSendCooldown(0)
  }

  useEffect(() => {
    if (sendCooldown <= 0) {
      return
    }

    const timer = setInterval(() => {
      setSendCooldown((current) => {
        if (current <= 1) {
          clearInterval(timer)
          return 0
        }

        return current - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [sendCooldown])

  const getStatusColor = () => {
    if (messageType === 'success') return 'bg-green-200 text-green-900'
    if (messageType === 'warning') return 'bg-yellow-200 text-yellow-900'
    return 'bg-red-200 text-red-900'
  }

  return (
    <>
      <div className="md:hidden w-full h-30 bg-white flex items-center px-4">
        <Link to={'/'}>
          <img src={logoImage} className="w-30 h-auto" alt="Logo" />
        </Link>
      </div>

      <Link to={'/'}>
        <img src={logoImage} className="hidden md:block w-40 h-auto fixed top-6 left-10 rounded-4xl" alt="Logo" />
      </Link>

      <form onSubmit={step === 'login' ? onSubmitHandler : handleVerifyCode} className='grid grid-cols-1 md:grid-cols-2 h-screen'>
        <div className='hidden md:flex flex-col justify-center items-center pb-30'>
          <p className='text-6xl pb-10 font-extrabold text-center'>Search. Compare. Review.</p>
          <p className='text-xl'>Find your next home near campus</p>
          <p className='text-xl'>Real reviews from students. No more surprise</p>
        </div>

        <div className='bg-yellow-400 h-full w-full flex justify-center items-center pt-20 md:pt-0'>
          <div className='bg-gray-200 w-[90%] md:w-[420px] p-10 rounded-2xl flex flex-col gap-6'>
            <h2 className='text-2xl font-bold text-center text-yellow-900'>{step === 'login' ? 'Sign In' : 'Verify Email'}</h2>
            
            {statusMessage && (
              <div className={`p-3 rounded-lg text-sm text-center ${getStatusColor()}`}>
                {statusMessage}
              </div>
            )}

            {step === 'login' ? (
              <>
                <div className='flex flex-col gap-2'>
                  <label className='text-lg'>Email</label>
                  <input type='email' name='email' onChange={onChangeHandler} value={loginData.email} className='h-12 rounded-md px-3 bg-white focus:outline-none border-2 border-transparent focus:border-yellow-400' required />
                </div>
                
                <div className='flex flex-col gap-2'>
                  <label className='text-lg'>Password</label>
                  <input type='password' name='password' onChange={onChangeHandler} value={loginData.password} className='h-12 rounded-md px-3 bg-white focus:outline-none border-2 border-transparent focus:border-yellow-400' required />
                </div>
                
                <button disabled={isLoading} type='submit' className='cursor-pointer bg-yellow-400 h-12 rounded-full font-semibold hover:bg-yellow-500 transition disabled:opacity-50'>
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </button>

                <button type='button' className='cursor-pointer bg-white h-12 rounded-full flex items-center justify-center gap-3 hover:bg-gray-100 transition'>
                  <img src={googleImage} className='w-5 h-5' alt='Google' />
                  continue with google
                </button>

                <Link to={'/signup'} className='flex cursor-pointer bg-gray-100 h-12 rounded-full hover:bg-white transition'>
                  <button type='button' className='text-center m-auto cursor-pointer font-semibold'>
                    Sign up
                  </button>
                </Link>
              </>
            ) : (
              <>
                <p className='text-center text-gray-700'>We sent a verification code to your email. Enter it below to verify your account.</p>
                
                <div className='flex flex-col gap-2'>
                  <label className='text-lg'>6-digit code</label>
                  <input 
                    type='text' 
                    maxLength={6} 
                    value={verificationCode} 
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))} 
                    placeholder='000000'
                    className='h-12 rounded-md px-3 bg-white focus:outline-none border-2 border-transparent focus:border-yellow-400 text-center text-2xl tracking-widest'
                  />
                </div>

                <button disabled={isLoading || !userId} type='submit' className='cursor-pointer bg-yellow-400 h-12 rounded-full font-semibold hover:bg-yellow-500 transition disabled:opacity-50'>
                  {isLoading ? 'Verifying...' : 'Verify Code'}
                </button>

                <button 
                  disabled={isLoading || sendCooldown > 0}
                  type='button' 
                  onClick={handleResendCode}
                  className='cursor-pointer bg-white h-12 rounded-full font-semibold hover:bg-gray-100 transition disabled:opacity-50'
                >
                  {isLoading ? 'Sending...' : sendCooldown > 0 ? `Send Code (${sendCooldown}s)` : 'Send Code'}
                </button>

                <button 
                  disabled={isLoading}
                  type='button' 
                  onClick={handleBackToLogin}
                  className='cursor-pointer bg-gray-100 h-12 rounded-full hover:bg-white transition disabled:opacity-50'
                >
                  Back to Login
                </button>
              </>
            )}
          </div>
        </div>
      </form>
    </>
  )
}

export default Login

