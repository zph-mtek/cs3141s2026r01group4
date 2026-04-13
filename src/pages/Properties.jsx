import React, { Fragment, useState, useEffect } from 'react'
import addressIcon from "../assets/maps-and-flags.png";
import { Link, useSearchParams } from 'react-router-dom';
import { getAllProperties } from '../API/getAllProperties'; 

//-- Card for displaying Properties
const PropertyCard = ({ propInfo, viewMode = 'grid' }) => {
  const mainImage = propInfo.images && propInfo.images.length > 0 
    ? `https://huskyrentlens.cs.mtu.edu/backend/${propInfo.images[0].imageUrl}` 
    : '';

  if (viewMode === 'list') {
    return (
      <Link to={`/properties/${propInfo.propertyId}`}> 
        <div className='flex items-stretch gap-3 rounded-2xl bg-white overflow-hidden cursor-pointer hover:bg-amber-50 transition duration-300 group shadow-sm border border-gray-100 p-3'>
          <div className='w-28 h-28 shrink-0 rounded-xl overflow-hidden bg-gray-100'>
            {mainImage ? (
              <img className='h-full w-full object-cover' src={mainImage} alt={propInfo.name} />
            ) : (
              <div className='h-full w-full flex items-center justify-center text-xs text-gray-400'>No Image</div>
            )}
          </div>

          <div className='min-w-0 flex-1 flex flex-col justify-between'>
            <div className='flex items-start justify-between gap-3'>
              <p className='font-extrabold text-base leading-tight line-clamp-2'>{propInfo.name}</p>
              <p className='text-right shrink-0 leading-none'>
                <span className='block text-[11px] uppercase tracking-wide text-gray-400'>from</span>
                <span className='text-yellow-500 text-lg font-semibold group-hover:text-black transition duration-300'>
                  ${propInfo.lowest_price || '---'}
                </span>
                <span className='block text-[11px] text-gray-400'>/mo</span>
              </p>
            </div>

            <div className='flex items-start gap-2 mt-2'>
              <img className='h-4 mt-0.5' src={addressIcon} alt="" />
              <p className='text-gray-600 text-sm line-clamp-2'>{propInfo.address}</p>
            </div>

            {propInfo.distanceFromMTU && (
              <div className='mt-2'>
                <div className='bg-yellow-100 text-yellow-800 inline-block rounded-full px-2.5 py-1'>
                  <p className='text-[11px] font-semibold'>{propInfo.distanceFromMTU} miles from campus</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link to={`/properties/${propInfo.propertyId}`}> 
          
          <div className='flex flex-col rounded-2xl bg-white overflow-hidden cursor-pointer hover:bg-amber-50 transform transition duration-300 group shadow-sm border border-gray-100 h-full'>
            <div className='p-3 md:p-5'>
              {mainImage ? (
                <img className='h-36 md:h-55 w-full object-cover rounded-2xl '
                    src={mainImage}
                alt={propInfo.name} />
              ) : (
                <div className='h-36 md:h-55 w-full rounded-2xl bg-gray-100 flex items-center justify-center text-xs text-gray-400'>No Image</div>
              )}
            </div>

            <div className='px-3 pb-3 md:px-5 md:pb-5 flex h-full'>
              <div className='w-full'>

                <div className='flex justify-between items-start gap-2'>
                  <p className='font-extrabold text-base md:text-2xl leading-tight line-clamp-2'>{propInfo.name}</p>
                  <p className='text-right shrink-0 leading-none'>
                    <span className='block text-[10px] md:text-xs uppercase tracking-wide text-gray-400'>from</span>
                    <span className='text-yellow-400 text-lg md:text-3xl font-semibold group-hover:text-black transform transition duration-300'>
                      ${propInfo.lowest_price || '---'}
                    </span>
                    <span className='block text-[10px] md:text-xs text-gray-400'>/month</span>
                  </p>
                </div>

                <div className='flex items-start gap-2 mt-2'>
                  <img className='h-4 md:h-5 mt-0.5' src={addressIcon} alt="" />
                  <p className='text-gray-600 text-xs md:text-base line-clamp-2'>{propInfo.address}</p>
                </div>

                {propInfo.distanceFromMTU && (
                  <div className='bg-yellow-100 inline-block rounded-full px-2 py-1 mt-2'>
                    <p className='text-[11px] md:text-sm font-semibold text-yellow-800'>{propInfo.distanceFromMTU} miles from campus</p>
                  </div>
                )}
              </div>
            </div>
            
          </div>
    </Link>
  )
}

//-- Properties Page
const Properties = () => {
  document.title = 'Find Properties | HuskyRentLens';
  const [searchParams] = useSearchParams();
  const [ availableProperties, updateProperties ] = useState([]);
  const [ isLoading, setIsLoading ] = useState(true);

  const [ searchTerm, setSearchTerm ] = useState(searchParams.get('search') || '');
  const [ sortOrder, setSortOrder ] = useState(''); 
  const [ mobileView, setMobileView ] = useState('grid');

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
      const query = searchTerm.toLowerCase();
      return property.name?.toLowerCase().includes(query)
        || property.address?.toLowerCase().includes(query)
        || property.city?.toLowerCase().includes(query)
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
    <div className='flex flex-col bg-white min-h-screen'>
      <div className='sticky top-14 md:top-16 z-20 bg-white/95 backdrop-blur border-b border-gray-100'>
        <div className='flex flex-col space-y-4 items-center justify-center pt-4 pb-5 md:flex-row md:space-x-8 md:space-y-0 px-4 md:px-5 md:pt-20 md:pb-[5%]'>

          <div className='w-full md:hidden flex items-center justify-between gap-3'>
            <div>
              <h1 className='text-xl font-extrabold text-gray-900'>Find Properties</h1>
              <p className='text-sm text-gray-500'>{isLoading ? 'Loading listings…' : `${displayedProperties.length} places to explore`}</p>
            </div>

            <div className='inline-flex rounded-2xl bg-gray-100 p-1'>
              <button
                onClick={() => setMobileView('grid')}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors ${mobileView === 'grid' ? 'bg-white text-yellow-700 shadow-sm' : 'text-gray-500'}`}
              >
                2-up
              </button>
              <button
                onClick={() => setMobileView('list')}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors ${mobileView === 'list' ? 'bg-white text-yellow-700 shadow-sm' : 'text-gray-500'}`}
              >
                List
              </button>
            </div>
          </div>

          <div className='w-full md:w-[500px] relative'>
            <input 
              type="text" 
              placeholder='Search apartments by name, address...' 
              className='w-full h-12 md:h-13 border-2 border-yellow-400 pl-4 pr-10 rounded-3xl focus:outline-none focus:ring-4 focus:ring-yellow-400/20 transition-all text-gray-700 font-medium text-sm md:text-base'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            /> 
            <svg className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>

          <div className="relative w-full md:w-64">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`flex items-center justify-between w-full h-12 md:h-13 px-4 md:px-5 rounded-3xl border-2 transition-all duration-200 focus:outline-none ${
                isFilterOpen 
                  ? 'border-yellow-500 bg-yellow-50 ring-4 ring-yellow-400/20' 
                  : 'border-yellow-400 bg-white hover:bg-yellow-50'
              }`}
            >
              <span className="font-bold text-sm md:text-base text-gray-700 truncate mr-2">{currentSortLabel}</span>
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
      </div>

      <div className={`grid ${mobileView === 'grid' ? 'grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3'} gap-3 md:gap-8 bg-gray-50 px-3 md:px-10 py-5 md:py-10 rounded-t-[2rem] md:rounded-t-[3rem]`}>
        { isLoading ? (
          <div className="col-span-full flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-yellow-200 border-t-yellow-500 rounded-full animate-spin mb-4"></div>
            <p className="font-bold text-xl text-gray-500">Loading Properties...</p>
          </div>
        ) : displayedProperties && displayedProperties.length > 0 ? (
          displayedProperties.map((property) => (
            <Fragment key={property.propertyId}>
              <PropertyCard propInfo={property} viewMode={mobileView} />
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