import React, { useEffect, useState, useRef } from 'react'
import logoImage from "../assets/huskyrentlens.png";
import { Link, useLocation } from 'react-router-dom';
import { FaRegUserCircle } from "react-icons/fa";
import { jwtDecode } from "jwt-decode";
import { MdLogout } from "react-icons/md";
import { HiOutlineSearch, HiOutlineInformationCircle, HiOutlineLogin, HiOutlineOfficeBuilding, HiOutlineMap } from "react-icons/hi";

const navLinks = [
    { to: "/properties", label: "Find Properties", icon: <HiOutlineSearch /> },
    { to: "/map", label: "Map View", icon: <HiOutlineMap /> },
    { to: "/about", label: "About", icon: <HiOutlineInformationCircle /> },
];

const NavLink = ({ to, label, isActive, onClick, icon }) => (
    <Link
        to={to}
        onClick={onClick}
        className="group relative px-3 py-2 text-sm font-medium tracking-wide transition-colors duration-200"
    >
        <span className={`flex items-center gap-2 ${isActive ? 'text-yellow-400' : 'text-gray-700 group-hover:text-yellow-400'}`}>
            <span className="text-base opacity-70 group-hover:opacity-100 transition-opacity md:hidden lg:inline">{icon}</span>
            {label}
        </span>
        {/* Animated underline */}
        <span
            className={`absolute bottom-0 left-1/2 h-0.5 bg-gradient-to-r from-yellow-400 to-amber-400 rounded-full shadow-[0_0_8px_rgba(250,204,21,0.6)] transition-all duration-300 ease-out ${isActive ? 'w-4/5 -translate-x-1/2 shadow-[0_0_12px_rgba(250,204,21,0.8)]' : 'w-0 -translate-x-1/2 group-hover:w-4/5'
                }`}
        />
    </Link>
);

const MobileNavLink = ({ to, label, icon, isActive, onClick, index }) => (
    <Link
        to={to}
        onClick={onClick}
        className={`flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-200 ${isActive
            ? 'bg-yellow-50 text-yellow-600 shadow-[0_0_12px_rgba(250,204,21,0.5)]'
            : 'text-gray-700 hover:bg-yellow-50/60 hover:text-yellow-600 active:scale-[0.98]'
            }`}
        style={{ animationDelay: `${index * 60}ms` }}
    >
        <span className={`text-xl ${isActive ? 'text-yellow-500' : 'text-gray-400'}`}>{icon}</span>
        <span className="text-base font-semibold">{label}</span>
    </Link>
);

