import React from "react";
import { AuthData } from "../auth/AuthWrapper";
import CreatePropertyForm from "../form/CreatePropertyForm";
import UpdatePropertyManager from "../form/UpdatePropertyManager";
import { useNavigate } from "react-router-dom";
import { communitiesPageLink, propertiesPageLink } from "../urls";
import "../styles/font.css";

const RegularDashboard: React.FC = () => {
  const auth = AuthData();
  const { userRole } = auth; // either lister or regular
  const isLister: boolean = userRole === "lister";

  const navigate = useNavigate();

  return (
    <>
      {isLister && (
        <div className="flex">
          <CreatePropertyForm />
          <UpdatePropertyManager />
        </div>
      )}
      <div className="flex flex-col items-center mt-5">
        <h2 className="h1_custom">Select Option: </h2>
        <div className="flex justify-center gap-2">
          <button
            onClick={() => navigate(propertiesPageLink)}
            className="bg-blue-500 hover:bg-blue-600 p-3 rounded-md m-3"
          >
            Properties
          </button>
          <button
            onClick={() => navigate(communitiesPageLink)}
            className="bg-green-500 hover:bg-green-600 p-3 rounded-md m-3"
          >
            Communities
          </button>
        </div>
      </div>
    </>
  );
};

export default RegularDashboard;
