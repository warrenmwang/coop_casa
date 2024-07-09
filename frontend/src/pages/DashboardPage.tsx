import React from "react";
import TopNavbar from "../components/TopNavbar";
import Footer from "../components/Footer";
import Title from "../components/Title";

import { AuthData } from "../auth/AuthWrapper";
import AccountSetup from "../components/AccountSetup";
import { useAPIGetUserRole } from "../api/api";
import TextSkeleton from "../skeleton/TextSkeleton";
import RegularDashboard from "../components/RegularDashboard";
import AdminDashboard from "../components/AdminDashboard";

// Dashboard is only showed when user is authed.
const DashboardPage: React.FC = () => {
  const auth = AuthData();
  const { user, userRole } = auth;
  const email = user.email;
  const accountIsSetup = user.firstName !== "" && user.lastName !== "";

  const loading = useAPIGetUserRole();

  return (
    <>
      <TopNavbar></TopNavbar>
      <Title
        title="Dashboard"
        description={`Welcome ${accountIsSetup ? `${user.firstName} ${user.lastName}` : email}!`}
      ></Title>
      {!accountIsSetup ? (
        <AccountSetup />
      ) : loading ? (
        <TextSkeleton />
      ) : userRole === "admin" ? (
        <AdminDashboard />
      ) : (
        <RegularDashboard />
      )}
      <Footer></Footer>
    </>
  );
};

export default DashboardPage;
