import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Title from "../components/Title";

import TextSkeleton from "../skeleton/TextSkeleton";
import RegularDashboard from "../components/RegularDashboard";
import AdminDashboard from "../components/admin/AdminDashboard";
import { accountSetupPageLink, homePageLink } from "../urls";
import { APIUserReceived, UserDetails } from "../types/Types";

import ListerDashboard from "../components/ListerDashboard";
import { EmptyUser } from "../types/Objects";

import {
  useGetUserAccountAuth,
  useGetUserAccountDetails,
  useGetUserAccountRole,
} from "../hooks/account";

// Authenticated Endpoint
const DashboardPage: React.FC = () => {
  const navigate = useNavigate();

  const userQuery = useGetUserAccountDetails();
  const authQuery = useGetUserAccountAuth();
  const roleQuery = useGetUserAccountRole();

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

  useEffect(() => {
    if (authQuery.status === "success" && authenticated === false) {
      navigate(homePageLink);
    }
  }, [authQuery.status, authenticated]);

  const welcomeText =
    userDetails.firstName !== "" && userDetails.lastName !== ""
      ? `Welcome ${userDetails.firstName} ${userDetails.lastName}`
      : `Welcome ${userDetails.email}`;

  useEffect(() => {
    if (userQuery.status === "success") {
      if (userDetails.firstName === "" || userDetails.lastName === "") {
        navigate(accountSetupPageLink);
      }
    }
  }, [userQuery.status, userDetails]);

  return (
    <div className="content-body">
      {!ready && <TextSkeleton />}

      {ready && (
        <>
          <Title title="Dashboard" description={welcomeText}></Title>
          {userRole === "admin" ? (
            <AdminDashboard />
          ) : userRole === "lister" ? (
            <ListerDashboard />
          ) : (
            <RegularDashboard />
          )}
        </>
      )}
    </div>
  );
};

export default DashboardPage;
