import React from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'

//-- Components
import Navbar from './components/Navbar';
import StarRating from './components/StarRating';

//-- Pages
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import About from './pages/About'
import Properties from './pages/Properties'
import PropertyInfo from './pages/PropertyInfo'
import AddProperties from './pages/AddProperties'
import StudentSignup from './pages/StudentSignup'
import LandlordSignup from './pages/LandlordSignup'
import Profile from './pages/Profile'
import PrivacyPolicy from './pages/PrivacyPolicy'
import Guidelines from './pages/Guidelines'
import AddReview from './pages/AddReview.jsx';
import MapView from './pages/MapView.jsx';
import Manage from './pages/Manage.jsx';
import EditProperty from './pages/EditProperty.jsx';
import Admin from './pages/Admin.jsx';
import ManageUsers from './pages/ManageUsers.jsx';
import ManageProperties from './pages/ManageProperties.jsx';
import ManageReports from './pages/ManageReports.jsx';

const App = () => {
  const location = useLocation();
  const navActive = (path) => location.pathname === path;

  return (
    <div>
      {navActive('/login') ? '':<Navbar/>}
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/login' element={<Login/>}/>
        <Route path='/signup' element={<Signup/>}/>
        <Route path='/signup/studnet' element={<StudentSignup/>}/>
        <Route path='/signup/landlord' element={<LandlordSignup/>}/>
        <Route path='/about' element={<About/>}/>
        <Route path='/properties' element={<Properties/>}/>
        <Route path='/properties/:propertyId' element={<PropertyInfo/>}/>
        <Route path='/map' element={<MapView/>}/>
        <Route path='/manage' element={<Manage/>}/>
        <Route path='/manage/add' element={<AddProperties/>}/>
        <Route path='/manage/edit/:propertyId' element={<EditProperty/>}/>
        <Route path='/profile' element={<Profile/>}/>
        <Route path='/privacy-policy' element={<PrivacyPolicy/>}/>
        <Route path='/guidelines' element={<Guidelines/>}/>
        <Route path='/addreview/:propertyId' element={<AddReview/>}/> {/* Corresponds to rentalId and propertyId */}
        
        <Route path='/admin' element={<Admin/>}/>
        <Route path='/admin/manageuser' element={<ManageUsers/>}/>
        <Route path='/admin/manageproperties' element={<ManageProperties/>}/>
        <Route path='/admin/reports' element={<ManageReports/>}/>


      </Routes>
    </div>
  )
}

export default App