import React, { useEffect } from "react"
import { Routes, Route, Navigate } from 'react-router-dom'

import HomePage from '../pages/HomePage'
import AboutPage from '../pages/AboutPage'
import DashboardPage from '../pages/DashboardPage'
import ContactPage from '../pages/ContactPage'
import CommunitiesPage from '../pages/CommunitiesPage'
import MapPage from '../pages/MapPage'
import PrivacyPolicyPage from '../pages/PrivacyPolicyPage'
import TermsOfServicePage from '../pages/TermsOfServicePage'

import { AuthData } from '../../auth/AuthWrapper'
import AccountSettingsPage from "../pages/AccountSettingsPage"
import AccountSetupPage from "../pages/AccountSetupPage"
import PropertiesPage from "../pages/PropertiesPage"
import AttributionsPage from "../pages/AttributionsPage"
import { aboutPageLink, attributionsPageLink, communitiesPageLink, contactPageLink, homePageLink, mapPageLink, oauthCallBackPageLink, privacypolicyPageLink, propertiesPageLink, termsOfServicePageLink, dashboardPageLink, accountSettingsPageLink, accountSetupPageLink } from "../../urls"
import { apiAuthCheck } from "../../api/api"

const OAuthCallbackPage = React.lazy(() => import("../pages/OAuthCallbackPage"))

const RouteRenderer : React.FC = () => {
  const auth = AuthData()
  const { authenticated, setAuthenticated } = auth

  useEffect(() => {
    const handleAuthCheck = async () => {
      try {
        // Do a simple check auth to determine whether ok to render authed
        // endpoints
        // console.log("route renderer")
        const ok = await apiAuthCheck()
        if (ok && authenticated !== true) {
          setAuthenticated(true)
        } 
      } catch (error) {
        console.error("Error during login: ", error)
        alert("Login failed. Please try again.")
      } 
    }
    handleAuthCheck()
  }, [authenticated, setAuthenticated]) // call once at component mount / first render

  return(
    <Routes>
      <Route path={homePageLink} element={<HomePage />} />
      <Route path={communitiesPageLink} element={<CommunitiesPage />} />
      <Route path={propertiesPageLink} element={<PropertiesPage />} />
      <Route path={mapPageLink} element={<MapPage />} />
      <Route path={aboutPageLink} element={<AboutPage />} />
      <Route path={privacypolicyPageLink} element={<PrivacyPolicyPage />} />
      <Route path={termsOfServicePageLink} element={<TermsOfServicePage />} />
      <Route path={attributionsPageLink} element={<AttributionsPage />} />
      <Route path={contactPageLink} element={<ContactPage />} />
      <Route path={oauthCallBackPageLink} element={<OAuthCallbackPage setAuthenticated={setAuthenticated}/>} />
      { authenticated ? (
        <>
          <Route path={dashboardPageLink} element={<DashboardPage />} />
          <Route path={accountSettingsPageLink} element={<AccountSettingsPage />} />
          <Route path={accountSetupPageLink} element={<AccountSetupPage />} />
        </>
      ) : (
        <>
          <Route path={dashboardPageLink} element={<Navigate to="/" replace />} />
          <Route path={accountSettingsPageLink} element={<Navigate to="/" replace />} />
          <Route path={accountSetupPageLink} element={<Navigate to="/" replace />} />
        </>
      )}
      {/* Catch all route for non-existent routes */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default RouteRenderer