import React, { useState } from 'react'
import {Routes, Route} from 'react-router-dom'
import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';

const IndexRoutes = () => {
  const [isLoggin, setIsLoggin] = useState(true)
  return (
    <Routes>
        <Route path='/' element= {isLoggin ? <Home /> : <Login/>}/>
        <Route path='/register' element= {<Register/>}/>
    </Routes>
  )
}

export default IndexRoutes
