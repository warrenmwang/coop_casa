import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import AboutPage from "@app/components/pages/AboutPage";
import AccountSettingsPage from "@app/components/pages/AccountSettingsPage";
import AccountSetupPage from "@app/components/pages/AccountSetupPage";
import AttributionsPage from "@app/components/pages/AttributionsPage";
import CommunitiesPage from "@app/components/pages/CommunitiesPage";
import CommunityDetailPage from "@app/components/pages/CommunityDetailPage";
import ContactPage from "@app/components/pages/ContactPage";
import DashboardPage from "@app/components/pages/DashboardPage";
import LandingPage from "@app/components/pages/LandingPage";
import PrivacyPolicyPage from "@app/components/pages/PrivacyPolicyPage";
import PropertiesPage from "@app/components/pages/PropertiesPage";
import PropertyDetailPage from "@app/components/pages/PropertyDetailPage";
import TermsOfServicePage from "@app/components/pages/TermsOfServicePage";
import UserProfilePage from "@app/components/pages/UserProfilePage";
import UsersPage from "@app/components/pages/UsersPage";
import {
  aboutPageLink,
  accountSettingsPageLink,
  accountSetupPageLink,
  attributionsPageLink,
  communitiesPageLink,
  contactPageLink,
  dashboardPageLink,
  homePageLink,
  privacypolicyPageLink,
  propertiesPageLink,
  termsOfServicePageLink,
  usersPageLink,
} from "@app/urls";

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
