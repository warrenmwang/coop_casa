import React from "react";
import SearchCommunities from "./SearchCommunities";
import SearchLocations from "./SearchLocations";
import TopNavbar from "./TopNavbar";
import Footer from "./Footer";
import Title from "./Title";

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