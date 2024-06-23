import React from "react";
import TopNavbar from "../structure/TopNavbar";
import Footer from "../structure/Footer";
import Title from "../structure/Title";

import { AuthData } from "../../auth/AuthWrapper";
import AccountSetup from "../structure/AccountSetup";
import { useAPIGetUserRole } from "../../api/api";
import TextSkeleton from "../structure/TextSkeleton";
import RegularDashboard from "../structure/RegularDashboard";
import AdminDashboard from "../structure/AdminDashboard";

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
