import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import TopNavbar from "../components/TopNavbar";
import Footer from "../components/Footer";
import Title from "../components/Title";

import { AuthData, EmptyUser } from "../auth/AuthWrapper";
import TextSkeleton from "../skeleton/TextSkeleton";
import RegularDashboard from "../components/RegularDashboard";
import AdminDashboard from "../components/AdminDashboard";
import { accountSetupPageLink, homePageLink } from "../urls";
import { APIUserReceived, UserDetails } from "../types/Types";

import { useQuery } from "@tanstack/react-query";
import { apiGetUser, apiGetUserAuth, apiGetUserRole } from "../api/api";
import ListerDashboard from "../components/ListerDashboard";

// Authenticated Endpoint
const DashboardPage: React.FC = () => {
  console.log("DashboardPage");
  const navigate = useNavigate();

  const userQuery = useQuery({
    queryKey: ["user", "details"],
    queryFn: apiGetUser,
  });

  const authQuery = useQuery({
    queryKey: ["user", "auth"],
    queryFn: apiGetUserAuth,
  });

  const roleQuery = useQuery({
    queryKey: ["user", "role"],
    queryFn: apiGetUserRole,
  });

  let userDetails: UserDetails = EmptyUser;
  if (userQuery.status === "success") {
    let user: APIUserReceived | undefined = userQuery.data;
    if (user !== undefined) {
      user = user as APIUserReceived;
      userDetails = user.userDetails;
    }
  }

  let authenticated: boolean = false;
  if (authQuery.status === "success") {
    authenticated = authQuery.data as boolean;
  }

  let userRole: string = "";
  if (roleQuery.status === "success") {
    userRole = roleQuery.data as string;
  }

  const ready: boolean =
    userQuery.isFetched && authQuery.isFetched && roleQuery.isFetched;

  React.useEffect(() => {
    if (authQuery.isFetched) {
      if (!authenticated) {
        navigate(homePageLink);
      }
    }
  }, [authQuery]);

  return (
    <>
      <TopNavbar></TopNavbar>
      {ready ? (
        <>
          <Title
            title="Dashboard"
            description={`Welcome ${userDetails.firstName !== "" && userDetails.lastName !== "" ? `${userDetails.firstName} ${userDetails.lastName}` : userDetails.email}!`}
          ></Title>
          {userDetails.firstName === "" && userDetails.lastName === "" ? (
            <div className="my-4" style={{ textAlign: "center" }}>
              <Link
                to={accountSetupPageLink}
                className="mx-auto block bg-white border-2 p-4 shadow-lg rounded-lg w-full sm:w-2/3 lg:w-1/3 sm:p-6 lg:p-8"
              >
                Set up your account!
              </Link>
            </div>
          ) : userRole === "admin" ? (
            <AdminDashboard />
          ) : userRole === "lister" ? (
            <ListerDashboard />
          ) : (
            <RegularDashboard />
          )}
        </>
      ) : (
        <TextSkeleton />
      )}
      <Footer></Footer>
    </>
  );
};

export default DashboardPage;
