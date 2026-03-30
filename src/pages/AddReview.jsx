import React,{ Fragment, useEffect, useState } from 'react';
import StarRating from '../components/StarRating';
import DatePicker from '../components/DatePicker';
import ReviewTextBox from '../components/ReviewTextBox';
import { useParams } from 'react-router-dom';
import { Database } from '../Architect/Architect';

const AddReview = () => {
  const { propertyId, rentalId } = useParams();
  const [ propertyInfo, setPropertyInfo ] = useState({});

  useEffect(() => {
    const fetchPropertyInfo = async () => {
      const propertyData = await Database('https://huskyrentlens.cs.mtu.edu/connect.php',{
        propertyId: propertyId,
      });

      if (propertyData != null){
        console.log(propertyData.data.data[0]);
        setPropertyInfo(propertyData.data.data[0]);
      }
    };

    fetchPropertyInfo();
  }, []);

  console.log("PropertyId: "+propertyId);

  return (
    <Fragment>
      <div className='flex text-center justify-center'>
      <div>
        <div className='max-w-2xl mx-auto pt-20 px-4'>
          <div>
              <div className='flex flex-col sm:flex-row items-center text-center sm:text-left'>
                  <img src={propertyInfo.images != null ? propertyInfo.images.split(",")[0] : null}
                  className='w-40 object-cover rounded-2xl'
                  />
                  <p className='pl-0 sm:pl-5 pt-4 sm:pt-0 text-2xl font-bold'>
                    {propertyInfo.name}
                    </p>
              </div>
          </div> 

          <StarRating />
          <DatePicker />
          <ReviewTextBox />
        </div>
      </div>
    </div>
    </Fragment>
  )
}

export default AddReview