import React from 'react';
import { FaCar, FaSnowflake, FaChair, FaBath, FaQuestion, FaHotTub, FaFire, FaBicycle, FaBox, FaWheelchair, FaBook } from "react-icons/fa";
import { MdOutlineSoupKitchen, MdOutlineLocalLaundryService, MdOutlineShower, MdPets, MdSecurity, MdFitnessCenter, MdElevator, MdPool, MdBalcony } from "react-icons/md";
import { BiDish } from "react-icons/bi";
import { IoWifi } from "react-icons/io5";
import { LuHeater } from "react-icons/lu";
import { TbAirConditioning, TbMicrowave } from "react-icons/tb";
import { PiTelevisionSimpleBold } from "react-icons/pi";
import { BsTrash } from "react-icons/bs";

export const amenityIcon = {
    // infra stuff
    "wifi": <IoWifi />,
    "water": <MdOutlineShower />, 
    "trash": <BsTrash />,      
    
    // ac stuff
    "heating": <LuHeater />,
    "ac": <TbAirConditioning />,
    "snow_removal": <FaSnowflake />,
    "fireplace": <FaFire />,
    
    // room stuff
    "kitchen": <MdOutlineSoupKitchen />,
    "microwave": <TbMicrowave />,
    "dishwasher": <BiDish />,
    "laundry": <MdOutlineLocalLaundryService />,
    "shower": <MdOutlineShower />,
    "bathtub": <FaBath />,
    "furnished": <FaChair />,        
    "tv": <PiTelevisionSimpleBold />,
    "balcony": <MdBalcony />,
    
    // public stuff
    "parking": <FaCar />,
    "gym": <MdFitnessCenter />,
    "pool": <MdPool />,
    "hot_tub": <FaHotTub />,
    "study_lounge": <FaBook />,
    "bike_storage": <FaBicycle />,
    "package_lockers": <FaBox />,
    "elevator": <MdElevator />,
    "pets": <MdPets />,              
    "security": <MdSecurity />,      
    "wheelchair_accessible": <FaWheelchair />,
};

export const DefaultIcon = <FaQuestion />;