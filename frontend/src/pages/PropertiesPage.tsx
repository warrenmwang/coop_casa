import React from "react";
import TopNavbar from "../components/TopNavbar";
import Footer from "../components/Footer";
import DisplayProperties from "../components/DisplayProperties";

const PropertiesPage: React.FC = () => {
  // console.log("properties page");

  return (
    <>
      <TopNavbar />
      <DisplayProperties />
      <Footer />
    </>
  );
};

export default PropertiesPage;
