import React from "react";
import CommunitiesMainBody from "@app/components/communities/CommunitiesMainBody";
import Title from "@app/components/Title";

const CommunitiesPage: React.FC = () => {
  return (
    <div className="content-body">
      {/* Aesthetic Banner */}
      <div className="banner__green">
        <Title
          title="Search Communities"
          description="Find people with similar interests!"
        ></Title>
      </div>
      <CommunitiesMainBody />
    </div>
  );
};

export default CommunitiesPage;
