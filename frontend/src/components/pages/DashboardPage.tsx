import React, { useEffect, useState } from "react";
import SearchCommunities from "../structure/SearchCommunities";
import SearchProperties from "../structure/SearchProperties";
import TopNavbar from "../structure/TopNavbar";
import Footer from "../structure/Footer";
import Title from "../structure/Title";

import { AuthData } from '../../auth/AuthWrapper'
import AccountSetup from "../structure/AccountSetup";

// Dashboard is only showed when user is authed.
const DashboardPage: React.FC = () => {

  const auth = AuthData();
  const { user } = auth;
  const email = user.email;
  const accountIsSetup = (user.firstName !== "" && user.lastName !== "");
 
  return (
    <div>
      <TopNavbar></TopNavbar>
      <Title title="Dashboard" description={`Welcome ${accountIsSetup ? `${user.firstName} ${user.lastName}`  : email}`}></Title>
      {!accountIsSetup && <AccountSetup />}
      { accountIsSetup && (
        <>
          <SearchCommunities/>
          <SearchProperties/>
        </>
      ) }
      <Footer></Footer>
    </div>
  )
}

export default DashboardPage;