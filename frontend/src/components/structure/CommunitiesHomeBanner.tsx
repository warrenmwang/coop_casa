import React from "react";
import Title from "./Title";

const CommunitiesHomeBanner: React.FC = () => {
  return (
    <div>
      <Title
        title="Join or Create Your Own Group Today"
        description="Together we are stronger than we could ever be alone."
      />
      <p className="mx-auto block" style={{ textAlign: "center" }}>
        TODO: fill in with some content of communities. graphics and text
      </p>
    </div>
  );
};

export default CommunitiesHomeBanner;
