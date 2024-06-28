import React from "react";
import SearchCommunities from "./SearchCommunities";
import SearchProperties from "./SearchProperties";
import { AuthData } from "../../auth/AuthWrapper";
import CreatePropertyForm from "./CreatePropertyForm";

const RegularDashboard: React.FC = () => {
  const auth = AuthData();
  const { userRole } = auth; // either lister or regular
  const isLister: boolean = userRole === "lister";

  return (
    <>
      {isLister && <CreatePropertyForm />}
      <SearchCommunities />
      <SearchProperties />
    </>
  );
};

export default RegularDashboard;
