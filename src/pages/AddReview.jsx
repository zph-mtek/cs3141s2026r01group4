  import React,{ Fragment, useEffect, useState } from 'react';
  import StarRating from '../components/StarRating';
  import DatePicker from '../components/DatePicker';
  import ReviewTextBox from '../components/ReviewTextBox';
  import { useParams } from 'react-router-dom';
  import { Database, performBanCheck } from '../Architect/Architect';
  import StatusMessageBox from '../components/StatusMessage';
import { comment } from 'postcss';
import { jwtDecode } from "jwt-decode";
import { TbBackground } from 'react-icons/tb';
import { useNavigate } from 'react-router-dom';

const onUtilityCheckClick = (passSet) => {
    const utilityCheckBox = document.getElementById('utilitiesCostCheck');

    if (utilityCheckBox.checked) {
        passSet(true);
    } else { passSet(false); }
}

const UtilitiesField = () => {
    const [ areUtilitiesIncluded, setUtilitiesIncluded ] = useState(false);

    return (
        <Fragment>
            <br/>
            <b>Were Utilities Included in Rental Cost?</b>
            <input type='checkbox' id='utilitiesCostCheck' name='utilitiesCostCheck' onClick={() => {
                onUtilityCheckClick(setUtilitiesIncluded);
            }} /><br/>

            { areUtilitiesIncluded === true ? 
                (
                    <Fragment>
                        <input type='text' id='utilitiesCost' name='utilitiesCost' className='bg-gray-100' placeholder='Enter dollar amount....' />
                    </Fragment>
                )
            : null }
            
        </Fragment>
    );
}

const RentalIdPicker = ({ propertyId, options }) => {

    return (
        <Fragment>
            <p>

              <b>Rental:</b>
              <select name="rentalOptionListProperty" id="rentalSelect" className='bg-gray-100'>
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

const CustomClubTagField = ({toggle}) => {
  
  useEffect(()=>{
    if (toggle == 0) { // toggle is off now
      const customClubField = document.getElementById('customClubName');
      if (customClubField) {
        customClubField.value = ""; // reset its value if we toggle the option off
      }
    }
  },[toggle]);

  return (
    <Fragment>
      {toggle == 0 ? null  : ( // will only show if toggle is on
        <Fragment>
          <p><b>Add a tag for this community?</b></p>
          <input type='text' id='customClubName' name='customClubName' value='' className='bg-gray-100' />
        </Fragment>
      )}
    </Fragment>
  )
  const [ customClub, setCustomClubValue ] = useState("");

}

const ClubIdPicker = () => {

  const [ clubList, setClubList ] = useState([]);
  const [ isCreatingCustom, toggleCustomClub ] = useState(0);

    useEffect(()=>{
      const fetchClubs = async() => {
        const clubData = await Database('https://huskyrentlens.cs.mtu.edu/club.php',{
            clubId: "-1"
          });

          if (clubData != null) {
            console.log("Clubs...");
            console.log(clubData.data.data);
            setClubList(clubData.data.data);
          }
      }

      fetchClubs();
    },[]);

    return (
        <Fragment>
            { clubList && clubList.length > 0 ? (<Fragment>
              <p>

              <b>Associate with Community? :</b>
              <select name="clubOptionList" id="clubSelect" className='bg-gray-100'
                  onChange={(e)=>{ // handle a custom community tag being created...
                          if (e.target.value === 'custom'){
                            toggleCustomClub(1); // make custom club field appear
                          } else {
                            toggleCustomClub(0); // make custom club field disappear
                          }
                      }}>
                  <option value="">--Please choose an option--</option>
                  <option value="custom">Can't Find Your Community?</option>
                  {
                      clubList.map((club) => {

                        return  (
                            <Fragment>
                              <option value={club.cId}>
                                  {club.clubName} ( {
                                    club.communityType === 'S' ? "Sorority" : 
                                      (club.communityType==='F' ? "Fraternity" : "Club") } )
                              </option>
                            </Fragment>
                          )
                      })
                  }
              </select>
            </p>
            <p><CustomClubTagField toggle={isCreatingCustom} /></p>
            
            </Fragment>) : <p>Loading communities...</p>}
        </Fragment>
    )
}

//-- When press submit button
const onAddReviewPress = (user,propertyId, rentalId,reviewStars,commentText,utilitiesCost,clubPickId) => {
  console.log(propertyId, rentalId, commentText, utilitiesCost);

  if (
      propertyId === null || rentalId === null || commentText === null
    || propertyId < 0 || rentalId < 0 || commentText === "" || clubPickId === null) {
      return -1;
  }

  const addFeedback = async () => {
        const feedbackData = await Database('https://huskyrentlens.cs.mtu.edu/feedback.php',{
          propertyId: propertyId,
          rentalId: rentalId,
          commentDesc: commentText,
          userId: 24,
          stars: reviewStars,
          rentalUtilityCost: utilitiesCost || 0,
          assocClubId: clubPickId
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
  document.title = 'Write a Review | HuskyRentLens';
  const navigate = useNavigate();

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
    if (user && user.role != "Landlord" && user.role != "Banned"){ // only fetch data if we logged in

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
    { user && performBanCheck() == true ? (
        <Fragment>
            <p>You are banned!</p>
        </Fragment>
      ) :
        (
            <Fragment>
              {/* Only display page contents if this user is logged in */}
              {user && user.role === 'MTU_student' ?
                (
                  <Fragment>
                    <div className='flex text-center justify-center'>
                <div>
                  <div className='max-w-2xl mx-auto pt-8 md:pt-16 px-4'>
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
                          /><br/>
                        <ClubIdPicker /><br/>
                        <UtilitiesField />

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
                            const isUtilitesCostExtra = document.getElementById("utilitiesCostCheck");
                            const utilitiesCost = document.getElementById("utilitiesCost");
                            const clubPick = document.getElementById("clubSelect");

                            // Don't allow comments to double submit while one comment is already uploading to server...
                            if (isLoading != 0) { 
                              setStatusMessage(<StatusMessageBox messageType='warning' text='Feedback upload in progress...' />);  
                              return;
                            }

                            //-- Null CheckingEnsure we have info needed to make a comment
                            if (rentalPick && commentText && starRating &&
                              rentalPick.value != "" && commentText.value != "" && starRating != ""
                              && (!isUtilitesCostExtra.checked
                                    || isUtilitesCostExtra.checked && utilitiesCost && utilitiesCost.value != ""
                                  || clubPick)
                            ){
                              isLoading = 1;
                              
                            
                              const utilitiesCostValue = isUtilitesCostExtra.checked ? parseInt(utilitiesCost.value) : null;
                              let clubPickValue = clubPick.value;
                              console.log("Picked club:"+clubPick.value);
                              if (clubPick.value == "") {
                                clubPickValue = 0;
                              }
                              
                              if (
                                  onAddReviewPress(
                                    user.userId,
                                    propertyInfo.propertyId,
                                    parseInt(rentalPick.value),
                                    parseInt(starRating.value),
                                    commentText.value,
                                    utilitiesCostValue,
                                    clubPickValue
                                  ) == -1
                              ){
                                  setStatusMessage(<StatusMessageBox messageType='fail' text='Comment operation failed...' />);
                                  isLoading = 0;
                              } else {
                                  setStatusMessage(<StatusMessageBox messageType='success' text='Comment uploaded successfully...'/>);
                                  isLoading = 0; // debounce
                                  
                                  //-- redirect after 2 seconds
                                  const timer = setTimeout(() => {
                                    navigate(`/properties/${propertyId}`);
                                  }, 2000);
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
    </Fragment>
  )
  
}

export default AddReview