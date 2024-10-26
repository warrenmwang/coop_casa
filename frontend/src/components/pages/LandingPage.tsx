import React from "react";
import HeaderSection from "@app/components/page_sections/HeaderSection";
import CommunitiesHeroSection from "@app/components/communities/CommunitiesHeroSection";
import PropertiesHeroSection from "@app/components/properties/PropertiesHeroSection";
import UsersHeroSection from "@app/components/users/UsersHeroSection";
import CallToAction from "@app/components/CallToAction";

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
