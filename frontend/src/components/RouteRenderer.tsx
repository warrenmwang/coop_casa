import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import AboutPage from "./pages/AboutPage";
import DashboardPage from "./pages/DashboardPage";
import ContactPage from "./pages/ContactPage";
import CommunitiesPage from "./pages/CommunitiesPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import TermsOfServicePage from "./pages/TermsOfServicePage";

import AccountSettingsPage from "./pages/AccountSettingsPage";
import AccountSetupPage from "./pages/AccountSetupPage";
import PropertiesPage from "./pages/PropertiesPage";
import PropertyDetailPage from "./pages/PropertyDetailPage";
import AttributionsPage from "./pages/AttributionsPage";
import {
  aboutPageLink,
  attributionsPageLink,
  communitiesPageLink,
  contactPageLink,
  homePageLink,
  privacypolicyPageLink,
  propertiesPageLink,
  termsOfServicePageLink,
  dashboardPageLink,
  accountSettingsPageLink,
  accountSetupPageLink,
  usersPageLink,
} from "urls";
import CommunityDetailPage from "./pages/CommunityDetailPage";
import UsersPage from "./pages/UsersPage";
import UserProfilePage from "./pages/UserProfilePage";

const RouteRenderer: React.FC = () => {
  return (
    <Routes>
      <Route path={homePageLink} element={<LandingPage />} />
      <Route path={usersPageLink} element={<UsersPage />} />
      <Route path={communitiesPageLink} element={<CommunitiesPage />} />
      <Route path={propertiesPageLink} element={<PropertiesPage />} />
      <Route
        path={`${propertiesPageLink}/:propertyID`}
        element={<PropertyDetailPage />}
      />
      <Route
        path={`${communitiesPageLink}/:communityID`}
        element={<CommunityDetailPage />}
      />
      <Route path={`${usersPageLink}/:userID`} element={<UserProfilePage />} />
      <Route path={aboutPageLink} element={<AboutPage />} />
      <Route path={privacypolicyPageLink} element={<PrivacyPolicyPage />} />
      <Route path={termsOfServicePageLink} element={<TermsOfServicePage />} />
      <Route path={attributionsPageLink} element={<AttributionsPage />} />
      <Route path={contactPageLink} element={<ContactPage />} />
      {/* Authed routes */}
      <Route path={dashboardPageLink} element={<DashboardPage />} />
      <Route path={accountSettingsPageLink} element={<AccountSettingsPage />} />
      <Route path={accountSetupPageLink} element={<AccountSetupPage />} />
      {/* Catch all route for non-existent routes */}
      <Route path="*" element={<Navigate to={homePageLink} replace />} />
    </Routes>
  );
};

export default RouteRenderer;
