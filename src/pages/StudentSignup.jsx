import axios from 'axios'
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const StudentSignup = () => {

    const navigate = useNavigate();

    const API_BASE_URL = 'https://huskyrentlens.cs.mtu.edu';

    const [step, setStep] = useState('form') // 'form' | 'otp'
    const [statusMsg, setStatusMsg] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    
    const [signupData, setSignUpData] = useState(
        {
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            role: 'MTU_student',
        }
    )
    const [matchPassword, setMatchPassword] = useState('')
    const [userId, setUserId] = useState(null)
    const [otpCode, setOtpCode] = useState('')

    const onChangeHandler = (e) => {
        setSignUpData({ ...signupData, [e.target.name]: e.target.value })
    }

    const onChangeHandlerPasswordMatch = (e) => {
        setMatchPassword(e.target.value)
    }

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        setStatusMsg('')
        
        try {
            //check if the password matches
            if (signupData.password !== matchPassword) {
                setStatusMsg('Password does not match')
                return
            }

            // case-insensitive MTU email check
            const normalizedEmail = signupData.email.trim().toLowerCase()
            const isMtuEmail = /^([\w.%+-]+)@mtu\.edu$/i.test(normalizedEmail)
            if (!isMtuEmail) {
                setStatusMsg('Please use MTU email to register')
                return
            }

            setIsLoading(true)
            const payload = { ...signupData, email: normalizedEmail }
            const response = await axios.post(`${API_BASE_URL}/backend/userRegister.php`, payload,
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            )
            setIsLoading(false)

            if (response.data.status === 'otp_required') {
                setUserId(response.data.userId)
                setStep('otp')
                setStatusMsg('Verification code sent to your email')
            } else {
                setStatusMsg(response.data.message || 'Signup failed')
            }
        } catch (error) {
            setIsLoading(false)
            console.log(error)
            setStatusMsg('Network error - please try again')
        }
    }

    const onSubmitOtp = async (e) => {
        e.preventDefault();
        setStatusMsg('')

        if (!otpCode || otpCode.length !== 6) {
            setStatusMsg('Please enter a 6-digit code')
            return
        }

        if (!userId) {
            setStatusMsg('User ID missing - please sign up again')
            return
        }

        try {
            setIsLoading(true)
            const response = await axios.post(`${API_BASE_URL}/backend/verify_register_otp.php`, 
                { userId, otp: otpCode },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            )
            setIsLoading(false)

            if (response.data.status === 'success') {
                setStatusMsg('Email verified! Redirecting to login...')
                setTimeout(() => {
                    navigate('/login')
                }, 1500)
            } else {
                setStatusMsg(response.data.message || 'OTP verification failed')
            }
        } catch (error) {
            setIsLoading(false)
            console.log(error)
            setStatusMsg('Network error - please try again')
        }
    }

    const handleBackToForm = () => {
        setStep('form')
        setStatusMsg('')
        setOtpCode('')
    }
    return (
        <div className='flex justify-center w-full pt-20 md:p-0'>
            <div className='flex flex-col items-center gap-4 w-full max-w-xl bg-gray-100 p-10 rounded-2xl'>
                
                {statusMsg && (
                    <div className='w-full p-3 bg-yellow-200 text-sm text-yellow-900 rounded-lg text-center'>
                        {statusMsg}
                    </div>
                )}

                {step === 'form' ? (
                    <form onSubmit={onSubmitHandler} className='flex flex-col items-center gap-4 w-full'>
                        <h2 className='text-2xl font-bold text-center mb-4'>Student Sign Up</h2>

                        {/*email, password, lastname, firstname, major  */}
                        <div className='grid grid-cols-2 gap-4 w-full'>
                            <div className='flex flex-col w-full'>
                                <label className='text-lg font-semibold'>First name</label>
                                <input placeholder='Husky' required type="text" name='firstName' onChange={onChangeHandler} value={signupData.firstName} className='w-full h-13 focus:outline-none pl-5 rounded-xl bg-white focus:border-2 border-yellow-400' />
                            </div>

                            <div className='flex flex-col w-full'>
                                <label className='text-lg font-semibold'>Last name</label>
                                <input placeholder='Dog' required type="text" name='lastName' onChange={onChangeHandler} value={signupData.lastName} className='w-full h-13 focus:outline-none pl-5 rounded-xl bg-white focus:border-2 border-yellow-400' />
                            </div>
                        </div>

                        <div className='flex flex-col w-full'>
                            <label className='text-lg font-semibold'>MTU email</label>
                            <input placeholder='example@mtu.edu' required type="email" name='email' onChange={onChangeHandler} value={signupData.email} className='w-full h-13 focus:outline-none pl-5 rounded-xl bg-white focus:border-2 border-yellow-400' />
                        </div>

                        <div className='flex flex-col w-full'>
                            <label className='text-lg font-semibold'>Password</label>
                            <input placeholder='example12345' required type="password" name='password' onChange={onChangeHandler} value={signupData.password} className='w-full h-13 focus:outline-none pl-5 rounded-xl bg-white focus:border-2 border-yellow-400' />
                        </div>

                        <div className='flex flex-col w-full'>
                            <label className='text-lg font-semibold'>Match password</label>
                            <input placeholder='' type="password" required name='rePassword' onChange={onChangeHandlerPasswordMatch} value={matchPassword} className='w-full h-13 focus:outline-none pl-5 rounded-xl bg-white focus:border-2 border-yellow-400' />
                        </div>

                        <button disabled={isLoading} type='submit' className='w-full bg-yellow-400 py-3 cursor-pointer rounded-full mt-5 hover:bg-amber-300 disabled:opacity-50'>
                            {isLoading ? 'Signing up...' : 'Sign up'}
                        </button>
                        <p>Already have an account? <Link to={"/login"} className='text-yellow-400 font-bold'>Login</Link></p>
                    </form>
                ) : (
                    <form onSubmit={onSubmitOtp} className='flex flex-col items-center gap-4 w-full'>
                        <h2 className='text-2xl font-bold text-center mb-4'>Verify Your Email</h2>
                        
                        <p className='text-center text-gray-700 mb-2'>
                            A verification code has been sent to your email. Please enter it below.
                        </p>

                        <div className='flex flex-col w-full'>
                            <label className='text-lg font-semibold'>6-digit code</label>
                            <input 
                                type='text' 
                                maxLength={6} 
                                required 
                                value={otpCode} 
                                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))} 
                                placeholder='000000'
                                className='w-full h-13 focus:outline-none pl-5 rounded-xl bg-white focus:border-2 border-yellow-400 text-center text-2xl tracking-widest'
                            />
                        </div>

                        <button disabled={isLoading} type='submit' className='w-full bg-yellow-400 py-3 cursor-pointer rounded-full mt-5 hover:bg-amber-300 disabled:opacity-50'>
                            {isLoading ? 'Verifying...' : 'Verify Code'}
                        </button>

                        <button 
                            disabled={isLoading}
                            type='button' 
                            onClick={handleBackToForm} 
                            className='w-full bg-white py-3 cursor-pointer rounded-full border-2 border-gray-300 hover:bg-gray-100 disabled:opacity-50'
                        >
                            Back to Sign Up
                        </button>
                    </form>
                )}
            </div>
        </div>
    )
}

export default StudentSignup