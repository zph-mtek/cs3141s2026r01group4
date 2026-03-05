import React from 'react'
import { Routes, Route} from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import About from './pages/About'
import Properties from './pages/Properties'
import PropertiesInfo from './pages/PropertiesInfo'
import Navbar from './components/Navbar'

const App = () => {
  return (
    <div>
      <Navbar/>
      {/* CREATE NAVIGIBLE PAGE PATHS HERE */}
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/login' element={<Login/>}/>
        <Route path='/signup' element={<Signup/>}/>
        <Route path='/about' element={<About/>}/>
        <Route path='/properties' element={<Properties/>}/>
        <Route path='/properties/id' element={<PropertiesInfo/>}/>
      </Routes>
    </div>
  )
}

export default App