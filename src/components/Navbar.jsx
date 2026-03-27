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
        <div className='flex w-full pb-8 relative'>
            <Link to={"/"} className='z-20'>
                <img src={logoImage} className='w-20 h-auto absolute top-2 left-6' alt="" />
            </Link>

            <div className={`flex w-full justify-center bg-white absolute h-auto pb-20 pt-20 md:static md:flex md:justify-end md:pr-8 md:py-4 md:pt-6 ${menuToggle === 'close' ? 'hidden md:flex' : 'flex'}`}>
                <ul className='flex flex-col items-center text-xl font-bold text-center gap-8 md:flex-row md:gap-7 md:text-base'>
                    <li className="cursor-pointer" name="find" onClick={toggleMenu}><Link to={"/properties"}>Find properties</Link></li>
                    <li className="cursor-pointer" name="about" onClick={toggleMenu}><Link to={"/about"}>About</Link></li>

                    {!user && (
                    <li className="cursor-pointer" name="signin" onClick={toggleMenu}><Link to={"/login"}>Sign in</Link></li>
                    )}

                    {(!user || user.role === 'Landlord') && (
                        <li className="cursor-pointer" name="add" onClick={toggleMenu}><Link to={"/manage"}>Manage properties</Link></li>
                    )}

                    {user && (
                    <Link to={"/profile"}><FaRegUserCircle className='cursor-pointer text-lg md:text-xl'></FaRegUserCircle></Link>
                    )}

                    {user && (
                    <Link to={"/"}><MdLogout onClick={logOutHandler} className='text-lg md:text-xl'/></Link>
                    )}
                    
                </ul>
            </div>



            <div className='absolute top-6 right-5 z-30 md:hidden'>
                <button onClick={toggleMenu}>
                    {menuToggle === 'close' ? <RxHamburgerMenu className='cursor-pointer text-3xl md:hidden' /> : <GrClose className='cursor-pointer text-3xl md:hidden' />}
                </button>
            </div>
        </div>
    )
}

export default Navbar