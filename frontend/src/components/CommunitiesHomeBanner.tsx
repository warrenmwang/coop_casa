import React from "react";
import Title from "./Title";
import communityClipArt from "../assets/communityClipArt.png";

const CommunitiesHomeBanner: React.FC = () => {
  return (
    <>
      <Title
        title="Join or Create Your Own Group Today"
        description="Together we are stronger than we could ever be alone."
      />
      <img
        alt="community clip art"
        src={communityClipArt}
        className="mx-auto"
      />
      <p className="justify-normal">
        Going through any and all stages of life alone can be noble and
        fulfulling in its own right, but going through life with others, friends
        and family, can help you to achieve your goals faster and while having
        fun and building meaninful relationships that will last a lifetime.
      </p>
    </>
  );
};

export default CommunitiesHomeBanner;
