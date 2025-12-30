import React, { useContext, useState } from 'react'
import {Routes, Route} from 'react-router-dom'
import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import { LoginContext } from "../context/LoginProvider";

const IndexRoutes = () => {
    const { isLoggedIn } = useContext(LoginContext);
    
  return (
    <Routes>
        <Route path='/' element= {isLoggedIn ? <Home /> : <Login/>}/>
        <Route path='/register' element= {<Register/>}/>
    </Routes>
  )
}

export default IndexRoutes