const Navbar = () => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [user, setUser] = useState(null);
    const navRef = useRef(null);
    const location = useLocation();

    // Decode user token
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

    // Scroll listener for glassmorphism effect
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 12);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // Lock body scroll when mobile menu is open
    useEffect(() => {
        document.body.style.overflow = mobileOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [mobileOpen]);

    const closeMobile = () => setMobileOpen(false);

    const logOutHandler = () => {
        localStorage.removeItem('token');
        setUser(null);
        setMobileOpen(false);
    };

    const isActive = (path) => location.pathname === path;

    // Build dynamic links
    const allLinks = [
        ...navLinks,
        // Landlord 
        ...(user && user.role === 'Landlord'
            ? [{ to: "/manage", label: "Manage Properties", icon: <HiOutlineOfficeBuilding /> }]
            : []),
        // Admin
        ...(user && user.role === 'admin'
            ? [{ to: "/admin", label: "Admin Dashboard", icon: <HiOutlineOfficeBuilding /> }] 
            : []),
        // not login
        ...(!user ? [{ to: "/login", label: "Sign In", icon: <HiOutlineLogin /> }] : []),
    ];

    return (
        <>
            {/* ───── Top bar ───── */}
            <nav
                ref={navRef}
                className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled
                    ? 'bg-white shadow-[0_2px_24px_rgba(0,0,0,0.06)]'
                    : 'bg-white'
                    }`}
            >
                <div className="mx-auto flex h-14 md:h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    {/* Logo */}
                    <Link to="/" className="flex-shrink-0 group" onClick={closeMobile}>
                        <img
                            src={logoImage}
                            alt="HuskyRentLens"
                            className="h-9 md:h-11 w-auto transition-transform duration-300 group-hover:scale-105"
                        />
                    </Link>

                    {/* Desktop links */}
                    <div className="hidden md:flex items-center gap-1">
                        {allLinks.map((link) => (
                            <NavLink
                                key={link.to}
                                {...link}
                                isActive={isActive(link.to)}
                                onClick={closeMobile}
                            />
                        ))}

                        {/* User actions */}
                        {user && (
                            <div className="flex items-center gap-1 ml-2 pl-3 border-l border-gray-200">
                                {user.role !== 'Landlord' && (
                                    <Link
                                        to="/profile"
                                        className={`p-2 rounded-full transition-colors duration-200 ${isActive('/profile')
                                            ? 'text-yellow-500 bg-yellow-50 shadow-[0_0_12px_rgba(250,204,21,0.5)]'
                                            : 'text-gray-500 hover:text-yellow-500 hover:bg-yellow-50/60'
                                            }`}
                                    >
                                        <FaRegUserCircle className="text-xl" />
                                    </Link>
                                )}
                                <Link
                                    to="/"
                                    onClick={logOutHandler}
                                    className="p-2 rounded-full text-gray-400 hover:text-yellow-500 hover:bg-yellow-50/60 transition-colors duration-200"
                                    title="Log out"
                                >
                                    <MdLogout className="text-xl" />
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Hamburger button — animated bars */}
                    <button
                        onClick={() => setMobileOpen((o) => !o)}
                        className="relative md:hidden z-50 h-9 w-9 rounded-xl flex items-center justify-center hover:bg-gray-100/80 transition-colors focus:outline-none"
                        aria-label="Toggle menu"
                    >
                        <div className="flex flex-col justify-center items-center w-5 h-5">
                            <span
                                className={`block h-0.5 w-5 rounded-full bg-gray-800 transition-all duration-300 ease-out ${mobileOpen ? 'rotate-45 translate-y-[3px]' : ''
                                    }`}
                            />
                            <span
                                className={`block h-0.5 w-5 rounded-full bg-gray-800 mt-1.5 transition-all duration-300 ease-out ${mobileOpen ? '-rotate-45 -translate-y-[3px]' : ''
                                    }`}
                            />
                        </div>
                    </button>
                </div>
            </nav>

            {/* ───── Mobile drawer overlay ───── */}
            <div
                className={`fixed inset-0 z-40 md:hidden transition-opacity duration-300 ${mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                    }`}
                onClick={closeMobile}
            >
                <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
            </div>

            {/* ───── Mobile drawer ───── */}
            <div
                className={`fixed top-0 right-0 z-40 md:hidden h-full w-[min(80vw,320px)] bg-white/95 backdrop-blur-2xl shadow-2xl transition-transform duration-[400ms] ease-[cubic-bezier(0.32,0.72,0,1)] ${mobileOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
            >
                <div className="flex flex-col h-full pt-20 pb-8 px-4 overflow-y-auto">
                    {/* Nav links */}
                    <div className="flex flex-col gap-1">
                        {allLinks.map((link, i) => (
                            <MobileNavLink
                                key={link.to}
                                {...link}
                                isActive={isActive(link.to)}
                                onClick={closeMobile}
                                index={i}
                            />
                        ))}
                    </div>

                    {/* Spacer */}
                    <div className="flex-1" />

                    {/* User section at bottom */}
                    {user && (
                        <div className="border-t border-gray-100 pt-4 mt-4 flex flex-col gap-1">
                            {user.role !== 'Landlord' && (
                                <Link
                                    to="/profile"
                                    onClick={closeMobile}
                                    className={`flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-200 ${isActive('/profile')
                                            ? 'bg-yellow-50 text-yellow-700'
                                            : 'text-gray-700 hover:bg-yellow-50'
                                        }`}
                                >
                                    <FaRegUserCircle className="text-xl" />
                                    <span className="text-base font-semibold">Profile</span>
                                </Link>
                            )}
                            <Link
                                to="/"
                                onClick={logOutHandler}
                                className="flex items-center gap-4 px-6 py-4 rounded-2xl text-yellow-600 hover:bg-yellow-50 transition-all duration-200"
                            >
                                <MdLogout className="text-xl" />
                                <span className="text-base font-semibold">Log out</span>
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            {/* ───── Spacer so content doesn't hide behind fixed nav ───── */}
            <div className="h-14 md:h-16" />
        </>
    );
};

export default Navbar