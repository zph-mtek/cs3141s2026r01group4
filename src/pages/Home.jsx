import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Fragment } from 'react';
import { getAllProperties } from '../API/getAllProperties';

const Home = () => {
    const [properties, setProperties] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await getAllProperties();
                setProperties(response.data); 
            } catch (error) {
                console.error("Failed to fetch properties");
            } finally {
                setIsLoading(false); 
            }
        };

        fetchData();
    }, []);

    useEffect(()=>{
        if (properties.length > 0) {
            console.log(properties)
            console.log(properties[0].images[0]);
        }
    }, [properties])

    if (isLoading) {
        return <div>Loading properties...</div>;
    }


        return (
        <>
            
            <div>
                <div className="min-h-screen bg-white text-gray-900 flex flex-col">
                    {/* text section */}
                    <section className="text-center mt-6 md:mt-10 px-6">
                        <h1 className="text-3xl md:text-5xl font-bold leading-tight">
                            Find the best apartments near <br className="hidden md:block" />
                            Michigan Technological University
                        </h1>
                        <p className="mt-4 md:mt-6 text-base md:text-xl text-gray-600">
                            See ratings and read real student reviews <br className="hidden md:block" />
                            compare apartments with confidence
                        </p>
                    </section>

                    {/* listing */}
                    <section className="mt-10 md:mt-16 bg-gray-100 rounded-none md:rounded-3xl mx-0 md:mx-8 p-4 md:p-10 space-y-6 md:space-y-8">
                        {properties.slice(0, 3).map((property, index) => (
                            <div
                                key={index}
                                className="flex flex-col md:flex-row bg-white rounded-2xl shadow-sm p-4 md:p-6 md:items-center"
                            >
                                {/* image */}
                                <div className="w-full md:w-64 h-48 rounded-xl flex items-center justify-center text-white text-2xl">
                                    <img className='w-full object-cover h-full rounded-xl' alt="" />
                                </div>

                                {/* info text*/}
                                <div className="flex-1 md:ml-8 mt-4 md:mt-0">
                                    <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                                        <h2 className="text-xl md:text-2xl font-bold">
                                            {property.name}
                                        </h2>
                                        <p className="text-2xl md:text-3xl font-bold mt-2 md:mt-0">
                                            From {property.lowest_price}<span className="text-sm md:text-lg font-medium">/month</span>
                                        </p>
                                    </div>

                                    <div className="mt-3 space-y-1 text-gray-700 text-sm md:text-base">
                                        <p>📍 {property.address}</p>
                                        <p>📞 313-123-5555</p>
                                    </div>

                                    <p className="mt-3 text-gray-600 text-sm md:text-base">
                                        {property.description}
                                    </p>

                                    {/* mobile button */}
                                    <Link to={"/properties/id"}>
                                        <div className="mt-4 md:hidden">
                                            <button className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-3 rounded-xl cursor-pointer">
                                                See Feedbacks
                                            </button>
                                        </div>
                                    </Link>
                                </div>

                                {/* desktop Button */}
                                <Link to={`/properties/${property.propertyId}`}>
                                <div className="hidden md:block md:ml-8">
                                    <button className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-6 py-3 rounded-xl cursor-pointer">
                                        See Feedbacks
                                    </button>
                                </div>
                                </Link>
                            </div>
                        ))}
                    </section>

                    {/* footer */}
                    <div className="bg-yellow-400 mt-10 md:mt-16 py-6 md:py-8 text-center md:text-right md:pr-16">
                        <span className="text-lg md:text-2xl font-medium cursor-pointer">
                            Search for more --&gt;
                        </span>
                    </div>
                    {/* NEW CUTE DISCLAIMER FOOTER */}
                    <footer className="bg-gray-50 text-gray-500 py-10 px-6 text-center text-sm md:text-base border-t border-gray-200 mt-auto">
                        <p className="max-w-3xl mx-auto leading-relaxed">
                            🐾 <strong>HuskyRentLens</strong> is an independent student project built with love for the CS3141 Team Software Project course. 
                            <br className="hidden md:block" />
                            We are not affiliated with, officially maintained by, or endorsed by Michigan Technological University (MTU). 
                            Reviews and opinions expressed here belong solely to the students, not the school! 🎓
                        </p>
                        <div className="mt-5 space-x-6 font-medium">
                            <Link to="/privacy-policy" className="hover:text-yellow-500 transition-colors duration-200">Privacy Policy</Link>
                            <span className="text-gray-300">|</span>
                            <Link to="/guidelines" className="hover:text-yellow-500 transition-colors duration-200">Community Guidelines</Link>
                        </div>
                    </footer>
                    
                </div>
            </div>
        </>
        )
    }

    export default Home