import React from "react";
import { Link, useNavigate } from "react-router-dom";
import Title from "../components/Title";

import TextSkeleton from "../skeleton/TextSkeleton";
import RegularDashboard from "../components/RegularDashboard";
import AdminDashboard from "../components/AdminDashboard";
import { accountSetupPageLink, homePageLink } from "../urls";
import { APIUserReceived, UserDetails } from "../types/Types";

import { useQuery } from "@tanstack/react-query";
import { apiGetUser, apiGetUserAuth, apiGetUserRole } from "../api/account";
import ListerDashboard from "../components/ListerDashboard";
import { EmptyUser } from "../types/Objects";

import "../styles/contentBody.css";

// Authenticated Endpoint
const DashboardPage: React.FC = () => {
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

  if (!authenticated) {
    navigate(homePageLink);
  }

  let userRole: string = "";
  if (roleQuery.status === "success") {
    userRole = roleQuery.data as string;
  }

  const ready: boolean =
    userQuery.isFetched && authQuery.isFetched && roleQuery.isFetched;

  if (!ready) {
    return <TextSkeleton />;
  }

  const welcomeText =
    userDetails.firstName !== "" && userDetails.lastName !== ""
      ? `Welcome ${userDetails.firstName} ${userDetails.lastName}`
      : `Welcome ${userDetails.email}`;

  const isAccountNotSetup =
    userDetails.firstName === "" && userDetails.lastName === "";

  return (
    <div className="content-body">
      <Title title="Dashboard" description={welcomeText}></Title>
      {isAccountNotSetup ? (
        <div className="my-4 text-center">
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
    </div>
  );
};

export default DashboardPage;
