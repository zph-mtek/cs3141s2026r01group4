import React, { use, useEffect, useMemo, useState } from 'react'
import { jwtDecode } from "jwt-decode";
import { Link } from 'react-router-dom';
import axios from 'axios';


const Manage = () => {
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
    <div className='max-w-lg mx-auto pt-20'>
      <div>
        <p>Hello, {user ? user.firstName : 'Loading...'}!</p>
          
      </div>
    </div>
  )
}

export default Manage

