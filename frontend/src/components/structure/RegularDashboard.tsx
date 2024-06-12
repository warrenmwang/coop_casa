import React from "react";
import SearchCommunities from "./SearchCommunities";
import SearchProperties from "./SearchProperties";

const RegularDashboard: React.FC = () => {
  return(
    <>
      <SearchCommunities/>
      <SearchProperties/>
    </>
  );
};

export default RegularDashboard;