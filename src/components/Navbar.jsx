import React, { useEffect, useState } from 'react'
import logoImage from "../assets/husyrentlens.png";
import { Link } from 'react-router-dom';
import { RxHamburgerMenu } from "react-icons/rx";
import { GrClose } from "react-icons/gr";
import { FaRegUserCircle } from "react-icons/fa";
import { jwtDecode } from "jwt-decode";
import { MdLogout } from "react-icons/md";

const Navbar = () => {
    const [menuToggle, setMenuToggle] = useState("close");
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

    const toggleMenu = () => {
        setMenuToggle(prev => (prev === 'close' ? 'open' : 'close'))
    }

    const logOutHandler = () => {
        alert("Logged out successfully");
        localStorage.removeItem('token');
        setUser(null);
        setMenuToggle("close");
    }

    return (
        <div className='flex w-full pb-20 relative pb-30'>
            <Link to={"/"} className='z-20'>
                <img src={logoImage} className='w-30 h-auto absolute top-3 left-10' alt="" />
            </Link>

            <div className={`flex w-full justify-center bg-white absolute h-auto pb-30 pt-40 md:static md:flex md:justify-end md:pr-10 md:py-6 md:pt-10 ${menuToggle === 'close' ? 'hidden md:flex' : 'flex'}`}>
                <ul className='flex flex-col items-center text-2xl font-bold text-center gap-12 md:flex-row md:gap-10 md:text-lg'>
                    <li className="cursor-pointer" name="find" onClick={toggleMenu}><Link to={"/properties"}>Find properties</Link></li>
                    <li className="cursor-pointer" name="about" onClick={toggleMenu}><Link to={"/about"}>About</Link></li>

                    {!user && (
                    <li className="cursor-pointer" name="signin" onClick={toggleMenu}><Link to={"/login"}>Sign in</Link></li>
                    )}

                    {(!user || user.role === 'Landlord') && (
                        <li className="cursor-pointer" name="add" onClick={toggleMenu}><Link to={"/add"}>Add properties</Link></li>
                    )}

                    {user && (
                    <Link to={"/profile"}><FaRegUserCircle className='cursor-pointer text-2xl'></FaRegUserCircle></Link>
                    )}

                    {user && (
                    <Link to={"/"}><MdLogout onClick={logOutHandler} className='text-2xl'/></Link>
                    )}
                    
                </ul>
            </div>



            <div className='absolute top-10 right-5 z-30 md:hidden'>
                <button onClick={toggleMenu}>
                    {menuToggle === 'close' ? <RxHamburgerMenu className='cursor-pointer text-4xl md:hidden' /> : <GrClose className='cursor-pointer text-4xl md:hidden' />}
                </button>
            </div>
        </div>
    )
}

export default Navbar