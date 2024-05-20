import React, { useEffect } from "react";

import HomePage from '../pages/HomePage';
import AboutPage from '../pages/AboutPage';
import DashboardPage from '../pages/DashboardPage';
import ContactPage from '../pages/ContactPage';
import CommunitiesPage from '../pages/CommunitiesPage';
import MapPage from '../pages/MapPage';
import PrivacyPolicyPage from '../pages/PrivacyPolicyPage';
import TermsOfServicePage from '../pages/TermsOfServicePage';


import { AuthData } from '../../auth/AuthWrapper'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AccountSettingsPage from "../pages/AccountSettingsPage";
import AccountSetupPage from "../pages/AccountSetupPage";

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
        <Route path="/" element={<HomePage />} />
        <Route path="/communities" element={<CommunitiesPage />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="/tos" element={<TermsOfServicePage />} />
        <Route path="/contact" element={<ContactPage />} />
        { authenticated && <Route path="/dashboard" element={<DashboardPage />} /> }
        { authenticated && <Route path="/account-settings" element={<AccountSettingsPage />} /> }
        { authenticated && <Route path="/account-setup" element={<AccountSetupPage />} /> }
        {/* Catch all route for non-existent routes */}
        {/* <Route path="*" element={<Navigate to="/" replace />} /> */}
      </Routes>
    </Router>

  )
}

export default RouteRenderer;