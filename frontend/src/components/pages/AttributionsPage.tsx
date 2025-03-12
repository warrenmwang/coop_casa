import React from "react";

import Title from "@app/components/Title";

const AttributionsPage: React.FC = () => {
  return (
    <div className="content-body">
      <Title
        title="Attributions"
        description="For usage of third party services or data the require public attribution of their usage on our website, we give them their due credit here."
      ></Title>

      <div>
        For city and state location data we used the{" "}
        <b>
          <a href="https://simplemaps.com/data/us-cities">
            United States Cities Database
          </a>
        </b>{" "}
        from simplemaps.
      </div>
    </div>
  );
};

export default AttributionsPage;
