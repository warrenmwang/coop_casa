import React from "react";
import Title from "../Title";

const PropertiesHomeBanner: React.FC = () => {
  return (
    <div>
      <Title
        title="Many Places to Choose From!"
        description="Limited to the USA."
      />
      <p className="mx-auto block" style={{ textAlign: "center" }}>
        TODO: fill in with some content of locations / properties
      </p>
    </div>
  );
};

export default PropertiesHomeBanner;
