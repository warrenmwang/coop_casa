import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import HomePage from '../pages/HomePage';
import AboutPage from '../pages/AboutPage';
import DashboardPage from '../pages/DashboardPage';
import ContactPage from '../pages/ContactPage';
import CommunitiesPage from '../pages/CommunitiesPage';
import MapPage from '../pages/MapPage';
import PrivacyPolicyPage from '../pages/PrivacyPolicyPage';
import TermsOfServicePage from '../pages/TermsOfServicePage';


import { AuthData } from '../../auth/AuthWrapper'
import AccountSettingsPage from "../pages/AccountSettingsPage";
import AccountSetupPage from "../pages/AccountSetupPage";
import PropertiesPage from "../pages/PropertiesPage";
import TextSkeleton from "./TextSkeleton";
import AttributionsPage from "../pages/AttributionsPage";

const RouteRenderer : React.FC = () => {

  const auth = AuthData();
  const { loggedInInitial, authenticated, login, setLoggedInInitial } = auth;
  

  useEffect(() => {
    if (!loggedInInitial) {
      const handleLogin = async () => {
        try {
          await login();
        } catch (error) {
          console.error("Error during login: ", error)
          alert("Login failed. Please try again.")
        } finally {
          setLoggedInInitial(true)
        }
      }
      handleLogin()
    }
  }, []) // call once at component mount / first render

  return(
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/communities" element={<CommunitiesPage />} />
        <Route path="/properties" element={<PropertiesPage />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="/tos" element={<TermsOfServicePage />} />
        <Route path="/attributions" element={<AttributionsPage />} />
        <Route path="/contact" element={<ContactPage />} />
        { authenticated ? (
          <>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/account-settings" element={<AccountSettingsPage />} />
            <Route path="/account-setup" element={<AccountSetupPage />} />
          </>
        ) : (
          <>
            <Route path="/dashboard" element={<Navigate to="/" replace />} />
            <Route path="/account-settings" element={<Navigate to="/" replace />} />
            <Route path="/account-setup" element={<Navigate to="/" replace />} />
          </>
        )}
        {/* Catch all route for non-existent routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default RouteRenderer;