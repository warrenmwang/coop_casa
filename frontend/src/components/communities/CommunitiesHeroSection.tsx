import React from "react";
import Title from "@app/components/Title";
import communityClipArt from "@app/assets/communityClipArt.png";

const CommunitiesHeroSection: React.FC = () => {
  return (
    <div className="content-body flex flex-wrap md:flex-nowrap items-center justify-between align-middle">
      <div className="flex flex-col items-center">
        <Title
          title="Communities"
          description="It takes a village to raise a child. We all need one another, and we hope you can find community here."
        />
        <img
          alt="Cartoon image of a diverse group of people smiling and enjoying each others' company"
          src={communityClipArt}
          className="mx-auto"
        />
      </div>
      <div className="w-full md:w-3/4 lg:w-1/2 bg-green-400 rounded-lg p-3 drop-shadow-xl">
        <p className="justify-normal font__paragraph_1 pretty_font_1">
          Going through any and all stages of life alone can be noble and
          fulfulling in its own right, but going through life with others,
          friends and family, can help you to achieve your goals faster and
          while having fun and building meaninful relationships that will last a
          lifetime.
        </p>
      </div>
    </div>
  );
};

export default CommunitiesHeroSection;
