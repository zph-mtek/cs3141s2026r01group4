import React, { useEffect, useState } from 'react'
import { jwtDecode } from "jwt-decode";
import pfp from "../assets/catpfp.jpg"
import { MdDeleteOutline } from "react-icons/md";

const Profile = () => {

    const [user, setUser] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');

        if (token) {
            try {
                const decoded = jwtDecode(token);
                setUser(decoded.data);
            } catch (error) {
                console.error("Invalid token", error);
                localStorage.removeItem('token');
            }
        }
    }, []);

    return (
        <div className='pt-30 md:pt-0 grid grid-cols-1 xl:grid-cols-[auto_auto] p-10 xl:p-20 gap-5 justify-center items-center items-start'>
            <div className='md:sticky top-30 flex flex-col items-center justify-center shrink-0'>
                <img src={pfp} alt="" className='rounded-full shrink-0 object-cover h-70 border-yellow-400 border-4'/>

                
                <div className='flex flex-col justify-items-center items-center pt-5'>
                    <p className='font-bold text-2xl'>Cute cat</p>
                    <p className='text-sm text-gray-500'>Joined: 3/16/2026</p>
                    <p className=''>Reviews written: 8</p>

                    <button className='cursor-pointer mt-2 px-6 py-1.5 border border-gray-300 rounded-full text-sm font-medium hover:bg-gray-50 transition-colors'>
                        Change profile picture
                    </button>
                </div>
            </div>

            <div className='flex items-center flex-col justify-center'>
{/* review card */}

                {[1, 2, 3, 4, 5].map((index) => (
                    <div className='relative flex items-center p-10'>
                        <div className='max-w-120 h-auto shadow-md rounded-2xl'>
                            <div className='p-3'>
                                <div className='flex flex-col md:flex-row items-baseline justify-between w-full'>
                                    <p className='text-2xl font-semibold'>Husky Heights</p>
                                    <p className='text-sm py-2 text-gray-500'>8/27/2025 ~ 1/3/2026</p>
                                </div>
                                <p>⭐⭐⭐⭐⭐5</p>
                                <div>
                                    <p className='mt-4 text-gray-700 text-xl'>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Eligendi et similique vero accusantium repudiandae sed magni aperiam maxime, consectetur placeat? Ratione adipisci earum iste alias, ea non est ipsa expedita!</p>
                                </div>
                            </div>
                        </div>
                        <MdDeleteOutline className='text-3xl cursor-pointer absolute -right-2 hover:text-red-500'/>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Profile