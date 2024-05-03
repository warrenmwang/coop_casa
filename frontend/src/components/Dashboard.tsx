import React from "react";
import SearchCommunities from "./SearchCommunities";
import SearchLocations from "./SearchLocations";

// TODO: this should pretty much replace everything in the main section of the page
// once the user logs in / creates an account.
const Dashboard: React.FC = () => {
  return (
    <div>
      <h1>Dashboard Page Placeholder</h1>
      <SearchCommunities></SearchCommunities>
      <SearchLocations></SearchLocations>
    </div>
  )
}

export default Dashboard;