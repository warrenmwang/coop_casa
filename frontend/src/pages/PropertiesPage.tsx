import React from "react";
import DisplayProperties from "../components/DisplayProperties";
import Title from "../components/Title";
import cartoonNeighborhood from "../assets/cartoonNeighborhood1.png";

const PropertiesPage: React.FC = () => {
  return (
    <div className="content-body">
      <Title
        title="Properties on Coop"
        description="Browse to find your desired property to co-own with your buddies."
      />
      <img
        alt="cartoon neighborhood decoration"
        src={cartoonNeighborhood}
        className="mx-auto rounded-lg"
      />
      <DisplayProperties />
    </div>
  );
};

export default PropertiesPage;
