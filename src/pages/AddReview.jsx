  import React,{ Fragment, useEffect, useState } from 'react';
  import StarRating from '../components/StarRating';
  import DatePicker from '../components/DatePicker';
  import ReviewTextBox from '../components/ReviewTextBox';
  import { useParams } from 'react-router-dom';
  import { Database } from '../Architect/Architect';
import { comment } from 'postcss';

  const RentalIdPicker = ({ propertyId, options }) => {

      return (
          <Fragment>
              <p>
                <select name="pets" id="rentalSelect">
                    <option value="">--Please choose an option--</option>
                    {
                        options.map((rentalInfo) => {

                          return  (
                              <Fragment>
                                <option value={rentalInfo.rentalId}>
                                    {rentalInfo.bathroomCt} bed,
                                    {rentalInfo.bedroomCt} bath</option>
                              </Fragment>
                            )
                        })
                    }
                </select>
              </p>
          </Fragment>
      )
  }

  //-- When press submit button
  const onAddReviewPress = (propertyId, rentalId,reviewStars,commentText) => {
    console.log(propertyId, rentalId, commentText);

    if (
        propertyId === null || rentalId === null || commentText === null
      || propertyId < 0 || rentalId < 0 || commentText === "") {
        return -1;
    }

    console.log("Get past this...");

    const addFeedback = async () => {
          const feedbackData = await Database('https://huskyrentlens.cs.mtu.edu/feedback.php',{
            propertyId: propertyId,
            rentalId: rentalId,
            commentDesc: commentText,
            userId: 24,
            stars: reviewStars
          });

          if (feedbackData != null) {
            console.log(feedbackData);
          }
        }

    addFeedback();

    return 0; // success
  }

  //-- Adding the review to the codebase
  const AddReview = () => {
    const { propertyId } = useParams();
    const [ propertyInfo, setPropertyInfo ] = useState({});
    const [ rentalId, setRentalId ] = useState(0);
    const [ rentalsForThisProperty, setPropertyRentalInfo ] = useState([]);
  
    useEffect(()=>{
      console.log("Updated=>");
      console.log(rentalsForThisProperty);
    },[rentalsForThisProperty]);

    console.log("PropertyId: "+propertyId);

    //-- Get the property Information
    useEffect(() => {
      const fetchPropertyInfo = async () => {
        const propertyData = await Database('https://huskyrentlens.cs.mtu.edu/connect.php',{
          propertyId: propertyId,
        });

        if (propertyData != null){
          console.log(propertyData.data.data[0]);
          setPropertyInfo(propertyData.data.data[0]);

          const rentalsData = await Database('https://huskyrentlens.cs.mtu.edu/connect.php',{
            propertyId: propertyId,
            allRentals: "yes"
            });

          // Rentals data
          if (rentalsData) {
            console.log(rentalsData.data.data);
            setPropertyRentalInfo(rentalsData.data.data);
          }
        }
      };

      fetchPropertyInfo();
    }, []);

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

            { rentalsForThisProperty.length > 0 ? (
              <Fragment>

                <br/><br/>
                <RentalIdPicker
                  propertyId={propertyInfo.propertyId}
                  options={rentalsForThisProperty}
                    />

                <StarRating />
                <DatePicker />
                <ReviewTextBox />

                <button
                  className='w-full text-lg font-bold bg-yellow-400 mt-3 h-12 rounded-2xl cursor-pointer hover:bg-yellow-400/70 transition-colors mb-20'
                  onClick={() => {
                    // Make sure these elements exist first
                    const rentalPick = document.getElementById("rentalSelect");
                    const commentText = document.getElementById("reviewText");
                    const starRating = document.getElementById("reviewStars");

                    if (rentalPick && commentText && starRating &&
                      rentalPick.value != "" && commentText.value != "" && starRating != ""
                    ){
                      console.log("Star Rating:"+starRating.value);

                      //-- Add a comment with the text element
                      onAddReviewPress(
                        propertyInfo.propertyId,
                        parseInt(rentalPick.value),
                        parseInt(starRating.value),
                        commentText.value);
                    }
                  }}>
                    Post Review
                </button>
              </Fragment>
              ) : "Loading rentals...." }
            
          </div>
        </div>
      </div>
      </Fragment>
    )
  }

  export default AddReview