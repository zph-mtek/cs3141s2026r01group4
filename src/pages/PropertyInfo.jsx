import React, { useState, Fragment, useEffect } from 'react';
import addressIcon from "../assets/maps-and-flags.png";
import { CiCircleChevLeft, CiCircleChevRight} from "react-icons/ci";
import pfp from "../assets/catpfp.jpg"
import { Link, useParams } from 'react-router-dom';
import StarRating from '../components/StarRating.jsx';
import MapComponents from '../components/MapCom';
import { getPropertyById } from '../API/getPropertyById.js';
import ImageModal from '../components/ImageModal.jsx';
import { amenityIcon } from '../assets/amenityIcons.jsx';

const PropertyInfo = () => {

  const toggleModal = () => {
    setModalStatus(!modalStatus)
  }

  
  
  const { propertyId } = useParams();
  const [properties, setProperties] = useState([]);
  const [rentals, setRentals] = useState([]);
  const [coordinates, setCoordinates] = useState({ lat: null, lng: null });
  const [modalStatus, setModalStatus] = useState(false);
  const [slidePhotos, setSlidePhotos] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [amenities, setAmenities] = useState([]);
  const [propertyRating, setPropertyRating] = useState('N/A')

  //calculate rating
  useEffect(()=>{
    if(reviews.length > 0){
        let total = 0

        reviews.forEach((review)=>{
            total += Number(review.rating)
        })

        const average = (total / reviews.length).toFixed(1);
        setPropertyRating(average);
    }
    else{
        setPropertyRating('N/A');
    }
  }, [reviews])

  useEffect(() => {
        const fetchCoordinates = async () => {
            if (!properties.address) return;

            try {
                const encodedAddress = encodeURIComponent(properties.address);
                
                const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}`);
                const data = await response.json();

                if (data && data.length > 0) {

                    setCoordinates({
                        lat: parseFloat(data[0].lat),
                        lng: parseFloat(data[0].lon)
                    });
                } else {
                    console.log("coordinate not found");
                }
            } catch (error) {
                console.error("error finding coordinate:", error);
            }
        };

        fetchCoordinates();
    }, [properties.address]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await getPropertyById(propertyId);
                setProperties(response.property);
                setRentals(response.rentals)
                setSlidePhotos(response.images)
                setReviews(response.reviews)
                setAmenities(response.amenities)
            } catch (error) {
                console.error("Failed to fetch properties");
            }
        };

        fetchData();
    }, [propertyId]);

    const roomTypes = [
        { type: "Studio", price: "$650", feat: "Perfect for single student" },
        { type: "Large 1 Bedroom", price: "$750", feat: "Spacious with extra storage" }
    ];

    const [currentIndex, setCurrentIndex] = useState(0)

    const prevSlide = () => {
        const isFirstSlide = currentIndex === 0
        const newIndex = isFirstSlide ? slidePhotos.length - 1 : currentIndex - 1;
        setCurrentIndex(newIndex);
    }; 

    const nextSlide = () => {
        const isLastSlide = currentIndex === slidePhotos.length - 1
        const newIndex = isLastSlide ? 0 : currentIndex + 1;
        setCurrentIndex(newIndex);
    }

    const goToSlides =(slideIndex) => {
        setCurrentIndex(slideIndex)
    }



    return (
        <div className='grid grid-cols-1 xl:grid-rows-[auto_1fr] xl:grid-cols-[1.5fr_1fr] gap-8 p-10 xl:p-20'>
            {/* image section */}
            <div className='max-w-[1000px] h-[600px] w-full mx-auto px-4 flex flex-col'>
                {slidePhotos.length > 0 ? (
                    <div 
                        onClick={toggleModal} 
                        style={{ backgroundImage: `url(${slidePhotos[currentIndex].imageUrl})` }} 
                        className='w-full h-full rounded-2xl bg-center bg-cover duration-300 cursor-pointer'
                    ></div>
                ) : (
                    <div className="w-full h-full rounded-2xl bg-gray-200 flex items-center justify-center text-gray-500 font-bold">
                        Loading images...
                    </div>
                )}

                <div className='flex justify-center items-center py-4 gap-8'>
                    <CiCircleChevLeft
                        onClick={prevSlide}
                        size={50}
                        className='cursor-pointer text-black hover:text-gray-500 transition-colors'/>
                    <CiCircleChevRight
                        onClick={nextSlide}
                        size={50}
                        className='cursor-pointer text-black hover:text-gray-500 transition-colors'/>
                </div>

                {modalStatus && (
                <ImageModal toggleModal={toggleModal} photos={slidePhotos}/>
                 )}

            </div>


            {/* info section */}
            <div className='min-h-[400px] xl:row-span-2 xl:sticky xl:top-8 self-start'>
                <div className='flex flex-col bg-white h-full rounded-2xl shadow-xl p-8'>
                    <div className='flex flex-col md:flex-row justify-between items-center pb-5'>
                        <h1 className='text-4xl pb-5 md:pb-0 font-extrabold leading-none text-gray-900'>
                            {properties.name}
                        </h1>
                        <p className='flex items-center text-lg leading-none'>
                            {propertyRating !== 'N/A' ? (
                                <>
                                    {"⭐".repeat(Math.round(propertyRating))}
                                    <span className='ml-1 font-bold'>{propertyRating}</span>
                                </>
                            ) : (
                                <span className='text-gray-400 text-sm'>No reviews yet</span>
                            )}
                        </p>
                    </div>

                    <p className='pb-10'>
                        {rentals.length > 0 ? (
                            <>
                                From <span className='text-3xl font-bold'>${rentals[0].cost}</span>/month
                            </>
                        ) : (
                            <span className='text-3xl font-bold text-gray-400'>Loading price...</span>
                        )}
                    </p>

                    <div className='flex pb-1'>
                        <img className='h-5' src={addressIcon} alt="" />
                        <p>{properties.address}</p>
                    </div>
                    <p className='pb-1 text-blue-600 font-bold'>
                        {properties.distanceFromMTU} min walk to campus
                    </p>

                    {/* line */}
                    <div className='flex justify-center pb-7'>
                        <hr className='border-1 w-full rounded-3xl border-gray-400' />
                    </div>

                    <div className='grid grid-cols-3 text-center pb-8 gap-3'>
                        {/* {features.map((feature, i)=>(
                            <div key={i} className='flex items-center justify-center gap-2 leading-none'>
                                <span className='text-xl'>{feature.icon}</span>
                                <span className='text-sm'>{feature.name}</span>
                            </div>
                        ))} */}
                        {amenities && amenities.map((amenity, i)=>(
                            <div key={i} className='flex items-center justify-center gap-2 leading-none'>
                                <span className='text-xl'>{amenityIcon[amenity.amenityName] || DefaultIcon}</span>
                                <span className='text-sm'>{amenity.amenityName}</span>
                            </div>
                        ))}
                    </div>

                    <div className='space-y-4 pb-10'>
                        {rentals.map((rental, i) => (
                            <div key={i} className='border border-gray-200 rounded-xl p-5 bg-white shadow-sm'>
                                <div className='flex justify-between items-center'>
                                        <p className='font-bold text-lg'>Bedroom: {rental.bedroomCt}</p>
                                        <p className='font-bold text-yellow-500'>$ {rental.cost}<span className='text-gray-500 font-normal'>/mo</span></p>
                                </div>
                                <p className='font-bold text-lg'>In room bathroom: {rental.bathroomCt}</p>
                                <p className='text-sm text-gray-500 mt-1'>{rental.description }</p>
                            </div>
                        ))}
                    </div>

                    <div className='flex justify-center pb-7'>
                        <hr className='border-1 w-full rounded-3xl border-gray-400' />
                    </div>

                    <div className='pb-7'>
                        <p>
                            {properties.description}
                        </p>
                    </div>

                    <div className='pb-10'>
                        {coordinates.lat && coordinates.lng ? (
                            <MapComponents lat={coordinates.lat} lng={coordinates.lng} />
                        ) : (
                            <div className="h-[400px] w-full flex items-center justify-center bg-gray-100 rounded-2xl text-gray-500 font-bold">
                                Loading Map...
                            </div>
                        )}
                    </div>

                    <Link to={'/addreview/1'}>            
                        <div className='flex justify-center bg-yellow-400 px-5 py-3 w-full rounded-2xl hover:bg-yellow-300'>
                            <button className='cursor-pointer font-extrabold'>Lived here before? Share your experience to help future Huskies!</button>
                        </div>  
                    </Link>
                </div>
            </div>


            <div className='h-full p-5 flex flex-col'>
                <div className='pb-5'>
                    <p className='text-2xl font-bold'>Reviews From Huskies</p>
                </div>

                <div className='grid grid-cols-1 2xl:grid-cols-[1fr_1fr] gap-5'>
                    {reviews.length > 0 ? (
                        reviews.map((review, i) => (
                        <div key={i} className='border-2 shadow-xl p-3 rounded-2xl h-fit'>
                            <div className='flex flex-col md:flex-row items-center text-center md:text-left'>
                                <div>
                                    <img src={pfp} className='rounded-full border-3 border-amber-400 h-10 w-10 xl:h-15 xl:w-15 shrink-0 object-cover' alt="" />
                                </div>
                                <div className='mt-3 md:mt-0 md:pl-5'>
                                    <p>{review.name}</p>
                                    <p className='tracking-tighter'>{review.startDate}  ~  {review.endDate}</p>
                                </div>
                                <div className='mt-2 text-center md:mt-0 md:pl-5 md:ml-auto'>
                                    {/* <p>⭐⭐⭐⭐⭐{review.rating}</p> */}
                                    {"⭐".repeat(review.rating)}
                                    <span className="ml-1 font-bold">{review.rating}</span>
                                </div>
                            </div>
                            <p className='mt-4 text-gray-700'>{review.review}</p>
                        </div>
                    ))
                    ) : (
                    <div className="col-span-full w-full h-full rounded-2xl flex items-center justify-center text-xl text-gray-500 font-bold">
                        There is no review on this property yet :(
                    </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default PropertyInfo