import React, { useEffect, useState } from 'react'
import { jwtDecode } from "jwt-decode";

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
        <div className='flex items-center justify-center'>
            {user ? (
                <div>
                    <p className='text-2xl'>name: {user.firstName}</p>
                    <p className='text-2xl'>role: {user.role}</p>
                </div>
            ) : (
                <p>Loading...</p>
            )}
        </div>
    )
}

export default Profile