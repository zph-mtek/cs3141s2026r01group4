import React from 'react'
import { FaDivide, FaRegUser } from "react-icons/fa";
import { PiHouseLine } from "react-icons/pi";
import { BsExclamationOctagon } from "react-icons/bs";
import { Link } from 'react-router-dom';

const Admin = () => {
  return (
    <div className='flex items-center justify-center h-100 mr-auto ml-auto pt-70'>
        <div className='flex flex-col gap-10'>
            {/* user section */}
            <Link to={"/admin/manageusers"} className='w-150 border-2 rounded-2xl h-20 hover:bg-yellow-300 cursor-pointer'>
                <div className='flex items-center h-full justify-center gap-3'>
                    <FaRegUser className='text-2xl'/>
                    <p className='text-2xl'>Manage user</p>
                </div>
            </Link>

                        {/* Properties section */}
            <Link to={"/admin/manageproperties"} className='w-150 border-2 rounded-2xl h-20 hover:bg-yellow-300 cursor-pointer'>
                <div className='flex items-center h-full justify-center gap-3'>
                    <PiHouseLine className='text-2xl'/>
                    <p className='text-2xl'>Manage property</p>
                </div>
            </Link>

                        {/* Reports section */}
            <Link to={"/admin/reports"} className='w-150 border-2 rounded-2xl h-20 hover:bg-yellow-300 cursor-pointer'>
                <div className='flex items-center h-full justify-center gap-3'>
                    <BsExclamationOctagon className='text-2xl'/>
                    <p className='text-2xl'>Reports</p>
                </div>
            </Link>
        </div>
    </div>
  )
}

export default Admin