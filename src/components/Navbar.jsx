import React from 'react'
import logoImage from "../assets/husyrentlens.png";
import { Link } from 'react-router-dom';

const Navbar = () => {
    return (
        <div className="flex w-full items-center justify-between px-6 md:px-15 py-4 z-0">
            <Link to={"/"}>
                <img src={logoImage} className="w-30 h-auto" alt="Logo" />
            </Link>

            <div className="flex items-center">
                <ul className="flex text-lg md:text-xl space-x-6 md:space-x-10">
                    <li className="cursor-pointer"><Link to={"/properties"}>Find properties</Link></li>
                    <li className="cursor-pointer"><Link to={"/about"}>About</Link></li>
                    <li className="cursor-pointer"><Link to={"/login"}>Sign in</Link></li>
                    <li className="cursor-pointer"><Link to={"/add"}>Add properties</Link></li>
                </ul>
            </div>
        </div>
    )
}

export default Navbar