import React from "react";
import CreatePropertyForm from "../form/CreatePropertyForm";
import UpdatePropertyManager from "../form/UpdatePropertyManager";

const ListerDashboard: React.FC = () => {
  return (
    <>
      <div className="flex">
        <CreatePropertyForm />
        <UpdatePropertyManager />
      </div>
    </>
  );
};

export default ListerDashboard;
