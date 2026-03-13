import React from 'react'
import { Routes, Route, useLocation} from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import About from './pages/About'
import Properties from './pages/Properties'
import PropertiesInfo from './pages/PropertiesInfo'
import Navbar from './components/Navbar'
import AddProperties from './pages/AddProperties'

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
        <Route path='/about' element={<About/>}/>
        <Route path='/properties' element={<Properties/>}/>
        <Route path='/properties/id' element={<PropertiesInfo/>}/>
        <Route path='/add' element={<AddProperties/>}/>
      </Routes>
    </div>
  )
}

export default App