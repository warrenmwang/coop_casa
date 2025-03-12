import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import ListerDashboard from "@app/components/ListerDashboard";
import RegularDashboard from "@app/components/RegularDashboard";
import Title from "@app/components/Title";
import AdminDashboard from "@app/components/admin/AdminDashboard";
import TextSkeleton from "@app/components/skeleton/TextSkeleton";
import {
  useGetUserAccountAuth,
  useGetUserAccountDetails,
  useGetUserAccountRole,
} from "@app/hooks/account";
import { EmptyUser } from "@app/types/Objects";
import { APIUserReceived, UserDetails } from "@app/types/Types";
import { accountSetupPageLink, homePageLink } from "@app/urls";

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
      ? `Welcome ${userDetails.firstName} ${userDetails.lastName} to Coop Homes!`
      : `Please setup your account, you should be redirected to the setup page shortly upon seeing this.`;

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
