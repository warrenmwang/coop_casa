import React from "react";
import HeaderSection from "../components/HeaderSection";
import CommunitiesHeroSection from "../components/CommunitiesHeroSection";
import "../styles/contentBody.css";
import PropertiesHeroSection from "../components/PropertiesHeroSection";
import UsersHeroSection from "../components/UsersHeroSection";

const LandingPage: React.FC = () => {
  return (
    <>
      <HeaderSection />
      <div className="content-body">
        <CommunitiesHeroSection />
        <PropertiesHeroSection />
        <UsersHeroSection />
      </div>
    </>
  );
};

export default LandingPage;
