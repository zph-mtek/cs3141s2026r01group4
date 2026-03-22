import axios from 'axios'
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const LandlordSignup = () => {

    const navigate = useNavigate();
    

    const API_BASE_URL = 'https://huskyrentlens.cs.mtu.edu';

    const [matchPassword, setMatchPassword] = useState('')

    const [signupData, setSignUpData] = useState(
        {
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            password: '',
            role: 'Landlord',
        }
    )

    const onChangeHandler = (e) => {
        setSignUpData({ ...signupData, [e.target.name]: e.target.value })
    }

    const onChangeHandlerPasswordMatch = (e) => {
        setMatchPassword(e.target.value)
    }

    const onSubmitHandler = async(e) => {
        e.preventDefault();
        try {
            if (signupData.password === matchPassword) {
                const response = await axios.post(`${API_BASE_URL}/backend/userRegister.php`, signupData)

                if(response.data.status === 'success'){
                     alert('User has been created')
                     navigate('/login')
                 }
                 else{
                    alert('Error creating user')
                 }
            }
            else {
                alert('password does not match')    
            }
        } catch (error) {
            console.log('Network error', error)
            alert('Network error')
        }
    }


    return (
        <div className='flex justify-center w-full pt-20 md:p-0'>
            <form onSubmit={onSubmitHandler} className='flex flex-col items-center gap-4 w-full max-w-xl bg-gray-100 p-10 rounded-2xl'>

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
                    <label className='text-lg font-semibold'>Phone</label>
                    <input placeholder='1236871234' required type="phonenumber" name='phone' onChange={onChangeHandler} value={signupData.phone} className='w-full h-13 focus:outline-none pl-5 rounded-xl bg-white focus:border-2 border-yellow-400' />
                </div>

                <div className='flex flex-col w-full'>
                    <label className='text-lg font-semibold'>Email</label>
                    <input placeholder='example@gmail.ccom' required type="email" name='email' onChange={onChangeHandler} value={signupData.email} className='w-full h-13 focus:outline-none pl-5 rounded-xl bg-white focus:border-2 border-yellow-400' />
                </div>

                <div className='flex flex-col w-full'>
                    <label className='text-lg font-semibold'>Password</label>
                    <input placeholder='example12345' required type="password" name='password' onChange={onChangeHandler} value={signupData.password} className='w-full h-13 focus:outline-none pl-5 rounded-xl bg-white focus:border-2 border-yellow-400' />
                </div>

                <div className='flex flex-col w-full'>
                    <label className='text-lg font-semibold'>Match password</label>
                    <input placeholder='' type="password" required name='rePassword' onChange={onChangeHandlerPasswordMatch} value={matchPassword} className='w-full h-13 focus:outline-none pl-5 rounded-xl bg-white focus:border-2 border-yellow-400' />
                </div>

                <button className='w-full bg-yellow-400 py-3 cursor-pointer rounded-full mt-5 hover:bg-amber-300'>Sign up</button>
                <p>Already have an account? <Link to={"/login"} className='text-yellow-400 font-bold'>Login</Link></p>
            </form>
        </div>
    )
}

export default LandlordSignup