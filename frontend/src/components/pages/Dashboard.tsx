import React from "react";
import SearchCommunities from "../structure/SearchCommunities";
import SearchLocations from "../structure/SearchLocations";
import TopNavbar from "../structure/TopNavbar";
import Footer from "../structure/Footer";
import Title from "../structure/Title";

// TODO: this should pretty much replace everything in the main section of the page
// once the user logs in / creates an account.
const Dashboard: React.FC = () => {
  return (
    <div>
      <TopNavbar></TopNavbar>
      <Title title="Dashboard" description="Welcome [user]"></Title>
      <SearchCommunities></SearchCommunities>
      <SearchLocations></SearchLocations>
      <Footer></Footer>
    </div>
  )
}

export default Dashboard;