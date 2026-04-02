  import React,{ Fragment, useEffect, useState } from 'react';
  import StarRating from '../components/StarRating';
  import DatePicker from '../components/DatePicker';
  import ReviewTextBox from '../components/ReviewTextBox';
  import { useParams } from 'react-router-dom';
  import { Database } from '../Architect/Architect';
  import StatusMessageBox from '../components/StatusMessage';
import { comment } from 'postcss';

import { jwtDecode } from "jwt-decode";

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
const onAddReviewPress = (user,propertyId, rentalId,reviewStars,commentText) => {
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
  const [ statusMsg, setStatusMessage ] = useState(<Fragment></Fragment>);
  let isLoading = 0; // comment upload debounce
  
  //-- Grabbed this from NavBar.jsx
  const [user,setUser] = useState(null);
  
  //-- Ask if we are logged in
  useEffect(() => {
      const token = localStorage.getItem('token');
      if (token) {
          try {
              const decoded = jwtDecode(token);
              setUser(decoded.data);
          } catch (error) {
              console.error("Invalid token", error);
              localStorage.removeItem('token');
          }
      }
  }, []);

  //-- Get the property Information
  useEffect(() => {
    if (user && user.role != "Landlord"){ // only fetch data if we logged in
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
    }
  }, [user]); // run once we set the user property

  return (
    <Fragment>
      {/* Only display page contents if this user is logged in */}
      {user && user!='Landlord' ?
        (
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

                {statusMsg ? statusMsg : null}

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

                    // Don't allow comments to double submit while one comment is already uploading to server...
                    if (isLoading != 0) { 
                      setStatusMessage(<StatusMessageBox messageType='warning' text='Feedback upload in progress...' />);  
                      return;
                    }

                    // Ensure we have info needed to make a comment
                    if (rentalPick && commentText && starRating &&
                      rentalPick.value != "" && commentText.value != "" && starRating != ""
                    ){
                      isLoading = 1;
                      console.log("Star Rating:"+starRating.value);

                      //-- Add a comment with the text element
                      console.log(user.userId);
                      
                      if (onAddReviewPress(
                        user.userId,
                        propertyInfo.propertyId,
                        parseInt(rentalPick.value),
                        parseInt(starRating.value),
                        commentText.value) == -1){
                          setStatusMessage(<StatusMessageBox messageType='fail' text='Comment operation failed...' />);
                          isLoading = 0;
                        } else {
                          setStatusMessage(<StatusMessageBox messageType='success' text='Comment uploaded successfully...'/>)
                          isLoading = 0;
                        }
                    } else { // for some reason, we could not get all of the fields and their values...
                      setStatusMessage(<StatusMessageBox messageType='warning' text='Please fill out all of the text fields' />);
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
      ) : (
        <Fragment>
          <p>You do not meet the access requirements needed to view this page!</p>
        </Fragment>
      )}
    </Fragment>
  )
}

export default AddReview