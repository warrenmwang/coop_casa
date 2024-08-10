import React from "react";
import TopNavbar from "../components/TopNavbar";
import Footer from "../components/Footer";
import DisplayProperties from "../components/DisplayProperties";
import Title from "../components/Title";
import cartoonNeighborhood from "../assets/cartoonNeighborhood1.png";

const PropertiesPage: React.FC = () => {
  return (
    <>
      <TopNavbar />
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
      <Footer />
    </>
  );
};

export default PropertiesPage;
