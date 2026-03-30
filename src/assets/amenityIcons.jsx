import React from 'react';
import { FaCar, FaSnowflake, FaChair, FaBath, FaQuestion } from "react-icons/fa";
import { MdOutlineSoupKitchen, MdOutlineLocalLaundryService, MdOutlineShower, MdPets, MdSecurity, MdFitnessCenter } from "react-icons/md";
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
    
    // room stuff
    "kitchen": <MdOutlineSoupKitchen />,
    "microwave": <TbMicrowave />,
    "laundry": <MdOutlineLocalLaundryService />,
    "shower": <MdOutlineShower />,
    "bathtub": <FaBath />,
    "furnished": <FaChair />,        
    "tv": <PiTelevisionSimpleBold />,
    
    // public stuff
    "parking": <FaCar />,
    "gym": <MdFitnessCenter />,
    "pets": <MdPets />,              
    "security": <MdSecurity />,      
};


export const DefaultIcon = <FaQuestion />;