import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";


const AddProperties = () => {

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
  <div className='pt-25 space-y-5'>
    {user && user.role === 'Landlord' ? (
      <div>
        
      </div>





    ) : (
      <div>
        <h1 className='text-2xl flex justify-center font-semibold'>
          You must have landlord account to add properties
        </h1>
        <p className='text-2xl flex justify-center font-semibold'>
          If you are landlord and wish to add properties
        </p>
        <Link to={"/signup"}>
          <p className='text-xl flex justify-center underline text-yellow-500 hover:text-yellow-400'>
            click here
          </p>
        </Link>
      </div>
    )}
  </div>
)
}

export default AddProperties