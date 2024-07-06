import React, { useState } from "react";
import TopNavbar from "../structure/TopNavbar";
import Title from "../structure/Title";
import Footer from "../structure/Footer";
import DisplayProperties from "../structure/DisplayProperties";

import "../../styles/ContentBody.css";
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
