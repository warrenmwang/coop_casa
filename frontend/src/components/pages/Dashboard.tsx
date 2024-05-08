import React, { useEffect } from "react";
import SearchCommunities from "../structure/SearchCommunities";
import SearchLocations from "../structure/SearchLocations";
import TopNavbar from "../structure/TopNavbar";
import Footer from "../structure/Footer";
import Title from "../structure/Title";

import { AuthData } from '../../auth/AuthWrapper'

const Dashboard: React.FC = () => {

  const auth = AuthData();
  const { user } = auth;

  const email = user.email
  
  return (
    <div>
      <TopNavbar></TopNavbar>
      <Title title="Dashboard" description={`Welcome ${email}`}></Title>
      <SearchCommunities></SearchCommunities>
      <SearchLocations></SearchLocations>
      <Footer></Footer>
    </div>
  )
}

export default Dashboard;