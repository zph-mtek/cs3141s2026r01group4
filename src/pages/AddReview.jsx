import React, { Fragment, useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";
import { HiOutlineArrowLeft, HiOutlineLightBulb, HiOutlineHome } from "react-icons/hi2";

import StarRating from '../components/StarRating';
import DatePicker from '../components/DatePicker';
import ReviewTextBox from '../components/ReviewTextBox';
import { Database, performBanCheck } from '../Architect/Architect';
import StatusMessageBox from '../components/StatusMessage';

const UtilitiesField = () => {
  const [areUtilitiesIncluded, setUtilitiesIncluded] = useState(false);

  return (
    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 mb-6">
      <div className="flex items-center gap-3">
        <input
          type='checkbox'
          id='utilitiesCostCheck'
          className="w-5 h-5 accent-yellow-500 rounded cursor-pointer"
          onClick={(e) => setUtilitiesIncluded(e.target.checked)}
        />
        <label htmlFor="utilitiesCostCheck" className="font-bold text-gray-700 cursor-pointer">
          Were Utilities Included in Rental Cost?
        </label>
      </div>

      {areUtilitiesIncluded && (
        <div className="mt-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">$</span>
            <input
              type='number'
              id='utilitiesCost'
              className='w-full pl-8 pr-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:border-yellow-400 focus:outline-none transition-all'
              placeholder='Enter dollar amount....'
            />
          </div>
        </div>
      )}
    </div>
  );
}

const RentalIdPicker = ({ options }) => (
  <div className="flex flex-col gap-2 mb-6 text-left">
    <label className="font-bold text-gray-700 flex items-center gap-2">
      <HiOutlineHome className="text-yellow-600" /> Select Rental Unit
    </label>
    <select id="rentalSelect" className='w-full p-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-yellow-400 outline-none transition-all font-medium text-gray-700'>
      <option value="">-- Choose Unit Type --</option>
      {options.map((rental) => (
        <option key={rental.rentalId} value={rental.rentalId}>
          {rental.bedroomCt} Bed, {rental.bathroomCt} Bath
        </option>
      ))}
    </select>
  </div>
);

const ClubIdPicker = () => {
  const [clubList, setClubList] = useState([]);
  const [isCreatingCustom, toggleCustomClub] = useState(false);

  useEffect(() => {
    const fetchClubs = async () => {
      const clubData = await Database('https://huskyrentlens.cs.mtu.edu/club.php', { clubId: "-1" });
      if (clubData?.data?.data) setClubList(clubData.data.data);
    };
    fetchClubs();
  }, []);

  return (
    <div className="flex flex-col gap-2 mb-6 text-left">
      <label className="font-bold text-gray-700">Associate with Community? (Optional)</label>
      <select
        id="clubSelect"
        className='w-full p-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-yellow-400 outline-none transition-all font-medium text-gray-700'
        onChange={(e) => toggleCustomClub(e.target.value === 'custom')}
      >
        <option value="">-- Choose Community --</option>
        <option value="custom">Can't Find Your Community?</option>
        {clubList.map((club) => (
          <option key={club.cId} value={club.cId}>
            {club.clubName} ({club.communityType === 'S' ? "Sorority" : (club.communityType === 'F' ? "Fraternity" : "Club")})
          </option>
        ))}
      </select>
      {isCreatingCustom && (
        <input
          type='text'
          id='customClubName'
          placeholder="Enter Community Name..."
          className='mt-2 p-3 bg-white border-2 border-yellow-200 rounded-xl focus:border-yellow-400 outline-none animate-in zoom-in-95 duration-200'
        />
      )}
    </div>
  );
}

const AddReview = () => {
  document.title = 'Write a Review | HuskyRentLens';
  const navigate = useNavigate();
  const { propertyId } = useParams();
  const [propertyInfo, setPropertyInfo] = useState({});
  const [rentalsForThisProperty, setPropertyRentalInfo] = useState([]);
  const [statusMsg, setStatusMessage] = useState(null);
  const [user, setUser] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser(decoded.data);
      } catch (error) {
        localStorage.removeItem('token');
      }
    }
  }, []);

  useEffect(() => {
    if (user && (user.role === "MTU_student" || user.role === "admin")) {
      const fetchInfo = async () => {
        const propertyData = await Database('https://huskyrentlens.cs.mtu.edu/connect.php', { propertyId });
        if (propertyData?.data?.data) {
          setPropertyInfo(propertyData.data.data[0]);
          const rentalsData = await Database('https://huskyrentlens.cs.mtu.edu/connect.php', { propertyId, allRentals: "yes" });
          if (rentalsData) setPropertyRentalInfo(rentalsData.data.data);
        }
      };
      fetchInfo();
    }
  }, [user, propertyId]);

  const handlePostReview = async () => {
    const rentalPick = document.getElementById("rentalSelect");
    const commentText = document.getElementById("reviewText");
    const starRating = document.getElementById("reviewStars");
    const isUtilitesChecked = document.getElementById("utilitiesCostCheck");
    const utilitiesCost = document.getElementById("utilitiesCost");
    const clubPick = document.getElementById("clubSelect");
    const customClubField = document.getElementById("customClubName");

    if (!rentalPick?.value || !commentText?.value || !starRating?.value) {
      setStatusMessage(<StatusMessageBox messageType='warning' text='Please fill out all required fields' />);
      return;
    }

    setIsSubmitting(true);
    let clubValue = clubPick.value === "custom" ? customClubField?.value : clubPick.value;

    const reqData = {
      propertyId: parseInt(propertyId),
      rentalId: parseInt(rentalPick.value),
      commentDesc: commentText.value,
      userId: user.id,
      stars: parseInt(starRating.value),
      rentalUtilityCost: isUtilitesChecked.checked ? (parseInt(utilitiesCost?.value) || 0) : 0,
      assocClubId: clubValue || 0
    };

    const feedbackData = await Database('https://huskyrentlens.cs.mtu.edu/feedback.php', reqData);

    if (feedbackData) {
      setStatusMessage(<StatusMessageBox messageType='success' text='Comment uploaded successfully!' />);
      setTimeout(() => navigate(`/properties/${propertyId}`), 2000);
    } else {
      setStatusMessage(<StatusMessageBox messageType='fail' text='Failed to upload review.' />);
      setIsSubmitting(false);
    }
  };

  if (user && performBanCheck()) return <div className="text-center p-20 font-bold text-red-500 text-2xl">You are banned!</div>;

  return (
    <div className='min-h-screen bg-white pb-20'>
      {user && (user.role === 'MTU_student' || user.role === 'admin') ? (
        <div className='max-w-3xl mx-auto px-6 pt-10'>
          {/* Header / Back Button */}
          <div className='flex items-center gap-4 mb-8'>
            <Link to={`/properties/${propertyId}`} className='p-3 bg-gray-100 rounded-full hover:bg-yellow-400 transition-colors group'>
              <HiOutlineArrowLeft className='text-xl group-hover:scale-110 transition-transform' />
            </Link>
            <h1 className='text-2xl font-black text-gray-900 uppercase tracking-tight'>Write a Review</h1>
          </div>

          {/* Property Card */}
          <div className='bg-white border-2 border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row items-center gap-6 mb-10'>
            <div className='w-40 h-28 shrink-0 rounded-2xl overflow-hidden bg-gray-100 flex items-center justify-center'>
              {propertyInfo.images ? (
                <img
                  src={propertyInfo.images.split(",")[0].startsWith('http')
                    ? propertyInfo.images.split(",")[0]
                    : `https://huskyrentlens.cs.mtu.edu/backend/uploads/${propertyInfo.images.split(",")[0]}`}
                  className='w-full h-full object-cover'
                  alt="property"
                />
              ) : (
                <span className='text-gray-400 text-xs font-bold'>No Image</span>
              )}
            </div>
            <div className='text-center md:text-left'>
              <h2 className='text-2xl font-bold text-gray-900'>{propertyInfo.name}</h2>
              <p className='text-gray-500 font-medium'>{propertyInfo.address || 'Houghton, MI'}</p>
            </div>
          </div>

          {/* Form Section */}
          <div className='flex flex-col gap-2'>
            {rentalsForThisProperty.length > 0 ? (
              <div className='bg-white p-2 rounded-2xl'>
                <div className='grid md:grid-cols-2 gap-6'>
                  <RentalIdPicker options={rentalsForThisProperty} />
                  <ClubIdPicker />
                </div>
                <UtilitiesField />

                <div className='my-8 border-t-2 border-gray-50 pt-8'>
                  <p className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                    <HiOutlineLightBulb className="text-yellow-500" /> Share your experience
                  </p>
                  <StarRating />
                  <DatePicker />
                  <ReviewTextBox />
                </div>

                {statusMsg && <div className="mb-4">{statusMsg}</div>}

                <button
                  disabled={isSubmitting}
                  onClick={handlePostReview}
                  className={`w-full text-lg font-black uppercase tracking-widest h-14 rounded-2xl shadow-lg transition-all 
                                        ${isSubmitting ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-yellow-400 text-gray-900 hover:bg-yellow-500 hover:-translate-y-1 active:translate-y-0'}`}
                >
                  {isSubmitting ? 'Uploading...' : 'Post Review'}
                </button>
              </div>
            ) : (
              <div className='flex flex-col items-center py-20 text-gray-400'>
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-yellow-500 mb-4"></div>
                <p className='font-bold'>Loading property details...</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className='flex flex-col items-center justify-center min-h-[60vh] text-center px-10'>
          <div className="bg-red-50 p-10 rounded-3xl border-2 border-red-100">
            <p className="text-2xl font-black text-red-600 mb-4">ACCESS DENIED</p>
            <p className="text-gray-600 font-medium">You do not meet the access requirements needed to view this page!</p>
            <Link to="/" className="inline-block mt-6 px-8 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-all">Go Home</Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default AddReview;