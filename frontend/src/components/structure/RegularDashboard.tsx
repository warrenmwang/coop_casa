import React, { useState } from "react";
import SearchCommunities from "./SearchCommunities";
import SearchProperties from "./SearchProperties";
import { AuthData } from "../../auth/AuthWrapper";

const RegularDashboard: React.FC = () => {
  const auth = AuthData();
  const { userRole } = auth; // either lister or regular

  const [page, setPage] = useState<number>(0);

  const limit = 9;

  return(
    <>
      <SearchCommunities/>
      <SearchProperties/>
    </>
  );
};

export default RegularDashboard;