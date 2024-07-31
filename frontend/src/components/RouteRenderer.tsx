import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import HomePage from "../pages/HomePage";
import AboutPage from "../pages/AboutPage";
import DashboardPage from "../pages/DashboardPage";
import ContactPage from "../pages/ContactPage";
import CommunitiesPage from "../pages/CommunitiesPage";
import MapPage from "../pages/MapPage";
import PrivacyPolicyPage from "../pages/PrivacyPolicyPage";
import TermsOfServicePage from "../pages/TermsOfServicePage";

import AccountSettingsPage from "../pages/AccountSettingsPage";
import AccountSetupPage from "../pages/AccountSetupPage";
import PropertiesPage from "../pages/PropertiesPage";
import PropertyDetail from "../pages/PropertyDetail";
import AttributionsPage from "../pages/AttributionsPage";
import {
  aboutPageLink,
  attributionsPageLink,
  communitiesPageLink,
  contactPageLink,
  homePageLink,
  mapPageLink,
  privacypolicyPageLink,
  propertiesPageLink,
  termsOfServicePageLink,
  dashboardPageLink,
  accountSettingsPageLink,
  accountSetupPageLink,
} from "../urls";

const RouteRenderer: React.FC = () => {
  // console.log("RouteRenderer");

  return (
    <Routes>
      <Route path={homePageLink} element={<HomePage />} />
      <Route path={communitiesPageLink} element={<CommunitiesPage />} />
      <Route path={propertiesPageLink} element={<PropertiesPage />} />
      <Route
        path={`${propertiesPageLink}/:propertyID`}
        element={<PropertyDetail />}
      />
      <Route path={mapPageLink} element={<MapPage />} />
      <Route path={aboutPageLink} element={<AboutPage />} />
      <Route path={privacypolicyPageLink} element={<PrivacyPolicyPage />} />
      <Route path={termsOfServicePageLink} element={<TermsOfServicePage />} />
      <Route path={attributionsPageLink} element={<AttributionsPage />} />
      <Route path={contactPageLink} element={<ContactPage />} />
      {/* authed routes */}
      <Route path={dashboardPageLink} element={<DashboardPage />} />
      <Route path={accountSettingsPageLink} element={<AccountSettingsPage />} />
      <Route path={accountSetupPageLink} element={<AccountSetupPage />} />
      {/* Catch all route for non-existent routes */}
      <Route path="*" element={<Navigate to={homePageLink} replace />} />
    </Routes>
  );
};

export default RouteRenderer;
