import React from 'react'
import { Routes, Route, useLocation} from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import About from './pages/About'
import Properties from './pages/Properties'
import PropertyInfo from './pages/PropertyInfo'
import Navbar from './components/Navbar'
import AddProperties from './pages/AddProperties'
import StudentSignup from './pages/StudentSignup'
import LandlordSignup from './pages/LandlordSignup'

const App = () => {
  const location = useLocation();
  const navActive = (path) => location.pathname === path
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
        <Route path='/property/id' element={<PropertyInfo/>}/>
        <Route path='/add' element={<AddProperties/>}/>
      </Routes>
    </div>
  )
}

export default App