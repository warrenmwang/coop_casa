import React from "react";

import Title from "@app/components/Title";
import PropertiesMainBody from "@app/components/properties/PropertiesMainBody";

const PropertiesPage: React.FC = () => {
  return (
    <div className="content-body">
      {/* Aesthetic Banner */}
      <div className="banner__blue">
        <Title
          title="Search Properties"
          description="You can use optional filters to narrow down your search here."
        />
      </div>
      <PropertiesMainBody />
    </div>
  );
};

export default PropertiesPage;
