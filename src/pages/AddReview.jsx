import React, { useParams } from 'react';
import StarRating from '../components/StarRating';
import DatePicker from '../components/DatePicker';
import ReviewTextBox from '../components/AddReview';

const AddReview = () => {
  const { propertyId, rentalId } = useParams();

  console.log("PropertyId: "+propertyId);
  console.log("RentalId: "+rentalId);

  return (
    <Fragment>
      <div className='flex text-center justify-center'>
      <div>
        <div className='max-w-2xl mx-auto pt-20 px-4'>
          <div>
              <div className='flex flex-col sm:flex-row items-center text-center sm:text-left'>
                  <img src='https://res.cloudinary.com/dxhogizsr/image/upload/v1773440484/herm-iceland-4524112_1920_liwlzf.jpg'
                  className='w-40 object-cover rounded-2xl'
                  />
                  <p className='pl-0 sm:pl-5 pt-4 sm:pt-0 text-2xl font-bold'>
                    Husky Heights
                    </p>
              </div>
          </div>  

          <p>Testing</p>
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