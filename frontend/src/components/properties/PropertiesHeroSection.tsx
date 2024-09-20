import React from "react";
import Title from "../Title";
import cartoonNeighborhood from "../../assets/cartoonNeighborhood1.png";

const PropertiesHeroSection: React.FC = () => {
  return (
    <>
      <Title
        title="Properties on Coop"
        description="Browse to find your desired property to co-own with your buddies."
      />
      <img
        alt="Cartoon image of a street of different colored homes lined up next to one another on a blue sky day"
        src={cartoonNeighborhood}
        className="mx-auto rounded-lg"
      />
      <p className="text-center justify-normal">
        Find your next homes to coop in!
      </p>
    </>
  );
};

export default PropertiesHeroSection;
