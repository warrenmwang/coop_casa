import React from "react";
import { Link, useNavigate } from "react-router-dom";
import TopNavbar from "../components/TopNavbar";
import Footer from "../components/Footer";
import Title from "../components/Title";

import { AuthData } from "../auth/AuthWrapper";
import { useAPIGetUserRole } from "../api/api";
import TextSkeleton from "../skeleton/TextSkeleton";
import RegularDashboard from "../components/RegularDashboard";
import AdminDashboard from "../components/AdminDashboard";
import { accountSetupPageLink, homePageLink } from "../urls";

// Dashboard is only showed when user is authed.
const DashboardPage: React.FC = () => {
  console.log("DashboardPage");
  const loading = useAPIGetUserRole();

  const navigate = useNavigate();

  const auth = AuthData();
  const { user, authenticated, userRole } = auth;

  if (!authenticated) {
    navigate(homePageLink);
  }

  const email = user.email;
  const accountIsSetup = user.firstName !== "" && user.lastName !== "";

  return (
    <>
      <TopNavbar></TopNavbar>
      <Title
        title="Dashboard"
        description={`Welcome ${accountIsSetup ? `${user.firstName} ${user.lastName}` : email}!`}
      ></Title>
      {!accountIsSetup ? (
        <div className="my-4" style={{ textAlign: "center" }}>
          <Link
            to={accountSetupPageLink}
            className="mx-auto block bg-white border-2 p-4 shadow-lg rounded-lg w-full sm:w-2/3 lg:w-1/3 sm:p-6 lg:p-8"
          >
            Set up your account!
          </Link>
        </div>
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
