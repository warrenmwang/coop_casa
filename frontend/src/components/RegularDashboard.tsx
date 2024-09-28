import * as React from "react";

import Title from "./Title";
import AllLikedEntitiesSection from "./AllLikedEntitiesSection";

const RegularDashboard: React.FC = () => {
  return (
    <>
      <Title
        title="Your Liked Collections"
        description="If you're not seeing anything, go browse the users, properties, and communities that exist on Coop now!"
      />
      <AllLikedEntitiesSection />
    </>
  );
};

export default RegularDashboard;
