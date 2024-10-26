import React from "react";
import Title from "@app/components/Title";
import cartoonNeighborhood from "@app/assets/cartoonNeighborhood1.png";

const PropertiesHeroSection: React.FC = () => {
  return (
    <div className="bg-gray-200 p-10">
      <div className="content-body flex flex-wrap-reverse md:flex-nowrap items-center justify-between">
        <div className="md:w-3/4 lg:w-1/2 bg-blue-400 rounded-lg p-3 drop-shadow-xl">
          <p className="justify-normal font__paragraph_1 pretty_font_1">
            Homes are not about the physical location or its structure.
            It&apos;s about the memories and shared lived experiences you have
            at that place. We hope you can find a property that will help
            facilitate finding a place that can do that for you.
          </p>
        </div>

        <div className="w-full flex flex-col items-center">
          <Title
            title="Properties"
            description="Find the perfect place to co-own and create unforgettable memories with your friends."
          />
          <img
            alt="Cartoon image of a street of different colored homes lined up next to one another on a blue sky day"
            src={cartoonNeighborhood}
            className="rounded-lg"
          />
        </div>
      </div>
    </div>
  );
};

export default PropertiesHeroSection;
