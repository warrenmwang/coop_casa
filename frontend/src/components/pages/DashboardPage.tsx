import React from "react";
import SearchCommunities from "../structure/SearchCommunities";
import SearchLocations from "../structure/SearchLocations";
import TopNavbar from "../structure/TopNavbar";
import Footer from "../structure/Footer";
import Title from "../structure/Title";

import { AuthData } from '../../auth/AuthWrapper'
import AccountSetup from "../structure/AccountSetup";

// Dashboard is only showed when user is authed.
const DashboardPage: React.FC = () => {

  const auth = AuthData();
  const { user, accountIsSetup } = auth;

  const email = user.email;
 
  return (
    <div>
      <TopNavbar></TopNavbar>
      <Title title="Dashboard" description={`Welcome ${email}`}></Title>
      {!accountIsSetup && <AccountSetup />}
      <SearchCommunities></SearchCommunities>
      <SearchLocations></SearchLocations>
      <Footer></Footer>
    </div>
  )
}

export default DashboardPage;