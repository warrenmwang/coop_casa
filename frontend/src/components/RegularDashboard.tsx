import React from "react";
import SearchCommunities from "../input/SearchCommunities";
import SearchProperties from "../input/SearchProperties";
import { AuthData } from "../auth/AuthWrapper";
import CreatePropertyForm from "../form/CreatePropertyForm";
import UpdatePropertyManager from "../form/UpdatePropertyManager";

const RegularDashboard: React.FC = () => {
  const auth = AuthData();
  const { userRole } = auth; // either lister or regular
  const isLister: boolean = userRole === "lister";

  return (
    <>
      {isLister && (
        <div className="flex">
          <CreatePropertyForm />
          <UpdatePropertyManager />
        </div>
      )}
      <SearchCommunities />
      <SearchProperties />
    </>
  );
};

export default RegularDashboard;
