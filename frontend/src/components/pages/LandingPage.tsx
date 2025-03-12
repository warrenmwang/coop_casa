import React from "react";

import CallToAction from "@app/components/CallToAction";
import CommunitiesHeroSection from "@app/components/communities/CommunitiesHeroSection";
import HeaderSection from "@app/components/page_sections/HeaderSection";
import PropertiesHeroSection from "@app/components/properties/PropertiesHeroSection";
import UsersHeroSection from "@app/components/users/UsersHeroSection";

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 scroll-smooth overflow-x-hidden">
      <div className="snap-y snap-mandatory">
        <section className="snap-start w-full">
          <HeaderSection />
        </section>

        <section className="snap-start py-20 px-4 sm:px-6 lg:px-8 bg-white w-full">
          <CommunitiesHeroSection />
        </section>

        <section className="snap-start py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-green-50/80 to-blue-50/80 w-full">
          <PropertiesHeroSection />
        </section>

        <section className="snap-start py-20 px-4 sm:px-6 lg:px-8 bg-white w-full">
          <UsersHeroSection />
        </section>

        <section className="snap-start py-16 bg-gradient-to-b from-blue-50/80 to-green-50/80 w-full">
          <CallToAction />
        </section>
      </div>
    </div>
  );
};

export default LandingPage;
