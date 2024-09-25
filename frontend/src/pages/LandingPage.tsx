import React from "react";
import HeaderSection from "../components/page_sections/HeaderSection";
import CommunitiesHeroSection from "../components/communities/CommunitiesHeroSection";
import PropertiesHeroSection from "../components/properties/PropertiesHeroSection";
import UsersHeroSection from "../components/users/UsersHeroSection";

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
