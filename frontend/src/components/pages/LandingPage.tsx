import React from "react";
import HeaderSection from "components/page_sections/HeaderSection";
import CommunitiesHeroSection from "components/communities/CommunitiesHeroSection";
import PropertiesHeroSection from "components/properties/PropertiesHeroSection";
import UsersHeroSection from "components/users/UsersHeroSection";
import CallToAction from "components/CallToAction";

const LandingPage: React.FC = () => {
  return (
    <>
      <HeaderSection />
      <CommunitiesHeroSection />
      <PropertiesHeroSection />
      <UsersHeroSection />
      <CallToAction />
    </>
  );
};

export default LandingPage;
