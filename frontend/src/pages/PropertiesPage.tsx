import React from "react";
import DisplayProperties from "../components/DisplayProperties";
import Title from "../components/Title";

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
      <DisplayProperties />
    </div>
  );
};

export default PropertiesPage;
