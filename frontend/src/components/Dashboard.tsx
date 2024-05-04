import React from "react";
import SearchCommunities from "./SearchCommunities";
import SearchLocations from "./SearchLocations";
import TopNavbar from "./TopNavbar";
import Footer from "./Footer";

// TODO: this should pretty much replace everything in the main section of the page
// once the user logs in / creates an account.
const Dashboard: React.FC = () => {
  return (
    <div>
      <TopNavbar></TopNavbar>
      <h1>Dashboard Page Placeholder</h1>
      <SearchCommunities></SearchCommunities>
      <SearchLocations></SearchLocations>
      <Footer></Footer>
    </div>
  )
}

export default Dashboard;