import React, { useState } from 'react'
import logoImage from "../assets/husyrentlens.png";
import { Link } from 'react-router-dom';
import { RxHamburgerMenu } from "react-icons/rx";
import { GrClose } from "react-icons/gr";

const Navbar = () => {

    const [menuToggle, setMenuToggle] = useState("close");

    const toggleMenu = () => {
        setMenuToggle(prev => (prev === 'close' ? 'open' : 'close'))
    }

    return (
        // <div className="flex w-full items-center justify-between px-6 md:px-15 py-4 z-0">
        //     <Link to={"/"}>
        //         <img src={logoImage} className="w-30 h-auto" alt="Logo" />
        //     </Link>

        //     <div className="flex items-center">
        //         <ul className="flex flex-col text-center items-center text-2xl md:flex-row md:text-xl md:space-x-10 w-full">
        //             <li className="cursor-pointer"><Link to={"/properties"}>Find properties</Link></li>
        //             <li className="cursor-pointer"><Link to={"/about"}>About</Link></li>
        //             <li className="cursor-pointer"><Link to={"/login"}>Sign in</Link></li>
        //             <li className="cursor-pointer"><Link to={"/add"}>Add properties</Link></li>
        //         </ul>
        //     </div>
        // </div>

        <div className='flex w-full pb-20 relative pb-30'>
            <Link to={"/"} className='z-20'>
                <img src={logoImage} className='w-30 h-auto absolute top-3 left-10' alt="" />
            </Link>

            <div className={`flex w-full justify-center bg-white absolute h-auto pb-30 pt-40 md:static md:flex md:justify-end md:pr-10 md:py-6 md:pt-10 ${menuToggle === 'close' ? 'hidden md:flex' : 'flex'}`}>
                <ul className='flex flex-col items-center text-2xl font-bold text-center gap-12 md:flex-row md:gap-10 md:text-lg'>
                    <li className="cursor-pointer" onClick={toggleMenu}><Link to={"/properties"}>Find properties</Link></li>
                    <li className="cursor-pointer" onClick={toggleMenu}><Link to={"/about"}>About</Link></li>
                    <li className="cursor-pointer" onClick={toggleMenu}><Link to={"/login"}>Sign in</Link></li>
                    <li className="cursor-pointer" onClick={toggleMenu}><Link to={"/add"}>Add properties</Link></li>
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