import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import LandingPage from "@app/components/pages/LandingPage";
import AboutPage from "@app/components/pages/AboutPage";
import DashboardPage from "@app/components/pages/DashboardPage";
import ContactPage from "@app/components/pages/ContactPage";
import CommunitiesPage from "@app/components/pages/CommunitiesPage";
import PrivacyPolicyPage from "@app/components/pages/PrivacyPolicyPage";
import TermsOfServicePage from "@app/components/pages/TermsOfServicePage";

import AccountSettingsPage from "@app/components/pages/AccountSettingsPage";
import AccountSetupPage from "@app/components/pages/AccountSetupPage";
import PropertiesPage from "@app/components/pages/PropertiesPage";
import PropertyDetailPage from "@app/components/pages/PropertyDetailPage";
import AttributionsPage from "@app/components/pages/AttributionsPage";
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
} from "@app/urls";
import CommunityDetailPage from "@app/components/pages/CommunityDetailPage";
import UsersPage from "@app/components/pages/UsersPage";
import UserProfilePage from "@app/components/pages/UserProfilePage";

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
