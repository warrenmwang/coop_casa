import React from "react";
import TopNavbar from "../components/TopNavbar";
import Title from "../components/Title";
import Footer from "../components/Footer";
import DisplayProperties from "../components/DisplayProperties";

import "../styles/ContentBody.css";
const PropertiesPage: React.FC = () => {
  return (
    <div>
      <TopNavbar />

      <div className="content-body">
        <Title
          title="Properties on Coop"
          description="Browse to find your desired property to co-own with your buddies."
        />
        <DisplayProperties />
      </div>

      <Footer />
    </div>
  );
};

export default PropertiesPage;
