import React from 'react'
import { Link } from 'react-router-dom';


const AddProperties = () => {
  return (
    <div className='pt-25 space-y-5'>
        <h1 className='text-2xl flex justify-center font-semibold'>You must have landlord account to add properties</h1>
        <p className='text-2xl flex justify-center font-semibold'>If you are landlord and wish to add properties</p>

        <Link to={"/signup"}>
          <p className='text-xl flex justify-center underline text-yellow-500 hover:text-yellow-400 '>click here</p>
        </Link>
    </div>
  )
}

export default AddProperties