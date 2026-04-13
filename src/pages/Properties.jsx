import React, { Fragment, useState, useEffect } from 'react'
import addressIcon from "../assets/maps-and-flags.png";
import { Link } from 'react-router-dom';
import { getAllProperties } from '../API/getAllProperties'; 

//-- Card for displaying Properties
const PropertyCard = ({ propInfo }) => {
  const mainImage = propInfo.images && propInfo.images.length > 0 
    ? `https://huskyrentlens.cs.mtu.edu/backend/${propInfo.images[0].imageUrl}` 
    : '';

  return (
    <Link to={`/properties/${propInfo.propertyId}`}> 
          
          <div className='flex flex-col rounded-2xl h-110 2xl:h-100 bg-white overflow-hidden cursor-pointer hover:bg-amber-200 transform transition duration-300 group shadow-sm'>
            <div className='p-5'>
              <img className='h-55 w-full object-cover rounded-2xl '
                  src={mainImage}
              alt={propInfo.name} />
            </div>

            <div className='px-5 flex'>
              <div className='w-full'>

                <div className='flex justify-between'>
                  <p className='font-extrabold text-2xl'>{propInfo.name}</p>
                  <p className=''>
                    from
                    <span className='text-yellow-400 text-3xl font-semibold group-hover:text-black transform transition duration-300'>
                      ${propInfo.lowest_price || '---'}
                    </span>
                    /month
                  </p>
                </div>

                <div className='flex items-center'>
                  <img className='h-5' src={addressIcon} alt="" />
                  <p className='text-gray-600 pb-2 pt-2'>{propInfo.address}</p>
                </div>

                <div className='bg-yellow-300 inline-block rounded-xl px-2 py-1'>
                  <p className='text-sm'>{propInfo.distanceFromMTU} miles from campus</p>
                </div>
              </div>
            </div>
            
          </div>
    </Link>
  )
}

//-- Properties Page
const Properties = () => {
  const [ availableProperties, updateProperties ] = useState([]);
  const [ isLoading, setIsLoading ] = useState(true);

  const [ searchTerm, setSearchTerm ] = useState('');
  const [ sortOrder, setSortOrder ] = useState(''); 

  const [ isFilterOpen, setIsFilterOpen ] = useState(false);

  useEffect(() => {
    const fetchAllProperties = async () => {
      try {
        const response = await getAllProperties();
        updateProperties(response.data);
      } catch (error) {
        console.error("Failed to fetch properties", error);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchAllProperties();
  }, []);

  const displayedProperties = availableProperties
    .filter((property) => {
      if (!searchTerm) return true;
      return property.name.toLowerCase().includes(searchTerm.toLowerCase())
        // || property
    })
    .sort((a, b) => {
      const priceA = Number(a.lowest_price) || 0;
      const priceB = Number(b.lowest_price) || 0;

      if (sortOrder === 'lowToHigh') {
        return priceA - priceB;
      } else if (sortOrder === 'highToLow') {
        return priceB - priceA;
      }
      return 0;
    });

  const sortOptions = [
    { value: '', label: 'Default (No Sort)' },
    { value: 'lowToHigh', label: 'Price: Low to High' },
    { value: 'highToLow', label: 'Price: High to Low' },
  ];

  const currentSortLabel = sortOptions.find(opt => opt.value === sortOrder)?.label || 'Sort by Price';

  return (
    <div className='flex flex-col'>
      <div className='flex flex-col space-y-5 items-center justify-center pt-20 pb-[5%] md:flex-row md:space-x-8 md:space-y-0 px-5'>

        <div className='w-full md:w-[500px] relative'>
          <input 
            type="text" 
            placeholder='Search apartments by name...' 
            className='w-full h-13 border-2 border-yellow-400 pl-5 pr-10 rounded-3xl focus:outline-none focus:ring-4 focus:ring-yellow-400/20 transition-all text-gray-700 font-medium'
            value={searchTerm} // Search Term for the honey
            onChange={(e) => setSearchTerm(e.target.value)}
          /> 
          <svg className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </div>

        <div className="relative w-full md:w-64">
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`flex items-center justify-between w-full h-13 px-5 rounded-3xl border-2 transition-all duration-200 focus:outline-none ${
              isFilterOpen 
                ? 'border-yellow-500 bg-yellow-50 ring-4 ring-yellow-400/20' 
                : 'border-yellow-400 bg-white hover:bg-yellow-50'
            }`}
          >
            <span className="font-bold text-gray-700 truncate mr-2">{currentSortLabel}</span>
            <svg 
              className={`w-5 h-5 text-yellow-600 transition-transform duration-300 ${isFilterOpen ? 'rotate-180' : ''}`} 
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </button>

          {isFilterOpen && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setIsFilterOpen(false)}
              ></div>
              
              <div className="absolute z-20 w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden py-2 transform opacity-100 scale-100 transition-all">
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setSortOrder(option.value);
                      setIsFilterOpen(false); 
                    }}
                    className={`w-full text-left px-5 py-3 text-sm transition-colors duration-150 ${
                      sortOrder === option.value 
                        ? 'bg-yellow-100/50 font-extrabold text-yellow-700 border-l-4 border-yellow-400' 
                        : 'text-gray-600 font-medium hover:bg-gray-50 border-l-4 border-transparent'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
        
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8 bg-gray-50 px-4 md:px-10 py-10 rounded-t-[3rem]'>
        { isLoading ? (
          <div className="col-span-full flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-yellow-200 border-t-yellow-500 rounded-full animate-spin mb-4"></div>
            <p className="font-bold text-xl text-gray-500">Loading Properties...</p>
          </div>
        ) : displayedProperties && displayedProperties.length > 0 ? (
          displayedProperties.map((property) => (
            <Fragment key={property.propertyId}>
              <PropertyCard propInfo={property} />
            </Fragment>
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-20">
            <p className="font-bold text-2xl text-gray-400 mb-2">No properties found :(</p>
            <p className="text-gray-500">Try adjusting your search term.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Properties;