import React, { useEffect } from "react";

import Home from '../pages/Home';
import About from '../pages/About';
import Dashboard from '../pages/Dashboard';
import Contact from '../pages/Contact';
import Communities from '../pages/Communities';
import Map from '../pages/Map';
import PrivacyPolicy from '../pages/PrivacyPolicy';
import TermsOfService from '../pages/TermsOfService';


import { AuthData } from '../../auth/AuthWrapper'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AccountSettings from "../pages/AccountSettings";

const RouteRenderer : React.FC = () => {

  const auth = AuthData();
  const { authenticated, login } = auth;

  useEffect(() => {
    const handleLogin = async () => {
      await login();
    }
    handleLogin()
  }, []) // empty array dependency to tell useEffect hook to call login only at first render.

  return(
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/communities" element={<Communities />} />
        <Route path="/map" element={<Map />} />
        <Route path="/about" element={<About />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/tos" element={<TermsOfService />} />
        <Route path="/contact" element={<Contact />} />
        { authenticated && <Route path="/dashboard" element={<Dashboard />} /> }
        { authenticated && <Route path="/account-settings" element={<AccountSettings />} /> }
      </Routes>
    </Router>

  )
}

export default RouteRenderer;